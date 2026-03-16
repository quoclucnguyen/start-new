# System Patterns

## Architecture Overview

The application follows a **layered architecture** with clear separation between data fetching, state management, and UI components:

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │   Pages        │  │  Components    │  │   Layout     │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Management Layer                   │
│  ┌────────────────────────┐  ┌──────────────────────────┐  │
│  │  TanStack Query        │  │  Zustand (UI State)      │  │
│  │  - Server Data         │  │  - Filters               │  │
│  │  - Optimistic Updates  │  │  - Modals                │  │
│  └────────────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                             │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  Types        │  │  API Interface │  │  React Query  │ │
│  │  & Helpers    │  │  + Mock Impl   │  │  Hooks        │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Sources                              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │  localStorage  │  │  Supabase      │  │ OpenFoodFacts │ │
│  │  (Mock APIs)   │  │  (Active)      │  │  API          │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

### 1. Dual State Management Strategy

**TanStack Query** for server state:
- Handles CRUD/query operations across inventory, shopping, recipes, and diary domains
- Provides automatic caching, background refetching, and optimistic updates
- Query keys follow pattern: `[ENTITY_NAME, userId?, ...params]`

**Zustand** for UI state only:
- Filters (search, category, storage, sort)
- Modal states (editing item ID, delete confirmation ID)
- NEVER used for server data - that's TanStack Query's job

**Why?** Clear separation prevents cache invalidation bugs and makes data flow predictable.

### 2. API Interface Pattern

All data access goes through abstract interfaces with localStorage mock implementation:

```tsx
// src/api/food-items.api.ts
export interface IFoodItemsApi {
  getAll(userId: string): Promise<FoodItem[]>;
  getById(id: string, userId: string): Promise<FoodItem>;
  create(input: CreateFoodItemInput, userId: string): Promise<FoodItem>;
  update(input: UpdateFoodItemInput, userId: string): Promise<FoodItem>;
  delete(id: string, userId: string): Promise<void>;
}

export const foodItemsApi: IFoodItemsApi = {
  // localStorage implementation
  // Can be swapped for Supabase implementation later
};
```

**Why?** Enables frontend development without backend, makes migration path clear.

### 3. Optimistic Update Pattern

All mutations implement the same three-phase pattern:

```tsx
onMutate: async (variables) => {
  // Phase 1: Cancel and snapshot
  await queryClient.cancelQueries({ queryKey });
  const previousData = queryClient.getQueryData(queryKey);

  // Phase 2: Optimistic update
  queryClient.setQueryData(queryKey, optimisticData);
  return { previousData, queryKey };
},
onError: (_err, _variables, context) => {
  // Phase 3: Rollback on error
  context && queryClient.setQueryData(context.queryKey, context.previousData);
},
onSettled: () => {
  // Phase 4: Refetch for consistency
  queryClient.invalidateQueries({ queryKey });
},
```

**Why?** UI feels instant while data is being saved, errors are handled gracefully.

### 4. Component Organization

```
src/components/
├── ui/              # Base components (Button, Input, Card, etc.)
│   ├── button.tsx
│   └── index.ts     # Exports Button + buttonVariants
├── food/            # Domain-specific components
│   ├── food-item-card.tsx
│   └── index.ts
├── layout/          # Layout structure
├── shared/          # Cross-domain reusable components
└── index.ts         # Barrel exports for all categories
```

**Patterns:**
- Use `class-variance-authority` for component variants
- `React.forwardRef` for composable components
- Barrel exports (`index.ts`) for clean imports

### 5. Authentication Flow

**Two authentication paths:**

1. **Telegram Mini App (Primary)**
   ```
   TMA SDK → getInitDataRaw() → backend exchange → Supabase tokens → setSession()
   ```

2. **Email/Password (Fallback)**
   ```
   User input → Supabase signInWithPassword() → session established
   ```

**State Management:**
- `useAuthStore` (Zustand) holds auth state
- `AuthGuard` component wraps protected routes
- Supabase auth state changes update store automatically via `onAuthStateChange`

### 6. Routing Strategy

**MemoryRouter** instead of BrowserRouter:
- Telegram Mini Apps don't have browser history
- All navigation is programmatic via `router.navigate()`
- No URL-based deep linking or sharing

**Route Structure:**
```
/login                    # Public login page
/                         # Protected layout wrapper
  ├─ /                    # Inventory dashboard (default)
  ├─ /list                # Shopping list page
  ├─ /diary               # Food diary dashboard
  │   └─ /history         # Meal history
  ├─ /recipes             # Recipe suggestions page
  │   └─ /manage          # Recipe management page
  └─ /settings            # Settings page
/add                      # Add food item page (protected)
/scan                     # Barcode scanner page (protected)
/diary/log                # Quick meal log page (protected)
/diary/venue/:id          # Venue detail page (protected)
```

### 7. Multi-Domain API Pattern

The same API + hooks + optimistic mutation pattern is now used across domains:

- `food-items.api.ts` + `use-food-items.ts` + `use-food-mutations.ts`
- `shopping-list.api.ts` + `use-shopping-list.ts` + `use-shopping-list-mutations.ts`
- `recipes-management.api.ts` + `use-recipes-management.ts` + `use-recipes-management-mutations.ts`
- `src/pages/diary/api/*` APIs + query hooks + mutation hooks (`venues`, `meal-logs`, `menu-items`, `meal-item-entries`)

Each domain keeps:
- DB/app mapping helpers (snake_case ↔ camelCase)
- user-scoped query keys
- optimistic UI updates where appropriate

### 8. Recipe Suggestion Composition Pattern

Recipe suggestions are built by composing multiple inputs:

1. Fetch recipes (user + system/seed fallback)
2. Fetch current inventory
3. Run matcher (`recipe-matcher.ts`) to compute match/missing data
4. Apply client-side filters
5. Compute hero context (top expiring ingredient)

This keeps suggestion logic centralized in data hooks rather than spread across UI components.

### 9. Diary Module Composition Pattern

Diary flows are composed by linking venue memory + meal logs + optional dish entries:

1. `useMealLogs()` powers dashboard calendar/day views and `useRecentMealLogs()` supports compact recent lists where needed
2. `useVenues()` provides favorites + venue lookup
3. `useMealLogs()` + `groupLogsByDate()` drives history timeline
4. `MealLogDetailSheet` edits meal-log fields and prepares dish-entry state

Pattern intent: keep query/mutation orchestration in hooks and thin pages for rendering + interaction.

### 10. Diary Calendar + Deep-Link Detail Pattern

Diary interaction now uses two complementary access patterns:

1. **Calendar-first browsing (`DiaryDashboard`)**
   - Month grid (42 cells, Monday-first)
   - Day selection maps to logs for a specific date key
   - Date dots indicate days containing meal logs
2. **History + deep-link detail (`MealHistoryPage`)**
   - History page can open detail sheet via query param (`?mealLogId=...`)
   - Detail sheet state is synced with URL for direct transitions from dashboard/venue pages

This pattern keeps timeline navigation intuitive while still allowing targeted entry-point linking inside `MemoryRouter` constraints.

## Component Relationships

### Data Flow Example: Adding a Food Item

```
User clicks "+" button
        ↓
AddFoodItemPage renders
        ↓
FoodForm component collects input
        ↓
User submits form
        ↓
useAddFoodItem() mutation called
        ↓
onMutate: Optimistically add to cache
        ↓
UI updates immediately (shows new item)
        ↓
API call completes (foodItemsApi.create)
        ↓
onSettled: Invalidate queries
        ↓
Background refetch ensures consistency
```

### Filter Flow

```
User types in search box
        ↓
useUIStore.setSearch() called
        ↓
Zustand state updates
        ↓
InventoryDashboard re-renders
        ↓
Memoized selector filters useFoodItems() data
        ↓
Filtered items displayed
```

## Critical Implementation Paths

### 1. Expiry Status Calculation

Used everywhere - must be consistent:

```tsx
// src/api/types.ts
export function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return 'fresh';
  const diffDays = Math.ceil((new Date(expiryDate) - new Date()) / MS_PER_DAY);
  if (diffDays <= 1) return 'expiring';
  if (diffDays <= 3) return 'soon';
  if (diffDays <= 7) return 'good';
  return 'fresh';
}
```

### 2. Query Client Configuration

```tsx
// src/lib/query-client.ts
- Default staleTime: 5 minutes
- OpenFoodFacts queries: Persisted to localStorage (7 days)
- Refetch on window focus: Disabled (mobile UX)
- Retry: 1 attempt
```

### 3. Image Upload Flow

```tsx
User selects photo
        ↓
image-upload.ts: Compress with pica (max 800px, JPEG 0.8)
        ↓
Convert to base64
        ↓
Store in FoodItem.imageUrl
        ↓
Persist via API
```

## Design Patterns in Use

1. **Repository Pattern** - API interfaces abstract data sources
2. **Observer Pattern** - Supabase auth state changes update Zustand store
3. **Command Pattern** - Mutations encapsulate state changes
4. **Strategy Pattern** - Multiple authentication strategies (TMA vs email)
5. **Compound Component Pattern** - Form components (FoodForm uses pickers)
