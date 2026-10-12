import type { MetadataRoute } from 'next';
import { getIndexablePages } from '@/lib/seo/indexable-pages';

/**
 * Indexable pages only, from one list (lib/seo/indexable-pages.ts, ROADMAP §10, E-028): home, /jobs, the live job
 * pages, /bewerbung and the local pages under /einsatzgebiet. Left out on purpose: /datenschutz and /impressum
 * (noindex), /bewerbung/danke and /bewerbung/mappe (noindex), closed or expired job pages (noindex), redirects, feeds
 * and /api. Every URL is the page's canonical exactly as rendered (the root without a trailing slash, V6-B). Dates are
 * the sources' own `updatedAt` (jobs, places); nothing is invented, never „now“.
 */
/** Hourly, like the feeds: expired job pages leave the sitemap without a deploy. */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  return getIndexablePages(new Date()).map((page) => ({
    url: page.url,
    ...(page.lastModified ? { lastModified: page.lastModified } : {}),
  }));
}
