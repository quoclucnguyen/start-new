import {
  mockFoodItemsApi,
  supabaseFoodItemsApi,
  type IFoodItemsApi,
} from '@/pages/inventory/api/food-items.api';
import {
  mockRecipesManagementApi,
  supabaseRecipesManagementApi,
  type IRecipesManagementApi,
} from './recipes-management.api';
import { getTopExpiringIngredient, matchRecipes } from './recipe-matcher';
import { getDaysUntilExpiry } from '@/api/types';
import type {
  FoodItem,
  RecipeDetail,
  RecipeSuggestionFilters,
  RecipeSuggestionItem,
  RecipeSuggestionsResult,
} from '@/api/types';

export interface IRecipeSuggestionsApi {
  list(userId: string, filters?: RecipeSuggestionFilters): Promise<RecipeSuggestionsResult>;
  getRecipeDetail(recipeId: string, userId: string): Promise<RecipeDetail | null>;
}

function compareInventoryByExpiryPriority(a: FoodItem, b: FoodItem): number {
  const aDays = getDaysUntilExpiry(a.expiryDate);
  const bDays = getDaysUntilExpiry(b.expiryDate);

  if (aDays === null && bDays === null) {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }

  if (aDays === null) return 1;
  if (bDays === null) return -1;

  if (aDays !== bDays) {
    return aDays - bDays;
  }

  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function sortInventoryForSuggestions(items: FoodItem[]): FoodItem[] {
  return [...items].sort(compareInventoryByExpiryPriority);
}

async function fetchAllRecipeDetails(
  recipesApi: IRecipesManagementApi,
): Promise<RecipeDetail[]> {
  const recipes = await recipesApi.list();

  const details = await Promise.all(
    recipes.map((recipe) => recipesApi.getById(recipe.id)),
  );
  return details.filter((detail): detail is RecipeDetail => detail !== null);
}

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
        item.recipe.tags.some((tag) => tag.toLowerCase().includes(search)),
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
    result = result.filter(
      (item) => item.suggestion.matchedIngredients.length > 0,
    );
  }

  return result;
}

function createRecipeSuggestionsApi(
  recipesApi: IRecipesManagementApi,
  inventoryApi: Pick<IFoodItemsApi, 'getAll'>,
): IRecipeSuggestionsApi {
  return {
    async list(
      userId: string,
      filters: RecipeSuggestionFilters = {},
    ): Promise<RecipeSuggestionsResult> {
      const [recipes, inventory] = await Promise.all([
        fetchAllRecipeDetails(recipesApi),
        inventoryApi.getAll(userId),
      ]);

      const sortedInventory = sortInventoryForSuggestions(inventory);
      const suggestions = matchRecipes(recipes, sortedInventory);
      const filteredSuggestions = applyFilters(suggestions, filters);

      return {
        suggestions: filteredSuggestions,
        topExpiring: getTopExpiringIngredient(filteredSuggestions, sortedInventory),
        totalRecipes: recipes.length,
        totalInventoryItems: sortedInventory.length,
      };
    },

    async getRecipeDetail(recipeId: string, userId: string): Promise<RecipeDetail | null> {
      void userId;
      return recipesApi.getById(recipeId);
    },
  };
}

export const supabaseRecipeSuggestionsApi = createRecipeSuggestionsApi(
  supabaseRecipesManagementApi,
  supabaseFoodItemsApi,
);

export const mockRecipeSuggestionsApi = createRecipeSuggestionsApi(
  mockRecipesManagementApi,
  mockFoodItemsApi,
);
