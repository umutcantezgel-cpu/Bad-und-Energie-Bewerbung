import { afterEach, describe, expect, it, vi } from 'vitest';
import { HEADQUARTERS_COORDINATES, MAP_PALETTES, MAP_POIS } from '@/lib/maps/google-maps-config';
import { FRAME_PADDING_PX, radiusCircles, type RadiusCircleOptions } from '../google-circles';
import { createMap, type MapContext } from '../GoogleRegionMap';
import { SWITCH_RADII_KM } from '../views';

/**
 * E-START-033 (Google-Teil der Abnahme, Testweg E-START-056 ohne Schlüssel): In der Google-Ebene liegen Kreise für
 * 15, 25 und 35 km um den Firmensitz. Geprüft mit einem gestubbten `google.maps`, ohne Netz und ohne Schlüssel.
 */

interface Bounds {
  km: number;
}

/** Fake google.maps.Circle: records every option it gets. */
class FakeCircle {
  static all: FakeCircle[] = [];
  options: RadiusCircleOptions<FakeMap>;
  map: FakeMap | null;
  constructor(options: RadiusCircleOptions<FakeMap>) {
    this.options = { ...options };
    this.map = options.map ?? null;
    FakeCircle.all.push(this);
  }
  setOptions(options: RadiusCircleOptions<FakeMap>) {
    this.options = { ...this.options, ...options };
  }
  getBounds(): Bounds | null {
    return { km: (this.options.radius ?? 0) / 1000 };
  }
  setMap(map: null) {
    this.map = map;
  }
}

class FakeMap {
  fitted: { bounds: Bounds; padding?: number }[] = [];
  panned: unknown[] = [];
  constructor(_container?: unknown, public options?: unknown) {}
  fitBounds(bounds: Bounds, padding?: number) {
    this.fitted.push({ bounds, padding });
  }
  setOptions() {}
  panTo(target: unknown) {
    this.panned.push(target);
  }
}

class FakeMarker {
  static all: FakeMarker[] = [];
  listeners: Record<string, () => void> = {};
  icon: unknown;
  constructor(public options: { title?: string }) {
    FakeMarker.all.push(this);
  }
  addListener(name: string, fn: () => void) {
    this.listeners[name] = fn;
  }
  setIcon(icon: unknown) {
    this.icon = icon;
  }
  setZIndex() {}
  setMap() {}
}

const light = MAP_PALETTES.light;
const dark = MAP_PALETTES.dark;

afterEach(() => {
  FakeCircle.all = [];
  FakeMarker.all = [];
  vi.unstubAllGlobals();
});

describe('radiusCircles (Google-Ebene, E-START-033)', () => {
  const build = (map = new FakeMap()) => ({
    map,
    circles: radiusCircles({ Circle: FakeCircle }, map, { center: HEADQUARTERS_COORDINATES, radii: SWITCH_RADII_KM, palette: light }),
  });

  it('draws one circle each for 15, 25 and 35 km around the headquarters, lines only', () => {
    const { map, circles } = build();
    expect(circles.metres).toEqual([15_000, 25_000, 35_000]);
    expect(FakeCircle.all.map((c) => c.options.radius)).toEqual([15_000, 25_000, 35_000]);
    for (const circle of FakeCircle.all) {
      expect(circle.options.center).toEqual({ lat: HEADQUARTERS_COORDINATES.lat, lng: HEADQUARTERS_COORDINATES.lng });
      expect(circle.map).toBe(map);
      expect(circle.options.fillOpacity).toBe(0);
      expect(circle.options.clickable).toBe(false);
    }
  });

  it('draws the chosen circle stronger and frames it; a switch repaints and reframes', () => {
    const { map, circles } = build();
    circles.paint(35, light);
    circles.frame(35);
    const weights = () => FakeCircle.all.map((c) => c.options.strokeWeight);
    const colors = () => FakeCircle.all.map((c) => c.options.strokeColor);
    expect(weights()).toEqual([1, 1, 2]);
    expect(colors()).toEqual([light.lineStrong, light.lineStrong, light.ink]);
    expect(map.fitted.at(-1)).toEqual({ bounds: { km: 35 }, padding: FRAME_PADDING_PX });

    circles.paint(15, light);
    circles.frame(15);
    expect(weights()).toEqual([2, 1, 1]);
    expect(map.fitted.at(-1)?.bounds).toEqual({ km: 15 });

    circles.paint(15, dark);
    expect(colors()).toEqual([dark.ink, dark.lineStrong, dark.lineStrong]);
  });

  it('removes every circle from the map', () => {
    const { circles } = build();
    circles.remove();
    expect(FakeCircle.all.every((c) => c.map === null)).toBe(true);
  });
});

describe('createMap mit gestubbtem window.google', () => {
  function stubGoogle() {
    const listenersOnce: { name: string; fn: () => void }[] = [];
    const maps = {
      Map: FakeMap,
      Circle: FakeCircle,
      Marker: FakeMarker,
      SymbolPath: { CIRCLE: 0 },
      event: {
        addListenerOnce: (_target: unknown, name: string, fn: () => void) => {
          listenersOnce.push({ name, fn });
          return { remove: () => {} };
        },
        clearInstanceListeners: () => {},
      },
    };
    vi.stubGlobal('window', {
      google: { maps },
      matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    });
    return { listenersOnce };
  }

  function context(radiusKm = 35) {
    const ctx: MapContext = {
      selectedRef: { current: null },
      applySelectionRef: { current: null },
      radiusRef: { current: radiusKm },
      radiiRef: { current: SWITCH_RADII_KM },
      applyRadiusRef: { current: null },
      callbacks: { current: {} },
      ready: vi.fn(),
    };
    return ctx;
  }

  it('puts the three circles 15/25/35 km around the headquarters and frames the chosen radius', () => {
    const { listenersOnce } = stubGoogle();
    const ctx = context(35);
    const teardown = createMap({} as HTMLDivElement, ctx);

    expect(FakeCircle.all.map((c) => c.options.radius)).toEqual([15_000, 25_000, 35_000]);
    expect(FakeCircle.all.map((c) => c.options.strokeWeight)).toEqual([1, 1, 2]);
    for (const circle of FakeCircle.all) expect(circle.options.center).toEqual(HEADQUARTERS_COORDINATES);
    const map = FakeCircle.all[0].map!;
    expect(map.fitted.at(-1)?.bounds).toEqual({ km: 35 });

    // Umschalter auf 25 km: der 25-km-Kreis wird kräftig und eingepasst
    ctx.radiusRef.current = 25;
    ctx.applyRadiusRef.current?.(25);
    expect(FakeCircle.all.map((c) => c.options.strokeWeight)).toEqual([1, 2, 1]);
    expect(map.fitted.at(-1)?.bounds).toEqual({ km: 25 });

    // „bereit“ erst, wenn die Kacheln geladen sind
    expect(listenersOnce.map((l) => l.name)).toEqual(['tilesloaded']);
    expect(ctx.ready).not.toHaveBeenCalled();

    teardown();
    expect(FakeCircle.all.every((c) => c.map === null)).toBe(true);
  });

  it('sets one marker per point of interest; a click on a place marker picks the place (E-START-038)', () => {
    stubGoogle();
    const ctx = context();
    const onSelect = vi.fn();
    ctx.callbacks.current = { onSelect };
    createMap({} as HTMLDivElement, ctx);
    expect(FakeMarker.all.map((m) => m.options.title)).toEqual(MAP_POIS.map((poi) => poi.name));
    const place = MAP_POIS.findIndex((poi) => poi.type === 'place');
    FakeMarker.all[place].listeners.click();
    expect(onSelect).toHaveBeenCalledWith(MAP_POIS[place].id);
  });
});
