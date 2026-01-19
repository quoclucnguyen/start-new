// Types
export * from './types';

// API
export { 
  foodItemsApi, 
  mockFoodItemsApi, 
  supabaseFoodItemsApi,
  type IFoodItemsApi,
} from './food-items.api';

// Query hooks
export { useFoodItems, useFoodItem, FOOD_ITEMS_QUERY_KEY } from './use-food-items';

// Mutation hooks
export { useAddFoodItem, useUpdateFoodItem, useDeleteFoodItem } from './use-food-mutations';
