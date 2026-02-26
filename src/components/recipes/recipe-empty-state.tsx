import * as React from 'react';
import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react';

interface RecipeEmptyStateProps {
  hasInventory: boolean;
  hasFilters: boolean;
  onResetFilters?: () => void;
  className?: string;
}

const RecipeEmptyState: React.FC<RecipeEmptyStateProps> = ({
  hasInventory,
  hasFilters,
  onResetFilters,
  className,
}) => {
  if (!hasInventory) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <Leaf className="size-8 text-green-600 dark:text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">No inventory items yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Add food items to your pantry to get personalized recipe suggestions based on what you already have.
        </p>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
        <h3 className="text-lg font-bold mb-2">No matching recipes</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-4">
          Try adjusting your filters or search to find more recipes.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="text-primary font-semibold text-sm hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <h3 className="text-lg font-bold mb-2">No suggestions available</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        We couldn't find any recipe suggestions right now. Try adding more items to your inventory.
      </p>
    </div>
  );
};

export { RecipeEmptyState };
