import { useQuery } from '@tanstack/react-query';
import { foodItemsApi } from './food-items.api';
import { useAuthStore } from '@/store';
import type { FoodItem } from './types';

export const FOOD_ITEMS_QUERY_KEY = ['food-items'] as const;

/**
 * Hook to fetch all food items for the current user
 */
export function useFoodItems() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<FoodItem[], Error>({
    queryKey: [...FOOD_ITEMS_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return foodItemsApi.getAll(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch a single food item by ID
 */
export function useFoodItem(id: string | null) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<FoodItem | null, Error>({
    queryKey: [...FOOD_ITEMS_QUERY_KEY, userId, id],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return id ? foodItemsApi.getById(id, userId) : Promise.resolve(null);
    },
    enabled: !!id && !!userId,
  });
}
