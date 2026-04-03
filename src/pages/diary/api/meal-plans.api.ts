import { getSupabaseClient } from '@/lib/supabaseClient';
import type {
  MealPlan,
  MealPlanItem,
  CreateMealPlanInput,
  UpdateMealPlanInput,
  DbMealPlan,
  DbMealPlanItem,
} from './types';

// ============================================================================
// Interface
// ============================================================================

export interface IMealPlansApi {
  getAll(): Promise<MealPlan[]>;
  create(input: CreateMealPlanInput, userId: string): Promise<MealPlan>;
  update(input: UpdateMealPlanInput): Promise<MealPlan>;
  delete(id: string): Promise<void>;
  addItem(mealPlanId: string, item: { title: string; recipeId?: string; notes?: string }): Promise<MealPlanItem>;
  removeItem(itemId: string): Promise<void>;
}

// ============================================================================
// Mappers
// ============================================================================

function mapDbItemToItem(row: DbMealPlanItem): MealPlanItem {
  return {
    id: row.id,
    mealPlanId: row.meal_plan_id,
    title: row.title,
    recipeId: row.recipe_id ?? undefined,
    notes: row.notes ?? undefined,
    sortOrder: row.sort_order,
  };
}

function mapDbToMealPlan(
  row: DbMealPlan & { meal_plan_items?: DbMealPlanItem[] },
): MealPlan {
  return {
    id: row.id,
    plannedDate: row.planned_date,
    title: row.title,
    notes: row.notes ?? undefined,
    sortOrder: row.sort_order,
    items: (row.meal_plan_items ?? []).map(mapDbItemToItem),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCreateInputToDb(
  input: CreateMealPlanInput,
  userId: string,
): Omit<DbMealPlan, 'id' | 'created_at' | 'updated_at' | 'last_modified' | 'deleted' | 'synced'> {
  return {
    user_id: userId,
    planned_date: input.plannedDate,
    title: input.title,
    notes: input.notes ?? null,
    sort_order: input.sortOrder ?? 0,
  };
}

function mapUpdateInputToDb(input: UpdateMealPlanInput): Partial<DbMealPlan> {
  const dbRow: Partial<DbMealPlan> = {
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  };

  if (input.plannedDate !== undefined) dbRow.planned_date = input.plannedDate;
  if (input.title !== undefined) dbRow.title = input.title;
  if (input.notes !== undefined) dbRow.notes = input.notes ?? null;
  if (input.sortOrder !== undefined) dbRow.sort_order = input.sortOrder;

  return dbRow;
}

// ============================================================================
// Supabase Implementation
// ============================================================================

export const supabaseMealPlansApi: IMealPlansApi = {
  async getAll(): Promise<MealPlan[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*, meal_plan_items(*)')
      .eq('deleted', false)
      .order('planned_date', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase meal_plans getAll error:', error);
      throw new Error(error.message);
    }
    return (data as (DbMealPlan & { meal_plan_items?: DbMealPlanItem[] })[]).map(mapDbToMealPlan);
  },

  async create(input: CreateMealPlanInput, userId: string): Promise<MealPlan> {
    const supabase = getSupabaseClient();
    const dbRow = mapCreateInputToDb(input, userId);
    const { data, error } = await supabase
      .from('meal_plans')
      .insert(dbRow)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase meal_plans create error:', error);
      throw new Error(error.message);
    }

    const mealPlan = mapDbToMealPlan(data as DbMealPlan);

    // Create items if provided
    if (input.items && input.items.length > 0) {
      const itemRows = input.items.map((item, index) => ({
        meal_plan_id: mealPlan.id,
        title: item.title,
        recipe_id: item.recipeId ?? null,
        notes: item.notes ?? null,
        sort_order: index,
      }));

      const { data: itemsData, error: itemsError } = await supabase
        .from('meal_plan_items')
        .insert(itemRows)
        .select('*');

      if (itemsError) {
        console.error('Supabase meal_plan_items create error:', itemsError);
      } else {
        mealPlan.items = (itemsData as DbMealPlanItem[]).map(mapDbItemToItem);
      }
    }

    return mealPlan;
  },

  async update(input: UpdateMealPlanInput): Promise<MealPlan> {
    const supabase = getSupabaseClient();
    const dbRow = mapUpdateInputToDb(input);
    const { data, error } = await supabase
      .from('meal_plans')
      .update(dbRow)
      .eq('id', input.id)
      .eq('deleted', false)
      .select('*, meal_plan_items(*)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Meal plan with id ${input.id} not found or access denied`);
      }
      console.error('Supabase meal_plans update error:', error);
      throw new Error(error.message);
    }

    // If items are provided, replace all items
    if (input.items !== undefined) {
      // Delete existing items
      await supabase
        .from('meal_plan_items')
        .delete()
        .eq('meal_plan_id', input.id);

      // Insert new items
      if (input.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('meal_plan_items')
          .insert(
            input.items.map((item, i) => ({
              meal_plan_id: input.id,
              title: item.title,
              recipe_id: item.recipeId ?? null,
              notes: item.notes ?? null,
              sort_order: i,
            })),
          );
        if (itemsError) {
          console.error('Supabase meal_plan_items replace error:', itemsError);
          throw new Error(itemsError.message);
        }
      }

      // Re-fetch with updated items
      const { data: refreshed, error: refreshError } = await supabase
        .from('meal_plans')
        .select('*, meal_plan_items(*)')
        .eq('id', input.id)
        .single();

      if (refreshError) throw new Error(refreshError.message);
      return mapDbToMealPlan(refreshed as DbMealPlan & { meal_plan_items?: DbMealPlanItem[] });
    }

    return mapDbToMealPlan(data as DbMealPlan & { meal_plan_items?: DbMealPlanItem[] });
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('meal_plans')
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
        throw new Error(`Meal plan with id ${id} not found or access denied`);
      }
      console.error('Supabase meal_plans delete error:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Meal plan with id ${id} not found or access denied`);
    }
  },

  async addItem(mealPlanId: string, item: { title: string; recipeId?: string; notes?: string }): Promise<MealPlanItem> {
    const supabase = getSupabaseClient();

    // Get next sort order
    const { data: existing } = await supabase
      .from('meal_plan_items')
      .select('sort_order')
      .eq('meal_plan_id', mealPlanId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? (existing[0] as DbMealPlanItem).sort_order + 1 : 0;

    const { data, error } = await supabase
      .from('meal_plan_items')
      .insert({
        meal_plan_id: mealPlanId,
        title: item.title,
        recipe_id: item.recipeId ?? null,
        notes: item.notes ?? null,
        sort_order: nextOrder,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase meal_plan_items addItem error:', error);
      throw new Error(error.message);
    }
    return mapDbItemToItem(data as DbMealPlanItem);
  },

  async removeItem(itemId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('meal_plan_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Supabase meal_plan_items removeItem error:', error);
      throw new Error(error.message);
    }
  },
};
