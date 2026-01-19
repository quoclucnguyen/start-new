import React from 'react';
import { useNavigate } from 'react-router';
import { SearchInput } from '@/components/shared/search-input';
import { FilterChips, type FilterChip } from '@/components/shared/filter-chips';
import { SectionHeader } from '@/components/shared/section-header';
import { EmptyState } from '@/components/shared/empty-state';
import { FoodItemCard } from '@/components/food/food-item-card';
import { IconButton } from '@/components/ui/icon-button';
import { EditFoodItemSheet } from './EditFoodItemSheet';
import { useFoodItems, useCategories, useStorageLocations, getExpiryStatus, getExpiryText } from '@/api';
import { useUIStore } from '@/store';
import type { FoodItem, FoodCategory, StorageLocation, CategoryConfig } from '@/api/types';
import { SpinLoading } from 'antd-mobile';
import { 
  ArrowUpDown, 
  Package,
} from 'lucide-react';

export const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: items = [], isLoading, error } = useFoodItems();
  const { data: categoriesData = [] } = useCategories();
  const { data: storageLocationsData = [] } = useStorageLocations();
  
  const {
    filters,
    setSearch,
    setCategory,
    setStorage,
    editingItemId,
    setEditingItemId,
  } = useUIStore();

  // Create a lookup map for categories by id
  const categoryMap = React.useMemo(() => {
    return categoriesData.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, CategoryConfig>);
  }, [categoriesData]);

  // Category filters - derived from settings
  const categories: FilterChip[] = React.useMemo(() => {
    const filterableCategories = categoriesData.filter((cat) => cat.showInFilters);
    return [
      { id: 'all', label: 'All' },
      ...filterableCategories.map((cat) => ({
        id: cat.id,
        label: cat.name,
        icon: <span>{cat.icon}</span>,
      })),
    ];
  }, [categoriesData]);

  // Storage location filters - derived from settings
  const storageLocations: FilterChip[] = React.useMemo(() => {
    const filterableLocations = storageLocationsData.filter((loc) => loc.showInFilters);
    return [
      { id: 'all', label: 'All', icon: <Package size={16} /> },
      ...filterableLocations.map((loc) => ({
        id: loc.id,
        label: loc.name,
        icon: <span>{loc.icon}</span>,
      })),
    ];
  }, [storageLocationsData]);

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    let result = [...items];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter((item) => item.category === filters.category);
    }

    // Storage filter
    if (filters.storage !== 'all') {
      result = result.filter((item) => item.storage === filters.storage);
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
  }, [items, filters]);

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
    setEditingItemId(item.id);
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
        className="cursor-pointer"
      />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Sort */}
      <div className="flex gap-3">
        <SearchInput 
          placeholder="Search pantry, fridge..." 
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
          title="Error loading items"
          description="Something went wrong. Please try again."
          icon={<Package size={48} className="text-muted-foreground" />}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Add your first food item to start tracking your inventory."
          icon={<Package size={48} className="text-muted-foreground" />}
          action={
            <button
              onClick={handleAddClick}
              className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
            >
              Add First Item
            </button>
          }
        />
      ) : (
        <>
          {/* Expiring Soon */}
          {expiringSoonItems.length > 0 && (
            <section>
              <SectionHeader 
                title="Expiring Soon" 
                action={
                  <a href="#" className="text-sm font-semibold text-primary hover:text-green-600">
                    View All
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
            <SectionHeader title="Inventory" />
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
                title="No items found"
                description="Try adjusting your filters or search query."
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
    </div>
  );
};
