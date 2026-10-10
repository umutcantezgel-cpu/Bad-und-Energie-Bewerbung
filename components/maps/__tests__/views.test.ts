import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { REGION } from '@/lib/content/region';
import { regionalLocations } from '@/lib/data/locations';
import { haversineKm } from '@/lib/maps/projection';
import { LANDSCAPE } from '../landscape';
import { SWITCH_RADII_KM, WITHHELD_CHARACTER_IDS, buildRegionMapData, placeCharacter } from '../views';

const data = buildRegionMapData();
const center = { lat: REGION.center.latitude, lng: REGION.center.longitude };
const view = (km: number) => data.views[data.radii.indexOf(km)];
const index = (id: string) => data.places.findIndex((p) => p.id === id);
const distanceUnits = (km: number, id: string) => {
  const v = view(km);
  const p = v.points[index(id)];
  return Math.hypot(p.x - v.origin.x, p.y - v.origin.y);
};

describe('Radius-Umschalter (E-START-033)', () => {
  it('offers 15, 25 and 35 km; the promise stays REGION.radiusKm', () => {
    expect(SWITCH_RADII_KM).toEqual([15, 25, 35]);
    expect(data.radiusKm).toBe(REGION.radiusKm);
    expect(data.views.map((v) => v.radiusKm)).toEqual([15, 25, 35]);
  });

  it('draws the rings to scale: 15, 25 and 35 km in the 35 km view', () => {
    const v = view(35);
    expect(v.rings.map((r) => r.km)).toEqual([15, 25, 35]);
    for (const ring of v.rings) expect(ring.r).toBeCloseTo(ring.km * v.unitsPerKm, 0);
    expect(v.rings.at(-1)!.r).toBeCloseTo(v.radius, 0);
  });

  it('puts Gießen inside the 15 km ring and Herborn between 15 and 25 km (straight-line distance)', () => {
    const v = view(35);
    const [r15, r25] = v.rings.map((r) => r.r);
    expect(distanceUnits(35, 'loc-giessen')).toBeLessThan(r15);
    expect(distanceUnits(35, 'loc-herborn')).toBeGreaterThan(r15);
    expect(distanceUnits(35, 'loc-herborn')).toBeLessThan(r25);
  });

  it('zooms: a smaller radius fills the frame, places beyond it fall outside the ring', () => {
    expect(view(15).radius).toBe(view(35).radius);
    expect(distanceUnits(15, 'loc-giessen')).toBeGreaterThan(distanceUnits(35, 'loc-giessen'));
    expect(distanceUnits(15, 'loc-herborn')).toBeGreaterThan(view(15).radius);
    expect(view(35).points.every((p) => p.inFrame)).toBe(true);
    for (const p of view(15).points) {
      if (!p.inFrame) continue;
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(view(15).size);
    }
  });

  it('keeps every place at its true relative position', () => {
    const v = view(35);
    for (const location of REGION.locations) {
      const p = v.points[index(location.id)];
      const km = haversineKm(center, { lat: location.latitude, lng: location.longitude });
      expect(Math.hypot(p.x - v.origin.x, p.y - v.origin.y) / v.unitsPerKm).toBeCloseTo(km, 0);
    }
  });

});

describe('Ortsbeschreibungen (E-START-038, M-016)', () => {
  const blocked = ['vielen Wärmepumpenmodernisierungen', 'anspruchsvollen Sanierungsobjekten', 'wichtiges Kundendienstgebiet'];

  it('withholds the three business claims, also from the client payload', () => {
    const payload = JSON.stringify(data);
    for (const phrase of blocked) expect(payload).not.toContain(phrase);
    for (const id of WITHHELD_CHARACTER_IDS) expect(placeCharacter(id)).toBeNull();
  });

  it('shows the seven location descriptions verbatim', () => {
    const shown = data.places.filter((p) => p.character !== null);
    expect(shown).toHaveLength(7);
    for (const place of shown) {
      expect(place.character).toBe(regionalLocations.find((l) => l.id === place.id)!.character);
    }
  });

  it('carries the rating (Kerngebiet) from the data', () => {
    for (const place of data.places) {
      expect(place.isCoreZone).toBe(regionalLocations.find((l) => l.id === place.id)!.isCoreZone);
    }
  });

  it('never names the unbacked headquarters claims of the old map', () => {
    const payload = JSON.stringify(data);
    for (const phrase of ['Schulungsräume', 'Startpunkt aller Kundendienstfahrzeuge', 'Firmensitz seit 1926']) {
      expect(payload).not.toContain(phrase);
    }
  });
});

describe('Landschaft (E-START-036)', () => {
  it('has exactly four schematic lines: Lahn, Dill, A45, B49', () => {
    expect(LANDSCAPE.map((l) => l.name)).toEqual(['Lahn', 'Dill', 'A45', 'B49']);
    for (const v of data.views) expect(v.landscape).toHaveLength(4);
  });

  it('routes every line at 0°, 45° and 90° only', () => {
    for (const v of data.views) {
      for (const line of v.landscape) {
        const pts = [...line.d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
        pts.slice(1).forEach((p, i) => {
          const dx = Math.abs(p.x - pts[i].x);
          const dy = Math.abs(p.y - pts[i].y);
          const ok = dx < 0.2 || dy < 0.2 || Math.abs(dx - dy) < 0.3;
          expect(ok, `${line.id}: ${JSON.stringify(pts[i])} → ${JSON.stringify(p)}`).toBe(true);
        });
      }
    }
  });

  it('labels at least three lines in the 35 km view, inside the frame', () => {
    const v = view(35);
    const labelled = v.landscape.filter((l) => l.label);
    expect(labelled.length).toBeGreaterThanOrEqual(3);
    for (const line of labelled) {
      expect(line.label!.box.x0).toBeGreaterThanOrEqual(0);
      expect(line.label!.box.x1).toBeLessThanOrEqual(v.size);
    }
  });

  it('stays far below the illustration budget (≤ 40 KB gzip, K-013)', () => {
    const svgPaths = data.views.flatMap((v) => v.landscape.map((l) => `<path d="${l.d}"/>`)).join('');
    expect(gzipSync(svgPaths).length).toBeLessThan(40 * 1024);
  });
});
