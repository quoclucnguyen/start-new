import * as React from 'react';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Toast, Dialog, SpinLoading } from 'antd-mobile';
import { useShoppingList } from '../api/use-shopping-list';
import {
  useAddShoppingListItem,
  useToggleShoppingItemChecked,
  useDeleteCheckedItems,
  useMovePurchasedToInventory,
} from '../api/use-shopping-list-mutations';
import { useCategories } from '@/pages/inventory/api/use-settings';
import { useShoppingStore } from '@/pages/shopping/store/shopping.store';
import { ShoppingListItem } from './shopping-list-item';
import { ShoppingEmptyState } from './shopping-empty-state';
import { ShoppingHeader } from './shopping-header';
import { ShoppingForm } from './shopping-form';
import type { ShoppingFormRef } from './shopping-form';
import { BottomSheet } from '@/components/shared';
import { SectionHeader } from '@/components/shared';
import type { ShoppingListItem as ShoppingListItemType, CreateShoppingListItemInput, CategoryConfig } from '@/api/types';

interface ShoppingListPageProps {
  className?: string;
}

/**
 * Sort items: unchecked first, then by category, then by newest first
 */
function sortShoppingList(
  items: ShoppingListItemType[],
  categoryConfigs: CategoryConfig[],
): ShoppingListItemType[] {
  // CategoryPicker stores cat.id (UUID), so key by id
  const categoryOrder = new Map(categoryConfigs.map((c, i) => [c.id, i]));

  return [...items].sort((a, b) => {
    // Unchecked items first
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    // Then by category sort order
    const aOrder = categoryOrder.get(a.category) ?? 999;
    const bOrder = categoryOrder.get(b.category) ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // Then by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Group items by category name
 */
function groupByCategory(items: ShoppingListItemType[]): Map<string, ShoppingListItemType[]> {
  const groups = new Map<string, ShoppingListItemType[]>();
  for (const item of items) {
    const cat = item.category || 'Khác';
    const group = groups.get(cat) || [];
    group.push(item);
    groups.set(cat, group);
  }
  return groups;
}

export const ShoppingListPage: React.FC<ShoppingListPageProps> = ({ className }) => {
  const { data: items = [], isLoading, error } = useShoppingList();
  const { data: categories = [] } = useCategories();
  const addMutation = useAddShoppingListItem();
  const toggleMutation = useToggleShoppingItemChecked();
  const deleteCheckedMutation = useDeleteCheckedItems();
  const moveToInventoryMutation = useMovePurchasedToInventory();

  const { isAddModalOpen, editingItemId, openAddModal, closeAddModal } = useShoppingStore();
  const formRef = React.useRef<ShoppingFormRef>(null);

  // Sort and filter items
  const sortedItems = sortShoppingList(items, categories);
  const checkedCount = items.filter((i) => i.checked).length;

  // Separate unchecked and checked for grouped display
  const uncheckedItems = sortedItems.filter((i) => !i.checked);
  const checkedItems = sortedItems.filter((i) => i.checked);
  const uncheckedGroups = groupByCategory(uncheckedItems);

  // Build category lookup maps (keyed by cat.id since CategoryPicker stores UUID)
  const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));
  const categoryIconMap = new Map(categories.map((c) => [c.id, c.icon]));

  /** Resolve category ID to display name */
  const getCategoryName = (catId: string) => categoryNameMap.get(catId) || catId;

  const handleToggle = (id: string, checked: boolean) => {
    toggleMutation.mutate({ id, checked });
  };

  const handleDeleteChecked = async () => {
    const confirmed = await new Promise<boolean>((resolve) => {
      Dialog.confirm({
        title: 'Xóa món đã chọn',
        content: `Xóa ${checkedCount} món đã chọn khỏi danh sách?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (confirmed) {
      deleteCheckedMutation.mutate(undefined, {
        onSuccess: () => {
          Toast.show({ content: 'Đã xóa món đã chọn', position: 'bottom' });
        },
      });
    }
  };

  const handleMoveToInventory = async () => {
    const confirmed = await new Promise<boolean>((resolve) => {
      Dialog.confirm({
        title: 'Chuyển vào kho',
        content: `Chuyển ${checkedCount} món đã chọn vào kho?`,
        confirmText: 'Chuyển',
        cancelText: 'Hủy',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (confirmed) {
      moveToInventoryMutation.mutate(undefined, {
        onSuccess: (createdItems) => {
          const count = createdItems?.length ?? 0;
          Toast.show({
            content: `Đã thêm ${count} món vào kho`,
            position: 'bottom',
          });
        },
      });
    }
  };

  const handleAddItem = (input: CreateShoppingListItemInput) => {
    addMutation.mutate(input, {
      onSuccess: () => {
        closeAddModal();
        Toast.show({ content: 'Đã thêm món', position: 'bottom' });
      },
    });
  };

  // Get initial values for edit mode
  const editingItem = editingItemId ? items.find((i) => i.id === editingItemId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <SpinLoading color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>Tải danh sách mua thất bại</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col pb-32', className)}>
      {/* Header */}
      <div className="px-4 pt-2 pb-4">
        <ShoppingHeader
          totalCount={items.length}
          checkedCount={checkedCount}
          onDeleteChecked={handleDeleteChecked}
          onMoveToInventory={handleMoveToInventory}
        />
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <ShoppingEmptyState onAddItem={openAddModal} />
      ) : (
        <main className="flex-1 px-4">
          {/* Unchecked items grouped by category */}
          {Array.from(uncheckedGroups.entries()).map(([categoryId, groupItems]) => (
            <div key={categoryId} className="mb-4">
              <SectionHeader title={getCategoryName(categoryId)} />
              <div className="flex flex-col gap-3">
                {groupItems.map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    name={item.name}
                    quantity={`${item.quantity} ${item.unit}`}
                    emoji={categoryIconMap.get(item.category)}
                    checked={item.checked}
                    onCheckedChange={(checked) => handleToggle(item.id, checked)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Checked items section */}
          {checkedItems.length > 0 && (
            <div className="mb-4">
              <SectionHeader
                title={`Đã chọn (${checkedItems.length})`}
                action={
                  <button
                    className="text-xs text-primary font-semibold"
                    onClick={handleDeleteChecked}
                  >
                    Xóa
                  </button>
                }
              />
              <div className="flex flex-col gap-3">
                {checkedItems.map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    name={item.name}
                    quantity={`${item.quantity} ${item.unit}`}
                    emoji={categoryIconMap.get(item.category)}
                    checked={item.checked}
                    onCheckedChange={(checked) => handleToggle(item.id, checked)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* FAB */}
      {items.length > 0 && (
        <button
          className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-transform active:scale-90 hover:scale-105"
          onClick={openAddModal}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* Add/Edit Bottom Sheet */}
      <BottomSheet
        visible={isAddModalOpen}
        onClose={closeAddModal}
        title={editingItemId ? 'Sửa món' : 'Thêm vào danh sách mua'}
        height="70vh"
      >
        <div className="px-4 pb-4">
          <ShoppingForm
            ref={formRef}
            initialValues={
              editingItem
                ? {
                    name: editingItem.name,
                    category: editingItem.category,
                    quantity: editingItem.quantity,
                    unit: editingItem.unit,
                    notes: editingItem.notes || '',
                  }
                : undefined
            }
            onSubmit={handleAddItem}
            isLoading={addMutation.isPending}
          />
          <div className="mt-6">
            <button
              className="w-full flex items-center justify-center rounded-xl h-14 bg-primary text-primary-foreground text-base font-semibold shadow-md shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-50"
              onClick={() => formRef.current?.submit()}
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? 'Đang thêm...' : editingItemId ? 'Lưu thay đổi' : 'Thêm vào danh sách'}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
