import * as React from 'react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/icon-button';

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

// Convenience components for common actions
interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: 'back' | 'close';
}

const BackButton = React.forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ icon = 'back', ...props }, ref) => {
    return (
      <IconButton ref={ref} variant="ghost" {...props}>
        {icon === 'close' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        )}
      </IconButton>
    );
  }
);
BackButton.displayName = 'BackButton';

export { TopAppBar, BackButton };
