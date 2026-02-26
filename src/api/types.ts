// Changed from union types to string to support user-configurable categories/locations
export type StorageLocation = string;
export type FoodCategory = string;
export type QuantityUnit = 'pieces' | 'kg' | 'g' | 'l' | 'ml' | 'bottles' | 'packs';
export type ExpiryStatus = 'expiring' | 'soon' | 'good' | 'fresh';

// ============================================================================
// Category & Storage Location Configuration Types
// ============================================================================

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // hex color
  showInFilters: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface StorageLocationConfig {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // hex color
  showInFilters: boolean;
  sortOrder: number;
  createdAt?: string;
}

// Database row types (snake_case)
export interface DbCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  show_in_filters: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbStorageLocation {
  id: string;
  name: string;
  icon: string;
  color: string;
  show_in_filters: boolean;
  sort_order: number;
  created_at: string;
}

// ============================================================================
// Food Item Types
// ============================================================================

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  storage: StorageLocation;
  expiryDate: string | null; // ISO date string (YYYY-MM-DD)
  quantity: number;
  unit: QuantityUnit;
  notes?: string;
  imageUrl?: string;
  purchaseDate?: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

/**
 * Database row type for food_items table (snake_case)
 */
export interface DbFoodItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  expiration_date: string | null;
  category: string | null;
  storage: string | null;
  image_url: string | null;
  created_at: string;
  purchase_date: string | null;
  notes: string | null;
  updated_at: string;
  last_modified: string;
  deleted: boolean;
  synced: boolean;
}

export interface CreateFoodItemInput {
  name: string;
  category: FoodCategory;
  storage: StorageLocation;
  expiryDate: string | null;
  quantity: number;
  unit: QuantityUnit;
  notes?: string;
  imageUrl?: string;
  purchaseDate?: string;
}

export interface UpdateFoodItemInput {
  id: string;
  name?: string;
  category?: FoodCategory;
  storage?: StorageLocation;
  expiryDate?: string | null;
  quantity?: number;
  unit?: QuantityUnit;
  notes?: string;
  imageUrl?: string;
  purchaseDate?: string;
}

// ============================================================================
// Shopping List Types
// ============================================================================

export interface ShoppingListItem {
  id: string;
  userId: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: QuantityUnit;
  notes?: string;
  checked: boolean;
  linkedFoodItemId?: string;
  createdAt: string;
  updatedAt: string;
  purchasedAt?: string;
}

export interface CreateShoppingListItemInput {
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: QuantityUnit;
  notes?: string;
  linkedFoodItemId?: string;
}

export interface UpdateShoppingListItemInput {
  id: string;
  name?: string;
  category?: FoodCategory;
  quantity?: number;
  unit?: QuantityUnit;
  notes?: string;
  checked?: boolean;
  linkedFoodItemId?: string;
}

/**
 * Database row type for shopping_list table (snake_case)
 */
export interface DbShoppingListItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string | null;
  checked: boolean;
  linked_food_item_id: string | null;
  created_at: string;
  updated_at: string;
  last_modified: string;
  purchased_at: string | null;
  deleted: boolean;
  synced: boolean;
}

// ============================================================================
// Recipe Management Types
// ============================================================================

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeVisibility = 'private' | 'shared';
export type RecipeSource = 'system' | 'user';

export interface Recipe {
  id: string;
  userId: string | null;         // null for system recipes
  title: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes: number;
  prepTimeMinutes?: number;
  servings: number;
  difficulty: RecipeDifficulty;
  tags: string[];
  visibility: RecipeVisibility;
  source: RecipeSource;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  name: string;
  normalizedName: string;
  quantity?: number;
  unit?: string;
  optional: boolean;
  sortOrder: number;
}

export interface RecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  instruction: string;
  estimatedMinutes?: number;
}

export interface RecipeDetail extends Recipe {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface CreateRecipeInput {
  title: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes: number;
  prepTimeMinutes?: number;
  servings: number;
  difficulty: RecipeDifficulty;
  tags?: string[];
  visibility?: RecipeVisibility;
  ingredients: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    optional?: boolean;
  }>;
  steps: Array<{
    instruction: string;
    estimatedMinutes?: number;
  }>;
}

export interface UpdateRecipeInput {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes?: number;
  prepTimeMinutes?: number;
  servings?: number;
  difficulty?: RecipeDifficulty;
  tags?: string[];
  visibility?: RecipeVisibility;
}

// Database row types for recipes (snake_case)
export interface DbRecipe {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  cook_time_minutes: number;
  prep_time_minutes: number | null;
  servings: number;
  difficulty: string;
  tags: string[] | null;
  visibility: string;
  source: string;
  created_at: string;
  updated_at: string;
  last_modified: string;
  deleted: boolean;
  synced: boolean;
}

export interface DbRecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  normalized_name: string;
  quantity: number | null;
  unit: string | null;
  optional: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbRecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  estimated_minutes: number | null;
  created_at: string;
}

// ============================================================================
// Expiry Helpers
// ============================================================================

// Helper function to calculate expiry status from date
export function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return 'fresh';
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'expiring';
  if (diffDays <= 3) return 'soon';
  if (diffDays <= 7) return 'good';
  return 'fresh';
}

// Helper function to get days until expiry
export function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Helper to format expiry text
export function getExpiryText(expiryDate: string | null): string {
  if (!expiryDate) return 'No expiry date';
  
  const days = getDaysUntilExpiry(expiryDate);
  if (days === null) return 'No expiry date';
  
  if (days < 0) return `Expired ${Math.abs(days)} days ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires in 1 day';
  return `Expires in ${days} days`;
}
