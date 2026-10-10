import { describe, expect, it } from 'vitest';
import { REGION } from '@/lib/content/region';
import { boxesOverlap } from '@/lib/maps/labels';
import {
  CENTER_DOT_RADIUS,
  CENTER_LABEL_ID,
  PENDEL_PAIR,
  graphicLabels,
  labelFrame,
  octilinear,
  offsetPolyline,
  pendelPaths,
  ringLabels,
  type LabelFrame,
} from '../graphic';
import { buildRegionMapData } from '../views';

const data = buildRegionMapData();
const view35 = data.views[data.radii.indexOf(REGION.radiusKm)];
/** The promise view (35 km), as the graphic shows it by default. */
const frame: LabelFrame = labelFrame(data, view35);
const outerIds = REGION.locations.filter((l) => l.id !== 'loc-wetzlar-mitte').map((l) => l.id);

describe('graphicLabels', () => {
  it('always labels the center', () => {
    expect(graphicLabels(frame, null).map((l) => l.id)).toContain(CENTER_LABEL_ID);
  });

  it.each(outerIds)('always shows the selected place %s, without overlapping labels or the ring labels', (id) => {
    const labels = graphicLabels(frame, id);
    expect(labels[0].id).toBe(id);
    labels.forEach((a, i) => {
      for (const obstacle of frame.obstacles ?? []) expect(boxesOverlap(a.box, obstacle)).toBe(false);
      labels.slice(i + 1).forEach((b) => expect(boxesOverlap(a.box, b.box)).toBe(false));
    });
  });

  it('labels the outer towns when nothing is selected', () => {
    const texts = graphicLabels(frame, null).map((l) => l.text);
    expect(texts).toEqual(expect.arrayContaining(['Wetzlar', 'Gießen', 'Herborn', 'Braunfels']));
  });

  it('keeps the centre label clear of the centre house (half size + stroke + 4 units of air)', () => {
    const center = graphicLabels(frame, null).find((l) => l.id === CENTER_LABEL_ID)!;
    const clearance = CENTER_DOT_RADIUS + 1 + 4;
    const dx = Math.max(center.box.x0 - frame.origin.x, frame.origin.x - center.box.x1, 0);
    const dy = Math.max(center.box.y0 - frame.origin.y, frame.origin.y - center.box.y1, 0);
    expect(Math.max(dx, dy)).toBeGreaterThanOrEqual(clearance);
  });

  it.each([null, ...outerIds])('always names the centre (selected: %s)', (id) => {
    expect(graphicLabels(frame, id).map((l) => l.id)).toContain(CENTER_LABEL_ID);
  });

  it.each(outerIds)('the selected label %s does not cover other dots', (id) => {
    const [label] = graphicLabels(frame, id);
    for (const place of frame.places) {
      if (place.id === id || place.atCenter) continue;
      const dot = { x0: place.x - 3, y0: place.y - 3, x1: place.x + 3, y1: place.y + 3 };
      expect(boxesOverlap(label.box, dot)).toBe(false);
    }
  });

  it.each(data.radii)('in the %s km view no label covers a ring label or a landscape label', (km) => {
    const view = data.views[data.radii.indexOf(km)];
    const f = labelFrame(data, view);
    for (const id of [null, ...f.places.map((p) => p.id)]) {
      for (const label of graphicLabels(f, id)) {
        for (const obstacle of f.obstacles ?? []) expect(boxesOverlap(label.box, obstacle)).toBe(false);
      }
    }
  });

  it('keeps the labels of Herborn and Gießen off the landscape lines in the 35 km view', () => {
    const labels = graphicLabels(frame, null).filter((l) => ['Herborn', 'Gießen'].includes(l.text));
    expect(labels).toHaveLength(2);
    for (const label of labels) {
      for (const box of frame.softObstacles ?? []) expect(boxesOverlap(label.box, box)).toBe(false);
    }
  });

  it('labels more of the inner places when zoomed in to 15 km', () => {
    const inner = (f: LabelFrame) => graphicLabels(f, null).filter((l) => ['Nauborn', 'Garbenheim', 'Steindorf', 'Aßlar'].includes(l.text));
    const view15 = data.views[data.radii.indexOf(15)];
    expect(inner(labelFrame(data, view15)).length).toBeGreaterThan(inner(frame).length);
  });
});

describe('ringLabels', () => {
  it('names every ring of the view in km, the chosen one included', () => {
    expect(ringLabels(view35).map((r) => r.text)).toEqual(data.radii.map((km) => `${km} km`));
  });

  it('keeps the ring labels inside the frame', () => {
    for (const view of data.views) {
      for (const label of ringLabels(view)) {
        expect(label.box.x0).toBeGreaterThanOrEqual(0);
        expect(label.box.x1).toBeLessThanOrEqual(view.size);
        expect(label.box.y0).toBeGreaterThanOrEqual(0);
        expect(label.box.y1).toBeLessThanOrEqual(view.size);
      }
    }
  });
});

describe('Leitungsführung', () => {
  const angle = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    ((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 360) % 45;

  it('routes only at 0°, 45° and 90° (Formsystem K-010)', () => {
    const route = octilinear({ x: 0, y: 0 }, { x: 100, y: -30 });
    expect(route).toHaveLength(3);
    route.slice(1).forEach((p, i) => expect(Math.min(angle(route[i], p), 45 - angle(route[i], p))).toBeLessThan(0.5));
    expect(route.at(-1)).toEqual({ x: 100, y: -30 });
  });

  it('offsets a polyline in parallel with mitred joints', () => {
    const shifted = offsetPolyline(
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 30, y: 10 },
      ],
      2,
    );
    // The last leg is horizontal: its copy keeps distance 2.
    expect(Math.abs(shifted[2].y - 10)).toBeCloseTo(2, 1);
    expect(Math.abs(shifted[1].y - 10)).toBeCloseTo(2, 1);
  });

  it('draws the Pendel as a pair (Vorlauf out, Rücklauf back) for a place away from the centre', () => {
    const giessen = view35.points[data.places.findIndex((p) => p.id === 'loc-giessen')];
    const pendel = pendelPaths(view35.origin, giessen);
    expect(pendel).not.toBeNull();
    expect(pendel!.vorlauf).toMatch(/^M[\d.]+ [\d.]+(L[\d.]+ [\d.]+)+$/);
    expect(pendel!.ruecklauf).not.toBe(pendel!.vorlauf);
    expect(PENDEL_PAIR).toBeGreaterThan(3);
  });

  it('draws no Pendel when the place sits next to the house', () => {
    expect(pendelPaths({ x: 180, y: 180 }, { x: 185, y: 178 })).toBeNull();
  });
});
