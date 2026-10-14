import { describe, expect, it, vi } from 'vitest';
import { MEDIA } from '../prefers';
import { beobachteSicht, beobachteTab, onceVisible } from '../sicht';

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;

function fakeObserverWindow(reduced = false) {
  const observers: Array<{ cb: Callback; options: IntersectionObserverInit; observed: Element[]; disconnected: boolean }> = [];
  class FakeObserver {
    record: (typeof observers)[number];
    constructor(cb: Callback, options: IntersectionObserverInit) {
      this.record = { cb, options, observed: [], disconnected: false };
      observers.push(this.record);
    }
    observe(el: Element) {
      this.record.observed.push(el);
    }
    disconnect() {
      this.record.disconnected = true;
    }
  }
  const win = {
    matchMedia: (query: string) => ({ matches: query === MEDIA.reduzierteBewegung && reduced }) as MediaQueryList,
    IntersectionObserver: FakeObserver as unknown as typeof IntersectionObserver,
  };
  return { win, observers };
}

const element = {} as Element;

describe('onceVisible', () => {
  it('löst einmal aus, sobald das Element sichtbar wird, und trennt dann den Observer', () => {
    const { win, observers } = fakeObserverWindow();
    const callback = vi.fn();
    onceVisible(element, callback, { win });
    expect(observers).toHaveLength(1);
    expect(observers[0].observed).toEqual([element]);
    expect(observers[0].options.threshold).toBe(0.25);

    observers[0].cb([{ isIntersecting: false }]);
    expect(callback).not.toHaveBeenCalled();
    observers[0].cb([{ isIntersecting: true }]);
    observers[0].cb([{ isIntersecting: true }]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(observers[0].disconnected).toBe(true);
  });

  it('ruft sofort auf bei reduzierter Bewegung (Endzustand) und ohne Observer', () => {
    const reduced = vi.fn();
    onceVisible(element, reduced, { win: fakeObserverWindow(true).win });
    expect(reduced).toHaveBeenCalledTimes(1);

    const withoutObserver = vi.fn();
    onceVisible(element, withoutObserver, { win: { matchMedia: () => ({ matches: false }) as MediaQueryList } });
    expect(withoutObserver).toHaveBeenCalledTimes(1);

    // Server/Node: kein window, sofortiger Aufruf
    const server = vi.fn();
    onceVisible(element, server);
    expect(server).toHaveBeenCalledTimes(1);
  });

  it('lässt sich vor dem Auslösen abmelden', () => {
    const { win, observers } = fakeObserverWindow();
    const callback = vi.fn();
    const stop = onceVisible(element, callback, { win, schwelle: 0.5, rand: '0px' });
    expect(observers[0].options).toEqual({ threshold: 0.5, rootMargin: '0px' });
    stop();
    observers[0].cb([{ isIntersecting: true }]);
    expect(callback).not.toHaveBeenCalled();
    expect(observers[0].disconnected).toBe(true);
  });
});

describe('beobachteSicht (Dauerbewegung: Stopp außerhalb des Sichtfelds)', () => {
  it('meldet jeden Wechsel, gleiche Zustände nur einmal, und trennt beim Abmelden', () => {
    const { win, observers } = fakeObserverWindow();
    const meldungen: boolean[] = [];
    const stop = beobachteSicht(element, (s) => meldungen.push(s), { win });
    expect(observers[0].observed).toEqual([element]);
    expect(observers[0].options).toEqual({ threshold: 0, rootMargin: '0px' });
    observers[0].cb([{ isIntersecting: true }]);
    observers[0].cb([{ isIntersecting: true }]);
    observers[0].cb([{ isIntersecting: false }]);
    observers[0].cb([{ isIntersecting: true }]);
    expect(meldungen).toEqual([true, false, true]);
    stop();
    expect(observers[0].disconnected).toBe(true);
  });

  it('meldet auch bei reduzierter Bewegung (die Startbedingung entscheidet), ohne Observer gilt sichtbar', () => {
    const { win, observers } = fakeObserverWindow(true);
    const meldung = vi.fn();
    beobachteSicht(element, meldung, { win });
    expect(observers).toHaveLength(1);
    expect(meldung).not.toHaveBeenCalled();
    const ohne = vi.fn();
    beobachteSicht(element, ohne, { win: { matchMedia: () => ({ matches: false }) as MediaQueryList } });
    expect(ohne).toHaveBeenCalledWith(true);
  });
});

describe('beobachteTab (Dauerbewegung: Stopp bei verstecktem Tab)', () => {
  it('meldet sofort und bei jedem visibilitychange, meldet sich wieder ab', () => {
    let hoerer: (() => void) | null = null;
    const doc = {
      visibilityState: 'visible' as DocumentVisibilityState,
      addEventListener: (_: 'visibilitychange', h: () => void) => {
        hoerer = h;
      },
      removeEventListener: () => {
        hoerer = null;
      },
    };
    const meldungen: boolean[] = [];
    const stop = beobachteTab((s) => meldungen.push(s), doc);
    doc.visibilityState = 'hidden';
    hoerer!();
    doc.visibilityState = 'visible';
    hoerer!();
    expect(meldungen).toEqual([true, false, true]);
    stop();
    expect(hoerer).toBeNull();
    // Ohne Dokument (Server): sichtbar
    const server = vi.fn();
    beobachteTab(server, undefined);
    expect(server).toHaveBeenCalledWith(true);
  });
});
