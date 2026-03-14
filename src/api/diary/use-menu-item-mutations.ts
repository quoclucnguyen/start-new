import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuItemsApi } from './menu-items.api';
import { MENU_ITEMS_QUERY_KEY } from './use-menu-items';
import { useAuthStore } from '@/store';
import type { MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from './types';

export function useAddMenuItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: CreateMenuItemInput) => {
      if (!userId) throw new Error('User not authenticated');
      return menuItemsApi.create(input, userId);
    },
    onMutate: async (newInput) => {
      if (!userId) return;
      const queryKey = [...MENU_ITEMS_QUERY_KEY, userId, newInput.venueId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MenuItem[]>(queryKey);

      const optimistic: MenuItem = {
        id: `temp-${Date.now()}`,
        venueId: newInput.venueId,
        name: newInput.name,
        lastPrice: newInput.lastPrice,
        personalRating: newInput.personalRating,
        isFavorite: newInput.isFavorite ?? false,
        isBlacklisted: newInput.isBlacklisted ?? false,
        notes: newInput.notes,
        imageUrl: newInput.imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<MenuItem[]>(queryKey, (old) =>
        old ? [...old, optimistic] : [optimistic],
      );
      return { previous, queryKey };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _err, input) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...MENU_ITEMS_QUERY_KEY, userId, input.venueId] });
        queryClient.invalidateQueries({ queryKey: [...MENU_ITEMS_QUERY_KEY, userId, 'all'] });
      }
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: UpdateMenuItemInput) => {
      if (!userId) throw new Error('User not authenticated');
      return menuItemsApi.update(input, userId);
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...MENU_ITEMS_QUERY_KEY, userId] });
      }
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error('User not authenticated');
      return menuItemsApi.delete(id, userId);
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [...MENU_ITEMS_QUERY_KEY, userId] });
      }
    },
  });
}
