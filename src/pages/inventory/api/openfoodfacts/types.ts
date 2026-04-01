/**
 * OpenFoodFacts API Response Types
 * @see https://openfoodfacts.github.io/openfoodfacts-server/api/
 */

export interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
  quantity?: string; // e.g., "500g", "1L"
  image_url?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  image_front_thumb_url?: string;
  nutriscore_grade?: string; // 'a' | 'b' | 'c' | 'd' | 'e'
  nova_group?: number; // 1-4 (food processing level)
  ingredients_text?: string;
  allergens?: string;
  labels?: string;
  stores?: string;
  countries?: string;
  // Nutriments per 100g
  nutriments?: {
    energy_kcal_100g?: number;
    fat_100g?: number;
    saturated_fat_100g?: number;
    carbohydrates_100g?: number;
    sugars_100g?: number;
    proteins_100g?: number;
    salt_100g?: number;
    fiber_100g?: number;
  };
}

export interface OpenFoodFactsResponse {
  code: string;
  status: 0 | 1; // 0 = not found, 1 = found
  status_verbose: string;
  product?: OpenFoodFactsProduct;
}

/**
 * Simplified product data for our app
 */
export interface ScannedProductData {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  quantity?: string;
  suggestedCategory?: string;
  raw?: OpenFoodFactsProduct;
}

/**
 * Cache entry for OpenFoodFacts products
 */
export interface CachedProductEntry {
  data: ScannedProductData | null;
  timestamp: number;
  expiresAt: number;
}
