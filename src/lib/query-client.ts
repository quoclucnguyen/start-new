import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { OPENFOODFACTS_QUERY_KEY } from '@/api/openfoodfacts';

// Cache times
const GC_TIME_DEFAULT = 1000 * 60 * 5; // 5 minutes
const GC_TIME_PERSISTED = 1000 * 60 * 60 * 24 * 7; // 7 days for persisted queries

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: GC_TIME_DEFAULT,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Create localStorage persister for OpenFoodFacts cache
// eslint-disable-next-line deprecation/deprecation
const localStoragePersister = createSyncStoragePersister({
  storage: globalThis.window?.localStorage,
  key: 'food-inventory-cache',
  // Throttle writes to localStorage
  throttleTime: 1000,
});

// Persist only OpenFoodFacts queries to localStorage
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: GC_TIME_PERSISTED,
  // Only persist openfoodfacts queries
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Only persist successful openfoodfacts queries
      const queryKey = query.queryKey;
      if (Array.isArray(queryKey) && queryKey[0] === OPENFOODFACTS_QUERY_KEY) {
        return query.state.status === 'success';
      }
      return false;
    },
  },
});
