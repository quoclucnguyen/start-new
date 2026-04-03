import React from 'react';
import { useNavigate } from 'react-router';
import { SearchInput } from '@/components/shared/search-input';
import { FilterChips, type FilterChip } from '@/components/shared/filter-chips';
import { SectionHeader } from '@/components/shared/section-header';
import { EmptyState } from '@/components/shared/empty-state';
import { confirmDelete } from '@/components/shared/confirmation-dialog';
import { FoodItemCard } from '@/pages/inventory/components/food-item-card';
import { FoodItemDetailSheet } from '@/pages/inventory/components/food-item-detail-sheet';
import { IconButton } from '@/components/ui/icon-button';
import { EditFoodItemSheet } from './EditFoodItemSheet';
import {
  useFoodItems,
  useCategories,
  useStorageLocations,
  useDeleteFoodItem,
  getExpiryStatus,
  getExpiryText,
} from '@/api';
import { useUIStore } from '@/store';
import type {
  FoodItem,
  FoodCategory,
  StorageLocation,
  CategoryConfig,
  StorageLocationConfig,
} from '@/api/types';
import { ActionSheet, SpinLoading, Toast } from 'antd-mobile';
import {
  ArrowUpDown,
  Package,
} from 'lucide-react';

type ActionSheetShowHandler = ReturnType<typeof ActionSheet.show>;

export const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: items = [], isLoading, error } = useFoodItems();
  const { data: categoriesData = [] } = useCategories();
  const { data: storageLocationsData = [] } = useStorageLocations();
  const deleteFoodItem = useDeleteFoodItem();
  const [selectedDetailItemId, setSelectedDetailItemId] = React.useState<string | null>(null);
  const actionSheetHandlerRef = React.useRef<ActionSheetShowHandler | null>(null);
  
  const {
    filters,
    setSearch,
    setCategory,
    setStorage,
    editingItemId,
    setEditingItemId,
  } = useUIStore();

  React.useEffect(() => {
    return () => {
      actionSheetHandlerRef.current?.close();
      actionSheetHandlerRef.current = null;
    };
  }, []);

  // Create a lookup map for categories by id
  const categoryMap = React.useMemo(() => {
    return categoriesData.reduce((acc, cat) => {
      acc[cat.name] = cat;
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, CategoryConfig>);
  }, [categoriesData]);

  // Create a lookup map for storage locations by id
  const storageMap = React.useMemo(() => {
    return storageLocationsData.reduce((acc, loc) => {
      acc[loc.name] = loc;
      acc[loc.id] = loc;
      return acc;
    }, {} as Record<string, StorageLocationConfig>);
  }, [storageLocationsData]);

  // Category filters - derived from settings
  const categories: FilterChip[] = React.useMemo(() => {
    const filterableCategories = categoriesData.filter((cat) => cat.showInFilters);
    return [
      { id: 'all', label: 'Tất cả' },
      ...filterableCategories.map((cat) => ({
        id: cat.name,
        label: cat.name,
        icon: <span>{cat.icon}</span>,
      })),
    ];
  }, [categoriesData]);

  // Storage location filters - derived from settings
  const storageLocations: FilterChip[] = React.useMemo(() => {
    const filterableLocations = storageLocationsData.filter((loc) => loc.showInFilters);
    return [
      { id: 'all', label: 'Tất cả', icon: <Package size={16} /> },
      ...filterableLocations.map((loc) => ({
        id: loc.name,
        label: loc.name,
        icon: <span>{loc.icon}</span>,
      })),
    ];
  }, [storageLocationsData]);

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    let result = [...items];
    const selectedCategory =
      filters.category === 'all'
        ? 'all'
        : (categoryMap[filters.category]?.name ?? filters.category);
    const selectedStorage =
      filters.storage === 'all'
        ? 'all'
        : (storageMap[filters.storage]?.name ?? filters.storage);

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (item) => (categoryMap[item.category]?.name ?? item.category) === selectedCategory
      );
    }

    // Storage filter
    if (selectedStorage !== 'all') {
      result = result.filter(
        (item) => (storageMap[item.storage]?.name ?? item.storage) === selectedStorage
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'expiry':
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case 'added':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [items, filters, categoryMap, storageMap]);

  // Expiring soon items (expiring or soon status)
  const expiringSoonItems = React.useMemo(() => {
    return items
      .filter((item) => {
        const status = getExpiryStatus(item.expiryDate);
        return status === 'expiring' || status === 'soon';
      })
      .sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      })
      .slice(0, 5);
  }, [items]);

  const handleItemClick = (item: FoodItem) => {
    setSelectedDetailItemId(item.id);
  };

  const handleDeleteItem = async (item: FoodItem) => {
    const confirmed = await confirmDelete(item.name);
    if (!confirmed) return;

    deleteFoodItem.mutate(item.id, {
      onSuccess: () => {
        actionSheetHandlerRef.current?.close();
        Toast.show({
          content: 'Đã xóa món',
          position: 'bottom',
        });
        if (selectedDetailItemId === item.id) {
          setSelectedDetailItemId(null);
        }
      },
      onError: (error) => {
        Toast.show({
          content: error.message || 'Xóa món thất bại',
          position: 'bottom',
        });
      },
    });
  };

  const openItemActions = (item: FoodItem, event: React.MouseEvent) => {
    event.stopPropagation();

    actionSheetHandlerRef.current?.close();

    actionSheetHandlerRef.current = ActionSheet.show({
      actions: [
        {
          text: 'Xem chi tiết',
          key: 'view',
          onClick: () => {
            actionSheetHandlerRef.current?.close();
            setSelectedDetailItemId(item.id);
          },
        },
        {
          text: 'Chỉnh sửa',
          key: 'edit',
          onClick: () => {
            actionSheetHandlerRef.current?.close();
            setEditingItemId(item.id);
          },
        },
        {
          text: 'Xóa',
          key: 'delete',
          danger: true,
          onClick: () => {
            void handleDeleteItem(item);
          },
        },
      ],
      onClose: () => {
        actionSheetHandlerRef.current = null;
      },
    });
  };

  const handleAddClick = () => {
    navigate('/add');
  };

  const renderFoodItem = (item: FoodItem) => {
    const status = getExpiryStatus(item.expiryDate);
    const expiryText = getExpiryText(item.expiryDate);
    const category = categoryMap[item.category];
    const icon = category?.icon || '📦';

    return (
      <FoodItemCard
        key={item.id}
        name={item.name}
        imageUrl={item.imageUrl}
        expiryText={`${item.quantity} ${item.unit} • ${expiryText}`}
        expiryStatus={status}
        percentLeft={status === 'expiring' ? 10 : status === 'soon' ? 25 : status === 'good' ? 50 : 80}
        showBadge={status === 'expiring' || status === 'fresh'}
        icon={
          <span className={`text-2xl
            ${status === 'expiring' ? 'text-red-500' : ''}
            ${status === 'soon' ? 'text-orange-500' : ''}
            ${status === 'good' ? 'text-yellow-600' : ''}
            ${status === 'fresh' ? 'text-green-600' : ''}
          `}>
            {icon}
          </span>
        }
        onClick={() => handleItemClick(item)}
        onMoreClick={(event) => openItemActions(item, event)}
        className="cursor-pointer"
      />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Sort */}
      <div className="flex gap-3">
        <SearchInput
          placeholder="Tìm tủ lạnh, tủ đựng thức ăn..."
          value={filters.search}
          onChange={setSearch}
        />
        <IconButton className="h-12 w-12 rounded-xl border border-input bg-card">
          <ArrowUpDown size={20} />
        </IconButton>
      </div>

      {/* Categories */}
      <FilterChips 
        chips={categories} 
        activeId={filters.category} 
        onChipClick={(id) => setCategory(id as FoodCategory | 'all')} 
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <SpinLoading color="primary" />
        </div>
      ) : error ? (
        <EmptyState
          title="Lỗi khi tải món"
          description="Có lỗi xảy ra. Vui lòng thử lại."
          icon={<Package size={48} className="text-muted-foreground" />}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Chưa có món nào"
          description="Thêm món đầu tiên để bắt đầu theo dõi."
          icon={<Package size={48} className="text-muted-foreground" />}
          action={
            <button
              onClick={handleAddClick}
              className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              Thêm món đầu tiên
            </button>
          }
        />
      ) : (
        <>
          {/* Expiring Soon */}
          {expiringSoonItems.length > 0 && (
            <section>
              <SectionHeader
                title="Sắp hết hạn"
                action={
                  <a href="#" className="text-sm font-semibold text-primary hover:text-green-600">
                    Xem tất cả
                  </a>
                }
              />
              <div className="flex flex-col gap-3">
                {expiringSoonItems.map(renderFoodItem)}
              </div>
            </section>
          )}

          {/* All Inventory */}
          <section>
            <SectionHeader title="Kho" />
            <div className="mb-4">
              <FilterChips 
                chips={storageLocations} 
                activeId={filters.storage} 
                onChipClick={(id) => setStorage(id as StorageLocation | 'all')}
                variant="primary" 
              />
            </div>
            
            {filteredItems.length === 0 ? (
              <EmptyState
                title="Không tìm thấy món nào"
                description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
                icon={<Package size={32} className="text-muted-foreground" />}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {filteredItems.map(renderFoodItem)}
              </div>
            )}
          </section>
        </>
      )}

      {/* Edit Sheet */}
      <EditFoodItemSheet
        itemId={editingItemId}
        visible={!!editingItemId}
        onClose={() => setEditingItemId(null)}
      />

      <FoodItemDetailSheet
        itemId={selectedDetailItemId}
        visible={!!selectedDetailItemId}
        onClose={() => setSelectedDetailItemId(null)}
        categoryMap={categoryMap}
        storageMap={storageMap}
      />
    </div>
  );
};
