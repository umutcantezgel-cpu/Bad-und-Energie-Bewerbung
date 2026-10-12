import { getIndexNowUrls } from './indexable-pages';
import { SITE_CONFIG } from './site-config';

// IndexNow-Keys sind per Protokoll öffentlich (Prüfdatei public/<key>.txt). Der Key kommt nur aus
// der Umgebung (INDEXNOW_KEY über lib/env.ts, ROADMAP §9.4); der Aufrufer reicht ihn herein, damit
// dieses Modul frei von Server-Abhängigkeiten bleibt.

/**
 * Portal URLs from the one list of indexable pages (lib/seo/indexable-pages.ts): home, /jobs, every job page,
 * /bewerbung and the local pages under /einsatzgebiet (E-028). Job pages include closed ones (status archived), so
 * search engines pick up their noindex quickly. Legal pages are noindex and left out.
 */
export function getAllPortalUrls(): string[] {
  return getIndexNowUrls();
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

