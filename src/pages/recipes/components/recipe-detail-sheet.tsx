import * as React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Users } from 'lucide-react';
import { BottomSheet } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { RecipeIngredientsPanel } from './recipe-ingredients-panel';
import { AddMissingIngredientsButton } from './add-missing-ingredients-button';
import { useRecipeSuggestionDetail } from '../api/use-recipe-suggestions';
import { SpinLoading } from 'antd-mobile';
import type { RecipeSuggestion } from '@/api/types';

interface RecipeDetailSheetProps {
  recipeId: string | null;
  suggestion?: RecipeSuggestion | null;
  visible: boolean;
  onClose: () => void;
}

const DifficultyBadge: React.FC<{ difficulty: string }> = ({ difficulty }) => {
  const colors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold capitalize', colors[difficulty as keyof typeof colors] ?? colors.easy)}>
      {difficulty}
    </span>
  );
};

const RecipeDetailSheet: React.FC<RecipeDetailSheetProps> = ({
  recipeId,
  suggestion,
  visible,
  onClose,
}) => {
  const {
    data: recipe,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useRecipeSuggestionDetail(visible ? recipeId : null);

  return (
    <BottomSheet visible={visible} onClose={onClose} height="92vh">
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <SpinLoading style={{ '--size': '36px' }} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <p className="text-sm font-semibold">Không thể tải chi tiết công thức</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button
            variant="secondary"
            onClick={() => {
              void refetch();
            }}
            disabled={isFetching}
          >
            Try Again
          </Button>
        </div>
      ) : !recipe ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Recipe not found
        </div>
      ) : (
        <div className="flex flex-col pb-safe">
          {/* Hero Image */}
          {recipe.imageUrl && (
            <div className="relative h-52 w-full shrink-0">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${recipe.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col gap-5 px-4 py-4">
            {/* Title + Meta */}
            <div>
              <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
              {recipe.description && (
                <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  {recipe.cookTimeMinutes} phút
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  {recipe.servings} phần
                </span>
                <DifficultyBadge difficulty={recipe.difficulty} />
              </div>

              {/* Tags */}
              {recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Match Progress */}
            {suggestion && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Khớp nguyên liệu</span>
                  <span className="text-sm font-bold text-primary">
                    {suggestion.matchPercentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      suggestion.matchPercentage >= 70 ? 'bg-green-500' :
                      suggestion.matchPercentage >= 40 ? 'bg-orange-400' : 'bg-red-500',
                    )}
                    style={{ width: `${suggestion.matchPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Ingredients Panel */}
            {suggestion ? (
              <div>
                <h3 className="text-lg font-bold mb-3">Nguyên liệu</h3>
                <RecipeIngredientsPanel
                  recipe={recipe}
                  matchedIngredients={suggestion.matchedIngredients}
                  missingIngredients={suggestion.missingIngredients}
                />
                {suggestion.missingIngredients.length > 0 && (
                  <div className="mt-3">
                    <AddMissingIngredientsButton
                      missingIngredients={suggestion.missingIngredients}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-3">Nguyên liệu</h3>
                <div className="flex flex-col gap-2">
                  {recipe.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>
                        {ing.name}
                        {ing.quantity && ing.unit && (
                          <span className="text-muted-foreground ml-1">
                            — {ing.quantity} {ing.unit}
                          </span>
                        )}
                        {ing.optional && (
                          <span className="text-muted-foreground/60 italic ml-1">(tùy chọn)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Steps */}
            {recipe.steps.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3">Hướng dẫn</h3>
                <div className="flex flex-col gap-4">
                  {recipe.steps
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((step) => (
                      <div key={step.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {step.stepNumber}
                          </div>
                          {step.stepNumber < recipe.steps.length && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm leading-relaxed">{step.instruction}</p>
                          {step.estimatedMinutes && (
                            <span className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                              <Clock className="size-3" />
                              ~{step.estimatedMinutes} phút
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
};

export { RecipeDetailSheet };
