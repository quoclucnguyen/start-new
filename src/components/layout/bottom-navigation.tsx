import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: number;
  href?: string;
}

interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
}

const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(
  ({ className, items, activeId, onItemClick, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg pb-safe',
          className
        )}
        {...props}
      >
        <div className="flex h-16 items-center justify-around px-2">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 p-2 transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="relative">
                  {isActive && item.activeIcon ? item.activeIcon : item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn('text-[10px]', isActive ? 'font-bold' : 'font-medium')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }
);
BottomNavigation.displayName = 'BottomNavigation';

export { BottomNavigation };
