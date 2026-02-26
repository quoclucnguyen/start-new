import type { Meta, StoryObj } from '@storybook/react';
import { RecipeFilters } from './recipe-filters';

const meta: Meta<typeof RecipeFilters> = {
  title: 'Recipes/RecipeFilters',
  component: RecipeFilters,
  parameters: {
    layout: 'padded',
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

export const Default: Story = {
  args: {
    activeFilters: {
      suggestedOnly: true,
    },
    availableTags: ['vegetarian', 'quick', 'dinner', 'asian', 'spicy', 'soup'],
    onToggleSuggestedOnly: () => console.log('Toggle suggested'),
    onSetMaxCookTime: (m) => console.log('Set max cook time:', m),
    onToggleTag: (t) => console.log('Toggle tag:', t),
  },
};

export const WithActiveFilters: Story = {
  args: {
    activeFilters: {
      suggestedOnly: true,
      maxCookTimeMinutes: 30,
      tags: ['vegetarian', 'quick'],
    },
    availableTags: ['vegetarian', 'quick', 'dinner', 'asian', 'spicy'],
    onToggleSuggestedOnly: () => console.log('Toggle suggested'),
    onSetMaxCookTime: (m) => console.log('Set max cook time:', m),
    onToggleTag: (t) => console.log('Toggle tag:', t),
  },
};

export const NoFiltersActive: Story = {
  args: {
    activeFilters: {},
    availableTags: ['breakfast', 'lunch', 'dinner'],
    onToggleSuggestedOnly: () => console.log('Toggle suggested'),
    onSetMaxCookTime: (m) => console.log('Set max cook time:', m),
    onToggleTag: (t) => console.log('Toggle tag:', t),
  },
};
