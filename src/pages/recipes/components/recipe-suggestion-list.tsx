import * as React from 'react';
import { cn } from '@/lib/utils';
import { RecipeCard } from './recipe-card';
import { SectionHeader } from '@/components/shared';
import type { RecipeSuggestionItem } from '@/api/types';

interface RecipeSuggestionListProps {
  suggestions: RecipeSuggestionItem[];
  onViewRecipe: (recipeId: string) => void;
  onAddMissing: (recipeId: string) => void;
  className?: string;
}

const RecipeSuggestionList: React.FC<RecipeSuggestionListProps> = ({
  suggestions,
  onViewRecipe,
  onAddMissing,
  className,
}) => {
  if (suggestions.length === 0) return null;

  // First suggestion with high match (>= 60%) is "featured"
  const [featured, ...rest] = suggestions;
  const isFeatured = featured && featured.suggestion.matchPercentage >= 60;

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {/* Featured / top suggestion */}
      {featured && (
        <RecipeCard
          title={featured.recipe.title}
          imageUrl={featured.recipe.imageUrl ?? ''}
          cookTime={`${featured.recipe.cookTimeMinutes} phút`}
          difficulty={capitalize(featured.recipe.difficulty) as 'Easy' | 'Medium' | 'Hard'}
          matchPercentage={featured.suggestion.matchPercentage}
          matchedIngredients={featured.suggestion.matchedIngredients.length}
          totalIngredients={
            featured.suggestion.matchedIngredients.length +
            featured.suggestion.missingIngredients.length
          }
          useIngredients={featured.suggestion.matchedIngredients.map((m) => m.foodItemName)}
          missingIngredients={featured.suggestion.missingIngredients.map((m) => m.name)}
          expiringIngredients={getExpiringIngredientNames(featured)}
          featured={isFeatured}
          featureLabel={
            featured.suggestion.expiringIngredientsUsed.length > 0
              ? 'Sử dụng ngay'
              : 'Khớp nhất'
          }
          onCook={() => onViewRecipe(featured.recipe.id)}
          onAddMissing={
            featured.suggestion.missingIngredients.length > 0
              ? () => onAddMissing(featured.recipe.id)
              : undefined
          }
          showActions
        />
      )}

      {/* Remaining suggestions */}
      {rest.length > 0 && (
        <>
          <SectionHeader
            title="Gợi ý cho bạn"
            action={
              <span className="text-sm text-muted-foreground">
                Dựa trên nguyên liệu trong tủ bếp của bạn
              </span>
            }
          />
          {rest.map((item) => (
            <RecipeCard
              key={item.recipe.id}
              title={item.recipe.title}
              imageUrl={item.recipe.imageUrl ?? ''}
              cookTime={`${item.recipe.cookTimeMinutes} phút`}
              difficulty={capitalize(item.recipe.difficulty) as 'Easy' | 'Medium' | 'Hard'}
              matchPercentage={item.suggestion.matchPercentage}
              matchedIngredients={item.suggestion.matchedIngredients.length}
              totalIngredients={
                item.suggestion.matchedIngredients.length +
                item.suggestion.missingIngredients.length
              }
              useIngredients={item.suggestion.matchedIngredients.map((m) => m.foodItemName)}
              missingIngredients={item.suggestion.missingIngredients.map((m) => m.name)}
              expiringIngredients={getExpiringIngredientNames(item)}
              onCook={() => onViewRecipe(item.recipe.id)}
              onAddMissing={
                item.suggestion.missingIngredients.length > 0
                  ? () => onAddMissing(item.recipe.id)
                  : undefined
              }
              showActions
            />
          ))}
        </>
      )}
    </div>
  );
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getExpiringIngredientNames(item: RecipeSuggestionItem): string[] {
  const expiringIds = new Set(item.suggestion.expiringIngredientsUsed);

  return item.suggestion.matchedIngredients
    .filter((ingredient) => expiringIds.has(ingredient.foodItemId))
    .map((ingredient) => ingredient.foodItemName);
}

export { RecipeSuggestionList };
