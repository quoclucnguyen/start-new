import * as React from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-full min-h-screen w-full flex-col bg-background overflow-x-hidden transition-colors duration-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AppShell.displayName = 'AppShell';

export { AppShell };
