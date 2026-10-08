import { describe, expect, it } from 'vitest';
import { isGoogleMapsConfigured, isUsableMapsApiKey } from '../keys';
import { boxesOverlap, labelBox, layoutLabels } from '../labels';

const options = { size: 200, fontSize: 10, charWidth: 0.6, gap: 5, dotRadius: 3 };

describe('layoutLabels', () => {
  it('places a lone label to the right of its dot', () => {
    const [label] = layoutLabels([{ id: 'a', text: 'Ort', x: 50, y: 50 }], options);
    expect(label).toMatchObject({ id: 'a', side: 'right', anchor: 'start', x: 55, y: 50 });
    expect(label.box).toEqual({ x0: 55, y0: 45, x1: 73, y1: 55 });
  });

  it('switches sides near the right edge', () => {
    const [label] = layoutLabels([{ id: 'a', text: 'Langer Name', x: 190, y: 100 }], options);
    expect(label.side).toBe('left');
    expect(label.anchor).toBe('end');
  });

  it('never overlaps labels, foreign dots or obstacles, and stays inside the box', () => {
    const points = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`,
      text: `Ort ${i}`,
      x: 90 + (i % 4) * 7,
      y: 90 + Math.floor(i / 4) * 7,
    }));
    const obstacle = { x0: 0, y0: 0, x1: 40, y1: 40 };
    const placed = layoutLabels(points, { ...options, obstacles: [obstacle] });

    expect(placed.length).toBeGreaterThan(0);
    expect(placed.length).toBeLessThan(points.length);
    placed.forEach((a, i) => {
      expect(a.box.x0).toBeGreaterThanOrEqual(0);
      expect(a.box.y0).toBeGreaterThanOrEqual(0);
      expect(a.box.x1).toBeLessThanOrEqual(200);
      expect(a.box.y1).toBeLessThanOrEqual(200);
      expect(boxesOverlap(a.box, obstacle)).toBe(false);
      placed.slice(i + 1).forEach((b) => expect(boxesOverlap(a.box, b.box)).toBe(false));
      points
        .filter((p) => p.id !== a.id)
        .forEach((p) => expect(boxesOverlap(a.box, { x0: p.x - 3, y0: p.y - 3, x1: p.x + 3, y1: p.y + 3 })).toBe(false));
    });
  });

  it('honours priority: the first candidate wins a contested spot', () => {
    const placed = layoutLabels(
      [
        { id: 'first', text: 'Erster', x: 100, y: 100 },
        { id: 'second', text: 'Zweiter', x: 102, y: 100 },
      ],
      { ...options, sides: ['right'] },
    );
    expect(placed.map((l) => l.id)).toEqual(['first']);
  });

  it('a forced label may cover dots but not labels', () => {
    const placed = layoutLabels(
      [
        { id: 'selected', text: 'Gewählt', x: 100, y: 100, ignoreDots: true, gap: 12 },
        { id: 'neighbour', text: 'Nachbar', x: 125, y: 100 },
      ],
      { ...options, sides: ['right'] },
    );
    expect(placed[0]).toMatchObject({ id: 'selected', x: 112 });
    expect(placed.map((l) => l.id)).toEqual(['selected']);
  });

  it('labelBox centres above/below labels on the dot', () => {
    expect(labelBox({ x: 50, y: 50 }, 'abcd', 'above', options)).toMatchObject({ anchor: 'middle', x: 50, y: 40 });
    expect(labelBox({ x: 50, y: 50 }, 'abcd', 'below', options)).toMatchObject({ anchor: 'middle', x: 50, y: 60 });
  });
});

describe('maps key checks', () => {
  it.each([
    [undefined, false],
    ['', false],
    ['   ', false],
    ['MY_GOOGLE_MAPS_API_KEY', false],
    ['AIzaSy_placeholder123', false],
    ['AIzaSyRealLookingKey', true],
  ])('isUsableMapsApiKey(%j) → %s', (key, expected) => {
    expect(isUsableMapsApiKey(key)).toBe(expected);
  });

  it('isGoogleMapsConfigured accepts either variable', () => {
    expect(isGoogleMapsConfigured({})).toBe(false);
    expect(isGoogleMapsConfigured({ GOOGLE_MAPS_API_KEY: 'AIzaSyServer' })).toBe(true);
    expect(isGoogleMapsConfigured({ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyPublic' })).toBe(true);
    expect(isGoogleMapsConfigured({ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'MY_GOOGLE_MAPS_API_KEY' })).toBe(false);
  });
});
