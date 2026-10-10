import { describe, expect, it, vi } from 'vitest';
import { MEDIA } from '../prefers';
import { onceVisible } from '../sicht';

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
