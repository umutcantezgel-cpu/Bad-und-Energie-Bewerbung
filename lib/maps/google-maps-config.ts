import { REGION } from '@/lib/content/region';
import { haversineKm } from './projection';

/**
 * Data and styles for the Google map, loaded only after the 2-click consent. Places come from
 * REGION (lib/content/region.ts), the single source for the radius graphic and the commute table.
 */

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export const HEADQUARTERS_COORDINATES: MapCoordinates = Object.freeze({
  lat: REGION.center.latitude,
  lng: REGION.center.longitude,
});

export const MAX_SERVICE_RADIUS_KM = REGION.radiusKm;

/** Places closer than this to the headquarters share its marker (e.g. "Wetzlar Kernstadt"). */
export const CENTER_MERGE_KM = 0.5;

export interface MapPOI {
  id: string;
  name: string;
  type: 'headquarters' | 'place';
  coordinates: MapCoordinates;
  distanceKm: number;
  commuteMinutes: number;
}

export const MAP_POIS: readonly MapPOI[] = Object.freeze([
  Object.freeze({
    id: 'poi-hq',
    name: `Firmensitz, ${REGION.center.street}, ${REGION.center.postalCode} ${REGION.center.name}`,
    type: 'headquarters' as const,
    coordinates: HEADQUARTERS_COORDINATES,
    distanceKm: 0,
    commuteMinutes: 0,
  }),
  ...REGION.locations
    .filter((l) => haversineKm(HEADQUARTERS_COORDINATES, { lat: l.latitude, lng: l.longitude }) >= CENTER_MERGE_KM)
    .map((l) =>
      Object.freeze({
        id: l.id,
        name: l.name,
        type: 'place' as const,
        coordinates: Object.freeze({ lat: l.latitude, lng: l.longitude }),
        distanceKm: l.distanceKm,
        commuteMinutes: l.commuteMinutes,
      }),
    ),
]);

/** Map colors per color scheme. Mirrors the semantic roles in app/styles/theme.css. */
export interface MapPalette {
  land: string;
  water: string;
  road: string;
  roadMajor: string;
  label: string;
  labelStrong: string;
  labelHalo: string;
  /** Markers: ink fill on a surface ring; the radius circle uses lineStrong. */
  ink: string;
  surface: string;
  lineStrong: string;
}

export const MAP_PALETTES: Readonly<Record<'light' | 'dark', MapPalette>> = Object.freeze({
  light: Object.freeze({
    land: '#F5F6F8',
    water: '#DCE5EE',
    road: '#FFFFFF',
    roadMajor: '#E3E6EB',
    label: '#5F6878',
    labelStrong: '#0A1E3A',
    labelHalo: '#FFFFFF',
    ink: '#0A1E3A',
    surface: '#FFFFFF',
    lineStrong: '#7D8696',
  }),
  dark: Object.freeze({
    land: '#121826',
    water: '#0B0F17',
    road: '#1A2131',
    roadMajor: '#232B3A',
    label: '#A3ACBA',
    labelStrong: '#F2F4F7',
    labelHalo: '#0B0F17',
    ink: '#F2F4F7',
    surface: '#0B0F17',
    lineStrong: '#6B7587',
  }),
});

/** Quiet base map: no business POIs, no transit, no icons; towns and roads in two tones. */
export function buildMapStyle(p: MapPalette): google.maps.MapTypeStyle[] {
  return [
    { elementType: 'geometry', stylers: [{ color: p.land }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: p.label }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: p.labelHalo }] },
    { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: p.labelStrong }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: p.road }] },
    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: p.roadMajor }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: p.water }] },
    { featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ];
}
