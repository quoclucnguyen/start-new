import { retrieveRawInitData } from '@tma.js/sdk-react';

export type TmaExchangeResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  user?: unknown;
  telegram_user?: {
    id: number;
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    language_code?: string | null;
  } | null;
};

/** Get initData from Telegram WebView or URL query */
export function getInitDataRaw(): string | null {
  try {
    const w = window as unknown as {
      Telegram?: { WebApp?: { initData?: string } };
      location: Location;
    };
    const tg = w?.Telegram?.WebApp;
    if (tg?.initData && typeof tg.initData === 'string' && tg.initData.length > 0) {
      return tg.initData;
    }
    try {
      const rawInitData = retrieveRawInitData();
      if (typeof rawInitData === 'string' && rawInitData.length > 0) {
        return rawInitData;
      }
    } catch {
      // Ignore if SDK launch params are unavailable.
    }
    const p = new URLSearchParams(w.location.search);
    return p.get('tgWebAppData') || p.get('initData') || null;
  } catch {
    return null;
  }
}

/** Check if running inside Telegram WebView */
export function isInTelegramWebView(): boolean {
  try {
    const w = window as unknown as { Telegram?: { WebApp?: unknown } };
    if (w?.Telegram?.WebApp) return true;
    try {
      return !!retrieveRawInitData();
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/** Exchange initData for Supabase session via Edge Function */
export async function exchangeTma(initDataRaw: string): Promise<TmaExchangeResponse> {
  const base =
    import.meta.env.VITE_TMA_EXCHANGE_URL ||
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tma-exchange`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
  }

  const res = await fetch(base, {
    method: 'POST',
    headers,
    body: JSON.stringify({ initDataRaw }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`TMA exchange failed: ${res.status} ${txt}`);
  }
  return res.json();
}
