import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RecipeDifficulty, RecipeSuggestionFilters } from '@/api/types';

interface RecipeSuggestionsUIState {
  // Filters
  filters: RecipeSuggestionFilters;
  selectedRecipeId: string | null;
  isFilterSheetOpen: boolean;

  // Actions
  setFilters: (filters: Partial<RecipeSuggestionFilters>) => void;
  resetFilters: () => void;
  setSelectedRecipeId: (id: string | null) => void;
  setFilterSheetOpen: (open: boolean) => void;
  setSearch: (search: string) => void;
  setDifficulty: (difficulty: RecipeDifficulty | 'all') => void;
  setMaxCookTime: (minutes: number | undefined) => void;
  toggleTag: (tag: string) => void;
  toggleSuggestedOnly: () => void;
}

const DEFAULT_FILTERS: RecipeSuggestionFilters = {
  search: undefined,
  maxCookTimeMinutes: undefined,
  tags: undefined,
  difficulty: 'all',
  suggestedOnly: true,
};

export const useRecipeSuggestionsStore = create<RecipeSuggestionsUIState>()(
  persist(
    (set) => ({
      filters: DEFAULT_FILTERS,
      selectedRecipeId: null,
      isFilterSheetOpen: false,

      setFilters: (partial) =>
        set((state) => ({
          filters: { ...state.filters, ...partial },
        })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      setSelectedRecipeId: (id) => set({ selectedRecipeId: id }),

      setFilterSheetOpen: (open) => set({ isFilterSheetOpen: open }),

      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search: search || undefined },
        })),

      setDifficulty: (difficulty) =>
        set((state) => ({
          filters: { ...state.filters, difficulty },
        })),

      setMaxCookTime: (minutes) =>
        set((state) => ({
          filters: { ...state.filters, maxCookTimeMinutes: minutes },
        })),

      toggleTag: (tag) =>
        set((state) => {
          const current = state.filters.tags ?? [];
          const next = current.includes(tag)
            ? current.filter((t) => t !== tag)
            : [...current, tag];
          return {
            filters: { ...state.filters, tags: next.length > 0 ? next : undefined },
          };
        }),

      toggleSuggestedOnly: () =>
        set((state) => ({
          filters: { ...state.filters, suggestedOnly: !state.filters.suggestedOnly },
        })),
    }),
    {
      name: 'recipe-suggestions-ui-storage',
      partialize: (state) => ({
        filters: {
          maxCookTimeMinutes: state.filters.maxCookTimeMinutes,
          tags: state.filters.tags,
          difficulty: state.filters.difficulty,
          suggestedOnly: state.filters.suggestedOnly,
        },
      }),
    },
  ),
);
