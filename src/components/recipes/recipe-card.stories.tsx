import type { Meta, StoryObj } from '@storybook/react';
import { RecipeCard } from './recipe-card';

const meta: Meta<typeof RecipeCard> = {
  title: 'Recipes/RecipeCard',
  component: RecipeCard,
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
    title: 'Chicken Stir Fry',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    cookTime: '25 min',
    difficulty: 'Medium',
    matchPercentage: 60,
  },
};

export const Featured: Story = {
  args: {
    title: 'Creamy Spinach Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    cookTime: '15 min',
    difficulty: 'Easy',
    matchPercentage: 80,
    matchedIngredients: 4,
    totalIngredients: 5,
    useIngredients: ['Spinach (Expiring)', 'Cream', 'Pasta', 'Onion'],
    missingIngredients: ['Garlic'],
    featured: true,
    featureLabel: 'Use Spinach',
  },
};

export const HighMatch: Story = {
  args: {
    title: 'Vegetable Soup',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    cookTime: '30 min',
    difficulty: 'Easy',
    matchPercentage: 90,
    matchedIngredients: 9,
    totalIngredients: 10,
  },
};

export const LowMatch: Story = {
  args: {
    title: 'Beef Wellington',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    cookTime: '2 hours',
    difficulty: 'Hard',
    matchPercentage: 30,
  },
};

export const WithMissingIngredients: Story = {
  args: {
    title: 'Chicken Stir Fry',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    cookTime: '25 min',
    difficulty: 'Medium',
    matchPercentage: 60,
    useIngredients: ['Chicken Breast', 'Bell Peppers'],
    missingIngredients: ['Soy Sauce', 'Ginger'],
    onAddMissing: () => alert('Adding missing ingredients!'),
  },
};

export const NoActions: Story = {
  args: {
    title: 'Quick Salad',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    cookTime: '10 min',
    difficulty: 'Easy',
    matchPercentage: 100,
    showActions: false,
  },
};

export const RecipeList: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <RecipeCard
        title="Creamy Spinach Pasta"
        imageUrl="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400"
        cookTime="15 min"
        difficulty="Easy"
        matchPercentage={80}
        matchedIngredients={4}
        totalIngredients={5}
        useIngredients={['Spinach (Expiring)', 'Cream', 'Pasta', 'Onion']}
        missingIngredients={['Garlic']}
        featured
        featureLabel="Use Spinach"
      />
      <RecipeCard
        title="Chicken Stir Fry"
        imageUrl="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400"
        cookTime="25 min"
        difficulty="Medium"
        matchPercentage={60}
      />
      <RecipeCard
        title="Spicy Chickpea Curry"
        imageUrl="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400"
        cookTime="40 min"
        difficulty="Medium"
        matchPercentage={45}
      />
    </div>
  ),
};
