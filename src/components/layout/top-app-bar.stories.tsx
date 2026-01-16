import type { Meta, StoryObj } from '@storybook/react';
import { TopAppBar, BackButton } from './top-app-bar';
import { IconButton } from '@/components/ui/icon-button';
import { Button } from '@/components/ui/button';

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const meta: Meta<typeof TopAppBar> = {
  title: 'Layout/TopAppBar',
  component: TopAppBar,
  parameters: {
    layout: 'fullscreen',
  },
  
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto bg-background min-h-[200px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'My Kitchen',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'My Kitchen',
    subtitle: 'Good Morning,',
  },
};

export const WithNotification: Story = {
  args: {
    title: 'My Kitchen',
    subtitle: 'Good Morning,',
    rightAction: (
      <div className="relative">
        <IconButton aria-label="Notifications">
          <BellIcon />
        </IconButton>
        <span className="absolute top-1 right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      </div>
    ),
  },
};

export const WithBackButton: Story = {
  args: {
    title: 'Add Item',
    leftAction: <BackButton icon="close" />,
    rightAction: <Button variant="ghost" className="text-primary font-bold">Save</Button>,
  },
};

export const PageHeader: Story = {
  args: {
    title: 'Shopping List',
    subtitle: '3 items left to buy',
    rightAction: (
      <div className="flex gap-2">
        <IconButton aria-label="Share">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
        </IconButton>
        <IconButton aria-label="More">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </IconButton>
      </div>
    ),
  },
};

export const LargeTitle: Story = {
  render: () => (
    <TopAppBar>
      <div className="flex flex-col gap-2 px-4 py-4">
        <div className="flex items-center justify-end">
          <button className="text-primary text-sm font-bold">Mark all read</button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      </div>
    </TopAppBar>
  ),
};

export const Transparent: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto bg-gradient-to-b from-primary/20 to-background min-h-[200px]">
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Scan Receipt',
    leftAction: <BackButton icon="close" />,
    transparent: true,
  },
};
