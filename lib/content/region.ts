import { companyData } from '@/lib/data/company';
import { FACTS } from './facts';
import { regionalLocations } from '@/lib/data/locations';
import { SITE_CONFIG } from '@/lib/seo/site-config';

export interface RegionLocation {
  id: string;
  name: string;
  postalCode: string;
  distanceKm: number;
  commuteMinutes: number;
  latitude: number;
  longitude: number;
  isCoreZone: boolean;
}

export interface RegionArea {
  name: string;
  radiusKm: number;
  cities: readonly string[];
}

const locations: readonly RegionLocation[] = Object.freeze(
  [...regionalLocations]
    .sort((a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name, 'de'))
    .map((l) =>
      Object.freeze({
        id: l.id,
        name: l.name,
        postalCode: l.plz,
        distanceKm: l.distanceKm,
        commuteMinutes: l.commuteMinutes,
        latitude: l.latitude,
        longitude: l.longitude,
        isCoreZone: l.isCoreZone,
      }),
    ),
);

/** Einsatzgebiet: Zentrum Wetzlar, 35 km Radius, Orte mit Distanz und Fahrzeit aus lib/data/locations.ts. */
export const REGION = Object.freeze({
  center: Object.freeze({
    name: companyData.city,
    street: companyData.street,
    postalCode: companyData.postalCode,
    latitude: companyData.geo.latitude,
    longitude: companyData.geo.longitude,
  }),
  radiusKm: 35,
  headline: '35 km um Wetzlar. Keine Fernmontage.',
  summary:
    'Du arbeitest in Wetzlar, Gießen und dem Lahn-Dill-Kreis, ohne Hotelübernachtungen, und bist jeden Abend pünktlich zu Hause.',
  locations,
  areas: Object.freeze(
    SITE_CONFIG.serviceRegions.map(
      (r): RegionArea => Object.freeze({ name: r.name, radiusKm: r.radiusKm, cities: Object.freeze([...r.cities]) }),
    ),
  ),
  /** Meilenstein 2026 aus lib/data/company.ts, auf zwei Sätze gekürzt. */
  milestone: Object.freeze({
    year: 2026,
    text: `2026 sind wir in die ${companyData.street} umgezogen: moderneres Büro, größeres Lager. Als Wärmepumpen-Spezialist und Fachbetrieb des Lahn-Dill-Kreises modernisieren wir mit ${FACTS.employees15.value} Leuten Heizungen und Bäder.`,
  }),
});

export function getCommute(locationId: string): RegionLocation | undefined {
  return REGION.locations.find((l) => l.id === locationId);
}
