import { getSitemapIndex, sitemapIndexXml } from '@/lib/seo/indexable-pages';

/**
 * Sitemap-Index unter /sitemap.xml (E-029, Plan §B): verweist auf die Sitemaps je Gruppe (/sitemap/<id>.xml,
 * app/sitemap/[datei]/route.ts), jede mit dem jüngsten Datum ihrer Seiten. robots.txt und die Search Console bleiben bei
 * der einen Adresse; die Gruppen lassen sich dort zusätzlich einzeln einreichen. Statisch, stündlich neu wie die
 * Gruppen-Sitemaps.
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET(): Response {
  return new Response(sitemapIndexXml(getSitemapIndex(new Date())), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
