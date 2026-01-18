import React from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '@/components/layout/app-shell';
import { TopAppBar } from '@/components/layout/top-app-bar';
import { BottomNavigation, type NavItem } from '@/components/layout/bottom-navigation';
import { UserAvatar } from '@/components/shared/user-avatar';
import { SearchInput } from '@/components/shared/search-input';
import { FilterChips, type FilterChip } from '@/components/shared/filter-chips';
import { SectionHeader } from '@/components/shared/section-header';
import { EmptyState } from '@/components/shared/empty-state';
import { FoodItemCard } from '@/components/food/food-item-card';
import { IconButton } from '@/components/ui/icon-button';
import { EditFoodItemSheet } from './EditFoodItemSheet';
import { useFoodItems, getExpiryStatus, getExpiryText } from '@/api';
import { useUIStore } from '@/store';
import type { FoodItem, FoodCategory, StorageLocation } from '@/api/types';
import { SpinLoading } from 'antd-mobile';
import { 
  Bell, 
  ArrowUpDown, 
  LayoutDashboard, 
  ClipboardList, 
  Plus, 
  Utensils, 
  Settings,
  Apple,
  Carrot,
  Milk,
  Beef,
  CupSoda,
  Package,
  RefrigeratorIcon,
  Warehouse,
  Snowflake,
  Salad,
} from 'lucide-react';

// Category to icon mapping
const categoryIcons: Record<FoodCategory, React.ReactNode> = {
  fruits: <Apple size={24} />,
  vegetables: <Carrot size={24} />,
  dairy: <Milk size={24} />,
  meat: <Beef size={24} />,
  drinks: <CupSoda size={24} />,
  pantry: <Package size={24} />,
  other: <Salad size={24} />,
};

// Storage filter icons
const storageIcons: Record<StorageLocation, React.ReactNode> = {
  fridge: <RefrigeratorIcon size={16} />,
  pantry: <Warehouse size={16} />,
  freezer: <Snowflake size={16} />,
  spices: <Salad size={16} />,
};

export const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: items = [], isLoading, error } = useFoodItems();
  
  const {
    filters,
    setSearch,
    setCategory,
    setStorage,
    editingItemId,
    setEditingItemId,
  } = useUIStore();

  const [activeTab, setActiveTab] = React.useState('home');

  // Navigation Items
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard size={24} /> },
    { id: 'list', label: 'List', icon: <ClipboardList size={24} /> },
    { id: 'recipes', label: 'Recipes', icon: <Utensils size={24} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={24} /> },
  ];

  // Category filters
  const categories: FilterChip[] = [
    { id: 'all', label: 'All' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'meat', label: 'Meat' },
    { id: 'drinks', label: 'Drinks' },
  ];

  // Storage location filters
  const storageLocations: FilterChip[] = [
    { id: 'all', label: 'All', icon: <Package size={16} /> },
    { id: 'fridge', label: 'Fridge', icon: storageIcons.fridge },
    { id: 'pantry', label: 'Pantry', icon: storageIcons.pantry },
    { id: 'freezer', label: 'Freezer', icon: storageIcons.freezer },
    { id: 'spices', label: 'Spices', icon: storageIcons.spices },
  ];

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
    const icon = categoryIcons[item.category];

    return (
      <FoodItemCard
        key={item.id}
        name={item.name}
        expiryText={`${item.quantity} ${item.unit} • ${expiryText}`}
        expiryStatus={status}
        percentLeft={status === 'expiring' ? 10 : status === 'soon' ? 25 : status === 'good' ? 50 : 80}
        showBadge={status === 'expiring' || status === 'fresh'}
        icon={
          <span className={`
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
    <AppShell>
      <TopAppBar
        title="My Kitchen"
        subtitle="Good Morning,"
        leftAction={
          <UserAvatar 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6sye7sJfDtmO79TiyrXf9Knj41P9FSJgq3XVnH_NR1DFBzF3GCbf_sN_-ALJNUsNohWbg3foRnr0h1keTXjpGb_AUIHhFSC8gqX9rrvAmZ0stFIOhQlD6-BnVpTbN9C8l0ulYjGY3vY3Yj73xfrlyVtSinMV4foRBA-e6P6nRcrKg8rj4ZgsAT1mHDgUzoZKtBk8WJO_rvyBdMxXNVhopbO_e2itozSmV8lOmkPCWTc3BNGtLOTeoVBs-nzkytDcuZKwhNyIeQmGU" 
            alt="User Profile" 
            showStatus 
          />
        }
        rightAction={
          <IconButton className="relative">
            <Bell size={24} />
            {expiringSoonItems.length > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </IconButton>
        }
      />

      <main className="flex-1 flex flex-col pb-28 px-4 pt-1 gap-6">
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

        <div className="h-4"></div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <button 
          onClick={handleAddClick}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/40 text-primary-foreground transform active:scale-95 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

      <BottomNavigation 
        items={navItems} 
        activeId={activeTab} 
        onItemClick={setActiveTab} 
      />

      {/* Edit Sheet */}
      <EditFoodItemSheet
        itemId={editingItemId}
        visible={!!editingItemId}
        onClose={() => setEditingItemId(null)}
      />
    </AppShell>
  );
};
