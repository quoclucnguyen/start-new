import { createClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

import { resolveAiConfig } from '@/lib/ai-config.server';

/** Cap echoed provider errors so responses stay short and never leak context. */
const MAX_ERROR_MESSAGE_LENGTH = 300;

/** Tiny prompt + tiny output budget: the cheapest possible round-trip. */
const TEST_PROMPT = 'Reply with the single word: OK';
const TEST_MAX_OUTPUT_TOKENS = 10;

// ============================================================================
// Helpers
// ============================================================================

function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

function shortErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Lỗi không xác định';
  return raw.slice(0, MAX_ERROR_MESSAGE_LENGTH);
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

  // Per-request client that carries the caller's JWT as the Authorization
  // header; same RLS-scoped pattern as the AI chat/vision routes.
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
    console.warn('AI test auth failed:', authError?.message ?? 'no user for token');
    return jsonError(401, 'Invalid or expired access token');
  }

  const aiConfig = await resolveAiConfig(accessToken);
  if ('error' in aiConfig) {
    return jsonError(500, aiConfig.error);
  }

  // Z.ai exposes an Anthropic-compatible Messages endpoint, so the same SDK
  // works with the resolved baseURL (only set for provider 'zai'); provider
  // 'anthropic' keeps the SDK default.
  const anthropic = createAnthropic({
    apiKey: aiConfig.apiKey,
    ...(aiConfig.baseURL ? { baseURL: aiConfig.baseURL } : {}),
  });
  const startedAt = Date.now();

  try {
    await generateText({
      model: anthropic(aiConfig.model),
      prompt: TEST_PROMPT,
      maxOutputTokens: TEST_MAX_OUTPUT_TOKENS,
    });
  } catch (error) {
    // Log the message only — never the request headers, tokens, or API keys.
    console.error('AI test model error:', shortErrorMessage(error));
    return Response.json(
      { ok: false, error: shortErrorMessage(error) },
      { status: 502 },
    );
  }

  return Response.json({
    ok: true,
    model: aiConfig.model,
    source: aiConfig.source,
    latencyMs: Date.now() - startedAt,
  });
}
