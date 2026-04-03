import { getSupabaseClient } from '@/lib/supabaseClient';
import type {
  MenuItem,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  DbMenuItem,
} from './types';

// ============================================================================
// Interface
// ============================================================================

export interface IMenuItemsApi {
  getByVenue(venueId: string): Promise<MenuItem[]>;
  getAll(): Promise<MenuItem[]>;
  create(input: CreateMenuItemInput, userId: string): Promise<MenuItem>;
  update(input: UpdateMenuItemInput): Promise<MenuItem>;
  delete(id: string): Promise<void>;
}

// ============================================================================
// Mappers
// ============================================================================

function mapDbToMenuItem(row: DbMenuItem): MenuItem {
  return {
    id: row.id,
    venueId: row.venue_id,
    name: row.name,
    lastPrice: row.last_price != null ? Number(row.last_price) : undefined,
    personalRating: row.personal_rating ?? undefined,
    isFavorite: row.is_favorite,
    isBlacklisted: row.is_blacklisted,
    notes: row.notes ?? undefined,
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCreateInputToDb(
  input: CreateMenuItemInput,
  userId: string,
): Omit<DbMenuItem, 'id' | 'created_at' | 'updated_at' | 'deleted'> {
  return {
    user_id: userId,
    venue_id: input.venueId,
    name: input.name,
    last_price: input.lastPrice ?? null,
    personal_rating: input.personalRating ?? null,
    is_favorite: input.isFavorite ?? false,
    is_blacklisted: input.isBlacklisted ?? false,
    notes: input.notes ?? null,
    image_url: input.imageUrl ?? null,
  };
}

function mapUpdateInputToDb(input: UpdateMenuItemInput): Partial<DbMenuItem> {
  const dbRow: Partial<DbMenuItem> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) dbRow.name = input.name;
  if (input.lastPrice !== undefined) dbRow.last_price = input.lastPrice ?? null;
  if (input.personalRating !== undefined) dbRow.personal_rating = input.personalRating ?? null;
  if (input.isFavorite !== undefined) dbRow.is_favorite = input.isFavorite;
  if (input.isBlacklisted !== undefined) dbRow.is_blacklisted = input.isBlacklisted;
  if (input.notes !== undefined) dbRow.notes = input.notes ?? null;
  if (input.imageUrl !== undefined) dbRow.image_url = input.imageUrl ?? null;

  return dbRow;
}

// ============================================================================
// Supabase Implementation
// ============================================================================

export const supabaseMenuItemsApi: IMenuItemsApi = {
  async getByVenue(venueId: string): Promise<MenuItem[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('venue_id', venueId)
      .eq('deleted', false)
      .order('name');

    if (error) {
      console.error('Supabase menu_items getByVenue error:', error);
      throw new Error(error.message);
    }
    return (data as DbMenuItem[]).map(mapDbToMenuItem);
  },

  async getAll(): Promise<MenuItem[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('deleted', false)
      .order('name');

    if (error) {
      console.error('Supabase menu_items getAll error:', error);
      throw new Error(error.message);
    }
    return (data as DbMenuItem[]).map(mapDbToMenuItem);
  },

  async create(input: CreateMenuItemInput, userId: string): Promise<MenuItem> {
    const supabase = getSupabaseClient();
    const dbRow = mapCreateInputToDb(input, userId);
    const { data, error } = await supabase
      .from('menu_items')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error('Supabase menu_items create error:', error);
      throw new Error(error.message);
    }
    return mapDbToMenuItem(data as DbMenuItem);
  },

  async update(input: UpdateMenuItemInput): Promise<MenuItem> {
    const supabase = getSupabaseClient();
    const dbRow = mapUpdateInputToDb(input);
    const { data, error } = await supabase
      .from('menu_items')
      .update(dbRow)
      .eq('id', input.id)
      .eq('deleted', false)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Menu item with id ${input.id} not found or access denied`);
      }
      console.error('Supabase menu_items update error:', error);
      throw new Error(error.message);
    }
    return mapDbToMenuItem(data as DbMenuItem);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('menu_items')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('deleted', false)
      .select('id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Menu item with id ${id} not found or access denied`);
      }
      console.error('Supabase menu_items delete error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Menu item with id ${id} not found or access denied`);
    }
  },
};

// ============================================================================
// Mock Implementation
// ============================================================================

const MENU_ITEMS_STORAGE_KEY = 'diary-menu-items';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStoredMenuItems(): MenuItem[] {
  try {
    const stored = localStorage.getItem(MENU_ITEMS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMenuItems(items: MenuItem[]): void {
  localStorage.setItem(MENU_ITEMS_STORAGE_KEY, JSON.stringify(items));
}

export const mockMenuItemsApi: IMenuItemsApi = {
  async getByVenue(venueId: string): Promise<MenuItem[]> {
    await delay();
    return getStoredMenuItems().filter(i => i.venueId === venueId);
  },

  async getAll(): Promise<MenuItem[]> {
    await delay();
    return getStoredMenuItems();
  },

  async create(input: CreateMenuItemInput, _userId: string): Promise<MenuItem> {
    void _userId;
    await delay();
    const item: MenuItem = {
      id: generateId(),
      venueId: input.venueId,
      name: input.name,
      lastPrice: input.lastPrice,
      personalRating: input.personalRating,
      isFavorite: input.isFavorite ?? false,
      isBlacklisted: input.isBlacklisted ?? false,
      notes: input.notes,
      imageUrl: input.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = getStoredMenuItems();
    saveMenuItems([...all, item]);
    return item;
  },

  async update(input: UpdateMenuItemInput): Promise<MenuItem> {
    await delay();
    const all = getStoredMenuItems();
    const idx = all.findIndex(i => i.id === input.id);
    if (idx === -1) throw new Error('Menu item not found');
    const updated = { ...all[idx], ...input, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    saveMenuItems(all);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay();
    saveMenuItems(getStoredMenuItems().filter(i => i.id !== id));
  },
};

// ============================================================================
// Export
// ============================================================================
