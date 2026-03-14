import * as React from 'react';
import { DotLoading } from 'antd-mobile';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useMealLogs } from '@/api/diary';
import { groupLogsByDate, getDateGroupLabel, formatCost } from '@/api/diary/types';
import type { MealType } from '@/api/diary/types';
import { useDiaryStore } from '@/store';
import { MealLogCard } from '@/components/diary/meal-log-card';
import { FilterChips } from '@/components/shared';
import { SectionHeader } from '@/components/shared';

const mealTypeFilters = [
  { id: 'all', label: 'All' },
  { id: 'delivery', label: '🛵 Delivery' },
  { id: 'dine_in', label: '🍽️ Dine-in' },
  { id: 'ready_made', label: '🏪 Ready-made' },
];

export const MealHistoryPage: React.FC = () => {
  const { data: allLogs, isLoading } = useMealLogs();
  const { filters, setSearch, setMealType, setSort } = useDiaryStore();

  // Filter
  const filteredLogs = React.useMemo(() => {
    if (!allLogs) return [];
    let result = [...allLogs];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.venue?.name.toLowerCase().includes(q) ||
          l.notes?.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Meal type
    if (filters.mealType !== 'all') {
      result = result.filter((l) => l.mealType === filters.mealType);
    }

    // Sort
    if (filters.sort === 'cost') {
      result.sort((a, b) => b.totalCost - a.totalCost);
    } else if (filters.sort === 'rating') {
      result.sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0));
    }
    // 'recent' is default from API (already sorted by logged_at DESC)

    return result;
  }, [allLogs, filters]);

  const grouped = groupLogsByDate(filteredLogs);
  const sortedDateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Total spending
  const totalSpending = filteredLogs.reduce((sum, l) => sum + l.totalCost, 0);

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center rounded-xl h-10 bg-secondary border border-border/50 px-3 gap-2">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meals..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <FilterChips
        chips={mealTypeFilters}
        activeId={filters.mealType}
        onChipClick={(id) => setMealType(id as 'all' | MealType)}
      />

      {/* Sort */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <SlidersHorizontal size={14} />
        {(['recent', 'cost', 'rating'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            className={filters.sort === s ? 'text-primary font-bold' : ''}
          >
            {s === 'recent' ? 'Recent' : s === 'cost' ? 'Cost' : 'Rating'}
          </button>
        ))}
        {totalSpending > 0 && (
          <span className="ml-auto font-medium text-foreground">
            Total: {formatCost(totalSpending)}
          </span>
        )}
      </div>

      {/* Logs grouped by date */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <DotLoading color="primary" />
        </div>
      ) : sortedDateKeys.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-muted-foreground">
          <p className="text-sm">No meals found</p>
        </div>
      ) : (
        sortedDateKeys.map((dateKey) => (
          <section key={dateKey}>
            <SectionHeader title={getDateGroupLabel(dateKey)} />
            <div className="flex flex-col gap-2 mt-1">
              {grouped[dateKey].map((log) => (
                <MealLogCard key={log.id} log={log} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};
