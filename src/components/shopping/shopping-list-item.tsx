import * as React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface ShoppingListItemProps extends React.HTMLAttributes<HTMLLabelElement> {
  name: string;
  quantity?: string;
  emoji?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const ShoppingListItem = React.forwardRef<HTMLLabelElement, ShoppingListItemProps>(
  ({ className, name, quantity, emoji, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'group relative flex items-center justify-between p-4 rounded-xl bg-card border shadow-sm transition-all active:scale-[0.99] cursor-pointer',
          checked && 'opacity-60',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheckedChange?.(e.target.checked)}
              className={cn(
                'peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-muted-foreground/50 bg-transparent transition-all',
                'checked:border-primary checked:bg-primary',
                'hover:border-primary',
                'focus:outline-none focus:ring-0'
              )}
            />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={cn(
              'text-base font-semibold',
              checked && 'line-through decoration-muted-foreground'
            )}>
              {name}
            </span>
            {quantity && (
              <span className="text-xs text-muted-foreground">{quantity}</span>
            )}
          </div>
        </div>
        {emoji && (
          <div className="flex items-center justify-center rounded-lg bg-muted px-2 py-1">
            <span className="text-xl">{emoji}</span>
          </div>
        )}
      </label>
    );
  }
);
ShoppingListItem.displayName = 'ShoppingListItem';

export { ShoppingListItem };
