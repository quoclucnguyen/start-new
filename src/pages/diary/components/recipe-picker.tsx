import * as React from 'react';
import { Input } from 'antd-mobile';
import { Search, X, Clock, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecipesList } from '@/pages/recipes/api/use-recipes-management';
import type { Recipe } from '@/api/types';

interface RecipePickerProps {
  value?: string; // recipe ID
  onChange: (recipeId: string | undefined, recipe: Recipe | undefined) => void;
  className?: string;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Vừa',
  hard: 'Khó',
};

export const RecipePicker: React.FC<RecipePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const [search, setSearch] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: recipes } = useRecipesList({ search: search.trim() || undefined });

  const selectedRecipe = React.useMemo(
    () => (value ? recipes?.find((r) => r.id === value) : undefined),
    [value, recipes],
  );

  const filteredRecipes = recipes ?? [];

  const handleSelect = (recipe: Recipe) => {
    onChange(recipe.id, recipe);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(undefined, undefined);
    setSearch('');
  };

  if (value && selectedRecipe) {
    return (
      <div className={cn('flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 p-3', className)}>
        <ChefHat size={16} className="text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground truncate flex-1">
          {selectedRecipe.title}
        </span>
        {selectedRecipe.cookTimeMinutes > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
            <Clock size={12} />
            {selectedRecipe.cookTimeMinutes}p
          </span>
        )}
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-muted-foreground rounded-full active:bg-muted shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3">
        <Search size={16} className="text-muted-foreground shrink-0" />
        <Input
          placeholder="Tìm công thức..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="!bg-transparent !border-none !shadow-none"
        />
      </div>

      {isOpen && filteredRecipes.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-background shadow-lg">
          {filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => handleSelect(recipe)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors active:bg-muted"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {recipe.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
                  </span>
                  {recipe.cookTimeMinutes > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {recipe.cookTimeMinutes}p
                    </span>
                  )}
                  {recipe.servings > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {recipe.servings} phần
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
