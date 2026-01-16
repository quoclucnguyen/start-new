import type { Meta, StoryObj } from '@storybook/react';
import { NotificationItem } from './notification-item';

const meta: Meta<typeof NotificationItem> = {
  title: 'Notifications/NotificationItem',
  component: NotificationItem,
  parameters: {
    layout: 'centered',
  },
  
  decorators: [
    (Story) => (
      <div className="w-[400px] bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Expiry: Story = {
  args: {
    type: 'expiry',
    title: 'Milk Expiring Soon',
    message: 'Your 2% Milk expires in 2 days. Use it in a recipe?',
    time: '2h ago',
    unread: true,
  },
};

export const Shopping: Story = {
  args: {
    type: 'shopping',
    title: 'Dad added items',
    message: 'Apples and Bread added to Weekly List.',
    time: '4h ago',
  },
};

export const Recipe: Story = {
  args: {
    type: 'recipe',
    title: 'Dinner Idea: Spicy Pasta',
    message: 'You have all 5 ingredients needed. Ready in 20m.',
    time: 'Yesterday',
  },
};

export const Expired: Story = {
  args: {
    type: 'expired',
    title: 'Yogurt Expired',
    message: 'Please discard the Strawberry Yogurt from the fridge.',
    time: 'Mon',
    strikethrough: true,
  },
};

export const System: Story = {
  args: {
    type: 'system',
    title: 'Weekly Report',
    message: 'You saved $15 this week by reducing food waste!',
    time: 'Sun',
  },
};

export const UnreadNotification: Story = {
  args: {
    type: 'expiry',
    title: 'Eggs Expiring Tomorrow',
    message: 'Check your fridge - eggs need to be used soon.',
    time: '1h ago',
    unread: true,
  },
};

export const NotificationList: Story = {
  render: () => (
    <div className="flex flex-col">
      <NotificationItem
        type="expiry"
        title="Milk Expiring Soon"
        message="Your 2% Milk expires in 2 days. Use it in a recipe?"
        time="2h ago"
        unread
      />
      <NotificationItem
        type="shopping"
        title="Dad added items"
        message="Apples and Bread added to Weekly List."
        time="4h ago"
      />
      <NotificationItem
        type="recipe"
        title="Dinner Idea: Spicy Pasta"
        message="You have all 5 ingredients needed. Ready in 20m."
        time="Yesterday"
      />
      <NotificationItem
        type="expired"
        title="Yogurt Expired"
        message="Please discard the Strawberry Yogurt from the fridge."
        time="Mon"
        strikethrough
      />
      <NotificationItem
        type="system"
        title="Weekly Report"
        message="You saved $15 this week by reducing food waste!"
        time="Sun"
      />
    </div>
  ),
};
