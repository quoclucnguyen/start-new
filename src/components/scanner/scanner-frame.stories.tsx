import type { Meta, StoryObj } from '@storybook/react';
import { ScannerFrame } from './scanner-frame';

const meta: Meta<typeof ScannerFrame> = {
  title: 'Scanner/ScannerFrame',
  component: ScannerFrame,
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
    status: 'scanning',
    aspectRatio: 'receipt',
  },
};

export const Detected: Story = {
  args: {
    status: 'detected',
    aspectRatio: 'receipt',
  },
};

export const Idle: Story = {
  args: {
    status: 'idle',
    aspectRatio: 'receipt',
    showScanLine: false,
  },
};

export const BarcodeAspect: Story = {
  args: {
    status: 'scanning',
    aspectRatio: 'barcode',
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export const SquareAspect: Story = {
  args: {
    status: 'scanning',
    aspectRatio: 'square',
  },
  decorators: [
    (Story) => (
      <div className="w-[250px]">
        <Story />
      </div>
    ),
  ],
};

export const WithContent: Story = {
  args: {
    status: 'scanning',
    aspectRatio: 'receipt',
  },
  render: (args) => (
    <div className="relative">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50 rounded-2xl"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400)',
          filter: 'blur(2px)',
        }}
      />
      <ScannerFrame {...args} />
    </div>
  ),
};

export const NoScanLine: Story = {
  args: {
    status: 'scanning',
    aspectRatio: 'receipt',
    showScanLine: false,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col items-center gap-2">
        <ScannerFrame status="idle" aspectRatio="square" showScanLine={false} className="w-24" />
        <span className="text-white text-xs">Idle</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ScannerFrame status="scanning" aspectRatio="square" className="w-24" />
        <span className="text-white text-xs">Scanning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ScannerFrame status="detected" aspectRatio="square" showScanLine={false} className="w-24" />
        <span className="text-white text-xs">Detected</span>
      </div>
    </div>
  ),
};
