import type { MapStatus, RegionPlace } from './types';

const NBSP = '\u00A0';

/** „Kerngebiet“ / „Regionales Einsatzgebiet“ (lib/data/locations.ts isCoreZone). */
export function zoneLabel(place: Pick<RegionPlace, 'isCoreZone'>): string {
  return place.isCoreZone ? 'Kerngebiet' : 'Regionales Einsatzgebiet';
}

/**
 * Where a place lies relative to the chosen radius, by the distance of the place list (`distanceKm`, the
 * owner's figure, read as the road distance; KERN „Markierte Annahmen“), as the visitor reads it on the
 * card. The rings of the plan are drawn in straight-line distance; with today's data both agree (Gießen
 * 15 km / 12,8 km Luftlinie inside the 15 km ring, Herborn 24 km / 19,2 km between 15 and 25 km). The
 * hollow dots of the plan use the same rule, so dot, card and result never contradict each other.
 */
export function radiusStatus(place: Pick<RegionPlace, 'name' | 'distanceKm'>, radiusKm: number, radii: readonly number[]): string {
  if (place.distanceKm <= radiusKm) return `${place.name} liegt innerhalb von ${radiusKm}${NBSP}km.`;
  const ring = radii.find((km) => place.distanceKm <= km);
  return ring
    ? `${place.name} liegt außerhalb von ${radiusKm}${NBSP}km, aber innerhalb von ${ring}${NBSP}km.`
    : `${place.name} liegt außerhalb von ${radiusKm}${NBSP}km.`;
}

export interface MapsStatusInput {
  /** A Maps key is configured (the consent button is shown). */
  mapsAvailable: boolean;
  consent: boolean;
  /** „Karte wieder ausblenden“ was clicked in this page view. */
  hiddenByUser: boolean;
  mapStatus: MapStatus;
}

/**
 * Status line under the map button (role="status"). „Geladen“ only once the tiles are there and Google shows
 * no error dialog (GoogleRegionMap); every failure keeps the radius graphic and says so, without blaming anyone.
 */
export function mapsStatusText({ mapsAvailable, consent, hiddenByUser, mapStatus }: MapsStatusInput): string {
  if (mapsAvailable && consent) {
    if (mapStatus === 'loading') return 'Google Maps wird geladen …';
    if (mapStatus === 'ready') return 'Google Maps ist geladen.';
    return 'Die interaktive Karte ist gerade nicht verfügbar. Die Übersicht zeigt das Einsatzgebiet.';
  }
  return hiddenByUser ? 'Google Maps ist ausgeblendet.' : '';
}
