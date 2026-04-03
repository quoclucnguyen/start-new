import { getSupabaseClient } from '@/lib/supabaseClient';
import type {
  FoodItem,
  CreateFoodItemInput,
  UpdateFoodItemInput,
  DbFoodItem,
  FoodCategory,
  StorageLocation,
  QuantityUnit,
} from '@/api/types';

/**
 * Abstract API interface for food items.
 * This allows swapping between mock and real implementations.
 */
export interface IFoodItemsApi {
  getAll(): Promise<FoodItem[]>;
  getById(id: string): Promise<FoodItem | null>;
  create(input: CreateFoodItemInput, userId: string): Promise<FoodItem>;
  update(input: UpdateFoodItemInput): Promise<FoodItem>;
  delete(id: string): Promise<void>;
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
    category: (row.category as FoodCategory) || 'Other',
    storage: (row.storage as StorageLocation) || 'Pantry',
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
  async getAll(): Promise<FoodItem[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('deleted', false)
      .order('expiration_date', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Supabase getAll error:', error);
      throw new Error(error.message);
    }

    return (data as DbFoodItem[]).map(mapDbToFoodItem);
  },

  async getById(id: string): Promise<FoodItem | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('id', id)
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

  async update(input: UpdateFoodItemInput): Promise<FoodItem> {
    const supabase = getSupabaseClient();

    const dbRow = mapUpdateInputToDb(input);

    const { data, error } = await supabase
      .from('food_items')
      .update(dbRow)
      .eq('id', input.id)
      .eq('deleted', false)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Food item with id ${input.id} not found or access denied`);
      }
      console.error('Supabase update error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Food item with id ${input.id} not found`);
    }

    return mapDbToFoodItem(data as DbFoodItem);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();

    // Soft delete: set deleted = true instead of actually deleting
    const { data, error } = await supabase
      .from('food_items')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('deleted', false)
      .select('id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Food item with id ${id} not found or access denied`);
      }
      console.error('Supabase delete error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Food item with id ${id} not found or access denied`);
    }
  },
};
