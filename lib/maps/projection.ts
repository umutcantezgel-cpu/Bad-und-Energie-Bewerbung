/**
 * Projection for the typographic radius graphic (no tiles, no Google). A local equirectangular
 * projection around the region center: north is up, east is right, kilometres stay to scale.
 * Within 50 km of the center the error stays far below one SVG unit.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface SvgPoint {
  x: number;
  y: number;
}

/** Mean earth radius (IUGG) in km. */
const EARTH_RADIUS_KM = 6371.0088;
/** Length of one degree of latitude in km. */
const KM_PER_DEGREE = (Math.PI * EARTH_RADIUS_KM) / 180;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const round1 = (value: number) => Math.round(value * 10) / 10;

export interface RadiusProjectionOptions {
  center: LatLng;
  radiusKm: number;
  /** Width and height of the square SVG viewBox. */
  size: number;
  /** Room between the radius circle and the viewBox edge. */
  padding: number;
}

export interface RadiusProjection {
  size: number;
  /** Middle of the viewBox; the region center lands here. */
  origin: SvgPoint;
  /** Radius circle in SVG units (equals `radiusKm`). */
  radius: number;
  unitsPerKm: number;
  /** Projects lat/lng into the viewBox, clamped to [0, size] so nothing renders off-canvas. */
  project(point: LatLng): SvgPoint;
  /** Same as `project`, without clamping. */
  projectRaw(point: LatLng): SvgPoint;
}

export function createRadiusProjection({ center, radiusKm, size, padding }: RadiusProjectionOptions): RadiusProjection {
  if (!(radiusKm > 0) || !(size > 0) || !(padding >= 0) || padding * 2 >= size) {
    throw new RangeError('createRadiusProjection: radiusKm and size must be positive, padding below size / 2.');
  }

  const radius = size / 2 - padding;
  const unitsPerKm = radius / radiusKm;
  const kmPerDegreeLng = KM_PER_DEGREE * Math.cos(toRadians(center.lat));
  const origin = { x: size / 2, y: size / 2 };

  const projectRaw = ({ lat, lng }: LatLng): SvgPoint => {
    const eastKm = (lng - center.lng) * kmPerDegreeLng;
    const northKm = (lat - center.lat) * KM_PER_DEGREE;
    return { x: round1(origin.x + eastKm * unitsPerKm), y: round1(origin.y - northKm * unitsPerKm) };
  };

  return {
    size,
    origin,
    radius,
    unitsPerKm,
    projectRaw,
    project: (point) => clampToBox(projectRaw(point), size),
  };
}

/** Keeps a point inside the square [inset, size - inset]. */
export function clampToBox(point: SvgPoint, size: number, inset = 0): SvgPoint {
  const clamp = (value: number) => Math.min(size - inset, Math.max(inset, value));
  return { x: clamp(point.x), y: clamp(point.y) };
}

/** Great-circle distance in km (haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Point on the circle around `origin` at `angleDeg` (0° = east, 90° = south, SVG orientation). */
export function pointOnCircle(origin: SvgPoint, radius: number, angleDeg: number): SvgPoint {
  const angle = toRadians(angleDeg);
  return { x: round1(origin.x + radius * Math.cos(angle)), y: round1(origin.y + radius * Math.sin(angle)) };
}
