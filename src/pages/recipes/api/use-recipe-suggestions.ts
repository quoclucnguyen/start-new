import { useQuery } from '@tanstack/react-query';
import { supabaseRecipeSuggestionsApi } from './recipe-suggestions.api';
import { useAuthStore } from '@/store';
import type {
  RecipeDetail,
  RecipeSuggestionFilters,
} from '@/api/types';

export const RECIPE_SUGGESTIONS_QUERY_KEY = ['recipe-suggestions'] as const;

/**
 * Hook to fetch recipe suggestions matched against current inventory.
 */
export function useRecipeSuggestions(filters: RecipeSuggestionFilters = {}) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery({
    queryKey: [...RECIPE_SUGGESTIONS_QUERY_KEY, userId, filters],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseRecipeSuggestionsApi.list(userId, filters);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single recipe detail by ID.
 */
export function useRecipeSuggestionDetail(recipeId: string | null) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<RecipeDetail | null, Error>({
    queryKey: [...RECIPE_SUGGESTIONS_QUERY_KEY, 'detail', recipeId, userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      if (!recipeId) return null;
      return supabaseRecipeSuggestionsApi.getRecipeDetail(recipeId, userId);
    },
    enabled: !!recipeId && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
