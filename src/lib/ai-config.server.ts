import { createClient } from '@supabase/supabase-js';

/**
 * Server-only default model ids, used when the caller has no personal AI
 * config (or their row has no usable key). The Settings UI offers the same
 * model whitelist, so a user-picked model always overrides these defaults.
 */
export const DEFAULT_ANTHROPIC_MODEL_ID = 'claude-haiku-4-5';
export const DEFAULT_ZAI_MODEL_ID = 'glm-5.3-flash';

/**
 * Provider registry — single source of truth for labels, base URLs, env
 * fallback keys and the model whitelist per provider.
 *
 * Z.ai's GLM Coding Plan exposes an Anthropic Messages-compatible endpoint,
 * so provider 'zai' only needs a custom baseURL on top of @ai-sdk/anthropic
 * (no extra dependency). 'anthropic' keeps baseURL null → SDK default.
 */
interface AiProviderDefinition {
  readonly label: string;
  /** null = use the SDK's default Anthropic endpoint. */
  readonly baseURL: string | null;
  /** Server env var consulted when the caller has no personal key. */
  readonly envKey: string;
  readonly models: readonly string[];
}

const AI_PROVIDERS: {
  readonly anthropic: AiProviderDefinition;
  readonly zai: AiProviderDefinition;
} = {
  anthropic: {
    label: 'Anthropic',
    baseURL: null,
    envKey: 'ANTHROPIC_API_KEY',
    models: [DEFAULT_ANTHROPIC_MODEL_ID, 'claude-sonnet-4-6'],
  },
  zai: {
    label: 'Z.ai (GLM Coding Plan)',
    baseURL: 'https://api.z.ai/api/anthropic',
    envKey: 'ZAI_API_KEY',
    models: [DEFAULT_ZAI_MODEL_ID, 'glm-5.3'],
  },
} as const;

export type AiProviderId = keyof typeof AI_PROVIDERS;

export const AI_PROVIDER_IDS: readonly string[] = Object.keys(AI_PROVIDERS);

export function isAiProviderId(value: unknown): value is AiProviderId {
  return typeof value === 'string' && Object.hasOwn(AI_PROVIDERS, value);
}

/** First (default) model of a provider, e.g. the env-fallback model. */
export function defaultModelForProvider(provider: AiProviderId): string {
  return AI_PROVIDERS[provider].models[0];
}

export interface AiProviderOption {
  label: string;
  models: string[];
}

/**
 * Registry payload for the Settings UI — labels + model lists only; never
 * env var names or anything secret.
 */
export function listAiProviders(): Record<AiProviderId, AiProviderOption> {
  return {
    anthropic: {
      label: AI_PROVIDERS.anthropic.label,
      models: [...AI_PROVIDERS.anthropic.models],
    },
    zai: {
      label: AI_PROVIDERS.zai.label,
      models: [...AI_PROVIDERS.zai.models],
    },
  };
}

/**
 * Server env fallback (no personal key configured): Z.ai first — the app
 * owner prefers the Z.ai GLM Coding Plan — then Anthropic. Both resolveAiConfig
 * and the settings status route mirror this order, so the UI always shows
 * what would actually be used.
 */
export function resolveEnvAiFallback(): {
  provider: AiProviderId;
  model: string;
} | null {
  const zaiKey = process.env.ZAI_API_KEY;
  if (zaiKey && zaiKey.trim()) {
    return { provider: 'zai', model: DEFAULT_ZAI_MODEL_ID };
  }
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey && anthropicKey.trim()) {
    return { provider: 'anthropic', model: DEFAULT_ANTHROPIC_MODEL_ID };
  }
  return null;
}

interface AiSettingsRow {
  provider: string | null;
  model: string | null;
  api_key: string | null;
}

export type ResolvedAiConfig =
  | {
      provider: AiProviderId;
      model: string;
      apiKey: string;
      /** Custom endpoint for Anthropic-compatible providers (Z.ai), else null. */
      baseURL: string | null;
      source: 'user' | 'env';
    }
  | { error: string };

/**
 * Resolve the AI provider + model + API key for a caller:
 * 1. Their personal `ai_settings` row (RLS-scoped) — usable only when the
 *    provider is in the registry, the model belongs to that provider's list
 *    and the api_key is non-empty.
 * 2. The server env fallback (ZAI_API_KEY first, then ANTHROPIC_API_KEY).
 *
 * Internal server-side helper only — the raw key must never leak into any
 * route response; routes use it solely to build the Anthropic client.
 */
export async function resolveAiConfig(
  accessToken: string,
): Promise<ResolvedAiConfig> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error:
        'Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    };
  }

  // Same per-request RLS client pattern as the AI chat/vision routes: the
  // caller's JWT rides in the Authorization header, so `ai_settings` reads
  // are scoped to their own row. The service-role key is never used here.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify the token against Supabase Auth before running any query.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    return { error: 'Invalid or expired access token' };
  }

  const { data, error: settingsError } = await supabase
    .from('ai_settings')
    .select('provider, model, api_key')
    .maybeSingle();

  // A failed settings read (e.g. migration not run yet) degrades gracefully
  // to the env fallback instead of breaking AI features outright.
  if (!settingsError) {
    const row = (data ?? null) as AiSettingsRow | null;
    const userKey = typeof row?.api_key === 'string' ? row.api_key.trim() : '';
    const rowProvider =
      typeof row?.provider === 'string' ? row.provider.trim() : '';
    const rowModel = typeof row?.model === 'string' ? row.model.trim() : '';
    // All three must line up for the personal row to be usable; anything
    // inconsistent (unknown provider, foreign model) falls back to env.
    if (userKey && isAiProviderId(rowProvider)) {
      const provider = AI_PROVIDERS[rowProvider];
      const model = rowModel || defaultModelForProvider(rowProvider);
      if (provider.models.includes(model)) {
        return {
          provider: rowProvider,
          model,
          apiKey: userKey,
          baseURL: provider.baseURL,
          source: 'user',
        };
      }
    }
  }

  const envFallback = resolveEnvAiFallback();
  if (envFallback) {
    return {
      provider: envFallback.provider,
      model: envFallback.model,
      apiKey: (
        process.env[AI_PROVIDERS[envFallback.provider].envKey] ?? ''
      ).trim(),
      baseURL: AI_PROVIDERS[envFallback.provider].baseURL,
      source: 'env',
    };
  }

  return {
    error: 'Chưa cấu hình AI — vào Cài đặt → AI để thêm API key',
  };
}
