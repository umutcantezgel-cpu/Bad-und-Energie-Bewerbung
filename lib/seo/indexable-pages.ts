import { jobPath, jobUrl } from '@/lib/jobs/format';
import { getActiveJobs, getJobPageSlugs, isJobLive, type Job } from '@/lib/jobs/registry';
import { EINSATZGEBIET_PATH, getHubKreise, getKreisPlaces, getPublishedPlaces, kreisPath, placePath } from '@/lib/places/registry';
import { getCleanCanonicalUrl } from './canonical-links';
import { SITE_CONFIG } from './site-config';

/**
 * Alle indexierbaren Seiten an einer Stelle (ROADMAP §10, E-028): Sitemap (app/sitemap.ts), IndexNow
 * (lib/seo/indexnow.ts) und llms.txt lesen von hier. Eine neue Seitenart (z. B. Themenseiten) kommt als eine neue
 * Gruppe hierher und steht damit überall. Jede URL ist der Canonical der Seite, wie er gerendert wird
 * (getCleanCanonicalUrl: die Startseite ohne Schrägstrich, V6-B). Daten sind die `updatedAt` der Quellen, nie „jetzt“.
 */

export type PageGroup = 'kern' | 'stellen' | 'einsatzgebiet';

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
 * Lokale Seiten (E-028): Gebietsseite (jüngstes Datum ihrer Unterseiten), Kreis-Hubs (jüngstes Datum ihrer Orte),
 * jede veröffentlichte Ortsseite mit ihrem `updatedAt`.
 */
export function einsatzgebietPages(): IndexablePage[] {
  const places = getPublishedPlaces();
  const kreise = getHubKreise().map((kreis) =>
    page('einsatzgebiet', kreisPath(kreis), newest(getKreisPlaces(kreis.id).map((place) => place.updatedAt))),
  );
  const orte = places.map((place) => page('einsatzgebiet', placePath(place), place.updatedAt));
  const hub = page('einsatzgebiet', EINSATZGEBIET_PATH, newest([...kreise, ...orte].flatMap((p) => (p.lastModified ? [p.lastModified] : []))));
  return [hub, ...kreise, ...orte];
}

/**
 * Sitemap: Startseite, /jobs, jede live Stellenseite, /bewerbung (diese vier mit dem jüngsten `updatedAt` der live
 * Stellen, weil sie die Stellen listen), dann die lokalen Seiten. Nicht dabei: noindex-Seiten (Recht, Danke, Mappe,
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
    ...einsatzgebietPages(),
  ];
}

/**
 * IndexNow: dieselben Seiten, die Stellenseiten aber mit den besetzten (status archived), damit Suchmaschinen ihr
 * noindex schnell sehen. Die Startseite mit Schrägstrich (so meldet IndexNow sie seit jeher).
 */
export function getIndexNowUrls(): string[] {
  const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
  const jobPages = getJobPageSlugs().map((slug) => jobUrl({ slug }));
  return [`${base}/`, `${base}/jobs`, ...jobPages, `${base}/bewerbung`, ...einsatzgebietPages().map((p) => p.url)];
}
