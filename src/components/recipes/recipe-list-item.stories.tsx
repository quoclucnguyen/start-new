import type { Meta, StoryObj } from '@storybook/react';
import { RecipeListItem } from './recipe-list-item';
import type { Recipe } from '@/api/types';

const sampleRecipe: Recipe = {
  id: '1',
  userId: 'user-1',
  title: 'Creamy Spinach Pasta',
  description: 'A quick and delicious weeknight pasta dish with fresh spinach and cream.',
  imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
  cookTimeMinutes: 15,
  prepTimeMinutes: 5,
  servings: 2,
  difficulty: 'easy',
  tags: ['italian', 'quick', 'vegetarian'],
  visibility: 'private',
  source: 'user',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-20T00:00:00Z',
  deleted: false,
};

const meta: Meta<typeof RecipeListItem> = {
  title: 'Recipes/RecipeListItem',
  component: RecipeListItem,
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
    recipe: sampleRecipe,
    onEdit: (id) => console.log('Edit', id),
    onDuplicate: (id) => console.log('Duplicate', id),
    onDelete: (id) => console.log('Delete', id),
  },
};

export const SystemRecipe: Story = {
  args: {
    recipe: {
      ...sampleRecipe,
      id: '2',
      source: 'system',
      userId: null,
      title: 'Classic Tomato Soup',
      description: 'A warming tomato soup perfect for cold days.',
      difficulty: 'easy',
      tags: ['soup', 'comfort-food'],
    },
    onDuplicate: (id) => console.log('Duplicate', id),
  },
};

export const NoImage: Story = {
  args: {
    recipe: {
      ...sampleRecipe,
      id: '3',
      imageUrl: undefined,
      title: 'Simple Fried Rice',
      difficulty: 'medium',
      tags: ['asian', 'quick'],
    },
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
  },
};

export const HardRecipe: Story = {
  args: {
    recipe: {
      ...sampleRecipe,
      id: '4',
      title: 'Beef Wellington',
      difficulty: 'hard',
      cookTimeMinutes: 120,
      prepTimeMinutes: 45,
      servings: 4,
      tags: ['british', 'special-occasion', 'beef', 'advanced'],
    },
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
  },
};
