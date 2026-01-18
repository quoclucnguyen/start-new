import * as React from 'react';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { FixedBottomAction } from '@/components/shared/fixed-bottom-action';
import { FoodForm, type FoodFormRef } from '@/components/food/food-form';
import { confirmDelete } from '@/components/shared/confirmation-dialog';
import { useFoodItem, useUpdateFoodItem, useDeleteFoodItem } from '@/api';
import type { CreateFoodItemInput, UpdateFoodItemInput } from '@/api/types';
import { Toast, SpinLoading } from 'antd-mobile';
import { Trash2 } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';

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
          {/* Delete button in header area */}
          <div className="absolute top-4 right-4 z-10">
            <IconButton
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 size={20} />
            </IconButton>
          </div>

          <div className="px-4 pb-32">
            <FoodForm
              ref={formRef}
              initialValues={item}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
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
