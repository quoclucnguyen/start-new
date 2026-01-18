import { create } from 'zustand';
import type { FoodCategory, StorageLocation } from '@/api/types';

export type SortOption = 'expiry' | 'added' | 'alphabetical';

interface Filters {
  search: string;
  category: FoodCategory | 'all';
  storage: StorageLocation | 'all';
  sort: SortOption;
}

interface UIState {
  // Filters
  filters: Filters;
  setSearch: (search: string) => void;
  setCategory: (category: FoodCategory | 'all') => void;
  setStorage: (storage: StorageLocation | 'all') => void;
  setSort: (sort: SortOption) => void;
  resetFilters: () => void;

  // Edit modal state
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;

  // Delete confirmation state
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
}

const defaultFilters: Filters = {
  search: '',
  category: 'all',
  storage: 'all',
  sort: 'expiry',
};

export const useUIStore = create<UIState>((set) => ({
  // Filters
  filters: defaultFilters,
  setSearch: (search) => set((state) => ({ 
    filters: { ...state.filters, search } 
  })),
  setCategory: (category) => set((state) => ({ 
    filters: { ...state.filters, category } 
  })),
  setStorage: (storage) => set((state) => ({ 
    filters: { ...state.filters, storage } 
  })),
  setSort: (sort) => set((state) => ({ 
    filters: { ...state.filters, sort } 
  })),
  resetFilters: () => set({ filters: defaultFilters }),

  // Edit modal
  editingItemId: null,
  setEditingItemId: (id) => set({ editingItemId: id }),

  // Delete confirmation
  deleteConfirmId: null,
  setDeleteConfirmId: (id) => set({ deleteConfirmId: id }),
}));
