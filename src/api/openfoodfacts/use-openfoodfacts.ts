import { useQuery } from '@tanstack/react-query';
import { openFoodFactsApi } from './openfoodfacts.api';
import type { ScannedProductData } from './types';

export const OPENFOODFACTS_QUERY_KEY = 'openfoodfacts' as const;

// Cache times for OpenFoodFacts queries
const STALE_TIME = 1000 * 60 * 60 * 24; // 24 hours - products don't change often
const GC_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days - keep in garbage collection

/**
 * Hook to fetch product data by barcode from OpenFoodFacts
 * 
 * Features:
 * - Aggressive caching (24h stale, 7d gc)
 * - Persisted to localStorage via query-persist-client
 * - Returns null for unknown products (not an error)
 * 
 * @param barcode - EAN-13, UPC-A, or other barcode string
 * @param options.enabled - Whether to enable the query (default: true when barcode is provided)
 */
export function useProductByBarcode(
  barcode: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery<ScannedProductData | null, Error>({
    queryKey: [OPENFOODFACTS_QUERY_KEY, barcode],
    queryFn: () => {
      if (!barcode) return null;
      return openFoodFactsApi.getByBarcode(barcode);
    },
    enabled: options?.enabled ?? !!barcode,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: (failureCount, error) => {
      // Don't retry on 404 (product not found)
      if (error.message.includes('404')) return false;
      return failureCount < 2;
    },
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Prefetch product data for a barcode
 * Useful for preloading data before navigation
 */
export async function prefetchProduct(
  queryClient: ReturnType<typeof import('@tanstack/react-query').useQueryClient>,
  barcode: string
) {
  return queryClient.prefetchQuery({
    queryKey: [OPENFOODFACTS_QUERY_KEY, barcode],
    queryFn: () => openFoodFactsApi.getByBarcode(barcode),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}
