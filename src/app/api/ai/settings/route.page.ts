import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  DEFAULT_ANTHROPIC_MODEL_ID,
  defaultModelForProvider,
  isAiProviderId,
  listAiProviders,
  resolveEnvAiFallback,
  type AiProviderId,
} from '@/lib/ai-config.server';

const MISSING_TABLE_MESSAGE =
  'Chưa có bảng ai_settings trong database — chạy file supabase/database/20260910000000_ai_settings.sql trong Supabase SQL Editor';

interface AiSettingsRow {
  provider: string | null;
  model: string | null;
  api_key: string | null;
}

type AuthResult =
  | { supabase: SupabaseClient; userId: string }
  | { error: Response };

// ============================================================================
// Helpers
// ============================================================================

function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

/** Mask a key down to its last 4 chars, e.g. "••••ab12". Never echo it raw. */
function maskApiKey(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 4) return '••••';
  return `••••${trimmed.slice(-4)}`;
}

/** PostgREST/Postgres error raised when the migration has not been run yet. */
function isMissingTableError(message: string, code: string | undefined): boolean {
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    /could not find the table/i.test(message) ||
    /does not exist/i.test(message)
  );
}

/** Normalize a stored provider value; unknown/missing → 'anthropic'. */
function storedProviderId(raw: string | null | undefined): AiProviderId {
  return isAiProviderId(raw) ? raw : 'anthropic';
}

/** Effective status for GET responses and after a successful PUT. */
function buildStatusResponse(
  userKey: string | null,
  provider: AiProviderId,
  model: string,
): Response {
  if (userKey) {
    return Response.json({
      configured: true,
      source: 'user',
      provider,
      model,
      apiKeyMasked: maskApiKey(userKey),
      providers: listAiProviders(),
    });
  }

  // No personal key: mirror resolveAiConfig's env fallback order (Z.ai first).
  const envFallback = resolveEnvAiFallback();
  if (envFallback) {
    return Response.json({
      configured: true,
      source: 'env',
      provider: envFallback.provider,
      model: envFallback.model,
      apiKeyMasked: null,
      providers: listAiProviders(),
    });
  }

  return Response.json({
    configured: false,
    source: 'none',
    provider: 'anthropic',
    model: DEFAULT_ANTHROPIC_MODEL_ID,
    apiKeyMasked: null,
    providers: listAiProviders(),
  });
}

/**
 * Same bearer auth pattern as the AI chat/vision routes: the caller's JWT rides
 * in the Authorization header so every `ai_settings` query is RLS-scoped to
 * their own row. The service-role key is never used here.
 */
async function authenticate(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return { error: jsonError(401, 'Missing or invalid Authorization header') };
  }
  const accessToken = authHeader.slice('Bearer '.length).trim();
  if (!accessToken) {
    return { error: jsonError(401, 'Missing or invalid Authorization header') };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: jsonError(
        500,
        'Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      ),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    console.warn('AI settings auth failed:', authError?.message ?? 'no user for token');
    return { error: jsonError(401, 'Invalid or expired access token') };
  }

  return { supabase, userId: user.id };
}

// ============================================================================
// Route handlers
// ============================================================================

/**
 * GET /api/ai/settings — status only. The raw api_key never leaves the server;
 * the client only ever sees the masked suffix. Also returns the provider
 * registry (labels + model lists) so the UI never hardcodes model options.
 */
export async function GET(request: Request): Promise<Response> {
  const auth = await authenticate(request);
  if ('error' in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from('ai_settings')
    .select('provider, model, api_key')
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message, error.code)) {
      // Migration not run yet: report env-only status instead of failing the UI.
      return buildStatusResponse(null, 'anthropic', DEFAULT_ANTHROPIC_MODEL_ID);
    }
    console.error('AI settings read failed:', error.message);
    return jsonError(500, 'Không đọc được cấu hình AI. Vui lòng thử lại sau.');
  }

  const row = (data ?? null) as AiSettingsRow | null;
  const userKey = typeof row?.api_key === 'string' ? row.api_key.trim() : '';
  const provider = storedProviderId(row?.provider ?? null);
  const storedModel = typeof row?.model === 'string' ? row.model.trim() : '';
  const providerModels = listAiProviders()[provider].models;
  const model =
    storedModel && providerModels.includes(storedModel)
      ? storedModel
      : defaultModelForProvider(provider);

  return buildStatusResponse(userKey || null, provider, model);
}

/**
 * PUT /api/ai/settings — upsert the caller's row.
 * Body: { provider?: string, model?: string, apiKey?: string | null }
 * - provider omitted → keep stored provider (or 'anthropic')
 * - model omitted    → keep stored model when it belongs to the effective
 *                      provider, else that provider's default model
 * - apiKey omitted   → keep stored key
 * - apiKey null      → clear the personal key (row is kept; there is no DELETE policy)
 */
export async function PUT(request: Request): Promise<Response> {
  const auth = await authenticate(request);
  if ('error' in auth) return auth.error;

  let body: { provider?: unknown; model?: unknown; apiKey?: unknown };
  try {
    body = (await request.json()) as {
      provider?: unknown;
      model?: unknown;
      apiKey?: unknown;
    };
  } catch {
    return jsonError(400, 'Invalid JSON in request body');
  }

  const { data, error: readError } = await auth.supabase
    .from('ai_settings')
    .select('provider, model, api_key')
    .maybeSingle();

  if (readError) {
    if (isMissingTableError(readError.message, readError.code)) {
      return jsonError(500, MISSING_TABLE_MESSAGE);
    }
    console.error('AI settings read failed:', readError.message);
    return jsonError(500, 'Không đọc được cấu hình AI. Vui lòng thử lại sau.');
  }
  const existing = (data ?? null) as AiSettingsRow | null;

  const providers = listAiProviders();

  let provider: AiProviderId;
  if (body.provider === undefined) {
    provider = storedProviderId(existing?.provider ?? null);
  } else if (typeof body.provider === 'string' && isAiProviderId(body.provider)) {
    provider = body.provider;
  } else {
    return jsonError(
      400,
      `Provider không hợp lệ. Chọn một trong: ${Object.keys(providers).join(', ')}`,
    );
  }
  const providerModels = providers[provider].models;

  let model: string;
  if (body.model === undefined) {
    const storedModel =
      typeof existing?.model === 'string' ? existing.model.trim() : '';
    model =
      storedModel && providerModels.includes(storedModel)
        ? storedModel
        : defaultModelForProvider(provider);
  } else if (
    typeof body.model === 'string' &&
    providerModels.includes(body.model)
  ) {
    model = body.model;
  } else {
    return jsonError(
      400,
      `Model không hợp lệ cho ${providers[provider].label}. Chọn một trong: ${providerModels.join(', ')}`,
    );
  }

  let apiKey: string | null;
  if (body.apiKey === null) {
    apiKey = null;
  } else if (body.apiKey === undefined) {
    apiKey =
      typeof existing?.api_key === 'string' && existing.api_key.trim()
        ? existing.api_key
        : null;
  } else if (typeof body.apiKey === 'string' && body.apiKey.trim()) {
    apiKey = body.apiKey.trim();
  } else {
    return jsonError(400, 'apiKey phải là chuỗi không rỗng hoặc null');
  }

  const { error: upsertError } = await auth.supabase
    .from('ai_settings')
    .upsert(
      { user_id: auth.userId, provider, model, api_key: apiKey },
      { onConflict: 'user_id' },
    );

  if (upsertError) {
    console.error('AI settings upsert failed:', upsertError.message);
    if (isMissingTableError(upsertError.message, upsertError.code)) {
      return jsonError(500, MISSING_TABLE_MESSAGE);
    }
    return jsonError(500, 'Không lưu được cấu hình AI. Vui lòng thử lại sau.');
  }

  return buildStatusResponse(apiKey, provider, model);
}
