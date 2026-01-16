import type { Meta, StoryObj } from '@storybook/react';
import { IngredientTag } from './ingredient-tag';

const meta: Meta<typeof IngredientTag> = {
  title: 'Recipes/IngredientTag',
  component: IngredientTag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  args: {
    name: 'Chicken Breast',
    available: true,
  },
};

export const Missing: Story = {
  args: {
    name: 'Soy Sauce',
    available: false,
  },
};

export const IngredientList: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <IngredientTag name="Chicken Breast" available />
      <IngredientTag name="Bell Peppers" available />
      <IngredientTag name="Soy Sauce" available={false} />
      <IngredientTag name="Ginger" available={false} />
      <IngredientTag name="Rice" available />
    </div>
  ),
};

export const AllAvailable: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <IngredientTag name="Pasta" available />
      <IngredientTag name="Spinach" available />
      <IngredientTag name="Cream" available />
      <IngredientTag name="Parmesan" available />
      <IngredientTag name="Garlic" available />
    </div>
  ),
};

export const MostlyMissing: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <IngredientTag name="Beef" available={false} />
      <IngredientTag name="Mushrooms" available />
      <IngredientTag name="Wine" available={false} />
      <IngredientTag name="Thyme" available={false} />
      <IngredientTag name="Butter" available />
    </div>
  ),
};
