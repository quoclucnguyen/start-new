import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    variant: {
      control: 'select',
      options: ['default', 'danger', 'warning', 'success'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
  },
};

export const Danger: Story = {
  args: {
    value: 10,
    variant: 'danger',
  },
};

export const Warning: Story = {
  args: {
    value: 25,
    variant: 'warning',
  },
};

export const Success: Story = {
  args: {
    value: 80,
    variant: 'success',
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Full: Story = {
  args: {
    value: 100,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">60%</span>
      </div>
      <Progress value={60} />
    </div>
  ),
};

export const ExpiryIndicator: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">10% left</span>
        </div>
        <Progress value={10} variant="danger" className="w-20" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">25% left</span>
        </div>
        <Progress value={25} variant="warning" className="w-20" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">80% left</span>
        </div>
        <Progress value={80} variant="success" className="w-20" />
      </div>
    </div>
  ),
};
