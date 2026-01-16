import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { TopAppBar } from '@/components/layout/top-app-bar';
import { BottomNavigation, type NavItem } from '@/components/layout/bottom-navigation';
import { UserAvatar } from '@/components/shared/user-avatar';
import { SearchInput } from '@/components/shared/search-input';
import { FilterChips, type FilterChip } from '@/components/shared/filter-chips';
import { SectionHeader } from '@/components/shared/section-header';
import { FoodItemCard } from '@/components/food/food-item-card';
import { IconButton } from '@/components/ui/icon-button';
import { 
  Bell, 
  Search, 
  Mic, 
  ArrowUpDown, 
  Check, 
  Leaf, 
  Droplet, 
  Pizza, 
  Egg, 
  Sandwich, 
  LayoutDashboard, 
  ClipboardList, 
  Plus, 
  Utensils, 
  Settings,
  Popsicle, // For Ice Cream substitute
  Beef,     // For Meat
  Apple,    // For Fruits
  Carrot,   // For Vegetables
  Milk,     // For Dairy
  CupSoda,  // For Drinks
  ChefHat   // For Recipes/Chef
} from 'lucide-react';

export const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStorage, setActiveStorage] = useState('fridge');

  // Navigation Items
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard size={24} />, activeIcon: <LayoutDashboard size={24} fill="currentColor" /> },
    { id: 'list', label: 'List', icon: <ClipboardList size={24} /> },
    { id: 'add', label: '', icon: <Plus size={32} className="text-white" />, href: '#' }, // Special styling handled in render? No, BottomNavigation handles standard items.
    // The "Add" button in mockup is a floating FAB. The BottomNavigation component might not support it directly as a centered FAB.
    // Looking at BottomNavigation component, it renders items in a flex row.
    // I will try to use it as is, or maybe I need to hack the middle button.
    // For now, let's just use standard items.
    { id: 'recipes', label: 'Recipes', icon: <Utensils size={24} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={24} /> },
  ];

  // Categories
  const categories: FilterChip[] = [
    { id: 'all', label: 'All' },
    { id: 'fruits', label: 'Fruits' }, // Apple icon?
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'meat', label: 'Meat' },
    { id: 'drinks', label: 'Drinks' },
  ];

  // Storage Locations (Inventory Tabs)
  // We can reuse FilterChips for this, or make a custom button group.
  // Mockup uses primary color for active tab here.
  const storageLocations: FilterChip[] = [
    { id: 'fridge', label: 'Fridge' },
    { id: 'pantry', label: 'Pantry' },
    { id: 'freezer', label: 'Freezer' },
    { id: 'spices', label: 'Spices' },
  ];

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
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </IconButton>
        }
      />

      <main className="flex-1 flex flex-col pb-28 px-4 pt-1 gap-6">
        {/* Search and Filter */}
        <div className="flex gap-3">
          <SearchInput placeholder="Search pantry, fridge..." />
          <IconButton className="h-12 w-12 rounded-xl border border-input bg-card">
            <ArrowUpDown size={20} />
          </IconButton>
        </div>

        {/* Categories */}
        <FilterChips 
          chips={categories} 
          activeId={activeCategory} 
          onChipClick={setActiveCategory} 
        />

        {/* Expiring Soon */}
        <section>
          <SectionHeader 
            title="Expiring Soon" 
            action={<a href="#" className="text-sm font-semibold text-primary hover:text-green-600">View All</a>} 
          />
          <div className="flex flex-col gap-3">
            <FoodItemCard
              name="Fresh Milk"
              expiryText="Expires in 1 day"
              expiryStatus="expiring"
              percentLeft={10}
              showBadge
              icon={<Droplet className="text-red-500 dark:text-red-400" size={24} />}
            />
            <FoodItemCard
              name="Spinach"
              expiryText="Expires in 2 days"
              expiryStatus="soon"
              percentLeft={25}
              icon={<Leaf className="text-orange-500 dark:text-orange-400" size={24} />}
            />
          </div>
        </section>

        {/* Inventory */}
        <section>
          <SectionHeader title="Inventory" />
          <div className="mb-4">
            <FilterChips 
              chips={storageLocations} 
              activeId={activeStorage} 
              onChipClick={setActiveStorage}
              variant="primary" 
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <FoodItemCard
              name="Leftover Pizza"
              expiryText="2 slices • 2 days left"
              expiryStatus="soon"
              percentLeft={20}
              icon={<Pizza className="text-orange-500 dark:text-orange-400" size={24} />}
            />
            <FoodItemCard
              name="Greek Yogurt"
              expiryText="500g • 5 days left"
              expiryStatus="good" // Yellow border in mockup, "good" usually yellow/orange? FoodItemCard config says "good" is yellow.
              percentLeft={45}
              icon={<Popsicle className="text-yellow-600 dark:text-yellow-500" size={24} />}
            />
            <FoodItemCard
              name="Organic Eggs"
              expiryText="12 pcs • 8 days left"
              expiryStatus="fresh" // Green
              percentLeft={75}
              showBadge // Shows "Fresh" tag
              icon={<Egg className="text-green-600 dark:text-green-400" size={24} />}
            />
            <FoodItemCard
              name="Sandwich Meat"
              expiryText="200g • 10 days left"
              expiryStatus="fresh"
              percentLeft={85}
              showBadge
              icon={<Sandwich className="text-green-600 dark:text-green-400" size={24} />}
            />
          </div>
        </section>

        <div className="h-4"></div>
      </main>

      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <button className="flex items-center justify-center h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/40 text-primary-foreground border-4 border-background transform active:scale-95 transition-transform pointer-events-auto">
           <Plus size={32} />
        </button>
      </div>

      <BottomNavigation 
        items={navItems} 
        activeId={activeTab} 
        onItemClick={setActiveTab} 
      />
    </AppShell>
  );
};
