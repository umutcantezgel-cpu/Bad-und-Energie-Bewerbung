import { getSitemapIndex, sitemapIndexXml } from '@/lib/seo/indexable-pages';

/**
 * Sitemap-Index unter /sitemap.xml (E-029, Plan §B): verweist auf die Sitemaps je Gruppe (/sitemap/<id>.xml,
 * app/sitemap/[datei]/route.ts), jede mit dem jüngsten Datum ihrer Seiten. robots.txt nennt den Index und jede Gruppe
 * (app/robots.ts); in der Search Console wird jede Adresse einzeln eingereicht, damit die Orts-Sitemap ihren eigenen
 * Bericht hat (docs/operations/orte-monitoring.md). Statisch, stündlich neu wie die Gruppen-Sitemaps.
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET(): Response {
  return new Response(sitemapIndexXml(getSitemapIndex(new Date())), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
