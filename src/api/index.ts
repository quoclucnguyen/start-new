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
