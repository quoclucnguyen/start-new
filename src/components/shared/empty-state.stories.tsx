import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './empty-state';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof EmptyState> = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: '📭',
    title: 'No items yet',
    description: 'Start by adding items to your inventory.',
  },
};

export const WithAction: Story = {
  args: {
    icon: '🛒',
    title: 'Your list is empty',
    description: 'Add items to your shopping list to get started.',
    action: <Button>Add Items</Button>,
  },
};

export const NotificationsEmpty: Story = {
  args: {
    icon: '✓',
    title: 'All caught up!',
    description: 'You have no new notifications.',
  },
};

export const SearchNoResults: Story = {
  args: {
    icon: '🔍',
    title: 'No results found',
    description: 'Try searching with different keywords.',
    action: <Button variant="outline">Clear Search</Button>,
  },
};

export const NoRecipes: Story = {
  args: {
    icon: '🍳',
    title: 'No matching recipes',
    description: 'Add more items to your pantry to get recipe suggestions.',
    action: <Button>Add Ingredients</Button>,
  },
};

export const InventoryEmpty: Story = {
  args: {
    icon: '🧊',
    title: 'Your fridge is empty',
    description: 'Scan a receipt or manually add items to track your food.',
    action: (
      <div className="flex gap-2">
        <Button variant="outline">Scan Receipt</Button>
        <Button>Add Item</Button>
      </div>
    ),
  },
};

export const CheckmarkIcon: Story = {
  args: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
    title: 'End of notifications',
    description: 'No more notifications to show.',
  },
};
