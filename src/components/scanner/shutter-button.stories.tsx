import type { Meta, StoryObj } from '@storybook/react';
import { ShutterButton } from './shutter-button';

const meta: Meta<typeof ShutterButton> = {
  title: 'Scanner/ShutterButton',
  component: ShutterButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#000000' }],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'default',
    variant: 'default',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    variant: 'default',
  },
};

export const Recording: Story = {
  args: {
    size: 'large',
    variant: 'recording',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-8 items-center">
      <div className="flex flex-col items-center gap-2">
        <ShutterButton size="default" variant="default" />
        <span className="text-white text-xs">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ShutterButton size="large" variant="default" />
        <span className="text-white text-xs">Large</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ShutterButton size="large" variant="recording" />
        <span className="text-white text-xs">Recording</span>
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent w-[380px]">
      {/* Recent thumbnail */}
      <div className="size-12 rounded-lg border-2 border-white/20 bg-gray-800 overflow-hidden">
        <div className="size-full bg-gray-700" />
      </div>
      
      {/* Shutter */}
      <ShutterButton size="large" />
      
      {/* Gallery */}
      <div className="size-12 rounded-full bg-white/10 flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    </div>
  ),
};
