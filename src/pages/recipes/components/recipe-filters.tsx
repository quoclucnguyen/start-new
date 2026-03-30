import * as React from 'react';
import { cn } from '@/lib/utils';
import type { FilterChip } from '@/components/shared';

interface RecipeFiltersProps {
  activeFilters: {
    search?: string;
    suggestedOnly?: boolean;
    maxCookTimeMinutes?: number;
    difficulty?: string;
    tags?: string[];
  };
  availableTags: string[];
  onToggleSuggestedOnly: () => void;
  onSetMaxCookTime: (minutes: number | undefined) => void;
  onSetDifficulty: (difficulty: 'all' | 'easy' | 'medium' | 'hard') => void;
  onToggleTag: (tag: string) => void;
  className?: string;
}

interface FilterChipButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const FilterChipButton: React.FC<FilterChipButtonProps> = ({
  active,
  onClick,
  icon,
  children,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-colors text-sm font-medium whitespace-nowrap',
      active
        ? 'bg-primary/20 border border-primary text-foreground font-semibold'
        : 'bg-card border border-input text-muted-foreground hover:bg-accent hover:text-foreground',
    )}
  >
    {icon}
    {children}
  </button>
);

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  activeFilters,
  availableTags,
  onToggleSuggestedOnly,
  onSetMaxCookTime,
  onSetDifficulty,
  onToggleTag,
  className,
}) => {
  const is30Min = activeFilters.maxCookTimeMinutes === 30;
  const activeDifficulty = activeFilters.difficulty ?? 'all';

  return (
    <div className={cn('flex gap-2 overflow-x-auto no-scrollbar pb-1', className)}>
      <FilterChipButton
        active={!!activeFilters.suggestedOnly}
        onClick={onToggleSuggestedOnly}
      >
        Suggested
      </FilterChipButton>

      <FilterChipButton
        active={is30Min}
        onClick={() => onSetMaxCookTime(is30Min ? undefined : 30)}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        }
      >
        Under 30m
      </FilterChipButton>

      <FilterChipButton
        active={activeDifficulty === 'easy'}
        onClick={() => onSetDifficulty(activeDifficulty === 'easy' ? 'all' : 'easy')}
      >
        Easy
      </FilterChipButton>

      <FilterChipButton
        active={activeDifficulty === 'medium'}
        onClick={() => onSetDifficulty(activeDifficulty === 'medium' ? 'all' : 'medium')}
      >
        Medium
      </FilterChipButton>

      <FilterChipButton
        active={activeDifficulty === 'hard'}
        onClick={() => onSetDifficulty(activeDifficulty === 'hard' ? 'all' : 'hard')}
      >
        Hard
      </FilterChipButton>

      {availableTags.map((tag) => (
        <FilterChipButton
          key={tag}
          active={activeFilters.tags?.includes(tag) ?? false}
          onClick={() => onToggleTag(tag)}
        >
          {tag.charAt(0).toUpperCase() + tag.slice(1)}
        </FilterChipButton>
      ))}
    </div>
  );
};

export { RecipeFilters };
export type { RecipeFiltersProps, FilterChip };
