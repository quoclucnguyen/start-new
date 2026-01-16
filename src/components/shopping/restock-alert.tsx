import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RestockAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: string[];
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

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
      <Card
        ref={ref}
        className={cn(
          'relative overflow-hidden border-primary/30 p-5',
          className
        )}
        {...props}
      >
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <LightbulbIcon />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-base font-bold leading-tight">{title}</p>
              <p className="text-sm text-muted-foreground">
                {message || defaultMessage}
              </p>
            </div>
          </div>
          
          <Button onClick={onAction} className="w-full">
            <PlusIcon />
            {actionLabel}
          </Button>
        </div>
      </Card>
    );
  }
);
RestockAlert.displayName = 'RestockAlert';

export { RestockAlert };
