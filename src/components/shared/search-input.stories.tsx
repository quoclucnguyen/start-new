import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from './search-input';

const meta: Meta<typeof SearchInput> = {
  title: 'Shared/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search pantry, fridge...',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Search pantry, fridge...',
    defaultValue: 'milk',
  },
};

export const NoVoiceButton: Story = {
  args: {
    placeholder: 'Search items...',
    showVoiceButton: false,
  },
};

export const WithCallback: Story = {
  args: {
    placeholder: 'Search with voice...',
    onVoiceClick: () => alert('Voice search activated!'),
  },
};

export const InHeader: Story = {
  render: () => (
    <div className="flex gap-3 items-center w-full">
      <SearchInput placeholder="Search pantry, fridge..." className="flex-1" />
      <button className="flex items-center justify-center h-12 w-12 rounded-xl bg-card shadow-sm border">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 16 4 4 4-4" />
          <path d="M7 20V4" />
          <path d="m21 8-4-4-4 4" />
          <path d="M17 4v16" />
        </svg>
      </button>
    </div>
  ),
};
