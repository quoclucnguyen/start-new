import { getSupabaseClient } from '@/lib/supabaseClient';
import type {
  CategoryConfig,
  StorageLocationConfig,
  DbCategory,
  DbStorageLocation,
} from './types';

const supabase = getSupabaseClient();

// ============================================================================
// Mappers: DB (snake_case) ↔ App (camelCase)
// ============================================================================

function mapDbToCategory(db: DbCategory): CategoryConfig {
  return {
    id: db.id,
    name: db.name,
    icon: db.icon,
    color: db.color,
    showInFilters: db.show_in_filters,
    sortOrder: db.sort_order,
    createdAt: db.created_at,
  };
}

function mapCategoryToDb(
  cat: Omit<CategoryConfig, 'id' | 'createdAt'>
): Omit<DbCategory, 'id' | 'created_at'> {
  return {
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    show_in_filters: cat.showInFilters,
    sort_order: cat.sortOrder,
  };
}

function mapDbToStorageLocation(db: DbStorageLocation): StorageLocationConfig {
  return {
    id: db.id,
    name: db.name,
    icon: db.icon,
    color: db.color,
    showInFilters: db.show_in_filters,
    sortOrder: db.sort_order,
    createdAt: db.created_at,
  };
}

function mapStorageLocationToDb(
  loc: Omit<StorageLocationConfig, 'id' | 'createdAt'>
): Omit<DbStorageLocation, 'id' | 'created_at'> {
  return {
    name: loc.name,
    icon: loc.icon,
    color: loc.color,
    show_in_filters: loc.showInFilters,
    sort_order: loc.sortOrder,
  };
}

// ============================================================================
// Categories API
// ============================================================================

export const categoriesApi = {
  async getAll(): Promise<CategoryConfig[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbToCategory);
  },

  async create(
    category: Omit<CategoryConfig, 'id' | 'createdAt'>
  ): Promise<CategoryConfig> {
    const { data, error } = await supabase
      .from('categories')
      .insert(mapCategoryToDb(category))
      .select()
      .single();

    if (error) throw error;
    return mapDbToCategory(data);
  },

  async update(
    id: string,
    updates: Partial<Omit<CategoryConfig, 'id' | 'createdAt'>>
  ): Promise<CategoryConfig> {
    const dbUpdates: Partial<DbCategory> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.showInFilters !== undefined)
      dbUpdates.show_in_filters = updates.showInFilters;
    if (updates.sortOrder !== undefined)
      dbUpdates.sort_order = updates.sortOrder;

    const { data, error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToCategory(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  async reorder(categories: { id: string; sortOrder: number }[]): Promise<void> {
    // Update each category's sort_order
    const updates = categories.map((cat) =>
      supabase
        .from('categories')
        .update({ sort_order: cat.sortOrder })
        .eq('id', cat.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r: { error: unknown }) => r.error);
    if (errors.length > 0) {
      throw errors[0].error;
    }
  },
};

// ============================================================================
// Storage Locations API
// ============================================================================

export const storageLocationsApi = {
  async getAll(): Promise<StorageLocationConfig[]> {
    const { data, error } = await supabase
      .from('storage_locations')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbToStorageLocation);
  },

  async create(
    location: Omit<StorageLocationConfig, 'id' | 'createdAt'>
  ): Promise<StorageLocationConfig> {
    const { data, error } = await supabase
      .from('storage_locations')
      .insert(mapStorageLocationToDb(location))
      .select()
      .single();

    if (error) throw error;
    return mapDbToStorageLocation(data);
  },

  async update(
    id: string,
    updates: Partial<Omit<StorageLocationConfig, 'id' | 'createdAt'>>
  ): Promise<StorageLocationConfig> {
    const dbUpdates: Partial<DbStorageLocation> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.showInFilters !== undefined)
      dbUpdates.show_in_filters = updates.showInFilters;
    if (updates.sortOrder !== undefined)
      dbUpdates.sort_order = updates.sortOrder;

    const { data, error } = await supabase
      .from('storage_locations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToStorageLocation(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('storage_locations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async reorder(
    locations: { id: string; sortOrder: number }[]
  ): Promise<void> {
    const updates = locations.map((loc) =>
      supabase
        .from('storage_locations')
        .update({ sort_order: loc.sortOrder })
        .eq('id', loc.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r: { error: unknown }) => r.error);
    if (errors.length > 0) {
      throw errors[0].error;
    }
  },
};
