import {
  mockFoodItemsApi,
  supabaseFoodItemsApi,
  type IFoodItemsApi,
} from './food-items.api';
import {
  mockRecipesManagementApi,
  supabaseRecipesManagementApi,
  type IRecipesManagementApi,
} from './recipes-management.api';
import { SEED_RECIPES } from './recipe-seed-data';
import { getTopExpiringIngredient, matchRecipes } from './recipe-matcher';
import { getDaysUntilExpiry } from './types';
import type {
  FoodItem,
  RecipeDetail,
  RecipeSuggestionFilters,
  RecipeSuggestionItem,
  RecipeSuggestionsResult,
} from './types';

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
  userId: string,
): Promise<RecipeDetail[]> {
  const recipes = await recipesApi.list(userId);

  if (recipes.length === 0) {
    return SEED_RECIPES;
  }

  const details = await Promise.all(
    recipes.map((recipe) => recipesApi.getById(recipe.id, userId)),
  );
  const resolved = details.filter((detail): detail is RecipeDetail => detail !== null);

  const existingIds = new Set(resolved.map((recipe) => recipe.id));
  const missingSeedRecipes = SEED_RECIPES.filter((recipe) => !existingIds.has(recipe.id));

  return [...resolved, ...missingSeedRecipes];
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
        fetchAllRecipeDetails(recipesApi, userId),
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
      const seedRecipe = SEED_RECIPES.find((recipe) => recipe.id === recipeId);
      if (seedRecipe) {
        return seedRecipe;
      }

      return recipesApi.getById(recipeId, userId);
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

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const recipeSuggestionsApi: IRecipeSuggestionsApi = USE_MOCK_API
  ? mockRecipeSuggestionsApi
  : supabaseRecipeSuggestionsApi;
