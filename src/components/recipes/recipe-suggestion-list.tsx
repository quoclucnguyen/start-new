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
          cookTime={`${featured.recipe.cookTimeMinutes} min`}
          difficulty={capitalize(featured.recipe.difficulty) as 'Easy' | 'Medium' | 'Hard'}
          matchPercentage={featured.suggestion.matchPercentage}
          matchedIngredients={featured.suggestion.matchedIngredients.length}
          totalIngredients={
            featured.suggestion.matchedIngredients.length +
            featured.suggestion.missingIngredients.length
          }
          useIngredients={featured.suggestion.matchedIngredients.map((m) => m.recipeIngredientName)}
          missingIngredients={featured.suggestion.missingIngredients.map((m) => m.name)}
          featured={isFeatured}
          featureLabel={
            featured.suggestion.expiringIngredientsUsed.length > 0
              ? 'Use It Up'
              : 'Top Match'
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
            title="Suggested for You"
            action={
              <span className="text-sm text-muted-foreground">
                Based on your pantry items
              </span>
            }
          />
          {rest.map((item) => (
            <RecipeCard
              key={item.recipe.id}
              title={item.recipe.title}
              imageUrl={item.recipe.imageUrl ?? ''}
              cookTime={`${item.recipe.cookTimeMinutes} min`}
              difficulty={capitalize(item.recipe.difficulty) as 'Easy' | 'Medium' | 'Hard'}
              matchPercentage={item.suggestion.matchPercentage}
              useIngredients={item.suggestion.matchedIngredients.map((m) => m.foodItemName)}
              missingIngredients={item.suggestion.missingIngredients.map((m) => m.name)}
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

export { RecipeSuggestionList };
