import { useQuery } from '@tanstack/react-query';
import { supabaseMealLogsApi } from './meal-logs.api';
import { useAuthStore } from '@/store';
import type { MealLog } from './types';

export const MEAL_LOGS_QUERY_KEY = ['meal-logs'] as const;

export function useMealLogs() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<MealLog[], Error>({
    queryKey: [...MEAL_LOGS_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseMealLogsApi.getAll(userId);
    },
    enabled: !!userId,
  });
}

export function useMealLog(id: string | null) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<MealLog | null, Error>({
    queryKey: [...MEAL_LOGS_QUERY_KEY, userId, id],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return id ? supabaseMealLogsApi.getById(id, userId) : Promise.resolve(null);
    },
    enabled: !!id && !!userId,
  });
}

export function useRecentMealLogs(limit: number = 5) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<MealLog[], Error>({
    queryKey: [...MEAL_LOGS_QUERY_KEY, userId, 'recent', limit],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseMealLogsApi.getRecent(userId, limit);
    },
    enabled: !!userId,
  });
}
