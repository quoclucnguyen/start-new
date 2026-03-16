import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AppShell } from '@/components/layout/app-shell';
import { TopAppBar } from '@/components/layout/top-app-bar';
import { IconButton } from '@/components/ui/icon-button';
import { FoodForm, type FoodFormRef } from '@/pages/inventory/components/food-form';
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
          content: 'Đã thêm món thành công!',
          position: 'bottom',
        });
        navigate('/');
      },
      onError: (error) => {
        Toast.show({
          content: error.message || 'Thêm món thất bại',
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
        title="Thêm món"
        leftAction={
          <IconButton onClick={handleCancel}>
            <X size={24} />
          </IconButton>
        }
        rightAction={
          <IconButton
            onClick={handleScanBarcode}
            title="Quét mã vạch"
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
              Không tìm thấy sản phẩm cho mã vạch: <code className="font-mono">{scannedBarcode}</code>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vui lòng nhập thông tin thủ công.
            </p>
          </div>
        )}

        {prefillData && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-primary">
              ✓ Đã tìm thấy sản phẩm! Thông tin đã được điền sẵn.
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
        primaryLabel="Lưu món"
        primaryOnClick={handleSave}
        primaryLoading={addFoodItem.isPending}
        secondaryLabel="Hủy"
        secondaryOnClick={handleCancel}
      />
    </AppShell>
  );
};
