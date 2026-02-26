import type { Meta, StoryObj } from '@storybook/react';
import { RecipeIngredientsPanel } from './recipe-ingredients-panel';
import type { RecipeDetail, MatchedIngredient, MissingIngredient } from '@/api/types';

const mockRecipe: RecipeDetail = {
  id: '1',
  userId: null,
  title: 'Creamy Spinach Pasta',
  cookTimeMinutes: 15,
  servings: 2,
  difficulty: 'easy',
  tags: [],
  visibility: 'private',
  source: 'system',
  createdAt: '',
  updatedAt: '',
  deleted: false,
  ingredients: [
    { id: 'i1', recipeId: '1', name: 'Spinach', normalizedName: 'spinach', quantity: 200, unit: 'g', optional: false, sortOrder: 0 },
    { id: 'i2', recipeId: '1', name: 'Pasta', normalizedName: 'pasta', quantity: 250, unit: 'g', optional: false, sortOrder: 1 },
    { id: 'i3', recipeId: '1', name: 'Heavy Cream', normalizedName: 'heavy cream', quantity: 200, unit: 'ml', optional: false, sortOrder: 2 },
    { id: 'i4', recipeId: '1', name: 'Garlic', normalizedName: 'garlic', quantity: 3, unit: 'pieces', optional: false, sortOrder: 3 },
    { id: 'i5', recipeId: '1', name: 'Red Pepper Flakes', normalizedName: 'red pepper flakes', optional: true, sortOrder: 4 },
  ],
  steps: [],
};

const matched: MatchedIngredient[] = [
  { recipeIngredientId: 'i1', recipeIngredientName: 'Spinach', foodItemId: 'f1', foodItemName: 'Spinach', quantitySufficient: true },
  { recipeIngredientId: 'i2', recipeIngredientName: 'Pasta', foodItemId: 'f2', foodItemName: 'Pasta', quantitySufficient: true },
  { recipeIngredientId: 'i3', recipeIngredientName: 'Heavy Cream', foodItemId: 'f3', foodItemName: 'Cream', quantitySufficient: true },
];

const missing: MissingIngredient[] = [
  { recipeIngredientId: 'i4', name: 'Garlic', quantity: 3, unit: 'pieces' },
];

const meta: Meta<typeof RecipeIngredientsPanel> = {
  title: 'Recipes/RecipeIngredientsPanel',
  component: RecipeIngredientsPanel,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] bg-background p-4 rounded-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    recipe: mockRecipe,
    matchedIngredients: matched,
    missingIngredients: missing,
  },
};

export const AllAvailable: Story = {
  args: {
    recipe: mockRecipe,
    matchedIngredients: [
      ...matched,
      { recipeIngredientId: 'i4', recipeIngredientName: 'Garlic', foodItemId: 'f4', foodItemName: 'Garlic', quantitySufficient: true },
    ],
    missingIngredients: [],
  },
};

export const AllMissing: Story = {
  args: {
    recipe: mockRecipe,
    matchedIngredients: [],
    missingIngredients: [
      { recipeIngredientId: 'i1', name: 'Spinach', quantity: 200, unit: 'g' },
      { recipeIngredientId: 'i2', name: 'Pasta', quantity: 250, unit: 'g' },
      { recipeIngredientId: 'i3', name: 'Heavy Cream', quantity: 200, unit: 'ml' },
      { recipeIngredientId: 'i4', name: 'Garlic', quantity: 3, unit: 'pieces' },
    ],
  },
};
