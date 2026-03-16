# Active Context

**Last Updated:** 2026-03-16

## Current Work Focus

The product is now a **4-domain app** running in one Telegram Mini App shell:

1. **Inventory** (stable core)
2. **Shopping list** (implemented)
3. **Recipes** (suggestions + management implemented)
4. **Food Diary / Foodie CRM** (MVP A implemented)

Current focus has shifted from feature scaffolding to **integration consistency, QA polish, and reliability hardening**.

## Recent Changes

### Food Diary MVP A Landed + Calendar Iteration
- Added diary domain data model + APIs + hooks under `src/pages/diary/api/`
- Added Supabase schema for diary tables in `supabase/database/diary-tables.sql`:
  - `venues`
  - `menu_items`
  - `meal_logs`
  - `meal_item_entries`
- Added diary UI/store/pages:
  - `src/pages/diary/store/diary.store.ts`
  - `src/pages/diary/components/*`
  - `src/pages/diary/*`
- `DiaryDashboard` now includes a month calendar with day-level selection and per-day meal cards
- `QuickLogPage` includes log datetime picker (`antd-mobile` `DatePicker`) and creates dish entries on create flow
- `MealHistoryPage` + detail sheet support URL-driven opening with `?mealLogId=...`

### Routing & Navigation Expanded
- Main route tree includes `/diary` (dashboard) and `/diary/history`
- Standalone protected routes include `/diary/log` and `/diary/venue/:id`
- Bottom navigation now has 5 tabs: Home, List, Diary, Recipes, Settings
- Main FAB behavior is context-aware (`/diary/*` routes target `/diary/log`)

### Existing Domains Remain Active
- Shopping list and recipe flows remain implemented and connected to navigation
- Architecture conventions remain unchanged: TanStack Query for server state, Zustand for UI-only state

## Active Decisions

### Data Source Strategy Is Still Mixed
- Diary, inventory, shopping, and recipes support `VITE_USE_MOCK_API`
- `settings.api.ts` still uses direct Supabase
- Result: mock-mode behavior is not fully uniform across all domains

### Soft Delete Pattern Is Domain-Selective
- Soft delete (`deleted = true`) is used for core entities (food items, shopping items, recipes, venues/menu logs)
- `meal_item_entries` currently use direct row operations (no deleted flag)

### Query-First Access Pattern Continues
- Domain-scoped query keys + user-scoped key segments
- Mutations continue optimistic update → rollback on error → invalidate on settle

### Diary Detail Editing Still Uses Partial Persistence
- `MealLogDetailSheet` edits both log-level fields and local dish-entry form state
- Current save path only calls `useUpdateMealLog()` (meal log table updates)
- Dish-entry updates/deletes/additions are not yet wired through `meal_item_entries` mutations from this edit flow

## Next Steps

1. **Close diary functional gaps**
   - Persist dish-entry edits from `MealLogDetailSheet` through `meal_item_entries` APIs (currently only meal-log fields update)
2. **Cross-domain polish**
   - Quick-add inventory → shopping list
   - QA sweep on shopping, recipes, and diary mobile flows
3. **Reliability hardening**
   - Error boundaries
   - Better loading/error UX
4. **Production readiness**
   - Schema/RLS hardening and validation
   - Test coverage strategy

## Current Risks / Watch Items

- Mixed mock/supabase behavior can still cause confusing dev/test outcomes
- Diary meal detail sheet currently edits local dish form state without persistence wiring
- Diary mock mode diverges from Supabase behavior for dish entries on create/update paths
- Documentation drift exists in some planning/checklist docs compared with implemented code
- Barcode scanning and image compression remain device-dependent hotspots

## Working Notes

- Memory bank should now treat Food Diary as implemented MVP A, not future-only planning.
- Route/navigation and module architecture now clearly represent a multi-domain product.