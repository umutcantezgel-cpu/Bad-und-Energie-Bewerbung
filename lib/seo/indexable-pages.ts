import { jobPath, jobUrl } from '@/lib/jobs/format';
import { getActiveJobs, getJobPageSlugs, isJobLive, type Job } from '@/lib/jobs/registry';
import { istOrtIndexierbar } from '@/lib/places/indexierung';
import { EINSATZGEBIET_PATH, getHubKreise, getKreisPlaces, getPublishedPlaces, kreisPath, placePath, type Place } from '@/lib/places/registry';
import { ARBEITEN_PATH, THEMEN_STAND, getThemen, themaPath, type ThemaId } from '@/lib/themen/registry';
import { getCleanCanonicalUrl } from './canonical-links';
import { SITE_CONFIG } from './site-config';

/**
 * Alle indexierbaren Seiten an einer Stelle (ROADMAP §10, E-028): Sitemaps (app/sitemap/[datei]/route.ts), IndexNow
 * (lib/seo/indexnow.ts) und llms.txt lesen von hier. Eine neue Seitenart kommt als eine neue Gruppe hierher und steht
 * damit überall (zuletzt die Themenseiten, Gruppe `themen`). Jede URL ist der Canonical der Seite, wie er gerendert wird
 * (getCleanCanonicalUrl: die Startseite ohne Schrägstrich, V6-B). Daten sind die `updatedAt` der Quellen, nie „jetzt“.
 */

export type PageGroup = 'kern' | 'stellen' | 'einsatzgebiet' | 'themen';

export interface IndexablePage {
  group: PageGroup;
  path: string;
  /** Canonical-URL (absolut). */
  url: string;
  /** JJJJ-MM-TT; fehlt, wenn keine Quelle ein Datum hat. */
  lastModified?: string;
}

/** Jüngstes Datum (ISO-Strings sortieren lexikalisch richtig). */
function newest(dates: readonly string[]): string | undefined {
  return [...dates].sort().at(-1);
}

const page = (group: PageGroup, path: string, lastModified?: string): IndexablePage => ({
  group,
  path,
  url: getCleanCanonicalUrl(path),
  ...(lastModified ? { lastModified } : {}),
});

/** Stellen, die gerade live sind (Sitemap und Feeds nennen nur sie). */
export function liveJobs(now: Date = new Date()): Job[] {
  return getActiveJobs().filter((job) => isJobLive(job, now));
}

/**
 * Lokale Seiten (E-028): jede Ortsseite, die das Gate besteht (E-029, lib/places/indexierung.ts: Lock-Datei und I5 am
 * Tag `now`), die Kreis-Hubs (jüngstes Datum ihrer Orte) und die Gebietsseite (jüngstes Datum aller Orte). Eine Ortsseite
 * mit `noindex,follow` fehlt hier und damit in Sitemap, IndexNow und llms.txt; Hubs und Gebietsseite zeigen und datieren
 * weiter alle Orte, weil sie sie auflisten. Orts-, Kreis- und Gebietsseite nennen die live Stellen: Ihr Datum ist darum
 * das jüngere aus dem `updatedAt` der Orte und dem jüngsten `updatedAt` der live Stellen (Review Phase 2, Punkt 27).
 * Ohne live Stelle zählen nur die Orte. Seit E-030 nennt keine Seite einen Betrag.
 */
export function einsatzgebietPages(now: Date = new Date()): IndexablePage[] {
  const jobsDate = newest(liveJobs(now).map((job) => job.updatedAt));
  const dated = (places: readonly Place[]) => newest([...places.map((place) => place.updatedAt), ...(jobsDate ? [jobsDate] : [])]);
  const places = getPublishedPlaces();
  const kreise = getHubKreise().map((kreis) => page('einsatzgebiet', kreisPath(kreis), dated(getKreisPlaces(kreis.id))));
  const orte = places.filter((place) => istOrtIndexierbar(place, now)).map((place) => page('einsatzgebiet', placePath(place), dated([place])));
  return [page('einsatzgebiet', EINSATZGEBIET_PATH, dated(places)), ...kreise, ...orte];
}

/** Themen, deren Seite die live Stellen nennt (Bezahlung, Pakete, Aufgaben); die übrigen hängen nur an Fakten. */
const THEMEN_MIT_STELLEN: ReadonlySet<ThemaId> = new Set(['gehalt', 'fahrzeug-und-werkzeug', 'waermepumpen']);

/**
 * Themenseiten (E-028): der Hub /arbeiten-bei-uns und die fünf Themen. Datum ist der Stand der Texte (THEMEN_STAND);
 * Hub, Bezahlung, Fahrzeug und Wärmepumpen nennen die live Stellen und nehmen das jüngere Datum der live Stellen dazu.
 */
export function themenPages(now: Date = new Date()): IndexablePage[] {
  const jobsDate = newest(liveJobs(now).map((job) => job.updatedAt));
  const mitStellen = newest([THEMEN_STAND, ...(jobsDate ? [jobsDate] : [])]);
  return [
    page('themen', ARBEITEN_PATH, mitStellen),
    ...getThemen().map((thema) => page('themen', themaPath(thema), THEMEN_MIT_STELLEN.has(thema.id) ? mitStellen : thema.updatedAt)),
  ];
}

/**
 * Sitemap: Startseite, /jobs, jede live Stellenseite, /bewerbung (diese vier mit dem jüngsten `updatedAt` der live
 * Stellen, weil sie die Stellen listen), dann die lokalen Seiten und die Themenseiten. Nicht dabei: noindex-Seiten (Recht, Danke, Mappe,
 * besetzte Stellen), Feeds, /api und Weiterleitungen.
 */
export function getIndexablePages(now: Date = new Date()): IndexablePage[] {
  const jobs = liveJobs(now);
  const listing = newest(jobs.map((job) => job.updatedAt));
  return [
    page('kern', '/', listing),
    page('kern', '/jobs', listing),
    ...jobs.map((job): IndexablePage => ({ group: 'stellen', path: jobPath(job), url: jobUrl(job), lastModified: job.updatedAt })),
    page('kern', '/bewerbung', listing),
    ...einsatzgebietPages(now),
    ...themenPages(now),
  ];
}

/**
 * IndexNow: dieselben Seiten, die Stellenseiten aber mit den besetzten (status archived), damit Suchmaschinen ihr
 * noindex schnell sehen. Ortsseiten nur, wenn sie das Gate bestehen (Plan §B: raus aus IndexNow). Die Startseite mit
 * Schrägstrich (so meldet IndexNow sie seit jeher).
 */
export function getIndexNowUrls(now: Date = new Date()): string[] {
  const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
  const jobPages = getJobPageSlugs().map((slug) => jobUrl({ slug }));
  return [
    `${base}/`,
    `${base}/jobs`,
    ...jobPages,
    `${base}/bewerbung`,
    ...einsatzgebietPages(now).map((p) => p.url),
    ...themenPages(now).map((p) => p.url),
  ];
}

/**
 * Sitemaps nach Gruppen (E-029, Plan §B): je Gruppe eine Datei unter /sitemap/<id>.xml (app/sitemap/[datei]/route.ts),
 * damit die Search Console die Ortsseiten getrennt misst; /sitemap.xml ist der Index (app/sitemap.xml/route.ts). Die
 * Gruppe `einsatzgebiet` heißt in der Adresse „orte“ (docs/operations/orte-monitoring.md).
 */
export const SITEMAP_GRUPPEN = Object.freeze([
  { id: 'kern', group: 'kern' },
  { id: 'stellen', group: 'stellen' },
  { id: 'orte', group: 'einsatzgebiet' },
  { id: 'themen', group: 'themen' },
] as const satisfies readonly { id: string; group: PageGroup }[]);

export type SitemapId = (typeof SITEMAP_GRUPPEN)[number]['id'];

export function isSitemapId(value: string): value is SitemapId {
  return SITEMAP_GRUPPEN.some((gruppe) => gruppe.id === value);
}

/** Pfad einer Gruppen-Sitemap: /sitemap/orte.xml. */
export function sitemapPath(id: SitemapId): string {
  return `/sitemap/${id}.xml`;
}

export function sitemapUrl(id: SitemapId): string {
  return `${SITE_CONFIG.baseUrl.replace(/\/+$/, '')}${sitemapPath(id)}`;
}

/** Seiten einer Gruppen-Sitemap, in der Reihenfolge von getIndexablePages. */
export function sitemapPages(id: SitemapId, now: Date = new Date()): IndexablePage[] {
  const gruppe = SITEMAP_GRUPPEN.find((g) => g.id === id)!.group;
  return getIndexablePages(now).filter((p) => p.group === gruppe);
}

export interface SitemapIndexEintrag {
  url: string;
  /** Jüngstes Datum der Seiten der Gruppe. */
  lastModified?: string;
}

/** Einträge des Sitemap-Index: jede Gruppe mit mindestens einer Seite, mit dem jüngsten Datum ihrer Seiten. */
export function getSitemapIndex(now: Date = new Date()): SitemapIndexEintrag[] {
  return SITEMAP_GRUPPEN.flatMap(({ id }) => {
    const seiten = sitemapPages(id, now);
    if (seiten.length === 0) return [];
    const lastModified = newest(seiten.flatMap((p) => (p.lastModified ? [p.lastModified] : [])));
    return [{ url: sitemapUrl(id), ...(lastModified ? { lastModified } : {}) }];
  });
}

/** Dateiname im Segment der Route (app/sitemap/[datei]/route.ts): orte.xml → orte; sonst undefined. */
export function sitemapIdAusDatei(datei: string): SitemapId | undefined {
  const id = datei.endsWith('.xml') ? datei.slice(0, -'.xml'.length) : '';
  return isSitemapId(id) ? id : undefined;
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/**
 * Sitemap einer Gruppe nach sitemaps.org (`<urlset>` mit `<url><loc>` und optional `<lastmod>`), Zeile für Zeile wie
 * die frühere Metadaten-Sitemap von Next: URL ist der Canonical, Datum das der Quelle (JJJJ-MM-TT).
 */
export function sitemapXml(seiten: readonly Pick<IndexablePage, 'url' | 'lastModified'>[]): string {
  const eintraege = seiten.map(
    (p) => `<url>\n<loc>${escapeXml(p.url)}</loc>\n${p.lastModified ? `<lastmod>${escapeXml(p.lastModified)}</lastmod>\n` : ''}</url>\n`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege.join('')}</urlset>\n`;
}

/** Sitemap-Index nach sitemaps.org (`<sitemapindex>` mit `<sitemap><loc>` und optional `<lastmod>`). */
export function sitemapIndexXml(eintraege: readonly SitemapIndexEintrag[]): string {
  const zeilen = eintraege.map(
    (e) => `<sitemap><loc>${escapeXml(e.url)}</loc>${e.lastModified ? `<lastmod>${escapeXml(e.lastModified)}</lastmod>` : ''}</sitemap>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${zeilen.join('\n')}\n</sitemapindex>\n`;
}
