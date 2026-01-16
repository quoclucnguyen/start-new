import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterChips, type FilterChip } from './filter-chips';

const categoryChips: FilterChip[] = [
  { id: 'all', label: 'All' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'meat', label: 'Meat' },
  { id: 'drinks', label: 'Drinks' },
];

const storageChips: FilterChip[] = [
  { id: 'fridge', label: 'Fridge' },
  { id: 'pantry', label: 'Pantry' },
  { id: 'freezer', label: 'Freezer' },
];

const recipeChips: FilterChip[] = [
  { id: 'suggested', label: 'Suggested' },
  { id: 'quick', label: 'Under 30m' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'onepot', label: 'One Pot' },
  { id: 'dinner', label: 'Dinner' },
];

const meta: Meta<typeof FilterChips> = {
  title: 'Shared/FilterChips',
  component: FilterChips,
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
    chips: categoryChips,
    activeId: 'all',
  },
};

export const PrimaryVariant: Story = {
  args: {
    chips: storageChips,
    activeId: 'fridge',
    variant: 'primary',
  },
};

export const Interactive: Story = {
  render: function InteractiveChips() {
    const [activeId, setActiveId] = useState('all');
    return (
      <FilterChips
        chips={categoryChips}
        activeId={activeId}
        onChipClick={setActiveId}
      />
    );
  },
};

export const RecipeFilters: Story = {
  render: function RecipeChips() {
    const [activeId, setActiveId] = useState('suggested');
    return (
      <FilterChips
        chips={recipeChips}
        activeId={activeId}
        onChipClick={setActiveId}
      />
    );
  },
};

export const StorageTabs: Story = {
  render: function StorageTabs() {
    const [activeId, setActiveId] = useState('fridge');
    return (
      <FilterChips
        chips={storageChips}
        activeId={activeId}
        onChipClick={setActiveId}
        variant="primary"
      />
    );
  },
};

export const WithIcons: Story = {
  render: function IconChips() {
    const [activeId, setActiveId] = useState('produce');
    const chipsWithIcons: FilterChip[] = [
      { id: 'produce', label: 'Produce', icon: '🥬' },
      { id: 'dairy', label: 'Dairy', icon: '🥛' },
      { id: 'meat', label: 'Meat', icon: '🥩' },
      { id: 'pantry', label: 'Pantry', icon: '🥫' },
      { id: 'drinks', label: 'Drinks', icon: '🍹' },
    ];
    return (
      <FilterChips
        chips={chipsWithIcons}
        activeId={activeId}
        onChipClick={setActiveId}
      />
    );
  },
};

export const NoActiveSelection: Story = {
  args: {
    chips: categoryChips,
  },
};
