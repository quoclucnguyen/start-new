import * as React from 'react';
import { cn } from '@/lib/utils';
import { TabBar } from 'antd-mobile';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: number;
  href?: string;
}

interface BottomNavigationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
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
          'main-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border',
          className
        )}
        {...props}
      >
        <style>{`
          .main-bottom-nav .adm-tab-bar-item { min-width: 0; padding: 5px 2px; }
          .main-bottom-nav .adm-tab-bar-item-title {
            font-size: 10px; line-height: 1.25;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
          }
        `}</style>
        <TabBar 
          activeKey={activeId} 
          onChange={onItemClick}
          className="pb-safe"
          style={{
            '--background': 'transparent',
          } as React.CSSProperties}
        >
          {items.map((item) => (
            <TabBar.Item
              key={item.id}
              icon={item.icon}
              title={item.label}
              badge={item.badge ? (item.badge > 9 ? '9+' : item.badge) : undefined}
            />
          ))}
        </TabBar>
      </nav>
    );
  }
);
BottomNavigation.displayName = 'BottomNavigation';

export { BottomNavigation };
