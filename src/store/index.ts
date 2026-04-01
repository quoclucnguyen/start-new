// Shared stores only (route-specific stores are in their respective route folders)
export { useUIStore, type SortOption } from '@/pages/inventory/store/ui.store';

// Re-export route-specific stores for backward compatibility
export { useAuthStore } from '@/pages/login/store/auth.store';
export { useShoppingStore } from '@/pages/shopping/store/shopping.store';
export { useRecipesManagementStore } from '@/pages/recipes/store/recipes-management.store';
export { useRecipeSuggestionsStore } from '@/pages/recipes/store/recipe-suggestions.store';
export { useDiaryStore, type DiarySortOption } from '@/pages/diary/store/diary.store';
