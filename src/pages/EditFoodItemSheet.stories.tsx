import type { Meta, StoryObj } from '@storybook/react';
import { EditFoodItemSheet } from './EditFoodItemSheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Create a mock item in localStorage for testing
const mockItem = {
  id: 'test-item-1',
  name: 'Fresh Milk',
  category: 'dairy' as const,
  storage: 'fridge' as const,
  expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  quantity: 2,
  unit: 'bottles' as const,
  notes: 'Organic from local farm',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta = {
  title: 'Pages/EditFoodItemSheet',
  component: EditFoodItemSheet,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      // Setup mock data
      useEffect(() => {
        localStorage.setItem('food-inventory-items', JSON.stringify([mockItem]));
        return () => {
          localStorage.removeItem('food-inventory-items');
        };
      }, []);

      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  argTypes: {
    visible: { control: 'boolean' },
    itemId: { control: 'text' },
  },
} satisfies Meta<typeof EditFoodItemSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setVisible(true)}>Open Edit Sheet</Button>
      <EditFoodItemSheet
        itemId="test-item-1"
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    itemId: 'test-item-1',
    visible: false,
    onClose: () => {},
  },
  render: () => <DefaultDemo />,
};

function NotFoundDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setVisible(true)}>Open Edit Sheet (Not Found)</Button>
      <EditFoodItemSheet
        itemId="non-existent-id"
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </div>
  );
}

export const NotFound: Story = {
  args: {
    itemId: 'non-existent-id',
    visible: false,
    onClose: () => {},
  },
  render: () => <NotFoundDemo />,
};
