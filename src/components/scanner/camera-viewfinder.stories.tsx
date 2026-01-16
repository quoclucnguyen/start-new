import type { Meta, StoryObj } from '@storybook/react';
import { CameraViewfinder } from './camera-viewfinder';

const meta: Meta<typeof CameraViewfinder> = {
  title: 'Scanner/CameraViewfinder',
  component: CameraViewfinder,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[844px] max-w-md mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'scanning',
  },
  render: (args) => (
    <CameraViewfinder {...args}>
      <img 
        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800" 
        alt="Camera feed"
        className="h-full w-full object-cover opacity-90"
      />
    </CameraViewfinder>
  ),
};

export const Detected: Story = {
  args: {
    status: 'detected',
    statusText: 'Receipt Detected',
    helpText: 'Tap to capture',
  },
  render: (args) => (
    <CameraViewfinder {...args}>
      <img 
        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800" 
        alt="Camera feed"
        className="h-full w-full object-cover opacity-90"
      />
    </CameraViewfinder>
  ),
};

export const Idle: Story = {
  args: {
    status: 'idle',
    helpText: 'Point camera at receipt',
  },
  render: (args) => (
    <CameraViewfinder {...args}>
      <div className="h-full w-full bg-gray-900" />
    </CameraViewfinder>
  ),
};

export const WithFlash: Story = {
  args: {
    status: 'scanning',
    flashEnabled: true,
  },
  render: (args) => (
    <CameraViewfinder {...args}>
      <img 
        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800" 
        alt="Camera feed"
        className="h-full w-full object-cover opacity-90"
      />
    </CameraViewfinder>
  ),
};

export const BarcodeScanner: Story = {
  args: {
    status: 'scanning',
    aspectRatio: 'barcode',
    helpText: 'Align barcode within frame',
  },
  render: (args) => (
    <CameraViewfinder {...args}>
      <img 
        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" 
        alt="Camera feed"
        className="h-full w-full object-cover opacity-90"
      />
    </CameraViewfinder>
  ),
};

export const WithThumbnail: Story = {
  args: {
    status: 'scanning',
    recentThumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100',
  },
  render: (args) => (
    <CameraViewfinder {...args}>
      <img 
        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800" 
        alt="Camera feed"
        className="h-full w-full object-cover opacity-90"
      />
    </CameraViewfinder>
  ),
};

export const Interactive: Story = {
  args: {
    status: 'scanning',
    onCapture: () => alert('Captured!'),
    onClose: () => alert('Closed!'),
    onFlashToggle: () => alert('Flash toggled!'),
    onGalleryClick: () => alert('Gallery clicked!'),
    onRecentClick: () => alert('Recent clicked!'),
  },
  render: (args) => (
    <CameraViewfinder {...args}>
      <img 
        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800" 
        alt="Camera feed"
        className="h-full w-full object-cover opacity-90"
      />
    </CameraViewfinder>
  ),
};
