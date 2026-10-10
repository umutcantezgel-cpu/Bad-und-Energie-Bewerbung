import { describe, expect, it, vi } from 'vitest';
import { MEDIA, canHover, hasCoarsePointer, matches, motionAllowed, prefersReducedMotion, subscribe, type MediaWindow } from '../prefers';

type Listener = (event: MediaQueryListEvent) => void;

/** Fenster mit festen Antworten je Abfrage; `set` löst change-Ereignisse aus. */
function fakeWindow(state: Partial<Record<string, boolean>>, { legacy = false } = {}) {
  const listeners = new Map<string, Set<Listener>>();
  const list = (query: string) => {
    const set = listeners.get(query) ?? new Set<Listener>();
    listeners.set(query, set);
    const base = {
      media: query,
      get matches() {
        return Boolean(state[query]);
      },
      addListener: (l: Listener) => set.add(l),
      removeListener: (l: Listener) => set.delete(l),
    };
    if (legacy) return base as unknown as MediaQueryList;
    return {
      ...base,
      addEventListener: (_: string, l: Listener) => set.add(l),
      removeEventListener: (_: string, l: Listener) => set.delete(l),
    } as unknown as MediaQueryList;
  };
  const win: MediaWindow = { matchMedia: vi.fn(list) };
  const set = (query: string, value: boolean) => {
    state[query] = value;
    for (const l of listeners.get(query) ?? []) l({ matches: value } as MediaQueryListEvent);
  };
  return { win, set, listeners };
}

describe('prefers', () => {
  it('nennt die Abfragen aus K-011', () => {
    expect(MEDIA.reduzierteBewegung).toBe('(prefers-reduced-motion: reduce)');
    expect(MEDIA.feinerZeiger).toBe('(hover: hover) and (pointer: fine)');
    expect(MEDIA.groberZeiger).toBe('(pointer: coarse)');
  });

  it('nimmt ohne Fenster die sichere Seite an: reduziert, kein Hover', () => {
    expect(prefersReducedMotion(undefined)).toBe(true);
    expect(motionAllowed(undefined)).toBe(false);
    expect(canHover(undefined)).toBe(false);
    expect(hasCoarsePointer(undefined)).toBe(false);
    expect(prefersReducedMotion({})).toBe(true);
    // Im Node-Testlauf gibt es kein window: gleiche Antwort ohne Argument
    expect(prefersReducedMotion()).toBe(true);
  });

  it('folgt matchMedia, wenn ein Fenster da ist', () => {
    const { win } = fakeWindow({ [MEDIA.reduzierteBewegung]: false, [MEDIA.feinerZeiger]: true });
    expect(prefersReducedMotion(win)).toBe(false);
    expect(motionAllowed(win)).toBe(true);
    expect(canHover(win)).toBe(true);
    expect(hasCoarsePointer(win)).toBe(false);

    const touch = fakeWindow({ [MEDIA.reduzierteBewegung]: true, [MEDIA.groberZeiger]: true }).win;
    expect(prefersReducedMotion(touch)).toBe(true);
    expect(canHover(touch)).toBe(false);
    expect(hasCoarsePointer(touch)).toBe(true);
  });

  it('fängt ein werfendes matchMedia ab', () => {
    const win: MediaWindow = {
      matchMedia: () => {
        throw new Error('kaputt');
      },
    };
    expect(matches('feinerZeiger', win, false)).toBe(false);
    expect(prefersReducedMotion(win)).toBe(true);
  });

  it('meldet Änderungen und lässt sich abmelden', () => {
    const { win, set } = fakeWindow({ [MEDIA.reduzierteBewegung]: false });
    const seen: boolean[] = [];
    const stop = subscribe('reduzierteBewegung', (value) => seen.push(value), win);
    set(MEDIA.reduzierteBewegung, true);
    set(MEDIA.reduzierteBewegung, false);
    stop();
    set(MEDIA.reduzierteBewegung, true);
    expect(seen).toEqual([true, false]);
  });

  it('nutzt addListener, wo addEventListener fehlt (Safari < 14)', () => {
    const { win, set } = fakeWindow({}, { legacy: true });
    const seen: boolean[] = [];
    const stop = subscribe('feinerZeiger', (value) => seen.push(value), win);
    set(MEDIA.feinerZeiger, true);
    stop();
    set(MEDIA.feinerZeiger, false);
    expect(seen).toEqual([true]);
  });

  it('gibt ohne Fenster eine leere Abmeldung zurück', () => {
    const stop = subscribe('reduzierteBewegung', () => {}, undefined);
    expect(() => stop()).not.toThrow();
  });
});
