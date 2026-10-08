import { SITE_CONFIG } from './site-config';

// IndexNow-Keys sind per Protokoll öffentlich (Prüfdatei public/<key>.txt). Der Key kommt nur aus
// der Umgebung (INDEXNOW_KEY über lib/env.ts, ROADMAP §9.4); der Aufrufer reicht ihn herein, damit
// dieses Modul frei von Server-Abhängigkeiten bleibt.

export function getAllPortalUrls(): string[] {
  const base = SITE_CONFIG.baseUrl;
  return [
    `${base}/`,
    `${base}/bewerbung`,
    `${base}/datenschutz`,
    `${base}/impressum`,
  ];
}

export function getIndexNowPayload(apiKey: string, urls?: string[] | string) {
  const host = new URL(SITE_CONFIG.baseUrl).host;
  const urlList = urls
    ? Array.isArray(urls)
      ? urls
      : [urls]
    : getAllPortalUrls();

  return {
    host,
    key: apiKey,
    keyLocation: `${SITE_CONFIG.baseUrl}/${apiKey}.txt`,
    urlList,
  };
}

export async function submitToIndexNow(
  apiKey: string,
  urls?: string[] | string
): Promise<{ success: boolean; status?: number; error?: string; payload?: ReturnType<typeof getIndexNowPayload> }> {
  const payload = getIndexNowPayload(apiKey, urls);

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { success: true, status: res.status, payload };
    }

    const resText = await res.text();
    return {
      success: false,
      status: res.status,
      error: `IndexNow API returned HTTP ${res.status}: ${resText}`,
      payload,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown IndexNow fetch error',
      payload,
    };
  }
}

