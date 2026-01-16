import * as React from 'react';
import { cn } from '@/lib/utils';

export type NotificationType = 'expiry' | 'shopping' | 'recipe' | 'expired' | 'system';

interface NotificationItemProps extends React.HTMLAttributes<HTMLDivElement> {
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
  strikethrough?: boolean;
}

const iconConfig: Record<NotificationType, { 
  bg: string; 
  color: string;
  icon: React.ReactNode;
}> = {
  expiry: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    color: 'text-red-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  shopping: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    color: 'text-primary',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
  },
  recipe: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    color: 'text-blue-600 dark:text-blue-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
        <path d="M7 21h10" />
        <path d="M19.5 12 22 6" />
      </svg>
    ),
  },
  expired: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    color: 'text-gray-500 dark:text-gray-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    ),
  },
  system: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    color: 'text-primary',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
};

const NotificationItem = React.forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ className, type, title, message, time, unread = false, strikethrough = false, ...props }, ref) => {
    const config = iconConfig[type];

    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden border-b border-border/50 transition-colors hover:bg-accent/50',
          unread && 'bg-primary/5',
          className
        )}
        {...props}
      >
        {unread && (
          <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,236,91,0.6)]" />
        )}
        
        <div className="flex gap-4 px-4 py-4 justify-between items-start">
          <div className="flex items-start gap-4 flex-1">
            <div className={cn(
              'flex items-center justify-center rounded-2xl shrink-0 size-12 shadow-sm',
              config.bg,
              config.color
            )}>
              {config.icon}
            </div>
            <div className="flex flex-1 flex-col justify-center gap-1 pr-4">
              <p className={cn(
                'text-base font-bold leading-snug',
                strikethrough && 'opacity-80 line-through decoration-muted-foreground'
              )}>
                {title}
              </p>
              <p className={cn(
                'text-sm text-muted-foreground leading-relaxed',
                strikethrough && 'opacity-80'
              )}>
                {message}
              </p>
            </div>
          </div>
          <div className="shrink-0 pt-1">
            <p className="text-xs font-semibold text-muted-foreground opacity-70">{time}</p>
          </div>
        </div>
      </div>
    );
  }
);
NotificationItem.displayName = 'NotificationItem';

export { NotificationItem };
