// Types
export type {
  OpenFoodFactsProduct,
  OpenFoodFactsResponse,
  ScannedProductData,
  CachedProductEntry,
} from './types';

// API
export { openFoodFactsApi, type IOpenFoodFactsApi } from './openfoodfacts.api';

// Query hooks
export {
  useProductByBarcode,
  prefetchProduct,
  OPENFOODFACTS_QUERY_KEY,
} from './use-openfoodfacts';
