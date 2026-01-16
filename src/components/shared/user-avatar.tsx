import * as React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
}

const sizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
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
      <div ref={ref} className={cn('relative group cursor-pointer', className)} {...props}>
        {src ? (
          <div
            className={cn(
              'bg-center bg-no-repeat bg-cover rounded-full border-2 border-primary',
              sizeClasses[size]
            )}
            style={{ backgroundImage: `url(${src})` }}
            role="img"
            aria-label={alt || name || 'User avatar'}
          />
        ) : (
          <div
            className={cn(
              'flex items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary font-bold',
              sizeClasses[size],
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {initials || '?'}
          </div>
        )}
        {showStatus && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-background',
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
