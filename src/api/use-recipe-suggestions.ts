import { useQuery } from '@tanstack/react-query';
import { recipesManagementApi } from './recipes-management.api';
import { foodItemsApi } from './food-items.api';
import { matchRecipes, getTopExpiringIngredient } from './recipe-matcher';
import { SEED_RECIPES } from './recipe-seed-data';
import { useAuthStore } from '@/store';
import type {
  RecipeDetail,
  RecipeSuggestionItem,
  RecipeSuggestionFilters,
} from './types';

export const RECIPE_SUGGESTIONS_QUERY_KEY = ['recipe-suggestions'] as const;

/**
 * Fetch all recipes with full details (ingredients + steps) for matching.
 * Falls back to seed data when no recipes exist in the system.
 */
async function fetchAllRecipeDetails(userId: string): Promise<RecipeDetail[]> {
  const recipes = await recipesManagementApi.list(userId);

  if (recipes.length === 0) {
    // Use seed recipes when no recipes exist
    return SEED_RECIPES;
  }

  // Fetch full details for each recipe (ingredients + steps needed for matching)
  const details = await Promise.all(
    recipes.map((r) => recipesManagementApi.getById(r.id, userId)),
  );

  const result = details.filter((d): d is RecipeDetail => d !== null);

  // Also include seed recipes if they're not already in the DB
  const existingIds = new Set(result.map((r) => r.id));
  const missingSeedRecipes = SEED_RECIPES.filter((sr) => !existingIds.has(sr.id));

  return [...result, ...missingSeedRecipes];
}

/**
 * Apply client-side filters to suggestion results.
 */
function applyFilters(
  items: RecipeSuggestionItem[],
  filters: RecipeSuggestionFilters,
): RecipeSuggestionItem[] {
  let result = items;

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      (item) =>
        item.recipe.title.toLowerCase().includes(search) ||
        item.recipe.description?.toLowerCase().includes(search) ||
        item.recipe.tags.some((t) => t.toLowerCase().includes(search)),
    );
  }

  if (filters.maxCookTimeMinutes) {
    result = result.filter(
      (item) => item.recipe.cookTimeMinutes <= filters.maxCookTimeMinutes!,
    );
  }

  if (filters.tags?.length) {
    result = result.filter((item) =>
      filters.tags!.some((tag) => item.recipe.tags.includes(tag)),
    );
  }

  if (filters.difficulty && filters.difficulty !== 'all') {
    result = result.filter(
      (item) => item.recipe.difficulty === filters.difficulty,
    );
  }

  if (filters.suggestedOnly) {
    // Only show recipes with at least one matched ingredient
    result = result.filter(
      (item) => item.suggestion.matchedIngredients.length > 0,
    );
  }

  return result;
}

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

      // Fetch recipes and inventory in parallel
      const [recipes, inventory] = await Promise.all([
        fetchAllRecipeDetails(userId),
        foodItemsApi.getAll(userId),
      ]);

      // Run matching engine
      const suggestions = matchRecipes(recipes, inventory);

      // Apply filters
      const filtered = applyFilters(suggestions, filters);

      // Compute hero data
      const topExpiring = getTopExpiringIngredient(filtered, inventory);

      return {
        suggestions: filtered,
        topExpiring,
        totalRecipes: recipes.length,
        totalInventoryItems: inventory.length,
      };
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

      // Check seed recipes first
      const seedRecipe = SEED_RECIPES.find((r) => r.id === recipeId);
      if (seedRecipe) return seedRecipe;

      return recipesManagementApi.getById(recipeId, userId);
    },
    enabled: !!recipeId && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
