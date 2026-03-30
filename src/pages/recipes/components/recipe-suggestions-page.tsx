import * as React from 'react';
import { useNavigate } from 'react-router';
import { SpinLoading, Toast } from 'antd-mobile';
import { AlertTriangle, Leaf, RefreshCw, Sparkles } from 'lucide-react';
import { useAddMissingToShoppingList } from '@/api/use-recipe-suggestion-mutations';
import { useRecipeSuggestions } from '@/api/use-recipe-suggestions';
import type { RecipeSuggestionItem } from '@/api/types';
import { SearchInput } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRecipeSuggestionsStore } from '@/pages/recipes/store/recipe-suggestions.store';
import { RecipeDetailSheet } from './recipe-detail-sheet';
import { RecipeEmptyState } from './recipe-empty-state';
import { RecipeFilters } from './recipe-filters';
import { RecipeSuggestionList } from './recipe-suggestion-list';
import { RecipesSectionNav } from './recipes-section-nav';

interface RecipeSuggestionsPageProps {
  className?: string;
}

const RecipeSuggestionsPage: React.FC<RecipeSuggestionsPageProps> = ({ className }) => {
  const navigate = useNavigate();
  const {
    filters,
    selectedRecipeId,
    setSelectedRecipeId,
    toggleSuggestedOnly,
    setSearch,
    setDifficulty,
    setMaxCookTime,
    toggleTag,
    resetFilters,
  } = useRecipeSuggestionsStore();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useRecipeSuggestions(filters);
  const addMissingMutation = useAddMissingToShoppingList();

  const suggestions = data?.suggestions ?? [];

  const availableTags = (() => {
    if (suggestions.length === 0) return [];

    const tagSet = new Set<string>();
    suggestions.forEach((item) => {
      item.recipe.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  })();

  const selectedSuggestion =
    selectedRecipeId && suggestions.length > 0
      ? suggestions.find((s) => s.recipe.id === selectedRecipeId)?.suggestion ?? null
      : null;

  React.useEffect(() => {
    const currentSuggestions = data?.suggestions;
    if (!selectedRecipeId || !currentSuggestions || currentSuggestions.length === 0) return;

    const hasSelectedRecipe = currentSuggestions.some((item) => item.recipe.id === selectedRecipeId);
    if (!hasSelectedRecipe) {
      setSelectedRecipeId(null);
    }
  }, [data?.suggestions, selectedRecipeId, setSelectedRecipeId]);

  const handleViewRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
  };

  const handleAddMissing = (recipeId: string) => {
    const suggestion = suggestions.find((s) => s.recipe.id === recipeId);
    if (!suggestion) return;

    addMissingMutation.mutate(suggestion.suggestion.missingIngredients, {
      onSuccess: (result) => {
        if (result.addedCount > 0) {
          Toast.show({
            content: `${result.addedCount} ingredient${result.addedCount > 1 ? 's' : ''} added to Shopping List`,
            icon: 'success',
          });
          return;
        }

        Toast.show({
          content: 'All ingredients already in your Shopping List',
          icon: 'success',
        });
      },
      onError: () => {
        Toast.show({ content: 'Failed to add ingredients', icon: 'fail' });
      },
    });
  };

  const handleRetry = () => {
    void refetch();
  };

  const hasFilters = !!(
    filters.search ||
    filters.maxCookTimeMinutes ||
    filters.tags?.length ||
    (filters.difficulty && filters.difficulty !== 'all')
  );

  const readyNowCount = suggestions.filter(
    (item) => item.suggestion.missingIngredients.length === 0 && item.suggestion.matchedIngredients.length > 0,
  ).length;
  const expiringMealCount = suggestions.filter(
    (item) => item.suggestion.expiringIngredientsUsed.length > 0,
  ).length;
  const lowCoverage = suggestions.length > 0 && suggestions[0].suggestion.matchPercentage < 55;

  return (
    <div className={cn('flex h-full flex-col bg-background', className)}>
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md">
        <div className="flex flex-col gap-3 p-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold leading-tight tracking-tight">Meal Suggestions</h1>
              <p className="text-sm text-muted-foreground">Match recipes against what is already in your kitchen.</p>
            </div>
            {isFetching && !isLoading ? (
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                <RefreshCw className="size-3.5 animate-spin" />
                Refreshing
              </div>
            ) : null}
          </div>

          <RecipesSectionNav
            actionLabel="Manage"
            onAction={() => navigate('/recipes/manage')}
          />

          <SearchInput
            value={filters.search ?? ''}
            onChange={setSearch}
            placeholder="Search recipes, ingredients, or tags"
            showVoiceButton={false}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <SpinLoading style={{ '--size': '36px' }} />
            <div>
              <p className="text-sm font-semibold">Finding the best meals for your pantry</p>
              <p className="text-sm text-muted-foreground">Matching recipes against your current inventory and saved recipes.</p>
            </div>
          </div>
        ) : error ? (
          <div className="px-4 py-16">
            <div className="rounded-[28px] border border-destructive/20 bg-destructive/5 p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold">Couldn&apos;t load meal suggestions</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{error.message}</p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Button variant="secondary" onClick={handleRetry}>
                  Try Again
                </Button>
                <Button onClick={() => navigate('/recipes/manage')}>
                  Review Recipes
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col pb-safe">
            <div className="px-4 py-4">
              <div className="overflow-hidden rounded-[30px] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(19,236,91,0.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(231,243,235,0.92)_50%,rgba(255,239,213,0.92))] p-5 shadow-[0_24px_60px_-32px_rgba(13,27,18,0.45)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(19,236,91,0.18),transparent_30%),linear-gradient(135deg,rgba(28,46,36,0.98),rgba(20,34,25,0.96)_55%,rgba(58,43,24,0.92))]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground dark:bg-white/8">
                      <Sparkles className="size-3.5 text-primary" />
                      Meal suggestions
                    </div>
                    <h2 className="max-w-[14ch] text-[30px] font-bold leading-[1.05] tracking-tight">
                      Cook what you already have.
                    </h2>
                    <p className="mt-3 max-w-[34ch] text-sm leading-6 text-muted-foreground">
                      Suggestions are ranked by pantry match, expiring ingredients, and quick prep so tonight&apos;s choice is easier.
                    </p>
                  </div>
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-[22px] bg-emerald-500/12 text-emerald-700 dark:text-primary">
                    <Leaf className="size-8" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <SummaryStat label="Ready now" value={readyNowCount} accent="success" />
                  <SummaryStat label="Use soon" value={expiringMealCount} accent="warning" />
                  <SummaryStat label="Matched" value={suggestions.length} accent="neutral" />
                </div>

                {data?.topExpiring ? (
                  <div className="mt-4 rounded-[24px] border border-orange-200/60 bg-white/65 p-4 dark:border-orange-500/20 dark:bg-black/10">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500/12 text-orange-700 dark:text-orange-300">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
                          Expiring soon
                        </p>
                        <p className="mt-1 text-base font-semibold leading-6">
                          Build a meal around {data.topExpiring.name}.
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {data.topExpiring.recipesCount} suggestion
                          {data.topExpiring.recipesCount === 1 ? '' : 's'} can use it
                          {data.topExpiring.daysLeft <= 1
                            ? ' today.'
                            : ` before ${getDayName(data.topExpiring.daysLeft)}.`}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="px-4 pb-4">
              <RecipeFilters
                activeFilters={filters}
                availableTags={availableTags}
                onToggleSuggestedOnly={toggleSuggestedOnly}
                onSetMaxCookTime={setMaxCookTime}
                onSetDifficulty={setDifficulty}
                onToggleTag={toggleTag}
              />
            </div>

            {data && suggestions.length > 0 && lowCoverage ? (
              <div className="px-4 pb-4">
                <LowIngredientNotice suggestions={suggestions} inventoryCount={data.totalInventoryItems} />
              </div>
            ) : null}

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
                  inventoryCount={data?.totalInventoryItems ?? 0}
                  onResetFilters={resetFilters}
                  action={
                    hasFilters ? undefined : (
                      <div className="flex items-center gap-3">
                        <Button variant="secondary" onClick={() => navigate('/add')}>
                          Add Pantry Item
                        </Button>
                        <Button onClick={() => navigate('/recipes/manage?new=1')}>
                          New Recipe
                        </Button>
                      </div>
                    )
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>

      <RecipeDetailSheet
        recipeId={selectedRecipeId}
        suggestion={selectedSuggestion}
        visible={!!selectedRecipeId}
        onClose={() => setSelectedRecipeId(null)}
      />
    </div>
  );
};

function getDayName(daysLeft: number): string {
  if (daysLeft <= 0) return 'today';
  if (daysLeft === 1) return 'tomorrow';

  const date = new Date();
  date.setDate(date.getDate() + daysLeft);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

interface SummaryStatProps {
  label: string;
  value: number;
  accent: 'success' | 'warning' | 'neutral';
}

function SummaryStat({ label, value, accent }: SummaryStatProps) {
  const accentClass = {
    success: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-orange-500/12 text-orange-700 dark:text-orange-300',
    neutral: 'bg-background/70 text-foreground dark:bg-white/8',
  };

  return (
    <div className={cn('rounded-[22px] px-3 py-3', accentClass[accent])}>
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em]">{label}</div>
    </div>
  );
}

interface LowIngredientNoticeProps {
  suggestions: RecipeSuggestionItem[];
  inventoryCount: number;
}

function LowIngredientNotice({ suggestions, inventoryCount }: LowIngredientNoticeProps) {
  const bestMatch = suggestions[0];
  const nextNeeds = bestMatch?.suggestion.missingIngredients.slice(0, 3).map((item) => item.name) ?? [];

  return (
    <div className="rounded-[26px] border border-orange-200/60 bg-[linear-gradient(135deg,rgba(249,115,22,0.08),rgba(255,255,255,0.92))] p-4 shadow-sm dark:border-orange-500/20 dark:bg-[linear-gradient(135deg,rgba(249,115,22,0.12),rgba(28,46,36,0.96))]">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/12 text-orange-700 dark:text-orange-300">
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Low ingredient coverage</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            You have {inventoryCount} pantry item{inventoryCount === 1 ? '' : 's'}, so most meals still need a few basics.
          </p>
          {nextNeeds.length > 0 ? (
            <p className="mt-2 text-sm leading-6 text-foreground">
              Add {nextNeeds.join(', ')} to unlock stronger matches for {bestMatch.recipe.title}.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { RecipeSuggestionsPage };
