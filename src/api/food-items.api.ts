import { getSupabaseClient } from '@/lib/supabaseClient';
import type { 
  FoodItem, 
  CreateFoodItemInput, 
  UpdateFoodItemInput, 
  DbFoodItem,
  FoodCategory,
  StorageLocation,
  QuantityUnit,
} from './types';

/**
 * Abstract API interface for food items.
 * This allows swapping between mock and real implementations.
 */
export interface IFoodItemsApi {
  getAll(userId: string): Promise<FoodItem[]>;
  getById(id: string, userId: string): Promise<FoodItem | null>;
  create(input: CreateFoodItemInput, userId: string): Promise<FoodItem>;
  update(input: UpdateFoodItemInput, userId: string): Promise<FoodItem>;
  delete(id: string, userId: string): Promise<void>;
}

// ============================================================================
// Mapper functions: Convert between DB (snake_case) and Frontend (camelCase)
// ============================================================================

/**
 * Map database row to frontend FoodItem type
 */
function mapDbToFoodItem(row: DbFoodItem): FoodItem {
  return {
    id: row.id,
    name: row.name,
    category: (row.category as FoodCategory) || 'other',
    storage: (row.storage as StorageLocation) || 'pantry',
    expiryDate: row.expiration_date,
    quantity: Number(row.quantity),
    unit: (row.unit as QuantityUnit) || 'pieces',
    notes: row.notes ?? undefined,
    imageUrl: row.image_url ?? undefined,
    purchaseDate: row.purchase_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Map frontend CreateFoodItemInput to database insert row
 */
function mapCreateInputToDb(
  input: CreateFoodItemInput, 
  userId: string
): Omit<DbFoodItem, 'id' | 'created_at' | 'updated_at' | 'last_modified' | 'deleted' | 'synced'> {
  return {
    user_id: userId,
    name: input.name,
    category: input.category,
    storage: input.storage,
    quantity: input.quantity,
    unit: input.unit,
    expiration_date: input.expiryDate,
    notes: input.notes ?? null,
    image_url: input.imageUrl ?? null,
    purchase_date: input.purchaseDate ?? null,
  };
}

/**
 * Map frontend UpdateFoodItemInput to database update row
 */
function mapUpdateInputToDb(
  input: UpdateFoodItemInput
): Partial<DbFoodItem> {
  const dbRow: Partial<DbFoodItem> = {
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  };

  if (input.name !== undefined) dbRow.name = input.name;
  if (input.category !== undefined) dbRow.category = input.category;
  if (input.storage !== undefined) dbRow.storage = input.storage;
  if (input.quantity !== undefined) dbRow.quantity = input.quantity;
  if (input.unit !== undefined) dbRow.unit = input.unit;
  if (input.expiryDate !== undefined) dbRow.expiration_date = input.expiryDate;
  if (input.notes !== undefined) dbRow.notes = input.notes ?? null;
  if (input.imageUrl !== undefined) dbRow.image_url = input.imageUrl ?? null;
  if (input.purchaseDate !== undefined) dbRow.purchase_date = input.purchaseDate ?? null;

  return dbRow;
}

// ============================================================================
// Supabase API Implementation
// ============================================================================

/**
 * Supabase implementation of the food items API
 */
export const supabaseFoodItemsApi: IFoodItemsApi = {
  async getAll(userId: string): Promise<FoodItem[]> {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false)
      .order('expiration_date', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Supabase getAll error:', error);
      throw new Error(error.message);
    }

    return (data as DbFoodItem[]).map(mapDbToFoodItem);
  },

  async getById(id: string, userId: string): Promise<FoodItem | null> {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Supabase getById error:', error);
      throw new Error(error.message);
    }

    return data ? mapDbToFoodItem(data as DbFoodItem) : null;
  },

  async create(input: CreateFoodItemInput, userId: string): Promise<FoodItem> {
    const supabase = getSupabaseClient();
    
    const dbRow = mapCreateInputToDb(input, userId);
    
    const { data, error } = await supabase
      .from('food_items')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error('Supabase create error:', error);
      throw new Error(error.message);
    }

    return mapDbToFoodItem(data as DbFoodItem);
  },

  async update(input: UpdateFoodItemInput, userId: string): Promise<FoodItem> {
    const supabase = getSupabaseClient();
    
    const dbRow = mapUpdateInputToDb(input);
    
    const { data, error } = await supabase
      .from('food_items')
      .update(dbRow)
      .eq('id', input.id)
      .eq('user_id', userId)
      .eq('deleted', false)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Food item with id ${input.id} not found`);
    }

    return mapDbToFoodItem(data as DbFoodItem);
  },

  async delete(id: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    
    // Soft delete: set deleted = true instead of actually deleting
    const { error } = await supabase
      .from('food_items')
      .update({ 
        deleted: true, 
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(error.message);
    }
  },
};

// ============================================================================
// Mock Implementation (for development/testing)
// ============================================================================

// Storage key for localStorage
const STORAGE_KEY = 'food-inventory-items';

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Simulated network delay
function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get items from localStorage
function getStoredItems(): FoodItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save items to localStorage
function saveItems(items: FoodItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Mock implementation using localStorage (for development without Supabase)
 */
export const mockFoodItemsApi: IFoodItemsApi = {
  async getAll(_userId: string): Promise<FoodItem[]> {
    await delay();
    return getStoredItems();
  },

  async getById(id: string, _userId: string): Promise<FoodItem | null> {
    await delay();
    const items = getStoredItems();
    return items.find(item => item.id === id) || null;
  },

  async create(input: CreateFoodItemInput, _userId: string): Promise<FoodItem> {
    await delay();
    const now = new Date().toISOString();
    const newItem: FoodItem = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    const items = getStoredItems();
    items.push(newItem);
    saveItems(items);
    
    return newItem;
  },

  async update(input: UpdateFoodItemInput, _userId: string): Promise<FoodItem> {
    await delay();
    const items = getStoredItems();
    const index = items.findIndex(item => item.id === input.id);
    
    if (index === -1) {
      throw new Error(`Food item with id ${input.id} not found`);
    }
    
    const updatedItem: FoodItem = {
      ...items[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    items[index] = updatedItem;
    saveItems(items);
    
    return updatedItem;
  },

  async delete(id: string, _userId: string): Promise<void> {
    await delay();
    const items = getStoredItems();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      throw new Error(`Food item with id ${id} not found`);
    }
    
    saveItems(filteredItems);
  },
};

// ============================================================================
// Export active implementation
// ============================================================================

// Use environment variable to switch between mock and Supabase
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const foodItemsApi: IFoodItemsApi = USE_MOCK_API 
  ? mockFoodItemsApi 
  : supabaseFoodItemsApi;
