# Shopping List Feature - Implementation Plan

**Created:** 2026-02-26
**Status:** Implementation In Progress (Checklist: 21 done / 10 pending)
**Priority:** High (Next Sprint)

---

## Overview

The Shopping List feature allows users to track items they need to purchase and seamlessly move them to their inventory when bought. This feature completes the core inventory management loop: **Plan → Shop → Store → Track**.

### Problem Solved

Users often forget what they need to buy when at the grocery store. This feature:
- Creates a dedicated shopping list accessible anywhere via Telegram
- Allows quick-add from inventory (when running low on items)
- Enables marking items as purchased to move them to inventory
- Persists across sessions so users can plan ahead

### Success Metrics

- Users can add items to shopping list in < 5 seconds
- Clear visual distinction between needed and purchased items
- Smooth flow from shopping → inventory (one tap)
- Shopping list persists and syncs properly

---

## Data Model

### Shopping List Item Type

```typescript
// src/api/types.ts - Add to existing types

export interface ShoppingListItem {
  id: string;
  userId: string;
  name: string;
  category: FoodCategory;      // For quick filtering/grouping
  quantity: number;
  unit: QuantityUnit;
  notes?: string;               // E.g., "brand preference", "specific size"
  checked: boolean;             // true = in cart, false = still needed
  linkedFoodItemId?: string;    // Optional: link to inventory item
  createdAt: string;
  updatedAt: string;
  purchasedAt?: string;         // When marked as purchased
}

// Input types
export interface CreateShoppingListItemInput {
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: QuantityUnit;
  notes?: string;
  linkedFoodItemId?: string;
}

export interface UpdateShoppingListItemInput {
  id: string;
  name?: string;
  category?: FoodCategory;
  quantity?: number;
  unit?: QuantityUnit;
  notes?: string;
  checked?: boolean;
  linkedFoodItemId?: string;
}

// Database row type (snake_case)
// Matches schema with soft delete pattern
export interface DbShoppingListItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string | null;
  checked: boolean;
  linked_food_item_id: string | null;
  created_at: string;
  updated_at: string;
  last_modified: string;  // Added for sync tracking
  purchased_at: string | null;
  deleted: boolean;       // Added for soft delete pattern
  synced: boolean;        // Added for sync status
}
```

### Relationships

```
ShoppingListItem ──[optional]──> FoodItem
    (linkedFoodItemId)
    When an item is purchased, it can create/update
    a corresponding FoodItem in inventory
```

---

## API Layer Design

### Shopping List API Interface

```typescript
// src/api/shopping-list.api.ts

export interface IShoppingListApi {
  // CRUD operations
  getAll(userId: string): Promise<ShoppingListItem[]>;
  getById(id: string, userId: string): Promise<ShoppingListItem | null>;
  create(input: CreateShoppingListItemInput, userId: string): Promise<ShoppingListItem>;
  update(input: UpdateShoppingListItemInput, userId: string): Promise<ShoppingListItem>;
  delete(id: string, userId: string): Promise<void>;

  // Bulk operations
  deleteChecked(userId: string): Promise<void>;  // Remove all checked items
  uncheckAll(userId: string): Promise<void>;    // Reset all to unchecked

  // Smart operations
  movePurchasedToInventory(userId: string): Promise<FoodItem[]>; // Batch move
}

export const shoppingListApi: IShoppingListApi = {
  // Implementation (mock + Supabase)
};
```

### Mapper Functions

```typescript
// Similar pattern to food-items.api.ts
function mapDbToShoppingListItem(row: DbShoppingListItem): ShoppingListItem { }
function mapCreateInputToDb(input: CreateShoppingListItemInput, userId: string): Omit<DbShoppingListItem, 'id' | 'created_at' | 'updated_at' | 'last_modified' | 'purchased_at' | 'deleted' | 'synced'> { }
function mapUpdateInputToDb(input: UpdateShoppingListItemInput): Partial<DbShoppingListItem> { }
```

---

## TanStack Query Hooks

### Query Hooks

```typescript
// src/api/use-shopping-list.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingListApi } from './shopping-list.api';
import type { CreateShoppingListItemInput, UpdateShoppingListItemInput } from './types';

// Query keys factory
export const shoppingListKeys = {
  all: ['shopping-list'] as const,
  lists: () => [...shoppingListKeys.all, 'list'] as const,
  list: (userId: string) => [...shoppingListKeys.lists(), userId] as const,
  details: () => [...shoppingListKeys.all, 'detail'] as const,
  detail: (id: string, userId: string) => [...shoppingListKeys.details(), id, userId] as const,
};

// Query hook
export function useShoppingList() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: shoppingListKeys.list(user?.id || ''),
    queryFn: () => shoppingListApi.getAll(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useShoppingListItem(id: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: shoppingListKeys.detail(id, user?.id || ''),
    queryFn: () => shoppingListApi.getById(id, user?.id || ''),
    enabled: !!user?.id && !!id,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Mutation Hooks

```typescript
// src/api/use-shopping-list-mutations.ts

export function useAddShoppingListItem() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const queryKey = shoppingListKeys.list(user?.id || '');

  return useMutation({
    mutationFn: (input: CreateShoppingListItemInput) =>
      shoppingListApi.create(input, user?.id || ''),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistic update
      const newItem: ShoppingListItem = {
        id: `temp-${Date.now()}`,
        userId: user?.id || '',
        ...variables,
        checked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKey, (old: ShoppingListItem[] = []) =>
        [...old, newItem]
      );

      return { previousData, queryKey };
    },

    onError: (_err, _variables, context) => {
      context && queryClient.setQueryData(context.queryKey, context.previousData);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useToggleShoppingItemChecked() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const queryKey = shoppingListKeys.list(user?.id || '');

  return useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      shoppingListApi.update({ id, checked }, user?.id || ''),

    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: ShoppingListItem[] = []) =>
        old.map(item => item.id === id ? { ...item, checked, updatedAt: new Date().toISOString() } : item)
      );

      return { previousData, queryKey };
    },

    onError: (_err, _variables, context) => {
      context && queryClient.setQueryData(context.queryKey, context.previousData);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const queryKey = shoppingListKeys.list(user?.id || '');

  return useMutation({
    mutationFn: (id: string) => shoppingListApi.delete(id, user?.id || ''),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: ShoppingListItem[] = []) =>
        old.filter(item => item.id !== id)
      );

      return { previousData, queryKey };
    },

    onError: (_err, _variables, context) => {
      context && queryClient.setQueryData(context.queryKey, context.previousData);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useMovePurchasedToInventory() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const shoppingListQueryKey = shoppingListKeys.list(user?.id || '');
  const foodItemsQueryKey = foodItemsKeys.list(user?.id || '');

  return useMutation({
    mutationFn: () => shoppingListApi.movePurchasedToInventory(user?.id || ''),

    onSuccess: () => {
      // Invalidate both shopping list and inventory queries
      queryClient.invalidateQueries({ queryKey: shoppingListQueryKey });
      queryClient.invalidateQueries({ queryKey: foodItemsQueryKey });
    },
  });
}
```

---

## UI State Management (Zustand)

```typescript
// src/store/shopping.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShoppingUIState {
  // Filter states
  showCheckedOnly: boolean;
  selectedCategory: FoodCategory | 'all';

  // Modal states
  isAddModalOpen: boolean;
  editingItemId: string | null;

  // Actions
  setShowCheckedOnly: (show: boolean) => void;
  setSelectedCategory: (category: FoodCategory | 'all') => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (id: string) => void;
  closeEditModal: () => void;
}

export const useShoppingStore = create<ShoppingUIState>()(
  persist(
    (set) => ({
      // Initial state
      showCheckedOnly: false,
      selectedCategory: 'all',
      isAddModalOpen: false,
      editingItemId: null,

      // Actions
      setShowCheckedOnly: (show) => set({ showCheckedOnly: show }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      openAddModal: () => set({ isAddModalOpen: true, editingItemId: null }),
      closeAddModal: () => set({ isAddModalOpen: false }),
      openEditModal: (id) => set({ isAddModalOpen: true, editingItemId: id }),
      closeEditModal: () => set({ isAddModalOpen: false, editingItemId: null }),
    }),
    {
      name: 'shopping-ui-storage',
    }
  )
);
```

---

## Component Structure

```
src/components/shopping/
├── index.ts                          # Barrel exports
├── shopping-list-page.tsx            # Main shopping list page
├── shopping-list-item.tsx            # ✅ Already exists
├── shopping-list-item.stories.tsx    # ✅ Already exists
├── shopping-form.tsx                 # Add/edit shopping item form
├── shopping-empty-state.tsx          # Empty list illustration
├── shopping-header.tsx               # Page header with actions
├── shopping-filters.tsx              # Filter chips (category, checked)
├── shopping-actions.tsx              # Bulk action buttons
├── add-to-shopping-button.tsx        # Button to add item to shopping list
├── restock-alert.tsx                 # ✅ Already exists
└── restock-alert.stories.tsx         # ✅ Already exists
```

### Component Descriptions

#### 1. ShoppingListPage
Main page component that renders the shopping list.

```tsx
interface ShoppingListPageProps {
  className?: string;
}

// Features:
// - Display list of shopping items
// - Show empty state when no items
// - Filter by category and checked status
// - Show bulk actions (Delete checked, Move to inventory)
// - Floating action button to add new item
```

#### 2. ShoppingForm
Form for adding/editing shopping list items.

```tsx
interface ShoppingFormProps {
  initialData?: CreateShoppingListItemInput;
  onSubmit: (data: CreateShoppingListItemInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Features:
// - Name input (required)
// - Category picker (from user config)
// - Quantity + Unit steppers
// - Notes textarea (optional)
// - Reuses existing pickers from components/food/
```

#### 3. ShoppingEmptyState
Empty state illustration with call-to-action.

```tsx
interface ShoppingEmptyStateProps {
  onAddItem: () => void;
  quickAddFromInventory?: () => void;
}

// Features:
// - Friendly illustration
// - "Add your first item" button
// - "Quick-add from inventory" link
```

#### 4. ShoppingHeader
Page header with title and bulk actions.

```tsx
interface ShoppingHeaderProps {
  itemCount: number;
  checkedCount: number;
  onDeleteChecked: () => void;
  onMoveToInventory: () => void;
}

// Features:
// - Title: "Shopping List"
// - Subtitle: "3 of 8 items in cart"
// - Action buttons: "Delete Checked", "Move to Inventory"
```

#### 5. ShoppingFilters
Filter chips for shopping list.

```tsx
interface ShoppingFiltersProps {
  selectedCategory: FoodCategory | 'all';
  onCategoryChange: (category: FoodCategory | 'all') => void;
  showCheckedOnly: boolean;
  onShowCheckedOnlyChange: (show: boolean) => void;
}

// Features:
// - Category chips (reuse FilterChips component)
// - "Show checked only" toggle
```

#### 6. AddToShoppingButton
Component to add items from inventory to shopping list.

```tsx
interface AddToShoppingButtonProps {
  foodItem: FoodItem;
  onAdd: (item: CreateShoppingListItemInput) => void;
}

// Features:
// - Button in FoodItemCard action menu
// - Pre-fills shopping item with food item data
```

---

## User Flows

### Flow 1: Add Item to Shopping List (Manual)

1. User navigates to Shopping List tab
2. Taps floating "+" button
3. ShoppingForm modal opens
4. User enters:
   - Item name (required)
   - Category (from picker)
   - Quantity + unit
   - Optional notes
5. User taps "Save"
6. Item appears in list with optimistic update

### Flow 2: Add from Inventory (Quick-Add)

1. User views inventory dashboard
2. Taps "..." menu on FoodItemCard
3. Selects "Add to Shopping List"
4. Confirmation sheet appears with pre-filled data
5. User adjusts quantity if needed
6. Taps "Add to List"
7. Item added to shopping list, toast confirmation shown

### Flow 3: Mark Item as Purchased

1. User views shopping list
2. Taps checkbox on item
3. Item immediately shows checked state (optimistic)
4. Item moves to bottom of list (sorted by checked status)
5. Badge updates: "3 of 8 items in cart"

### Flow 4: Move Purchased Items to Inventory

1. User has checked items in shopping list
2. Taps "Move to Inventory" button
3. Confirmation modal: "Move 3 checked items to inventory?"
4. For each checked item:
   - Create new FoodItem in inventory
   - Set purchase date to today (`YYYY-MM-DD`)
   - Soft-delete from shopping list (`deleted = true`)
5. Success toast: "3 items added to inventory"
6. Shopping list refreshes with unchecked items only

### Flow 5: Delete Shopping List Item

1. User swipes left on item (or taps "..." menu)
2. Delete confirmation appears
3. User confirms
4. Item removed with optimistic update
5. Undo toast appears for 3 seconds

---

## Database Schema (Supabase)

```sql
-- shopping_list table
-- Matches existing food_items pattern with soft delete support
CREATE TABLE shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pieces',
  notes TEXT,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  linked_food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Sync tracking
  purchased_at TIMESTAMPTZ,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,  -- Soft delete
  synced BOOLEAN NOT NULL DEFAULT FALSE     -- Sync status (match food_items)
);

-- Indexes for performance (with partial index for soft delete pattern)
CREATE INDEX idx_shopping_list_user_id ON shopping_list(user_id) WHERE deleted = FALSE;
CREATE INDEX idx_shopping_list_checked ON shopping_list(user_id, checked) WHERE deleted = FALSE;
CREATE INDEX idx_shopping_list_category ON shopping_list(user_id, category) WHERE deleted = FALSE;
CREATE INDEX idx_shopping_list_updated_at ON shopping_list(user_id, updated_at DESC) WHERE deleted = FALSE;
CREATE INDEX idx_shopping_list_linked_food_item_id ON shopping_list(linked_food_item_id);

-- Row Level Security
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shopping list"
  ON shopping_list FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted = FALSE);

CREATE POLICY "Users can insert own shopping list items"
  ON shopping_list FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own shopping list items"
  ON shopping_list FOR UPDATE
  USING ((SELECT auth.uid()) = user_id AND deleted = FALSE)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- App uses soft-delete via UPDATE; no DELETE policy needed for MVP.

-- Trigger function specific to shopping_list
CREATE OR REPLACE FUNCTION public.set_shopping_list_timestamps()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_modified = NOW();

  IF NEW.checked IS TRUE AND OLD.checked IS DISTINCT FROM TRUE THEN
    NEW.purchased_at = COALESCE(NEW.purchased_at, NOW());
  ELSIF NEW.checked IS FALSE AND OLD.checked IS TRUE THEN
    NEW.purchased_at = NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER set_shopping_list_timestamps_trigger
  BEFORE UPDATE ON shopping_list
  FOR EACH ROW
  EXECUTE FUNCTION public.set_shopping_list_timestamps();
```

### Schema Design Notes

**Consistency with existing `food_items` table:**
- Added `deleted` and `synced` columns for soft delete pattern
- Added `last_modified` column for sync tracking (matches food_items pattern)
- Kept explicit FK `user_id -> auth.users(id)` for data integrity
- Partial indexes with `WHERE deleted = FALSE` for better query performance
- Used `(SELECT auth.uid())` in RLS policies for better performance at scale
- All text columns use `TEXT` type (consistent with food_items)

**Migration SQL file (to be added):** `supabase/migrations/[timestamp]_create_shopping_list_table.sql`  
(Create it with `supabase migration new create_shopping_list_table` after Supabase CLI is linked for this repo.)

---

## Routing Updates

```typescript
// src/App.tsx - Update routes

const routes = [
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <InventoryDashboard /> },
      { path: 'list', element: <ShoppingListPage /> },  // NEW
      { path: 'recipes', element: <RecipeSuggestionsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  // ... other routes
];
```

```typescript
// src/components/layout/main-bottom-nav.tsx - Verify tab config

const defaultNavItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'list', label: 'List', href: '/list' },  // Already exists
  { id: 'recipes', label: 'Recipes', href: '/recipes' },
  { id: 'settings', label: 'Settings', href: '/settings' },
];
```

---

## Implementation Checklist

### Phase 1: Data Layer
- [x] Add `ShoppingListItem` type to `src/api/types.ts`
- [x] Create `src/api/shopping-list.api.ts` with interface + mock implementation
- [x] Add Supabase implementation with mapper functions
- [x] Create database migration SQL script

### Phase 2: Query Hooks
- [x] Create `src/api/use-shopping-list.ts` with query hooks
- [x] Create `src/api/use-shopping-list-mutations.ts` with mutations
- [x] Add optimistic update patterns to all mutations

### Phase 3: UI State
- [x] Create `src/store/shopping.store.ts` for UI state
- [x] Persist filters to localStorage

### Phase 4: Components
- [x] Create `ShoppingForm` component
- [x] Create `ShoppingEmptyState` component
- [x] Create `ShoppingHeader` component
- [ ] Create `ShoppingFilters` component
- [ ] Create `ShoppingActions` component
- [x] Create `ShoppingListPage` main component
- [ ] Create `AddToShoppingButton` component
- [x] Update `ShoppingListItem` if needed (already exists)

### Phase 5: Pages & Routing
- [x] Replace `/list` placeholder in `App.tsx` with `ShoppingListPage`
- [x] Verify/update nav label/icon in `MainBottomNav` if needed
- [ ] Create page-level Storybook stories

### Phase 6: Integration
- [ ] Add "Add to Shopping List" action to `FoodItemCard`
- [x] Implement "Move to Inventory" bulk action
- [x] Add confirmation dialogs for destructive actions
- [x] Add toast notifications for user feedback

### Phase 7: Polish
- [x] Add loading states
- [ ] Add error states with retry
- [x] Add empty state illustrations
- [ ] Test optimistic updates
- [ ] Test error rollback
- [ ] Write Storybook stories for all components
- [ ] Manual testing on mobile device

---

## Technical Considerations

### 1. Sort Order

Shopping list items should be sorted by:
1. **Checked status** (unchecked first, then checked)
2. **Category** (alphabetical within each status group)
3. **Creation date** (newest first within each category)

```typescript
function sortShoppingList(items: ShoppingListItem[]): ShoppingListItem[] {
  return items.sort((a, b) => {
    // Unchecked items first
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    // Then by category
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    // Then by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
```

### 2. Move to Inventory Logic

When moving checked items to inventory:

```typescript
async function movePurchasedToInventory(userId: string): Promise<FoodItem[]> {
  // 1. Get all checked shopping items
  const checkedItems = await shoppingListApi.getAll(userId);
  const toMove = checkedItems.filter(item => item.checked);

  // 2. For each item, create a FoodItem
  const createdItems: FoodItem[] = [];
  for (const shoppingItem of toMove) {
    const foodItem = await foodItemsApi.create({
      name: shoppingItem.name,
      category: shoppingItem.category,
      quantity: shoppingItem.quantity,
      unit: shoppingItem.unit,
      storage: 'pantry', // Default, user can edit
      expiryDate: null,  // User can set later
      purchaseDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      notes: shoppingItem.notes,
    }, userId);

    createdItems.push(foodItem);

    // 3. Soft-delete from shopping list
    await shoppingListApi.delete(shoppingItem.id, userId);
  }

  return createdItems;
}
```

### 3. Link to Inventory Item

Optional enhancement: When creating a shopping item from a food item, store the reference:

```typescript
// When adding from inventory
const shoppingItem = await shoppingListApi.create({
  ...foodItemData,
  linkedFoodItemId: foodItem.id,  // Link back to original
}, userId);

// When moving back to inventory, update instead of create
if (shoppingItem.linkedFoodItemId) {
  await foodItemsApi.update({
    id: shoppingItem.linkedFoodItemId,
    quantity: shoppingItem.quantity,
    purchaseDate: new Date().toISOString().slice(0, 10),
  }, userId);
} else {
  // Create new item
  await foodItemsApi.create(...);
}
```

### 4. Conflict Resolution

What if the linked food item was deleted?

```typescript
// In movePurchasedToInventory
const foodItem = shoppingItem.linkedFoodItemId
  ? await foodItemsApi.getById(shoppingItem.linkedFoodItemId, userId)
  : null;

if (foodItem) {
  // Update existing
  await foodItemsApi.update({ id: foodItem.id, quantity: shoppingItem.quantity }, userId);
} else {
  // Create new
  await foodItemsApi.create({...}, userId);
}
```

---

## Open Questions

1. **Multiple Lists**: Should users be able to create multiple shopping lists (e.g., "Weekly Groceries", "Party Supplies")?
   - **Decision**: Start with single list, add multiple lists later if requested

2. **Smart Suggestions**: Should we suggest adding items to shopping list when inventory is low?
   - **Decision**: Yes, use existing `RestockAlert` component for this

3. **Recurring Items**: Should users be able to set items as "always on list"?
   - **Decision**: Not in MVP, consider for v2

4. **Price Tracking**: Should users be able to add prices for budget tracking?
   - **Decision**: Not in MVP, consider for v2

5. **Store Categories**: Should we have store-specific categories (produce, dairy, frozen)?
   - **Decision**: Use existing user-configurable categories, user can organize as needed

---

## Success Criteria

- [x] Users can add items to shopping list
- [x] Users can mark items as checked
- [x] Users can delete items from list
- [x] Users can move checked items to inventory
- [ ] Users can add items from inventory to shopping list
- [x] List persists across app restarts
- [ ] Optimistic updates work correctly
- [ ] Error handling with rollback works
- [ ] UI is responsive on mobile
- [ ] Storybook stories exist for all components

---

## Estimated Timeline

- **Phase 1-2 (Data Layer)**: 4-6 hours
- **Phase 3-4 (State + Components)**: 6-8 hours
- **Phase 5-6 (Routing + Integration)**: 4-6 hours
- **Phase 7 (Polish + Testing)**: 4-6 hours

**Total**: 18-26 hours (2.5 - 3.5 days)

---

## MCP Tools for Database Operations

This project should use **Supabase MCP tools** directly.

### MCP Tools to Use

```bash
# Inspect schema/state
mcp__supabase__list_tables(schemas: ['public'])
mcp__supabase__list_migrations()
mcp__supabase__list_extensions()

# Run SQL checks and data validation
mcp__supabase__execute_sql(query)

# Apply DDL migrations safely
mcp__supabase__apply_migration(name, query)

# Generate DB types and run advisors
mcp__supabase__generate_typescript_types()
mcp__supabase__get_advisors(type: 'security' | 'performance')
```

### Recommended MCP Workflow for Shopping List

1. Validate current DB state (`list_tables`, `list_migrations`) before changing schema.
2. Apply migration with `apply_migration` (do not run DDL via `execute_sql`).
3. Re-check table schema with `list_tables` + targeted `execute_sql`.
4. Run advisors (`security`, `performance`) and address warnings.
5. Generate TypeScript types and align API mappers.

### Example: Apply Shopping List Migration via MCP

```typescript
await mcp__supabase__apply_migration({
  name: 'create_shopping_list_table',
  query: `
    -- create table, indexes, rls policies, trigger function
    -- SQL from "Database Schema (Supabase)" section
  `,
});
```

### CLI/Repo Notes

- This repo currently does not include a `supabase/` directory.
- If the team uses Supabase CLI for versioned SQL files, first link/init CLI and then run:

```bash
supabase migration new create_shopping_list_table
supabase db push --linked
```

---

## References

- [System Patterns](../../../memory-bank/systemPatterns.md) - Architecture patterns
- [Product Context](../../../memory-bank/productContext.md) - User experience goals
- [API Types](../../../src/api/types.ts) - Existing type definitions
- [Food Items API](../../../src/api/food-items.api.ts) - Reference implementation
- [UI Store](../../../src/store/ui-store.ts) - Zustand pattern reference
- [Supabase Dashboard](https://app.supabase.com/project/cwbyqojuqkgihhgdrvch/editor) - Direct SQL editor
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli) - Command-line tools
