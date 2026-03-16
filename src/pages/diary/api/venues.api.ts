import { getSupabaseClient } from '@/lib/supabaseClient';
import type {
  Venue,
  CreateVenueInput,
  UpdateVenueInput,
  DbVenue,
  VenueStatus,
} from './types';

// ============================================================================
// Interface
// ============================================================================

export interface IVenuesApi {
  getAll(userId: string): Promise<Venue[]>;
  getById(id: string, userId: string): Promise<Venue | null>;
  create(input: CreateVenueInput, userId: string): Promise<Venue>;
  update(input: UpdateVenueInput, userId: string): Promise<Venue>;
  delete(id: string, userId: string): Promise<void>;
  search(query: string, userId: string): Promise<Venue[]>;
}

// ============================================================================
// Mappers
// ============================================================================

function mapDbToVenue(row: DbVenue): Venue {
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

function mapCreateInputToDb(
  input: CreateVenueInput,
  userId: string,
): Omit<DbVenue, 'id' | 'created_at' | 'updated_at' | 'last_modified' | 'deleted' | 'synced'> {
  return {
    user_id: userId,
    name: input.name,
    address: input.address ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    status: input.status ?? 'neutral',
    tags: input.tags ?? [],
    notes: input.notes ?? null,
    image_url: input.imageUrl ?? null,
  };
}

function mapUpdateInputToDb(input: UpdateVenueInput): Partial<DbVenue> {
  const dbRow: Partial<DbVenue> = {
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  };

  if (input.name !== undefined) dbRow.name = input.name;
  if (input.address !== undefined) dbRow.address = input.address ?? null;
  if (input.latitude !== undefined) dbRow.latitude = input.latitude ?? null;
  if (input.longitude !== undefined) dbRow.longitude = input.longitude ?? null;
  if (input.status !== undefined) dbRow.status = input.status;
  if (input.tags !== undefined) dbRow.tags = input.tags;
  if (input.notes !== undefined) dbRow.notes = input.notes ?? null;
  if (input.imageUrl !== undefined) dbRow.image_url = input.imageUrl ?? null;

  return dbRow;
}

// ============================================================================
// Supabase Implementation
// ============================================================================

export const supabaseVenuesApi: IVenuesApi = {
  async getAll(userId: string): Promise<Venue[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase venues getAll error:', error);
      throw new Error(error.message);
    }
    return (data as DbVenue[]).map(mapDbToVenue);
  },

  async getById(id: string, userId: string): Promise<Venue | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase venues getById error:', error);
      throw new Error(error.message);
    }
    return data ? mapDbToVenue(data as DbVenue) : null;
  },

  async create(input: CreateVenueInput, userId: string): Promise<Venue> {
    const supabase = getSupabaseClient();
    const dbRow = mapCreateInputToDb(input, userId);
    const { data, error } = await supabase
      .from('venues')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error('Supabase venues create error:', error);
      throw new Error(error.message);
    }
    return mapDbToVenue(data as DbVenue);
  },

  async update(input: UpdateVenueInput, userId: string): Promise<Venue> {
    const supabase = getSupabaseClient();
    const dbRow = mapUpdateInputToDb(input);
    const { data, error } = await supabase
      .from('venues')
      .update(dbRow)
      .eq('id', input.id)
      .eq('user_id', userId)
      .eq('deleted', false)
      .select()
      .single();

    if (error) {
      console.error('Supabase venues update error:', error);
      throw new Error(error.message);
    }
    return mapDbToVenue(data as DbVenue);
  },

  async delete(id: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('venues')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase venues delete error:', error);
      throw new Error(error.message);
    }
  },

  async search(query: string, userId: string): Promise<Venue[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', false)
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20);

    if (error) {
      console.error('Supabase venues search error:', error);
      throw new Error(error.message);
    }
    return (data as DbVenue[]).map(mapDbToVenue);
  },
};

// ============================================================================
// Mock Implementation
// ============================================================================

const VENUES_STORAGE_KEY = 'diary-venues';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStoredVenues(): Venue[] {
  try {
    const stored = localStorage.getItem(VENUES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveVenues(items: Venue[]): void {
  localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(items));
}

export const mockVenuesApi: IVenuesApi = {
  async getAll(): Promise<Venue[]> {
    await delay();
    return getStoredVenues();
  },

  async getById(id: string): Promise<Venue | null> {
    await delay();
    return getStoredVenues().find(v => v.id === id) ?? null;
  },

  async create(input: CreateVenueInput): Promise<Venue> {
    await delay();
    const venue: Venue = {
      id: generateId(),
      name: input.name,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      status: input.status ?? 'neutral',
      tags: input.tags ?? [],
      notes: input.notes,
      imageUrl: input.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = getStoredVenues();
    saveVenues([venue, ...all]);
    return venue;
  },

  async update(input: UpdateVenueInput): Promise<Venue> {
    await delay();
    const all = getStoredVenues();
    const idx = all.findIndex(v => v.id === input.id);
    if (idx === -1) throw new Error('Venue not found');
    const updated = { ...all[idx], ...input, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    saveVenues(all);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay();
    saveVenues(getStoredVenues().filter(v => v.id !== id));
  },

  async search(query: string): Promise<Venue[]> {
    await delay();
    const lower = query.toLowerCase();
    return getStoredVenues().filter(v => v.name.toLowerCase().includes(lower));
  },
};

// ============================================================================
// Export
// ============================================================================

export const venuesApi: IVenuesApi =
  import.meta.env.VITE_USE_MOCK_API === 'true' ? mockVenuesApi : supabaseVenuesApi;
