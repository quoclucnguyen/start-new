import * as React from 'react';
import { cn } from '@/lib/utils';
import { IngredientTag } from './ingredient-tag';
import type {
  RecipeDetail,
  MatchedIngredient,
  MissingIngredient,
} from '@/api/types';

interface RecipeIngredientsPanelProps {
  recipe: RecipeDetail;
  matchedIngredients: MatchedIngredient[];
  missingIngredients: MissingIngredient[];
  className?: string;
}

const RecipeIngredientsPanel: React.FC<RecipeIngredientsPanelProps> = ({
  recipe,
  matchedIngredients,
  missingIngredients,
  className,
}) => {
  const matchedIds = new Set(matchedIngredients.map((m) => m.recipeIngredientId));

  const sortedIngredients = [...recipe.ingredients].sort((a, b) => {
    // Matched first, then missing, then optional
    const aMatched = matchedIds.has(a.id);
    const bMatched = matchedIds.has(b.id);
    if (aMatched !== bMatched) return aMatched ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Available Ingredients */}
      {matchedIngredients.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-primary mb-2">
            Available ({matchedIngredients.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {sortedIngredients
              .filter((ing) => matchedIds.has(ing.id))
              .map((ing) => (
                <IngredientTag key={ing.id} name={formatIngredientLabel(ing)} available />
              ))}
          </div>
        </div>
      )}

      {/* Missing Ingredients */}
      {missingIngredients.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">
            Missing ({missingIngredients.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingIngredients.map((ing) => (
              <IngredientTag
                key={ing.recipeIngredientId}
                name={formatMissingLabel(ing)}
                available={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional Ingredients */}
      {recipe.ingredients.some((ing) => ing.optional) && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground/70 mb-2">
            Optional
          </h4>
          <div className="flex flex-wrap gap-2">
            {recipe.ingredients
              .filter((ing) => ing.optional)
              .map((ing) => (
                <span
                  key={ing.id}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-muted/50 text-muted-foreground italic"
                >
                  {formatIngredientLabel(ing)}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

function formatIngredientLabel(ing: { name: string; quantity?: number; unit?: string }): string {
  if (ing.quantity && ing.unit) {
    return `${ing.name} (${ing.quantity} ${ing.unit})`;
  }
  if (ing.quantity) {
    return `${ing.name} (${ing.quantity})`;
  }
  return ing.name;
}

function formatMissingLabel(ing: MissingIngredient): string {
  if (ing.quantity && ing.unit) {
    return `${ing.name} (${ing.quantity} ${ing.unit})`;
  }
  if (ing.quantity) {
    return `${ing.name} (${ing.quantity})`;
  }
  return ing.name;
}

export { RecipeIngredientsPanel };
