import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AppShell } from '@/components/layout/app-shell';
import { TopAppBar } from '@/components/layout/top-app-bar';
import { IconButton } from '@/components/ui/icon-button';
import { FoodForm, type FoodFormRef } from '@/components/food/food-form';
import { FixedBottomAction } from '@/components/shared/fixed-bottom-action';
import { useAddFoodItem } from '@/api';
import type { CreateFoodItemInput, FoodItem } from '@/api/types';
import { X, ScanBarcode } from 'lucide-react';
import { Toast } from 'antd-mobile';

interface LocationState {
  prefill?: Partial<FoodItem>;
  scannedBarcode?: string;
}

export const AddFoodItemPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = React.useRef<FoodFormRef>(null);
  const addFoodItem = useAddFoodItem();
  
  // Get prefill data from scanner navigation
  const locationState = location.state as LocationState | undefined;
  const prefillData = locationState?.prefill;
  const scannedBarcode = locationState?.scannedBarcode;

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
  
  const handleScanBarcode = () => {
    navigate('/scan');
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
            onClick={handleScanBarcode}
            title="Scan barcode"
            className="hover:bg-primary/10 active:bg-primary/20"
          >
            <ScanBarcode size={24} />
          </IconButton>
        }
      />

      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-28">
        {scannedBarcode && !prefillData && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-amber-600">
              Product not found for barcode: <code className="font-mono">{scannedBarcode}</code>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please enter the details manually.
            </p>
          </div>
        )}
        
        {prefillData && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-primary">
              ✓ Product found! Details have been prefilled.
            </p>
          </div>
        )}
        
        <FoodForm
          ref={formRef}
          onSubmit={handleSubmit}
          isLoading={addFoodItem.isPending}
          initialValues={prefillData}
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
