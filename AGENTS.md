# Repository Guidelines

## Project Overview

Food Inventory Manager — a **Telegram Mini App** for tracking kitchen inventory with expiry dates. Built with React 19, TypeScript, Supabase, and TanStack Query. Mobile-first UI using antd-mobile + shadcn/ui-style components.

## Build & Development Commands

```bash
npm run dev              # Vite dev server
npm run build            # tsc -b && vite build (run before every PR)
npm run lint             # ESLint (run before every PR)
npm run storybook        # Component dev on port 6006
npm run build-storybook  # Static Storybook build
```

No test framework is configured. Validate with `npm run lint && npm run build` and manual Storybook review.

## Architecture

```
src/
├── api/            # Supabase CRUD, domain types, TanStack Query hooks
│   ├── types.ts              # FoodItem, helpers (getExpiryStatus, etc.)
│   ├── food-items.api.ts     # IFoodItemsApi: supabase + mock impl, toggled by VITE_USE_MOCK_API
│   ├── settings.api.ts       # Categories & storage locations (global, not user-scoped)
│   ├── use-food-items.ts     # Query hooks: useFoodItems(), useFoodItem()
│   ├── use-food-mutations.ts # Mutations with optimistic updates
│   └── openfoodfacts/        # External barcode → product lookup
├── store/          # Zustand — UI state ONLY, never server data
│   ├── ui-store.ts           # Filters, edit modal, delete confirmation
│   └── auth.store.ts         # TMA + email auth state, wraps Supabase session
├── components/
│   ├── ui/         # shadcn/ui-style: cva variants, forwardRef, co-located stories
│   ├── food/       # FoodItemCard, FoodForm, pickers
│   ├── layout/     # AppShell, TopAppBar, BottomNavigation
│   ├── shared/     # SearchInput, FilterChips, BottomSheet
│   ├── scanner/    # Barcode/camera (quagga2)
│   ├── shopping/   # Shopping list
│   └── auth/       # Login components
├── pages/          # Route screens (InventoryDashboard, AddFoodItemPage, etc.)
├── lib/            # Utils (cn, query-client, supabaseClient, tma, image-upload)
├── hooks/          # Custom hooks (use-barcode-scanner)
└── App.tsx         # MemoryRouter (TMA has no browser history)
```

### Routes (MemoryRouter in `src/App.tsx`)

| Path | Component | Auth | Layout |
|------|-----------|------|--------|
| `/login` | LoginPage | No | Standalone |
| `/` | InventoryDashboard | Yes | MainLayout (tabs) |
| `/list` | Shopping List | Yes | MainLayout |
| `/recipes` | Recipes | Yes | MainLayout |
| `/settings` | SettingsPage | Yes | MainLayout |
| `/add` | AddFoodItemPage | Yes | Standalone |
| `/scan` | BarcodeScannerPage | Yes | Standalone |

## Code Style & Naming

- **TypeScript strict** with `verbatimModuleSyntax` — use `import type` for type-only imports
- **`erasableSyntaxOnly: true`** — no `enum`, use union types or `as const` objects
- **2-space indent**; consistent with surrounding code
- Components: `PascalCase` files (`FoodItemCard.tsx`), hooks: `use-*.ts`, stores: `*.store.ts`
- Imports: always use `@/*` alias for `src/*`
- Stories: co-locate as `component-name.stories.tsx` next to source

## Data Flow Pattern

1. **API Layer** (`src/api/`): `IFoodItemsApi` interface with Supabase (prod) and localStorage (mock) implementations; toggled by `VITE_USE_MOCK_API`
2. **DB ↔ Frontend mapping**: Supabase uses snake_case (`expiration_date`), frontend uses camelCase (`expiryDate`); explicit `mapDbToFoodItem()` / `mapCreateInputToDb()` functions — no auto-mapper
3. **Soft deletes**: `food_items.deleted = true`, all reads filter `.eq('deleted', false)`
4. **Query hooks**: `useFoodItems()` for reads; `useAddFoodItem()`, `useUpdateFoodItem()`, `useDeleteFoodItem()` for writes
5. **Mutations**: All use optimistic updates (`onMutate` → cache update → rollback on error → `invalidateQueries` on settle)
6. **Query keys**: `FOOD_ITEMS_QUERY_KEY = ['food-items'] as const`, appended with `userId` at call site
7. **UI state**: Zustand for filters/modals only, never for server data

```tsx
// Correct pattern
const { data: items } = useFoodItems();
const addMutation = useAddFoodItem();
const { filters, setSearch } = useUIStore(); // UI state only
```

## Component Conventions

**shadcn/ui (`src/components/ui/`)**: `class-variance-authority` variants, `React.forwardRef`, export both component + variants.

**Domain components**: Use antd-mobile primitives (`Card`, `Tag`, `ProgressBar`), `cn()` from `@/lib/utils` for className merging, `lucide-react` for icons.

**Barrel exports**: Each domain folder has `index.ts` → re-exported from `src/components/index.ts`.

**React Compiler enabled**: `useMemo`, `useCallback`, and `React.memo` are largely unnecessary — the compiler handles memoization.

## Styling (Tailwind CSS v4)

CSS-first config in `src/index.css` — **no `tailwind.config.js`**:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-destructive: var(--destructive);
}
:root { --primary: #13ec5b; --destructive: #e11d48; }
```

Utilities: `bg-primary`, `text-destructive`, `text-muted-foreground`, `bg-surface`, `font-display`. Custom utilities: `.no-scrollbar`, `.pb-safe` / `.pt-safe` (iOS safe area).

## Auth Flow

1. **TMA Login**: `getInitDataRaw()` → POST to Supabase Edge Function `/functions/v1/tma-exchange` → JWT → `supabase.auth.setSession()`
2. **Email Login**: `supabase.auth.signInWithPassword()`
3. **State**: `useAuthStore` (Zustand) subscribes to `supabase.auth.onAuthStateChange`
4. **Route guard**: `AuthGuard` component wraps authenticated routes

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `VITE_TMA_EXCHANGE_URL` | No | Override TMA exchange endpoint |
| `VITE_USE_MOCK_API` | No | `'true'` for localStorage mock |

## Integration Points

- **Supabase**: Auth, Postgres DB (`food_items`, `categories`, `storage_locations`), Storage (`food-images` bucket)
- **OpenFoodFacts**: Barcode → product data lookup (`src/api/openfoodfacts/`)
- **Image upload**: Client-side resize via `pica` (max 800px, JPEG 0.8) → Supabase Storage
- **Telegram Mini App SDK**: `@tma.js/sdk-react` for init data, theme
- **@dnd-kit**: Drag-and-drop reordering in settings
- **Design mockups**: `mockup/` folder has HTML references for each screen

## Commit Style

Conventional Commits: `type(scope): summary` (e.g., `feat(scanner): add barcode retry button`)