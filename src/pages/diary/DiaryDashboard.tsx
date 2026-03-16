import * as React from 'react';
import { useNavigate } from 'react-router';
import { DotLoading } from 'antd-mobile';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useMealLogs } from '@/api/diary';
import { cn } from '@/lib/utils';
import type { MealLog } from '@/api/diary/types';
import { MealLogCard } from '@/components/diary/meal-log-card';
import { EmptyState, SectionHeader } from '@/components/shared';

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getMonthStart = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const buildCalendarCells = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);

  // Monday-first index (0 = T2, 6 = CN)
  const leadingDays = (firstDayOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - leadingDays);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

const getSelectedDateLabel = (dateKey: string): string => {
  const selectedDate = fromDateKey(dateKey);
  const today = new Date();
  const todayKey = toDateKey(today);

  if (dateKey === todayKey) {
    return 'Hôm nay';
  }

  return selectedDate.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
};

const getLogsByDate = (logs: MealLog[]): Map<string, MealLog[]> => {
  const grouped = new Map<string, MealLog[]>();

  for (const log of logs) {
    const dateKey = toDateKey(new Date(log.loggedAt));
    const existing = grouped.get(dateKey);

    if (existing) {
      existing.push(log);
    } else {
      grouped.set(dateKey, [log]);
    }
  }

  for (const dayLogs of grouped.values()) {
    dayLogs.sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  }

  return grouped;
};

export const DiaryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const today = React.useMemo(() => new Date(), []);
  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => getMonthStart(today));
  const [selectedDateKey, setSelectedDateKey] = React.useState<string>(() => toDateKey(today));
  const hasResolvedInitialSelection = React.useRef(false);
  const { data: mealLogs, isLoading: logsLoading } = useMealLogs();

  const logsByDate = React.useMemo(() => getLogsByDate(mealLogs ?? []), [mealLogs]);

  React.useEffect(() => {
    if (!mealLogs || hasResolvedInitialSelection.current) {
      return;
    }

    hasResolvedInitialSelection.current = true;

    if (mealLogs.length === 0) {
      return;
    }

    if (logsByDate.has(selectedDateKey)) {
      return;
    }

    const latestDateKey = [...logsByDate.keys()].sort((a, b) => b.localeCompare(a))[0];
    if (!latestDateKey) {
      return;
    }

    setSelectedDateKey(latestDateKey);
    setDisplayMonth(getMonthStart(fromDateKey(latestDateKey)));
  }, [logsByDate, mealLogs, selectedDateKey]);

  const calendarCells = React.useMemo(() => buildCalendarCells(displayMonth), [displayMonth]);

  const selectedDateLogs = logsByDate.get(selectedDateKey) ?? [];

  const selectedDateLabel = React.useMemo(
    () => getSelectedDateLabel(selectedDateKey),
    [selectedDateKey],
  );

  const monthLabel = React.useMemo(
    () =>
      displayMonth.toLocaleDateString('vi-VN', {
        month: 'long',
        year: 'numeric',
      }),
    [displayMonth],
  );

  return (
    <div className="flex flex-col gap-4 py-2">
      <section className="rounded-2xl border border-border/60 bg-secondary/40 p-3">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="Tháng trước"
            onClick={() =>
              setDisplayMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 transition-colors active:bg-muted"
          >
            <ChevronLeft size={18} />
          </button>

          <p className="text-sm font-semibold text-foreground capitalize">{monthLabel}</p>

          <button
            type="button"
            aria-label="Tháng sau"
            onClick={() =>
              setDisplayMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 transition-colors active:bg-muted"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((weekday) => (
            <div key={weekday} className="py-1 text-center text-[11px] font-medium text-muted-foreground">
              {weekday}
            </div>
          ))}

          {calendarCells.map((cell) => {
            const isSelected = cell.dateKey === selectedDateKey;
            const hasLogs = logsByDate.has(cell.dateKey);

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => {
                  setSelectedDateKey(cell.dateKey);
                  if (!cell.isCurrentMonth) {
                    setDisplayMonth(getMonthStart(cell.date));
                  }
                }}
                className={cn(
                  'relative flex h-10 items-center justify-center rounded-xl border text-sm transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/15 text-foreground'
                    : 'border-transparent bg-background/60 active:bg-muted',
                  !cell.isCurrentMonth && 'text-muted-foreground/50',
                )}
              >
                <span className="leading-none">{cell.date.getDate()}</span>
                {hasLogs && (
                  <span
                    className={cn(
                      'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                      isSelected ? 'bg-primary' : 'bg-primary/80',
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader
          title={`Nhật ký • ${selectedDateLabel}`}
          action={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/diary/history')}
                className="text-sm font-medium text-muted-foreground"
              >
                Lịch sử
              </button>
              <button
                type="button"
                onClick={() => navigate('/diary/log')}
                className="text-sm font-medium text-primary"
              >
                Ghi mới
              </button>
            </div>
          }
        />
        <div className="flex flex-col gap-2 mt-2">
          {logsLoading ? (
            <div className="flex flex-col gap-3 py-2">
              {Array.from({ length: 2 }, (_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-border/40 bg-secondary/60 p-4"
                >
                  <div className="mb-3 h-4 w-24 rounded bg-muted/60" />
                  <div className="mb-2 h-5 w-36 rounded bg-muted/60" />
                  <div className="h-3 w-28 rounded bg-muted/60" />
                </div>
              ))}
              <div className="flex justify-center pt-2">
                <DotLoading color="primary" />
              </div>
            </div>
          ) : selectedDateLogs.length > 0 ? (
            selectedDateLogs.map((log) => (
              <MealLogCard
                key={log.id}
                log={log}
                onClick={() => navigate(`/diary/history?mealLogId=${log.id}`)}
              />
            ))
          ) : (
            <EmptyState
              icon={<Clock size={32} className="opacity-50" />}
              title="Chưa có log cho ngày này"
              description="Hãy ghi nhanh bữa ăn để theo dõi lại sau."
            />
          )}
        </div>
      </section>
    </div>
  );
};
