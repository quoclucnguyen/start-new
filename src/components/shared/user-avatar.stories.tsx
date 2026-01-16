import type { Meta, StoryObj } from '@storybook/react';
import { UserAvatar } from './user-avatar';

const meta: Meta<typeof UserAvatar> = {
  title: 'Shared/UserAvatar',
  component: UserAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'away'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    alt: 'User avatar',
  },
};

export const WithStatus: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    showStatus: true,
    status: 'online',
  },
};

export const Offline: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    showStatus: true,
    status: 'offline',
  },
};

export const Away: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    showStatus: true,
    status: 'away',
  },
};

export const Small: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    size: 'sm',
    showStatus: true,
  },
};

export const Large: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    size: 'lg',
    showStatus: true,
  },
};

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
};

export const InitialsWithStatus: Story = {
  args: {
    name: 'Jane Smith',
    showStatus: true,
    status: 'online',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UserAvatar 
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" 
        size="sm" 
        showStatus 
      />
      <UserAvatar 
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" 
        size="md" 
        showStatus 
      />
      <UserAvatar 
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" 
        size="lg" 
        showStatus 
      />
    </div>
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UserAvatar name="John Doe" showStatus status="online" />
      <UserAvatar name="Jane Smith" showStatus status="away" />
      <UserAvatar name="Bob Wilson" showStatus status="offline" />
    </div>
  ),
};

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <UserAvatar 
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
        showStatus 
      />
      <div>
        <p className="text-xs font-medium text-muted-foreground">Good Morning,</p>
        <h2 className="text-lg font-bold leading-tight">My Kitchen</h2>
      </div>
    </div>
  ),
};
