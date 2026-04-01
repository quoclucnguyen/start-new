// Types (shared, stays here)
export * from './types';

// ============================================================================
// Inventory API (moved to pages/inventory/api)
// ============================================================================
export {
  mockFoodItemsApi,
  supabaseFoodItemsApi,
  type IFoodItemsApi,
} from '@/pages/inventory/api/food-items.api';

export { categoriesApi, storageLocationsApi } from '@/pages/inventory/api/settings.api';

// OpenFoodFacts API
export {
  openFoodFactsApi,
  useProductByBarcode,
  prefetchProduct,
  OPENFOODFACTS_QUERY_KEY,
  type IOpenFoodFactsApi,
  type ScannedProductData,
  type OpenFoodFactsProduct,
} from '@/pages/inventory/api/openfoodfacts';

// Query hooks
export { useFoodItems, useFoodItem, FOOD_ITEMS_QUERY_KEY } from '@/pages/inventory/api/use-food-items';

// Mutation hooks
export { useAddFoodItem, useUpdateFoodItem, useDeleteFoodItem } from '@/pages/inventory/api/use-food-mutations';

// Settings hooks
export {
  useCategories,
  useStorageLocations,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  useAddStorageLocation,
  useUpdateStorageLocation,
  useDeleteStorageLocation,
  useReorderStorageLocations,
  CATEGORIES_QUERY_KEY,
  STORAGE_LOCATIONS_QUERY_KEY,
} from '@/pages/inventory/api/use-settings';

// ============================================================================
// Shopping API (moved to pages/shopping/api)
// ============================================================================
export {
  mockShoppingListApi,
  supabaseShoppingListApi,
  type IShoppingListApi,
} from '@/pages/shopping/api/shopping-list.api';

export { useShoppingList, useShoppingListItem, SHOPPING_LIST_QUERY_KEY } from '@/pages/shopping/api/use-shopping-list';

export {
  useAddShoppingListItem,
  useUpdateShoppingListItem,
  useToggleShoppingItemChecked,
  useDeleteShoppingListItem,
  useDeleteCheckedItems,
  useMovePurchasedToInventory,
} from '@/pages/shopping/api/use-shopping-list-mutations';

// ============================================================================
// Recipes API (moved to pages/recipes/api)
// ============================================================================
export {
  mockRecipesManagementApi,
  supabaseRecipesManagementApi,
  normalizeIngredientName,
  type IRecipesManagementApi,
} from '@/pages/recipes/api/recipes-management.api';

export { useRecipesList, useRecipeById, RECIPES_MANAGEMENT_QUERY_KEY } from '@/pages/recipes/api/use-recipes-management';

export {
  useCreateRecipe,
  useUpdateRecipe,
  useReplaceRecipeIngredients,
  useReplaceRecipeSteps,
  useDuplicateRecipe,
  useDeleteRecipe,
} from '@/pages/recipes/api/use-recipes-management-mutations';

export {
  mockRecipeSuggestionsApi,
  supabaseRecipeSuggestionsApi,
  type IRecipeSuggestionsApi,
} from '@/pages/recipes/api/recipe-suggestions.api';

export {
  useRecipeSuggestions,
  useRecipeSuggestionDetail,
  RECIPE_SUGGESTIONS_QUERY_KEY,
} from '@/pages/recipes/api/use-recipe-suggestions';

export { useAddMissingToShoppingList } from '@/pages/recipes/api/use-recipe-suggestion-mutations';

export { matchRecipes, getTopExpiringIngredient, normalizeForMatching } from '@/pages/recipes/api/recipe-matcher';

// Food Diary (moved to diary route)
export * from '@/pages/diary/api';
