# Copilot Instructions

## Project Overview

**Food Inventory Tracker** - mobile-first React app for managing kitchen inventory and tracking expiry dates. Uses a layered architecture with clear separation between API, store, and UI.

## Tech Stack

- **React 19** with React Compiler (`babel-plugin-react-compiler` in vite.config.ts)
- **Tailwind CSS v4** - CSS-first config in `src/index.css` (NOT tailwind.config.js)
- **TanStack Query** for server state (queries + mutations with optimistic updates)
- **Zustand** for UI state (`src/store/ui-store.ts`)
- **antd-mobile v5** + **shadcn/ui** components
- **react-router v7**, **Storybook 10**

## Architecture

```
src/
├── api/              # Data layer: types, API interface, React Query hooks
│   ├── types.ts      # Domain types (FoodItem, ExpiryStatus, helpers)
│   ├── food-items.api.ts    # IFoodItemsApi interface + localStorage mock
│   ├── use-food-items.ts    # Query hooks (useFoodItems, useFoodItem)
│   └── use-food-mutations.ts # Mutation hooks with optimistic updates
├── store/            # Zustand stores (UI state only, not server data)
│   └── ui-store.ts   # Filters, edit modal state, delete confirmation
├── components/
│   ├── ui/           # shadcn/ui (cva variants, forwardRef)
│   ├── food/         # Domain components (FoodItemCard, FoodForm, pickers)
│   ├── layout/       # AppShell, TopAppBar, BottomNavigation
│   └── shared/       # SearchInput, FilterChips, SectionHeader
├── pages/            # Route components (InventoryDashboard, AddFoodItemPage)
└── lib/              # utils.ts (cn), query-client.ts
```

## Data Flow Pattern

1. **API Layer** (`src/api/`): Abstract interface + localStorage mock implementation
2. **Query Hooks**: `useFoodItems()` for reads, `useAddFoodItem()`/`useUpdateFoodItem()` for writes
3. **Optimistic Updates**: All mutations use `onMutate` → rollback on error → `invalidateQueries`
4. **UI State**: Zustand only for filters/modals, never for server data

```tsx
// Correct pattern - TanStack Query for server data
const { data: items } = useFoodItems();
const addMutation = useAddFoodItem();

// Zustand for UI state only
const { filters, setSearch, editingItemId } = useUIStore();
```

## Component Conventions

**shadcn/ui components** (`src/components/ui/`):
- Use `class-variance-authority` for variants
- `React.forwardRef` with explicit prop interfaces
- Export both component and variants: `export { Button, buttonVariants }`

**Domain components** (`src/components/food/`, etc.):
- Co-locate stories: `food-item-card.stories.tsx` next to `food-item-card.tsx`
- Export from `index.ts`, then re-export from `src/components/index.ts`
- Use `cn()` from `@/lib/utils` for className merging

## Styling (Tailwind v4)

Config is CSS-first in `src/index.css`:
```css
@theme inline {
  --color-primary: var(--primary);  /* Maps CSS vars to utilities */
}
:root {
  --primary: #13ec5b;  /* Green accent */
  --destructive: #e11d48;  /* Red for expiring */
}
```
Use: `bg-primary`, `text-destructive`, `text-muted-foreground`

## Domain Types

```ts
type ExpiryStatus = 'expiring' | 'soon' | 'good' | 'fresh';  // Color-coded urgency
type StorageLocation = 'fridge' | 'pantry' | 'freezer' | 'spices';
type FoodCategory = 'fruits' | 'vegetables' | 'dairy' | 'meat' | 'drinks' | 'pantry' | 'other';
```
Use helpers: `getExpiryStatus(date)`, `getExpiryText(date)`

## Commands

```bash
npm run dev       # Vite dev server
npm run storybook # Component development (port 6006)
npm run build     # tsc -b && vite build
```

## Key Files

- [src/api/types.ts](src/api/types.ts) - All domain types and helper functions
- [src/api/use-food-mutations.ts](src/api/use-food-mutations.ts) - Optimistic update pattern
- [src/store/ui-store.ts](src/store/ui-store.ts) - Zustand store pattern
- [src/index.css](src/index.css) - Tailwind v4 theme config
- [mockup/](mockup/) - HTML mockups (`code.html`) for each screen design
