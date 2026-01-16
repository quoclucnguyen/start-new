import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Bananas',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Bananas',
    description: '1 bunch • Organic',
  },
};

export const CheckedWithLabel: Story = {
  args: {
    label: 'Cheddar Cheese',
    description: '1 block',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled item',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked',
    disabled: true,
    defaultChecked: true,
  },
};

export const ShoppingList: Story = {
  render: () => (
    <div className="space-y-3 w-[300px]">
      <Checkbox label="Bananas" description="1 bunch • Organic" />
      <Checkbox label="Spinach" description="2 bags" />
      <Checkbox label="Cheddar Cheese" description="1 block" defaultChecked />
      <Checkbox label="Oat Milk" description="3 cartons" />
    </div>
  ),
};
