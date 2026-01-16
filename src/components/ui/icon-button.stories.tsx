import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './icon-button';

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const MoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: 'UI/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'primary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <BellIcon />,
    'aria-label': 'Notifications',
  },
};

export const Ghost: Story = {
  args: {
    children: <MoreIcon />,
    variant: 'ghost',
    'aria-label': 'More options',
  },
};

export const Primary: Story = {
  args: {
    children: <PlusIcon />,
    variant: 'primary',
    'aria-label': 'Add item',
  },
};

export const Outline: Story = {
  args: {
    children: <CloseIcon />,
    variant: 'outline',
    'aria-label': 'Close',
  },
};

export const Small: Story = {
  args: {
    children: <MoreIcon />,
    size: 'sm',
    'aria-label': 'More',
  },
};

export const Large: Story = {
  args: {
    children: <BellIcon />,
    size: 'lg',
    'aria-label': 'Notifications',
  },
};

export const FAB: Story = {
  args: {
    children: <PlusIcon />,
    variant: 'primary',
    size: 'xl',
    'aria-label': 'Add new item',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton aria-label="Default"><BellIcon /></IconButton>
      <IconButton variant="ghost" aria-label="Ghost"><MoreIcon /></IconButton>
      <IconButton variant="primary" aria-label="Primary"><PlusIcon /></IconButton>
      <IconButton variant="outline" aria-label="Outline"><CloseIcon /></IconButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton size="sm" aria-label="Small"><BellIcon /></IconButton>
      <IconButton size="default" aria-label="Default"><BellIcon /></IconButton>
      <IconButton size="lg" aria-label="Large"><BellIcon /></IconButton>
      <IconButton size="xl" variant="primary" aria-label="XL FAB"><PlusIcon /></IconButton>
    </div>
  ),
};
