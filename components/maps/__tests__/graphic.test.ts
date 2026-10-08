import { describe, expect, it } from 'vitest';
import { REGION } from '@/lib/content/region';
import { boxesOverlap } from '@/lib/maps/labels';
import { createRadiusProjection, haversineKm } from '@/lib/maps/projection';
import {
  CENTER_DOT_RADIUS,
  CENTER_LABEL_ID,
  GRAPHIC_PADDING,
  GRAPHIC_SIZE,
  graphicLabels,
  radiusLineBoxes,
  radiusNote,
} from '../graphic';
import type { RegionMapData } from '../types';

const center = { lat: REGION.center.latitude, lng: REGION.center.longitude };
const projection = createRadiusProjection({ center, radiusKm: REGION.radiusKm, size: GRAPHIC_SIZE, padding: GRAPHIC_PADDING });
const data: RegionMapData = {
  centerName: REGION.center.name,
  radiusKm: REGION.radiusKm,
  size: projection.size,
  origin: projection.origin,
  radius: projection.radius,
  places: REGION.locations.map((l) => {
    const point = { lat: l.latitude, lng: l.longitude };
    return { ...l, ...projection.project(point), atCenter: haversineKm(center, point) < 0.5 };
  }),
};

describe('graphicLabels', () => {
  it('always labels the center', () => {
    expect(graphicLabels(data, null).map((l) => l.id)).toContain(CENTER_LABEL_ID);
  });

  it.each(REGION.locations.filter((l) => l.id !== 'loc-wetzlar-mitte').map((l) => l.id))(
    'always shows the selected place %s, without overlapping labels or the radius note',
    (id) => {
      const labels = graphicLabels(data, id);
      expect(labels[0].id).toBe(id);
      const note = radiusNote(data).box;
      labels.forEach((a, i) => {
        expect(boxesOverlap(a.box, note)).toBe(false);
        labels.slice(i + 1).forEach((b) => expect(boxesOverlap(a.box, b.box)).toBe(false));
      });
    },
  );

  it('labels the outer towns when nothing is selected', () => {
    const texts = graphicLabels(data, null).map((l) => l.text);
    expect(texts).toEqual(expect.arrayContaining(['Wetzlar', 'Gießen', 'Herborn', 'Braunfels']));
  });

  it('notes the radius from REGION', () => {
    expect(radiusNote(data).text).toBe(`${REGION.radiusKm} km`);
  });
});

describe('graphicLabels spacing', () => {
  const lineBoxes = radiusLineBoxes(data);

  it('keeps the centre label clear of the centre dot (radius 6 + stroke + 4 units of air)', () => {
    const center = graphicLabels(data, null).find((l) => l.id === CENTER_LABEL_ID)!;
    const clearance = CENTER_DOT_RADIUS + 1 + 4;
    const dx = Math.max(center.box.x0 - data.origin.x, data.origin.x - center.box.x1, 0);
    const dy = Math.max(center.box.y0 - data.origin.y, data.origin.y - center.box.y1, 0);
    expect(Math.max(dx, dy)).toBeGreaterThanOrEqual(clearance);
  });

  it.each([null, ...REGION.locations.filter((l) => l.id !== 'loc-wetzlar-mitte').map((l) => l.id)])(
    'always names the centre (selected: %s)',
    (id) => {
      expect(graphicLabels(data, id).map((l) => l.id)).toContain(CENTER_LABEL_ID);
    },
  );

  it.each([null, ...REGION.locations.filter((l) => l.id !== 'loc-wetzlar-mitte').map((l) => l.id)])(
    'no label sits on the dashed radius line (selected: %s)',
    (id) => {
      for (const label of graphicLabels(data, id)) {
        for (const box of lineBoxes) expect(boxesOverlap(label.box, box)).toBe(false);
      }
    },
  );

  it.each(REGION.locations.filter((l) => l.id !== 'loc-wetzlar-mitte').map((l) => l.id))(
    'the selected label %s does not cover other dots',
    (id) => {
      const [label] = graphicLabels(data, id);
      for (const place of data.places) {
        if (place.id === id || place.atCenter) continue;
        const dot = { x0: place.x - 3, y0: place.y - 3, x1: place.x + 3, y1: place.y + 3 };
        expect(boxesOverlap(label.box, dot)).toBe(false);
      }
    },
  );
});
