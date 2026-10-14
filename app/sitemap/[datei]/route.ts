import { SITEMAP_GRUPPEN, sitemapIdAusDatei, sitemapPages, sitemapXml } from '@/lib/seo/indexable-pages';

/**
 * Sitemaps je Gruppe (E-029, Plan §B), aus der einen Liste der indexierbaren Seiten (lib/seo/indexable-pages.ts,
 * ROADMAP §10, E-028): /sitemap/kern.xml (Startseite, /jobs, /bewerbung), /sitemap/stellen.xml (die live Stellenseiten),
 * /sitemap/orte.xml (Einsatzgebiet, Kreis-Hubs und jede Ortsseite, die das Gate besteht) und /sitemap/themen.xml. So
 * misst die Search Console die Ortsseiten getrennt (docs/operations/orte-monitoring.md). /sitemap.xml ist der Index
 * (app/sitemap.xml/route.ts); robots.txt zeigt dorthin.
 *
 * Ein Route-Handler wie die Feeds (app/feeds/[feed]/route.ts) statt app/sitemap.ts mit generateSitemaps: Next belegt
 * mit der Metadaten-Sitemap auch dann /sitemap.xml und lässt daneben keinen eigenen Index zu. Nicht darin: /datenschutz
 * und /impressum, /bewerbung/danke und /bewerbung/mappe, besetzte oder abgelaufene Stellen (alle noindex), Ortsseiten
 * mit `noindex,follow` (Gate), Weiterleitungen, Feeds und /api. Jede URL ist der Canonical der Seite, wie er gerendert
 * wird (die Startseite ohne Schrägstrich, V6-B). Daten sind das `updatedAt` der Quellen; Seiten, die die live Stellen
 * nennen, nehmen das jüngere aus eigenem Datum und jüngster live Stelle. Nichts wird erfunden, nie „heute“.
 */
export const dynamic = 'force-static';
/** Stündlich, wie die Feeds: Abgelaufene Stellen und Orte nach ihrem Fahrplanjahr gehen ohne Deploy hinaus. */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams(): { datei: string }[] {
  return SITEMAP_GRUPPEN.map(({ id }) => ({ datei: `${id}.xml` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ datei: string }> }): Promise<Response> {
  const id = sitemapIdAusDatei((await params).datei);
  if (!id) return new Response('Nicht gefunden.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  return new Response(sitemapXml(sitemapPages(id, new Date())), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
