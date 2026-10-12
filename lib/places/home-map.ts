import { MEASURED_PLACES } from './measurement';

/**
 * Die 10 Punkte der Startseitenkarte aus der Ortsvermessung, ohne zod und ohne Registry: lib/data/locations.ts
 * liest dieses Modul, und die Karte der Startseite (lib/maps/google-maps-config.ts) liegt auch im Client-Bundle
 * (scripts/qa/check-client-imports.mjs). Werte, Namen und Slugs sind dieselben wie in der Registry (data.ts nutzt
 * dieselbe ID-Liste und dieselbe Slug-Regel); lib/places/__tests__/registry.test.ts hält beides gleich.
 */

/** Gebietsseite; Orts- und Kreisseiten liegen flach darunter (/einsatzgebiet/<slug>). */
export const EINSATZGEBIET_PATH = '/einsatzgebiet';

/** Ortsname → Slug: ä→ae, ö→oe, ü→ue, ß→ss, Klammern und Satzzeichen fallen weg. „Allendorf (Lumda)“ → „allendorf-lumda“. */
export function slugifyPlaceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Orts-ID der Messung → bisherige ID in lib/data/locations.ts (Karte der Startseite). */
export const HOME_MAP_LOCATION_IDS: Readonly<Record<string, string>> = Object.freeze({
  wetzlar: 'loc-wetzlar-mitte',
  hermannstein: 'loc-hermannstein',
  nauborn: 'loc-nauborn',
  garbenheim: 'loc-garbenheim',
  dutenhofen: 'loc-dutenhofen',
  steindorf: 'loc-steindorf',
  asslar: 'loc-asslar',
  braunfels: 'loc-braunfels',
  giessen: 'loc-giessen',
  herborn: 'loc-herborn',
});

export interface HomeMapPlace {
  /** Orts-ID der Messung. */
  id: string;
  /** Bisherige ID der Startseitenkarte. */
  legacyLocationId: string;
  name: string;
  postalCode: string;
  distanceKm: number;
  minutes: number;
  lat: number;
  lng: number;
  /** Ortsseite /einsatzgebiet/<slug>. */
  path: string;
}

/** Die gemessenen Orte der Startseitenkarte in Messreihenfolge. */
export const HOME_MAP_PLACES: readonly HomeMapPlace[] = Object.freeze(
  MEASURED_PLACES.filter((measured) => measured.included && HOME_MAP_LOCATION_IDS[measured.id]).map((measured) => {
    if (measured.distanceKm == null || measured.minutes == null) {
      throw new Error(`Ort „${measured.id}“ der Startseitenkarte hat keine Strecke`);
    }
    return Object.freeze({
      id: measured.id,
      legacyLocationId: HOME_MAP_LOCATION_IDS[measured.id],
      name: measured.name,
      postalCode: measured.postalCode,
      distanceKm: measured.distanceKm,
      minutes: measured.minutes,
      lat: measured.lat,
      lng: measured.lng,
      path: `${EINSATZGEBIET_PATH}/${slugifyPlaceName(measured.name)}`,
    });
  }),
);
