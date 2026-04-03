import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseShoppingListApi } from './shopping-list.api';
import { SHOPPING_LIST_QUERY_KEY } from './use-shopping-list';
import { FOOD_ITEMS_QUERY_KEY } from '@/pages/inventory/api/use-food-items';
import { supabaseFoodItemsApi } from '@/pages/inventory/api/food-items.api';
import { useAuthStore } from '@/store';
import type {
  ShoppingListItem,
  CreateShoppingListItemInput,
  UpdateShoppingListItemInput,
  CreateFoodItemInput,
} from '@/api/types';

/**
 * Hook to add a new shopping list item with optimistic update
 */
export function useAddShoppingListItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: CreateShoppingListItemInput) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseShoppingListApi.create(input, userId);
    },
    onMutate: async (newItemInput) => {
      if (!userId) return;

      const queryKey = [...SHOPPING_LIST_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItem[]>(queryKey);

      const optimisticItem: ShoppingListItem = {
        id: `temp-${Date.now()}`,
        userId,
        ...newItemInput,
        checked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ShoppingListItem[]>(queryKey, (old) =>
        old ? [...old, optimisticItem] : [optimisticItem],
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
        queryClient.invalidateQueries({ queryKey: [...SHOPPING_LIST_QUERY_KEY, userId] });
      }
    },
  });
}

/**
 * Hook to update a shopping list item with optimistic update
 */
export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: UpdateShoppingListItemInput) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseShoppingListApi.update(input);
    },
    onMutate: async (updatedItem) => {
      if (!userId) return;

      const queryKey = [...SHOPPING_LIST_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItem[]>(queryKey);

      queryClient.setQueryData<ShoppingListItem[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === updatedItem.id
            ? { ...item, ...updatedItem, updatedAt: new Date().toISOString() }
            : item,
        ) || [],
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
        queryClient.invalidateQueries({ queryKey: [...SHOPPING_LIST_QUERY_KEY, userId] });
      }
    },
  });
}

/**
 * Hook to toggle checked status with optimistic update
 */
export function useToggleShoppingItemChecked() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseShoppingListApi.update({ id, checked });
    },
    onMutate: async ({ id, checked }) => {
      if (!userId) return;

      const queryKey = [...SHOPPING_LIST_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItem[]>(queryKey);

      queryClient.setQueryData<ShoppingListItem[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === id
            ? {
                ...item,
                checked,
                updatedAt: new Date().toISOString(),
                purchasedAt: checked ? new Date().toISOString() : undefined,
              }
            : item,
        ) || [],
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
        queryClient.invalidateQueries({ queryKey: [...SHOPPING_LIST_QUERY_KEY, userId] });
      }
    },
  });
}

/**
 * Hook to delete a shopping list item with optimistic update
 */
export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseShoppingListApi.delete(id);
    },
    onMutate: async (deletedId) => {
      if (!userId) return;

      const queryKey = [...SHOPPING_LIST_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItem[]>(queryKey);

      queryClient.setQueryData<ShoppingListItem[]>(queryKey, (old) =>
        old?.filter((item) => item.id !== deletedId) || [],
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
        queryClient.invalidateQueries({ queryKey: [...SHOPPING_LIST_QUERY_KEY, userId] });
      }
    },
  });
}

/**
 * Hook to delete all checked items with optimistic update
 */
export function useDeleteCheckedItems() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseShoppingListApi.deleteChecked();
    },
    onMutate: async () => {
      if (!userId) return;

      const queryKey = [...SHOPPING_LIST_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingListItem[]>(queryKey);

      queryClient.setQueryData<ShoppingListItem[]>(queryKey, (old) =>
        old?.filter((item) => !item.checked) || [],
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
        queryClient.invalidateQueries({ queryKey: [...SHOPPING_LIST_QUERY_KEY, userId] });
      }
    },
  });
}

/**
 * Hook to move all checked shopping list items to inventory.
 * Creates food items for each checked shopping item, then soft-deletes them.
 */
export function useMovePurchasedToInventory() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');

      // Get current checked items from cache
      const queryKey = [...SHOPPING_LIST_QUERY_KEY, userId];
      const items = queryClient.getQueryData<ShoppingListItem[]>(queryKey) || [];
      const checkedItems = items.filter((item) => item.checked);

      if (checkedItems.length === 0) return [];

      // Create food items for each checked shopping item
      const createdItems = [];
      for (const shoppingItem of checkedItems) {
        const foodInput: CreateFoodItemInput = {
          name: shoppingItem.name,
          category: shoppingItem.category,
          quantity: shoppingItem.quantity,
          unit: shoppingItem.unit,
          storage: 'pantry',
          expiryDate: null,
          purchaseDate: new Date().toISOString().slice(0, 10),
          notes: shoppingItem.notes,
        };

        const created = await supabaseFoodItemsApi.create(foodInput, userId);
        createdItems.push(created);

        // Soft-delete from shopping list
        await supabaseShoppingListApi.delete(shoppingItem.id);
      }

      return createdItems;
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...SHOPPING_LIST_QUERY_KEY, userId] });
        queryClient.invalidateQueries({ queryKey: [...FOOD_ITEMS_QUERY_KEY, userId] });
      }
    },
  });
}
