import { SITE_CONFIG } from './site-config';

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '298d966b7e4f4a43981cb8e30da6b5b5';

export function getAllPortalUrls(): string[] {
  const base = SITE_CONFIG.baseUrl;
  return [
    `${base}/`,
    `${base}/bewerbung`,
    `${base}/datenschutz`,
    `${base}/impressum`,
  ];
}

export function getIndexNowPayload(urls?: string[] | string) {
  const apiKey = INDEXNOW_KEY;
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
  urls?: string[] | string
): Promise<{ success: boolean; status?: number; error?: string; payload?: ReturnType<typeof getIndexNowPayload> }> {
  const payload = getIndexNowPayload(urls);

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

