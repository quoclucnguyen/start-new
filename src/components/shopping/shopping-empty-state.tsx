import * as React from 'react';
import { cn } from '@/lib/utils';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from 'antd-mobile';

interface ShoppingEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  onAddItem: () => void;
}

const ShoppingEmptyState = React.forwardRef<HTMLDivElement, ShoppingEmptyStateProps>(
  ({ className, onAddItem, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-16 px-8 text-center',
          className,
        )}
        {...props}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-5">
          <ShoppingCart className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Danh sách mua sắm trống</h3>
        <p className="text-sm text-muted-foreground max-w-[260px] mb-6">
          Thêm món bạn cần mua và đánh dấu khi đã mua xong.
        </p>
        <Button
          color="primary"
          fill="solid"
          onClick={onAddItem}
          className="rounded-xl!"
        >
          <div className="flex items-center gap-2 px-2">
            <Plus size={18} />
            Thêm món đầu tiên
          </div>
        </Button>
      </div>
    );
  },
);
ShoppingEmptyState.displayName = 'ShoppingEmptyState';

export { ShoppingEmptyState };
