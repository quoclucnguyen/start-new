import { useMutation, useQueryClient } from '@tanstack/react-query';
import { venuesApi } from './venues.api';
import { VENUES_QUERY_KEY } from './use-venues';
import { useAuthStore } from '@/store';
import type { Venue, CreateVenueInput, UpdateVenueInput } from './types';

export function useAddVenue() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: CreateVenueInput) => {
      if (!userId) throw new Error('User not authenticated');
      return venuesApi.create(input, userId);
    },
    onMutate: async (newInput) => {
      if (!userId) return;
      const queryKey = [...VENUES_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Venue[]>(queryKey);

      const optimistic: Venue = {
        id: `temp-${Date.now()}`,
        name: newInput.name,
        address: newInput.address,
        latitude: newInput.latitude,
        longitude: newInput.longitude,
        status: newInput.status ?? 'neutral',
        tags: newInput.tags ?? [],
        notes: newInput.notes,
        imageUrl: newInput.imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Venue[]>(queryKey, (old) =>
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
        queryClient.invalidateQueries({ queryKey: [...VENUES_QUERY_KEY, userId] });
      }
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: UpdateVenueInput) => {
      if (!userId) throw new Error('User not authenticated');
      return venuesApi.update(input, userId);
    },
    onMutate: async (updatedInput) => {
      if (!userId) return;
      const queryKey = [...VENUES_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Venue[]>(queryKey);

      queryClient.setQueryData<Venue[]>(queryKey, (old) =>
        old?.map((v) =>
          v.id === updatedInput.id
            ? { ...v, ...updatedInput, updatedAt: new Date().toISOString() }
            : v,
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
        queryClient.invalidateQueries({ queryKey: [...VENUES_QUERY_KEY, userId] });
      }
    },
  });
}

export function useDeleteVenue() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error('User not authenticated');
      return venuesApi.delete(id, userId);
    },
    onMutate: async (deletedId) => {
      if (!userId) return;
      const queryKey = [...VENUES_QUERY_KEY, userId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Venue[]>(queryKey);

      queryClient.setQueryData<Venue[]>(queryKey, (old) =>
        old?.filter((v) => v.id !== deletedId) ?? [],
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
        queryClient.invalidateQueries({ queryKey: [...VENUES_QUERY_KEY, userId] });
      }
    },
  });
}
