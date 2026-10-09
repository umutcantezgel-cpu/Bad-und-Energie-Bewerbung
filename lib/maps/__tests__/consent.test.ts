import { describe, expect, it, vi } from 'vitest';
import {
  MAPS_CONSENT_KEY,
  createMapsConsentStore,
  readStoredConsent,
  writeStoredConsent,
  type ConsentStorage,
} from '../consent';

function memoryStorage(): ConsentStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, String(value)),
    removeItem: (key) => void data.delete(key),
  };
}

/** Like Safari with blocked storage: every access throws. */
const throwingStorage: ConsentStorage = {
  getItem: () => {
    throw new DOMException('denied', 'SecurityError');
  },
  setItem: () => {
    throw new DOMException('quota', 'QuotaExceededError');
  },
  removeItem: () => {
    throw new DOMException('denied', 'SecurityError');
  },
};

describe('readStoredConsent / writeStoredConsent', () => {
  it('uses the versioned key and stores a timestamp', () => {
    const storage = memoryStorage();
    expect(writeStoredConsent(storage, true, new Date('2026-10-08T10:00:00Z'))).toBe(true);
    expect(MAPS_CONSENT_KEY).toBe('be:maps-consent:v1');
    expect(JSON.parse(storage.data.get(MAPS_CONSENT_KEY)!)).toEqual({ granted: true, at: '2026-10-08T10:00:00.000Z' });
    expect(readStoredConsent(storage)).toBe(true);
  });

  it('revoking removes the key', () => {
    const storage = memoryStorage();
    writeStoredConsent(storage, true);
    writeStoredConsent(storage, false);
    expect(storage.data.has(MAPS_CONSENT_KEY)).toBe(false);
    expect(readStoredConsent(storage)).toBe(false);
  });

  it.each(['', 'true', '1', '{"granted":"yes"}', 'not json', 'null'])('treats %j as no consent', (raw) => {
    const storage = memoryStorage();
    storage.data.set(MAPS_CONSENT_KEY, raw);
    expect(readStoredConsent(storage)).toBe(false);
  });

  it('never throws when storage throws or is missing', () => {
    expect(readStoredConsent(throwingStorage)).toBe(false);
    expect(writeStoredConsent(throwingStorage, true)).toBe(false);
    expect(writeStoredConsent(throwingStorage, false)).toBe(false);
    expect(readStoredConsent(null)).toBe(false);
    expect(writeStoredConsent(null, true)).toBe(false);
  });
});

describe('createMapsConsentStore', () => {
  it('defaults to no consent, then persists grant and revoke', () => {
    const storage = memoryStorage();
    const store = createMapsConsentStore(() => storage);
    expect(store.get()).toBe(false);

    store.grant();
    expect(store.get()).toBe(true);
    // A fresh page view reads the stored choice.
    expect(createMapsConsentStore(() => storage).get()).toBe(true);

    store.revoke();
    expect(store.get()).toBe(false);
    expect(createMapsConsentStore(() => storage).get()).toBe(false);
  });

  it('works for the current page view when localStorage throws', () => {
    const store = createMapsConsentStore(() => throwingStorage);
    expect(store.get()).toBe(false);
    expect(() => store.grant()).not.toThrow();
    expect(store.get()).toBe(true);
    expect(() => store.revoke()).not.toThrow();
    expect(store.get()).toBe(false);
  });

  it('survives a storage getter that throws (e.g. window.localStorage access denied)', () => {
    const store = createMapsConsentStore(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(store.get()).toBe(false);
    store.grant();
    expect(store.get()).toBe(true);
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const store = createMapsConsentStore(() => memoryStorage());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.grant();
    store.revoke();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    store.grant();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
