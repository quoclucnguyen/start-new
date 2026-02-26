import * as React from 'react';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { FixedBottomAction } from '@/components/shared/fixed-bottom-action';
import { FoodForm, type FoodFormRef } from '@/components/food/food-form';
import { confirmDelete } from '@/components/shared/confirmation-dialog';
import { useFoodItem, useUpdateFoodItem, useDeleteFoodItem, useAddShoppingListItem } from '@/api';
import type { CreateFoodItemInput, UpdateFoodItemInput } from '@/api/types';
import { Toast, SpinLoading } from 'antd-mobile';
import { ShoppingCart } from 'lucide-react';

interface EditFoodItemSheetProps {
  itemId: string | null;
  visible: boolean;
  onClose: () => void;
}

export const EditFoodItemSheet: React.FC<EditFoodItemSheetProps> = ({
  itemId,
  visible,
  onClose,
}) => {
  const formRef = React.useRef<FoodFormRef>(null);
  const { data: item, isLoading: isLoadingItem } = useFoodItem(itemId);
  const updateFoodItem = useUpdateFoodItem();
  const deleteFoodItem = useDeleteFoodItem();
  const addToShoppingList = useAddShoppingListItem();

  const handleSubmit = (values: CreateFoodItemInput) => {
    if (!itemId) return;

    const updateInput: UpdateFoodItemInput = {
      id: itemId,
      ...values,
    };

    updateFoodItem.mutate(updateInput, {
      onSuccess: () => {
        Toast.show({
          content: 'Item updated successfully!',
          position: 'bottom',
        });
        onClose();
      },
      onError: (error) => {
        Toast.show({
          content: error.message || 'Failed to update item',
          position: 'bottom',
        });
      },
    });
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  const handleDelete = async () => {
    if (!itemId || !item) return;

    const confirmed = await confirmDelete(item.name);
    if (!confirmed) return;

    deleteFoodItem.mutate(itemId, {
      onSuccess: () => {
        Toast.show({
          content: 'Item deleted',
          position: 'bottom',
        });
        onClose();
      },
      onError: (error) => {
        Toast.show({
          content: error.message || 'Failed to delete item',
          position: 'bottom',
        });
      },
    });
  };

  const isLoading = updateFoodItem.isPending || deleteFoodItem.isPending;

  const handleAddToShoppingList = () => {
    if (!item) return;

    addToShoppingList.mutate(
      {
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
        linkedFoodItemId: item.id,
      },
      {
        onSuccess: () => {
          Toast.show({
            content: 'Added to shopping list!',
            position: 'bottom',
          });
        },
        onError: (error) => {
          Toast.show({
            content: error.message || 'Failed to add to shopping list',
            position: 'bottom',
          });
        },
      },
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Edit Item"
    >
      {isLoadingItem ? (
        <div className="flex items-center justify-center h-64">
          <SpinLoading color="primary" />
        </div>
      ) : item ? (
        <>
          <div className="px-4 pb-32">
            <FoodForm
              ref={formRef}
              initialValues={item}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            {/* Add to Shopping List */}
            <button
              type="button"
              onClick={handleAddToShoppingList}
              disabled={addToShoppingList.isPending}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {addToShoppingList.isPending ? 'Adding...' : 'Add to Shopping List'}
            </button>
          </div>

          <FixedBottomAction
            primaryLabel="Save Changes"
            primaryOnClick={handleSave}
            primaryLoading={updateFoodItem.isPending}
            secondaryLabel="Delete"
            secondaryOnClick={handleDelete}
            secondaryVariant="destructive"
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Item not found
        </div>
      )}
    </BottomSheet>
  );
};
