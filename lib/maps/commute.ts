import type { RegionLocation } from '@/lib/content/region';

/**
 * Pendelrechner lookups over REGION.locations (lib/content/region.ts). Pure and data-free, so the
 * client bundle only carries the places it is handed.
 */

export type CommutePlace = Pick<RegionLocation, 'id' | 'name' | 'postalCode' | 'distanceKm' | 'commuteMinutes'>;

const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };

/** "Gießen" / "Giessen" → "giessen", "Aßlar" → "asslar"; punctuation and extra spaces dropped. */
export function normalizePlaceName(value: string): string {
  return value
    .toLocaleLowerCase('de-DE')
    .replace(/[äöüß]/g, (char) => UMLAUTS[char] ?? char)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Finds a place by id, five-digit postal code, name (umlaut-insensitive) or an unambiguous name
 * prefix ("gies" → Gießen, "kern" → Wetzlar Kernstadt). Returns undefined when nothing or more
 * than one place matches.
 */
export function findCommute<T extends CommutePlace>(query: string, places: readonly T[]): T | undefined {
  const raw = query.trim();
  if (!raw) return undefined;

  const byId = places.find((place) => place.id === raw);
  if (byId) return byId;

  if (/^\d{5}$/.test(raw)) return places.find((place) => place.postalCode === raw);

  const needle = normalizePlaceName(raw);
  if (!needle) return undefined;

  const exact = places.filter((place) => normalizePlaceName(place.name) === needle);
  if (exact.length === 1) return exact[0];

  const prefixed = places.filter((place) => {
    const name = normalizePlaceName(place.name);
    return name.startsWith(needle) || name.split(' ').some((word) => word.startsWith(needle));
  });
  return prefixed.length === 1 ? prefixed[0] : undefined;
}

const integer = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

export function formatKm(km: number): string {
  return `${integer.format(km)} km`;
}

export function formatMinutes(minutes: number): string {
  return `${integer.format(minutes)} Min.`;
}

/** "ca. 15 km · 16 Min. bis Wetzlar" */
export function formatCommute(place: Pick<CommutePlace, 'distanceKm' | 'commuteMinutes'>, centerName: string): string {
  return `ca. ${formatKm(place.distanceKm)} · ${formatMinutes(place.commuteMinutes)} bis ${centerName}`;
}
