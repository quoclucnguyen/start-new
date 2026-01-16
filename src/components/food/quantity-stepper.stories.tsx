import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QuantityStepper } from './quantity-stepper';

const meta: Meta<typeof QuantityStepper> = {
  title: 'Food/QuantityStepper',
  component: QuantityStepper,
  parameters: {
    layout: 'centered',
  },
  
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1,
  },
};

export const Interactive: Story = {
  render: function InteractiveStepper() {
    const [value, setValue] = useState(1);
    return (
      <QuantityStepper value={value} onChange={setValue} />
    );
  },
};

export const AtMinimum: Story = {
  args: {
    value: 0,
    min: 0,
  },
};

export const AtMaximum: Story = {
  args: {
    value: 10,
    max: 10,
  },
};

export const CustomRange: Story = {
  render: function CustomRangeStepper() {
    const [value, setValue] = useState(5);
    return (
      <div className="space-y-2">
        <QuantityStepper value={value} onChange={setValue} min={1} max={10} />
        <p className="text-xs text-center text-muted-foreground">Range: 1-10</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    value: 3,
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: function LabeledStepper() {
    const [value, setValue] = useState(1);
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted-foreground ml-1">
          Quantity
        </label>
        <QuantityStepper value={value} onChange={setValue} />
      </div>
    );
  },
};
