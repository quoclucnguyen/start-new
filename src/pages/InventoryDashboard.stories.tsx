import type { Meta, StoryObj } from '@storybook/react';
import { InventoryDashboard } from './InventoryDashboard';

const meta: Meta<typeof InventoryDashboard> = {
  title: 'Pages/InventoryDashboard',
  component: InventoryDashboard,
  parameters: {
    layout: 'fullscreen',
    // Mobile viewport parameters for realistic preview
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <InventoryDashboard />,
};

// Simulated Mobile View in Desktop Storybook
export const MobileSimulator: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-[375px] h-[812px] border-[14px] border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl bg-background relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-50"></div>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};
