import type { MapStatus, RegionPlace } from './types';

const NBSP = '\u00A0';

/** „Kerngebiet“ / „Regionales Einsatzgebiet“ (lib/data/locations.ts isCoreZone). */
export function zoneLabel(place: Pick<RegionPlace, 'isCoreZone'>): string {
  return place.isCoreZone ? 'Kerngebiet' : 'Regionales Einsatzgebiet';
}

/**
 * Where a place lies relative to the chosen radius, in straight-line distance (`airKm`), the measure of the rings
 * („Radius um Wetzlar“, caption „Kreise in Luftlinie“). The hollow dots of the plan use the same rule (RadiusGraphic),
 * so dot, ring and sentence never disagree: Herborn (27 km Strecke, 18,9 km Luftlinie) lies inside the 25 km ring.
 * The road distance and the drive time stand above the sentence.
 */
export function radiusStatus(place: Pick<RegionPlace, 'name' | 'airKm'>, radiusKm: number, radii: readonly number[]): string {
  if (place.airKm <= radiusKm) return `${place.name} liegt in Luftlinie innerhalb von ${radiusKm}${NBSP}km.`;
  const ring = radii.find((km) => place.airKm <= km);
  return ring
    ? `${place.name} liegt in Luftlinie außerhalb von ${radiusKm}${NBSP}km, aber innerhalb von ${ring}${NBSP}km.`
    : `${place.name} liegt in Luftlinie außerhalb von ${radiusKm}${NBSP}km.`;
}

/** Whether a place lies beyond the chosen ring (straight line): drawn hollow, the card dashed. */
export function outsideRing(place: Pick<RegionPlace, 'airKm'>, radiusKm: number): boolean {
  return place.airKm > radiusKm;
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
