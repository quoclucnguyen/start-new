import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, storageLocationsApi } from './settings.api';
import type { CategoryConfig, StorageLocationConfig } from './types';

// ============================================================================
// Query Keys
// ============================================================================

export const CATEGORIES_QUERY_KEY = ['categories'] as const;
export const STORAGE_LOCATIONS_QUERY_KEY = ['storage-locations'] as const;

// ============================================================================
// Categories Hooks
// ============================================================================

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: Omit<CategoryConfig, 'id' | 'createdAt'>) =>
      categoriesApi.create(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<CategoryConfig, 'id' | 'createdAt'>>;
    }) => categoriesApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });

      const previous = queryClient.getQueryData<CategoryConfig[]>(
        CATEGORIES_QUERY_KEY
      );

      queryClient.setQueryData<CategoryConfig[]>(
        CATEGORIES_QUERY_KEY,
        (old = []) => old.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });

      const previous = queryClient.getQueryData<CategoryConfig[]>(
        CATEGORIES_QUERY_KEY
      );

      queryClient.setQueryData<CategoryConfig[]>(
        CATEGORIES_QUERY_KEY,
        (old = []) => old.filter((cat) => cat.id !== id)
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categories: CategoryConfig[]) => {
      const updates = categories.map((cat, index) => ({
        id: cat.id,
        sortOrder: index,
      }));
      return categoriesApi.reorder(updates);
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });

      const previous = queryClient.getQueryData<CategoryConfig[]>(
        CATEGORIES_QUERY_KEY
      );

      // Update with new order
      const updated = newOrder.map((cat, index) => ({
        ...cat,
        sortOrder: index,
      }));
      queryClient.setQueryData(CATEGORIES_QUERY_KEY, updated);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

// ============================================================================
// Storage Locations Hooks
// ============================================================================

export function useStorageLocations() {
  return useQuery({
    queryKey: STORAGE_LOCATIONS_QUERY_KEY,
    queryFn: () => storageLocationsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAddStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (location: Omit<StorageLocationConfig, 'id' | 'createdAt'>) =>
      storageLocationsApi.create(location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORAGE_LOCATIONS_QUERY_KEY });
    },
  });
}

export function useUpdateStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<StorageLocationConfig, 'id' | 'createdAt'>>;
    }) => storageLocationsApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({
        queryKey: STORAGE_LOCATIONS_QUERY_KEY,
      });

      const previous = queryClient.getQueryData<StorageLocationConfig[]>(
        STORAGE_LOCATIONS_QUERY_KEY
      );

      queryClient.setQueryData<StorageLocationConfig[]>(
        STORAGE_LOCATIONS_QUERY_KEY,
        (old = []) => old.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(STORAGE_LOCATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: STORAGE_LOCATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storageLocationsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: STORAGE_LOCATIONS_QUERY_KEY,
      });

      const previous = queryClient.getQueryData<StorageLocationConfig[]>(
        STORAGE_LOCATIONS_QUERY_KEY
      );

      queryClient.setQueryData<StorageLocationConfig[]>(
        STORAGE_LOCATIONS_QUERY_KEY,
        (old = []) => old.filter((loc) => loc.id !== id)
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(STORAGE_LOCATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: STORAGE_LOCATIONS_QUERY_KEY });
    },
  });
}

export function useReorderStorageLocations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locations: StorageLocationConfig[]) => {
      const updates = locations.map((loc, index) => ({
        id: loc.id,
        sortOrder: index,
      }));
      return storageLocationsApi.reorder(updates);
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({
        queryKey: STORAGE_LOCATIONS_QUERY_KEY,
      });

      const previous = queryClient.getQueryData<StorageLocationConfig[]>(
        STORAGE_LOCATIONS_QUERY_KEY
      );

      const updated = newOrder.map((loc, index) => ({
        ...loc,
        sortOrder: index,
      }));
      queryClient.setQueryData(STORAGE_LOCATIONS_QUERY_KEY, updated);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(STORAGE_LOCATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: STORAGE_LOCATIONS_QUERY_KEY });
    },
  });
}
