import { getSupabaseClient } from '@/lib/supabaseClient';

export interface AiProviderOption {
  label: string;
  models: string[];
}

export interface AiSettingsStatus {
  configured: boolean;
  source: 'user' | 'env' | 'none';
  provider: string;
  model: string;
  apiKeyMasked: string | null;
  /** Provider registry (id → label + model whitelist) from the server. */
  providers: Record<string, AiProviderOption>;
}

export interface AiConnectionTestResult {
  ok: boolean;
  model?: string;
  source?: 'user' | 'env';
  latencyMs?: number;
  error?: string;
}

export interface SaveAiSettingsInput {
  provider?: string;
  model?: string;
  apiKey?: string | null;
}

async function getAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();
  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }
  return session.access_token;
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Fall through to the status-based error below.
  }

  if (!response.ok) {
    const serverError =
      payload && typeof payload === 'object' && 'error' in payload
        ? (payload as { error: unknown }).error
        : null;
    throw new Error(
      typeof serverError === 'string'
        ? serverError
        : `Request failed with status ${response.status}`,
    );
  }

  return payload as T;
}

/**
 * GET /api/ai/settings — status + masked key only; the raw key never leaves
 * the server.
 */
export async function fetchAiSettingsStatus(): Promise<AiSettingsStatus> {
  const accessToken = await getAccessToken();
  return fetchJson<AiSettingsStatus>('/api/ai/settings', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * PUT /api/ai/settings — upsert { provider?, model?, apiKey? }; apiKey null
 * clears the personal key. The response carries the refreshed (masked) status.
 */
export async function saveAiSettings(
  input: SaveAiSettingsInput,
): Promise<AiSettingsStatus> {
  const accessToken = await getAccessToken();
  return fetchJson<AiSettingsStatus>('/api/ai/settings', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

/**
 * POST /api/ai/test — a minimal round-trip against the configured model.
 * A non-OK response (e.g. 502 with { ok: false, error }) throws so callers
 * can handle success and failure uniformly.
 */
export async function testAiConnection(): Promise<AiConnectionTestResult> {
  const accessToken = await getAccessToken();
  return fetchJson<AiConnectionTestResult>('/api/ai/test', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
