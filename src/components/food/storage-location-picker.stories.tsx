import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { StorageLocationPicker, defaultLocations, type StorageLocation } from './storage-location-picker';

const meta: Meta<typeof StorageLocationPicker> = {
  title: 'Food/StorageLocationPicker',
  component: StorageLocationPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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
    const customLocations: StorageLocation[] = [
      { id: 'fridge', name: 'Fridge', icon: '🧊' },
      { id: 'freezer', name: 'Freezer', icon: '❄️' },
      { id: 'pantry', name: 'Pantry', icon: '🚪' },
      { id: 'counter', name: 'Counter', icon: '🍌' },
      { id: 'cellar', name: 'Cellar', icon: '🍷' },
      { id: 'spice', name: 'Spice Rack', icon: '🌶️' },
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
