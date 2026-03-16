import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecipesManagementUIState {
  // Filter states
  search: string;
  selectedTags: string[];

  // Editor states
  isEditorOpen: boolean;
  editingRecipeId: string | null;
  draftDirty: boolean;

  // Delete confirmation
  deleteConfirmId: string | null;

  // Actions
  setSearch: (value: string) => void;
  setSelectedTags: (tags: string[]) => void;
  openCreateEditor: () => void;
  openEditEditor: (recipeId: string) => void;
  closeEditor: () => void;
  setDraftDirty: (dirty: boolean) => void;
  setDeleteConfirmId: (id: string | null) => void;
}

export const useRecipesManagementStore = create<RecipesManagementUIState>()(
  persist(
    (set) => ({
      // Initial state
      search: '',
      selectedTags: [],
      isEditorOpen: false,
      editingRecipeId: null,
      draftDirty: false,
      deleteConfirmId: null,

      // Actions
      setSearch: (search) => set({ search }),
      setSelectedTags: (selectedTags) => set({ selectedTags }),
      openCreateEditor: () =>
        set({ isEditorOpen: true, editingRecipeId: null, draftDirty: false }),
      openEditEditor: (recipeId) =>
        set({ isEditorOpen: true, editingRecipeId: recipeId, draftDirty: false }),
      closeEditor: () =>
        set({ isEditorOpen: false, editingRecipeId: null, draftDirty: false }),
      setDraftDirty: (dirty) => set({ draftDirty: dirty }),
      setDeleteConfirmId: (id) => set({ deleteConfirmId: id }),
    }),
    {
      name: 'recipes-management-ui-storage',
      partialize: (state) => ({
        search: state.search,
        selectedTags: state.selectedTags,
      }),
    },
  ),
);
