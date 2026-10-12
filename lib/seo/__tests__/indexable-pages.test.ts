import { describe, expect, it, vi } from 'vitest';
import type { Job } from '@/lib/jobs/registry';

/**
 * Datum der lokalen Seiten in Sitemap und IndexNow (Review Phase 2, Punkt 27): Orts- und Kreisseiten listen die live
 * Stellen mit Gehalt, die Gebietsseite nennt deren Spanne. Ihr `lastModified` ist darum das jüngere aus dem
 * `updatedAt` der Orte und dem der jüngsten live Stelle. Eine Stelle mit späterem Datum wird hier untergeschoben,
 * weil heute alle Daten auf denselben Tag fallen.
 */
const LATER = '2027-02-01';

vi.mock('@/lib/jobs/registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/jobs/registry')>();
  const [first, ...rest] = actual.getActiveJobs();
  const bumped: Job = { ...first, updatedAt: LATER, validThrough: '2028-01-01T00:00:00' };
  return { ...actual, getActiveJobs: () => [bumped, ...rest] };
});

const { einsatzgebietPages, getIndexablePages } = await import('../indexable-pages');
const { EINSATZGEBIET_PATH, getHubKreise, getKreisPlaces, getPublishedPlaces, kreisPath, placePath } = await import('@/lib/places/registry');

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
