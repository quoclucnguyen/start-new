import type { Meta, StoryObj } from '@storybook/react';
import { FixedBottomAction } from './fixed-bottom-action';

const meta = {
  title: 'Shared/FixedBottomAction',
  component: FixedBottomAction,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', position: 'relative', paddingBottom: '100px' }}>
        <div className="p-4">
          <p>Page content goes here...</p>
          <p className="text-muted-foreground mt-4">
            Scroll down to see more content and the fixed bottom action.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FixedBottomAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryOnly: Story = {
  args: {
    primaryLabel: 'Save Changes',
    primaryOnClick: () => console.log('primaryOnClick'),
  },
};

export const PrimaryAndSecondary: Story = {
  args: {
    primaryLabel: 'Save Changes',
    primaryOnClick: () => console.log('primaryOnClick'),
    secondaryLabel: 'Cancel',
    secondaryOnClick: () => console.log('secondaryOnClick'),
  },
};

export const WithDestructive: Story = {
  args: {
    primaryLabel: 'Save',
    primaryOnClick: () => console.log('primaryOnClick'),
    secondaryLabel: 'Delete',
    secondaryOnClick: () => console.log('secondaryOnClick'),
    secondaryVariant: 'destructive',
  },
};

export const Loading: Story = {
  args: {
    primaryLabel: 'Save Changes',
    primaryLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    primaryLabel: 'Save Changes',
    primaryDisabled: true,
  },
};
