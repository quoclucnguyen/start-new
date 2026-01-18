import * as React from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '@/components/layout/app-shell';
import { TopAppBar } from '@/components/layout/top-app-bar';
import { IconButton } from '@/components/ui/icon-button';
import { FoodForm, type FoodFormRef } from '@/components/food/food-form';
import { FixedBottomAction } from '@/components/shared/fixed-bottom-action';
import { useAddFoodItem } from '@/api';
import type { CreateFoodItemInput } from '@/api/types';
import { X, ScanBarcode } from 'lucide-react';
import { Toast } from 'antd-mobile';

export const AddFoodItemPage: React.FC = () => {
  const navigate = useNavigate();
  const formRef = React.useRef<FoodFormRef>(null);
  const addFoodItem = useAddFoodItem();

  const handleSubmit = (values: CreateFoodItemInput) => {
    addFoodItem.mutate(values, {
      onSuccess: () => {
        Toast.show({
          content: 'Item added successfully!',
          position: 'bottom',
        });
        navigate('/');
      },
      onError: (error) => {
        Toast.show({
          content: error.message || 'Failed to add item',
          position: 'bottom',
        });
      },
    });
  };

  const handleSave = () => {
    // Trigger form submission
    formRef.current?.submit();
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <AppShell>
      <TopAppBar
        title="Add Food Item"
        leftAction={
          <IconButton onClick={handleCancel}>
            <X size={24} />
          </IconButton>
        }
        rightAction={
          <IconButton 
            className="opacity-50 cursor-not-allowed" 
            title="Barcode scanner coming soon"
          >
            <ScanBarcode size={24} />
          </IconButton>
        }
      />

      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-28">
        <FoodForm
          ref={formRef}
          onSubmit={handleSubmit}
          isLoading={addFoodItem.isPending}
        />
      </main>

      <FixedBottomAction
        primaryLabel="Save Item"
        primaryOnClick={handleSave}
        primaryLoading={addFoodItem.isPending}
        secondaryLabel="Cancel"
        secondaryOnClick={handleCancel}
      />
    </AppShell>
  );
};
