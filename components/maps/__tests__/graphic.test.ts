import { describe, expect, it } from 'vitest';
import { REGION } from '@/lib/content/region';
import { boxesOverlap } from '@/lib/maps/labels';
import { createRadiusProjection, haversineKm } from '@/lib/maps/projection';
import { CENTER_LABEL_ID, GRAPHIC_PADDING, GRAPHIC_SIZE, graphicLabels, radiusNote } from '../graphic';
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
