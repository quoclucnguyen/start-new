import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from 'antd-mobile';

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
}

const sizeClasses = {
  sm: '32px',
  md: '40px',
  lg: '48px',
};

const statusSizeClasses = {
  sm: 'size-2',
  md: 'size-3',
  lg: 'size-3.5',
};

const statusColorClasses = {
  online: 'bg-primary',
  offline: 'bg-gray-400',
  away: 'bg-yellow-400',
};

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ className, src, alt, name, size = 'md', showStatus = false, status = 'online', ...props }, ref) => {
    const initials = name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        <Avatar
          src={src || ''}
          alt={alt || name || 'User avatar'}
          style={{ '--size': sizeClasses[size], '--border-radius': '50%' }}
          className="border-2 border-primary"
          fallback={
            <div
              className={cn(
                'flex items-center justify-center w-full h-full bg-primary/10 text-primary font-bold',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base'
              )}
            >
              {initials || '?'}
            </div>
          }
        />
        {showStatus && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-background z-10',
              statusSizeClasses[size],
              statusColorClasses[status]
            )}
          />
        )}
      </div>
    );
  }
);
UserAvatar.displayName = 'UserAvatar';

export { UserAvatar };
