import { SITE_CONFIG } from './site-config';

export const BASE_URL = SITE_CONFIG.baseUrl;

/**
 * Absolute canonical URL for a path. A trailing slash in APP_URL is ignored, so canonicals
 * match jobUrl() and the JobPosting `url` exactly (checked by scripts/qa/check-graph.mjs).
 */
export function getCleanCanonicalUrl(path: string): string {
  const base = BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/\/$/, '') || '';
  return `${base}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
}
