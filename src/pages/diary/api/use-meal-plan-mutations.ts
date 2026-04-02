import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseMealPlansApi } from './meal-plans.api';
import { MEAL_PLANS_QUERY_KEY } from './use-meal-plans';
import { useAuthStore } from '@/store';
import type { MealPlan, CreateMealPlanInput, UpdateMealPlanInput } from './types';

export function useAddMealPlan() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: CreateMealPlanInput) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseMealPlansApi.create(input, userId);
    },
    onMutate: async (newInput) => {
      if (!userId) return;
      const queryKey = [...MEAL_PLANS_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MealPlan[]>(queryKey);

      const optimistic: MealPlan = {
        id: `temp-${Date.now()}`,
        plannedDate: newInput.plannedDate,
        title: newInput.title,
        notes: newInput.notes,
        sortOrder: newInput.sortOrder ?? 0,
        items: (newInput.items ?? []).map((item, i) => ({
          id: `temp-item-${Date.now()}-${i}`,
          mealPlanId: `temp-${Date.now()}`,
          title: item.title,
          recipeId: item.recipeId,
          notes: item.notes,
          sortOrder: i,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<MealPlan[]>(queryKey, (old) =>
        old ? [...old, optimistic] : [optimistic],
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
        queryClient.invalidateQueries({ queryKey: [...MEAL_PLANS_QUERY_KEY, userId] });
      }
    },
  });
}

export function useUpdateMealPlan() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: UpdateMealPlanInput) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseMealPlansApi.update(input, userId);
    },
    onMutate: async (updatedInput) => {
      if (!userId) return;
      const queryKey = [...MEAL_PLANS_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MealPlan[]>(queryKey);

      queryClient.setQueryData<MealPlan[]>(queryKey, (old) =>
        old?.map((p) => {
          if (p.id !== updatedInput.id) return p;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { items: _items, ...rest } = updatedInput;
          return { ...p, ...rest, updatedAt: new Date().toISOString() };
        }) ?? [],
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
        queryClient.invalidateQueries({ queryKey: [...MEAL_PLANS_QUERY_KEY, userId] });
      }
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseMealPlansApi.delete(id, userId);
    },
    onMutate: async (deletedId) => {
      if (!userId) return;
      const queryKey = [...MEAL_PLANS_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MealPlan[]>(queryKey);

      queryClient.setQueryData<MealPlan[]>(queryKey, (old) =>
        old?.filter((p) => p.id !== deletedId) ?? [],
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
        queryClient.invalidateQueries({ queryKey: [...MEAL_PLANS_QUERY_KEY, userId] });
      }
    },
  });
}

export function useAddMealPlanItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: { mealPlanId: string; title: string; recipeId?: string; notes?: string }) => {
      return supabaseMealPlansApi.addItem(input.mealPlanId, {
        title: input.title,
        recipeId: input.recipeId,
        notes: input.notes,
      });
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...MEAL_PLANS_QUERY_KEY, userId] });
      }
    },
  });
}

export function useRemoveMealPlanItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (itemId: string) => {
      return supabaseMealPlansApi.removeItem(itemId);
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...MEAL_PLANS_QUERY_KEY, userId] });
      }
    },
  });
}
