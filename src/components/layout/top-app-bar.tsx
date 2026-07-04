import * as React from 'react';
import { cn } from '@/lib/utils';


interface TopAppBarProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

const TopAppBar = React.forwardRef<HTMLElement, TopAppBarProps>(
  ({ className, title, subtitle, leftAction, rightAction, transparent = false, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-30 transition-colors duration-200',
          transparent 
            ? 'bg-transparent' 
            : 'bg-background/95 backdrop-blur-sm border-b border-border/50',
          className
        )}
        {...props}
      >
        {children || (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1">
              {leftAction}
              {(title || subtitle) && (
                <div className="flex flex-col">
                  {subtitle && (
                    <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>
                  )}
                  {title && (
                    <h1 className="text-lg font-bold leading-tight tracking-tight">{title}</h1>
                  )}
                </div>
              )}
            </div>
            {rightAction && (
              <div className="flex items-center gap-2">
                {rightAction}
              </div>
            )}
          </div>
        )}
      </header>
    );
  }
);
TopAppBar.displayName = 'TopAppBar';

export { TopAppBar };
