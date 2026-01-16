import type { Meta, StoryObj } from '@storybook/react';
import { SectionHeader } from './section-header';

const meta: Meta<typeof SectionHeader> = {
  title: 'Shared/SectionHeader',
  component: SectionHeader,
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
    title: 'Expiring Soon',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Expiring Soon',
    action: (
      <a className="text-sm font-semibold text-primary hover:text-primary/80" href="#">
        View All
      </a>
    ),
  },
};

export const WithButton: Story = {
  args: {
    title: 'Inventory',
    action: (
      <button className="text-sm font-semibold text-primary hover:text-primary/80">
        Add Item
      </button>
    ),
  },
};

export const Sticky: Story = {
  args: {
    title: 'Produce',
    sticky: true,
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4">
      <SectionHeader 
        title="Expiring Soon" 
        action={<a className="text-sm font-semibold text-primary" href="#">View All</a>} 
      />
      <div className="h-20 bg-muted rounded-xl" />
      
      <SectionHeader title="Inventory" />
      <div className="h-20 bg-muted rounded-xl" />
      
      <SectionHeader 
        title="Suggested Recipes" 
        action={<button className="text-sm font-semibold text-primary">Filter</button>} 
      />
      <div className="h-20 bg-muted rounded-xl" />
    </div>
  ),
};
