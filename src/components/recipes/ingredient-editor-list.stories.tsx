import type { Meta, StoryObj } from '@storybook/react';
import { IngredientEditorList } from './ingredient-editor-list';

const meta: Meta<typeof IngredientEditorList> = {
  title: 'Recipes/IngredientEditorList',
  component: IngredientEditorList,
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

export const WithIngredients: Story = {
  args: {
    value: [
      { name: 'Chicken breast', quantity: 500, unit: 'g', optional: false },
      { name: 'Soy sauce', quantity: 2, unit: 'tbsp', optional: false },
      { name: 'Sesame oil', quantity: 1, unit: 'tsp', optional: true },
      { name: 'Garlic', quantity: 3, unit: 'cloves', optional: false },
    ],
    onChange: () => undefined,
  },
};
