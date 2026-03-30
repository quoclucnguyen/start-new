# Meal Suggestion Approach

## Goal

Recommend meals that help the user cook with what they already have, with a strong bias toward using items that will expire soon.

This approach is designed to fit the current recipe suggestion flow in:

- [src/api/recipe-matcher.ts](/home/quocl/.cline/worktrees/bcec3/start-new/src/api/recipe-matcher.ts)
- [src/api/use-recipe-suggestions.ts](/home/quocl/.cline/worktrees/bcec3/start-new/src/api/use-recipe-suggestions.ts)
- [src/pages/recipes/components/recipe-suggestions-page.tsx](/home/quocl/.cline/worktrees/bcec3/start-new/src/pages/recipes/components/recipe-suggestions-page.tsx)

It also defines a stricter API contract so the UI, future Supabase RPCs, or an external recommendation service can all produce the same shape.

## Core Recommendation Rules

### 1. Candidate inputs

The matcher consumes:

- Current inventory items that are not deleted
- Recipe catalog entries with normalized ingredients
- Optional UI filters such as max cook time, tags, and difficulty

The matcher should treat each food item as:

- `usable`: not expired, or expired within a configurable grace window if the product type allows it in the future
- `expiring`: expires today or within 1 day
- `soon`: expires within 3 days
- `good`: expires within 7 days
- `fresh`: later than 7 days or no expiry date

For MVP, the app can continue using the existing helper in [src/api/types.ts](/home/quocl/.cline/worktrees/bcec3/start-new/src/api/types.ts).

### 2. Ingredient matching

Matching is inventory-first and should remain deterministic:

- Normalize both recipe ingredients and inventory item names
- Apply alias resolution and simple singularization
- Accept exact match, substring match, or strong word overlap
- Ignore optional recipe ingredients when deciding whether a meal is cookable

This matches the current behavior in [src/api/recipe-matcher.ts](/home/quocl/.cline/worktrees/bcec3/start-new/src/api/recipe-matcher.ts).

### 3. Availability tiers

Each recipe suggestion should be assigned one of four availability tiers:

- `ready_now`: all required ingredients matched
- `needs_1_item`: exactly 1 required ingredient missing
- `needs_few_items`: 2-3 required ingredients missing
- `stretch`: more than 3 required ingredients missing, but at least one meaningful inventory match exists

Recipes with zero matched required ingredients should not appear in the main suggestion list unless the system is in fallback mode.

### 4. Expiry-aware rules

Expiry should directly influence recommendations:

- Recipes using `expiring` items get the strongest boost
- Recipes using `soon` items get a moderate boost
- If multiple recipes use the same urgent item, prefer the one that consumes more of the urgent set with fewer missing ingredients
- Expired items should not contribute positive score
- Items without an expiry date can help coverage, but should not raise urgency

### 5. Coverage and friction rules

Suggestions should reward low-friction cooking:

- Higher required-ingredient coverage ranks higher
- Fewer missing ingredients ranks higher
- Lower cook time ranks higher
- Lower prep complexity ranks higher
- Optional ingredients should improve explanation text, but not dominate score

## Ranking Model

Use a weighted score on `0..100`. The score should be stable, explainable, and cheap to compute client-side or server-side.

### Score components

```text
totalScore =
  ingredientCoverageScore  * 0.45 +
  expiryUrgencyScore       * 0.25 +
  missingIngredientScore   * 0.15 +
  effortScore              * 0.10 +
  varietyScore             * 0.05
```

### Component definitions

`ingredientCoverageScore`

- `matchedRequired / totalRequired * 100`
- Primary ranking factor

`expiryUrgencyScore`

- `100` if recipe uses at least one `expiring` item and uses the highest-priority urgent item in inventory
- `70` if it uses one or more `soon` items
- `40` if it uses only `good` items with expiry dates
- `0` if it uses no expiring signals

`missingIngredientScore`

- `100` for `0` missing required ingredients
- `75` for `1` missing
- `45` for `2-3` missing
- `10` for `4+` missing

`effortScore`

- Derived from cook time and difficulty
- Suggested baseline:
  - `100` for `<= 15 min`
  - `80` for `16-30 min`
  - `55` for `31-45 min`
  - `30` for `> 45 min`
- Apply a small deduction for `medium` and `hard`

`varietyScore`

- Reserved for future use
- Can help avoid showing near-duplicate meals repeatedly
- For MVP, return `0` and keep the field in the contract for forward compatibility

### Tie-break order

When scores are equal:

1. Higher availability tier
2. More urgent ingredients used
3. Fewer missing required ingredients
4. Shorter cook time
5. Lower difficulty
6. Alphabetical recipe title

## Recommendation Buckets

The UI should group results into buckets instead of relying only on a flat list:

- `hero`: top recommendation, usually urgency-led
- `readyNow`: fully cookable meals
- `useItUp`: meals that consume urgent inventory
- `almostThere`: meals missing only a small number of items
- `fallback`: sparse-inventory or low-confidence suggestions

This lets the same engine support the current featured-card layout and future screens such as weekly planning or notifications.

## Fallback Behavior

### Sparse inventory

Sparse inventory means:

- fewer than 3 usable inventory items, or
- fewer than 2 distinct matched ingredient families across the recipe set

Behavior:

- Prefer simple recipes with 1-3 ingredients
- Show `fallback` suggestions even if only one ingredient matches
- Add messaging like "Start with what you have"
- Include missing ingredient counts and a shopping-list action
- Do not show a fake urgency hero unless an actual expiring item is involved

### No-match cases

No-match means:

- inventory exists, but no recipe has a required-ingredient match, or
- filters reduce the result set to zero

Behavior:

- Distinguish `no_match` from `filtered_out`
- For `filtered_out`, preserve current reset-filters UX
- For true `no_match`, return:
  - an empty `primarySuggestions` list
  - a `fallback` list based on broad category similarity, pantry staples, or seed recipes
  - a reason code and user-facing message

Recommended reason codes:

- `inventory_empty`
- `inventory_sparse`
- `filtered_out`
- `no_recipe_match`
- `catalog_empty`

### Empty inventory

When inventory is empty:

- Return no ranked meal suggestions
- Return seed recipes or onboarding suggestions separately
- UI should show inventory-first empty state, not generic "no suggestions"

## API/Data Contract

The current `RecipeSuggestionItem` type is enough for MVP rendering, but it is not enough for:

- bucketed UI sections
- reason-driven empty states
- deterministic analytics
- future server-side recommendation services

The recommendation response should be versioned and explicit.

### Request shape

```ts
export interface MealSuggestionRequest {
  userId: string;
  inventorySnapshotAt?: string;
  filters?: {
    search?: string;
    maxCookTimeMinutes?: number;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard' | 'all';
    suggestedOnly?: boolean;
  };
  options?: {
    limit?: number;
    includeFallback?: boolean;
    includeReasons?: boolean;
    includeInventoryDiagnostics?: boolean;
  };
}
```

### Response shape

```ts
export type MealSuggestionReasonCode =
  | 'inventory_empty'
  | 'inventory_sparse'
  | 'filtered_out'
  | 'no_recipe_match'
  | 'catalog_empty';

export type MealSuggestionBucket =
  | 'hero'
  | 'readyNow'
  | 'useItUp'
  | 'almostThere'
  | 'fallback';

export type MealAvailabilityTier =
  | 'ready_now'
  | 'needs_1_item'
  | 'needs_few_items'
  | 'stretch';

export interface SuggestionScoreBreakdown {
  total: number;
  ingredientCoverage: number;
  expiryUrgency: number;
  missingIngredientPenaltyAdjusted: number;
  effort: number;
  variety: number;
}

export interface SuggestedInventoryUsage {
  foodItemId: string;
  foodItemName: string;
  expiryDate: string | null;
  expiryStatus: 'expiring' | 'soon' | 'good' | 'fresh';
  priority: 'urgent' | 'normal';
}

export interface MissingIngredientSuggestion {
  recipeIngredientId: string;
  name: string;
  quantity?: number;
  unit?: string;
  substitutable?: boolean;
}

export interface MealSuggestion {
  recipeId: string;
  bucket: MealSuggestionBucket;
  availability: MealAvailabilityTier;
  rank: number;
  score: SuggestionScoreBreakdown;
  matchPercentage: number;
  matchedRequiredCount: number;
  totalRequiredCount: number;
  missingRequiredCount: number;
  matchedIngredients: Array<{
    recipeIngredientId: string;
    recipeIngredientName: string;
    foodItemId: string;
    foodItemName: string;
    quantitySufficient: boolean;
  }>;
  missingIngredients: MissingIngredientSuggestion[];
  inventoryUsage: SuggestedInventoryUsage[];
  explanation: {
    title: string;
    shortReason: string;
    badges: string[];
  };
}

export interface MealSuggestionResponse {
  generatedAt: string;
  requestEcho: MealSuggestionRequest;
  summary: {
    totalInventoryItems: number;
    usableInventoryItems: number;
    urgentInventoryItems: number;
    totalRecipesEvaluated: number;
    totalSuggestions: number;
    fallbackUsed: boolean;
    reasonCode?: MealSuggestionReasonCode;
    message?: string;
  };
  hero: MealSuggestion | null;
  buckets: Record<MealSuggestionBucket, MealSuggestion[]>;
  suggestions: MealSuggestion[];
  topExpiringIngredient: {
    foodItemId: string;
    name: string;
    daysLeft: number;
    recipesCount: number;
  } | null;
}
```

## Mapping To Current UI

The current screen can consume the new contract with minimal adaptation:

- `hero` maps to the featured card in [src/pages/recipes/components/recipe-suggestion-list.tsx](/home/quocl/.cline/worktrees/bcec3/start-new/src/pages/recipes/components/recipe-suggestion-list.tsx)
- `suggestions` remains the flat list used by the feed
- `topExpiringIngredient` replaces the current hero alert payload
- `summary.reasonCode` drives empty-state variants in [src/pages/recipes/components/recipe-empty-state.tsx](/home/quocl/.cline/worktrees/bcec3/start-new/src/pages/recipes/components/recipe-empty-state.tsx)
- `explanation.badges` supports labels like `Use It Up`, `Ready Now`, `Only 1 Item Missing`

Minimum UI fields per card:

- recipe title
- image URL
- cook time
- difficulty
- match percentage
- matched count / total required count
- missing ingredient names
- explanation label
- actionability state: view recipe vs add missing ingredients

## Integration Guidance

### Client-side MVP

Keep the current architecture:

- fetch inventory
- fetch recipes
- run matcher locally
- return the normalized response shape from the hook layer

This keeps latency low and avoids blocking on new backend work.

### Future Supabase RPC or service

If recommendation logic moves server-side, preserve these invariants:

- same request/response contract
- same normalization rules
- same score component names
- same reason codes
- same tie-break order

That prevents UI drift between local and remote ranking implementations.

## Recommended MVP Implementation Delta

Compared with the current matcher, the MVP should add:

1. Availability tiers
2. Explicit score breakdown
3. Bucket assignment
4. Reason codes for fallback and empty states
5. A response-level summary object

The current matching heuristics in [src/api/recipe-matcher.ts](/home/quocl/.cline/worktrees/bcec3/start-new/src/api/recipe-matcher.ts) are a reasonable starting point, but they should be treated as the first scoring pass, not the final contract.
