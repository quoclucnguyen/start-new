import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { StorageLocationPicker } from './storage-location-picker';
import type { StorageLocationConfig } from '@/api/types';

// Default locations for stories
const defaultLocations: StorageLocationConfig[] = [
  { id: 'fridge', name: 'Fridge', icon: '🧊', color: '#06b6d4', showInFilters: true, sortOrder: 0 },
  { id: 'freezer', name: 'Freezer', icon: '❄️', color: '#6366f1', showInFilters: true, sortOrder: 1 },
  { id: 'pantry', name: 'Pantry', icon: '🚪', color: '#a855f7', showInFilters: true, sortOrder: 2 },
];

const meta: Meta<typeof StorageLocationPicker> = {
  title: 'Food/StorageLocationPicker',
  component: StorageLocationPicker,
  parameters: {
    layout: 'centered',
  },
  
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    locations: defaultLocations,
    value: 'fridge',
  },
};

export const Interactive: Story = {
  render: function InteractivePicker() {
    const [value, setValue] = useState('fridge');
    return (
      <StorageLocationPicker
        locations={defaultLocations}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const NoSelection: Story = {
  args: {
    locations: defaultLocations,
  },
};

export const FreezerSelected: Story = {
  args: {
    locations: defaultLocations,
    value: 'freezer',
  },
};

export const PantrySelected: Story = {
  args: {
    locations: defaultLocations,
    value: 'pantry',
  },
};

export const CustomLocations: Story = {
  render: function CustomPicker() {
    const [value, setValue] = useState('counter');
    const customLocations: StorageLocationConfig[] = [
      { id: 'fridge', name: 'Fridge', icon: '🧊', color: '#06b6d4', showInFilters: true, sortOrder: 0 },
      { id: 'freezer', name: 'Freezer', icon: '❄️', color: '#6366f1', showInFilters: true, sortOrder: 1 },
      { id: 'pantry', name: 'Pantry', icon: '🚪', color: '#a855f7', showInFilters: true, sortOrder: 2 },
      { id: 'counter', name: 'Counter', icon: '🍌', color: '#eab308', showInFilters: true, sortOrder: 3 },
      { id: 'cellar', name: 'Cellar', icon: '🍷', color: '#dc2626', showInFilters: true, sortOrder: 4 },
      { id: 'spice', name: 'Spice Rack', icon: '🌶️', color: '#f97316', showInFilters: true, sortOrder: 5 },
    ];
    return (
      <StorageLocationPicker
        locations={customLocations}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithLabel: Story = {
  render: function LabeledPicker() {
    const [value, setValue] = useState('fridge');
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted-foreground ml-1">
          Storage Location
        </label>
        <StorageLocationPicker
          locations={defaultLocations}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};
