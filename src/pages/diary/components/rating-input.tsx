import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingInputProps {
  value?: number;
  onChange?: (rating: number) => void;
  max?: number;
  size?: number;
  readOnly?: boolean;
  className?: string;
}

export const RatingInput: React.FC<RatingInputProps> = ({
  value = 0,
  onChange,
  max = 5,
  size = 24,
  readOnly = false,
  className,
}) => {
  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(starValue === value ? 0 : starValue);
              }
            }}
            className={cn(
              'transition-colors',
              readOnly ? 'cursor-default' : 'cursor-pointer active:scale-110',
            )}
          >
            <Star
              size={size}
              className={cn(
                filled ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40',
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
