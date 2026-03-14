# Active Context

**Last Updated:** 2026-03-14

## Current Work Focus

The app has moved beyond inventory-only MVP into **multi-domain functionality** with active modules for:

1. **Inventory tracking** (stable)
2. **Shopping list management** (implemented and wired to navigation)
3. **Recipe suggestions + recipe management** (implemented with seed + user recipes)

Recent development has focused on expanding data models and UI flows while keeping the same architecture conventions: TanStack Query for server state, Zustand for UI state, and Supabase/localStorage dual API support where configured.

## Recent Maintenance Update

- Removed Storybook from project tooling and scripts.
- Removed `.stories.tsx` files and `.storybook/` config.
- Updated project docs/guidelines to reflect **manual in-app validation** (`npm run lint && npm run build` + manual flows) instead of Storybook-based review.
- Memory bank files are being aligned with this new baseline.

## Recent Changes

### Shopping List
- Shopping list data model and API are implemented in `src/api/shopping-list.api.ts`
- Query + mutation hooks are implemented with optimistic updates:
  - `useShoppingList()`
  - `useAddShoppingListItem()`
  - `useToggleShoppingItemChecked()`
  - `useDeleteCheckedItems()`
  - `useMovePurchasedToInventory()`
- Route `/list` is active and rendered by `ShoppingListPage`
- UX includes grouped display by category, checked/unchecked sections, and bottom-sheet form

### Recipe Suggestions + Management
- `/recipes` renders **RecipeSuggestionsPage**
- `/recipes/manage` renders **RecipeManagementPage**
- Matching flow implemented through `useRecipeSuggestions()` and `recipe-matcher`
- Suggestion flow merges user recipes with seed recipes (`SEED_RECIPES`) and computes:
  - match percentage
  - missing ingredients
  - top expiring ingredient hero
- Recipe CRUD/duplicate/delete logic is implemented in `recipes-management.api.ts` + management hooks

### Routing & Navigation
- MemoryRouter route tree now includes nested recipes routes:
  - `/recipes` (suggestions)
  - `/recipes/manage` (management)
- Bottom nav still maps `recipes` tab to `/recipes`

## Active Decisions

### Data Source Strategy Is Mixed by Domain
- `food-items.api.ts`, `shopping-list.api.ts`, and `recipes-management.api.ts` support env-driven mock mode (`VITE_USE_MOCK_API`)
- `settings.api.ts` currently uses Supabase directly (no mock switch)
- Implication: full offline/mock behavior is not yet uniform across all domains

### Soft Delete Remains Standard for Core Entities
- Food items, shopping list items, and recipes use `deleted = true` filtering patterns in Supabase implementations

### Query-First Data Access
- Query keys remain domain-scoped and user-scoped at call site
- Mutations preserve optimistic update → rollback → invalidate pattern for responsive UX

## Next Steps

1. **Unify mock/supabase strategy across settings and all domains** (if full mock mode is expected)
2. **Close UX gaps**:
   - quick-add from inventory to shopping list
   - complete QA pass for shopping and recipe flows
3. **Improve reliability**:
   - error boundaries
   - clearer error messaging and loading states
4. **Production readiness**:
   - backend/schema hardening
   - test coverage

## Current Risks / Watch Items

- Mixed data source behavior can cause confusing dev/test outcomes in mock mode
- Barcode scanning and client-side image compression remain device-dependent performance hotspots
- MemoryRouter remains correct for Telegram Mini App, but still limits deep linking/sharing

## Working Notes

- Route and navigation structure now reflect a broader product scope than early memory docs.
- Memory bank entries should treat shopping list and recipe features as implemented modules, not just planned items.