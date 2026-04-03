import { useQuery } from '@tanstack/react-query';
import { supabaseMealLogsApi } from './meal-logs.api';
import type { MealLog } from './types';

export const MEAL_LOGS_QUERY_KEY = ['meal-logs'] as const;

export function useMealLogs() {
  return useQuery<MealLog[], Error>({
    queryKey: MEAL_LOGS_QUERY_KEY,
    queryFn: () => supabaseMealLogsApi.getAll(),
  });
}

export function useMealLog(id: string | null) {
  return useQuery<MealLog | null, Error>({
    queryKey: [...MEAL_LOGS_QUERY_KEY, id],
    queryFn: () => (id ? supabaseMealLogsApi.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useRecentMealLogs(limit: number = 5) {
  return useQuery<MealLog[], Error>({
    queryKey: [...MEAL_LOGS_QUERY_KEY, 'recent', limit],
    queryFn: () => supabaseMealLogsApi.getRecent(limit),
  });
}
