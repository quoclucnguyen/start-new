import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ShoppingListItem } from './shopping-list-item';

const meta: Meta<typeof ShoppingListItem> = {
  title: 'Shopping/ShoppingListItem',
  component: ShoppingListItem,
  parameters: {
    layout: 'centered',
  },
  
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

export const Default: Story = {
  args: {
    name: 'Bananas',
    quantity: '1 bunch • Organic',
    emoji: '🍌',
  },
};

export const Checked: Story = {
  args: {
    name: 'Cheddar Cheese',
    quantity: '1 block',
    emoji: '🧀',
    checked: true,
  },
};

export const Interactive: Story = {
  render: function InteractiveItem() {
    const [checked, setChecked] = useState(false);
    return (
      <ShoppingListItem
        name="Spinach"
        quantity="2 bags"
        emoji="🥗"
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};

export const WithoutEmoji: Story = {
  args: {
    name: 'Paper Towels',
    quantity: '2 rolls',
  },
};

export const WithoutQuantity: Story = {
  args: {
    name: 'Milk',
    emoji: '🥛',
  },
};

export const ShoppingList: Story = {
  render: function ShoppingListDemo() {
    const [items, setItems] = useState([
      { id: '1', name: 'Bananas', quantity: '1 bunch • Organic', emoji: '🍌', checked: false },
      { id: '2', name: 'Spinach', quantity: '2 bags', emoji: '🥗', checked: false },
      { id: '3', name: 'Cheddar Cheese', quantity: '1 block', emoji: '🧀', checked: true },
      { id: '4', name: 'Oat Milk', quantity: '3 cartons', emoji: '🥛', checked: false },
    ]);

    const toggleItem = (id: string) => {
      setItems(items.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      ));
    };

    return (
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <ShoppingListItem
            key={item.id}
            name={item.name}
            quantity={item.quantity}
            emoji={item.emoji}
            checked={item.checked}
            onCheckedChange={() => toggleItem(item.id)}
          />
        ))}
      </div>
    );
  },
};

export const Categories: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-3">Produce</h3>
        <div className="flex flex-col gap-3">
          <ShoppingListItem name="Bananas" quantity="1 bunch • Organic" emoji="🍌" />
          <ShoppingListItem name="Spinach" quantity="2 bags" emoji="🥗" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-3">Dairy</h3>
        <div className="flex flex-col gap-3">
          <ShoppingListItem name="Cheddar Cheese" quantity="1 block" emoji="🧀" checked />
          <ShoppingListItem name="Oat Milk" quantity="3 cartons" emoji="🥛" />
        </div>
      </div>
    </div>
  ),
};
