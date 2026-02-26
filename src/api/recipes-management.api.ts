import { getSupabaseClient } from '@/lib/supabaseClient';
import type {
  Recipe,
  RecipeDetail,
  RecipeIngredient,
  RecipeStep,
  CreateRecipeInput,
  UpdateRecipeInput,
  DbRecipe,
  DbRecipeIngredient,
  DbRecipeStep,
  RecipeDifficulty,
  RecipeVisibility,
  RecipeSource,
} from './types';

/**
 * Abstract API interface for recipe management.
 */
export interface IRecipesManagementApi {
  list(userId: string, options?: { search?: string; tags?: string[] }): Promise<Recipe[]>;
  getById(id: string, userId: string): Promise<RecipeDetail | null>;
  create(input: CreateRecipeInput, userId: string): Promise<RecipeDetail>;
  update(input: UpdateRecipeInput, userId: string): Promise<Recipe>;
  replaceIngredients(
    recipeId: string,
    ingredients: CreateRecipeInput['ingredients'],
    userId: string,
  ): Promise<RecipeIngredient[]>;
  replaceSteps(
    recipeId: string,
    steps: CreateRecipeInput['steps'],
    userId: string,
  ): Promise<RecipeStep[]>;
  duplicate(recipeId: string, userId: string): Promise<RecipeDetail>;
  delete(recipeId: string, userId: string): Promise<void>;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Normalize ingredient name for matching: lowercase, trim, collapse whitespace
 */
export function normalizeIngredientName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// ============================================================================
// Mapper functions: Convert between DB (snake_case) and Frontend (camelCase)
// ============================================================================

function mapDbToRecipe(row: DbRecipe): Recipe {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    cookTimeMinutes: row.cook_time_minutes,
    prepTimeMinutes: row.prep_time_minutes ?? undefined,
    servings: row.servings,
    difficulty: row.difficulty as RecipeDifficulty,
    tags: row.tags ?? [],
    visibility: row.visibility as RecipeVisibility,
    source: row.source as RecipeSource,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: row.deleted,
  };
}

function mapDbToIngredient(row: DbRecipeIngredient): RecipeIngredient {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    name: row.name,
    normalizedName: row.normalized_name,
    quantity: row.quantity ?? undefined,
    unit: row.unit ?? undefined,
    optional: row.optional,
    sortOrder: row.sort_order,
  };
}

function mapDbToStep(row: DbRecipeStep): RecipeStep {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    stepNumber: row.step_number,
    instruction: row.instruction,
    estimatedMinutes: row.estimated_minutes ?? undefined,
  };
}

function mapCreateRecipeToDb(
  input: CreateRecipeInput,
  userId: string,
): Omit<DbRecipe, 'id' | 'created_at' | 'updated_at' | 'last_modified' | 'deleted' | 'synced'> {
  return {
    user_id: userId,
    title: input.title,
    description: input.description ?? null,
    image_url: input.imageUrl ?? null,
    cook_time_minutes: input.cookTimeMinutes,
    prep_time_minutes: input.prepTimeMinutes ?? null,
    servings: input.servings,
    difficulty: input.difficulty,
    tags: input.tags ?? [],
    visibility: input.visibility ?? 'private',
    source: 'user',
  };
}

function mapUpdateRecipeToDb(input: UpdateRecipeInput): Partial<DbRecipe> {
  const dbRow: Partial<DbRecipe> = {
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  };

  if (input.title !== undefined) dbRow.title = input.title;
  if (input.description !== undefined) dbRow.description = input.description ?? null;
  if (input.imageUrl !== undefined) dbRow.image_url = input.imageUrl ?? null;
  if (input.cookTimeMinutes !== undefined) dbRow.cook_time_minutes = input.cookTimeMinutes;
  if (input.prepTimeMinutes !== undefined) dbRow.prep_time_minutes = input.prepTimeMinutes ?? null;
  if (input.servings !== undefined) dbRow.servings = input.servings;
  if (input.difficulty !== undefined) dbRow.difficulty = input.difficulty;
  if (input.tags !== undefined) dbRow.tags = input.tags;
  if (input.visibility !== undefined) dbRow.visibility = input.visibility;

  return dbRow;
}

// ============================================================================
// Supabase API Implementation
// ============================================================================

export const supabaseRecipesManagementApi: IRecipesManagementApi = {
  async list(userId: string, options?: { search?: string; tags?: string[] }): Promise<Recipe[]> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('recipes')
      .select('*')
      .eq('deleted', false)
      .or(`user_id.eq.${userId},source.eq.system`)
      .order('updated_at', { ascending: false });

    if (options?.search) {
      query = query.ilike('title', `%${options.search}%`);
    }

    if (options?.tags?.length) {
      query = query.overlaps('tags', options.tags);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Recipes list error:', error);
      throw new Error(error.message);
    }

    return (data as DbRecipe[]).map(mapDbToRecipe);
  },

  async getById(id: string, userId: string): Promise<RecipeDetail | null> {
    const supabase = getSupabaseClient();

    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('deleted', false)
      .or(`user_id.eq.${userId},source.eq.system`)
      .single();

    if (recipeError) {
      if (recipeError.code === 'PGRST116') return null;
      console.error('Recipe getById error:', recipeError);
      throw new Error(recipeError.message);
    }

    if (!recipeData) return null;

    // Fetch ingredients and steps in parallel
    const [ingredientsResult, stepsResult] = await Promise.all([
      supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('recipe_steps')
        .select('*')
        .eq('recipe_id', id)
        .order('step_number', { ascending: true }),
    ]);

    if (ingredientsResult.error) {
      console.error('Recipe ingredients fetch error:', ingredientsResult.error);
      throw new Error(ingredientsResult.error.message);
    }

    if (stepsResult.error) {
      console.error('Recipe steps fetch error:', stepsResult.error);
      throw new Error(stepsResult.error.message);
    }

    const recipe = mapDbToRecipe(recipeData as DbRecipe);
    return {
      ...recipe,
      ingredients: (ingredientsResult.data as DbRecipeIngredient[]).map(mapDbToIngredient),
      steps: (stepsResult.data as DbRecipeStep[]).map(mapDbToStep),
    };
  },

  async create(input: CreateRecipeInput, userId: string): Promise<RecipeDetail> {
    const supabase = getSupabaseClient();

    // 1. Insert recipe
    const dbRecipe = mapCreateRecipeToDb(input, userId);
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert(dbRecipe)
      .select()
      .single();

    if (recipeError) {
      console.error('Recipe create error:', recipeError);
      throw new Error(recipeError.message);
    }

    const recipeId = (recipeData as DbRecipe).id;

    // 2. Insert ingredients
    const ingredientRows = input.ingredients.map((ing, i) => ({
      recipe_id: recipeId,
      name: ing.name,
      normalized_name: normalizeIngredientName(ing.name),
      quantity: ing.quantity ?? null,
      unit: ing.unit ?? null,
      optional: ing.optional ?? false,
      sort_order: i,
    }));

    let ingredients: RecipeIngredient[] = [];
    if (ingredientRows.length > 0) {
      const { data: ingData, error: ingError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientRows)
        .select();

      if (ingError) {
        console.error('Recipe ingredients create error:', ingError);
        throw new Error(ingError.message);
      }
      ingredients = (ingData as DbRecipeIngredient[]).map(mapDbToIngredient);
    }

    // 3. Insert steps
    const stepRows = input.steps.map((step, i) => ({
      recipe_id: recipeId,
      step_number: i + 1,
      instruction: step.instruction,
      estimated_minutes: step.estimatedMinutes ?? null,
    }));

    let steps: RecipeStep[] = [];
    if (stepRows.length > 0) {
      const { data: stepData, error: stepError } = await supabase
        .from('recipe_steps')
        .insert(stepRows)
        .select();

      if (stepError) {
        console.error('Recipe steps create error:', stepError);
        throw new Error(stepError.message);
      }
      steps = (stepData as DbRecipeStep[]).map(mapDbToStep);
    }

    const recipe = mapDbToRecipe(recipeData as DbRecipe);
    return { ...recipe, ingredients, steps };
  },

  async update(input: UpdateRecipeInput, userId: string): Promise<Recipe> {
    const supabase = getSupabaseClient();

    const dbRow = mapUpdateRecipeToDb(input);

    const { data, error } = await supabase
      .from('recipes')
      .update(dbRow)
      .eq('id', input.id)
      .eq('user_id', userId)
      .eq('source', 'user')
      .eq('deleted', false)
      .select()
      .single();

    if (error) {
      console.error('Recipe update error:', error);
      throw new Error(error.message);
    }

    return mapDbToRecipe(data as DbRecipe);
  },

  async replaceIngredients(
    recipeId: string,
    ingredients: CreateRecipeInput['ingredients'],
    userId: string,
  ): Promise<RecipeIngredient[]> {
    void userId;
    const supabase = getSupabaseClient();

    // Delete existing ingredients
    const { error: deleteError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) {
      console.error('Delete ingredients error:', deleteError);
      throw new Error(deleteError.message);
    }

    if (ingredients.length === 0) return [];

    // Insert new ingredients
    const rows = ingredients.map((ing, i) => ({
      recipe_id: recipeId,
      name: ing.name,
      normalized_name: normalizeIngredientName(ing.name),
      quantity: ing.quantity ?? null,
      unit: ing.unit ?? null,
      optional: ing.optional ?? false,
      sort_order: i,
    }));

    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert(rows)
      .select();

    if (error) {
      console.error('Replace ingredients error:', error);
      throw new Error(error.message);
    }

    return (data as DbRecipeIngredient[]).map(mapDbToIngredient);
  },

  async replaceSteps(
    recipeId: string,
    steps: CreateRecipeInput['steps'],
    userId: string,
  ): Promise<RecipeStep[]> {
    void userId;
    const supabase = getSupabaseClient();

    // Delete existing steps
    const { error: deleteError } = await supabase
      .from('recipe_steps')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) {
      console.error('Delete steps error:', deleteError);
      throw new Error(deleteError.message);
    }

    if (steps.length === 0) return [];

    // Insert new steps
    const rows = steps.map((step, i) => ({
      recipe_id: recipeId,
      step_number: i + 1,
      instruction: step.instruction,
      estimated_minutes: step.estimatedMinutes ?? null,
    }));

    const { data, error } = await supabase
      .from('recipe_steps')
      .insert(rows)
      .select();

    if (error) {
      console.error('Replace steps error:', error);
      throw new Error(error.message);
    }

    return (data as DbRecipeStep[]).map(mapDbToStep);
  },

  async duplicate(recipeId: string, userId: string): Promise<RecipeDetail> {
    // Fetch original recipe
    const original = await this.getById(recipeId, userId);
    if (!original) throw new Error(`Recipe ${recipeId} not found`);

    // Create duplicate
    return this.create(
      {
        title: `[Copy] ${original.title}`,
        description: original.description,
        imageUrl: original.imageUrl,
        cookTimeMinutes: original.cookTimeMinutes,
        prepTimeMinutes: original.prepTimeMinutes,
        servings: original.servings,
        difficulty: original.difficulty,
        tags: original.tags,
        visibility: original.visibility,
        ingredients: original.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          optional: ing.optional,
        })),
        steps: original.steps.map((step) => ({
          instruction: step.instruction,
          estimatedMinutes: step.estimatedMinutes,
        })),
      },
      userId,
    );
  },

  async delete(recipeId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('recipes')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      })
      .eq('id', recipeId)
      .eq('user_id', userId)
      .eq('source', 'user');

    if (error) {
      console.error('Recipe delete error:', error);
      throw new Error(error.message);
    }
  },
};

// ============================================================================
// Mock Implementation (for development/testing)
// ============================================================================

const RECIPES_STORAGE_KEY = 'recipe-management-items';
const INGREDIENTS_STORAGE_KEY = 'recipe-management-ingredients';
const STEPS_STORAGE_KEY = 'recipe-management-steps';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStoredRecipes(): Recipe[] {
  try {
    const stored = localStorage.getItem(RECIPES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecipes(recipes: Recipe[]): void {
  localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
}

function getStoredIngredients(): RecipeIngredient[] {
  try {
    const stored = localStorage.getItem(INGREDIENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveIngredients(ingredients: RecipeIngredient[]): void {
  localStorage.setItem(INGREDIENTS_STORAGE_KEY, JSON.stringify(ingredients));
}

function getStoredSteps(): RecipeStep[] {
  try {
    const stored = localStorage.getItem(STEPS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSteps(steps: RecipeStep[]): void {
  localStorage.setItem(STEPS_STORAGE_KEY, JSON.stringify(steps));
}

export const mockRecipesManagementApi: IRecipesManagementApi = {
  async list(userId: string, options?: { search?: string; tags?: string[] }): Promise<Recipe[]> {
    void userId;
    await delay();
    let recipes = getStoredRecipes().filter((r) => !r.deleted);

    if (options?.search) {
      const search = options.search.toLowerCase();
      recipes = recipes.filter((r) => r.title.toLowerCase().includes(search));
    }

    if (options?.tags?.length) {
      recipes = recipes.filter((r) =>
        options.tags!.some((tag) => r.tags.includes(tag)),
      );
    }

    return recipes.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },

  async getById(id: string, userId: string): Promise<RecipeDetail | null> {
    void userId;
    await delay();
    const recipe = getStoredRecipes().find((r) => r.id === id && !r.deleted);
    if (!recipe) return null;

    const ingredients = getStoredIngredients()
      .filter((i) => i.recipeId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const steps = getStoredSteps()
      .filter((s) => s.recipeId === id)
      .sort((a, b) => a.stepNumber - b.stepNumber);

    return { ...recipe, ingredients, steps };
  },

  async create(input: CreateRecipeInput, userId: string): Promise<RecipeDetail> {
    await delay();
    const now = new Date().toISOString();
    const recipeId = generateId();

    const recipe: Recipe = {
      id: recipeId,
      userId,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      cookTimeMinutes: input.cookTimeMinutes,
      prepTimeMinutes: input.prepTimeMinutes,
      servings: input.servings,
      difficulty: input.difficulty,
      tags: input.tags ?? [],
      visibility: input.visibility ?? 'private',
      source: 'user',
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };

    const recipes = getStoredRecipes();
    recipes.push(recipe);
    saveRecipes(recipes);

    // Create ingredients
    const newIngredients: RecipeIngredient[] = input.ingredients.map((ing, i) => ({
      id: generateId(),
      recipeId,
      name: ing.name,
      normalizedName: normalizeIngredientName(ing.name),
      quantity: ing.quantity,
      unit: ing.unit,
      optional: ing.optional ?? false,
      sortOrder: i,
    }));

    const allIngredients = getStoredIngredients();
    allIngredients.push(...newIngredients);
    saveIngredients(allIngredients);

    // Create steps
    const newSteps: RecipeStep[] = input.steps.map((step, i) => ({
      id: generateId(),
      recipeId,
      stepNumber: i + 1,
      instruction: step.instruction,
      estimatedMinutes: step.estimatedMinutes,
    }));

    const allSteps = getStoredSteps();
    allSteps.push(...newSteps);
    saveSteps(allSteps);

    return { ...recipe, ingredients: newIngredients, steps: newSteps };
  },

  async update(input: UpdateRecipeInput, userId: string): Promise<Recipe> {
    void userId;
    await delay();
    const recipes = getStoredRecipes();
    const index = recipes.findIndex((r) => r.id === input.id && !r.deleted);

    if (index === -1) throw new Error(`Recipe with id ${input.id} not found`);

    const updated: Recipe = {
      ...recipes[index],
      ...Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined),
      ),
      updatedAt: new Date().toISOString(),
    };

    recipes[index] = updated;
    saveRecipes(recipes);
    return updated;
  },

  async replaceIngredients(
    recipeId: string,
    ingredients: CreateRecipeInput['ingredients'],
    userId: string,
  ): Promise<RecipeIngredient[]> {
    void userId;
    await delay();
    const allIngredients = getStoredIngredients().filter((i) => i.recipeId !== recipeId);

    const newIngredients: RecipeIngredient[] = ingredients.map((ing, i) => ({
      id: generateId(),
      recipeId,
      name: ing.name,
      normalizedName: normalizeIngredientName(ing.name),
      quantity: ing.quantity,
      unit: ing.unit,
      optional: ing.optional ?? false,
      sortOrder: i,
    }));

    allIngredients.push(...newIngredients);
    saveIngredients(allIngredients);
    return newIngredients;
  },

  async replaceSteps(
    recipeId: string,
    steps: CreateRecipeInput['steps'],
    userId: string,
  ): Promise<RecipeStep[]> {
    void userId;
    await delay();
    const allSteps = getStoredSteps().filter((s) => s.recipeId !== recipeId);

    const newSteps: RecipeStep[] = steps.map((step, i) => ({
      id: generateId(),
      recipeId,
      stepNumber: i + 1,
      instruction: step.instruction,
      estimatedMinutes: step.estimatedMinutes,
    }));

    allSteps.push(...newSteps);
    saveSteps(allSteps);
    return newSteps;
  },

  async duplicate(recipeId: string, userId: string): Promise<RecipeDetail> {
    const original = await this.getById(recipeId, userId);
    if (!original) throw new Error(`Recipe ${recipeId} not found`);

    return this.create(
      {
        title: `[Copy] ${original.title}`,
        description: original.description,
        imageUrl: original.imageUrl,
        cookTimeMinutes: original.cookTimeMinutes,
        prepTimeMinutes: original.prepTimeMinutes,
        servings: original.servings,
        difficulty: original.difficulty,
        tags: original.tags,
        visibility: original.visibility,
        ingredients: original.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          optional: ing.optional,
        })),
        steps: original.steps.map((step) => ({
          instruction: step.instruction,
          estimatedMinutes: step.estimatedMinutes,
        })),
      },
      userId,
    );
  },

  async delete(recipeId: string, userId: string): Promise<void> {
    void userId;
    await delay();
    const recipes = getStoredRecipes();
    const index = recipes.findIndex((r) => r.id === recipeId);
    if (index === -1) throw new Error(`Recipe with id ${recipeId} not found`);

    recipes[index] = {
      ...recipes[index],
      deleted: true,
      updatedAt: new Date().toISOString(),
    };
    saveRecipes(recipes);
  },
};

// ============================================================================
// Export active implementation
// ============================================================================

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const recipesManagementApi: IRecipesManagementApi = USE_MOCK_API
  ? mockRecipesManagementApi
  : supabaseRecipesManagementApi;
