# Recipe Management Feature - Implementation Plan

**Created:** 2026-02-26
**Status:** Implementation In Progress (Checklist: 16 done / 10 pending, quality gate pending)
**Priority:** High (Foundation for Recipe Suggestions)

---

## Overview

Recipe Management provides the source-of-truth for recipe data in the app: create, edit, organize, and soft-delete recipes with structured ingredients and cooking steps.

Without this layer, Recipe Suggestions only works with static seed data and cannot scale to user-owned recipes.

### Current Assessment (2026-02-26)

- Core implementation exists in codebase (types, API mock/Supabase, hooks, state store, main management UI).
- Supabase migration is applied and recipe tables are present: `recipes`, `recipe_ingredients`, `recipe_steps`.
- Remaining work is mainly routing alignment, story coverage, and quality gate fixes (`lint`/`build` currently failing).

### Problem Solved

- Users need a place to maintain personal recipes, not just view suggestions.
- Recipe Suggestions needs reliable, normalized recipe data for matching.
- Product needs consistent recipe CRUD flow with mobile UX and Supabase persistence.

### Scope (MVP)

1. Recipe CRUD (title, metadata, image, tags)
2. Ingredient management (ordered list, optional flag, normalized names)
3. Step management (ordered instructions)
4. Soft delete + restore-ready data model
5. Basic list/search/filter for user recipes

### Success Metrics

- User can create a complete recipe in < 2 minutes on mobile.
- Recipe edit/save latency < 1.5s (p50, warm network).
- No data loss when editing ingredients/steps.
- Suggestions can consume user-created recipes immediately after save.

---

## Data Model

### TypeScript Types

```typescript
// src/api/types.ts - recipe management additions

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeVisibility = 'private' | 'shared';
export type RecipeSource = 'system' | 'user';

export interface Recipe {
  id: string;
  userId: string | null;         // null for system recipes
  title: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes: number;
  prepTimeMinutes?: number;
  servings: number;
  difficulty: RecipeDifficulty;
  tags: string[];
  visibility: RecipeVisibility;
  source: RecipeSource;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  name: string;
  normalizedName: string;
  quantity?: number;
  unit?: string;
  optional: boolean;
  sortOrder: number;
}

export interface RecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  instruction: string;
  estimatedMinutes?: number;
}

export interface RecipeDetail extends Recipe {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface CreateRecipeInput {
  title: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes: number;
  prepTimeMinutes?: number;
  servings: number;
  difficulty: RecipeDifficulty;
  tags?: string[];
  visibility?: RecipeVisibility;
  ingredients: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    optional?: boolean;
  }>;
  steps: Array<{
    instruction: string;
    estimatedMinutes?: number;
  }>;
}

export interface UpdateRecipeInput {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes?: number;
  prepTimeMinutes?: number;
  servings?: number;
  difficulty?: RecipeDifficulty;
  tags?: string[];
  visibility?: RecipeVisibility;
}
```

### Database Row Types

```typescript
export interface DbRecipe {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  cook_time_minutes: number;
  prep_time_minutes: number | null;
  servings: number;
  difficulty: string;
  tags: string[] | null;
  visibility: string;
  source: string;
  created_at: string;
  updated_at: string;
  last_modified: string;
  deleted: boolean;
  synced: boolean;
}

export interface DbRecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  normalized_name: string;
  quantity: number | null;
  unit: string | null;
  optional: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbRecipeStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  estimated_minutes: number | null;
  created_at: string;
}
```

---

## API Layer Design

### Recipe Management API Interface

```typescript
// src/api/recipes-management.api.ts

export interface IRecipesManagementApi {
  list(userId: string, options?: { search?: string; tags?: string[] }): Promise<Recipe[]>;
  getById(id: string, userId: string): Promise<RecipeDetail | null>;
  create(input: CreateRecipeInput, userId: string): Promise<RecipeDetail>;
  update(input: UpdateRecipeInput, userId: string): Promise<Recipe>;
  replaceIngredients(
    recipeId: string,
    ingredients: CreateRecipeInput['ingredients'],
    userId: string,
  ): Promise<RecipeIngredient[]>;
  replaceSteps(
    recipeId: string,
    steps: CreateRecipeInput['steps'],
    userId: string,
  ): Promise<RecipeStep[]>;
  duplicate(recipeId: string, userId: string): Promise<RecipeDetail>;
  delete(recipeId: string, userId: string): Promise<void>; // soft delete
}
```

### Mapper Functions

```typescript
function normalizeIngredientName(name: string): string { }
function mapDbToRecipe(row: DbRecipe): Recipe { }
function mapDbToIngredient(row: DbRecipeIngredient): RecipeIngredient { }
function mapDbToStep(row: DbRecipeStep): RecipeStep { }
function mapCreateRecipeToDb(input: CreateRecipeInput, userId: string): Omit<DbRecipe, 'id' | 'created_at' | 'updated_at' | 'last_modified' | 'deleted' | 'synced'> { }
```

### Implementation Strategy

- Follow current dual implementation pattern:
  - Supabase API for production
  - localStorage mock API when `VITE_USE_MOCK_API === 'true'`
- Keep explicit snake_case/camelCase mappers.
- Use batched/transaction-like write flow for create/update:
  1. Upsert recipe row
  2. Replace ingredients
  3. Replace steps

---

## TanStack Query Hooks

### Query Hooks

```typescript
// src/api/use-recipes-management.ts

export const RECIPES_MANAGEMENT_QUERY_KEY = ['recipes-management'] as const;

export function useRecipesList(options?: { search?: string; tags?: string[] }) { }
export function useRecipeById(recipeId: string | null) { }
```

### Mutation Hooks

```typescript
// src/api/use-recipes-management-mutations.ts

export function useCreateRecipe() { }
export function useUpdateRecipe() { }
export function useReplaceRecipeIngredients() { }
export function useReplaceRecipeSteps() { }
export function useDuplicateRecipe() { }
export function useDeleteRecipe() { }
```

### Optimistic Update Rules

- Optimistically append new recipe in list after create.
- Optimistically update title/tags/time in list after edit.
- Soft delete immediately from list, rollback on error.
- Always invalidate detail query on settle.

---

## UI State Management (Zustand)

```typescript
// src/store/recipes-management.store.ts

interface RecipesManagementUIState {
  search: string;
  selectedTags: string[];
  isEditorOpen: boolean;
  editingRecipeId: string | null;
  draftDirty: boolean;
  setSearch: (value: string) => void;
  setSelectedTags: (tags: string[]) => void;
  openCreateEditor: () => void;
  openEditEditor: (recipeId: string) => void;
  closeEditor: () => void;
  setDraftDirty: (dirty: boolean) => void;
}
```

Persist:

- `search`
- `selectedTags`

Do not persist unsaved draft content in MVP.

---

## Component Structure

```
src/components/recipes/
├── index.ts
├── recipe-management-page.tsx          # NEW list + search + actions
├── recipe-editor-sheet.tsx             # NEW create/edit shell
├── recipe-editor-form.tsx              # NEW metadata form
├── ingredient-editor-list.tsx          # NEW ingredient rows
├── step-editor-list.tsx                # NEW step rows
├── recipe-list-item.tsx                # NEW compact item row/card
├── recipe-delete-dialog.tsx            # NEW delete confirmation
├── recipe-management-empty-state.tsx   # NEW empty state
└── *.stories.tsx                       # NEW stories
```

### UX Guidelines

1. Mobile-first editor in bottom sheet/full-screen sheet.
2. Large touch targets for reordering/removing ingredients and steps.
3. Autosizing textareas for step instructions.
4. Inline validation with minimal friction.

---

## User Flows

### Flow 1: Create Recipe

1. User opens recipe management page.
2. User taps "New Recipe".
3. User fills metadata, ingredients, steps.
4. User taps Save.
5. Recipe appears in list and becomes available to suggestions.

### Flow 2: Edit Recipe

1. User taps existing recipe.
2. Editor opens with current values.
3. User updates ingredients/steps.
4. Save persists and invalidates suggestions cache.

### Flow 3: Duplicate Recipe

1. User opens row actions.
2. User selects Duplicate.
3. App clones recipe as "[Copy] {title}".
4. User edits copy and saves.

### Flow 4: Soft Delete Recipe

1. User opens row actions -> Delete.
2. Confirmation dialog appears.
3. On confirm, recipe is soft-deleted (`deleted = true`).
4. Recipe is removed from management list and suggestions.

---

## Database Schema (Supabase)

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cook_time_minutes INTEGER NOT NULL CHECK (cook_time_minutes > 0),
  prep_time_minutes INTEGER,
  servings INTEGER NOT NULL DEFAULT 1 CHECK (servings > 0),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared')),
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('system', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  synced BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  optional BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number > 0),
  instruction TEXT NOT NULL,
  estimated_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(recipe_id, step_number)
);

CREATE INDEX idx_recipes_user_id ON recipes(user_id) WHERE deleted = FALSE;
CREATE INDEX idx_recipes_source ON recipes(source) WHERE deleted = FALSE;
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_normalized_name ON recipe_ingredients(normalized_name);
CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own or system recipes"
  ON recipes FOR SELECT
  USING (
    deleted = FALSE
    AND (
      source = 'system'
      OR user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Insert own user recipes"
  ON recipes FOR INSERT
  WITH CHECK (
    source = 'user'
    AND user_id = (SELECT auth.uid())
  );

CREATE POLICY "Update own user recipes"
  ON recipes FOR UPDATE
  USING (
    source = 'user'
    AND user_id = (SELECT auth.uid())
    AND deleted = FALSE
  )
  WITH CHECK (
    source = 'user'
    AND user_id = (SELECT auth.uid())
  );

CREATE POLICY "Read recipe ingredients"
  ON recipe_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND r.deleted = FALSE
        AND (r.source = 'system' OR r.user_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Write own recipe ingredients"
  ON recipe_ingredients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND r.source = 'user'
        AND r.user_id = (SELECT auth.uid())
        AND r.deleted = FALSE
    )
  );

CREATE POLICY "Read recipe steps"
  ON recipe_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_steps.recipe_id
        AND r.deleted = FALSE
        AND (r.source = 'system' OR r.user_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Write own recipe steps"
  ON recipe_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_steps.recipe_id
        AND r.source = 'user'
        AND r.user_id = (SELECT auth.uid())
        AND r.deleted = FALSE
    )
  );
```

### Migration Notes

- Migration 1: `create_recipe_management_tables`
- Migration 2: `seed_system_recipes` (optional, reusable by suggestions)
- Keep schema compatible with `recipe-suggestions` plan.

---

## Routing Updates

```typescript
// src/App.tsx
{
  path: "recipes",
  element: <RecipeSuggestionsPage />, // existing target
},
{
  path: "recipes/manage",
  element: <RecipeManagementPage />,
},
{
  path: "recipes/manage/new",
  element: <RecipeEditorPage mode="create" />,
},
{
  path: "recipes/manage/:id",
  element: <RecipeEditorPage mode="edit" />,
}
```

Navigation entry points:

- Add "Manage Recipes" action in `/recipes` top bar.
- Optional shortcut in Settings page.

---

## Implementation Checklist

### Phase 1: Types + API
- [x] Add recipe management types to `src/api/types.ts`
- [x] Create `src/api/recipes-management.api.ts`
- [x] Implement mock API with localStorage persistence
- [x] Implement Supabase API with mapper functions

### Phase 2: Query Hooks + Mutations
- [x] Create `src/api/use-recipes-management.ts`
- [x] Create `src/api/use-recipes-management-mutations.ts`
- [x] Add optimistic updates for create/update/delete
- [ ] Invalidate recipe suggestions queries on recipe mutation

### Phase 3: UI State
- [x] Create `src/store/recipes-management.store.ts`
- [x] Persist filter/search preferences

### Phase 4: Components
- [x] Create `RecipeManagementPage`
- [x] Create `RecipeEditorSheet` / `RecipeEditorForm`
- [x] Create `IngredientEditorList`
- [x] Create `StepEditorList`
- [x] Create delete confirmation + empty state

### Phase 5: Routing + Integration
- [ ] Add `/recipes/manage` routes in `src/App.tsx` (current state uses `/recipes` directly for management page)
- [ ] Add entry action from suggestions page
- [ ] Integrate image upload reuse (`lib/image-upload.ts`) if image is enabled

### Phase 6: Database
- [x] Apply migrations for recipes/ingredients/steps
- [ ] Validate RLS with authenticated users
- [x] Run `security` and `performance` advisors
- [ ] Generate TypeScript DB types if used in project workflow

### Phase 7: QA + Docs
- [ ] Add Storybook stories for management/editor components (partial: list item + ingredient/step editor only)
- [ ] Verify mobile usability for long ingredient/step lists
- [ ] Verify rollback behavior on failed save/delete
- [ ] Run `npm run lint && npm run build` (currently failing)

---

## Technical Considerations

### 1. Draft Handling

- MVP uses explicit Save, not autosave, to keep mutation logic predictable.
- Unsaved changes warning should block accidental close.

### 2. Ingredient Normalization

- Normalize at write time and persist `normalized_name`.
- This reduces recompute cost during suggestions matching.

### 3. Replace vs Patch for Nested Arrays

- Ingredients and steps are easier to maintain with replace-all strategy per save.
- Tradeoff: higher write volume but simpler consistency.

### 4. System vs User Recipes

- System recipes are read-only.
- User recipes are fully editable by owner only.

### 5. Soft Delete Consistency

- Follow existing project pattern: `deleted`, `last_modified`, `synced`.
- Keep historical records and avoid hard delete in MVP.

---

## Open Questions

1. Should user recipes support collaborative sharing in MVP?
   - Proposed: no, single-owner only.

2. Should recipe editor support drag-and-drop reorder for steps/ingredients now?
   - Proposed: simple up/down controls for MVP.

3. Should image upload be required?
   - Proposed: optional.

4. Should tags be free text or constrained list?
   - Proposed: free text with quick suggestions.

---

## Estimated Timeline

- **Phase 1-2 (Data + Hooks):** 8-12 hours
- **Phase 3-4 (State + UI Components):** 10-14 hours
- **Phase 5-6 (Routing + DB Integration):** 6-10 hours
- **Phase 7 (QA + Storybook + polish):** 4-6 hours

**Total:** 28-42 hours (4-6 working days)

---

## Dependencies

- This plan should be implemented before or in parallel with:
  - [Recipe Suggestions Plan](../recipe-suggestions/plan.md)
- `recipe-suggestions` should consume this source-of-truth instead of hardcoded catalog long-term.

---

## References

- [Recipe Suggestions Plan](../recipe-suggestions/plan.md)
- [Shopping List Plan](../shopping-list/plan.md)
- [API Types](../../src/api/types.ts)
- [Food Items API Pattern](../../src/api/food-items.api.ts)
- [Shopping List API Pattern](../../src/api/shopping-list.api.ts)
- [Current Routes](../../src/App.tsx)
