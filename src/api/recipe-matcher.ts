import type {
  FoodItem,
  RecipeDetail,
  RecipeSuggestion,
  RecipeSuggestionItem,
  MatchedIngredient,
  MissingIngredient,
} from './types';
import { getDaysUntilExpiry, getExpiryStatus } from './types';

// ============================================================================
// Ingredient Normalization
// ============================================================================

/**
 * Alias map for common ingredient synonyms.
 * Keys should already be normalized (lowercase, trimmed).
 */
const INGREDIENT_ALIASES: Record<string, string> = {
  'scallions': 'green onion',
  'scallion': 'green onion',
  'spring onion': 'green onion',
  'spring onions': 'green onion',
  'bell peppers': 'bell pepper',
  'capsicum': 'bell pepper',
  'capsicums': 'bell pepper',
  'coriander': 'cilantro',
  'coriander leaves': 'cilantro',
  'prawns': 'shrimp',
  'prawn': 'shrimp',
  'aubergine': 'eggplant',
  'courgette': 'zucchini',
  'courgettes': 'zucchini',
  'rocket': 'arugula',
  'cornstarch': 'corn starch',
  'double cream': 'heavy cream',
  'whipping cream': 'heavy cream',
  'whole milk': 'milk',
  'skim milk': 'milk',
  'parmigiano': 'parmesan cheese',
  'parmigiano reggiano': 'parmesan cheese',
  'parmesan': 'parmesan cheese',
  'plain flour': 'flour',
  'all purpose flour': 'flour',
  'all-purpose flour': 'flour',
  'eggs': 'egg',
  'bananas': 'banana',
  'tomatoes': 'tomato',
  'onions': 'onion',
  'lemons': 'lemon',
  'limes': 'lime',
  'chickpeas': 'chickpea',
  'olives': 'olive',
  'peas': 'pea',
  'cucumbers': 'cucumber',
  'potatoes': 'potato',
  'carrots': 'carrot',
  'apples': 'apple',
  'oranges': 'orange',
  'garlic cloves': 'garlic',
  'garlic clove': 'garlic',
};

/**
 * Common plural → singular suffix rules for food terms.
 */
const PLURAL_RULES: Array<[RegExp, string]> = [
  [/ies$/i, 'y'],       // berries → berry
  [/ves$/i, 'f'],       // halves → half
  [/oes$/i, 'o'],       // tomatoes → tomato (but handled by alias)
  [/ses$/i, 'se'],      // cheeses → cheese
  [/s$/i, ''],          // generic plural strip
];

/**
 * Singularize a word using simple suffix rules.
 */
function singularize(word: string): string {
  // Don't singularize short words (3 chars or less)
  if (word.length <= 3) return word;

  for (const [pattern, replacement] of PLURAL_RULES) {
    if (pattern.test(word)) {
      return word.replace(pattern, replacement);
    }
  }
  return word;
}

/**
 * Normalize an ingredient name for matching:
 * 1. Lowercase + trim
 * 2. Remove punctuation and extra spaces
 * 3. Apply alias map
 * 4. Singularize common plural forms
 */
export function normalizeForMatching(name: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove punctuation except hyphens
    .replace(/\s+/g, ' ')     // Collapse whitespace
    .trim();

  // Check alias map first (before singularization)
  if (INGREDIENT_ALIASES[normalized]) {
    return INGREDIENT_ALIASES[normalized];
  }

  // Try singularize and check alias again
  const words = normalized.split(' ');
  const singularized = words.map(singularize).join(' ');

  if (INGREDIENT_ALIASES[singularized]) {
    return INGREDIENT_ALIASES[singularized];
  }

  return singularized;
}

// ============================================================================
// Matching Logic
// ============================================================================

/**
 * Check if a food item name matches a recipe ingredient (normalized).
 * Uses fuzzy substring matching after normalization.
 */
function isMatch(foodItemName: string, recipeIngNormalizedName: string): boolean {
  const normalizedFood = normalizeForMatching(foodItemName);
  const normalizedRecipe = normalizeForMatching(recipeIngNormalizedName);

  // Exact match
  if (normalizedFood === normalizedRecipe) return true;

  // One contains the other (e.g., "chicken breast" contains "chicken")
  if (normalizedFood.includes(normalizedRecipe)) return true;
  if (normalizedRecipe.includes(normalizedFood)) return true;

  // Word-level match: all words in one appear in the other
  const foodWords = normalizedFood.split(' ');
  const recipeWords = normalizedRecipe.split(' ');

  // Check if any significant recipe word is in food words
  const significantRecipeWords = recipeWords.filter((w) => w.length > 2);
  if (
    significantRecipeWords.length > 0 &&
    significantRecipeWords.every((w) => foodWords.some((fw) => fw.includes(w) || w.includes(fw)))
  ) {
    return true;
  }

  return false;
}

function getExpiryUrgencyWeight(expiryDate: string | null): number {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

  if (daysUntilExpiry === null) return 0;
  if (daysUntilExpiry <= 0) return 1;
  if (daysUntilExpiry === 1) return 0.95;
  if (daysUntilExpiry <= 3) return 0.8;
  if (daysUntilExpiry <= 7) return 0.35;

  return 0;
}

/**
 * Match a single recipe against inventory and return a RecipeSuggestion.
 */
function matchSingleRecipe(
  recipe: RecipeDetail,
  inventory: FoodItem[],
): RecipeSuggestion {
  const requiredIngredients = recipe.ingredients.filter((ing) => !ing.optional);
  const matchedIngredients: MatchedIngredient[] = [];
  const missingIngredients: MissingIngredient[] = [];
  const expiringIngredientsUsed: string[] = [];

  for (const recipeIng of requiredIngredients) {
    const matchedItem = inventory.find((item) =>
      isMatch(item.name, recipeIng.normalizedName),
    );

    if (matchedItem) {
      matchedIngredients.push({
        recipeIngredientId: recipeIng.id,
        recipeIngredientName: recipeIng.name,
        foodItemId: matchedItem.id,
        foodItemName: matchedItem.name,
        quantitySufficient: true, // MVP: assume sufficient if present
      });

      // Track expiring ingredients
      const status = getExpiryStatus(matchedItem.expiryDate);
      if (status === 'expiring' || status === 'soon') {
        expiringIngredientsUsed.push(matchedItem.id);
      }
    } else {
      missingIngredients.push({
        recipeIngredientId: recipeIng.id,
        name: recipeIng.name,
        quantity: recipeIng.quantity,
        unit: recipeIng.unit,
      });
    }
  }

  // Coverage score (70% weight)
  const requiredTotal = requiredIngredients.length;
  const coverageRatio = requiredTotal > 0 ? matchedIngredients.length / requiredTotal : 0;

  // Expiry bonus (20% weight) — ratio of expiring items used vs available expiring items
  const expiringItemsInInventory = inventory.filter(
    (item) => getExpiryUrgencyWeight(item.expiryDate) > 0,
  );
  const totalExpiryUrgency = expiringItemsInInventory.reduce(
    (sum, item) => sum + getExpiryUrgencyWeight(item.expiryDate),
    0,
  );
  const matchedExpiryUrgency = matchedIngredients.reduce((sum, ingredient) => {
    const matchedItem = inventory.find((item) => item.id === ingredient.foodItemId);
    return sum + getExpiryUrgencyWeight(matchedItem?.expiryDate ?? null);
  }, 0);
  const expiringUsageRatio =
    totalExpiryUrgency > 0
      ? matchedExpiryUrgency / totalExpiryUrgency
      : 0;

  // Time bonus (10% weight) — reward shorter cook time (under 30 min)
  const quickCookBonus = recipe.cookTimeMinutes <= 30 ? 1 : 0.5;

  const score = coverageRatio * 70 + expiringUsageRatio * 20 + quickCookBonus * 10;

  return {
    recipeId: recipe.id,
    matchPercentage: Math.round(Math.min(score, 100)),
    matchedIngredients,
    missingIngredients,
    expiringIngredientsUsed,
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Match all recipes against the user's inventory and return sorted suggestions.
 *
 * Sorting:
 * 1. matchPercentage descending
 * 2. expiring ingredients used descending
 * 3. cookTimeMinutes ascending
 * 4. title ascending (stable tie-break)
 */
export function matchRecipes(
  recipes: RecipeDetail[],
  inventory: FoodItem[],
): RecipeSuggestionItem[] {
  const results: RecipeSuggestionItem[] = recipes.map((recipe) => ({
    recipe,
    suggestion: matchSingleRecipe(recipe, inventory),
  }));

  // Sort by scoring criteria
  results.sort((a, b) => {
    // 1. matchPercentage descending
    const scoreDiff = b.suggestion.matchPercentage - a.suggestion.matchPercentage;
    if (scoreDiff !== 0) return scoreDiff;

    // 2. expiring ingredients used descending
    const expiryDiff =
      b.suggestion.expiringIngredientsUsed.length -
      a.suggestion.expiringIngredientsUsed.length;
    if (expiryDiff !== 0) return expiryDiff;

    // 3. cookTimeMinutes ascending
    const timeDiff = a.recipe.cookTimeMinutes - b.recipe.cookTimeMinutes;
    if (timeDiff !== 0) return timeDiff;

    // 4. title ascending (stable tie-break)
    return a.recipe.title.localeCompare(b.recipe.title);
  });

  return results;
}

/**
 * Get the "best expiring ingredient" for the hero message.
 * Returns the name of the inventory item expiring soonest that is used in any recipe.
 */
export function getTopExpiringIngredient(
  suggestions: RecipeSuggestionItem[],
  inventory: FoodItem[],
): { name: string; daysLeft: number; recipesCount: number } | null {
  // Find the soonest-expiring item in inventory
  const expiringItems = inventory
    .filter((item) => {
      const status = getExpiryStatus(item.expiryDate);
      return status === 'expiring' || status === 'soon';
    })
    .sort((a, b) => {
      if (!a.expiryDate || !b.expiryDate) return 0;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });

  if (expiringItems.length === 0) return null;

  const topItem = expiringItems[0];

  // Count recipes that use this item
  const recipesUsingItem = suggestions.filter((s) =>
    s.suggestion.expiringIngredientsUsed.includes(topItem.id),
  ).length;

  if (recipesUsingItem === 0) return null;

  const now = new Date();
  const expiry = topItem.expiryDate ? new Date(topItem.expiryDate) : now;
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    name: topItem.name,
    daysLeft: Math.max(0, daysLeft),
    recipesCount: recipesUsingItem,
  };
}
