import { SITE_CONFIG } from '@/lib/seo/site-config';
import { regionalLocations, RegionalLocation } from '@/lib/data/locations';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export const HEADQUARTERS_COORDINATES: MapCoordinates = {
  lat: SITE_CONFIG.headquarters.geo.latitude, // 50.56499
  lng: SITE_CONFIG.headquarters.geo.longitude, // 8.49842
};

export const DEFAULT_MAP_ZOOM = 12;
export const MAX_SERVICE_RADIUS_KM = 35;

/**
 * Mandatory Solution Attribution ID for Google Maps Platform tracking
 */
export const GMP_ATTRIBUTION_IDS = ['gmp_git_agentskills_v1'];

export interface MapPOI {
  id: string;
  name: string;
  type: 'headquarters' | 'service_hub' | 'core_zone' | 'region';
  coordinates: MapCoordinates;
  address: string;
  distanceKm: number;
  commuteMinutes: number;
  description: string;
  badge: string;
}

export const MAP_POIS: MapPOI[] = [
  {
    id: 'poi-hq',
    name: 'Firmensitz & Meisterbüro Wetzlar',
    type: 'headquarters',
    coordinates: HEADQUARTERS_COORDINATES,
    address: 'Siegmund-Hiepe-Str. 20, 35578 Wetzlar',
    distanceKm: 0,
    commuteMinutes: 0,
    description: 'Zentrale Verwaltung, Werkstatt, Schulungsräume und Startpunkt aller Kundendienstfahrzeuge.',
    badge: 'Firmensitz seit 1926',
  },
  ...regionalLocations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    type: loc.isCoreZone ? ('core_zone' as const) : ('service_hub' as const),
    coordinates: { lat: loc.latitude, lng: loc.longitude },
    address: `${loc.plz} ${loc.name}`,
    distanceKm: loc.distanceKm,
    commuteMinutes: loc.commuteMinutes,
    description: loc.character,
    badge: loc.isCoreZone ? 'Kerngebiet' : 'Regionales Einsatzgebiet',
  })),
];

/**
 * Apple-Silver Minimalist Map Styling for Google Maps
 * Clean porcelain tones, light water, subtle roads, zero clutter.
 */
export const APPLE_SILVER_MAP_STYLE: google.maps.MapTypeStyle[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f8fafc' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e2f5ea' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#f1f5f9' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#fed7aa' }], // Soft warm accent for Autobahn A45 / B49
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#fdba74' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e0f2fe' }], // Lahn river soft blue
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284c7' }],
  },
];

/**
 * Midnight Meister Map Styling for Google Maps (Dark Apple Luxury)
 * Deep navy tones matching Bad und Energie corporate colors (#0A1E3A).
 */
export const MIDNIGHT_MEISTER_MAP_STYLE: google.maps.MapTypeStyle[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#0A1E3A' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#050f1e' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#132B50' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#0284C7' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#061324' }],
  },
];
