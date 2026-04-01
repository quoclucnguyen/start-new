# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Food Inventory Manager - A Telegram Mini App for tracking kitchen inventory with expiry dates, built with React 19, TypeScript, Supabase, and TanStack Query.

## Development Commands

```bash
npm run dev              # Start Vite dev server
npm run build            # TypeScript check + Vite production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## Tech Stack Notes

- **React 19** with React Compiler enabled via `babel-plugin-react-compiler` in [vite.config.ts](vite.config.ts:12)
- **Tailwind CSS v4** with CSS-first config in [src/index.css](src/index.css) - NOT a traditional `tailwind.config.js` file
- **TanStack Query** for all server state (queries + mutations with optimistic updates)
- **Zustand** for UI state only (filters, modals) - NEVER for server data
- **antd-mobile v5** + custom shadcn/ui-style components
- **React Router v7** with `MemoryRouter` (Telegram Mini Apps don't have browser history)
- **Supabase** for authentication and database
- **Telegram Mini App SDK** via `@tma.js/sdk-react`

## Architecture

### Data Flow Pattern

1. **API Layer** (per-page `api/` folder): Abstract interfaces + Supabase implementations
2. **Query Hooks**: `useFoodItems()` for reads, mutations (`useAddFoodItem()`, etc.) for writes
3. **Optimistic Updates**: All mutations use `onMutate` → rollback on error → `invalidateQueries`
4. **UI State**: Zustand only for filters/modals, never for server data

```tsx
// Correct - TanStack Query for server data
const { data: items } = useFoodItems();
const addMutation = useAddFoodItem();

// Zustand for UI state only
const { filters, setSearch, editingItemId } = useUIStore();
```

### Directory Structure

Each page module is **self-contained** with its own `api/`, `components/`, `store/`, and `hooks/` folders.

```
src/
├── api/                        # SHARED only
│   ├── types.ts                # All domain types (FoodItem, Recipe, ShoppingListItem, etc.)
│   └── index.ts                # Barrel re-export of all page APIs (for backward compat)
├── store/                      # SHARED only
│   └── index.ts                # Barrel re-export of all page stores
├── components/                 # SHARED components only
│   ├── ui/                     # Base UI primitives (shadcn-style: cva variants, forwardRef)
│   ├── layout/                 # AppShell, TopAppBar, BottomNavigation
│   ├── shared/                 # SearchInput, FilterChips, SectionHeader, BottomSheet
│   ├── notifications/          # Notification list and items
│   └── AuthGuard.tsx           # Route protection component
├── pages/
│   ├── inventory/
│   │   ├── api/                # food-items.api.ts, settings.api.ts, use-food-items.ts,
│   │   │   │                   # use-food-mutations.ts, use-settings.ts
│   │   │   └── openfoodfacts/  # OpenFoodFacts API integration + hooks
│   │   ├── components/         # FoodItemCard, FoodForm, pickers, scanner UI
│   │   ├── hooks/              # use-barcode-scanner.ts
│   │   └── store/              # ui.store.ts (filters, editingItemId, deleteConfirmId)
│   ├── shopping/
│   │   ├── api/                # shopping-list.api.ts, use-shopping-list.ts,
│   │   │                       # use-shopping-list-mutations.ts
│   │   ├── components/         # ShoppingListPage, ShoppingListItem, ShoppingForm
│   │   └── store/              # shopping.store.ts (category filter)
│   ├── recipes/
│   │   ├── api/                # recipes-management.api.ts, recipe-suggestions.api.ts,
│   │   │                       # use-recipes-management.ts, use-recipe-suggestions.ts,
│   │   │                       # use-recipes-management-mutations.ts,
│   │   │                       # use-recipe-suggestion-mutations.ts, recipe-matcher.ts
│   │   ├── components/         # RecipeCard, RecipeDetailSheet, RecipeEditorSheet, etc.
│   │   └── store/              # recipes-management.store.ts, recipe-suggestions.store.ts
│   ├── diary/
│   │   ├── api/                # venues.api.ts, meal-logs.api.ts, menu-items.api.ts,
│   │   │                       # use-venues.ts, use-meal-logs.ts, use-menu-items.ts, etc.
│   │   ├── components/         # MealLogCard, VenuePicker, DishEntryForm, etc.
│   │   └── store/              # diary.store.ts (selected date, sort, type filter)
│   └── login/
│       ├── components/         # EmailPasswordForm
│       └── store/              # auth.store.ts (Supabase session, TMA token exchange)
├── lib/                        # Utilities (cn, query-client, supabaseClient, tma, image-upload)
├── hooks/                      # index.ts re-exports from inventory/hooks
└── App.tsx                     # Main app with MemoryRouter
```

### Import Convention

When writing code **inside** a page module, import from the module's own `api/` directly (relative or `@/pages/<module>/api/`):

```tsx
// Inside pages/shopping/components/foo.tsx - prefer local import
import { useShoppingList } from '../api/use-shopping-list';

// Cross-module or shared lib - use barrel
import { useFoodItems } from '@/api';
import { useUIStore } from '@/store';
```

## Component Conventions

### UI Components (`src/components/ui/`)

- Use `class-variance-authority` for variants
- `React.forwardRef` with explicit prop interfaces
- Export both component and variants: `export { Button, buttonVariants }`

### Domain Components

- Use `cn()` from `@/lib/utils` for className merging

## Authentication Flow

The app supports both Telegram Mini App authentication and email/password login:

1. **TMA Login**: `getInitDataRaw()` → `exchangeTma()` → Supabase session
2. **Email Login**: Direct Supabase auth
3. **Auth state**: Managed via `useAuthStore` Zustand store
4. **Route protection**: `AuthGuard` component wraps authenticated routes

See [src/pages/login/store/auth.store.ts](src/pages/login/store/auth.store.ts) and [src/lib/tma.ts](src/lib/tma.ts).

## Domain Types

All types defined in [src/api/types.ts](src/api/types.ts):

```tsx
type ExpiryStatus = 'expiring' | 'soon' | 'good' | 'fresh';
type StorageLocation = string; // User-configurable
type FoodCategory = string;    // User-configurable
type QuantityUnit = 'pieces' | 'kg' | 'g' | 'l' | 'ml' | 'bottles' | 'packs';

// Helpers
getExpiryStatus(expiryDate)  // Returns ExpiryStatus
getDaysUntilExpiry(expiryDate)  // Returns number | null
getExpiryText(expiryDate)  // Returns human-readable string
```

## Styling (Tailwind v4)

Config is CSS-first in [src/index.css](src/index.css):

```css
@theme inline {
  --color-primary: var(--primary);
  --color-destructive: var(--destructive);
}
:root {
  --primary: #13ec5b;  /* Green accent */
  --destructive: #e11d48;  /* Red for expiring items */
}
```

Use utilities: `bg-primary`, `text-destructive`, `text-muted-foreground`, `bg-secondary`, etc.

## Import Aliases

`@/*` maps to `./src/*` (configured in both [vite.config.ts](vite.config.ts:18) and [tsconfig.json](tsconfig.json:14)).

## Key Files Reference

- [src/api/types.ts](src/api/types.ts) - All domain types and helper functions
- [src/pages/inventory/api/use-food-mutations.ts](src/pages/inventory/api/use-food-mutations.ts) - Optimistic update pattern example
- [src/pages/login/store/auth.store.ts](src/pages/login/store/auth.store.ts) - Authentication state management
- [src/pages/inventory/store/ui.store.ts](src/pages/inventory/store/ui.store.ts) - Inventory UI filters and modal state
- [src/lib/query-client.ts](src/lib/query-client.ts) - TanStack Query config with localStorage persistence
- [src/index.css](src/index.css) - Tailwind v4 theme configuration
- [src/App.tsx](src/App.tsx) - Routing structure with MemoryRouter

## Telegram Mini App Considerations

- Uses `MemoryRouter` instead of `BrowserRouter` (no browser history in TMA)
- Handles Telegram theme colors via TMA SDK
- Optimized for mobile viewport and touch interactions
- Auto-login via `getInitDataRaw()` when available

# CLAUDE's Memory Bank

I am CLAUDE, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

### Core Files (Required)
1. `projectbrief.md`
   - Foundation document that shapes all other files
   - Created at project start if it doesn't exist
   - Defines core requirements and goals
   - Source of truth for project scope

2. `productContext.md`
   - Why this project exists
   - Problems it solves
   - How it should work
   - User experience goals

3. `activeContext.md`
   - Current work focus
   - Recent changes
   - Next steps
   - Active decisions and considerations
   - Important patterns and preferences
   - Learnings and project insights

4. `systemPatterns.md`
   - System architecture
   - Key technical decisions
   - Design patterns in use
   - Component relationships
   - Critical implementation paths

5. `techContext.md`
   - Technologies used
   - Development setup
   - Technical constraints
   - Dependencies
   - Tool usage patterns

6. `progress.md`
   - What works
   - What's left to build
   - Current status
   - Known issues
   - Evolution of project decisions

### Additional Context
Create additional files/folders within memory-bank/ when they help organize:
- Complex feature documentation
- Integration specifications
- API documentation
- Testing strategies
- Deployment procedures

## Documentation Updates

Memory Bank updates occur when:
1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.
