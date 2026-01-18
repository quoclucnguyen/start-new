import { useQuery } from '@tanstack/react-query';
import { foodItemsApi } from './food-items.api';
import type { FoodItem } from './types';

export const FOOD_ITEMS_QUERY_KEY = ['food-items'] as const;

/**
 * Hook to fetch all food items
 */
export function useFoodItems() {
  return useQuery<FoodItem[], Error>({
    queryKey: FOOD_ITEMS_QUERY_KEY,
    queryFn: () => foodItemsApi.getAll(),
  });
}

/**
 * Hook to fetch a single food item by ID
 */
export function useFoodItem(id: string | null) {
  return useQuery<FoodItem | null, Error>({
    queryKey: [...FOOD_ITEMS_QUERY_KEY, id],
    queryFn: () => (id ? foodItemsApi.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}
