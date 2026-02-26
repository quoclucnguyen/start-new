# Active Context

**Last Updated:** 2025-02-26

## Current Work Focus

The project is in active development with core inventory management functionality complete. The most recent work involved:

1. **Barcode Scanning Integration** - Added `@ericblade/quagga2` for barcode scanning with OpenFoodFacts API integration
2. **Email/Password Authentication** - Implemented alternative auth method alongside Telegram login
3. **User-Configurable Categories & Storage** - Migrated from hardcoded union types to user-configurable strings with emoji and color customization
4. **Image Upload with Compression** - Added pica-based image compression before upload

## Recent Changes

### Authentication System
- Implemented dual auth: Telegram Mini App SDK + email/password fallback
- `useAuthStore` manages auth state with Supabase
- Auto-login via `getInitDataRaw()` when available
- See [src/store/auth.store.ts](../src/store/auth.store.ts) and [src/lib/tma.ts](../src/lib/tma.ts)

### Data Architecture Evolution
- **Changed:** `FoodCategory` and `StorageLocation` from union types to `string` type
- **Why:** Support user-configurable categories/locations instead of hardcoded values
- **Impact:** All components now expect dynamic configuration from settings API

### Barcode Scanner
- Integrated Quagga2 for barcode detection
- OpenFoodFacts API fetches product data by barcode
- See [src/components/scanner/](../src/components/scanner/) and [src/api/openfoodfacts/](../src/api/openfoodfacts/)

## Next Steps

### Immediate Priorities
1. **Shopping List Feature** - Create shopping list CRUD with ability to mark items as "needed"
2. **Recipe Suggestions** - Basic algorithm to suggest recipes based on available ingredients
3. **Expiry Notifications** - Implement push notifications for items approaching expiry

### Technical Debt
- Consider migration strategy from localStorage mock API to real Supabase backend
- Add error boundaries for better error handling
- Implement proper loading states for all async operations
- Add unit tests for critical business logic

## Active Decisions

### Using localStorage as Mock API
- **Decision:** `foodItemsApi` currently uses localStorage for persistence
- **Reasoning:** Allows frontend development without backend dependency
- **Future:** Migrate to Supabase backend when ready for production

### TanStack Query for All Server State
- **Decision:** Use TanStack Query exclusively for data fetching, Zustand only for UI state
- **Reasoning:** Clear separation of concerns, automatic caching, optimistic updates
- **Pattern:** All mutations implement `onMutate` → rollback → `invalidateQueries`

### MemoryRouter for TMA Compatibility
- **Decision:** Use `createMemoryRouter` instead of `createBrowserRouter`
- **Reasoning:** Telegram Mini Apps don't have browser history
- **Impact:** All navigation uses imperative router.navigate() rather than URL changes

## Important Patterns

### Component Export Pattern
```tsx
// Domain components co-locate stories
// components/food/food-item-card.tsx
// components/food/food-item-card.stories.tsx

// Export from components/index.ts
export * from './food';
```

### Optimistic Update Pattern
```tsx
// All mutations follow this pattern:
onMutate: async (variables) => {
  await queryClient.cancelQueries({ queryKey });
  const previousData = queryClient.getQueryData(queryKey);
  queryClient.setQueryData(queryKey, optimisticData);
  return { previousData, queryKey };
},
onError: (_err, _variables, context) => {
  context && queryClient.setQueryData(context.queryKey, context.previousData);
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey });
},
```

## Project Insights

### What Works Well
- TanStack Query's optimistic updates make the app feel fast and responsive
- Zustand's simplicity makes UI state management straightforward
- antd-mobile components provide good mobile UX out of the box
- Tailwind v4's CSS-first config is cleaner than JS-based config

### Pain Points
- Barcode scanning quality varies by device and lighting conditions
- Image compression can be slow on lower-end devices
- localStorage API will need complete rewrite for Supabase migration
- MemoryRouter makes deep linking and sharing difficult

### Learning Points
- User-configurable categories/locations adds significant complexity but improves UX
- Expiry status calculation (`getExpiryStatus`) is used everywhere - central helper was crucial
- Mobile-first design requires larger touch targets than desktop defaults
