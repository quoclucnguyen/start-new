import * as React from "react";
import { useNavigate } from "react-router";
import { SpinLoading, Toast } from "antd-mobile";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useAddMissingToShoppingList } from "./api/use-recipe-suggestion-mutations";
import { useRecipeSuggestions } from "./api/use-recipe-suggestions";
import type { RecipeSuggestionItem } from "@/api/types";
import { SearchInput } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRecipeSuggestionsStore } from "./store/recipe-suggestions.store";
import { RecipeDetailSheet } from "./components/recipe-detail-sheet";
import { RecipeEmptyState } from "./components/recipe-empty-state";
import { RecipeFilters } from "./components/recipe-filters";
import { RecipeSuggestionList } from "./components/recipe-suggestion-list";
import { RecipesSectionNav } from "./components/recipes-section-nav";

interface RecipeSuggestionsPageProps {
  className?: string;
}

const RecipeSuggestionsPage: React.FC<RecipeSuggestionsPageProps> = ({
  className,
}) => {
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

  const { data, isLoading, error, refetch, isFetching } =
    useRecipeSuggestions(filters);
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
      ? (suggestions.find((s) => s.recipe.id === selectedRecipeId)
          ?.suggestion ?? null)
      : null;

  React.useEffect(() => {
    const currentSuggestions = data?.suggestions;
    if (
      !selectedRecipeId ||
      !currentSuggestions ||
      currentSuggestions.length === 0
    )
      return;

    const hasSelectedRecipe = currentSuggestions.some(
      (item) => item.recipe.id === selectedRecipeId,
    );
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
            content: `${result.addedCount} nguyên liệu đã được thêm vào Danh sách mua sắm`,
            icon: "success",
          });
          return;
        }

        Toast.show({
          content: "Tất cả nguyên liệu đã có trong Danh sách mua sắm",
          icon: "success",
        });
      },
      onError: () => {
        Toast.show({ content: "Thêm nguyên liệu thất bại", icon: "fail" });
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
    (filters.difficulty && filters.difficulty !== "all")
  );

  const lowCoverage =
    suggestions.length > 0 && suggestions[0].suggestion.matchPercentage < 55;

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md">
        <div className="flex flex-col gap-3 p-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold leading-tight tracking-tight">
                Gợi ý bữa ăn
              </h1>
              <p className="text-sm text-muted-foreground">
                Khớp công thức với những gì đã có trong bếp của bạn.
              </p>
            </div>
            {isFetching && !isLoading ? (
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                <RefreshCw className="size-3.5 animate-spin" />
                Refreshing
              </div>
            ) : null}
          </div>

          <RecipesSectionNav
            actionLabel="Quản lý"
            onAction={() => navigate("/recipes/manage")}
          />
          <div className="flex gap-3">
            <SearchInput
              value={filters.search ?? ""}
              onChange={setSearch}
              placeholder="Tìm công thức, nguyên liệu hoặc thẻ"
              showVoiceButton={false}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <SpinLoading style={{ "--size": "36px" }} />
            <div>
              <p className="text-sm font-semibold">
                Đang tìm bữa ăn phù hợp nhất cho tủ bếp của bạn
              </p>
              <p className="text-sm text-muted-foreground">
                Đang khớp công thức với kho nguyên liệu và công thức đã lưu của
                bạn.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="px-4 py-16">
            <div className="rounded-[28px] border border-destructive/20 bg-destructive/5 p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold">
                Không thể tải gợi ý bữa ăn
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {error.message}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Button variant="secondary" onClick={handleRetry}>
                  Try Again
                </Button>
                <Button onClick={() => navigate("/recipes/manage")}>
                  Review Recipes
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col pb-safe">
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
                <LowIngredientNotice
                  suggestions={suggestions}
                  inventoryCount={data.totalInventoryItems}
                />
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
                        <Button
                          variant="secondary"
                          onClick={() => navigate("/add")}
                        >
                          Thêm nguyên liệu
                        </Button>
                        <Button
                          onClick={() => navigate("/recipes/manage?new=1")}
                        >
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

interface LowIngredientNoticeProps {
  suggestions: RecipeSuggestionItem[];
  inventoryCount: number;
}

function LowIngredientNotice({
  suggestions,
  inventoryCount,
}: LowIngredientNoticeProps) {
  const bestMatch = suggestions[0];
  const nextNeeds =
    bestMatch?.suggestion.missingIngredients
      .slice(0, 3)
      .map((item) => item.name) ?? [];

  return (
    <div className="rounded-[26px] border border-orange-200/60 bg-[linear-gradient(135deg,rgba(249,115,22,0.08),rgba(255,255,255,0.92))] p-4 shadow-sm dark:border-orange-500/20 dark:bg-[linear-gradient(135deg,rgba(249,115,22,0.12),rgba(28,46,36,0.96))]">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/12 text-orange-700 dark:text-orange-300">
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Độ bao phủ nguyên liệu thấp</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Bạn có {inventoryCount} nguyên liệu trong tủ bếp, vì vậy hầu hết các
            bữa ăn vẫn cần thêm vài nguyên liệu cơ bản.
          </p>
          {nextNeeds.length > 0 ? (
            <p className="mt-2 text-sm leading-6 text-foreground">
              Thêm {nextNeeds.join(", ")} để tăng độ khớp cho{" "}
              {bestMatch.recipe.title}.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { RecipeSuggestionsPage };
