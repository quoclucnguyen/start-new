import { useQuery } from '@tanstack/react-query';
import { menuItemsApi } from './menu-items.api';
import { useAuthStore } from '@/store';
import type { MenuItem } from './types';

export const MENU_ITEMS_QUERY_KEY = ['menu-items'] as const;

export function useMenuItems(venueId: string | null) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<MenuItem[], Error>({
    queryKey: [...MENU_ITEMS_QUERY_KEY, userId, venueId],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      if (!venueId) return Promise.resolve([]);
      return menuItemsApi.getByVenue(venueId, userId);
    },
    enabled: !!venueId && !!userId,
  });
}

export function useAllMenuItems() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<MenuItem[], Error>({
    queryKey: [...MENU_ITEMS_QUERY_KEY, userId, 'all'],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return menuItemsApi.getAll(userId);
    },
    enabled: !!userId,
  });
}
