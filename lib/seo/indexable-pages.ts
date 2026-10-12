import { jobPath, jobUrl } from '@/lib/jobs/format';
import { getActiveJobs, getJobPageSlugs, isJobLive, type Job } from '@/lib/jobs/registry';
import { EINSATZGEBIET_PATH, getHubKreise, getKreisPlaces, getPublishedPlaces, kreisPath, placePath, type Place } from '@/lib/places/registry';
import { ARBEITEN_PATH, THEMEN_STAND, getThemen, themaPath, type ThemaId } from '@/lib/themen/registry';
import { getCleanCanonicalUrl } from './canonical-links';
import { SITE_CONFIG } from './site-config';

/**
 * Alle indexierbaren Seiten an einer Stelle (ROADMAP §10, E-028): Sitemap (app/sitemap.ts), IndexNow
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
 * Lokale Seiten (E-028): jede veröffentlichte Ortsseite, die Kreis-Hubs (jüngstes Datum ihrer Orte) und die
 * Gebietsseite (jüngstes Datum aller Orte). Orts- und Kreisseiten listen die live Stellen mit Gehalt, die Gebietsseite
 * nennt deren Gehaltsspanne: Ihr Datum ist darum das jüngere aus dem `updatedAt` der Orte und dem jüngsten `updatedAt`
 * der live Stellen (Review Phase 2, Punkt 27). Ohne live Stelle zählen nur die Orte.
 */
export function einsatzgebietPages(now: Date = new Date()): IndexablePage[] {
  const jobsDate = newest(liveJobs(now).map((job) => job.updatedAt));
  const dated = (places: readonly Place[]) => newest([...places.map((place) => place.updatedAt), ...(jobsDate ? [jobsDate] : [])]);
  const places = getPublishedPlaces();
  const kreise = getHubKreise().map((kreis) => page('einsatzgebiet', kreisPath(kreis), dated(getKreisPlaces(kreis.id))));
  const orte = places.map((place) => page('einsatzgebiet', placePath(place), dated([place])));
  return [page('einsatzgebiet', EINSATZGEBIET_PATH, dated(places)), ...kreise, ...orte];
}

/** Themen, deren Seite die live Stellen nennt (Gehalt, Pakete, Aufgaben); die übrigen hängen nur an Fakten. */
const THEMEN_MIT_STELLEN: ReadonlySet<ThemaId> = new Set(['gehalt', 'fahrzeug-und-werkzeug', 'waermepumpen']);

/**
 * Themenseiten (E-028): der Hub /arbeiten-bei-uns und die fünf Themen. Datum ist der Stand der Texte (THEMEN_STAND);
 * Hub, Gehalt, Fahrzeug und Wärmepumpen nennen die live Stellen und nehmen das jüngere Datum der live Stellen dazu.
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
 * noindex schnell sehen. Die Startseite mit Schrägstrich (so meldet IndexNow sie seit jeher).
 */
export function getIndexNowUrls(): string[] {
  const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
  const jobPages = getJobPageSlugs().map((slug) => jobUrl({ slug }));
  return [
    `${base}/`,
    `${base}/jobs`,
    ...jobPages,
    `${base}/bewerbung`,
    ...einsatzgebietPages().map((p) => p.url),
    ...themenPages().map((p) => p.url),
  ];
}
