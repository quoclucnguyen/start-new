import type { Meta, StoryObj } from '@storybook/react';
import { UnitSelector } from './unit-selector';
import { useState } from 'react';
import type { QuantityUnit } from '@/api/types';

const meta = {
  title: 'Food/UnitSelector',
  component: UnitSelector,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof UnitSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<QuantityUnit>('pieces');
    return <UnitSelector value={value} onChange={setValue} />;
  },
};

export const Kilograms: Story = {
  render: () => {
    const [value, setValue] = useState<QuantityUnit>('kg');
    return <UnitSelector value={value} onChange={setValue} />;
  },
};

export const Bottles: Story = {
  render: () => {
    const [value, setValue] = useState<QuantityUnit>('bottles');
    return <UnitSelector value={value} onChange={setValue} />;
  },
};
