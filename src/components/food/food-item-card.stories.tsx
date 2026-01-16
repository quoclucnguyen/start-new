import type { Meta, StoryObj } from '@storybook/react';
import { FoodItemCard } from './food-item-card';

const MilkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <path d="M8 2h8" />
    <path d="M9 2v1.343M15 2v1.343" />
    <path d="M7.5 6.5 6 19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l-1.5-12.5" />
    <path d="M4.5 9h15" />
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const meta: Meta<typeof FoodItemCard> = {
  title: 'Food/FoodItemCard',
  component: FoodItemCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Expiring: Story = {
  args: {
    name: 'Fresh Milk',
    icon: <MilkIcon />,
    expiryText: 'Expires in 1 day',
    expiryStatus: 'expiring',
    percentLeft: 10,
    showBadge: true,
  },
};

export const ExpiringSoon: Story = {
  args: {
    name: 'Spinach',
    icon: <LeafIcon />,
    expiryText: 'Expires in 2 days',
    expiryStatus: 'soon',
    percentLeft: 25,
  },
};

export const Good: Story = {
  args: {
    name: 'Greek Yogurt',
    expiryText: 'Expires in 5 days',
    expiryStatus: 'good',
    percentLeft: 60,
  },
};

export const Fresh: Story = {
  args: {
    name: 'Organic Eggs',
    expiryText: 'Expires in 2 weeks',
    expiryStatus: 'fresh',
    percentLeft: 100,
  },
};

export const WithoutProgress: Story = {
  args: {
    name: 'Canned Tomatoes',
    expiryText: 'Expires in 6 months',
    expiryStatus: 'fresh',
  },
};

export const ExpiringList: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <FoodItemCard
        name="Fresh Milk"
        icon={<MilkIcon />}
        expiryText="Expires in 1 day"
        expiryStatus="expiring"
        percentLeft={10}
        showBadge
      />
      <FoodItemCard
        name="Spinach"
        icon={<LeafIcon />}
        expiryText="Expires in 2 days"
        expiryStatus="soon"
        percentLeft={25}
      />
      <FoodItemCard
        name="Chicken Breast"
        expiryText="Expires in 3 days"
        expiryStatus="soon"
        percentLeft={50}
      />
    </div>
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <FoodItemCard
        name="Expiring Item"
        expiryText="Expires tomorrow"
        expiryStatus="expiring"
        percentLeft={10}
        showBadge
      />
      <FoodItemCard
        name="Expiring Soon"
        expiryText="Expires in 2 days"
        expiryStatus="soon"
        percentLeft={30}
      />
      <FoodItemCard
        name="Good Condition"
        expiryText="Expires in 5 days"
        expiryStatus="good"
        percentLeft={60}
      />
      <FoodItemCard
        name="Fresh Item"
        expiryText="Expires in 2 weeks"
        expiryStatus="fresh"
        percentLeft={100}
      />
    </div>
  ),
};
