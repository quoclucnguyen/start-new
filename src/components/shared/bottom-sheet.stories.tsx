import type { Meta, StoryObj } from '@storybook/react';
import { BottomSheet } from './bottom-sheet';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Shared/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    visible: { control: 'boolean' },
    title: { control: 'text' },
    height: { control: 'text' },
    showCloseButton: { control: 'boolean' },
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setVisible(true)}>Open Bottom Sheet</Button>
      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title="Edit Item"
      >
        <div className="p-4">
          <p>Bottom sheet content goes here...</p>
        </div>
      </BottomSheet>
    </div>
  );
}

export const Default: Story = {
  args: {
    visible: false,
    onClose: () => {},
    children: <div>Content</div>,
  },
  render: () => <DefaultDemo />,
};

function WithFormDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setVisible(true)}>Open Form Sheet</Button>
      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title="Add Food Item"
      >
        <div className="p-4 space-y-4">
          <div className="h-40 bg-muted rounded-xl flex items-center justify-center">
            Form content here
          </div>
          <div className="h-40 bg-muted rounded-xl flex items-center justify-center">
            More content
          </div>
          <div className="h-40 bg-muted rounded-xl flex items-center justify-center">
            Even more content
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export const WithForm: Story = {
  args: {
    visible: false,
    onClose: () => {},
    children: <div>Content</div>,
  },
  render: () => <WithFormDemo />,
};

function HalfHeightDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setVisible(true)}>Open Half Sheet</Button>
      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title="Quick Action"
        height="50vh"
      >
        <div className="p-4">
          <p>Half-height bottom sheet</p>
        </div>
      </BottomSheet>
    </div>
  );
}

export const HalfHeight: Story = {
  args: {
    visible: false,
    onClose: () => {},
    children: <div>Content</div>,
    height: '50vh',
  },
  render: () => <HalfHeightDemo />,
};
