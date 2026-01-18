import type { Meta, StoryObj } from '@storybook/react';
import { CategoryPicker } from './category-picker';
import { useState } from 'react';
import type { FoodCategory } from '@/api/types';

const meta = {
  title: 'Food/CategoryPicker',
  component: CategoryPicker,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<FoodCategory | undefined>(undefined);
    return <CategoryPicker value={value} onChange={setValue} />;
  },
};

export const WithSelection: Story = {
  render: () => {
    const [value, setValue] = useState<FoodCategory>('dairy');
    return <CategoryPicker value={value} onChange={setValue} />;
  },
};
