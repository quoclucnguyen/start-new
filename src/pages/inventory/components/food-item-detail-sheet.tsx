import * as React from 'react';
import { BottomSheet } from '@/components/shared/bottom-sheet';
import { SpinLoading } from 'antd-mobile';
import { getExpiryStatus, getExpiryText, useFoodItem } from '@/api';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryConfig, StorageLocationConfig } from '@/api/types';

interface FoodItemDetailSheetProps {
  itemId: string | null;
  visible: boolean;
  onClose: () => void;
  categoryMap: Record<string, CategoryConfig>;
  storageMap: Record<string, StorageLocationConfig>;
}

export const FoodItemDetailSheet: React.FC<FoodItemDetailSheetProps> = ({
  itemId,
  visible,
  onClose,
  categoryMap,
  storageMap,
}) => {
  const { data: item, isLoading, error } = useFoodItem(visible ? itemId : null);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Chi tiết món">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <SpinLoading color="primary" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-destructive px-4 text-center">
          Không thể tải chi tiết món
        </div>
      ) : !item ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Không tìm thấy món
        </div>
      ) : (
        <div className="px-4 pb-8 flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-16 rounded-xl object-cover"
                />
              ) : (
                <div className="size-16 rounded-xl bg-muted flex items-center justify-center text-3xl">
                  {categoryMap[item.category]?.icon ?? '📦'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-lg font-bold line-clamp-2">{item.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {item.quantity} {item.unit}
                </p>
              </div>
            </div>
          </div>

          <InfoRow
            label="Hạn sử dụng"
            value={getExpiryText(item.expiryDate)}
            valueClassName={cn(
              getExpiryStatus(item.expiryDate) === 'expiring' && 'text-red-500',
              getExpiryStatus(item.expiryDate) === 'soon' && 'text-orange-500',
              getExpiryStatus(item.expiryDate) === 'good' && 'text-yellow-600',
              getExpiryStatus(item.expiryDate) === 'fresh' && 'text-green-600',
            )}
          />

          <InfoRow
            label="Danh mục"
            value={`${categoryMap[item.category]?.icon ?? '📦'} ${categoryMap[item.category]?.name ?? item.category}`}
          />

          <InfoRow
            label="Vị trí lưu trữ"
            value={`${storageMap[item.storage]?.icon ?? '📦'} ${storageMap[item.storage]?.name ?? item.storage}`}
          />

          <InfoRow
            label="Ngày mua"
            value={item.purchaseDate || 'Chưa có'}
          />

          <InfoRow
            label="Ghi chú"
            value={item.notes || 'Không có ghi chú'}
            valueClassName={!item.notes ? 'text-muted-foreground' : ''}
          />

          <div className="text-xs text-muted-foreground pt-2 flex items-center gap-2">
            <Package size={14} />
            Cập nhật: {new Date(item.updatedAt).toLocaleString('vi-VN')}
          </div>
        </div>
      )}
    </BottomSheet>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueClassName }) => {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className={cn('text-sm font-medium', valueClassName)}>{value}</p>
    </div>
  );
};
