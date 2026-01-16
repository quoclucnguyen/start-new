import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FilterChip {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterChipsProps extends React.HTMLAttributes<HTMLDivElement> {
  chips: FilterChip[];
  activeId?: string;
  onChipClick?: (id: string) => void;
  variant?: 'default' | 'primary';
}

const FilterChips = React.forwardRef<HTMLDivElement, FilterChipsProps>(
  ({ className, chips, activeId, onChipClick, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex gap-2 overflow-x-auto no-scrollbar pb-1', className)}
        {...props}
      >
        {chips.map((chip) => {
          const isActive = chip.id === activeId;
          return (
            <button
              key={chip.id}
              onClick={() => onChipClick?.(chip.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all',
                isActive && variant === 'default' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 font-bold shadow-sm',
                isActive && variant === 'primary' && 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20',
                !isActive && 'bg-card border border-input text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {chip.icon}
              {chip.label}
            </button>
          );
        })}
      </div>
    );
  }
);
FilterChips.displayName = 'FilterChips';

export { FilterChips };
