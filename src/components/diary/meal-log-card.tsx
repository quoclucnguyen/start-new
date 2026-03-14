import * as React from 'react';
import { Card } from 'antd-mobile';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MealTypeBadge } from './meal-type-badge';
import { RatingInput } from './rating-input';
import { formatCost, formatLogDate } from '@/api/diary/types';
import type { MealLog } from '@/api/diary/types';

interface MealLogCardProps {
  log: MealLog;
  onClick?: () => void;
  onMoreClick?: (e: React.MouseEvent) => void;
  className?: string;
}

const borderColorMap: Record<string, string> = {
  delivery: 'border-l-blue-500',
  dine_in: 'border-l-amber-500',
  ready_made: 'border-l-violet-500',
};

export const MealLogCard: React.FC<MealLogCardProps> = ({
  log,
  onClick,
  onMoreClick,
  className,
}) => {
  return (
    <Card
      className={cn('rounded-lg border-l-4', borderColorMap[log.mealType], className)}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MealTypeBadge type={log.mealType} />
            {log.venue && (
              <span className="text-sm font-medium text-foreground truncate">
                {log.venue.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-lg font-bold text-foreground">
              {formatCost(log.totalCost)}
            </span>
            {log.overallRating && (
              <RatingInput value={log.overallRating} size={14} readOnly />
            )}
          </div>

          {log.notes && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {log.notes}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-1.5">
            {formatLogDate(log.loggedAt)}
          </p>
        </div>

        {onMoreClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoreClick(e);
            }}
            className="p-1 text-muted-foreground"
          >
            <MoreVertical size={18} />
          </button>
        )}
      </div>
    </Card>
  );
};
