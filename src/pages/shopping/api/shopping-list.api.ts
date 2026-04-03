import { getSupabaseClient } from "@/lib/supabaseClient";
import type {
  ShoppingListItem,
  CreateShoppingListItemInput,
  UpdateShoppingListItemInput,
  DbShoppingListItem,
  FoodCategory,
  QuantityUnit,
} from "@/api/types";

/**
 * Abstract API interface for shopping list items.
 */
export interface IShoppingListApi {
  getAll(): Promise<ShoppingListItem[]>;
  getById(id: string): Promise<ShoppingListItem | null>;
  create(
    input: CreateShoppingListItemInput,
    userId: string,
  ): Promise<ShoppingListItem>;
  update(input: UpdateShoppingListItemInput): Promise<ShoppingListItem>;
  delete(id: string): Promise<void>;
  deleteChecked(): Promise<void>;
  uncheckAll(): Promise<void>;
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
    unit: (row.unit as QuantityUnit) || "pieces",
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
): Omit<
  DbShoppingListItem,
  | "id"
  | "created_at"
  | "updated_at"
  | "last_modified"
  | "purchased_at"
  | "deleted"
  | "synced"
> {
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

function mapUpdateInputToDb(
  input: UpdateShoppingListItemInput,
): Partial<DbShoppingListItem> {
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
  if (input.linkedFoodItemId !== undefined)
    dbRow.linked_food_item_id = input.linkedFoodItemId ?? null;

  return dbRow;
}

// ============================================================================
// Supabase API Implementation
// ============================================================================

export const supabaseShoppingListApi: IShoppingListApi = {
  async getAll(): Promise<ShoppingListItem[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("deleted", false)
      .order("checked", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Shopping list getAll error:", error);
      throw new Error(error.message);
    }

    return (data as DbShoppingListItem[]).map(mapDbToShoppingListItem);
  },

  async getById(id: string): Promise<ShoppingListItem | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("id", id)
      .eq("deleted", false)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      console.error("Shopping list getById error:", error);
      throw new Error(error.message);
    }

    return data ? mapDbToShoppingListItem(data as DbShoppingListItem) : null;
  },

  async create(
    input: CreateShoppingListItemInput,
    userId: string,
  ): Promise<ShoppingListItem> {
    const supabase = getSupabaseClient();

    const dbRow = mapCreateInputToDb(input, userId);

    const { data, error } = await supabase
      .from("shopping_list")
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error("Shopping list create error:", error);
      throw new Error(error.message);
    }

    return mapDbToShoppingListItem(data as DbShoppingListItem);
  },

  async update(input: UpdateShoppingListItemInput): Promise<ShoppingListItem> {
    const supabase = getSupabaseClient();

    const dbRow = mapUpdateInputToDb(input);

    const { data, error } = await supabase
      .from("shopping_list")
      .update(dbRow)
      .eq("id", input.id)
      .eq("deleted", false)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(
          `Shopping list item with id ${input.id} not found or access denied`,
        );
      }
      console.error("Shopping list update error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(`Shopping list item with id ${input.id} not found`);
    }

    return mapDbToShoppingListItem(data as DbShoppingListItem);
  },

  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("shopping_list")
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("deleted", false)
      .select("id")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(
          `Shopping list item with id ${id} not found or access denied`,
        );
      }
      console.error("Shopping list delete error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(
        `Shopping list item with id ${id} not found or access denied`,
      );
    }
  },

  async deleteChecked(): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("shopping_list")
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq("checked", true)
      .eq("deleted", false);

    if (error) {
      console.error("Shopping list deleteChecked error:", error);
      throw new Error(error.message);
    }
  },

  async uncheckAll(): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("shopping_list")
      .update({
        checked: false,
        purchased_at: null,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq("checked", true)
      .eq("deleted", false);

    if (error) {
      console.error("Shopping list uncheckAll error:", error);
      throw new Error(error.message);
    }
  },
};
