import { BASE_URL, ORG_ID, HQ_ADDRESS, HQ_GEO, LOCAL_BUSINESS_ID } from './schema';
import { SITE_CONFIG } from './site-config';

export type CityConfig = {
  name: string;
  slug: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  wikidataId?: string;
  radiusKm: number;
};

export type RegionConfig = {
  name: string;
  slug: string;
  cities: CityConfig[];
};

export const HESSEN_REGIONS: RegionConfig[] = [
  {
    name: 'Lahn Dill Kreis',
    slug: 'lahn-dill-kreis',
    cities: [
      {
        name: 'Wetzlar',
        slug: 'wetzlar',
        postalCode: '35578',
        latitude: 50.56499,
        longitude: 8.49842,
        wikidataId: 'Q4172',
        radiusKm: 15,
      },
      {
        name: 'Aßlar',
        slug: 'asslar',
        postalCode: '35614',
        latitude: 50.5917,
        longitude: 8.4611,
        wikidataId: 'Q587979',
        radiusKm: 20,
      },
      {
        name: 'Braunfels',
        slug: 'braunfels',
        postalCode: '35619',
        latitude: 50.5167,
        longitude: 8.3833,
        wikidataId: 'Q519894',
        radiusKm: 25,
      },
      {
        name: 'Herborn',
        slug: 'herborn',
        postalCode: '35745',
        latitude: 50.6833,
        longitude: 8.3000,
        wikidataId: 'Q519782',
        radiusKm: 30,
      },
    ],
  },
  {
    name: 'Landkreis Gießen',
    slug: 'landkreis-giessen',
    cities: [
      {
        name: 'Gießen',
        slug: 'giessen',
        postalCode: '35390',
        latitude: 50.5872,
        longitude: 8.6755,
        wikidataId: 'Q3870',
        radiusKm: 20,
      },
      {
        name: 'Wettenberg',
        slug: 'wettenberg',
        postalCode: '35435',
        latitude: 50.6167,
        longitude: 8.6500,
        wikidataId: 'Q560124',
        radiusKm: 25,
      },
      {
        name: 'Linden',
        slug: 'linden',
        postalCode: '35440',
        latitude: 50.5333,
        longitude: 8.6500,
        wikidataId: 'Q559868',
        radiusKm: 25,
      },
    ],
  },
];

/**
 * Generates schema.org AreaServed nodes linking regional dominance
 * without fake address spam penalties.
 */
export function getLocalDominancePyramidSchema() {
  return HESSEN_REGIONS.flatMap((region) =>
    region.cities.map((city) => ({
      '@type': 'GeoCircle',
      '@id': `${BASE_URL}/#geo-${city.slug}`,
      name: `Einsatzgebiet ${city.name} und Umgebung`,
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: city.latitude,
        longitude: city.longitude,
      },
      geoRadius: city.radiusKm * 1000,
      description: `Regionales Servicegebiet der ${SITE_CONFIG.companyName} für Sanitär Heizung Wärmepumpen und Klimatechnik im Raum ${city.name}. Maximal ${city.radiusKm} km Radius ab Wetzlar, keine Fernmontagen.`,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: region.name,
      },
    }))
  );
}
