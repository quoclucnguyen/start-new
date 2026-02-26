# Recipe Suggestions Feature - Implementation Plan

**Created:** 2026-02-26
**Status:** Planned (Checklist: 2 done / 36 pending, depends on recipe-management core)
**Priority:** High (After Shopping List stabilization)

---

## Overview

Recipe Suggestions helps users answer: "What can I cook right now with what I already have?"
This feature closes the waste-reduction loop by combining inventory freshness with recipe matching.

### Dependency Note

- Primary recipe source-of-truth should come from:
  - [Recipe Management Plan](../recipe-management/plan.md)
- Until Recipe Management is implemented, suggestions can temporarily use seeded mock recipes.

### Problem Solved

- Users have ingredients but do not know what to cook before items expire.
- Users need fast, mobile-friendly recipe ideas based on current pantry/fridge.
- Users need a clear "what is missing" list and one-tap add-to-shopping-list flow.
- Users need recipe details with step-by-step instructions once a recipe is chosen.

### Scope (MVP)

1. Recipe database (seeded catalog, read-first architecture)
2. Ingredient matching against current inventory
3. Missing ingredients per recipe
4. Recipe detail view with instructions

### Success Metrics

- Suggestions tab loads first results in < 2s on warm cache.
- Each recipe card shows clear match ratio and missing ingredients.
- Users can add missing ingredients to shopping list in <= 2 taps.
- Recipe detail is readable on mobile without layout shift.
- Matching results are deterministic for the same inventory snapshot.

---

## Data Model

### TypeScript Types

```typescript
// src/api/types.ts - Add recipe types

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeSource = 'system' | 'user';

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  cookTimeMinutes: number;
  difficulty: RecipeDifficulty;
  servings: number;
  tags: string[];
  source: RecipeSource;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  name: string;                 // Display name (e.g. "Bell Peppers")
  normalizedName: string;       // Matching key (e.g. "bell pepper")
  quantity?: number;            // Undefined = quantity-agnostic match
  unit?: string;                // Keep string to support cooking units
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

export interface MatchedIngredient {
  recipeIngredientId: string;
  recipeIngredientName: string;
  foodItemId: string;
  foodItemName: string;
  quantitySufficient: boolean;
}

export interface MissingIngredient {
  recipeIngredientId: string;
  name: string;
  quantity?: number;
  unit?: string;
}

export interface RecipeSuggestion {
  recipeId: string;
  matchPercentage: number;      // 0..100
  matchedIngredients: MatchedIngredient[];
  missingIngredients: MissingIngredient[];
  expiringIngredientsUsed: string[]; // Food item IDs
}

export interface RecipeSuggestionItem {
  recipe: Recipe;
  suggestion: RecipeSuggestion;
}

export interface RecipeFilters {
  search?: string;
  maxCookTimeMinutes?: number;
  tags?: string[];
  difficulty?: RecipeDifficulty | 'all';
  suggestedOnly?: boolean;
}
```

### Database Row Types

```typescript
// Snake_case DB row types
export interface DbRecipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cook_time_minutes: number;
  difficulty: string;
  servings: number;
  tags: string[] | null;
  source: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
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

### Recipe API Interface

```typescript
// src/api/recipes.api.ts

export interface IRecipesApi {
  getCatalog(filters: RecipeFilters, userId: string): Promise<Recipe[]>;
  getById(recipeId: string, userId: string): Promise<RecipeDetail | null>;
  getSuggestions(filters: RecipeFilters, userId: string): Promise<RecipeSuggestionItem[]>;
}
```

### Additional Service for Matching

```typescript
// src/api/recipe-matcher.ts

export interface IRecipeMatcher {
  matchRecipes(recipes: RecipeDetail[], inventory: FoodItem[]): RecipeSuggestionItem[];
}
```

### Mapper Functions

```typescript
function mapDbToRecipe(row: DbRecipe): Recipe { }
function mapDbToRecipeIngredient(row: DbRecipeIngredient): RecipeIngredient { }
function mapDbToRecipeStep(row: DbRecipeStep): RecipeStep { }
function mapToRecipeDetail(
  recipe: DbRecipe,
  ingredients: DbRecipeIngredient[],
  steps: DbRecipeStep[],
): RecipeDetail { }
```

### Mock + Supabase Strategy

- Follow same pattern as `food-items.api.ts` and `shopping-list.api.ts`.
- `VITE_USE_MOCK_API === 'true'`:
  - Load catalog from local seeded JSON/TS dataset.
  - Run matching locally in browser.
- Supabase mode:
  - Fetch recipes + ingredients + steps from DB.
  - Run matching in client initially for simpler rollout.
  - Optional future migration: SQL/RPC-based scoring for large catalogs.

---

## Matching Logic

### Ingredient Normalization

Use deterministic normalization before comparison:

1. Lowercase + trim
2. Remove punctuation and extra spaces
3. Singularize common plural forms
4. Alias map (example: "scallion" -> "green onion")

```typescript
const INGREDIENT_ALIASES: Record<string, string> = {
  scallions: 'green onion',
  scallion: 'green onion',
  bell_peppers: 'bell pepper',
};
```

### Match Scoring (MVP)

Score each recipe with weighted components:

- Coverage score (70%): required matched / required total
- Expiry bonus (20%): uses items with `getExpiryStatus(...)` in `expiring` or `soon`
- Time bonus (10%): reward shorter cook time (under 30 min)

```typescript
const score =
  coverageRatio * 70 +
  expiringUsageRatio * 20 +
  quickCookBonus * 10;
```

### Missing Ingredients

- Missing list includes only **required** unmatched ingredients.
- Optional ingredients are shown in detail view but excluded from match percentage.
- If quantity is available on recipe ingredient, annotate insufficiency (present but not enough).

### Sorting

Sort suggestion feed by:

1. `matchPercentage` descending
2. count of expiring ingredients used descending
3. `cookTimeMinutes` ascending
4. `title` ascending (stable tie-break)

---

## TanStack Query Hooks

### Query Hooks

```typescript
// src/api/use-recipes.ts

export const RECIPES_QUERY_KEY = ['recipes'] as const;

export function useRecipeSuggestions(filters: RecipeFilters) { }
export function useRecipeDetail(recipeId: string | null) { }
export function useRecipeCatalog(filters: RecipeFilters) { }
```

### Mutation Hook (Integration with Shopping List)

```typescript
// src/api/use-recipe-mutations.ts

export function useAddMissingIngredientsToShoppingList() {
  // Create shopping list items from recipe missing ingredients
  // De-duplicate by normalized ingredient + unchecked existing items
}
```

### Query Key Design

```typescript
export const recipeKeys = {
  all: ['recipes'] as const,
  suggestions: (userId: string, filters: RecipeFilters) =>
    [...recipeKeys.all, 'suggestions', userId, filters] as const,
  detail: (recipeId: string, userId: string) =>
    [...recipeKeys.all, 'detail', recipeId, userId] as const,
  catalog: (userId: string, filters: RecipeFilters) =>
    [...recipeKeys.all, 'catalog', userId, filters] as const,
};
```

---

## UI State Management (Zustand)

Keep only transient UI state in Zustand, no server recipe data:

```typescript
// src/store/recipes.store.ts

interface RecipesUIState {
  filters: RecipeFilters;
  selectedRecipeId: string | null;
  isFilterSheetOpen: boolean;
  setFilters: (filters: Partial<RecipeFilters>) => void;
  resetFilters: () => void;
  setSelectedRecipeId: (id: string | null) => void;
  setFilterSheetOpen: (open: boolean) => void;
}
```

Persist only filter preferences:

- `maxCookTimeMinutes`
- selected `tags`
- `difficulty`
- `suggestedOnly`

---

## Component Structure

```
src/components/recipes/
├── index.ts
├── recipe-card.tsx                    # ✅ Already exists
├── ingredient-tag.tsx                 # ✅ Already exists
├── recipe-suggestions-page.tsx        # NEW main route content
├── recipe-filters.tsx                 # NEW filter chips/sheet
├── recipe-suggestion-list.tsx         # NEW list + sections
├── recipe-empty-state.tsx             # NEW no-results state
├── recipe-detail-sheet.tsx            # NEW step-by-step instructions
├── recipe-ingredients-panel.tsx       # NEW available/missing split
├── add-missing-ingredients-button.tsx # NEW CTA -> shopping list
└── *.stories.tsx                      # NEW stories per new component
```

### Component Notes

1. Reuse existing `RecipeCard` visual style and extend props if needed.
2. `RecipeSuggestionsPage` orchestrates data hooks + UI states.
3. `RecipeDetailSheet` is preferred for mobile UX; full-page detail is optional fallback.
4. `IngredientTag` is reused in both feed cards and detail ingredient section.

---

## User Flows

### Flow 1: View Suggested Recipes

1. User opens `/recipes`.
2. App fetches inventory and recipe catalog.
3. Matcher computes scores and missing ingredients.
4. Feed shows:
   - Featured "use it up" recipe
   - Suggested recipes list
   - Match percentages and missing labels

### Flow 2: Filter Suggestions

1. User opens filter sheet.
2. User selects cook time, difficulty, tags.
3. Feed updates via query key change and local filtering.
4. "No results" state appears with clear reset CTA.

### Flow 3: Open Recipe Detail

1. User taps "View Recipe" or "Cook Now".
2. Detail sheet/page opens with:
   - Recipe hero and metadata
   - Ingredients (available vs missing)
   - Step-by-step instructions
3. User can close and return to current scroll position in feed.

### Flow 4: Add Missing Ingredients to Shopping List

1. User taps "Add Missing".
2. App builds shopping items from missing required ingredients.
3. Existing unchecked shopping items are deduplicated by normalized name.
4. Toast confirms count added, e.g. "3 ingredients added to Shopping List".

---

## Database Schema (Supabase)

```sql
-- recipes catalog
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cook_time_minutes INTEGER NOT NULL CHECK (cook_time_minutes > 0),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  servings INTEGER NOT NULL DEFAULT 1 CHECK (servings > 0),
  tags TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'system' CHECK (source IN ('system', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

CREATE INDEX idx_recipes_active ON recipes(is_active);
CREATE INDEX idx_recipes_difficulty_time ON recipes(difficulty, cook_time_minutes);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_normalized_name ON recipe_ingredients(normalized_name);
CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

-- Read access: active system recipes + own user recipes
CREATE POLICY "Read recipes"
  ON recipes FOR SELECT
  USING (
    is_active = TRUE
    AND (source = 'system' OR created_by = (SELECT auth.uid()))
  );

CREATE POLICY "Read recipe ingredients"
  ON recipe_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND r.is_active = TRUE
        AND (r.source = 'system' OR r.created_by = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Read recipe steps"
  ON recipe_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM recipes r
      WHERE r.id = recipe_steps.recipe_id
        AND r.is_active = TRUE
        AND (r.source = 'system' OR r.created_by = (SELECT auth.uid()))
    )
  );
```

### Migration Files

- `create_recipes_tables`
- `seed_system_recipes` (optional separate migration for seed data)

---

## Routing Updates

```typescript
// src/App.tsx

{
  path: "recipes",
  element: <RecipeSuggestionsPage />,
},
{
  path: "recipes/:recipeId",
  element: <RecipeDetailPage />, // Optional if using full-page detail
}
```

Notes:

- Replace existing "Recipes (Coming Soon)" placeholder.
- Keep bottom nav tab unchanged (`/recipes` already mapped).
- If using detail sheet only, `/recipes/:recipeId` route can be deferred.

---

## Implementation Checklist

### Phase 1: Data Layer
- [ ] Add recipe-related types to `src/api/types.ts`
- [ ] Create `src/api/recipes.api.ts` with interface + mock implementation
- [ ] Add Supabase implementation for recipes/ingredients/steps
- [ ] Add mapper functions (snake_case <-> camelCase)
- [ ] Create initial recipe seed dataset for mock mode

### Phase 2: Matching Engine
- [ ] Create `src/api/recipe-matcher.ts`
- [ ] Implement ingredient normalization + alias dictionary
- [ ] Implement match scoring formula
- [ ] Implement missing ingredient extraction
- [ ] Add deterministic sorting function

### Phase 3: Query Hooks
- [ ] Create `src/api/use-recipes.ts`
- [ ] Create `src/api/use-recipe-mutations.ts`
- [ ] Wire recipe suggestions to inventory data (`useFoodItems`)
- [ ] Add optimistic UX for add-missing action (toast + query invalidation)

### Phase 4: UI State (Zustand)
- [ ] Create `src/store/recipes.store.ts`
- [ ] Persist filter preferences only

### Phase 5: Components
- [x] Existing `RecipeCard` base component
- [x] Existing `IngredientTag` base component
- [ ] Create `RecipeSuggestionsPage`
- [ ] Create `RecipeFilters`
- [ ] Create `RecipeSuggestionList`
- [ ] Create `RecipeEmptyState`
- [ ] Create `RecipeDetailSheet` (or detail page)
- [ ] Create `RecipeIngredientsPanel`
- [ ] Create `AddMissingIngredientsButton`

### Phase 6: Integration
- [ ] Replace `/recipes` route placeholder in `src/App.tsx`
- [ ] Integrate add-missing flow with shopping list API/mutations
- [ ] Add loading/error/empty states
- [ ] Add analytics event hooks (view recipe, add missing)

### Phase 7: Database
- [ ] Apply migrations for recipe tables
- [ ] Seed initial system recipes
- [ ] Validate RLS policies with authenticated user
- [ ] Run Supabase security/performance advisors

### Phase 8: Validation & QA
- [ ] Add Storybook stories for new recipe components
- [ ] Manual verification on mobile viewport
- [ ] Verify performance on large inventory (100+ items)
- [ ] Verify matching edge cases (aliases, optional ingredients, no inventory)
- [ ] Run `npm run lint && npm run build`

---

## Technical Considerations

### 1. Matching Accuracy vs Complexity

- MVP should use deterministic text normalization + simple scoring.
- Avoid early NLP/AI dependency; improve aliases iteratively based on user data.

### 2. Unit Conversion

- Many recipe units (tbsp, tsp, cup) do not map directly to inventory units.
- For MVP, quantity sufficiency is best-effort; if units mismatch, mark "available but quantity uncertain".

### 3. Catalog Size

- For <= 500 recipes, client-side matching is acceptable.
- If catalog grows, move scoring into Supabase RPC/Edge Function.

### 4. Shopping List Deduplication

- Before adding missing ingredients, check existing unchecked shopping items.
- Merge quantities when units are compatible; otherwise append note instead of hard merge.

### 5. Empty Inventory Behavior

- When inventory is empty, show curated popular recipes instead of blank page.
- Clear CTA: "Add food items to get personalized suggestions."

---

## Open Questions

1. Should recipe catalog be read-only (system-curated) in MVP, or allow user-created recipes immediately?
   - Proposed: read-only for MVP.

2. Should recipe detail include nutrition data (calories/macros)?
   - Proposed: defer to v2.

3. Should "Add Missing" include optional ingredients?
   - Proposed: required only by default, optional toggle in detail view.

4. Should completed cooking action reduce inventory quantities automatically?
   - Proposed: defer; require explicit confirm flow in future.

---

## Estimated Timeline

- **Phase 1-2 (Data + Matching)**: 8-12 hours
- **Phase 3-5 (Hooks + UI + Components)**: 10-14 hours
- **Phase 6-7 (Integration + DB)**: 6-10 hours
- **Phase 8 (QA + Storybook + polish)**: 4-6 hours

**Total**: 28-42 hours (4-6 working days)

---

## References

- [Recipe Management Plan](../recipe-management/plan.md) - Foundational CRUD/editor and recipe data source
- [Shopping List Plan](../shopping-list/plan.md) - Pattern for API/hooks/mutations
- [System Patterns](../../memory-bank/systemPatterns.md) - Architecture and data-flow rules
- [Product Context](../../memory-bank/productContext.md) - User problem and success goals
- [Recipe Mockup](../../mockup/recipe_suggestions/code.html) - UI direction for suggestions feed
- [Current Route Placeholder](../../src/App.tsx) - `/recipes` currently "Coming Soon"
