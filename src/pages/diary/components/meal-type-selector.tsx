import * as React from 'react';
import { cn } from '@/lib/utils';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/pages/diary/api/types';
import type { MealType } from '@/pages/diary/api/types';

interface MealTypeSelectorProps {
  value?: MealType;
  onChange: (type: MealType) => void;
  className?: string;
}

const MEAL_TYPES: MealType[] = ['delivery', 'dine_in', 'ready_made'];

export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {MEAL_TYPES.map((type) => {
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
              selected
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-muted-foreground/20 bg-secondary active:bg-muted',
            )}
          >
            <span className="text-2xl">{MEAL_TYPE_ICONS[type]}</span>
            <span
              className={cn(
                'text-sm font-medium',
                selected ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {MEAL_TYPE_LABELS[type]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
