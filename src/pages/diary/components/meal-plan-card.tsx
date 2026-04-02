import * as React from 'react';
import { Card } from 'antd-mobile';
import { Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MealPlan } from '@/pages/diary/api/types';
import type { Recipe } from '@/api/types';

interface MealPlanCardProps {
  plan: MealPlan;
  recipesMap?: Map<string, Recipe>;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const MealPlanCard: React.FC<MealPlanCardProps> = ({
  plan,
  recipesMap,
  onEdit,
  onDelete,
  className,
}) => {
  return (
    <Card className={cn('rounded-lg border-l-4 border-l-amber-500', className)}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold text-foreground truncate">
              {plan.title}
            </span>
          </div>

          {plan.items.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {plan.items.map((item) => {
                const recipe = item.recipeId ? recipesMap?.get(item.recipeId) : undefined;
                return (
                  <li key={item.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UtensilsCrossed size={13} className="shrink-0" />
                    <span className="truncate">{item.title}</span>
                    {recipe && (
                      <span className="text-xs text-primary truncate">({recipe.title})</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {plan.notes && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {plan.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-muted-foreground rounded-lg active:bg-muted"
            >
              <Pencil size={16} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-destructive/70 rounded-lg active:bg-destructive/10"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
