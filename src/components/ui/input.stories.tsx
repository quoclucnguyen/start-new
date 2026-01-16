import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Organic Whole Milk',
  },
};

export const WithIcon: Story = {
  args: {
    placeholder: 'Search pantry, fridge...',
    icon: <SearchIcon />,
  },
};

export const WithEndIcon: Story = {
  args: {
    placeholder: 'Search with voice...',
    icon: <SearchIcon />,
    endIcon: <MicIcon />,
  },
};

export const DateInput: Story = {
  args: {
    type: 'date',
    icon: <CalendarIcon />,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground ml-1">
        Food Name
      </label>
      <Input placeholder="e.g., Organic Whole Milk" />
    </div>
  ),
};

export const FormGroup: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted-foreground ml-1">
          Food Name
        </label>
        <Input placeholder="e.g., Organic Whole Milk" />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-muted-foreground ml-1">
          Expires On
        </label>
        <Input type="date" icon={<CalendarIcon />} />
      </div>
    </div>
  ),
};
