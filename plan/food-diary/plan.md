# Food Diary / Foodie CRM — Implementation Plan

**Created:** 2026-03-14
**Status:** Planned
**Priority:** Medium

---

## Overview

Food Diary / Personal Foodie CRM module cho phép ghi lại trải nghiệm ăn ngoài (delivery, dine-in, ready-made), lưu nhớ quán/món, và hỗ trợ ra quyết định cho lần ăn sau. Tích hợp trực tiếp vào app hiện tại, dùng chung auth/layout/infra.

### Problem Solved

- "Quán này ngon không? Món nào đáng gọi?" → Dish-level memory (rating, notes, favorite/blacklist)
- "Lần trước ăn gì?" → Meal log history với search/filter
- "Hôm nay ăn gì?" → Recent suggestions, favorite venues, forgotten gems
- "Tiêu bao nhiêu?" → Cost tracking ở mức awareness

### Scope Breakdown

| Phase | Tên | Mô tả |
|-------|-----|-------|
| **MVP A** | Log nhanh + Memory quán–món | Quick log, Venue/Dish CRM, History, Recent suggestions |
| **MVP B** | CRM sâu + Dashboard nhẹ | Item-level entries đầy đủ, price/rating history, analytics dashboard |
| **MVP C** | Discovery nâng cao | Forgotten gems, random weighted, rule-based nudges |
| **MVP D** | Automation | OCR bill, transaction parsing, export |

### Success Metrics

- Thời gian log trung bình: **< 20 giây**
- Số log/tuần (độ bám dính)
- Số venue/item có notes/rating (độ sâu memory)
- Tỷ lệ dùng suggestion (CTR)

### Key Decisions

- **Integration:** Trực tiếp vào app hiện tại, share auth/layout/infra
- **Navigation:** 5 tab: Home, List, **Diary**, Recipes, Settings
- **Cross-domain:** Độc lập hoàn toàn với Food Inventory
- **Tags:** TEXT[] postgres array (không cần bảng tags riêng cho MVP A)
- **Photo storage:** Bucket riêng `diary-images` trên Supabase Storage
- **Currency:** Mặc định VND, chỉ lưu số (không multi-currency cho MVP)

---

## Data Model

### TypeScript Types

```typescript
// src/api/diary/types.ts

// ============================================================================
// Enums as Union Types (erasableSyntaxOnly)
// ============================================================================

export type MealType = 'delivery' | 'dine_in' | 'ready_made';
export type VenueStatus = 'favorite' | 'blacklisted' | 'neutral';

// ============================================================================
// Venue (quán ăn)
// ============================================================================

export interface Venue {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: VenueStatus;
  tags: string[];
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueInput {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: VenueStatus;
  tags?: string[];
  notes?: string;
  imageUrl?: string;
}

export interface UpdateVenueInput {
  id: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: VenueStatus;
  tags?: string[];
  notes?: string;
  imageUrl?: string;
}

export interface DbVenue {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  tags: string[] | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  last_modified: string;
  deleted: boolean;
  synced: boolean;
}

// ============================================================================
// MenuItem (món ăn tại 1 quán)
// ============================================================================

export interface MenuItem {
  id: string;
  venueId: string;
  name: string;
  lastPrice?: number;
  personalRating?: number; // 1-5
  isFavorite: boolean;
  isBlacklisted: boolean;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemInput {
  venueId: string;
  name: string;
  lastPrice?: number;
  personalRating?: number;
  isFavorite?: boolean;
  isBlacklisted?: boolean;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateMenuItemInput {
  id: string;
  name?: string;
  lastPrice?: number;
  personalRating?: number;
  isFavorite?: boolean;
  isBlacklisted?: boolean;
  notes?: string;
  imageUrl?: string;
}

export interface DbMenuItem {
  id: string;
  user_id: string;
  venue_id: string;
  name: string;
  last_price: number | null;
  personal_rating: number | null;
  is_favorite: boolean;
  is_blacklisted: boolean;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

// ============================================================================
// MealLog (1 bữa ăn)
// ============================================================================

export interface MealLog {
  id: string;
  venueId?: string;
  venue?: Venue;
  mealType: MealType;
  totalCost: number;
  overallRating?: number; // 1-5
  notes?: string;
  photos: string[];
  tags: string[];
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
  items?: MealItemEntry[];
}

export interface CreateMealLogInput {
  venueId?: string;
  mealType: MealType;
  totalCost: number;
  overallRating?: number;
  notes?: string;
  photos?: string[];
  tags?: string[];
  loggedAt?: string; // defaults to now()
  items?: CreateMealItemEntryInput[];
}

export interface UpdateMealLogInput {
  id: string;
  venueId?: string;
  mealType?: MealType;
  totalCost?: number;
  overallRating?: number;
  notes?: string;
  photos?: string[];
  tags?: string[];
  loggedAt?: string;
}

export interface DbMealLog {
  id: string;
  user_id: string;
  venue_id: string | null;
  meal_type: string;
  total_cost: number;
  overall_rating: number | null;
  notes: string | null;
  photos: string[] | null;
  tags: string[] | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
  last_modified: string;
  deleted: boolean;
  synced: boolean;
}

// ============================================================================
// MealItemEntry (chi tiết 1 món trong bữa ăn)
// ============================================================================

export interface MealItemEntry {
  id: string;
  mealLogId: string;
  menuItemId?: string;
  itemName: string;
  price?: number;
  quantity: number;
  rating?: number; // 1-5
  notes?: string;
}

export interface CreateMealItemEntryInput {
  menuItemId?: string;
  itemName: string;
  price?: number;
  quantity?: number;
  rating?: number;
  notes?: string;
}

export interface UpdateMealItemEntryInput {
  id: string;
  menuItemId?: string;
  itemName?: string;
  price?: number;
  quantity?: number;
  rating?: number;
  notes?: string;
}

export interface DbMealItemEntry {
  id: string;
  meal_log_id: string;
  menu_item_id: string | null;
  item_name: string;
  price: number | null;
  quantity: number;
  rating: number | null;
  notes: string | null;
}

// ============================================================================
// Helpers
// ============================================================================

export const MEAL_TYPE_LABELS = {
  delivery: 'Delivery',
  dine_in: 'Dine-in',
  ready_made: 'Ready-made',
} as const;

export const MEAL_TYPE_ICONS = {
  delivery: '🛵',
  dine_in: '🍽️',
  ready_made: '🏪',
} as const;

export const VENUE_STATUS_LABELS = {
  favorite: 'Favorite',
  blacklisted: 'Blacklisted',
  neutral: 'Neutral',
} as const;

export function formatCost(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}
```

### Database Schema

```sql
-- supabase/database/diary-tables.sql

-- ============================================================================
-- Venues (quán ăn)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'neutral'
    CHECK (status IN ('favorite', 'blacklisted', 'neutral')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false,
  synced BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_venues_user_id ON public.venues(user_id);
CREATE INDEX idx_venues_status ON public.venues(user_id, status) WHERE deleted = false;

-- RLS: all 4 operations scoped to auth.uid() = user_id

-- ============================================================================
-- Menu Items (món ăn tại 1 quán)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  venue_id UUID NOT NULL REFERENCES public.venues(id),
  name TEXT NOT NULL,
  last_price NUMERIC,
  personal_rating SMALLINT
    CHECK (personal_rating IS NULL OR (personal_rating >= 1 AND personal_rating <= 5)),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_menu_items_venue ON public.menu_items(venue_id) WHERE deleted = false;
CREATE INDEX idx_menu_items_user ON public.menu_items(user_id) WHERE deleted = false;

-- RLS: all 4 operations scoped to auth.uid() = user_id

-- ============================================================================
-- Meal Logs (bữa ăn)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  venue_id UUID REFERENCES public.venues(id),
  meal_type TEXT NOT NULL
    CHECK (meal_type IN ('delivery', 'dine_in', 'ready_made')),
  total_cost NUMERIC NOT NULL,
  overall_rating SMALLINT
    CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5)),
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false,
  synced BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_meal_logs_user ON public.meal_logs(user_id) WHERE deleted = false;
CREATE INDEX idx_meal_logs_venue ON public.meal_logs(venue_id) WHERE deleted = false;
CREATE INDEX idx_meal_logs_logged ON public.meal_logs(user_id, logged_at DESC) WHERE deleted = false;

-- RLS: all 4 operations scoped to auth.uid() = user_id

-- ============================================================================
-- Meal Item Entries (chi tiết món trong bữa)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meal_item_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_log_id UUID NOT NULL REFERENCES public.meal_logs(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  item_name TEXT NOT NULL,
  price NUMERIC,
  quantity SMALLINT NOT NULL DEFAULT 1,
  rating SMALLINT
    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  notes TEXT
);

CREATE INDEX idx_meal_item_entries_log ON public.meal_item_entries(meal_log_id);

-- RLS: inherit from meal_logs via EXISTS subquery on meal_log_id → user_id
```

### Table Relationships

```
auth.users (Supabase)
  └── venues (1:N, user_id)
  │     └── menu_items (1:N, venue_id)
  │     └── meal_logs (1:N, venue_id — nullable)
  └── meal_logs (1:N, user_id)
        └── meal_item_entries (1:N, meal_log_id — CASCADE)
              └── menu_items (N:1, menu_item_id — nullable link)
```

---

## API Layer Design

### Pattern

Follow the exact pattern from `src/api/food-items.api.ts`:
- Abstract `interface I*Api`
- Supabase implementation (production)
- Mock implementation (localStorage, development)
- Env-driven export via `VITE_USE_MOCK_API`
- Explicit `mapDbTo*()` / `mapCreateInputToDb()` mapper functions

### Venues API (`src/api/diary/venues.api.ts`)

```typescript
export interface IVenuesApi {
  getAll(userId: string): Promise<Venue[]>;
  getById(id: string, userId: string): Promise<Venue | null>;
  create(input: CreateVenueInput, userId: string): Promise<Venue>;
  update(input: UpdateVenueInput, userId: string): Promise<Venue>;
  delete(id: string, userId: string): Promise<void>;
  search(query: string, userId: string): Promise<Venue[]>;
}
```

### Meal Logs API (`src/api/diary/meal-logs.api.ts`)

```typescript
export interface IMealLogsApi {
  getAll(userId: string): Promise<MealLog[]>;
  getById(id: string, userId: string): Promise<MealLog | null>;
  create(input: CreateMealLogInput, userId: string): Promise<MealLog>;
  update(input: UpdateMealLogInput, userId: string): Promise<MealLog>;
  delete(id: string, userId: string): Promise<void>;
  getRecent(userId: string, limit?: number): Promise<MealLog[]>;
}
```

Supabase impl notes:
- `getAll`: `.select('*, venues(*)').eq('deleted', false).order('logged_at', { ascending: false })`
- `getById`: `.select('*, venues(*), meal_item_entries(*)').eq('id', id)`
- `getRecent`: same as getAll but with `.limit(limit)`

### Menu Items API (`src/api/diary/menu-items.api.ts`)

```typescript
export interface IMenuItemsApi {
  getByVenue(venueId: string, userId: string): Promise<MenuItem[]>;
  getAll(userId: string): Promise<MenuItem[]>;
  create(input: CreateMenuItemInput, userId: string): Promise<MenuItem>;
  update(input: UpdateMenuItemInput, userId: string): Promise<MenuItem>;
  delete(id: string, userId: string): Promise<void>;
}
```

### Meal Item Entries API (`src/api/diary/meal-item-entries.api.ts`)

```typescript
export interface IMealItemEntriesApi {
  getByMealLog(mealLogId: string): Promise<MealItemEntry[]>;
  createBatch(mealLogId: string, entries: CreateMealItemEntryInput[]): Promise<MealItemEntry[]>;
  update(input: UpdateMealItemEntryInput): Promise<MealItemEntry>;
  delete(id: string): Promise<void>;
}
```

---

## Query Hooks

All follow the pattern from `src/api/use-food-items.ts` + `src/api/use-food-mutations.ts`.

### Query Keys

```typescript
export const VENUES_QUERY_KEY = ['venues'] as const;
export const MEAL_LOGS_QUERY_KEY = ['meal-logs'] as const;
export const MENU_ITEMS_QUERY_KEY = ['menu-items'] as const;
```

### Hook Files

| File | Hooks |
|------|-------|
| `use-venues.ts` | `useVenues()`, `useVenue(id)`, `useVenueSearch(query)` |
| `use-venue-mutations.ts` | `useAddVenue()`, `useUpdateVenue()`, `useDeleteVenue()` |
| `use-meal-logs.ts` | `useMealLogs()`, `useMealLog(id)`, `useRecentMealLogs(limit)` |
| `use-meal-log-mutations.ts` | `useAddMealLog()`, `useUpdateMealLog()`, `useDeleteMealLog()` |
| `use-menu-items.ts` | `useMenuItems(venueId)`, `useAllMenuItems()` |
| `use-menu-item-mutations.ts` | `useAddMenuItem()`, `useUpdateMenuItem()`, `useDeleteMenuItem()` |

### Optimistic Update Pattern

Same as `src/api/use-food-mutations.ts`:
```typescript
onMutate: async (newItem) => {
  await queryClient.cancelQueries({ queryKey: [...KEY, userId] });
  const previous = queryClient.getQueryData<T[]>([...KEY, userId]);
  queryClient.setQueryData([...KEY, userId], (old) => [...(old ?? []), optimistic]);
  return { previous };
},
onError: (_err, _vars, context) => {
  queryClient.setQueryData([...KEY, userId], context?.previous);
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: [...KEY, userId] });
},
```

---

## Zustand Store

### `src/store/diary.store.ts`

```typescript
import { create } from 'zustand';
import type { MealType, VenueStatus } from '@/api/diary/types';

interface DiaryFilters {
  search: string;
  mealType: 'all' | MealType;
  venueStatus: 'all' | VenueStatus;
  sort: 'recent' | 'cost' | 'rating';
}

interface DiaryUIState {
  filters: DiaryFilters;
  setSearch: (search: string) => void;
  setMealType: (type: 'all' | MealType) => void;
  setVenueStatus: (status: 'all' | VenueStatus) => void;
  setSort: (sort: DiaryFilters['sort']) => void;
  resetFilters: () => void;

  editingMealLogId: string | null;
  setEditingMealLogId: (id: string | null) => void;
  editingVenueId: string | null;
  setEditingVenueId: (id: string | null) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
}
```

---

## Routing

### Route Updates (`src/App.tsx`)

Add under protected MainLayout children:
```typescript
{
  path: "diary",
  children: [
    { index: true, element: <DiaryDashboard /> },
    { path: "history", element: <MealHistoryPage /> },
  ],
},
```

Add as standalone protected routes (no MainLayout):
```typescript
{
  path: "diary/log",
  element: <AuthGuard><QuickLogPage /></AuthGuard>,
},
{
  path: "diary/venue/:id",
  element: <AuthGuard><VenueDetailPage /></AuthGuard>,
},
```

### Bottom Navigation

Update `src/components/layout/main-bottom-nav.tsx` to 5 tabs:

| Tab | Path | Icon (lucide-react) |
|-----|------|----|
| Home | `/` | `LayoutDashboard` |
| List | `/list` | `ClipboardList` |
| **Diary** | **`/diary`** | **`UtensilsCrossed`** |
| Recipes | `/recipes` | `Utensils` |
| Settings | `/settings` | `Settings` |

---

## Components & Pages

### Pages (`src/pages/diary/`)

#### DiaryDashboard.tsx
- Main diary tab landing
- Quick log buttons: 3 meal type cards (Delivery 🛵 / Dine-in 🍽️ / Ready-made 🏪)
- Tapping a type → navigate to `/diary/log?type={type}`
- "Recent Meals" section: last 5 logs via `useRecentMealLogs(5)`
- "Favorite Venues" section: venues with status='favorite'
- FAB: navigate to `/diary/log`

#### QuickLogPage.tsx (standalone, no bottom nav)
- Top bar with back button + "Log a Meal" title
- Step 1: Meal type selector (3 large buttons, pre-selected if `?type` passed)
- Step 2: Total cost input (large number pad, VND format)
- Step 3: Save button (primary)
- Below save: Optional progressive disclosure accordion
  - Venue picker (search/create)
  - Notes text area
  - Rating (1-5 stars)
  - Photos (image upload)
  - Tags (free-text chips)
- After save: Toast + option "Add dishes" → navigate to meal log detail

#### MealHistoryPage.tsx
- Top bar: "History" title + filter icon
- Search input
- Filter chips: All / Delivery / Dine-in / Ready-made
- Sort: Recent / Cost / Rating
- Meal log cards grouped by date (Today / Yesterday / older)
- Each card → `meal-log-card.tsx`, tap → edit sheet

#### VenueDetailPage.tsx (standalone)
- Top bar with back + venue name
- Venue info card: address, status badge, tags, notes
- Status toggle: Favorite ⭐ / Neutral / Blacklisted
- "Món tủ" section: menu items where `isFavorite = true`
- "Món cần tránh" section: menu items where `isBlacklisted = true`
- "All Dishes" section: all menu items with rating
- "Visit History" section: meal logs at this venue
- FAB: "Log here" → `/diary/log?venue={id}`

#### MealLogDetailSheet.tsx (bottom sheet)
- Full edit: venue, dishes, photos, rating, notes, tags
- Dish list with add/edit/delete
- Uses `dish-entry-form.tsx` for each dish

### Components (`src/components/diary/`)

| Component | Description | Ref Pattern |
|-----------|-------------|-------------|
| `meal-type-selector.tsx` | 3 large buttons (Delivery/Dine-in/Ready-made) with icons + labels | `category-picker.tsx` |
| `meal-log-card.tsx` | Card for 1 meal (type icon, venue, cost, rating, date) | `food-item-card.tsx` |
| `venue-picker.tsx` | Autocomplete search + "Create new" inline | antd-mobile `SearchBar` + `List` |
| `venue-card.tsx` | Card for 1 venue (status badge, visit count, last visit) | `food-item-card.tsx` |
| `dish-entry-form.tsx` | Form for 1 dish (name, price, qty, rating, notes) | `food-form.tsx` fields |
| `rating-input.tsx` | Star rating 1-5 (tap to set) | Custom, reusable |
| `cost-input.tsx` | Number input with VND formatting, large font | Custom |
| `meal-type-badge.tsx` | Small badge showing meal type icon + label | `Tag` from antd-mobile |
| `venue-status-badge.tsx` | Badge showing venue favorite/blacklist/neutral | `Tag` from antd-mobile |
| `index.ts` | Barrel export | Standard |

---

## Files Summary

### New Files

```
supabase/database/diary-tables.sql

src/api/diary/
├── types.ts
├── venues.api.ts
├── meal-logs.api.ts
├── menu-items.api.ts
├── meal-item-entries.api.ts
├── use-venues.ts
├── use-venue-mutations.ts
├── use-meal-logs.ts
├── use-meal-log-mutations.ts
├── use-menu-items.ts
├── use-menu-item-mutations.ts
└── index.ts

src/store/diary.store.ts

src/components/diary/
├── meal-type-selector.tsx
├── meal-log-card.tsx
├── venue-picker.tsx
├── venue-card.tsx
├── dish-entry-form.tsx
├── rating-input.tsx
├── cost-input.tsx
├── meal-type-badge.tsx
├── venue-status-badge.tsx
└── index.ts

src/pages/diary/
├── DiaryDashboard.tsx
├── QuickLogPage.tsx
├── MealHistoryPage.tsx
├── VenueDetailPage.tsx
└── MealLogDetailSheet.tsx
```

### Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add diary routes (4 routes) |
| `src/components/layout/main-bottom-nav.tsx` | Add 5th "Diary" tab |
| `src/components/layout/main-layout.tsx` | FAB behavior for `/diary` routes |
| `src/components/index.ts` | Add diary barrel export |
| `src/store/index.ts` | Add diary store export |
| `src/api/index.ts` | Add diary API re-exports |

---

## MVP A — Implementation Order

### Phase 1: Foundation (blocking everything)
1. Create `supabase/database/diary-tables.sql` — migration with 4 tables + RLS + indexes
2. Create `src/api/diary/types.ts` — all TypeScript types, Db types, helpers

### Phase 2: Data Layer (depends on Phase 1)
3. `src/api/diary/venues.api.ts` — IVenuesApi + supabase + mock + mappers
4. `src/api/diary/meal-logs.api.ts` — IMealLogsApi + supabase + mock + mappers *(parallel with 3)*
5. `src/api/diary/menu-items.api.ts` — IMenuItemsApi + supabase + mock + mappers *(parallel)*
6. `src/api/diary/meal-item-entries.api.ts` — IMealItemEntriesApi *(parallel)*
7. Query hooks: `use-venues.ts`, `use-meal-logs.ts`, `use-menu-items.ts` *(depends on 3-6)*
8. Mutation hooks: `use-venue-mutations.ts`, `use-meal-log-mutations.ts`, `use-menu-item-mutations.ts` *(depends on 7)*
9. Barrel export `src/api/diary/index.ts`

### Phase 3: UI Foundation (depends on Phase 2)
10. `src/store/diary.store.ts` — Zustand store
11. Update `src/components/layout/main-bottom-nav.tsx` — 5th tab
12. Update `src/App.tsx` — diary routes
13. Update `src/components/layout/main-layout.tsx` — FAB for diary
14. Base components: `rating-input.tsx`, `cost-input.tsx`, `meal-type-selector.tsx`, `meal-type-badge.tsx`, `venue-status-badge.tsx` *(parallel)*

### Phase 4: Core Pages (depends on Phase 3)
15. `meal-log-card.tsx` — needed by dashboard + history
16. `DiaryDashboard.tsx` — tab landing *(depends on 15)*
17. `QuickLogPage.tsx` — minimum viable: type + cost + save *(parallel with 16)*
18. `MealHistoryPage.tsx` — full history with filters *(depends on 15)*

### Phase 5: CRM Features (depends on Phase 4)
19. `venue-picker.tsx` + `venue-card.tsx`
20. `dish-entry-form.tsx`
21. `VenueDetailPage.tsx` *(depends on 19)*
22. `MealLogDetailSheet.tsx` — full edit sheet *(depends on 19, 20)*
23. Enhance `QuickLogPage` with venue picker + progressive disclosure *(depends on 19)*

### Phase 6: Polish
24. Suggestions logic in `DiaryDashboard` (recent + frequent venues, món tủ)
25. Empty states, loading skeletons, error handling
26. Update barrel exports: `src/components/index.ts`, `src/api/index.ts`, `src/store/index.ts`
27. `npm run lint && npm run build` — verify clean

---

## MVP B — CRM Sâu + Dashboard Nhẹ

### Scope
- Item-level entries đầy đủ với price history
- Rating history (track rating thay đổi theo thời gian)
- Analytics dashboard nhẹ
- Delivery-specific fields

### New Tables

```sql
-- price_history: track giá món theo thời gian
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  price NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- rating_history: track rating thay đổi
CREATE TABLE IF NOT EXISTS public.rating_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('venue', 'menu_item')),
  target_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
```

### Schema Changes
- `meal_logs` add: `delivery_fee`, `service_fee`, `tip`, `voucher_discount` (all NUMERIC)
- `meal_logs` add: `order_time`, `delivery_time` (TIMESTAMPTZ)
- `meal_logs` add: `delivery_rating` (SMALLINT CHECK 1-5)

### New Features

1. **Price History View** — Line chart showing price changes over time per menu item
2. **Rating History View** — Timeline showing rating changes per venue/item
3. **Analytics Dashboard** (`/diary/analytics`) — Top venues by frequency/spend, spending trends, delivery fee tracking
4. **Delivery Detail Form** — Split: food cost / delivery fee / service fee / tip / voucher
5. **Re-order Concept** — Lưu combo hay gọi, quick re-log

### New Files

```
src/api/diary/price-history.api.ts + use-price-history.ts
src/api/diary/rating-history.api.ts + use-rating-history.ts
src/pages/diary/AnalyticsDashboard.tsx
src/components/diary/delivery-detail-form.tsx
src/components/diary/price-history-chart.tsx
src/components/diary/rating-timeline.tsx
src/components/diary/reorder-combo-card.tsx
```

---

## MVP C — Discovery Nâng Cao

### Scope
- Smart decision support: random weighted, forgotten gems, nudges
- Context-aware suggestions
- Cuisine/area tracking

### New Features

1. **"Forgotten Gems"** — Gợi ý quán ngon lâu chưa quay lại
   - Logic: venues with `status = 'favorite'` OR avg rating ≥ 4, last visited > 30 days
   - Sort: rating DESC, days since last visit DESC

2. **Random Weighted Suggestion** — "Hôm nay ăn gì?"
   - Higher weight for: favorite venues, high-rated dishes, venues not visited recently
   - Exclude blacklisted
   - UI: "Suggest me" button → animated reveal

3. **Rule-based Nudges**
   - "Bạn đã ăn Delivery 5 lần liên tiếp → thử dine-in?"
   - "Phí ship tuần này cao hơn bình thường"
   - "Menu chưa thử tại quán yêu thích"
   - Rules stored as code, not user-configurable (MVP)

4. **Cuisine Tagging** — Add `cuisine TEXT[]` to venues, filter by cuisine

5. **Area-based Suggestions** — Group venues by area/district

### New Files

```
src/api/diary/use-diary-suggestions.ts (forgotten gems, random weighted)
src/lib/diary/nudge-engine.ts (rule evaluation)
src/components/diary/forgotten-gems-section.tsx
src/components/diary/random-suggestion.tsx
src/components/diary/nudge-banner.tsx
src/components/diary/cuisine-filter.tsx
```

---

## MVP D — Automation

### Scope
- OCR bill/receipt scanning
- Transaction parsing from bank SMS/notifications
- Data export
- Geolocation-based venue suggestion

### New Features

1. **OCR Receipt Scanning**
   - Camera capture → Gemini Vision API (Supabase Edge Function)
   - Extract: venue name, item names, prices, total
   - Confirm/edit → create MealLog + MealItemEntries
   - Reuse camera infra from `src/components/scanner/`

2. **Transaction Parsing**
   - Manual paste SMS → regex extract amount + merchant
   - Fuzzy match merchant → existing venue
   - Auto-suggest: "Log this as a meal?"

3. **Data Export** — CSV/JSON export with date range filter

4. **Geolocation** — Browser Geolocation API → sort venues by proximity

### Schema Changes
- `meal_logs` add: `receipt_image_url TEXT`, `source TEXT DEFAULT 'manual'` CHECK ('manual', 'ocr', 'transaction')

### New Files

```
supabase/functions/ocr-receipt/index.ts
src/api/diary/ocr.api.ts + use-ocr.ts
src/pages/diary/ScanReceiptPage.tsx
src/pages/diary/VerifyScannedItemsPage.tsx
src/lib/diary/transaction-parser.ts
src/components/diary/transaction-paste.tsx
src/lib/diary/export.ts
src/pages/diary/ExportPage.tsx
src/hooks/use-user-location.ts
src/components/diary/nearby-venues.tsx
```

---

## Verification

### Automated
1. `npm run lint` — No lint errors
2. `npm run build` — TypeScript compiles cleanly

### Manual — MVP A
3. Bottom nav shows 5 tabs, Diary tab active at `/diary`
4. Quick log: type → amount → save in < 20 seconds
5. Meal appears in history after save
6. Create venue → log at venue → venue detail shows visit
7. Add dishes → mark favorite → venue shows "món tủ"
8. History filters work (type, search, sort)
9. Mock API works with `VITE_USE_MOCK_API=true`

### Manual — MVP B
10. Delivery log correctly splits fees
11. Analytics charts display with correct data
12. Price history chart shows when ≥2 data points

### Manual — MVP C
13. Forgotten gems shows favorite venues not visited in 30+ days
14. Random suggestion returns non-blacklisted venue
15. Nudge banner appears when conditions met

### Manual — MVP D
16. OCR: capture receipt → extract ≥80% items correctly
17. Export CSV contains correct filtered data

---

## Considerations

### Tags Strategy
MVP A dùng `TEXT[]` column trên `meal_logs` và `venues` (đơn giản). Nếu cần tag management UI + normalization → chuyển sang bảng `tags` riêng ở MVP B+.

### Photo Storage
Tạo bucket riêng `diary-images` trên Supabase Storage để tách biệt với `food-images`. Dùng chung `image-upload.ts` utility.

### Currency
Chỉ lưu số (NUMERIC). Mặc định VND. Nếu cần multi-currency sau → thêm `currency` column ở MVP B+.

### Offline Support
MVP A dùng TanStack Query cache. Offline queue đầy đủ (localStorage + sync) defer sang MVP D.
