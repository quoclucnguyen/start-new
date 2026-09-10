import { createClient } from '@supabase/supabase-js';
import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

import { resolveAiConfig } from '@/lib/ai-config.server';

/** Reject request bodies whose image data URL exceeds ~4.5MB. */
const MAX_IMAGE_DATA_URL_LENGTH = 4_500_000;

/** Only base64 JPEG/PNG data URLs are accepted. */
const IMAGE_DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png);base64,/;

// ============================================================================
// Structured output schema
// ============================================================================

const visionItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(0).nullable(),
  unit: z.string().min(1).nullable(),
  category: z.string().min(1).nullable(),
  storage: z.string().min(1).nullable(),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  barcode: z.string().min(1).nullable(),
  confidence: z.enum(['high', 'medium', 'low']),
});

const visionResultSchema = z.object({
  items: z.array(visionItemSchema),
  notes: z.string().nullable(),
});

// ============================================================================
// Helpers
// ============================================================================

function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
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

function buildVisionPrompt(
  categoryNames: string[],
  storageNames: string[],
): string {
  const categoryList =
    categoryNames.length > 0
      ? categoryNames.join(', ')
      : '(danh sách trống — hãy để category là null)';
  const storageList =
    storageNames.length > 0
      ? storageNames.join(', ')
      : '(danh sách trống — hãy để storage là null)';

  return `Hôm nay là ${todayDateOnly()} (định dạng YYYY-MM-DD).

Hãy trích xuất danh sách thực phẩm xuất hiện trong ảnh. Ảnh có thể là chụp tủ lạnh/tủ bếp, hoá đơn mua sắm, nhãn sản phẩm... Một ảnh có thể chứa nhiều món; hãy liệt kê TẤT CẢ các món nhận diện được.

Quy tắc bắt buộc:
- name: tên món bằng tiếng Việt tự nhiên (ví dụ: "Sữa tươi Vinamilk", "Cà chua", "Trứng gà").
- quantity và unit: chỉ điền khi nhận ra rõ ràng trên ảnh (số lượng, khối lượng, dung tích...); nếu không chắc thì để null.
- expirationDate: CHỈ điền (định dạng YYYY-MM-DD) khi nhìn thấy rõ ngày hết hạn / hạn sử dụng / HSD / EXP trên ảnh. Tuyệt đối KHÔNG tự đoán, suy luận hoặc tính toán ngày hết hạn từ ngày sản xuất; nếu không nhìn thấy rõ thì để null.
- category: phải chọn MỘT giá trị đúng nguyên văn trong danh sách sau: [${categoryList}]. Nếu không có danh mục phù hợp thì để null. Không được bịa tên danh mục khác.
- storage: phải chọn MỘT giá trị đúng nguyên văn trong danh sách sau: [${storageList}]. Nếu không có nơi lưu trữ phù hợp thì để null. Không được bịa tên nơi lưu trữ khác.
- barcode: chỉ điền khi nhìn thấy rõ mã vạch / EAN / UPC trên ảnh; nếu không thì null.
- confidence: mức độ chắc chắn khi nhận diện từng món ("high", "medium" hoặc "low").
- notes: ghi chú tổng thể về các món chưa rõ, bị mờ hoặc không nhận diện được; nếu không có thì null.`;
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
  // Same RLS-scoped pattern as the AI chat route; the service-role key is never
  // used here.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify the token against Supabase Auth before doing anything else.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    console.warn('AI vision auth failed:', authError?.message ?? 'no user for token');
    return jsonError(401, 'Invalid or expired access token');
  }

  // Resolve AI config: the user's personal settings first, then the server env key.
  const aiConfig = await resolveAiConfig(accessToken);
  if ('error' in aiConfig) {
    return jsonError(500, aiConfig.error);
  }

  let body: { imageDataUrl?: unknown };
  try {
    body = (await request.json()) as { imageDataUrl?: unknown };
  } catch {
    return jsonError(400, 'Invalid JSON in request body');
  }

  const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';
  if (!IMAGE_DATA_URL_PATTERN.test(imageDataUrl)) {
    return jsonError(
      400,
      'imageDataUrl must be a base64 data URL of a JPEG or PNG image',
    );
  }
  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return jsonError(400, 'Image is too large. Maximum size is about 4.5MB.');
  }

  // Category/storage names come from the caller's RLS-scoped config tables so
  // the model can only pick names that exist in the user's app (never invent them).
  const [categoriesResult, storageLocationsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('name')
      .order('sort_order', { ascending: true }),
    supabase
      .from('storage_locations')
      .select('name')
      .order('sort_order', { ascending: true }),
  ]);

  const configError = categoriesResult.error ?? storageLocationsResult.error;
  if (configError) {
    console.error('AI vision config query failed:', configError.message);
    return jsonError(500, 'Không lấy được danh mục/nơi lưu trữ. Vui lòng thử lại sau.');
  }

  const categoryNames = (categoriesResult.data ?? [])
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));
  const storageNames = (storageLocationsResult.data ?? [])
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));

  // Z.ai exposes an Anthropic-compatible Messages endpoint, so the same SDK
  // works with the resolved baseURL (only set for provider 'zai'); provider
  // 'anthropic' keeps the SDK default.
  const anthropic = createAnthropic({
    apiKey: aiConfig.apiKey,
    ...(aiConfig.baseURL ? { baseURL: aiConfig.baseURL } : {}),
  });

  try {
    const { object } = await generateObject({
      model: anthropic(aiConfig.model),
      schema: visionResultSchema,
      schemaName: 'FoodItemsVisionDraft',
      schemaDescription: 'Danh sách thực phẩm trích xuất từ ảnh người dùng',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: buildVisionPrompt(categoryNames, storageNames) },
            {
              type: 'image',
              image: imageDataUrl,
              mediaType: imageDataUrl.startsWith('data:image/png')
                ? 'image/png'
                : 'image/jpeg',
            },
          ],
        },
      ],
    });

    return Response.json(object);
  } catch (error) {
    // Log the message only — never the request headers, tokens, or image data.
    console.error(
      'AI vision model error:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return jsonError(502, 'Không phân tích được ảnh. Vui lòng thử lại.');
  }
}
