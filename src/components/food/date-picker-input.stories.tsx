import type { Meta, StoryObj } from '@storybook/react';
import { DatePickerInput } from './date-picker-input';
import { useState } from 'react';

const meta = {
  title: 'Food/DatePickerInput',
  component: DatePickerInput,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePickerInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return <DatePickerInput value={value} onChange={setValue} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [value, setValue] = useState<Date | null>(tomorrow);
    return <DatePickerInput value={value} onChange={setValue} />;
  },
};

export const ExpiringSoon: Story = {
  render: () => {
    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);
    const [value, setValue] = useState<Date | null>(inThreeDays);
    return <DatePickerInput value={value} onChange={setValue} />;
  },
};

export const Fresh: Story = {
  render: () => {
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
    const [value, setValue] = useState<Date | null>(inTwoWeeks);
    return <DatePickerInput value={value} onChange={setValue} />;
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'No expiry date',
  },
};
