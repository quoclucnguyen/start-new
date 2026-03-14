# Copilot Instructions

## Project Overview

**Food Inventory Manager** — Telegram Mini App for tracking kitchen inventory with expiry dates. React 19 + TypeScript + Supabase + TanStack Query. Mobile-first UI with antd-mobile + shadcn/ui-style components.

## Tech Stack

- **React 19** with React Compiler (`babel-plugin-react-compiler` in vite.config.ts) — `useMemo`/`useCallback`/`React.memo` are unnecessary
- **Tailwind CSS v4** — CSS-first config in `src/index.css` (NOT tailwind.config.js)
- **TanStack Query** for server state (queries + mutations with optimistic updates)
- **Zustand** for UI state only (`src/store/ui-store.ts`) — NEVER for server data
- **antd-mobile v5** for domain components + **shadcn/ui** (`cva` + `forwardRef`) in `src/components/ui/`
- **react-router v7** with `MemoryRouter` (TMA has no browser history)
- **Supabase** for auth, Postgres DB, and Storage

## Architecture

```
src/
├── api/              # Supabase CRUD, domain types, TanStack Query hooks
│   ├── types.ts      # FoodItem, ExpiryStatus, helpers (getExpiryStatus, etc.)
│   ├── food-items.api.ts    # IFoodItemsApi: supabase + mock, toggled by VITE_USE_MOCK_API
│   ├── settings.api.ts      # Categories & storage locations (global, not user-scoped)
│   ├── use-food-items.ts    # Query hooks: useFoodItems(), useFoodItem()
│   ├── use-food-mutations.ts # Mutations with optimistic updates
│   └── openfoodfacts/       # Barcode → product lookup
├── store/            # Zustand (UI state only, not server data)
│   ├── ui-store.ts   # Filters, edit modal, delete confirmation
│   └── auth.store.ts # TMA + email auth, wraps Supabase session
├── components/
│   ├── ui/           # shadcn/ui (cva variants, forwardRef)
│   ├── food/         # FoodItemCard, FoodForm, pickers
│   ├── layout/       # AppShell, TopAppBar, BottomNavigation
│   ├── shared/       # SearchInput, FilterChips, BottomSheet
│   ├── scanner/      # Barcode/camera (quagga2)
│   └── shopping/     # Shopping list
├── pages/            # Route screens (InventoryDashboard, AddFoodItemPage, etc.)
├── lib/              # Utils (cn, query-client, supabaseClient, tma, image-upload)
└── App.tsx           # MemoryRouter routes
```

## Data Flow Pattern

1. **API Layer** (`src/api/`): `IFoodItemsApi` interface with Supabase (prod) and localStorage (mock) implementations
2. **DB ↔ Frontend mapping**: Supabase snake_case (`expiration_date`) → frontend camelCase (`expiryDate`) via `mapDbToFoodItem()` / `mapCreateInputToDb()`
3. **Soft deletes**: `food_items.deleted = true`; all reads filter `.eq('deleted', false)`
4. **Mutations**: Optimistic updates (`onMutate` → cache update → rollback on error → `invalidateQueries`)
5. **Query keys**: `FOOD_ITEMS_QUERY_KEY = ['food-items'] as const`, appended with `userId`

```tsx
// Correct pattern — TanStack Query for server data
const { data: items } = useFoodItems();
const addMutation = useAddFoodItem();

// Zustand for UI state only
const { filters, setSearch, editingItemId } = useUIStore();
```

## Code Style

- **TypeScript strict** + `verbatimModuleSyntax` — use `import type` for type-only imports
- **`erasableSyntaxOnly: true`** — no `enum`, use union types or `as const` objects
- **2-space indent**; `PascalCase` component files, `use-*.ts` hooks, `*.store.ts` stores
- **Imports**: always use `@/*` alias for `src/*`

## Component Conventions

**shadcn/ui** (`src/components/ui/`): `class-variance-authority` variants, `React.forwardRef`, export component + variants.

**Domain components**: antd-mobile primitives (`Card`, `Tag`, `ProgressBar`), `cn()` from `@/lib/utils`, `lucide-react` icons.

## Styling (Tailwind v4)

CSS-first config in `src/index.css` — **no `tailwind.config.js`**:
```css
@theme inline {
  --color-primary: var(--primary);
}
:root { --primary: #13ec5b; --destructive: #e11d48; }
```
Utilities: `bg-primary`, `text-destructive`, `text-muted-foreground`, `bg-surface`, `font-display`.
Custom: `.no-scrollbar`, `.pb-safe` / `.pt-safe` (iOS safe area).

## Domain Types

```ts
type ExpiryStatus = 'expiring' | 'soon' | 'good' | 'fresh';
type StorageLocation = string;  // User-configurable via settings
type FoodCategory = string;     // User-configurable via settings
type QuantityUnit = 'pieces' | 'kg' | 'g' | 'l' | 'ml' | 'bottles' | 'packs';
```
Helpers: `getExpiryStatus(date)`, `getDaysUntilExpiry(date)`, `getExpiryText(date)`

## Auth Flow

1. **TMA**: `getInitDataRaw()` → POST to Supabase Edge Function `/functions/v1/tma-exchange` → JWT
2. **Email**: `supabase.auth.signInWithPassword()`
3. **State**: `useAuthStore` (Zustand) subscribes to `onAuthStateChange`
4. **Route guard**: `AuthGuard` wraps authenticated routes

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # ESLint
```

## Key Files

- [src/api/types.ts](src/api/types.ts) - Domain types and helper functions
- [src/api/use-food-mutations.ts](src/api/use-food-mutations.ts) - Optimistic update pattern
- [src/store/ui-store.ts](src/store/ui-store.ts) - Zustand store pattern
- [src/store/auth.store.ts](src/store/auth.store.ts) - Auth state management
- [src/index.css](src/index.css) - Tailwind v4 theme config
- [src/App.tsx](src/App.tsx) - MemoryRouter routes
- [mockup/](mockup/) - HTML reference mockups for each screen
