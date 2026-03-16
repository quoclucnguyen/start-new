import { getSupabaseClient } from '@/lib/supabaseClient';
import type {
  MealItemEntry,
  CreateMealItemEntryInput,
  UpdateMealItemEntryInput,
  DbMealItemEntry,
} from './types';

// ============================================================================
// Interface
// ============================================================================

export interface IMealItemEntriesApi {
  getByMealLog(mealLogId: string): Promise<MealItemEntry[]>;
  createBatch(mealLogId: string, entries: CreateMealItemEntryInput[]): Promise<MealItemEntry[]>;
  update(input: UpdateMealItemEntryInput): Promise<MealItemEntry>;
  delete(id: string): Promise<void>;
}

// ============================================================================
// Mappers
// ============================================================================

function mapDbToEntry(row: DbMealItemEntry): MealItemEntry {
  return {
    id: row.id,
    mealLogId: row.meal_log_id,
    menuItemId: row.menu_item_id ?? undefined,
    itemName: row.item_name,
    price: row.price != null ? Number(row.price) : undefined,
    quantity: row.quantity,
    rating: row.rating ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapCreateInputToDb(
  mealLogId: string,
  input: CreateMealItemEntryInput,
): Omit<DbMealItemEntry, 'id'> {
  return {
    meal_log_id: mealLogId,
    menu_item_id: input.menuItemId ?? null,
    item_name: input.itemName,
    price: input.price ?? null,
    quantity: input.quantity ?? 1,
    rating: input.rating ?? null,
    notes: input.notes ?? null,
  };
}

function mapUpdateInputToDb(input: UpdateMealItemEntryInput): Partial<DbMealItemEntry> {
  const dbRow: Partial<DbMealItemEntry> = {};

  if (input.menuItemId !== undefined) dbRow.menu_item_id = input.menuItemId ?? null;
  if (input.itemName !== undefined) dbRow.item_name = input.itemName;
  if (input.price !== undefined) dbRow.price = input.price ?? null;
  if (input.quantity !== undefined) dbRow.quantity = input.quantity;
  if (input.rating !== undefined) dbRow.rating = input.rating ?? null;
  if (input.notes !== undefined) dbRow.notes = input.notes ?? null;

  return dbRow;
}

// ============================================================================
// Supabase Implementation
// ============================================================================

export const supabaseMealItemEntriesApi: IMealItemEntriesApi = {
  async getByMealLog(mealLogId: string): Promise<MealItemEntry[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('meal_item_entries')
      .select('*')
      .eq('meal_log_id', mealLogId)
      .order('item_name');

    if (error) {
      console.error('Supabase meal_item_entries getByMealLog error:', error);
      throw new Error(error.message);
    }
    return (data as DbMealItemEntry[]).map(mapDbToEntry);
  },

  async createBatch(mealLogId: string, entries: CreateMealItemEntryInput[]): Promise<MealItemEntry[]> {
    const supabase = getSupabaseClient();
    const rows = entries.map(e => mapCreateInputToDb(mealLogId, e));
    const { data, error } = await supabase
      .from('meal_item_entries')
      .insert(rows)
      .select();

    if (error) {
      console.error('Supabase meal_item_entries createBatch error:', error);
      throw new Error(error.message);
    }
    return (data as DbMealItemEntry[]).map(mapDbToEntry);
  },

  async update(input: UpdateMealItemEntryInput): Promise<MealItemEntry> {
    const supabase = getSupabaseClient();
    const dbRow = mapUpdateInputToDb(input);
    const { data, error } = await supabase
      .from('meal_item_entries')
      .update(dbRow)
      .eq('id', input.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase meal_item_entries update error:', error);
      throw new Error(error.message);
    }
    return mapDbToEntry(data as DbMealItemEntry);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('meal_item_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase meal_item_entries delete error:', error);
      throw new Error(error.message);
    }
  },
};

// ============================================================================
// Mock Implementation
// ============================================================================

const ENTRIES_STORAGE_KEY = 'diary-meal-item-entries';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStoredEntries(): MealItemEntry[] {
  try {
    const stored = localStorage.getItem(ENTRIES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEntries(items: MealItemEntry[]): void {
  localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(items));
}

export const mockMealItemEntriesApi: IMealItemEntriesApi = {
  async getByMealLog(mealLogId: string): Promise<MealItemEntry[]> {
    await delay();
    return getStoredEntries().filter(e => e.mealLogId === mealLogId);
  },

  async createBatch(mealLogId: string, entries: CreateMealItemEntryInput[]): Promise<MealItemEntry[]> {
    await delay();
    const all = getStoredEntries();
    const created = entries.map(input => ({
      id: generateId(),
      mealLogId,
      menuItemId: input.menuItemId,
      itemName: input.itemName,
      price: input.price,
      quantity: input.quantity ?? 1,
      rating: input.rating,
      notes: input.notes,
    }));
    saveEntries([...all, ...created]);
    return created;
  },

  async update(input: UpdateMealItemEntryInput): Promise<MealItemEntry> {
    await delay();
    const all = getStoredEntries();
    const idx = all.findIndex(e => e.id === input.id);
    if (idx === -1) throw new Error('Entry not found');
    const updated = { ...all[idx], ...input };
    all[idx] = updated;
    saveEntries(all);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay();
    saveEntries(getStoredEntries().filter(e => e.id !== id));
  },
};

// ============================================================================
// Export
// ============================================================================

export const mealItemEntriesApi: IMealItemEntriesApi =
  import.meta.env.VITE_USE_MOCK_API === 'true' ? mockMealItemEntriesApi : supabaseMealItemEntriesApi;
