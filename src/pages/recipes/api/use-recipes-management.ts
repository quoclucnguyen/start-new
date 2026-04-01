import { useQuery } from '@tanstack/react-query';
import { supabaseRecipesManagementApi } from './recipes-management.api';
import { useAuthStore } from '@/store';
import type { Recipe, RecipeDetail } from '@/api/types';

export const RECIPES_MANAGEMENT_QUERY_KEY = ['recipes-management'] as const;

/**
 * Hook to fetch all recipes for the current user (including system recipes)
 */
export function useRecipesList(options?: { search?: string; tags?: string[] }) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<Recipe[], Error>({
    queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId, options?.search, options?.tags],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return supabaseRecipesManagementApi.list(userId, options);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch a single recipe by ID with ingredients and steps
 */
export function useRecipeById(recipeId: string | null) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<RecipeDetail | null, Error>({
    queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId, 'detail', recipeId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return recipeId ? supabaseRecipesManagementApi.getById(recipeId, userId) : Promise.resolve(null);
    },
    enabled: !!recipeId && !!userId,
  });
}
