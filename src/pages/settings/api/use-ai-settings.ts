import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store';
import {
  fetchAiSettingsStatus,
  saveAiSettings,
  type SaveAiSettingsInput,
} from './ai-settings.api';

export const AI_SETTINGS_QUERY_KEY = ['ai-settings'] as const;

/**
 * Hook to fetch the caller's AI config status (masked — no raw key).
 */
export function useAiSettings() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useQuery({
    queryKey: [...AI_SETTINGS_QUERY_KEY, userId],
    queryFn: fetchAiSettingsStatus,
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to upsert the AI config; invalidates the status query on settle so the
 * UI reflects the saved (masked) state even when the save partially fails.
 */
export function useSaveAiSettings() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;

  return useMutation({
    mutationFn: (input: SaveAiSettingsInput) => saveAiSettings(input),
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [...AI_SETTINGS_QUERY_KEY, userId],
        });
      }
    },
  });
}
