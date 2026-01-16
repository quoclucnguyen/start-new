import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  action?: React.ReactNode;
  sticky?: boolean;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, action, sticky = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between pb-3 pt-2',
          sticky && 'sticky top-[88px] z-30 bg-background py-2',
          className
        )}
        {...props}
      >
        <h2 className="text-[20px] font-bold leading-tight tracking-tight">{title}</h2>
        {action}
      </div>
    );
  }
);
SectionHeader.displayName = 'SectionHeader';

export { SectionHeader };
