import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foodItemsApi } from './food-items.api';
import { FOOD_ITEMS_QUERY_KEY } from './use-food-items';
import type { FoodItem, CreateFoodItemInput, UpdateFoodItemInput } from './types';

/**
 * Hook to add a new food item with optimistic update
 */
export function useAddFoodItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFoodItemInput) => foodItemsApi.create(input),
    onMutate: async (newItemInput) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: FOOD_ITEMS_QUERY_KEY });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData<FoodItem[]>(FOOD_ITEMS_QUERY_KEY);

      // Optimistically add the new item
      const optimisticItem: FoodItem = {
        ...newItemInput,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<FoodItem[]>(FOOD_ITEMS_QUERY_KEY, (old) => 
        old ? [...old, optimisticItem] : [optimisticItem]
      );

      return { previousItems };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(FOOD_ITEMS_QUERY_KEY, context.previousItems);
      }
    },
    onSettled: () => {
      // Refetch to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: FOOD_ITEMS_QUERY_KEY });
    },
  });
}

/**
 * Hook to update a food item with optimistic update
 */
export function useUpdateFoodItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateFoodItemInput) => foodItemsApi.update(input),
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: FOOD_ITEMS_QUERY_KEY });

      const previousItems = queryClient.getQueryData<FoodItem[]>(FOOD_ITEMS_QUERY_KEY);

      // Optimistically update the item
      queryClient.setQueryData<FoodItem[]>(FOOD_ITEMS_QUERY_KEY, (old) =>
        old?.map((item) =>
          item.id === updatedItem.id
            ? { ...item, ...updatedItem, updatedAt: new Date().toISOString() }
            : item
        ) || []
      );

      return { previousItems };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(FOOD_ITEMS_QUERY_KEY, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ITEMS_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete a food item with optimistic update
 */
export function useDeleteFoodItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => foodItemsApi.delete(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: FOOD_ITEMS_QUERY_KEY });

      const previousItems = queryClient.getQueryData<FoodItem[]>(FOOD_ITEMS_QUERY_KEY);

      // Optimistically remove the item
      queryClient.setQueryData<FoodItem[]>(FOOD_ITEMS_QUERY_KEY, (old) =>
        old?.filter((item) => item.id !== deletedId) || []
      );

      return { previousItems };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(FOOD_ITEMS_QUERY_KEY, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOOD_ITEMS_QUERY_KEY });
    },
  });
}
