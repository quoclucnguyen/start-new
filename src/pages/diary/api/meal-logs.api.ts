import { getSupabaseClient } from '@/lib/supabaseClient';
import type {
  MealLog,
  CreateMealLogInput,
  UpdateMealLogInput,
  DbMealLog,
  DbVenue,
  DbMealItemEntry,
  Venue,
  MealItemEntry,
  MealType,
  VenueStatus,
} from './types';
import { supabaseMealItemEntriesApi } from './meal-item-entries.api';

// ============================================================================
// Interface
// ============================================================================

export interface IMealLogsApi {
  getAll(): Promise<MealLog[]>;
  getById(id: string): Promise<MealLog | null>;
  create(input: CreateMealLogInput, userId: string): Promise<MealLog>;
  update(input: UpdateMealLogInput): Promise<MealLog>;
  delete(id: string): Promise<void>;
  getRecent(limit?: number): Promise<MealLog[]>;
}

// ============================================================================
// Mappers
// ============================================================================

function mapDbVenueToVenue(row: DbVenue): Venue {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    status: (row.status as VenueStatus) || 'neutral',
    tags: row.tags ?? [],
    notes: row.notes ?? undefined,
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDbEntryToEntry(row: DbMealItemEntry): MealItemEntry {
  return {
    id: row.id,
    mealLogId: row.meal_log_id,
    menuItemId: row.menu_item_id ?? undefined,
    itemName: row.item_name,
    price: row.price ?? undefined,
    quantity: row.quantity,
    rating: row.rating ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapDbToMealLog(
  row: DbMealLog & { venues?: DbVenue | null; meal_item_entries?: DbMealItemEntry[] },
): MealLog {
  return {
    id: row.id,
    venueId: row.venue_id ?? undefined,
    venue: row.venues ? mapDbVenueToVenue(row.venues) : undefined,
    mealType: row.meal_type as MealType,
    totalCost: Number(row.total_cost),
    overallRating: row.overall_rating ?? undefined,
    notes: row.notes ?? undefined,
    photos: row.photos ?? [],
    tags: row.tags ?? [],
    loggedAt: row.logged_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: row.meal_item_entries?.map(mapDbEntryToEntry),
  };
}

function mapCreateInputToDb(
  input: CreateMealLogInput,
  userId: string,
): Omit<DbMealLog, 'id' | 'created_at' | 'updated_at' | 'last_modified' | 'deleted' | 'synced'> {
  return {
    user_id: userId,
    venue_id: input.venueId ?? null,
    meal_type: input.mealType,
    total_cost: input.totalCost,
    overall_rating: input.overallRating ?? null,
    notes: input.notes ?? null,
    photos: input.photos ?? [],
    tags: input.tags ?? [],
    logged_at: input.loggedAt ?? new Date().toISOString(),
  };
}

function mapUpdateInputToDb(input: UpdateMealLogInput): Partial<DbMealLog> {
  const dbRow: Partial<DbMealLog> = {
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  };

  if (input.venueId !== undefined) dbRow.venue_id = input.venueId ?? null;
  if (input.mealType !== undefined) dbRow.meal_type = input.mealType;
  if (input.totalCost !== undefined) dbRow.total_cost = input.totalCost;
  if (input.overallRating !== undefined) dbRow.overall_rating = input.overallRating ?? null;
  if (input.notes !== undefined) dbRow.notes = input.notes ?? null;
  if (input.photos !== undefined) dbRow.photos = input.photos;
  if (input.tags !== undefined) dbRow.tags = input.tags;
  if (input.loggedAt !== undefined) dbRow.logged_at = input.loggedAt;

  return dbRow;
}

// ============================================================================
// Supabase Implementation
// ============================================================================

export const supabaseMealLogsApi: IMealLogsApi = {
  async getAll(): Promise<MealLog[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*, venues(*), meal_item_entries(*)')
      .eq('deleted', false)
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Supabase meal_logs getAll error:', error);
      throw new Error(error.message);
    }
    return (data as (DbMealLog & { venues: DbVenue | null; meal_item_entries?: DbMealItemEntry[] })[])
      .map(mapDbToMealLog);
  },

  async getById(id: string): Promise<MealLog | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*, venues(*), meal_item_entries(*)')
      .eq('id', id)
      .eq('deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase meal_logs getById error:', error);
      throw new Error(error.message);
    }
    return data
      ? mapDbToMealLog(data as DbMealLog & { venues: DbVenue | null; meal_item_entries: DbMealItemEntry[] })
      : null;
  },

  async create(input: CreateMealLogInput, userId: string): Promise<MealLog> {
    const supabase = getSupabaseClient();
    const dbRow = mapCreateInputToDb(input, userId);
    const { data, error } = await supabase
      .from('meal_logs')
      .insert(dbRow)
      .select('*, venues(*)')
      .single();

    if (error) {
      console.error('Supabase meal_logs create error:', error);
      throw new Error(error.message);
    }

    const mealLog = mapDbToMealLog(data as DbMealLog & { venues: DbVenue | null });

    // Create item entries if provided
    if (input.items && input.items.length > 0) {
      const entries = await supabaseMealItemEntriesApi.createBatch(mealLog.id, input.items);
      mealLog.items = entries;
    }

    return mealLog;
  },

  async update(input: UpdateMealLogInput): Promise<MealLog> {
    const supabase = getSupabaseClient();
    const dbRow = mapUpdateInputToDb(input);
    const { data, error } = await supabase
      .from('meal_logs')
      .update(dbRow)
      .eq('id', input.id)
      .eq('deleted', false)
      .select('*, venues(*)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Meal log with id ${input.id} not found or access denied`);
      }
      console.error('Supabase meal_logs update error:', error);
      throw new Error(error.message);
    }
    return mapDbToMealLog(data as DbMealLog & { venues: DbVenue | null });
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('meal_logs')
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
        throw new Error(`Meal log with id ${id} not found or access denied`);
      }
      console.error('Supabase meal_logs delete error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Meal log with id ${id} not found or access denied`);
    }
  },

  async getRecent(limit: number = 5): Promise<MealLog[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*, venues(*), meal_item_entries(*)')
      .eq('deleted', false)
      .order('logged_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase meal_logs getRecent error:', error);
      throw new Error(error.message);
    }
    return (data as (DbMealLog & { venues: DbVenue | null; meal_item_entries?: DbMealItemEntry[] })[])
      .map(mapDbToMealLog);
  },
};

// ============================================================================
// Mock Implementation
// ============================================================================

const MEAL_LOGS_STORAGE_KEY = 'diary-meal-logs';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStoredLogs(): MealLog[] {
  try {
    const stored = localStorage.getItem(MEAL_LOGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLogs(items: MealLog[]): void {
  localStorage.setItem(MEAL_LOGS_STORAGE_KEY, JSON.stringify(items));
}

export const mockMealLogsApi: IMealLogsApi = {
  async getAll(): Promise<MealLog[]> {
    await delay();
    return getStoredLogs().map((log) => ({
      ...log,
      items: log.items ?? [],
    }));
  },

  async getById(id: string): Promise<MealLog | null> {
    await delay();
    const log = getStoredLogs().find(l => l.id === id) ?? null;
    return log ? { ...log, items: log.items ?? [] } : null;
  },

  async create(input: CreateMealLogInput, _userId: string): Promise<MealLog> {
    void _userId;
    await delay();
    const log: MealLog = {
      id: generateId(),
      venueId: input.venueId,
      mealType: input.mealType,
      totalCost: input.totalCost,
      overallRating: input.overallRating,
      notes: input.notes,
      photos: input.photos ?? [],
      tags: input.tags ?? [],
      loggedAt: input.loggedAt ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    };
    const all = getStoredLogs();
    saveLogs([log, ...all]);
    return log;
  },

  async update(input: UpdateMealLogInput): Promise<MealLog> {
    await delay();
    const all = getStoredLogs();
    const idx = all.findIndex(l => l.id === input.id);
    if (idx === -1) throw new Error('Meal log not found');
    const updated = { ...all[idx], ...input, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    saveLogs(all);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay();
    saveLogs(getStoredLogs().filter(l => l.id !== id));
  },

  async getRecent(_limit: number = 5): Promise<MealLog[]> {
    await delay();
    return getStoredLogs()
      .slice(0, _limit)
      .map((log) => ({
        ...log,
        items: log.items ?? [],
      }));
  },
};

// ============================================================================
// Export
// ============================================================================
