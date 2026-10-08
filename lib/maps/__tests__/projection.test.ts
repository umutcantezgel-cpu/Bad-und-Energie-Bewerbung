import { describe, expect, it } from 'vitest';
import { REGION } from '@/lib/content/region';
import { MAP_POIS } from '../google-maps-config';
import { clampToBox, createRadiusProjection, haversineKm, pointOnCircle } from '../projection';

const center = { lat: REGION.center.latitude, lng: REGION.center.longitude };
const SIZE = 360;
const PADDING = 20;
const projection = createRadiusProjection({ center, radiusKm: REGION.radiusKm, size: SIZE, padding: PADDING });

/** Point `km` kilometres from the center along a bearing (north = 0°, east = 90°). */
function offset(km: number, bearingDeg: number) {
  const d = km / 6371.0088;
  const b = (bearingDeg * Math.PI) / 180;
  const lat1 = (center.lat * Math.PI) / 180;
  const lng1 = (center.lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b));
  const lng2 = lng1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

describe('createRadiusProjection', () => {
  it('puts the region center in the middle of the viewBox', () => {
    expect(projection.origin).toEqual({ x: SIZE / 2, y: SIZE / 2 });
    expect(projection.project(center)).toEqual({ x: 180, y: 180 });
    expect(projection.radius).toBe(SIZE / 2 - PADDING);
  });

  it('keeps kilometres to scale: the radius lands on the circle in every direction', () => {
    const r = projection.radius;
    for (const [bearing, expected] of [
      [0, { x: 180, y: 180 - r }],
      [90, { x: 180 + r, y: 180 }],
      [180, { x: 180, y: 180 + r }],
      [270, { x: 180 - r, y: 180 }],
    ] as const) {
      const p = projection.project(offset(REGION.radiusKm, bearing));
      // Equirectangular approximation: off by less than one SVG unit at 35 km.
      expect(Math.abs(p.x - expected.x)).toBeLessThan(1);
      expect(Math.abs(p.y - expected.y)).toBeLessThan(1);
    }
  });

  it('is north-up and east-right', () => {
    const north = projection.project({ lat: center.lat + 0.05, lng: center.lng });
    const east = projection.project({ lat: center.lat, lng: center.lng + 0.05 });
    expect(north.y).toBeLessThan(180);
    expect(north.x).toBe(180);
    expect(east.x).toBeGreaterThan(180);
    expect(east.y).toBe(180);
  });

  it('places every REGION location inside the box and inside the 35 km circle', () => {
    for (const location of REGION.locations) {
      const p = projection.project({ lat: location.latitude, lng: location.longitude });
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(SIZE);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(SIZE);
      expect(Math.hypot(p.x - 180, p.y - 180)).toBeLessThan(projection.radius);
    }
  });

  it('matches the haversine distance within one SVG unit', () => {
    for (const location of REGION.locations) {
      const point = { lat: location.latitude, lng: location.longitude };
      const p = projection.project(point);
      const svgKm = Math.hypot(p.x - 180, p.y - 180) / projection.unitsPerKm;
      expect(Math.abs(svgKm - haversineKm(center, point)) * projection.unitsPerKm).toBeLessThan(1);
    }
  });

  it('places the real towns in their compass direction', () => {
    const at = (id: string) => {
      const l = REGION.locations.find((loc) => loc.id === id)!;
      return projection.project({ lat: l.latitude, lng: l.longitude });
    };
    expect(at('loc-giessen').x).toBeGreaterThan(180); // Gießen liegt östlich
    expect(at('loc-herborn').x).toBeLessThan(180); // Herborn nordwestlich
    expect(at('loc-herborn').y).toBeLessThan(180);
    expect(at('loc-braunfels').y).toBeGreaterThan(180); // Braunfels südwestlich
  });

  it('clamps far-away points to the box but leaves projectRaw unclamped', () => {
    const far = offset(500, 90);
    expect(projection.project(far).x).toBe(SIZE);
    expect(projection.projectRaw(far).x).toBeGreaterThan(SIZE);
  });

  it('rejects impossible geometry', () => {
    expect(() => createRadiusProjection({ center, radiusKm: 0, size: 100, padding: 10 })).toThrow(RangeError);
    expect(() => createRadiusProjection({ center, radiusKm: 35, size: 100, padding: 50 })).toThrow(RangeError);
  });
});

describe('helpers', () => {
  it('clampToBox respects the inset', () => {
    expect(clampToBox({ x: -5, y: 400 }, 360, 10)).toEqual({ x: 10, y: 350 });
  });

  it('haversineKm: Wetzlar → Gießen is about 13 km as the crow flies', () => {
    const giessen = REGION.locations.find((l) => l.id === 'loc-giessen')!;
    expect(haversineKm(center, { lat: giessen.latitude, lng: giessen.longitude })).toBeCloseTo(12.8, 0);
    expect(haversineKm(center, center)).toBe(0);
  });

  it('pointOnCircle uses SVG orientation (90° = down)', () => {
    expect(pointOnCircle({ x: 0, y: 0 }, 10, 0)).toEqual({ x: 10, y: 0 });
    expect(pointOnCircle({ x: 0, y: 0 }, 10, 90)).toEqual({ x: 0, y: 10 });
  });
});

describe('MAP_POIS', () => {
  it('starts with the headquarters and merges places at the same spot', () => {
    expect(MAP_POIS[0]).toMatchObject({ type: 'headquarters', coordinates: { lat: center.lat, lng: center.lng } });
    const ids = MAP_POIS.map((poi) => poi.id);
    expect(ids).not.toContain('loc-wetzlar-mitte');
    expect(new Set(ids).size).toBe(ids.length);
    expect(MAP_POIS.length).toBe(REGION.locations.length);
  });
});
