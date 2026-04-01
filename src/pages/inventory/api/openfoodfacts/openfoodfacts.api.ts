import type { OpenFoodFactsResponse, OpenFoodFactsProduct, ScannedProductData } from './types';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

// Category mapping from OpenFoodFacts categories to our app categories
const CATEGORY_MAPPING: Record<string, string> = {
  // Fruits
  'en:fruits': 'fruits',
  'en:fresh-fruits': 'fruits',
  'en:tropical-fruits': 'fruits',
  'en:citrus': 'fruits',
  'en:berries': 'fruits',
  // Vegetables
  'en:vegetables': 'vegetables',
  'en:fresh-vegetables': 'vegetables',
  'en:leafy-vegetables': 'vegetables',
  'en:root-vegetables': 'vegetables',
  // Dairy
  'en:dairies': 'dairy',
  'en:milk': 'dairy',
  'en:cheeses': 'dairy',
  'en:yogurts': 'dairy',
  'en:butter': 'dairy',
  // Meat & Proteins
  'en:meats': 'meat',
  'en:beef': 'meat',
  'en:pork': 'meat',
  'en:poultry': 'meat',
  'en:fish': 'meat',
  'en:seafood': 'meat',
  'en:eggs': 'meat',
  // Drinks
  'en:beverages': 'drinks',
  'en:waters': 'drinks',
  'en:juices': 'drinks',
  'en:sodas': 'drinks',
  'en:alcoholic-beverages': 'drinks',
  // Pantry items
  'en:cereals': 'pantry',
  'en:breads': 'pantry',
  'en:pasta': 'pantry',
  'en:rice': 'pantry',
  'en:canned-foods': 'pantry',
  'en:snacks': 'pantry',
  'en:sauces': 'pantry',
  'en:condiments': 'pantry',
  'en:oils': 'pantry',
  // Frozen
  'en:frozen-foods': 'frozen',
  'en:ice-creams': 'frozen',
};

/**
 * Map OpenFoodFacts category tags to our app category
 */
function mapCategory(categoryTags?: string[]): string | undefined {
  if (!categoryTags || categoryTags.length === 0) return undefined;
  
  for (const tag of categoryTags) {
    const mapped = CATEGORY_MAPPING[tag];
    if (mapped) return mapped;
  }
  
  // Try partial matching for common patterns
  const tagString = categoryTags.join(' ').toLowerCase();
  if (tagString.includes('fruit')) return 'fruits';
  if (tagString.includes('vegetable') || tagString.includes('legume')) return 'vegetables';
  if (tagString.includes('dairy') || tagString.includes('milk') || tagString.includes('cheese')) return 'dairy';
  if (tagString.includes('meat') || tagString.includes('fish') || tagString.includes('poultry')) return 'meat';
  if (tagString.includes('beverage') || tagString.includes('drink') || tagString.includes('juice')) return 'drinks';
  if (tagString.includes('frozen')) return 'frozen';
  
  return undefined;
}

/**
 * Transform OpenFoodFacts product to our simplified format
 */
function transformProduct(product: OpenFoodFactsProduct, barcode: string): ScannedProductData {
  const name = product.product_name || product.product_name_en || product.brands || 'Unknown Product';
  
  return {
    barcode,
    name: name.trim(),
    brand: product.brands?.split(',')[0]?.trim(),
    imageUrl: product.image_front_url || product.image_url,
    quantity: product.quantity,
    suggestedCategory: mapCategory(product.categories_tags),
    raw: product,
  };
}

export interface IOpenFoodFactsApi {
  getByBarcode(barcode: string): Promise<ScannedProductData | null>;
}

/**
 * OpenFoodFacts API client
 */
export const openFoodFactsApi: IOpenFoodFactsApi = {
  async getByBarcode(barcode: string): Promise<ScannedProductData | null> {
    // Clean barcode (remove any non-numeric characters)
    const cleanBarcode = barcode.replaceAll(/\D/g, '');
    
    if (!cleanBarcode) {
      throw new Error('Invalid barcode');
    }

    const url = `${BASE_URL}/product/${cleanBarcode}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'FoodInventoryTracker/1.0 (https://github.com/food-inventory)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`OpenFoodFacts API error: ${response.status}`);
    }

    const data: OpenFoodFactsResponse = await response.json();

    if (data.status === 0 || !data.product) {
      return null;
    }

    return transformProduct(data.product, cleanBarcode);
  },
};
