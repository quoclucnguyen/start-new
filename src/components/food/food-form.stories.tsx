import type { Meta, StoryObj } from '@storybook/react';
import { FoodForm } from './food-form';

const meta = {
  title: 'Food/FoodForm',
  component: FoodForm,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FoodForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    onSubmit: (values) => console.log('onSubmit', values),
  },
};

export const WithInitialValues: Story = {
  args: {
    initialValues: {
      name: 'Organic Whole Milk',
      category: 'dairy',
      storage: 'fridge',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: 2,
      unit: 'bottles',
      notes: 'Buy from local farm',
    },
    onSubmit: (values) => console.log('onSubmit', values),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    onSubmit: (values) => console.log('onSubmit', values),
  },
};
