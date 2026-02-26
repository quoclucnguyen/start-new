import type { Meta, StoryObj } from '@storybook/react';
import { RecipeEmptyState } from './recipe-empty-state';

const meta: Meta<typeof RecipeEmptyState> = {
  title: 'Recipes/RecipeEmptyState',
  component: RecipeEmptyState,
  parameters: {
    layout: 'centered',
  },
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

export const NoInventory: Story = {
  args: {
    hasInventory: false,
    hasFilters: false,
  },
};

export const NoMatchesWithFilters: Story = {
  args: {
    hasInventory: true,
    hasFilters: true,
    onResetFilters: () => console.log('Reset filters'),
  },
};

export const NoSuggestions: Story = {
  args: {
    hasInventory: true,
    hasFilters: false,
  },
};
