import * as React from 'react';
import { useNavigate } from 'react-router';
import { DotLoading } from 'antd-mobile';
import { Clock, Star } from 'lucide-react';
import { useRecentMealLogs, useVenues } from '@/api/diary';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/api/diary/types';
import type { MealType } from '@/api/diary/types';
import { MealLogCard } from '@/components/diary/meal-log-card';
import { EmptyState, SectionHeader } from '@/components/shared';
import { VenueStatusBadge } from '@/components/diary/venue-status-badge';

const MEAL_TYPES: MealType[] = ['delivery', 'dine_in', 'ready_made'];

export const DiaryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: recentLogs, isLoading: logsLoading } = useRecentMealLogs(5);
  const { data: venues } = useVenues();

  const favoriteVenues = venues?.filter((v) => v.status === 'favorite') ?? [];
  const suggestedVenues = React.useMemo(() => {
    if (!venues || !recentLogs) return [];

    const recentVenueIds = new Set(recentLogs.map((log) => log.venueId).filter(Boolean));

    return venues
      .filter((venue) => !recentVenueIds.has(venue.id) && venue.status !== 'blacklisted')
      .slice(0, 3);
  }, [recentLogs, venues]);

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Quick Log Buttons */}
      <section>
        <SectionHeader title="Quick Log" />
        <div className="grid grid-cols-3 gap-3 mt-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => navigate(`/diary/log?type=${type}`)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary border border-border/50 active:bg-muted transition-colors"
            >
              <span className="text-2xl">{MEAL_TYPE_ICONS[type]}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {MEAL_TYPE_LABELS[type]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Meals */}
      <section>
        <SectionHeader
          title="Recent Meals"
          action={
            <button
              type="button"
              onClick={() => navigate('/diary/history')}
              className="text-sm text-primary font-medium"
            >
              History
            </button>
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
          ) : recentLogs && recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <MealLogCard
                key={log.id}
                log={log}
                onClick={() => navigate(`/diary/history?mealLogId=${log.id}`)}
              />
            ))
          ) : (
            <EmptyState
              icon={<Clock size={32} className="opacity-50" />}
              title="No meals logged yet"
              description="Tap a quick log button above to add your first meal."
            />
          )}
        </div>
      </section>

      {/* Favorite Venues */}
      {favoriteVenues.length > 0 && (
        <section>
          <SectionHeader title="Favorite Venues" />
          <div className="flex flex-col gap-2 mt-2">
            {favoriteVenues.map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => navigate(`/diary/venue/${venue.id}`)}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border/50 text-left active:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center size-10 rounded-lg bg-amber-500/10">
                  <Star size={20} className="text-amber-500 fill-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{venue.name}</p>
                  {venue.address && (
                    <p className="text-xs text-muted-foreground truncate">{venue.address}</p>
                  )}
                </div>
                <VenueStatusBadge status={venue.status} />
              </button>
            ))}
          </div>
        </section>
      )}

      {suggestedVenues.length > 0 && (
        <section>
          <SectionHeader title="Try Again Soon" />
          <div className="flex flex-col gap-2 mt-2">
            {suggestedVenues.map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => navigate(`/diary/log?venue=${venue.id}`)}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary px-4 py-3 text-left active:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{venue.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Quick log another meal from this venue
                  </p>
                </div>
                <VenueStatusBadge status={venue.status} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
