import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseMealLogsApi } from './meal-logs.api';
import { MEAL_LOGS_QUERY_KEY } from './use-meal-logs';
import { useAuthStore } from '@/store';
import type { MealLog, CreateMealLogInput, UpdateMealLogInput } from './types';

export function useAddMealLog() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: CreateMealLogInput) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseMealLogsApi.create(input, userId);
    },
    onMutate: async (newInput) => {
      if (!userId) return;
      const queryKey = [...MEAL_LOGS_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MealLog[]>(queryKey);

      const optimistic: MealLog = {
        id: `temp-${Date.now()}`,
        venueId: newInput.venueId,
        mealType: newInput.mealType,
        totalCost: newInput.totalCost,
        overallRating: newInput.overallRating,
        notes: newInput.notes,
        photos: newInput.photos ?? [],
        tags: newInput.tags ?? [],
        loggedAt: newInput.loggedAt ?? new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<MealLog[]>(queryKey, (old) =>
        old ? [optimistic, ...old] : [optimistic],
      );
      return { previous, queryKey };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...MEAL_LOGS_QUERY_KEY, userId] });
      }
    },
  });
}

export function useUpdateMealLog() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: UpdateMealLogInput) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseMealLogsApi.update(input, userId);
    },
    onMutate: async (updatedInput) => {
      if (!userId) return;
      const queryKey = [...MEAL_LOGS_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MealLog[]>(queryKey);

      queryClient.setQueryData<MealLog[]>(queryKey, (old) =>
        old?.map((l) =>
          l.id === updatedInput.id
            ? { ...l, ...updatedInput, updatedAt: new Date().toISOString() }
            : l,
        ) ?? [],
      );
      return { previous, queryKey };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...MEAL_LOGS_QUERY_KEY, userId] });
      }
    },
  });
}

export function useDeleteMealLog() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseMealLogsApi.delete(id, userId);
    },
    onMutate: async (deletedId) => {
      if (!userId) return;
      const queryKey = [...MEAL_LOGS_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MealLog[]>(queryKey);

      queryClient.setQueryData<MealLog[]>(queryKey, (old) =>
        old?.filter((l) => l.id !== deletedId) ?? [],
      );
      return { previous, queryKey };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...MEAL_LOGS_QUERY_KEY, userId] });
      }
    },
  });
}
