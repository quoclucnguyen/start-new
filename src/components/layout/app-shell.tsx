import * as React from 'react';
import { cn } from '@/lib/utils';
import { ConfigProvider } from 'antd-mobile';
import viVN from 'antd-mobile/es/locales/vi-VN';

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ConfigProvider locale={viVN}>
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
      </ConfigProvider>
    );
  }
);
AppShell.displayName = 'AppShell';

export { AppShell };
