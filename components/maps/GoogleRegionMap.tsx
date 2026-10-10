'use client';

import { useEffect, useRef } from 'react';
import {
  HEADQUARTERS_COORDINATES,
  MAP_PALETTES,
  MAP_POIS,
  MAX_SERVICE_RADIUS_KM,
  buildMapStyle,
  type MapPalette,
} from '@/lib/maps/google-maps-config';
import {
  hasGoogleMapsAuthError,
  loadGoogleMapsScript,
  onGoogleMapsAuthError,
  reportGoogleMapsProjectError,
} from '@/lib/maps/google-maps-loader';
import { cn } from '@/lib/utils/cn';
import { radiusCircles } from './google-circles';

export interface GoogleRegionMapProps {
  /** Selected REGION location id; places at the headquarters select the HQ marker. */
  selectedId: string | null;
  /** Chosen radius of the switch (E-START-033): its circle is drawn stronger and fills the view. */
  radiusKm?: number;
  /** All radii of the switch; each gets a thin circle around the headquarters. */
  radii?: readonly number[];
  onReady: () => void;
  onFail: () => void;
  onSelect?: (id: string) => void;
  /** Inert and invisible until ready, so the radius graphic below stays the visible fallback. */
  hidden?: boolean;
  className?: string;
}

const READY_TIMEOUT_MS = 15_000;
const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Google's dialog in the map when it refuses the project without gm_authFailure, e.g. BillingNotEnabledMapError
 * (verified on 3.66.8b: "Google Maps kann auf dieser Seite nicht richtig geladen werden", link to
 * http://g.co/dev/maps-no-account, button.dismissButton), plus Google's full error overlay (.gm-err-container).
 */
export const GOOGLE_ERROR_DIALOG_SELECTOR = 'a[href*="maps-no-account"], .dismissButton, .gm-err-container';

/**
 * Google map of the service area. Only ever rendered after the 2-click consent and imported
 * lazily (next/dynamic) from RegionExplorer, so neither this code nor the loader ships before.
 */
export default function GoogleRegionMap({
  selectedId,
  radiusKm = MAX_SERVICE_RADIUS_KM,
  radii = [MAX_SERVICE_RADIUS_KM],
  onReady,
  onFail,
  onSelect,
  hidden,
  className,
}: GoogleRegionMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onFail, onSelect });
  const selectedRef = useRef(selectedId);
  const applySelectionRef = useRef<((id: string | null) => void) | null>(null);
  const radiusRef = useRef(radiusKm);
  const radiiRef = useRef(radii);
  const applyRadiusRef = useRef<((km: number) => void) | null>(null);

  useEffect(() => {
    callbacks.current = { onReady, onFail, onSelect };
  });

  useEffect(() => {
    selectedRef.current = selectedId;
    applySelectionRef.current?.(selectedId);
  }, [selectedId]);

  useEffect(() => {
    radiusRef.current = radiusKm;
    applyRadiusRef.current?.(radiusKm);
  }, [radiusKm]);

  useEffect(() => {
    const outcome = mapOutcome(callbacks);
    let teardown = () => {};

    if (hasGoogleMapsAuthError()) {
      outcome.fail();
      return;
    }
    // gm_authFailure, or Google's error dialog reported by createMap: back to the graphic, also after ready.
    const unsubscribeAuth = onGoogleMapsAuthError(outcome.fail);
    const timeout = window.setTimeout(() => {
      if (outcome.pending()) outcome.fail();
    }, READY_TIMEOUT_MS);

    loadGoogleMapsScript().then((loaded) => {
      const container = containerRef.current;
      if (!outcome.pending()) return;
      if (!loaded || !container || !window.google?.maps?.Map) {
        outcome.fail();
        return;
      }
      try {
        teardown = createMap(container, {
          selectedRef,
          applySelectionRef,
          radiusRef,
          radiiRef,
          applyRadiusRef,
          callbacks,
          ready: outcome.ready,
          // Sticky for this page view like gm_authFailure: a remount falls back at once.
          fail: () => {
            reportGoogleMapsProjectError();
            outcome.fail();
          },
        });
      } catch (err) {
        console.warn('[Google Maps] Karte konnte nicht erstellt werden:', err);
        outcome.fail();
      }
    });

    return () => {
      outcome.cancel();
      window.clearTimeout(timeout);
      unsubscribeAuth();
      applySelectionRef.current = null;
      applyRadiusRef.current = null;
      teardown();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interaktive Karte des Einsatzgebiets (Google Maps)"
      inert={hidden}
      className={cn(
        'overflow-hidden rounded-lg bg-surface-2 transition-opacity duration-step ease-standard',
        hidden ? 'opacity-0' : 'opacity-100',
        className,
      )}
    />
  );
}

export interface MapOutcome {
  ready: () => void;
  fail: () => void;
  cancel: () => void;
  /** Neither ready, failed nor cancelled yet. */
  pending: () => boolean;
}

/**
 * Outcome of one mount: ready at most once and only while pending; a failure wins even after ready, because
 * gm_authFailure and Google's error dialog can come after tilesloaded. Nothing is reported after cancel
 * (unmount). Exported for the test (components/maps/__tests__/google-circles.test.ts).
 */
export function mapOutcome(callbacks: { current: Pick<GoogleRegionMapProps, 'onReady' | 'onFail'> }): MapOutcome {
  let state: 'pending' | 'ready' | 'failed' | 'cancelled' = 'pending';
  return {
    ready: () => {
      if (state !== 'pending') return;
      state = 'ready';
      callbacks.current.onReady();
    },
    fail: () => {
      if (state === 'failed' || state === 'cancelled') return;
      state = 'failed';
      callbacks.current.onFail();
    },
    cancel: () => {
      state = 'cancelled';
    },
    pending: () => state === 'pending',
  };
}

export interface MapContext {
  selectedRef: { current: string | null };
  applySelectionRef: { current: ((id: string | null) => void) | null };
  radiusRef: { current: number };
  radiiRef: { current: readonly number[] };
  applyRadiusRef: { current: ((km: number) => void) | null };
  callbacks: { current: Pick<GoogleRegionMapProps, 'onSelect'> };
  ready: () => void;
  /** Google shows its error dialog in the map (GOOGLE_ERROR_DIALOG_SELECTOR), before or after ready. */
  fail: () => void;
}

/**
 * Builds the map inside `container` from `window.google.maps` (loaded by the caller). Exported for the
 * test with a stubbed `window.google` (components/maps/__tests__/google-circles.test.ts, E-START-033).
 */
export function createMap(
  container: HTMLDivElement,
  { selectedRef, applySelectionRef, radiusRef, radiiRef, applyRadiusRef, callbacks, ready, fail }: MapContext,
): () => void {
  const g = window.google!.maps;
  const scheme = window.matchMedia(DARK_QUERY);
  const palette = (): MapPalette => MAP_PALETTES[scheme.matches ? 'dark' : 'light'];
  const hqId = MAP_POIS[0]?.id;

  const map = new g.Map(container, {
    center: HEADQUARTERS_COORDINATES,
    zoom: 9,
    styles: buildMapStyle(palette()),
    backgroundColor: palette().land,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'cooperative',
  });

  // E-START-033: one thin circle per switch radius (15, 25, 35 km), lines only; the chosen one is
  // drawn stronger and framed. Same ring logic as the radius graphic (google-circles.ts).
  const circles = radiusCircles(g, map, { center: HEADQUARTERS_COORDINATES, radii: radiiRef.current, palette: palette() });
  const paintCircles = () => circles.paint(radiusRef.current, palette());
  paintCircles();
  circles.frame(radiusRef.current);
  applyRadiusRef.current = (km) => {
    paintCircles();
    circles.frame(km);
  };

  const markers = MAP_POIS.map((poi) => {
    const marker = new g.Marker({ map, position: poi.coordinates, title: poi.name });
    if (poi.type === 'place') marker.addListener('click', () => callbacks.current.onSelect?.(poi.id));
    return { poi, marker };
  });

  /** Ids the UI may select that sit on the HQ marker (not in MAP_POIS). */
  const markerIdFor = (id: string | null) => (id && markers.some((m) => m.poi.id === id) ? id : id ? hqId : null);

  const paintMarkers = () => {
    const colors = palette();
    const active = markerIdFor(selectedRef.current);
    for (const { poi, marker } of markers) {
      const isHq = poi.type === 'headquarters';
      const isActive = poi.id === active;
      marker.setIcon({
        path: g.SymbolPath.CIRCLE,
        scale: isHq || isActive ? 7 : 4.5,
        fillColor: isHq || isActive ? colors.ink : colors.surface,
        fillOpacity: 1,
        strokeColor: isHq || isActive ? colors.surface : colors.ink,
        strokeWeight: isHq || isActive ? 2.5 : 1.5,
      });
      marker.setZIndex(isActive ? 3 : isHq ? 2 : 1);
    }
  };

  /** Color scheme switched (light ⇄ dark): restyle the base map, the circle and the markers. */
  const paintAll = () => {
    const colors = palette();
    // backgroundColor can only be set at creation; the tiles cover it once loaded.
    map.setOptions({ styles: buildMapStyle(colors) });
    paintCircles();
    paintMarkers();
  };

  applySelectionRef.current = (id) => {
    paintMarkers();
    const target = markers.find((m) => m.poi.id === markerIdFor(id));
    if (target && id) map.panTo(target.poi.coordinates);
  };

  paintMarkers();
  scheme.addEventListener('change', paintAll);

  // Google's error dialog came about 0.6 s after new Map, before tilesloaded (3.66.8b), and the tiles load
  // anyway: check at tilesloaded and watch the container until teardown, so a later dialog still falls back.
  // No MutationObserver on the server or in node tests, whose fake container has no querySelector.
  const showsErrorDialog = () =>
    typeof container.querySelector === 'function' && container.querySelector(GOOGLE_ERROR_DIALOG_SELECTOR) !== null;
  const observer =
    typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(() => {
          if (!showsErrorDialog()) return;
          observer?.disconnect();
          fail();
        });
  observer?.observe(container, { childList: true, subtree: true });
  const tiles = g.event.addListenerOnce(map, 'tilesloaded', () => {
    if (showsErrorDialog()) fail();
    else ready();
  });

  return () => {
    observer?.disconnect();
    scheme.removeEventListener('change', paintAll);
    tiles.remove();
    for (const { marker } of markers) {
      g.event.clearInstanceListeners(marker);
      marker.setMap(null);
    }
    circles.remove();
    g.event.clearInstanceListeners(map);
  };
}
