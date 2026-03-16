import * as React from 'react';
import { EmptyState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { ChefHat, Plus } from 'lucide-react';

interface RecipeManagementEmptyStateProps {
  onCreateRecipe: () => void;
}

const RecipeManagementEmptyState: React.FC<RecipeManagementEmptyStateProps> = ({
  onCreateRecipe,
}) => {
  return (
    <EmptyState
      icon={<ChefHat className="size-12" />}
      title="No recipes yet"
      description="Create your first recipe to get started with meal planning and cooking."
      action={
        <Button onClick={onCreateRecipe} className="gap-1.5">
          <Plus className="size-4" />
          Create Recipe
        </Button>
      }
    />
  );
};

export { RecipeManagementEmptyState };
