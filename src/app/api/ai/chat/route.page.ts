import { createClient } from '@supabase/supabase-js';
import { convertToModelMessages, stepCountIs, streamText, tool } from 'ai';
import type { UIMessage } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

import { resolveAiConfig } from '@/lib/ai-config.server';
import { matchRecipes } from '@/pages/recipes/api/recipe-matcher';
import type {
  FoodItem,
  QuantityUnit,
  RecipeDetail,
  RecipeDifficulty,
  RecipeSource,
  RecipeVisibility,
} from '@/api/types';

const DEFAULT_EXPIRING_DAYS = 7;
const MAX_EXPIRING_DAYS = 90;
const DEFAULT_MAX_RECIPES = 5;
const MAX_RECIPES = 10;
const MAX_TOOL_ROWS = 50;
const MAX_RECIPES_SCANNED = 100;
const MAX_TOOL_STEPS = 5;

const SYSTEM_PROMPT = `Bạn là trợ lý AI của ứng dụng quản lý thực phẩm (Food Inventory Manager), trả lời bằng tiếng Việt, giọng thân thiện và ngắn gọn.

Bạn được cung cấp dữ liệu thật từ kho thực phẩm của chính người dùng qua các tool:
- getExpiringItems: liệt kê thực phẩm sắp hết hạn. Tham số "days" là số ngày nhìn tới (mặc định 7).
- suggestRecipes: gợi ý món ăn khớp với nguyên liệu đang có trong kho. Tham số "maxResults" (mặc định 5).

Quy tắc bắt buộc:
- Khi người dùng hỏi về thực phẩm sắp hết hạn, tồn kho, hoặc gợi ý món ăn, LUÔN gọi tool phù hợp trước khi trả lời. Không bao giờ bịa dữ liệu.
- Khi trình bày kết quả getExpiringItems: nêu tên món, số lượng/đơn vị và số ngày còn lại.
- Khi trình bày suggestRecipes: nêu tên món, độ khớp (%) và nguyên liệu còn thiếu (nếu có).
- Nếu tool trả về danh sách rỗng, nói rõ là chưa có dữ liệu và gợi ý người dùng thêm thực phẩm vào kho.
- Trả lời ngắn gọn, dùng gạch đầu dòng khi liệt kê.`;

// ============================================================================
// Tool result shapes (mirrored by the chat page renderer)
// ============================================================================

interface ExpiringFoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string | null;
  storage: string | null;
  expirationDate: string;
  daysUntilExpiry: number;
}

interface ExpiringItemsToolResult {
  days: number;
  items: ExpiringFoodItem[];
}

interface SuggestedRecipe {
  recipeId: string;
  title: string;
  description: string | null;
  cookTimeMinutes: number;
  difficulty: string;
  matchPercentage: number;
  matchedIngredients: string[];
  missingIngredients: string[];
}

interface SuggestRecipesToolResult {
  totalRecipes: number;
  totalInventoryItems: number;
  recipes: SuggestedRecipe[];
}

// ============================================================================
// Database row shapes (subset of supabase/database/schema.md)
// ============================================================================

interface FoodItemRow {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiration_date: string | null;
  category: string | null;
  storage: string | null;
  created_at: string;
  updated_at: string;
}

interface RecipeRow {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  cook_time_minutes: number;
  prep_time_minutes: number | null;
  servings: number;
  difficulty: string;
  tags: string[] | null;
  visibility: string;
  source: string;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

interface RecipeIngredientRow {
  id: string;
  recipe_id: string;
  name: string;
  normalized_name: string;
  quantity: number | null;
  unit: string | null;
  optional: boolean;
  sort_order: number;
}

// ============================================================================
// Helpers
// ============================================================================

function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

function clampInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Local-time start of today, as YYYY-MM-DD. */
function todayDateOnly(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateOnly: string, days: number): string {
  const date = new Date(`${dateOnly}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysUntil(dateOnly: string): number {
  const expiry = new Date(`${dateOnly}T00:00:00`);
  const today = new Date(`${todayDateOnly()}T00:00:00`);
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function mapFoodItemRow(row: FoodItemRow): FoodItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? 'other',
    storage: row.storage ?? 'pantry',
    expiryDate: row.expiration_date,
    quantity: Number(row.quantity) || 0,
    unit: row.unit as QuantityUnit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRecipeRow(row: RecipeRow, ingredients: RecipeIngredientRow[]): RecipeDetail {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
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
    ingredients: ingredients
      .filter((ingredient) => ingredient.recipe_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((ingredient) => ({
        id: ingredient.id,
        recipeId: ingredient.recipe_id,
        name: ingredient.name,
        normalizedName: ingredient.normalized_name,
        quantity: ingredient.quantity ?? undefined,
        unit: ingredient.unit ?? undefined,
        optional: ingredient.optional,
        sortOrder: ingredient.sort_order,
      })),
    // The matcher only needs ingredients; steps are irrelevant for suggestions.
    steps: [],
  };
}

// ============================================================================
// Route handler
// ============================================================================

export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return jsonError(401, 'Missing or invalid Authorization header');
  }
  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    return jsonError(401, 'Missing or invalid Authorization header');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError(
      500,
      'Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  // Per-request client that carries the caller's JWT as the Authorization header.
  // Every tool query below runs through this client, so Supabase RLS scopes rows to
  // the authenticated user. The service-role key is never used here.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify the token against Supabase Auth before running any query.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    console.warn('AI chat auth failed:', authError?.message ?? 'no user for token');
    return jsonError(401, 'Invalid or expired access token');
  }

  // Resolve AI config: the user's personal settings first, then the server env key.
  const aiConfig = await resolveAiConfig(accessToken);
  if ('error' in aiConfig) {
    return jsonError(500, aiConfig.error);
  }

  let body: { messages?: unknown };
  try {
    body = (await request.json()) as { messages?: unknown };
  } catch {
    return jsonError(400, 'Invalid JSON in request body');
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError(400, 'Request body must contain a non-empty "messages" array');
  }

  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(body.messages as UIMessage[]);
  } catch (error) {
    return jsonError(
      400,
      `Invalid messages: ${error instanceof Error ? error.message : 'unknown error'}`,
    );
  }

  const tools = {
    getExpiringItems: tool({
      description:
        'Lấy danh sách thực phẩm trong kho của người dùng sắp hết hạn trong vòng "days" ngày tới (mặc định 7 ngày).',
      inputSchema: z.object({
        days: z
          .number()
          .int()
          .min(1)
          .max(MAX_EXPIRING_DAYS)
          .optional()
          .describe('Số ngày nhìn tới kể từ hôm nay (mặc định 7)'),
      }),
      execute: async ({ days }): Promise<ExpiringItemsToolResult> => {
        const lookAheadDays = clampInt(
          days,
          DEFAULT_EXPIRING_DAYS,
          1,
          MAX_EXPIRING_DAYS,
        );
        const horizon = addDays(todayDateOnly(), lookAheadDays);

        const { data, error } = await supabase
          .from('food_items')
          .select('id, name, quantity, unit, expiration_date, category, storage, created_at, updated_at')
          .eq('deleted', false)
          .eq('user_id', user.id)
          .not('expiration_date', 'is', null)
          .lte('expiration_date', horizon)
          .order('expiration_date', { ascending: true })
          .limit(MAX_TOOL_ROWS);

        if (error) {
          throw new Error(`Không truy vấn được thực phẩm: ${error.message}`);
        }

        const rows = (data ?? []) as FoodItemRow[];
        const items: ExpiringFoodItem[] = rows
          .filter((row): row is FoodItemRow & { expiration_date: string } =>
            Boolean(row.expiration_date),
          )
          .map((row) => ({
            id: row.id,
            name: row.name,
            quantity: Number(row.quantity) || 0,
            unit: row.unit,
            category: row.category,
            storage: row.storage,
            expirationDate: row.expiration_date,
            daysUntilExpiry: daysUntil(row.expiration_date),
          }));

        return { days: lookAheadDays, items };
      },
    }),

    suggestRecipes: tool({
      description:
        'Gợi ý các món ăn khớp nhất với nguyên liệu đang có trong kho của người dùng (ưu tiên nguyên liệu sắp hết hạn). Tham số "maxResults" là số món tối đa (mặc định 5).',
      inputSchema: z.object({
        maxResults: z
          .number()
          .int()
          .min(1)
          .max(MAX_RECIPES)
          .optional()
          .describe('Số món tối đa trả về (mặc định 5)'),
      }),
      execute: async ({ maxResults }): Promise<SuggestRecipesToolResult> => {
        const limit = clampInt(maxResults, DEFAULT_MAX_RECIPES, 1, MAX_RECIPES);

        const [inventoryResult, recipesResult, ingredientsResult] = await Promise.all([
          supabase
            .from('food_items')
            .select('*')
            .eq('deleted', false)
            .eq('user_id', user.id)
            .limit(MAX_TOOL_ROWS * 4),
          supabase
            .from('recipes')
            .select('*')
            .eq('deleted', false)
            .order('updated_at', { ascending: false })
            .limit(MAX_RECIPES_SCANNED),
          supabase.from('recipe_ingredients').select('*').limit(MAX_RECIPES_SCANNED * 20),
        ]);

        const queryError =
          inventoryResult.error ?? recipesResult.error ?? ingredientsResult.error;
        if (queryError) {
          throw new Error(`Không truy vấn được dữ liệu món ăn: ${queryError.message}`);
        }

        const inventory = ((inventoryResult.data ?? []) as FoodItemRow[]).map(
          mapFoodItemRow,
        );
        const ingredients = (ingredientsResult.data ?? []) as RecipeIngredientRow[];
        const recipes = ((recipesResult.data ?? []) as RecipeRow[]).map((row) =>
          mapRecipeRow(row, ingredients),
        );

        const ranked = matchRecipes(recipes, inventory).filter(
          (item) => item.suggestion.matchedIngredients.length > 0,
        );

        return {
          totalRecipes: recipes.length,
          totalInventoryItems: inventory.length,
          recipes: ranked.slice(0, limit).map((item) => ({
            recipeId: item.recipe.id,
            title: item.recipe.title,
            description: item.recipe.description ?? null,
            cookTimeMinutes: item.recipe.cookTimeMinutes,
            difficulty: item.recipe.difficulty,
            matchPercentage: item.suggestion.matchPercentage,
            matchedIngredients: item.suggestion.matchedIngredients.map(
              (ingredient) => ingredient.foodItemName,
            ),
            missingIngredients: item.suggestion.missingIngredients.map(
              (ingredient) => ingredient.name,
            ),
          })),
        };
      },
    }),
  };

  // Z.ai exposes an Anthropic-compatible Messages endpoint, so the same SDK
  // works with the resolved baseURL (only set for provider 'zai'); provider
  // 'anthropic' keeps the SDK default.
  const anthropic = createAnthropic({
    apiKey: aiConfig.apiKey,
    ...(aiConfig.baseURL ? { baseURL: aiConfig.baseURL } : {}),
  });

  const result = streamText({
    model: anthropic(aiConfig.model),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    // Allow tool call(s) + a final answer instead of stopping after one step.
    stopWhen: stepCountIs(MAX_TOOL_STEPS),
    onError: ({ error }) => {
      // Log the message only — never the request headers or tokens.
      console.error('AI chat stream error:', error);
    },
  });

  return result.toUIMessageStreamResponse();
}
