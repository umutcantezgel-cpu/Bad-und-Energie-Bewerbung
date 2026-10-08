/**
 * 2-click consent for Google Maps (roadmap §5). Nothing loads from Google until the visitor clicks
 * "Interaktive Karte laden"; the choice is remembered in localStorage until "Karte wieder
 * ausblenden" revokes it. Every storage access is guarded: private mode, blocked storage or a full
 * quota must never break the page. Without storage the choice holds for the current page view.
 */

export const MAPS_CONSENT_KEY = 'be:maps-consent:v1';

export type ConsentStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

interface StoredConsent {
  granted: true;
  /** ISO timestamp of the click. */
  at: string;
}

export function readStoredConsent(storage: ConsentStorage | null): boolean {
  if (!storage) return false;
  try {
    const raw = storage.getItem(MAPS_CONSENT_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null && (parsed as Partial<StoredConsent>).granted === true;
  } catch {
    return false;
  }
}

/** Persists (granted) or removes (revoked) the choice; returns false when storage is unavailable. */
export function writeStoredConsent(storage: ConsentStorage | null, granted: boolean, now: Date = new Date()): boolean {
  if (!storage) return false;
  try {
    if (granted) {
      const value: StoredConsent = { granted: true, at: now.toISOString() };
      storage.setItem(MAPS_CONSENT_KEY, JSON.stringify(value));
    } else {
      storage.removeItem(MAPS_CONSENT_KEY);
    }
    return true;
  } catch {
    return false;
  }
}

export interface MapsConsentStore {
  /** Snapshot for useSyncExternalStore. */
  get(): boolean;
  grant(): void;
  revoke(): void;
  subscribe(listener: () => void): () => void;
}

export function createMapsConsentStore(getStorage: () => ConsentStorage | null): MapsConsentStore {
  /** Decision made in this page view; wins over storage, so consent works without storage too. */
  let decision: boolean | null = null;
  const listeners = new Set<() => void>();

  const storage = (): ConsentStorage | null => {
    try {
      return getStorage();
    } catch {
      return null;
    }
  };
  const emit = () => listeners.forEach((listener) => listener());

  const set = (granted: boolean) => {
    decision = granted;
    writeStoredConsent(storage(), granted);
    emit();
  };

  return {
    get: () => decision ?? readStoredConsent(storage()),
    grant: () => set(true),
    revoke: () => set(false),
    subscribe(listener) {
      listeners.add(listener);
      // Another tab granted or revoked: follow the stored value again.
      const onStorage = (event: StorageEvent) => {
        if (event.key !== null && event.key !== MAPS_CONSENT_KEY) return;
        decision = null;
        listener();
      };
      const target = typeof window === 'undefined' ? null : window;
      target?.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        target?.removeEventListener('storage', onStorage);
      };
    },
  };
}

function browserLocalStorage(): ConsentStorage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

/** App-wide store (the RegionMap reads it with useSyncExternalStore; server snapshot = false). */
export const mapsConsent: MapsConsentStore = createMapsConsentStore(browserLocalStorage);
