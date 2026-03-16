import { getSupabaseClient } from '@/lib/supabaseClient';
import type {
  ShoppingListItem,
  CreateShoppingListItemInput,
  UpdateShoppingListItemInput,
  DbShoppingListItem,
  FoodCategory,
  QuantityUnit,
} from './types';

/**
 * Abstract API interface for shopping list items.
 */
export interface IShoppingListApi {
  getAll(userId: string): Promise<ShoppingListItem[]>;
  getById(id: string, userId: string): Promise<ShoppingListItem | null>;
  create(input: CreateShoppingListItemInput, userId: string): Promise<ShoppingListItem>;
  update(input: UpdateShoppingListItemInput, userId: string): Promise<ShoppingListItem>;
  delete(id: string, userId: string): Promise<void>;
  deleteChecked(userId: string): Promise<void>;
  uncheckAll(userId: string): Promise<void>;
}

// ============================================================================
// Mapper functions: Convert between DB (snake_case) and Frontend (camelCase)
// ============================================================================

function mapDbToShoppingListItem(row: DbShoppingListItem): ShoppingListItem {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category as FoodCategory,
    quantity: Number(row.quantity),
    unit: (row.unit as QuantityUnit) || 'pieces',
    notes: row.notes ?? undefined,
    checked: row.checked,
    linkedFoodItemId: row.linked_food_item_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    purchasedAt: row.purchased_at ?? undefined,
  };
}

function mapCreateInputToDb(
  input: CreateShoppingListItemInput,
  userId: string,
): Omit<DbShoppingListItem, 'id' | 'created_at' | 'updated_at' | 'last_modified' | 'purchased_at' | 'deleted' | 'synced'> {
  return {
    user_id: userId,
    name: input.name,
    category: input.category,
    quantity: input.quantity,
    unit: input.unit,
    notes: input.notes ?? null,
    checked: false,
    linked_food_item_id: input.linkedFoodItemId ?? null,
  };
}

function mapUpdateInputToDb(input: UpdateShoppingListItemInput): Partial<DbShoppingListItem> {
  const dbRow: Partial<DbShoppingListItem> = {
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  };

  if (input.name !== undefined) dbRow.name = input.name;
  if (input.category !== undefined) dbRow.category = input.category;
  if (input.quantity !== undefined) dbRow.quantity = input.quantity;
  if (input.unit !== undefined) dbRow.unit = input.unit;
  if (input.notes !== undefined) dbRow.notes = input.notes ?? null;
  if (input.checked !== undefined) dbRow.checked = input.checked;
  if (input.linkedFoodItemId !== undefined) dbRow.linked_food_item_id = input.linkedFoodItemId ?? null;

  return dbRow;
}

// ============================================================================
// Supabase API Implementation
// ============================================================================

export const supabaseShoppingListApi: IShoppingListApi = {
  async getAll(userId: string): Promise<ShoppingListItem[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false)
      .order('checked', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Shopping list getAll error:', error);
      throw new Error(error.message);
    }

    return (data as DbShoppingListItem[]).map(mapDbToShoppingListItem);
  },

  async getById(id: string, userId: string): Promise<ShoppingListItem | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Shopping list getById error:', error);
      throw new Error(error.message);
    }

    return data ? mapDbToShoppingListItem(data as DbShoppingListItem) : null;
  },

  async create(input: CreateShoppingListItemInput, userId: string): Promise<ShoppingListItem> {
    const supabase = getSupabaseClient();

    const dbRow = mapCreateInputToDb(input, userId);

    const { data, error } = await supabase
      .from('shopping_list')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error('Shopping list create error:', error);
      throw new Error(error.message);
    }

    return mapDbToShoppingListItem(data as DbShoppingListItem);
  },

  async update(input: UpdateShoppingListItemInput, userId: string): Promise<ShoppingListItem> {
    const supabase = getSupabaseClient();

    const dbRow = mapUpdateInputToDb(input);

    const { data, error } = await supabase
      .from('shopping_list')
      .update(dbRow)
      .eq('id', input.id)
      .eq('user_id', userId)
      .eq('deleted', false)
      .select()
      .single();

    if (error) {
      console.error('Shopping list update error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Shopping list item with id ${input.id} not found`);
    }

    return mapDbToShoppingListItem(data as DbShoppingListItem);
  },

  async delete(id: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('shopping_list')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Shopping list delete error:', error);
      throw new Error(error.message);
    }
  },

  async deleteChecked(userId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('shopping_list')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('checked', true)
      .eq('deleted', false);

    if (error) {
      console.error('Shopping list deleteChecked error:', error);
      throw new Error(error.message);
    }
  },

  async uncheckAll(userId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('shopping_list')
      .update({
        checked: false,
        purchased_at: null,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('checked', true)
      .eq('deleted', false);

    if (error) {
      console.error('Shopping list uncheckAll error:', error);
      throw new Error(error.message);
    }
  },
};

// ============================================================================
// Mock Implementation (for development/testing)
// ============================================================================

const STORAGE_KEY = 'shopping-list-items';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStoredItems(): ShoppingListItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveItems(items: ShoppingListItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export const mockShoppingListApi: IShoppingListApi = {
  async getAll(_userId: string): Promise<ShoppingListItem[]> {
    await delay();
    const items = getStoredItems();
    return items.sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  async getById(id: string, _userId: string): Promise<ShoppingListItem | null> {
    await delay();
    const items = getStoredItems();
    return items.find(item => item.id === id) || null;
  },

  async create(input: CreateShoppingListItemInput, userId: string): Promise<ShoppingListItem> {
    await delay();
    const now = new Date().toISOString();
    const newItem: ShoppingListItem = {
      id: generateId(),
      userId,
      ...input,
      checked: false,
      createdAt: now,
      updatedAt: now,
    };

    const items = getStoredItems();
    items.push(newItem);
    saveItems(items);

    return newItem;
  },

  async update(input: UpdateShoppingListItemInput, _userId: string): Promise<ShoppingListItem> {
    await delay();
    const items = getStoredItems();
    const index = items.findIndex(item => item.id === input.id);

    if (index === -1) {
      throw new Error(`Shopping list item with id ${input.id} not found`);
    }

    const now = new Date().toISOString();
    const updatedItem: ShoppingListItem = {
      ...items[index],
      ...input,
      updatedAt: now,
      purchasedAt: input.checked ? now : items[index].purchasedAt,
    };

    items[index] = updatedItem;
    saveItems(items);

    return updatedItem;
  },

  async delete(id: string, _userId: string): Promise<void> {
    await delay();
    const items = getStoredItems();
    saveItems(items.filter(item => item.id !== id));
  },

  async deleteChecked(_userId: string): Promise<void> {
    await delay();
    const items = getStoredItems();
    saveItems(items.filter(item => !item.checked));
  },

  async uncheckAll(_userId: string): Promise<void> {
    await delay();
    const items = getStoredItems();
    const now = new Date().toISOString();
    saveItems(items.map(item => ({ ...item, checked: false, purchasedAt: undefined, updatedAt: now })));
  },
};
/* eslint-enable @typescript-eslint/no-unused-vars */

// ============================================================================
// Export active implementation
// ============================================================================

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const shoppingListApi: IShoppingListApi = USE_MOCK_API
  ? mockShoppingListApi
  : supabaseShoppingListApi;
