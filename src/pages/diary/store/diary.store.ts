import { create } from 'zustand';
import type { MealType, VenueStatus } from '@/pages/diary/api/types';

export type DiarySortOption = 'recent' | 'cost' | 'rating';

interface DiaryFilters {
  search: string;
  mealType: 'all' | MealType;
  venueStatus: 'all' | VenueStatus;
  sort: DiarySortOption;
}

interface DiaryUIState {
  // Filters
  filters: DiaryFilters;
  setSearch: (search: string) => void;
  setMealType: (type: 'all' | MealType) => void;
  setVenueStatus: (status: 'all' | VenueStatus) => void;
  setSort: (sort: DiarySortOption) => void;
  resetFilters: () => void;

  // Edit states
  editingMealLogId: string | null;
  setEditingMealLogId: (id: string | null) => void;
  editingVenueId: string | null;
  setEditingVenueId: (id: string | null) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;

  // Meal plan states
  editingMealPlanId: string | null;
  setEditingMealPlanId: (id: string | null) => void;
  deletePlanConfirmId: string | null;
  setDeletePlanConfirmId: (id: string | null) => void;
}

const defaultFilters: DiaryFilters = {
  search: '',
  mealType: 'all',
  venueStatus: 'all',
  sort: 'recent',
};

export const useDiaryStore = create<DiaryUIState>((set) => ({
  filters: defaultFilters,
  setSearch: (search) => set((state) => ({
    filters: { ...state.filters, search },
  })),
  setMealType: (mealType) => set((state) => ({
    filters: { ...state.filters, mealType },
  })),
  setVenueStatus: (venueStatus) => set((state) => ({
    filters: { ...state.filters, venueStatus },
  })),
  setSort: (sort) => set((state) => ({
    filters: { ...state.filters, sort },
  })),
  resetFilters: () => set({ filters: defaultFilters }),

  editingMealLogId: null,
  setEditingMealLogId: (id) => set({ editingMealLogId: id }),
  editingVenueId: null,
  setEditingVenueId: (id) => set({ editingVenueId: id }),
  deleteConfirmId: null,
  setDeleteConfirmId: (id) => set({ deleteConfirmId: id }),

  editingMealPlanId: null,
  setEditingMealPlanId: (id) => set({ editingMealPlanId: id }),
  deletePlanConfirmId: null,
  setDeletePlanConfirmId: (id) => set({ deletePlanConfirmId: id }),
}));
