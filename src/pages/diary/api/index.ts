// Types
export type {
  MealType,
  VenueStatus,
  Venue,
  CreateVenueInput,
  UpdateVenueInput,
  MenuItem,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  MealLog,
  CreateMealLogInput,
  UpdateMealLogInput,
  MealItemEntry,
  CreateMealItemEntryInput,
  UpdateMealItemEntryInput,
  MealPlan,
  MealPlanItem,
  CreateMealPlanInput,
  CreateMealPlanItemInput,
  UpdateMealPlanInput,
} from './types';

export {
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ICONS,
  VENUE_STATUS_LABELS,
  formatCost,
  formatLogDate,
  groupLogsByDate,
  getDateGroupLabel,
} from './types';

// API
export { supabaseVenuesApi, type IVenuesApi } from './venues.api';
export { supabaseMealLogsApi, type IMealLogsApi } from './meal-logs.api';
export { supabaseMenuItemsApi, type IMenuItemsApi } from './menu-items.api';
export { supabaseMealItemEntriesApi, type IMealItemEntriesApi } from './meal-item-entries.api';

// Query hooks
export { useVenues, useVenue, useVenueSearch, VENUES_QUERY_KEY } from './use-venues';
export { useMealLogs, useMealLog, useRecentMealLogs, MEAL_LOGS_QUERY_KEY } from './use-meal-logs';
export { useMenuItems, useAllMenuItems, MENU_ITEMS_QUERY_KEY } from './use-menu-items';

// Meal plan hooks
export { useMealPlans, MEAL_PLANS_QUERY_KEY } from './use-meal-plans';
export { supabaseMealPlansApi, type IMealPlansApi } from './meal-plans.api';
export { useAddMealPlan, useUpdateMealPlan, useDeleteMealPlan, useAddMealPlanItem, useRemoveMealPlanItem } from './use-meal-plan-mutations';

// Mutation hooks
export { useAddVenue, useUpdateVenue, useDeleteVenue } from './use-venue-mutations';
export { useAddMealLog, useUpdateMealLog, useDeleteMealLog } from './use-meal-log-mutations';
export { useAddMenuItem, useUpdateMenuItem, useDeleteMenuItem } from './use-menu-item-mutations';
