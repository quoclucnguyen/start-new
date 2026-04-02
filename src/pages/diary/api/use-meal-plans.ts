import { useQuery } from '@tanstack/react-query';
import { supabaseMealPlansApi } from './meal-plans.api';
import { useAuthStore } from '@/store';
import type { MealPlan } from './types';

export const MEAL_PLANS_QUERY_KEY = ['meal-plans'] as const;

export function useMealPlans() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<MealPlan[], Error>({
    queryKey: [...MEAL_PLANS_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseMealPlansApi.getAll(userId);
    },
    enabled: !!userId,
  });
}
