import type { Meta, StoryObj } from '@storybook/react';
import { RecipeSuggestionList } from './recipe-suggestion-list';
import type { RecipeSuggestionItem } from '@/api/types';

const mockSuggestions: RecipeSuggestionItem[] = [
  {
    recipe: {
      id: '1',
      userId: null,
      title: 'Creamy Spinach Pasta',
      description: 'Quick and comforting pasta with fresh spinach.',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
      cookTimeMinutes: 15,
      servings: 2,
      difficulty: 'easy',
      tags: ['pasta', 'vegetarian', 'quick'],
      visibility: 'private',
      source: 'system',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deleted: false,
    },
    suggestion: {
      recipeId: '1',
      matchPercentage: 80,
      matchedIngredients: [
        { recipeIngredientId: 'ri1', recipeIngredientName: 'Spinach', foodItemId: 'fi1', foodItemName: 'Spinach', quantitySufficient: true },
        { recipeIngredientId: 'ri2', recipeIngredientName: 'Pasta', foodItemId: 'fi2', foodItemName: 'Pasta', quantitySufficient: true },
        { recipeIngredientId: 'ri3', recipeIngredientName: 'Heavy Cream', foodItemId: 'fi3', foodItemName: 'Cream', quantitySufficient: true },
        { recipeIngredientId: 'ri4', recipeIngredientName: 'Onion', foodItemId: 'fi4', foodItemName: 'Onion', quantitySufficient: true },
      ],
      missingIngredients: [
        { recipeIngredientId: 'ri5', name: 'Garlic', quantity: 3, unit: 'pieces' },
      ],
      expiringIngredientsUsed: ['fi1'],
    },
  },
  {
    recipe: {
      id: '2',
      userId: null,
      title: 'Chicken Stir Fry',
      description: 'Colorful vegetable stir fry with chicken.',
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      cookTimeMinutes: 25,
      servings: 3,
      difficulty: 'medium',
      tags: ['asian', 'dinner'],
      visibility: 'private',
      source: 'system',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deleted: false,
    },
    suggestion: {
      recipeId: '2',
      matchPercentage: 50,
      matchedIngredients: [
        { recipeIngredientId: 'ri10', recipeIngredientName: 'Chicken Breast', foodItemId: 'fi10', foodItemName: 'Chicken', quantitySufficient: true },
        { recipeIngredientId: 'ri11', recipeIngredientName: 'Bell Peppers', foodItemId: 'fi11', foodItemName: 'Bell Peppers', quantitySufficient: true },
      ],
      missingIngredients: [
        { recipeIngredientId: 'ri12', name: 'Soy Sauce' },
        { recipeIngredientId: 'ri13', name: 'Ginger' },
      ],
      expiringIngredientsUsed: [],
    },
  },
  {
    recipe: {
      id: '3',
      userId: null,
      title: 'Tomato Basil Soup',
      description: 'Comforting homemade tomato soup.',
      imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
      cookTimeMinutes: 30,
      servings: 4,
      difficulty: 'easy',
      tags: ['soup', 'vegetarian'],
      visibility: 'private',
      source: 'system',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deleted: false,
    },
    suggestion: {
      recipeId: '3',
      matchPercentage: 35,
      matchedIngredients: [
        { recipeIngredientId: 'ri20', recipeIngredientName: 'Tomatoes', foodItemId: 'fi20', foodItemName: 'Tomatoes', quantitySufficient: true },
      ],
      missingIngredients: [
        { recipeIngredientId: 'ri21', name: 'Onion' },
        { recipeIngredientId: 'ri22', name: 'Garlic' },
        { recipeIngredientId: 'ri23', name: 'Fresh Basil' },
        { recipeIngredientId: 'ri24', name: 'Vegetable Broth' },
      ],
      expiringIngredientsUsed: ['fi20'],
    },
  },
];

const meta: Meta<typeof RecipeSuggestionList> = {
  title: 'Recipes/RecipeSuggestionList',
  component: RecipeSuggestionList,
  parameters: {
    layout: 'padded',
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
    suggestions: mockSuggestions,
    onViewRecipe: (id) => console.log('View recipe:', id),
    onAddMissing: (id) => console.log('Add missing:', id),
  },
};

export const SingleResult: Story = {
  args: {
    suggestions: [mockSuggestions[0]],
    onViewRecipe: (id) => console.log('View recipe:', id),
    onAddMissing: (id) => console.log('Add missing:', id),
  },
};

export const Empty: Story = {
  args: {
    suggestions: [],
    onViewRecipe: (id) => console.log('View recipe:', id),
    onAddMissing: (id) => console.log('Add missing:', id),
  },
};
