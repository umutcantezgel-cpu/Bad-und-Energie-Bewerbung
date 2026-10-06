/**
 * Lightweight, robust Google Maps JavaScript API Client Loader
 * Designed for Next.js App Router with dual-resolution support:
 * 1. Client-side NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * 2. Server-side GOOGLE_MAPS_API_KEY (via /api/maps/config)
 * 3. Graceful fallback to standalone vector topology map when no key is set.
 */

declare global {
  interface Window {
    google?: typeof google;
    __googleMapsLoaderPromise?: Promise<boolean>;
    __googleMapsLoadedCallback?: () => void;
  }
}

let cachedApiKey: string | null = null;
let cachedMapId: string | null = null;

export function getGoogleMapsApiKey(): string {
  if (cachedApiKey !== null) {
    return cachedApiKey;
  }
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';
  if (!key || key === 'MY_GOOGLE_MAPS_API_KEY' || key.startsWith('AIzaSy_placeholder')) {
    return '';
  }
  return key;
}

export function hasGoogleMapsKey(): boolean {
  return Boolean(getGoogleMapsApiKey());
}

export function getGoogleMapsMapId(): string | undefined {
  if (cachedMapId !== null) {
    return cachedMapId || undefined;
  }
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || undefined;
}

/**
 * Resolves the API key either from client environment or from server config API.
 */
export async function resolveGoogleMapsApiKey(): Promise<string> {
  const syncKey = getGoogleMapsApiKey();
  if (syncKey) {
    cachedApiKey = syncKey;
    return syncKey;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const res = await fetch('/api/maps/config');
    if (res.ok) {
      const data = await res.json();
      if (data?.apiKey) {
        cachedApiKey = data.apiKey;
        if (data.mapId) cachedMapId = data.mapId;
        return data.apiKey;
      }
    }
  } catch (err) {
    console.warn('[Google Maps Loader] Error resolving key from /api/maps/config:', err);
  }

  return '';
}

/**
 * Loads the Google Maps JavaScript API script dynamically.
 */
export async function loadGoogleMapsScript(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  // Already loaded
  if (window.google?.maps?.Map) {
    return true;
  }

  // Re-use pending loading promise
  if (window.__googleMapsLoaderPromise) {
    return window.__googleMapsLoaderPromise;
  }

  const apiKey = await resolveGoogleMapsApiKey();
  if (!apiKey) {
    return false;
  }

  window.__googleMapsLoaderPromise = new Promise<boolean>((resolve) => {
    // Check if script tag already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript && window.google?.maps?.Map) {
      resolve(true);
      return;
    }

    const callbackName = '__googleMapsLoadedCallback';
    window.__googleMapsLoadedCallback = () => {
      resolve(true);
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=geometry,marker&v=weekly&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = (err) => {
      console.warn('[Google Maps Loader] Script konnte nicht geladen werden:', err);
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return window.__googleMapsLoaderPromise;
}
