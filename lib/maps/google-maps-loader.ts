import { isUsableMapsApiKey } from './keys';

/**
 * Google Maps JavaScript API loader. Call it only after the visitor's 2-click consent
 * (lib/maps/consent.ts): it is the only code that contacts Google, and it lives in the lazily
 * imported chunk of components/maps/GoogleRegionMap.tsx.
 *
 * Key resolution: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (inlined at build) or GOOGLE_MAPS_API_KEY via
 * /api/maps/config. Without a key, on gm_authFailure, a script error or a timeout the promise
 * resolves to false and the caller keeps the typographic radius graphic.
 *
 * Google's refusals stay for the page view: gm_authFailure (invalid key, referrer, quota) and the
 * error dialog that GoogleRegionMap finds in the map (BillingNotEnabledMapError, which does not
 * call gm_authFailure). A script that failed to load (network) does not: the next attempt
 * injects a fresh script tag.
 */

declare global {
  interface Window {
    google?: typeof google;
    gm_authFailure?: () => void;
    __beGoogleMapsLoaded?: () => void;
  }
}

const CALLBACK_NAME = '__beGoogleMapsLoaded';
const LOAD_TIMEOUT_MS = 10_000;

let cachedApiKey: string | null = null;
let cachedMapId: string | null = null;
let hasAuthError = false;
let authFailureHooked = false;
let loaderPromise: Promise<boolean> | null = null;
const authErrorListeners = new Set<() => void>();

function notifyAuthError(): void {
  if (hasAuthError) return;
  hasAuthError = true;
  for (const listener of authErrorListeners) {
    try {
      listener();
    } catch (err) {
      console.warn('[Google Maps] Fehler im Auth-Listener:', err);
    }
  }
}

/** Google calls window.gm_authFailure for invalid keys, referrer restrictions or quota errors. */
function hookAuthFailure(): void {
  if (authFailureHooked) return;
  authFailureHooked = true;
  const previous = window.gm_authFailure;
  window.gm_authFailure = () => {
    console.warn('[Google Maps] gm_authFailure: zurück zur Radius-Grafik.');
    notifyAuthError();
    previous?.();
  };
}

/**
 * Google refused the project without calling gm_authFailure: its error dialog sits in the map
 * (BillingNotEnabledMapError: "Google Maps kann auf dieser Seite nicht richtig geladen werden",
 * "For development purposes only"). Same sticky fallback as gm_authFailure.
 */
export function reportGoogleMapsProjectError(): void {
  if (!hasAuthError) console.warn('[Google Maps] Fehlerdialog von Google in der Karte: zurück zur Radius-Grafik.');
  notifyAuthError();
}

export function onGoogleMapsAuthError(callback: () => void): () => void {
  if (hasAuthError) {
    callback();
    return () => {};
  }
  authErrorListeners.add(callback);
  return () => {
    authErrorListeners.delete(callback);
  };
}

export function hasGoogleMapsAuthError(): boolean {
  return hasAuthError;
}

export function resetGoogleMapsAuthError(): void {
  hasAuthError = false;
}

export function getGoogleMapsApiKey(): string {
  if (cachedApiKey !== null) return cachedApiKey;
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return isUsableMapsApiKey(key) ? key.trim() : '';
}

export function hasGoogleMapsKey(): boolean {
  return Boolean(getGoogleMapsApiKey());
}

export function getGoogleMapsMapId(): string | undefined {
  if (cachedMapId !== null) return cachedMapId || undefined;
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || undefined;
}

/** Build-time key, else /api/maps/config (same origin, no Google request). Empty string = no key. */
export async function resolveGoogleMapsApiKey(): Promise<string> {
  const syncKey = getGoogleMapsApiKey();
  if (syncKey) {
    cachedApiKey = syncKey;
    return syncKey;
  }
  if (typeof window === 'undefined') return '';

  try {
    const res = await fetch('/api/maps/config', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return '';
    const data: unknown = await res.json();
    const { apiKey, mapId } = (data ?? {}) as { apiKey?: unknown; mapId?: unknown };
    const key = typeof apiKey === 'string' ? apiKey : null;
    if (isUsableMapsApiKey(key)) {
      cachedApiKey = key.trim();
      if (typeof mapId === 'string') cachedMapId = mapId.trim();
      return cachedApiKey;
    }
  } catch (err) {
    console.warn('[Google Maps] /api/maps/config nicht erreichbar:', err);
  }
  return '';
}

/**
 * With loading=async google.maps.Map already exists when the callback runs (verified on 3.66.8b);
 * importLibrary('maps') makes sure of it on later versions.
 */
async function mapsLibraryReady(): Promise<boolean> {
  const maps = window.google?.maps;
  if (typeof maps?.importLibrary === 'function') {
    try {
      await maps.importLibrary('maps');
    } catch (err) {
      console.warn('[Google Maps] Bibliothek „maps“ konnte nicht geladen werden:', err);
    }
  }
  return Boolean(window.google?.maps?.Map);
}

function injectScript(apiKey: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    // Runs until the maps library is ready, so a hanging importLibrary also ends in the fallback.
    const timer = window.setTimeout(() => {
      console.warn('[Google Maps] Zeitüberschreitung beim Laden.');
      resolve(false);
    }, LOAD_TIMEOUT_MS);

    window[CALLBACK_NAME] = () => {
      void mapsLibraryReady().then((ready) => {
        window.clearTimeout(timer);
        resolve(ready);
      });
    };

    const params = new URLSearchParams({
      key: apiKey,
      v: 'weekly',
      language: 'de',
      region: 'DE',
      loading: 'async',
      callback: CALLBACK_NAME,
    });
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      console.warn('[Google Maps] Skript konnte nicht geladen werden.');
      // Network failure, not a refusal by Google: no sticky flag; the next attempt starts over.
      script.remove();
      loaderPromise = null;
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/** Loads the API once per page; resolves true when google.maps is ready. */
export function loadGoogleMapsScript(): Promise<boolean> {
  if (typeof window === 'undefined' || hasAuthError) return Promise.resolve(false);
  hookAuthFailure();
  // Also covers a script that finished after an earlier timeout.
  if (window.google?.maps?.Map) return Promise.resolve(true);

  loaderPromise ??= resolveGoogleMapsApiKey().then((apiKey) => {
    if (!apiKey) {
      // No key configured: nothing was injected, so a later attempt may ask the config again.
      loaderPromise = null;
      return false;
    }
    return injectScript(apiKey);
  });
  return loaderPromise;
}
