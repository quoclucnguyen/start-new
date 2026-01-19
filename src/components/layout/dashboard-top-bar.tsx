import * as React from 'react';
import { TopAppBar } from './top-app-bar';
import { UserAvatar } from '@/components/shared/user-avatar';
import { IconButton } from '@/components/ui/icon-button';
import { useAuthStore } from '@/store';
import { Bell } from 'lucide-react';

interface DashboardTopBarProps {
  title?: string;
  subtitle?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

/**
 * TopAppBar wrapper for dashboard pages.
 * - Shows authenticated user's avatar on the left
 * - Shows notification bell with badge on the right
 */
export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  title = 'My Kitchen',
  subtitle = 'Good Morning,',
  notificationCount = 0,
  onNotificationClick,
}) => {
  const user = useAuthStore((state) => state.user);

  // Get user avatar URL from Supabase user metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  return (
    <TopAppBar
      title={title}
      subtitle={subtitle}
      leftAction={
        <UserAvatar
          src={avatarUrl}
          alt={userName || 'User Profile'}
          showStatus
        />
      }
      rightAction={
        <IconButton className="relative" onClick={onNotificationClick}>
          <Bell size={24} />
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </IconButton>
      }
    />
  );
};
