import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foodItemsApi } from './food-items.api';
import { FOOD_ITEMS_QUERY_KEY } from './use-food-items';
import { useAuthStore } from '@/store';
import type { FoodItem, CreateFoodItemInput, UpdateFoodItemInput } from './types';

/**
 * Hook to add a new food item with optimistic update
 */
export function useAddFoodItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: CreateFoodItemInput) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return foodItemsApi.create(input, userId);
    },
    onMutate: async (newItemInput) => {
      if (!userId) return;

      const queryKey = [...FOOD_ITEMS_QUERY_KEY, userId];
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData<FoodItem[]>(queryKey);

      // Optimistically add the new item
      const optimisticItem: FoodItem = {
        ...newItemInput,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<FoodItem[]>(queryKey, (old) => 
        old ? [...old, optimisticItem] : [optimisticItem]
      );

      return { previousItems, queryKey };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousItems && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      // Refetch to ensure cache is in sync
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...FOOD_ITEMS_QUERY_KEY, userId] });
      }
    },
  });
}

/**
 * Hook to update a food item with optimistic update
 */
export function useUpdateFoodItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: UpdateFoodItemInput) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return foodItemsApi.update(input, userId);
    },
    onMutate: async (updatedItem) => {
      if (!userId) return;

      const queryKey = [...FOOD_ITEMS_QUERY_KEY, userId];
      
      await queryClient.cancelQueries({ queryKey });

      const previousItems = queryClient.getQueryData<FoodItem[]>(queryKey);

      // Optimistically update the item
      queryClient.setQueryData<FoodItem[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === updatedItem.id
            ? { ...item, ...updatedItem, updatedAt: new Date().toISOString() }
            : item
        ) || []
      );

      return { previousItems, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousItems && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...FOOD_ITEMS_QUERY_KEY, userId] });
      }
    },
  });
}

/**
 * Hook to delete a food item with optimistic update
 */
export function useDeleteFoodItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (id: string) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return foodItemsApi.delete(id, userId);
    },
    onMutate: async (deletedId) => {
      if (!userId) return;

      const queryKey = [...FOOD_ITEMS_QUERY_KEY, userId];
      
      await queryClient.cancelQueries({ queryKey });

      const previousItems = queryClient.getQueryData<FoodItem[]>(queryKey);

      // Optimistically remove the item
      queryClient.setQueryData<FoodItem[]>(queryKey, (old) =>
        old?.filter((item) => item.id !== deletedId) || []
      );

      return { previousItems, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousItems && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...FOOD_ITEMS_QUERY_KEY, userId] });
      }
    },
  });
}
