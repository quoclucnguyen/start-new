import type { Meta, StoryObj } from '@storybook/react';
import { NotificationList, type NotificationGroup } from './notification-list';

const sampleGroups: NotificationGroup[] = [
  {
    label: 'Today',
    notifications: [
      {
        id: '1',
        type: 'expiry',
        title: 'Milk Expiring Soon',
        message: 'Your 2% Milk expires in 2 days. Use it in a recipe?',
        time: '2h ago',
        unread: true,
      },
      {
        id: '2',
        type: 'shopping',
        title: 'Dad added items',
        message: 'Apples and Bread added to Weekly List.',
        time: '4h ago',
      },
    ],
  },
  {
    label: 'Yesterday',
    notifications: [
      {
        id: '3',
        type: 'recipe',
        title: 'Dinner Idea: Spicy Pasta',
        message: 'You have all 5 ingredients needed. Ready in 20m.',
        time: 'Yesterday',
      },
    ],
  },
  {
    label: 'Earlier',
    notifications: [
      {
        id: '4',
        type: 'expired',
        title: 'Yogurt Expired',
        message: 'Please discard the Strawberry Yogurt from the fridge.',
        time: 'Mon',
        strikethrough: true,
      },
      {
        id: '5',
        type: 'system',
        title: 'Weekly Report',
        message: 'You saved $15 this week by reducing food waste!',
        time: 'Sun',
      },
    ],
  },
];

const meta: Meta<typeof NotificationList> = {
  title: 'Notifications/NotificationList',
  component: NotificationList,
  parameters: {
    layout: 'centered',
  },
  
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[600px] overflow-y-auto bg-background border rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    groups: sampleGroups,
  },
};

export const WithCallback: Story = {
  args: {
    groups: sampleGroups,
    onNotificationClick: (id) => alert(`Clicked notification ${id}`),
  },
};

export const SingleGroup: Story = {
  args: {
    groups: [sampleGroups[0]],
  },
};

export const ManyNotifications: Story = {
  args: {
    groups: [
      {
        label: 'Today',
        notifications: [
          { id: '1', type: 'expiry', title: 'Milk Expiring', message: 'Check your fridge', time: '1h ago', unread: true },
          { id: '2', type: 'expiry', title: 'Eggs Expiring', message: 'Use soon', time: '2h ago', unread: true },
          { id: '3', type: 'shopping', title: 'New items added', message: 'Check shopping list', time: '3h ago' },
        ],
      },
      {
        label: 'Yesterday',
        notifications: [
          { id: '4', type: 'recipe', title: 'Recipe suggestion', message: 'Try this pasta', time: 'Yesterday' },
          { id: '5', type: 'system', title: 'Tips', message: 'Save money tip', time: 'Yesterday' },
        ],
      },
      {
        label: 'This Week',
        notifications: [
          { id: '6', type: 'expired', title: 'Item expired', message: 'Discard yogurt', time: 'Mon', strikethrough: true },
          { id: '7', type: 'system', title: 'Weekly summary', message: 'You saved $20', time: 'Sun' },
          { id: '8', type: 'shopping', title: 'List shared', message: 'Mom shared a list', time: 'Sat' },
        ],
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    groups: [],
  },
  render: (args) => (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <span className="text-4xl mb-4">✓</span>
      <p className="text-muted-foreground text-sm">All caught up!</p>
    </div>
  ),
};
