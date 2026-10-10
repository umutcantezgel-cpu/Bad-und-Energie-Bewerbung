import type { MapPalette } from '@/lib/maps/google-maps-config';

/**
 * Kreise der Google-Ebene (E-START-033, Runde 2): je Radius des Umschalters (15, 25, 35 km) ein feiner
 * Kreis um den Firmensitz, nur Linie, ohne Füllung; der gewählte ist kräftiger und füllt den Ausschnitt.
 * Dieselbe Ringlogik wie die Radiusgrafik. Rein und ohne `window`, damit sie mit einem gestubbten
 * `google.maps` prüfbar ist (components/maps/__tests__/google-circles.test.ts).
 */

/** Die Optionen, die ein Kreis hier bekommt (Teilmenge von google.maps.CircleOptions). */
export interface RadiusCircleOptions<M> {
  map?: M | null;
  center?: { lat: number; lng: number };
  radius?: number;
  clickable?: boolean;
  fillOpacity?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
}

/** Was von google.maps.Circle gebraucht wird. */
export interface RadiusCircleLike<B, M> {
  setOptions(options: RadiusCircleOptions<M>): void;
  getBounds(): B | null;
  setMap(map: null): void;
}

/** Was von google.maps gebraucht wird: nur der Kreis. */
export interface RadiusCircleMaps<B, M> {
  Circle: new (options: RadiusCircleOptions<M>) => RadiusCircleLike<B, M>;
}

/** Was von der Karte gebraucht wird: einpassen. */
export interface RadiusCircleMap<B> {
  fitBounds(bounds: B, padding?: number): void;
}

export interface RadiusCircles {
  /** Malt alle Kreise: der gewählte in `ink` mit 2 px, die übrigen in `lineStrong` mit 1 px. */
  paint(currentKm: number, palette: Pick<MapPalette, 'ink' | 'lineStrong'>): void;
  /** Passt den Ausschnitt auf den Kreis des Radius ein. */
  frame(km: number): void;
  /** Nimmt alle Kreise von der Karte. */
  remove(): void;
  /** Die Radien der Kreise in Metern, in der Reihenfolge des Umschalters (für Prüfungen). */
  readonly metres: readonly number[];
}

/** Rand beim Einpassen in Pixeln. */
export const FRAME_PADDING_PX = 8;

export function radiusCircles<B, M extends RadiusCircleMap<B>>(
  g: RadiusCircleMaps<B, M>,
  map: M,
  {
    center,
    radii,
    palette,
  }: { center: { lat: number; lng: number }; radii: readonly number[]; palette: Pick<MapPalette, 'ink' | 'lineStrong'> },
): RadiusCircles {
  const circles = radii.map((km) => ({
    km,
    circle: new g.Circle({
      map,
      center,
      radius: km * 1000,
      clickable: false,
      fillOpacity: 0,
      strokeColor: palette.lineStrong,
      strokeOpacity: 1,
      strokeWeight: 1,
    }),
  }));

  return {
    metres: circles.map(({ km }) => km * 1000),
    paint(currentKm, colors) {
      for (const { km, circle } of circles) {
        const active = km === currentKm;
        circle.setOptions({ strokeColor: active ? colors.ink : colors.lineStrong, strokeWeight: active ? 2 : 1 });
      }
    },
    frame(km) {
      const bounds = circles.find((c) => c.km === km)?.circle.getBounds();
      if (bounds) map.fitBounds(bounds, FRAME_PADDING_PX);
    },
    remove() {
      for (const { circle } of circles) circle.setMap(null);
    },
  };
}
