import { SITE_CONFIG } from './site-config';

export const BASE_URL = SITE_CONFIG.baseUrl;

/**
 * Absolute canonical URL for a path. A trailing slash in APP_URL is ignored, so canonicals
 * match jobUrl() and the JobPosting `url` exactly (checked by scripts/qa/check-graph.mjs).
 *
 * The root is the bare origin without a slash: Next renders `<link rel="canonical">` and
 * `og:url` of "/" that way (resolveAbsoluteUrlWithPathname), so sitemap, BreadcrumbList and the
 * WebPage node of the home page carry exactly the string of its canonical tag (V6-B).
 */
export function getCleanCanonicalUrl(path: string): string {
  const base = BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/\/+$/, '');
  if (!cleanPath) return base;
  return `${base}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
}
