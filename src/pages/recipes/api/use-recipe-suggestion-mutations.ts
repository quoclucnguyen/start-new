import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseShoppingListApi } from '@/pages/shopping/api/shopping-list.api';
import { SHOPPING_LIST_QUERY_KEY } from '@/pages/shopping/api/use-shopping-list';
import { normalizeForMatching } from './recipe-matcher';
import { useAuthStore } from '@/store';
import type {
  MissingIngredient,
  ShoppingListItem,
  CreateShoppingListItemInput,
} from '@/api/types';

/**
 * Hook to add missing recipe ingredients to the shopping list.
 *
 * - Deduplicates against existing unchecked shopping items (by normalized name).
 * - Returns count of items actually added.
 */
export function useAddMissingToShoppingList() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: async (missingIngredients: MissingIngredient[]) => {
      if (!userId) throw new Error('User not authenticated');

      // Fetch existing shopping list for dedup
      const existingItems = await supabaseShoppingListApi.getAll();
      const uncheckedNames = new Set(
        existingItems
          .filter((item) => !item.checked)
          .map((item) => normalizeForMatching(item.name)),
      );

      // Filter out ingredients that already exist in shopping list
      const toAdd = missingIngredients.filter(
        (ing) => !uncheckedNames.has(normalizeForMatching(ing.name)),
      );

      // Create shopping list items
      const created: ShoppingListItem[] = [];
      for (const ing of toAdd) {
        const input: CreateShoppingListItemInput = {
          name: ing.name,
          category: 'Other',
          quantity: ing.quantity ?? 1,
          unit: 'pieces',
          notes: `Added from recipe suggestion`,
        };
        const item = await supabaseShoppingListApi.create(input, userId);
        created.push(item);
      }

      return {
        addedCount: created.length,
        skippedCount: missingIngredients.length - toAdd.length,
        items: created,
      };
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [...SHOPPING_LIST_QUERY_KEY, userId],
        });
      }
    },
  });
}
