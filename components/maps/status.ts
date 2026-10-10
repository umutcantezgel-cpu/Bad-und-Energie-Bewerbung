import type { RegionPlace } from './types';

const NBSP = '\u00A0';

/** „Kerngebiet“ / „Regionales Einsatzgebiet“ (lib/data/locations.ts isCoreZone). */
export function zoneLabel(place: Pick<RegionPlace, 'isCoreZone'>): string {
  return place.isCoreZone ? 'Kerngebiet' : 'Regionales Einsatzgebiet';
}

/** Where a place lies relative to the chosen radius (table distance, as the visitor reads it). */
export function radiusStatus(place: Pick<RegionPlace, 'name' | 'distanceKm'>, radiusKm: number, radii: readonly number[]): string {
  if (place.distanceKm <= radiusKm) return `${place.name} liegt innerhalb von ${radiusKm}${NBSP}km.`;
  const ring = radii.find((km) => place.distanceKm <= km);
  return ring
    ? `${place.name} liegt außerhalb von ${radiusKm}${NBSP}km, aber innerhalb von ${ring}${NBSP}km.`
    : `${place.name} liegt außerhalb von ${radiusKm}${NBSP}km.`;
}
