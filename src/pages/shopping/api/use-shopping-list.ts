import { useQuery } from '@tanstack/react-query';
import { supabaseShoppingListApi } from './shopping-list.api';
import { useAuthStore } from '@/store';
import type { ShoppingListItem } from '@/api/types';

export const SHOPPING_LIST_QUERY_KEY = ['shopping-list'] as const;

/**
 * Hook to fetch all shopping list items for the current user
 */
export function useShoppingList() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<ShoppingListItem[], Error>({
    queryKey: [...SHOPPING_LIST_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return supabaseShoppingListApi.getAll();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single shopping list item by ID
 */
export function useShoppingListItem(id: string | null) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<ShoppingListItem | null, Error>({
    queryKey: [...SHOPPING_LIST_QUERY_KEY, userId, id],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return id ? supabaseShoppingListApi.getById(id) : Promise.resolve(null);
    },
    enabled: !!id && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
