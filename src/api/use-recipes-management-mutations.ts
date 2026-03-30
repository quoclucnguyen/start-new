import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseRecipesManagementApi } from './recipes-management.api';
import { RECIPE_SUGGESTIONS_QUERY_KEY } from './use-recipe-suggestions';
import { RECIPES_MANAGEMENT_QUERY_KEY } from './use-recipes-management';
import { useAuthStore } from '@/store';
import type {
  Recipe,
  RecipeDetail,
  RecipeIngredient,
  RecipeStep,
  CreateRecipeInput,
  UpdateRecipeInput,
} from './types';

/**
 * Hook to create a new recipe with optimistic update
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: CreateRecipeInput) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseRecipesManagementApi.create(input, userId);
    },
    onMutate: async (newRecipeInput) => {
      if (!userId) return;

      // Cancel outgoing refetches for list queries
      await queryClient.cancelQueries({
        queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
      });

      // Snapshot all list queries
      const previousQueries = queryClient.getQueriesData<Recipe[]>({
        queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
        exact: false,
      });

      // Optimistically add the new recipe
      const optimisticRecipe: Recipe = {
        id: `temp-${Date.now()}`,
        userId,
        title: newRecipeInput.title,
        description: newRecipeInput.description,
        imageUrl: newRecipeInput.imageUrl,
        cookTimeMinutes: newRecipeInput.cookTimeMinutes,
        prepTimeMinutes: newRecipeInput.prepTimeMinutes,
        servings: newRecipeInput.servings,
        difficulty: newRecipeInput.difficulty,
        tags: newRecipeInput.tags ?? [],
        visibility: newRecipeInput.visibility ?? 'private',
        source: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      };

      // Update all matching list queries
      queryClient.setQueriesData<Recipe[]>(
        { queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId], exact: false },
        (old) => (old ? [optimisticRecipe, ...old] : [optimisticRecipe]),
      );

      return { previousQueries };
    },
    onError: (_err, _variables, context) => {
      // Rollback all list queries
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
        });
        queryClient.invalidateQueries({
          queryKey: [...RECIPE_SUGGESTIONS_QUERY_KEY, userId],
        });
      }
    },
  });
}

/**
 * Hook to update recipe metadata with optimistic update
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: UpdateRecipeInput) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseRecipesManagementApi.update(input, userId);
    },
    onMutate: async (updatedRecipe) => {
      if (!userId) return;

      await queryClient.cancelQueries({
        queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
      });

      const previousQueries = queryClient.getQueriesData<Recipe[]>({
        queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
        exact: false,
      });

      // Optimistically update in list
      queryClient.setQueriesData<Recipe[]>(
        { queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId], exact: false },
        (old) =>
          old?.map((item) =>
            item.id === updatedRecipe.id
              ? { ...item, ...updatedRecipe, updatedAt: new Date().toISOString() }
              : item,
          ) ?? [],
      );

      return { previousQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: (_data, _error, variables) => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
        });
        // Also invalidate detail query
        queryClient.invalidateQueries({
          queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId, 'detail', variables.id],
        });
        queryClient.invalidateQueries({
          queryKey: [...RECIPE_SUGGESTIONS_QUERY_KEY, userId],
        });
      }
    },
  });
}

/**
 * Hook to replace all ingredients of a recipe
 */
export function useReplaceRecipeIngredients() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation<
    RecipeIngredient[],
    Error,
    { recipeId: string; ingredients: CreateRecipeInput['ingredients'] }
  >({
    mutationFn: ({ recipeId, ingredients }) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseRecipesManagementApi.replaceIngredients(recipeId, ingredients, userId);
    },
    onSettled: (_data, _error, variables) => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId, 'detail', variables.recipeId],
        });
        queryClient.invalidateQueries({
          queryKey: [...RECIPE_SUGGESTIONS_QUERY_KEY, userId],
        });
      }
    },
  });
}

/**
 * Hook to replace all steps of a recipe
 */
export function useReplaceRecipeSteps() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation<
    RecipeStep[],
    Error,
    { recipeId: string; steps: CreateRecipeInput['steps'] }
  >({
    mutationFn: ({ recipeId, steps }) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseRecipesManagementApi.replaceSteps(recipeId, steps, userId);
    },
    onSettled: (_data, _error, variables) => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId, 'detail', variables.recipeId],
        });
        queryClient.invalidateQueries({
          queryKey: [...RECIPE_SUGGESTIONS_QUERY_KEY, userId],
        });
      }
    },
  });
}

/**
 * Hook to duplicate a recipe
 */
export function useDuplicateRecipe() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation<RecipeDetail, Error, string>({
    mutationFn: (recipeId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseRecipesManagementApi.duplicate(recipeId, userId);
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
        });
        queryClient.invalidateQueries({
          queryKey: [...RECIPE_SUGGESTIONS_QUERY_KEY, userId],
        });
      }
    },
  });
}

/**
 * Hook to soft-delete a recipe with optimistic update
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (recipeId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseRecipesManagementApi.delete(recipeId, userId);
    },
    onMutate: async (deletedId) => {
      if (!userId) return;

      await queryClient.cancelQueries({
        queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
      });

      const previousQueries = queryClient.getQueriesData<Recipe[]>({
        queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
        exact: false,
      });

      // Optimistically remove from list
      queryClient.setQueriesData<Recipe[]>(
        { queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId], exact: false },
        (old) => old?.filter((item) => item.id !== deletedId) ?? [],
      );

      return { previousQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [...RECIPES_MANAGEMENT_QUERY_KEY, userId],
        });
        queryClient.invalidateQueries({
          queryKey: [...RECIPE_SUGGESTIONS_QUERY_KEY, userId],
        });
      }
    },
  });
}
