# Progress

**Last Updated:** 2026-03-16

## What Works

### ✅ Fully Implemented Features

#### Core Inventory Management
- Food item CRUD (create/read/update/delete)
- Expiry status calculation + color-coded urgency UI
- Image upload with client-side compression
- Search/filter/sort by name/category/storage/status

#### Authentication
- Telegram Mini App auth flow + email/password fallback
- `AuthGuard` protected routing
- Zustand auth store synced with Supabase auth events

#### Configuration
- User-configurable categories and storage locations
- Reorder/update/delete flows
- Persistence via Supabase settings tables

#### Shopping List
- `/list` route integrated in main navigation
- Add/check/delete item flows
- Bulk clear checked items
- Move purchased items into inventory
- Optimistic mutation pattern implemented

#### Recipes
- `/recipes` suggestions page implemented
- `/recipes/manage` management page implemented
- Seed + user recipe merge for suggestions
- Inventory matcher with missing-ingredient output
- Add-missing-ingredients to shopping list mutation

#### Food Diary (MVP A)
- 5-tab navigation includes **Diary**
- Diary routes implemented:
  - `/diary`
  - `/diary/history`
  - `/diary/log`
  - `/diary/venue/:id`
- Diary domain APIs/hooks implemented:
  - venues
  - meal logs
  - menu items
  - meal item entries
- Diary data schema created in `supabase/database/diary-tables.sql`
- Core diary UI shipped:
  - quick logging
  - meal history with filters/sort/grouping
  - venue detail with status + dish sections
  - meal detail sheet editing for log-level fields

#### Technical Foundation
- TypeScript strict-mode architecture maintained
- TanStack Query for server state + optimistic updates
- Zustand limited to UI state
- React Compiler setup active
- Lint/build scripts are current (`npm run lint`, `npm run build`)

## What's Left to Build

### Near-Term Product Follow-up

1. **Diary persistence depth**
   - Persist dish-entry edits from `MealLogDetailSheet` end-to-end via `meal_item_entries` mutation flow.
2. **Shopping UX polish**
   - Quick-add inventory item to shopping list.
3. **Recipe quality polish**
   - Better ranking/tuning + richer dataset strategy.

### Reliability / Production Hardening

- Add error boundaries and improved empty/error/loading states across domains
- Improve API error clarity for user-facing flows
- Define and implement testing strategy (unit + integration + E2E)
- Harden Supabase schema/policies for production use

### Platform / Roadmap Items

- Receipt OCR flow
- Notifications (expiry and reminders)
- Diary analytics/suggestions (forgotten gems, nudges)
- Offline queue/sync strategy
- Family sharing and collaboration

## Current Status

### Project Phase

**Active Development — Multi-Domain Product**

The app now operates as a connected system spanning inventory, shopping, recipes, and diary features. Core user flows are implemented in all four domains, with current effort focused on consistency, UX polish, and production readiness.

### Stable Areas

- Inventory and expiry workflows
- Auth + route protection
- Shopping core loop
- Recipe suggestion + management core loop
- Diary MVP A navigation and core logging/history flows

### Areas Needing Work

- Diary dish-entry persistence completeness
- Cross-domain UX polish and QA pass
- Runtime-mode consistency (mock vs Supabase)
- Testing and reliability tooling

## Known Issues / Technical Debt

1. Mixed mock/supabase strategy remains inconsistent (`settings.api.ts` still direct Supabase)
2. Diary meal detail currently updates log-level fields; dish-entry persistence is incomplete
3. No error boundaries yet
4. No offline detection/queueing strategy implemented
5. Device-dependent reliability for barcode scanning and image-processing performance

## Development Priorities

### Next Sprint (Recommended)

1. Wire meal dish-entry persistence in diary edit flow
2. Implement inventory → shopping quick-add
3. Run cross-domain QA sweep (shopping/recipes/diary)
4. Improve loading/error UX and add initial error boundary coverage

### Following Sprint

1. Normalize runtime mode behavior across all domains
2. Establish baseline automated tests for critical flows
3. Begin production hardening of schema/policies and migration strategy
