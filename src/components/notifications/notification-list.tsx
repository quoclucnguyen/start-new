import * as React from 'react';
import { cn } from '@/lib/utils';
import { NotificationItem, type NotificationType } from './notification-item';

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
  strikethrough?: boolean;
}

interface NotificationGroup {
  label: string;
  notifications: NotificationData[];
}

interface NotificationListProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: NotificationGroup[];
  onNotificationClick?: (id: string) => void;
}

const NotificationList = React.forwardRef<HTMLDivElement, NotificationListProps>(
  ({ className, groups, onNotificationClick, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col', className)} {...props}>
        {groups.map((group, groupIndex) => (
          <div key={group.label} className={cn('flex flex-col', groupIndex > 0 && 'mt-2')}>
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm px-4 py-3 border-b border-dashed border-border/50">
              <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">
                {group.label}
              </h3>
            </div>
            {group.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                time={notification.time}
                unread={notification.unread}
                strikethrough={notification.strikethrough}
                onClick={() => onNotificationClick?.(notification.id)}
                className="cursor-pointer"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);
NotificationList.displayName = 'NotificationList';

export { NotificationList, type NotificationData, type NotificationGroup };
