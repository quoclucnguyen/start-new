import type { Meta, StoryObj } from '@storybook/react';
import { AddFoodItemPage } from './AddFoodItemPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta = {
  title: 'Pages/AddFoodItemPage',
  component: AddFoodItemPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof AddFoodItemPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
