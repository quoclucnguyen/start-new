import type { Meta, StoryObj } from '@storybook/react';
import { RestockAlert } from './restock-alert';

const meta: Meta<typeof RestockAlert> = {
  title: 'Shopping/RestockAlert',
  component: RestockAlert,
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
    items: ['Milk', 'Eggs'],
  },
};

export const SingleItem: Story = {
  args: {
    items: ['Milk'],
    message: 'Milk ran out yesterday. Add to your shopping list?',
  },
};

export const MultipleItems: Story = {
  args: {
    items: ['Milk', 'Eggs', 'Bread'],
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Running Low',
    items: ['Coffee', 'Sugar'],
    message: 'You might want to restock these items soon.',
  },
};

export const CustomAction: Story = {
  args: {
    items: ['Butter', 'Cream'],
    actionLabel: 'Add to Cart',
  },
};

export const WithCallback: Story = {
  args: {
    items: ['Yogurt', 'Cheese'],
    onAction: () => alert('Items added to list!'),
  },
};

export const ExpiryAlert: Story = {
  args: {
    title: 'Items Expiring Today',
    items: ['Spinach', 'Chicken'],
    message: 'These items expire today. Use them or add replacements?',
    actionLabel: 'Replace Items',
  },
};
