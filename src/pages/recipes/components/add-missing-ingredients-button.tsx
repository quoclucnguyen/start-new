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
            content: `${result.addedCount} nguyên liệu đã được thêm vào Danh sách mua sắm`,
            icon: 'success',
          });
        } else {
          Toast.show({
            content: 'Tất cả nguyên liệu đã có trong Danh sách mua sắm',
            icon: 'success',
          });
        }
      },
      onError: () => {
        Toast.show({
          content: 'Thêm nguyên liệu thất bại',
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
        ? 'Đang thêm...'
        : `Thêm ${missingIngredients.length} nguyên liệu thiếu`}
    </Button>
  );
};

export { AddMissingIngredientsButton };
