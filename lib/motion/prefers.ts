/**
 * Zentrale Abfragen für Bewegung und Zeiger (E-013, KERN K-009/K-011). Ohne Fenster (Server, Tests)
 * gilt die sichere Annahme: keine Bewegung, kein Hover. Komponenten fragen hier, nicht selbst.
 */

export const MEDIA = {
  /** Nutzer wünscht reduzierte Bewegung: alles sofort im Endzustand. */
  reduzierteBewegung: '(prefers-reduced-motion: reduce)',
  /** Hover-Zustände nur hier (K-011): Maus oder Trackpad, kein Touch-Hover. */
  feinerZeiger: '(hover: hover) and (pointer: fine)',
  /** Grober Zeiger (Finger): eigene :active-Rückmeldung, größere Ziele. */
  groberZeiger: '(pointer: coarse)',
} as const;

export type MediaName = keyof typeof MEDIA;

/** Der Teil von window, den dieses Modul braucht (für Tests austauschbar). */
export interface MediaWindow {
  matchMedia?: (query: string) => MediaQueryList;
}

function currentWindow(): MediaWindow | undefined {
  return typeof window === 'undefined' ? undefined : window;
}

function query(name: MediaName, win: MediaWindow | undefined): MediaQueryList | undefined {
  if (!win || typeof win.matchMedia !== 'function') return undefined;
  try {
    return win.matchMedia(MEDIA[name]);
  } catch {
    return undefined;
  }
}

/** true, wenn die Abfrage zutrifft; ohne Fenster oder matchMedia `fallback`. */
export function matches(name: MediaName, win: MediaWindow | undefined = currentWindow(), fallback = false): boolean {
  const list = query(name, win);
  return list ? list.matches : fallback;
}

/** Reduzierte Bewegung gewünscht? Ohne Fenster: ja (Endzustand ist immer richtig). */
export function prefersReducedMotion(win: MediaWindow | undefined = currentWindow()): boolean {
  return matches('reduzierteBewegung', win, true);
}

/** Darf Bewegung laufen? Gegenteil von prefersReducedMotion. */
export function motionAllowed(win: MediaWindow | undefined = currentWindow()): boolean {
  return !prefersReducedMotion(win);
}

/** Echter Hover möglich (Maus/Trackpad)? Ohne Fenster: nein. */
export function canHover(win: MediaWindow | undefined = currentWindow()): boolean {
  return matches('feinerZeiger', win, false);
}

/** Grober Zeiger (Finger)? Ohne Fenster: nein. */
export function hasCoarsePointer(win: MediaWindow | undefined = currentWindow()): boolean {
  return matches('groberZeiger', win, false);
}

/**
 * Meldet Änderungen einer Abfrage (z. B. reduzierte Bewegung während des Besuchs umgeschaltet).
 * Gibt die Abmeldung zurück; ohne Fenster eine leere Funktion.
 */
export function subscribe(name: MediaName, onChange: (matches: boolean) => void, win: MediaWindow | undefined = currentWindow()): () => void {
  const list = query(name, win);
  if (!list) return () => {};
  const listener = (event: MediaQueryListEvent) => onChange(event.matches);
  if (typeof list.addEventListener === 'function') {
    list.addEventListener('change', listener);
    return () => list.removeEventListener('change', listener);
  }
  // Safari < 14
  list.addListener?.(listener);
  return () => list.removeListener?.(listener);
}
