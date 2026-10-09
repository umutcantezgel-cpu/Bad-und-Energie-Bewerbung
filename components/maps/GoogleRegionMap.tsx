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
import { hasGoogleMapsAuthError, loadGoogleMapsScript, onGoogleMapsAuthError } from '@/lib/maps/google-maps-loader';
import { cn } from '@/lib/utils/cn';

export interface GoogleRegionMapProps {
  /** Selected REGION location id; places at the headquarters select the HQ marker. */
  selectedId: string | null;
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
 * Google map of the service area. Only ever rendered after the 2-click consent and imported
 * lazily (next/dynamic) from RegionExplorer, so neither this code nor the loader ships before.
 */
export default function GoogleRegionMap({ selectedId, onReady, onFail, onSelect, hidden, className }: GoogleRegionMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onFail, onSelect });
  const selectedRef = useRef(selectedId);
  const applySelectionRef = useRef<((id: string | null) => void) | null>(null);

  useEffect(() => {
    callbacks.current = { onReady, onFail, onSelect };
  });

  useEffect(() => {
    selectedRef.current = selectedId;
    applySelectionRef.current?.(selectedId);
  }, [selectedId]);

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    let teardown = () => {};

    const fail = () => {
      if (cancelled || settled) return;
      settled = true;
      callbacks.current.onFail();
    };
    const ready = () => {
      if (cancelled || settled) return;
      settled = true;
      callbacks.current.onReady();
    };

    if (hasGoogleMapsAuthError()) {
      fail();
      return;
    }
    const unsubscribeAuth = onGoogleMapsAuthError(() => {
      settled = false;
      fail();
    });
    const timeout = window.setTimeout(fail, READY_TIMEOUT_MS);

    loadGoogleMapsScript().then((loaded) => {
      const container = containerRef.current;
      if (cancelled) return;
      if (!loaded || !container || !window.google?.maps?.Map) {
        fail();
        return;
      }
      try {
        teardown = createMap(container, { selectedRef, applySelectionRef, callbacks, ready });
      } catch (err) {
        console.warn('[Google Maps] Karte konnte nicht erstellt werden:', err);
        fail();
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      unsubscribeAuth();
      applySelectionRef.current = null;
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

interface MapContext {
  selectedRef: { current: string | null };
  applySelectionRef: { current: ((id: string | null) => void) | null };
  callbacks: { current: Pick<GoogleRegionMapProps, 'onSelect'> };
  ready: () => void;
}

function createMap(container: HTMLDivElement, { selectedRef, applySelectionRef, callbacks, ready }: MapContext): () => void {
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

  const circle = new g.Circle({
    map,
    center: HEADQUARTERS_COORDINATES,
    radius: MAX_SERVICE_RADIUS_KM * 1000,
    clickable: false,
    fillOpacity: 0,
    strokeColor: palette().lineStrong,
    strokeOpacity: 1,
    strokeWeight: 1,
  });
  const bounds = circle.getBounds();
  if (bounds) map.fitBounds(bounds, 8);

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
    circle.setOptions({ strokeColor: colors.lineStrong });
    paintMarkers();
  };

  applySelectionRef.current = (id) => {
    paintMarkers();
    const target = markers.find((m) => m.poi.id === markerIdFor(id));
    if (target && id) map.panTo(target.poi.coordinates);
  };

  paintMarkers();
  scheme.addEventListener('change', paintAll);
  const tiles = g.event.addListenerOnce(map, 'tilesloaded', ready);

  return () => {
    scheme.removeEventListener('change', paintAll);
    tiles.remove();
    for (const { marker } of markers) {
      g.event.clearInstanceListeners(marker);
      marker.setMap(null);
    }
    circle.setMap(null);
    g.event.clearInstanceListeners(map);
  };
}
