import * as React from 'react';
import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react';
import { SpinLoading, Toast } from 'antd-mobile';
import { useRecipeSuggestions } from '@/api/use-recipe-suggestions';
import { useAddMissingToShoppingList } from '@/api/use-recipe-suggestion-mutations';
import { useRecipeSuggestionsStore } from '@/store/recipe-suggestions.store';
import { RecipeFilters } from './recipe-filters';
import { RecipeSuggestionList } from './recipe-suggestion-list';
import { RecipeEmptyState } from './recipe-empty-state';
import { RecipeDetailSheet } from './recipe-detail-sheet';

interface RecipeSuggestionsPageProps {
  className?: string;
}

const RecipeSuggestionsPage: React.FC<RecipeSuggestionsPageProps> = ({ className }) => {
  const {
    filters,
    selectedRecipeId,
    setSelectedRecipeId,
    toggleSuggestedOnly,
    setMaxCookTime,
    toggleTag,
    resetFilters,
  } = useRecipeSuggestionsStore();

  const { data, isLoading, error } = useRecipeSuggestions(filters);
  const addMissingMutation = useAddMissingToShoppingList();

  // Collect all unique tags for filter chips
  const availableTags = (() => {
    if (!data?.suggestions) return [];
    const tagSet = new Set<string>();
    data.suggestions.forEach((item) => {
      item.recipe.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  })();

  // Find the suggestion for the selected recipe (for detail sheet)
  const selectedSuggestion =
    selectedRecipeId && data?.suggestions
      ? data.suggestions.find((s) => s.recipe.id === selectedRecipeId)?.suggestion ?? null
      : null;

  const handleViewRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
  };

  const handleAddMissing = (recipeId: string) => {
    const suggestion = data?.suggestions.find((s) => s.recipe.id === recipeId);
    if (!suggestion) return;

    addMissingMutation.mutate(suggestion.suggestion.missingIngredients, {
      onSuccess: (result) => {
        if (result.addedCount > 0) {
          Toast.show({
            content: `${result.addedCount} ingredient${result.addedCount > 1 ? 's' : ''} added to Shopping List`,
            icon: 'success',
          });
        } else {
          Toast.show({
            content: 'All ingredients already in your Shopping List',
            icon: 'success',
          });
        }
      },
      onError: () => {
        Toast.show({ content: 'Failed to add ingredients', icon: 'fail' });
      },
    });
  };

  const hasFilters = !!(
    filters.search ||
    filters.maxCookTimeMinutes ||
    filters.tags?.length ||
    (filters.difficulty && filters.difficulty !== 'all')
  );

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-between">
          <h2 className="text-xl font-bold leading-tight tracking-tight flex-1">
            Suggestions
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <SpinLoading style={{ '--size': '36px' }} />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive px-4">
            <p className="text-sm">Failed to load suggestions</p>
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          </div>
        ) : (
          <div className="flex flex-col pb-safe">
            {/* Hero / Expiration Alert */}
            {data?.topExpiring && (
              <div className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
                      Expiration Alert
                    </p>
                    <h1 className="text-[28px] font-bold leading-tight">
                      Don't let your{' '}
                      <span className="text-primary underline decoration-2 underline-offset-2">
                        {data.topExpiring.name}
                      </span>{' '}
                      spoil!
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                      We found {data.topExpiring.recipesCount} recipe
                      {data.topExpiring.recipesCount !== 1 ? 's' : ''} to use it up
                      {data.topExpiring.daysLeft <= 1
                        ? ' before it expires today.'
                        : ` before ${getDayName(data.topExpiring.daysLeft)}.`}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                    <Leaf className="size-8 text-green-600 dark:text-primary" />
                  </div>
                </div>
              </div>
            )}

            {/* Filter Chips */}
            <div className="px-4 pb-4">
              <RecipeFilters
                activeFilters={filters}
                availableTags={availableTags}
                onToggleSuggestedOnly={toggleSuggestedOnly}
                onSetMaxCookTime={setMaxCookTime}
                onToggleTag={toggleTag}
              />
            </div>

            {/* Suggestion Feed */}
            <div className="px-4">
              {data && data.suggestions.length > 0 ? (
                <RecipeSuggestionList
                  suggestions={data.suggestions}
                  onViewRecipe={handleViewRecipe}
                  onAddMissing={handleAddMissing}
                />
              ) : (
                <RecipeEmptyState
                  hasInventory={(data?.totalInventoryItems ?? 0) > 0}
                  hasFilters={hasFilters}
                  onResetFilters={resetFilters}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Detail Sheet */}
      <RecipeDetailSheet
        recipeId={selectedRecipeId}
        suggestion={selectedSuggestion}
        visible={!!selectedRecipeId}
        onClose={() => setSelectedRecipeId(null)}
      />
    </div>
  );
};

/**
 * Convert days remaining to a readable day name.
 */
function getDayName(daysLeft: number): string {
  if (daysLeft <= 0) return 'today';
  if (daysLeft === 1) return 'tomorrow';

  const date = new Date();
  date.setDate(date.getDate() + daysLeft);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export { RecipeSuggestionsPage };
