// Types
export * from './types';

// API
export { 
  foodItemsApi, 
  mockFoodItemsApi, 
  supabaseFoodItemsApi,
  type IFoodItemsApi,
} from './food-items.api';

export { categoriesApi, storageLocationsApi } from './settings.api';

// OpenFoodFacts API
export {
  openFoodFactsApi,
  useProductByBarcode,
  prefetchProduct,
  OPENFOODFACTS_QUERY_KEY,
  type IOpenFoodFactsApi,
  type ScannedProductData,
  type OpenFoodFactsProduct,
} from './openfoodfacts';

// Query hooks
export { useFoodItems, useFoodItem, FOOD_ITEMS_QUERY_KEY } from './use-food-items';

// Mutation hooks
export { useAddFoodItem, useUpdateFoodItem, useDeleteFoodItem } from './use-food-mutations';

// Shopping list
export {
  shoppingListApi,
  type IShoppingListApi,
} from './shopping-list.api';

export { useShoppingList, useShoppingListItem, SHOPPING_LIST_QUERY_KEY } from './use-shopping-list';

export {
  useAddShoppingListItem,
  useUpdateShoppingListItem,
  useToggleShoppingItemChecked,
  useDeleteShoppingListItem,
  useDeleteCheckedItems,
  useMovePurchasedToInventory,
} from './use-shopping-list-mutations';

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
} from './use-settings';

// Recipe Management
export {
  recipesManagementApi,
  normalizeIngredientName,
  type IRecipesManagementApi,
} from './recipes-management.api';

export { useRecipesList, useRecipeById, RECIPES_MANAGEMENT_QUERY_KEY } from './use-recipes-management';

export {
  useCreateRecipe,
  useUpdateRecipe,
  useReplaceRecipeIngredients,
  useReplaceRecipeSteps,
  useDuplicateRecipe,
  useDeleteRecipe,
} from './use-recipes-management-mutations';

// Recipe Suggestions
export {
  useRecipeSuggestions,
  useRecipeSuggestionDetail,
  RECIPE_SUGGESTIONS_QUERY_KEY,
} from './use-recipe-suggestions';

export { useAddMissingToShoppingList } from './use-recipe-suggestion-mutations';

export { matchRecipes, getTopExpiringIngredient, normalizeForMatching } from './recipe-matcher';

// Food Diary
export * from './diary';
