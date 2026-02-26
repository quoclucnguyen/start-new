import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FoodCategory } from '@/api/types';

interface ShoppingUIState {
  // Filter states
  selectedCategory: FoodCategory | 'all';
  showCheckedOnly: boolean;

  // Modal states
  isAddModalOpen: boolean;
  editingItemId: string | null;

  // Actions
  setSelectedCategory: (category: FoodCategory | 'all') => void;
  setShowCheckedOnly: (show: boolean) => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (id: string) => void;
  closeEditModal: () => void;
}

export const useShoppingStore = create<ShoppingUIState>()(
  persist(
    (set) => ({
      // Initial state
      selectedCategory: 'all',
      showCheckedOnly: false,
      isAddModalOpen: false,
      editingItemId: null,

      // Actions
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setShowCheckedOnly: (show) => set({ showCheckedOnly: show }),
      openAddModal: () => set({ isAddModalOpen: true, editingItemId: null }),
      closeAddModal: () => set({ isAddModalOpen: false }),
      openEditModal: (id) => set({ isAddModalOpen: true, editingItemId: id }),
      closeEditModal: () => set({ isAddModalOpen: false, editingItemId: null }),
    }),
    {
      name: 'shopping-ui-storage',
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
        showCheckedOnly: state.showCheckedOnly,
      }),
    },
  ),
);
