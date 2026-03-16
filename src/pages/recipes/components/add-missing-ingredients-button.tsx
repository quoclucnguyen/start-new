import * as React from 'react';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import { Toast } from 'antd-mobile';
import { Button } from '@/components/ui/button';
import { useAddMissingToShoppingList } from '@/api/use-recipe-suggestion-mutations';
import type { MissingIngredient } from '@/api/types';

interface AddMissingIngredientsButtonProps {
  missingIngredients: MissingIngredient[];
  className?: string;
}

const AddMissingIngredientsButton: React.FC<AddMissingIngredientsButtonProps> = ({
  missingIngredients,
  className,
}) => {
  const addMutation = useAddMissingToShoppingList();

  const handleAdd = () => {
    addMutation.mutate(missingIngredients, {
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
        Toast.show({
          content: 'Failed to add ingredients',
          icon: 'fail',
        });
      },
    });
  };

  if (missingIngredients.length === 0) return null;

  return (
    <Button
      variant="secondary"
      className={cn('gap-2', className)}
      onClick={handleAdd}
      disabled={addMutation.isPending}
    >
      <ShoppingCart className="size-4" />
      {addMutation.isPending
        ? 'Adding...'
        : `Add ${missingIngredients.length} Missing`}
    </Button>
  );
};

export { AddMissingIngredientsButton };
