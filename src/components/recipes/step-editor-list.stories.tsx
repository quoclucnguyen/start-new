import type { Meta, StoryObj } from '@storybook/react';
import { StepEditorList } from './step-editor-list';

const meta: Meta<typeof StepEditorList> = {
  title: 'Recipes/StepEditorList',
  component: StepEditorList,
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

export const Empty: Story = {
  args: {
    value: [],
    onChange: () => undefined,
  },
};

export const WithSteps: Story = {
  args: {
    value: [
      { instruction: 'Slice chicken breast into thin strips.', estimatedMinutes: 5 },
      { instruction: 'Heat oil in a wok over high heat.', estimatedMinutes: 2 },
      { instruction: 'Stir-fry chicken until golden brown.', estimatedMinutes: 8 },
      { instruction: 'Add vegetables and sauce, cook until tender.', estimatedMinutes: 5 },
    ],
    onChange: () => undefined,
  },
};
