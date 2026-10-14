import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Job } from '@/lib/jobs/registry';
import type { Place } from '@/lib/places/schema';

/**
 * Datum der lokalen Seiten in Sitemap und IndexNow (Review Phase 2, Punkt 27): Orts- und Kreisseiten listen die live
 * Stellen mit Gehalt, die Gebietsseite nennt deren Spanne. Ihr `lastModified` ist darum das jüngere aus dem
 * `updatedAt` der Orte und dem der jüngsten live Stelle. Eine Stelle mit späterem Datum wird hier untergeschoben,
 * weil heute alle Daten auf denselben Tag fallen.
 *
 * Seit E-029 stehen Ortsseiten nur in der Liste, wenn sie das Gate bestehen (lib/places/indexierung.ts: Lock-Datei und
 * I5, Daten bis zum Ende des Fahrplanjahrs). Für die Datierung ohne live Stelle (Stichtag nach Ablauf aller Stellen,
 * also auch nach dem Fahrplanjahr) hält der Test das Gate offen; was das Gate selbst an der Liste ändert, prüft der
 * eigene Block unten mit dem echten Gate. Am Ende: Jede URL in lighthouserc.json ist indexierbar (Plan §B).
 */
const LATER = '2027-02-01';

const gate = vi.hoisted(() => ({ offen: false }));
vi.mock('@/lib/places/indexierung', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/places/indexierung')>();
  return {
    ...actual,
    istOrtIndexierbar: (place: Pick<Place, 'id' | 'status'>, now?: Date) => (gate.offen && place.status === 'published') || actual.istOrtIndexierbar(place, now),
  };
});
afterEach(() => {
  gate.offen = false;
});

vi.mock('@/lib/jobs/registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/jobs/registry')>();
  const [first, ...rest] = actual.getActiveJobs();
  const bumped: Job = { ...first, updatedAt: LATER, validThrough: '2028-01-01T00:00:00' };
  return { ...actual, getActiveJobs: () => [bumped, ...rest] };
});

const { einsatzgebietPages, getIndexNowUrls, getIndexablePages } = await import('../indexable-pages');
const { EINSATZGEBIET_PATH, getHubKreise, getKreisPlaces, getPublishedPlaces, kreisPath, placePath } = await import('@/lib/places/registry');
const { indexierungEintrag } = await import('@/lib/places/indexierung');
const { FAHRPLAN_STAND } = await import('@/lib/places/datenklassen');

const newest = (dates: readonly string[]) => [...dates].sort().at(-1);
const byPath = (pages: ReturnType<typeof einsatzgebietPages>) => new Map(pages.map((page) => [page.path, page.lastModified]));

describe('indexable-pages: Datum der lokalen Seiten', () => {
  it('nimmt das jüngere Datum aus Ort und jüngster live Stelle (Ort, Kreis-Hub, Gebietsseite)', () => {
    const dates = byPath(einsatzgebietPages(new Date('2026-10-12T12:00:00Z')));
    for (const place of getPublishedPlaces()) expect(dates.get(placePath(place))).toBe(newest([place.updatedAt, LATER]));
    for (const kreis of getHubKreise()) expect(dates.get(kreisPath(kreis))).toBe(LATER);
    expect(dates.get(EINSATZGEBIET_PATH)).toBe(LATER);
  });

  it('ohne live Stelle zählen nur die Orte (Kreis-Hub und Gebietsseite: der jüngste ihrer Orte)', () => {
    gate.offen = true;
    const dates = byPath(einsatzgebietPages(new Date('2030-01-01T00:00:00Z')));
    for (const place of getPublishedPlaces()) expect(dates.get(placePath(place))).toBe(place.updatedAt);
    for (const kreis of getHubKreise()) {
      expect(dates.get(kreisPath(kreis))).toBe(newest(getKreisPlaces(kreis.id).map((place) => place.updatedAt)));
    }
    expect(dates.get(EINSATZGEBIET_PATH)).toBe(newest(getPublishedPlaces().map((place) => place.updatedAt)));
  });

  it('die Sitemap-Liste rechnet mit demselben Zeitpunkt; Daten kommen aus den Quellen, nie „heute“', () => {
    const now = new Date('2026-12-24T12:00:00Z');
    const local = getIndexablePages(now).filter((page) => page.group === 'einsatzgebiet');
    expect(local).toEqual(einsatzgebietPages(now));
    for (const page of local) {
      expect(page.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(page.lastModified).not.toBe('2026-12-24');
    }
  });
});

describe('indexable-pages: Gate der Ortsseiten (E-029)', () => {
  const imFahrplanjahr = new Date(`${FAHRPLAN_STAND.werktag}T12:00:00Z`);
  const nachFahrplanjahr = new Date(`${FAHRPLAN_STAND.gueltigBis}T23:30:00Z`); // in Wetzlar schon der Folgetag

  it('im Fahrplanjahr: jede Ortsseite, die das Gate besteht, steht in Sitemap-Liste und IndexNow', () => {
    const paths = new Set(getIndexablePages(imFahrplanjahr).map((page) => page.path));
    const urls = new Set(getIndexNowUrls(imFahrplanjahr));
    const places = getPublishedPlaces();
    expect(places.length).toBe(54);
    for (const place of places) {
      expect(indexierungEintrag(place.id)?.indexierbar, place.id).toBe(true);
      expect(paths.has(placePath(place)), place.id).toBe(true);
      expect([...urls].some((url) => url.endsWith(placePath(place))), place.id).toBe(true);
    }
  });

  it('nach dem Fahrplanjahr (I5): keine Ortsseite mehr, Kreis-Hubs und Gebietsseite bleiben und zählen alle Orte', () => {
    const pages = einsatzgebietPages(nachFahrplanjahr);
    const placePaths = new Set(getPublishedPlaces().map((place) => placePath(place)));
    expect(pages.filter((page) => placePaths.has(page.path))).toEqual([]);
    expect(pages.map((page) => page.path)).toEqual([EINSATZGEBIET_PATH, ...getHubKreise().map((kreis) => kreisPath(kreis))]);
    expect(getIndexNowUrls(nachFahrplanjahr).filter((url) => [...placePaths].some((p) => url.endsWith(p)))).toEqual([]);
    const dates = byPath(pages);
    for (const kreis of getHubKreise()) {
      expect(dates.get(kreisPath(kreis))).toBe(newest([...getKreisPlaces(kreis.id).map((place) => place.updatedAt), LATER]));
    }
  });
});

describe('lighthouserc.json: jede URL ist indexierbar (Plan §B)', () => {
  const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../lighthouserc.json'), 'utf8')) as {
    ci: { collect: { url: string[] } };
  };
  const urls = config.ci.collect.url.map((url) => new URL(url));
  // Stichtag fest im Fahrplanjahr der Daten: Der Test hängt nicht am Kalender, die Ortsseiten fragen die Lock-Datei.
  const indexierbar = new Set(getIndexablePages(new Date(`${FAHRPLAN_STAND.werktag}T12:00:00Z`)).map((page) => page.path));
  const placesByPath = new Map(getPublishedPlaces().map((place) => [placePath(place), place]));

  it('misst mindestens eine Ortsseite, und nur eine, die das Gate besteht', () => {
    const orte = urls.filter((url) => placesByPath.has(url.pathname));
    expect(orte.length).toBeGreaterThan(0);
    for (const url of orte) {
      const place = placesByPath.get(url.pathname)!;
      expect(indexierungEintrag(place.id)?.indexierbar, url.pathname).toBe(true);
      expect(indexierungEintrag(place.id)?.gruende, url.pathname).toEqual([]);
    }
  });

  it('jede gemessene Seite steht in der Liste der indexierbaren Seiten (Lighthouse prüft SEO mit 1,0)', () => {
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(indexierbar.has(url.pathname), url.href).toBe(true);
  });
});
