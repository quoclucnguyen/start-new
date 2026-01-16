import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, Card } from 'antd-mobile';
import { Lightbulb, Plus } from 'lucide-react';

interface RestockAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: string[];
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const RestockAlert = React.forwardRef<HTMLDivElement, RestockAlertProps>(
  ({ 
    className, 
    title = 'Restock Alert', 
    items, 
    message,
    actionLabel = 'Add All to List',
    onAction,
    ...props 
  }, ref) => {
    const formattedItems = items.length > 1 
      ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
      : items[0];

    const defaultMessage = `${formattedItems} expired yesterday. Add to list?`;

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <Card className="border-primary/30 relative overflow-hidden">
          {/* Decorative background accent */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Lightbulb size={20} />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-base font-bold leading-tight">{title}</p>
                <p className="text-sm text-muted-foreground">
                  {message || defaultMessage}
                </p>
              </div>
            </div>
            
            <Button 
              block 
              color="primary" 
              fill="solid"
              onClick={onAction} 
              className="w-full"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus size={18} />
                {actionLabel}
              </div>
            </Button>
          </div>
        </Card>
      </div>
    );
  }
);
RestockAlert.displayName = 'RestockAlert';

export { RestockAlert };
