import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BottomNavigation, type NavItem } from './bottom-navigation';

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
  </svg>
);

const RecipeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const defaultItems: NavItem[] = [
  { id: 'inventory', label: 'Inventory', icon: <HomeIcon /> },
  { id: 'list', label: 'List', icon: <ListIcon />, badge: 3 },
  { id: 'recipes', label: 'Recipes', icon: <RecipeIcon /> },
  { id: 'alerts', label: 'Alerts', icon: <BellIcon /> },
];

const meta: Meta<typeof BottomNavigation> = {
  title: 'Layout/BottomNavigation',
  component: BottomNavigation,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto bg-background min-h-[300px] relative">
        <div className="p-4 pb-24">
          <p className="text-muted-foreground">Content area</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: defaultItems,
    activeId: 'inventory',
  },
};

export const WithBadge: Story = {
  args: {
    items: defaultItems,
    activeId: 'list',
  },
};

export const Interactive: Story = {
  render: function InteractiveNav() {
    const [activeId, setActiveId] = useState('inventory');
    return (
      <BottomNavigation
        items={defaultItems}
        activeId={activeId}
        onItemClick={setActiveId}
      />
    );
  },
};

export const FourItems: Story = {
  args: {
    items: [
      { id: 'kitchen', label: 'Kitchen', icon: <HomeIcon /> },
      { id: 'list', label: 'List', icon: <ListIcon /> },
      { id: 'alerts', label: 'Alerts', icon: <BellIcon />, badge: 2 },
      { id: 'recipes', label: 'Recipes', icon: <RecipeIcon /> },
    ],
    activeId: 'kitchen',
  },
};

export const WithNotificationDot: Story = {
  args: {
    items: [
      { id: 'inventory', label: 'Inventory', icon: <HomeIcon /> },
      { id: 'list', label: 'List', icon: <ListIcon />, badge: 3 },
      { id: 'recipes', label: 'Recipes', icon: <RecipeIcon /> },
      { 
        id: 'alerts', 
        label: 'Alerts', 
        icon: (
          <div className="relative">
            <BellIcon />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border border-background" />
          </div>
        ),
      },
    ],
    activeId: 'inventory',
  },
};
