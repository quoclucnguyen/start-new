import * as React from 'react';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Trash2, Package } from 'lucide-react';
import { Popover, Button } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/popover';

interface ShoppingHeaderProps extends React.HTMLAttributes<HTMLElement> {
  totalCount: number;
  checkedCount: number;
  onDeleteChecked?: () => void;
  onMoveToInventory?: () => void;
}

const ShoppingHeader = React.forwardRef<HTMLElement, ShoppingHeaderProps>(
  ({ className, totalCount, checkedCount, onDeleteChecked, onMoveToInventory, ...props }, ref) => {
    const uncheckedCount = totalCount - checkedCount;

    const actions: Action[] = [];

    if (checkedCount > 0) {
      actions.push(
        {
          key: 'move',
          text: (
            <div className="flex items-center gap-2">
              <Package size={16} />
              Move {checkedCount} to Inventory
            </div>
          ),
        },
        {
          key: 'delete',
          text: (
            <div className="flex items-center gap-2 text-destructive">
              <Trash2 size={16} />
              Delete Checked ({checkedCount})
            </div>
          ),
        },
      );
    }

    const handleAction = (action: Action) => {
      if (action.key === 'move') {
        onMoveToInventory?.();
      } else if (action.key === 'delete') {
        onDeleteChecked?.();
      }
    };

    return (
      <header
        ref={ref}
        className={cn(
          'flex items-center justify-between',
          className,
        )}
        {...props}
      >
        <div className="flex-1">
          <h2 className="text-2xl font-bold leading-tight tracking-tight">Shopping List</h2>
          <p className="text-xs text-muted-foreground font-medium">
            {totalCount === 0
              ? 'No items'
              : `${uncheckedCount} item${uncheckedCount !== 1 ? 's' : ''} left to buy`}
          </p>
        </div>
        {actions.length > 0 && (
          <Popover.Menu
            actions={actions}
            onAction={handleAction}
            trigger="click"
            placement="bottom-end"
          >
            <Button
              fill="none"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card"
            >
              <MoreHorizontal size={20} />
            </Button>
          </Popover.Menu>
        )}
      </header>
    );
  },
);
ShoppingHeader.displayName = 'ShoppingHeader';

export { ShoppingHeader };
