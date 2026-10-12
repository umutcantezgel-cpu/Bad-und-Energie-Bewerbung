import { SITE_CONFIG } from '@/lib/seo/site-config';

import { ALL_PLACES } from './data';
import { KREIS_DEFS, KREIS_IDS, type KreisDef, type KreisId } from './kreise';
import type { Place } from './schema';

export type { Place };
export type { KreisId };

/** Hub des Einsatzgebiets; Orte und Kreis-Hubs liegen flach darunter (/einsatzgebiet/<slug>). */
export const EINSATZGEBIET_PATH = '/einsatzgebiet';

/** Ein Kreis bekommt eine eigene Seite erst ab so vielen veröffentlichten Orten (Plan „Seitenarchitektur“). */
export const KREIS_HUB_MIN_PLACES = 3;

export interface Kreis extends KreisDef {
  /** Veröffentlichte Orte im Kreis. */
  placeCount: number;
  /** Eigene Seite /einsatzgebiet/<slug>; sonst ein Abschnitt der Gebietsseite. */
  hasHub: boolean;
}

/** Strecke, dann Fahrzeit, dann Name: feste Reihenfolge für Listen und Ränge. */
export function compareByDistance(a: Place, b: Place): number {
  return (
    a.commute.distanceKm - b.commute.distanceKm ||
    a.commute.minutes - b.commute.minutes ||
    a.name.localeCompare(b.name, 'de')
  );
}

const PUBLISHED: readonly Place[] = Object.freeze(ALL_PLACES.filter((place) => place.status === 'published'));

const KREISE: readonly Kreis[] = Object.freeze(
  KREIS_IDS.map((id) => {
    const placeCount = PUBLISHED.filter((place) => place.kreisId === id).length;
    return Object.freeze({ ...KREIS_DEFS[id], placeCount, hasHub: placeCount >= KREIS_HUB_MIN_PLACES });
  }).filter((kreis) => kreis.placeCount > 0),
);

function assertRegistry(places: readonly Place[]): void {
  const ids = new Set<string>();
  const slugs = new Map<string, string>();
  const claim = (slug: string, owner: string) => {
    const other = slugs.get(slug);
    if (other) throw new Error(`Slug „${slug}“ doppelt unter ${EINSATZGEBIET_PATH}: ${other} und ${owner}`);
    slugs.set(slug, owner);
  };
  for (const place of places) {
    if (ids.has(place.id)) throw new Error(`Orts-ID doppelt: ${place.id}`);
    ids.add(place.id);
    for (const slug of [place.slug, ...place.redirectFrom]) claim(slug, `Ort ${place.id}`);
  }
  // Kreis-Slugs bleiben reserviert, auch ohne Hub: Ein Kreis kann später drei Orte bekommen.
  for (const id of KREIS_IDS) claim(KREIS_DEFS[id].slug, `Kreis ${id}`);
  for (const place of places) {
    if (place.parentId && !ids.has(place.parentId)) throw new Error(`${place.id}: Elternort ${place.parentId} fehlt`);
  }
}

assertRegistry(ALL_PLACES);

/** Alle Orte in Messreihenfolge, unabhängig vom Status. */
export function getAllPlaces(): readonly Place[] {
  return ALL_PLACES;
}

/** Orte mit eigener Seite, sortiert nach Strecke. */
export function getPublishedPlaces(): Place[] {
  return [...PUBLISHED].sort(compareByDistance);
}

export function getPlaceById(id: string): Place | undefined {
  return ALL_PLACES.find((place) => place.id === id);
}

/** Sucht nur den aktuellen Slug, unabhängig vom Status. Seiten prüfen `status` selbst. */
export function getPlaceBySlug(slug: string): Place | undefined {
  return ALL_PLACES.find((place) => place.slug === slug);
}

/** Alter Slug aus `redirectFrom` → Ort, auf den per 308 weitergeleitet wird. */
export function getPlaceByLegacySlug(slug: string): Place | undefined {
  return ALL_PLACES.find((place) => place.redirectFrom.includes(slug));
}

/**
 * Orts-Slugs mit eigener Route: veröffentlichte Orte (Seite) sowie zusammengelegte und archivierte Orte, deren
 * Route per 308 auf die Kreis- bzw. Gebietsseite zeigt (placeRedirectPath). pending hat keine Route.
 */
export function getPlacePageSlugs(): string[] {
  return ALL_PLACES.filter((place) => place.status !== 'pending').map((place) => place.slug);
}

export function getKreise(): Kreis[] {
  return [...KREISE];
}

export function getKreisById(id: string): Kreis | undefined {
  return KREISE.find((kreis) => kreis.id === id);
}

export function getKreisBySlug(slug: string): Kreis | undefined {
  return KREISE.find((kreis) => kreis.slug === slug);
}

/** Kreis eines Orts; jeder Ort hat einen (Schema: kreisId aus KREIS_IDS, Kreis mit ≥ 1 Ort). */
export function getPlaceKreis(place: Pick<Place, 'kreisId'>): Kreis {
  const kreis = getKreisById(place.kreisId);
  if (!kreis) throw new Error(`Kreis ${place.kreisId} ohne veröffentlichten Ort`);
  return kreis;
}

/** Veröffentlichte Orte eines Kreises, nach Strecke. */
export function getKreisPlaces(kreisId: string): Place[] {
  return getPublishedPlaces().filter((place) => place.kreisId === kreisId);
}

/** Kreise mit eigener Hub-Seite (≥ KREIS_HUB_MIN_PLACES veröffentlichte Orte). */
export function getHubKreise(): Kreis[] {
  return KREISE.filter((kreis) => kreis.hasHub);
}

/** Veröffentlichte Stadtteile eines Orts (Wetzlar), nach Strecke. */
export function getStadtteile(parentId: string): Place[] {
  return getPublishedPlaces().filter((place) => place.parentId === parentId);
}

/** Alle Segmente mit eigener Seite unter /einsatzgebiet: Orte und Kreis-Hubs (generateStaticParams). */
export function getEinsatzgebietPageSlugs(): string[] {
  return [...getPlacePageSlugs(), ...getHubKreise().map((kreis) => kreis.slug)];
}

const baseUrl = () => SITE_CONFIG.baseUrl.replace(/\/+$/, '');

export function placePath(place: Pick<Place, 'slug'>): string {
  return `${EINSATZGEBIET_PATH}/${place.slug}`;
}

export function placeUrl(place: Pick<Place, 'slug'>): string {
  return `${baseUrl()}${placePath(place)}`;
}

/** Hub-Seite des Kreises oder, ohne Hub, sein Abschnitt auf der Gebietsseite. */
export function kreisPath(kreis: Pick<Kreis, 'slug' | 'hasHub'>): string {
  return kreis.hasHub ? `${EINSATZGEBIET_PATH}/${kreis.slug}` : `${EINSATZGEBIET_PATH}#${kreis.slug}`;
}

export function kreisUrl(kreis: Pick<Kreis, 'slug' | 'hasHub'>): string {
  return `${baseUrl()}${kreisPath(kreis)}`;
}

export function einsatzgebietUrl(): string {
  return `${baseUrl()}${EINSATZGEBIET_PATH}`;
}

/** Ziel der 308 für zusammengelegte und archivierte Orte: der Kreis-Hub, sonst die Gebietsseite. */
export function placeRedirectPath(place: Place): string | undefined {
  if (place.status !== 'merged' && place.status !== 'archived') return undefined;
  return kreisPath(getPlaceKreis(place));
}

export type EinsatzgebietRoute =
  | { type: 'place'; place: Place }
  | { type: 'kreis'; kreis: Kreis }
  | { type: 'redirect'; to: string };

/**
 * Löst ein Segment unter /einsatzgebiet auf: Ortsseite, Kreis-Hub oder Weiterleitung (alter Slug,
 * zusammengelegter Ort, Kreis ohne Hub). undefined = 404.
 */
export function resolveEinsatzgebietSlug(slug: string): EinsatzgebietRoute | undefined {
  const place = getPlaceBySlug(slug);
  if (place?.status === 'published') return { type: 'place', place };
  if (place) {
    const to = placeRedirectPath(place);
    return to ? { type: 'redirect', to } : undefined;
  }
  const legacy = getPlaceByLegacySlug(slug);
  if (legacy?.status === 'published') return { type: 'redirect', to: placePath(legacy) };
  if (legacy) {
    const to = placeRedirectPath(legacy);
    return to ? { type: 'redirect', to } : undefined;
  }
  const kreisDef = KREIS_IDS.map((id) => KREIS_DEFS[id]).find((def) => def.slug === slug);
  if (kreisDef) {
    const kreis = getKreisById(kreisDef.id);
    if (kreis?.hasHub) return { type: 'kreis', kreis };
    return { type: 'redirect', to: kreis ? kreisPath(kreis) : EINSATZGEBIET_PATH };
  }
  return undefined;
}
