import * as React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from 'antd-mobile';

interface ShoppingListItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name: string;
  quantity?: string;
  emoji?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const ShoppingListItem = React.forwardRef<HTMLDivElement, ShoppingListItemProps>(
  ({ className, name, quantity, emoji, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        <Checkbox
          checked={checked}
          onChange={onCheckedChange}
          className={cn(
            'w-full p-4 rounded-xl bg-card border shadow-sm transition-all active:scale-[0.99]',
            checked && 'opacity-60',
            // Customizing checkbox icon wrapper to match the design if needed, 
            // but antd-mobile Checkbox has its own style.
            // We can add a class to target internal elements if strictly necessary,
            // but for now relying on standard appearance.
          )}
          style={{
            '--icon-size': '24px',
            '--gap': '16px',
            width: '100%',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div className="flex items-center justify-between w-full">
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
            {emoji && (
              <div className="flex items-center justify-center rounded-lg bg-muted px-2 py-1 ml-4">
                <span className="text-xl">{emoji}</span>
              </div>
            )}
          </div>
        </Checkbox>
      </div>
    );
  }
);
ShoppingListItem.displayName = 'ShoppingListItem';

export { ShoppingListItem };
