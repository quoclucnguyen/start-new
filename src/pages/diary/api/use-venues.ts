import { useQuery } from '@tanstack/react-query';
import { supabaseVenuesApi } from './venues.api';
import { useAuthStore } from '@/store';
import type { Venue } from './types';

export const VENUES_QUERY_KEY = ['venues'] as const;

export function useVenues() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<Venue[], Error>({
    queryKey: [...VENUES_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseVenuesApi.getAll(userId);
    },
    enabled: !!userId,
  });
}

export function useVenue(id: string | null) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<Venue | null, Error>({
    queryKey: [...VENUES_QUERY_KEY, userId, id],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return id ? supabaseVenuesApi.getById(id, userId) : Promise.resolve(null);
    },
    enabled: !!id && !!userId,
  });
}

export function useVenueSearch(query: string) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery<Venue[], Error>({
    queryKey: [...VENUES_QUERY_KEY, userId, 'search', query],
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return supabaseVenuesApi.search(query, userId);
    },
    enabled: !!userId && query.length >= 1,
  });
}
