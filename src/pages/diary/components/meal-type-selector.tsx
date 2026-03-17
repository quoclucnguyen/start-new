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
    <div className={cn('flex flex-wrap gap-2', className)}>
      {MEAL_TYPES.map((type) => {
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all',
              selected
                ? 'border-primary bg-primary text-primary-foreground font-medium'
                : 'border-muted-foreground/20 bg-secondary text-muted-foreground active:bg-muted',
            )}
          >
            <span className="text-base">{MEAL_TYPE_ICONS[type]}</span>
            <span className="text-xs">{MEAL_TYPE_LABELS[type]}</span>
          </button>
        );
      })}
    </div>
  );
};
