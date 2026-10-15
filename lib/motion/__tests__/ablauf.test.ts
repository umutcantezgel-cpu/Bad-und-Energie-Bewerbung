import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ABLAUF_BILD_NETZ_MS,
  ABLAUF_NETZ_MS,
  ABLAUF_RAND,
  ABLAUF_RUHE,
  ablaufSchritt,
  beobachteAblauf,
  warteAufEnde,
  type AblaufWert,
} from '../ablauf';
import { MEDIA } from '../prefers';
import { DAUER_MS, SICHT_ENDE_MS, SICHT_WARTEN_MS } from '../register';

type Eintrag = { isIntersecting: boolean; boundingClientRect: { top: number; bottom: number; height: number } };
type Callback = (entries: Eintrag[]) => void;

/** Fenster mit einem Observer, dessen Meldungen der Test selbst auslöst (wie lib/motion/__tests__/sicht.test.ts). */
function fakeFenster(reduziert = false, mitObserver = true) {
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
    innerHeight: 800,
    matchMedia: (query: string) => ({ matches: query === MEDIA.reduzierteBewegung && reduziert }) as MediaQueryList,
    ...(mitObserver ? { IntersectionObserver: FakeObserver as unknown as typeof IntersectionObserver } : {}),
  };
  return { win, observers };
}

const element = {} as Element;
const lage = (top: number, height = 300, isIntersecting = false): Eintrag => ({
  isIntersecting,
  boundingClientRect: { top, bottom: top + height, height },
});

describe('Ablauf beim Sichtbarwerden (E-031, Auslöser sicht)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Übergänge: fertig → bereit → laeuft → fertig, sonst bleibt der Zustand', () => {
    expect(ABLAUF_RUHE).toBe('fertig');
    const alle: AblaufWert[] = ['fertig', 'bereit', 'laeuft'];
    const tabelle = alle.map((w) => [
      ablaufSchritt(w, { art: 'erster-blick', sichtbar: false }),
      ablaufSchritt(w, { art: 'erster-blick', sichtbar: true }),
      ablaufSchritt(w, { art: 'sichtbar' }),
      ablaufSchritt(w, { art: 'ende' }),
    ]);
    expect(tabelle).toEqual([
      ['bereit', 'fertig', 'fertig', 'fertig'],
      ['bereit', 'bereit', 'laeuft', 'bereit'],
      ['laeuft', 'laeuft', 'laeuft', 'fertig'],
    ]);
  });

  it('beim Laden unterhalb: bereit, beim Sichtbarwerden laeuft, dann trennt der Observer', async () => {
    const { win, observers } = fakeFenster();
    const melden = vi.fn();
    beobachteAblauf(element, melden, win);
    expect(observers).toHaveLength(1);
    expect(observers[0].observed).toEqual([element]);
    expect(observers[0].options).toEqual({ threshold: 0, rootMargin: ABLAUF_RAND });
    observers[0].cb([lage(1200)]);
    expect(melden.mock.calls).toEqual([['bereit']]);
    observers[0].cb([lage(700, 300, false)]);
    expect(melden).toHaveBeenCalledTimes(1);
    observers[0].cb([lage(600, 300, true)]);
    expect(observers[0].disconnected).toBe(true);
    // Ohne Bilder im Bereich gleich nach dem Sichtbarwerden (eine Mikroaufgabe später)
    await Promise.resolve();
    await Promise.resolve();
    expect(melden.mock.calls).toEqual([['bereit'], ['laeuft']]);
  });

  it('Prüfrunde 2 C2-5, Prüfrunde 3 C3-5: bereit lässt die Bilder lazy (der Browser lädt sie, wenn der Bereich näherkommt); laeuft erst, wenn alle dekodiert sind', async () => {
    let fertig: () => void = () => {};
    const bilder = [
      { loading: 'lazy', fetchPriority: 'auto', decode: () => new Promise<void>((r) => (fertig = r)) },
      { loading: 'lazy', fetchPriority: 'auto', decode: () => Promise.reject(new Error('defekt')) },
    ];
    const mitBildern = { querySelectorAll: (s: string) => (s === 'img' ? bilder : []) } as unknown as Element;
    const { win, observers } = fakeFenster();
    const melden = vi.fn();
    beobachteAblauf(mitBildern, melden, win);
    expect(bilder.map((b) => [b.loading, b.fetchPriority])).toEqual([
      ['lazy', 'auto'],
      ['lazy', 'auto'],
    ]);
    observers[0].cb([lage(1200)]);
    expect(melden.mock.calls).toEqual([['bereit']]);
    // Wer nicht bis zum Bereich scrollt, lädt seine Bilder nicht (vorher: eager mit niedriger Priorität bei bereit)
    expect(bilder.map((b) => [b.loading, b.fetchPriority])).toEqual([
      ['lazy', 'auto'],
      ['lazy', 'auto'],
    ]);
    observers[0].cb([lage(600, 300, true)]);
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
    // Ein Bild dekodiert noch: weiter bereit (das fehlerhafte zählt als fertig)
    expect(melden.mock.calls).toEqual([['bereit']]);
    fertig();
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
    expect(melden.mock.calls).toEqual([['bereit'], ['laeuft']]);
  });

  it('Prüfrunde 2 C2-5: dekodiert ein Bild nicht, läuft der Ablauf nach ABLAUF_BILD_NETZ_MS trotzdem, genau einmal', async () => {
    vi.useFakeTimers();
    const bilder = [{ loading: 'lazy', decode: () => new Promise<void>(() => {}) }];
    const mitBildern = { querySelectorAll: () => bilder } as unknown as Element;
    const { win, observers } = fakeFenster();
    const melden = vi.fn();
    beobachteAblauf(mitBildern, melden, win);
    observers[0].cb([lage(1200)]);
    observers[0].cb([lage(600, 300, true)]);
    await vi.advanceTimersByTimeAsync(ABLAUF_BILD_NETZ_MS - 1);
    expect(melden.mock.calls).toEqual([['bereit']]);
    await vi.advanceTimersByTimeAsync(1);
    expect(melden.mock.calls).toEqual([['bereit'], ['laeuft']]);
    await vi.advanceTimersByTimeAsync(ABLAUF_BILD_NETZ_MS);
    expect(melden).toHaveBeenCalledTimes(2);
    // Das Netz ist der Start des Auslösers sicht (Register SICHT_WARTEN_MS): Start spätestens nach dem Netz
    expect(ABLAUF_BILD_NETZ_MS).toBeLessThanOrEqual(1500);
    expect(ABLAUF_BILD_NETZ_MS).toBe(SICHT_WARTEN_MS);
  });

  it('beim Laden im Bild (auch nur im unteren Rand): Endzustand bleibt, nichts blitzt auf', () => {
    for (const erster of [lage(100, 300, true), lage(750, 300, false), lage(-200, 300, false)]) {
      const { win, observers } = fakeFenster();
      const melden = vi.fn();
      beobachteAblauf(element, melden, win);
      observers[0].cb([erster]);
      expect(melden, JSON.stringify(erster)).not.toHaveBeenCalled();
      expect(observers[0].disconnected).toBe(true);
    }
  });

  it('ein verborgener Bereich (Höhe 0) gilt beim Laden als nicht im Bild', () => {
    const { win, observers } = fakeFenster();
    const melden = vi.fn();
    beobachteAblauf(element, melden, win);
    observers[0].cb([lage(0, 0, false)]);
    expect(melden.mock.calls).toEqual([['bereit']]);
  });

  it('reduzierte Bewegung oder kein Observer: keine Beobachtung, der Endzustand steht', () => {
    for (const [reduziert, mitObserver] of [
      [true, true],
      [false, false],
    ] as const) {
      const { win, observers } = fakeFenster(reduziert, mitObserver);
      const melden = vi.fn();
      const ab = beobachteAblauf(element, melden, win);
      expect(observers).toHaveLength(0);
      expect(melden).not.toHaveBeenCalled();
      expect(() => ab()).not.toThrow();
    }
    // Ohne Fenster (Server): ebenso
    expect(() => beobachteAblauf(element, vi.fn(), undefined)()).not.toThrow();
  });

  it('die Abmeldung trennt den Observer', () => {
    const { win, observers } = fakeFenster();
    const ab = beobachteAblauf(element, vi.fn(), win);
    ab();
    expect(observers[0].disconnected).toBe(true);
  });

  it('Ende: nach dem letzten Ablauf genau einmal fertig; ohne Web Animations greift das Netz', async () => {
    expect(ABLAUF_NETZ_MS).toBe(SICHT_ENDE_MS + DAUER_MS['d-3']);
    vi.useFakeTimers();
    let fertig: (v?: unknown) => void = () => {};
    const zweiter = new Promise((r) => (fertig = r));
    const mit = { getAnimations: (o?: { subtree?: boolean }) => (o?.subtree ? [{ finished: Promise.resolve() }, { finished: zweiter }] : []) } as unknown as Element;
    const ende = vi.fn();
    warteAufEnde(mit, ende);
    await vi.advanceTimersByTimeAsync(10);
    expect(ende).not.toHaveBeenCalled();
    fertig();
    await vi.advanceTimersByTimeAsync(0);
    expect(ende).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(ABLAUF_NETZ_MS);
    expect(ende).toHaveBeenCalledTimes(1);

    // Abgebrochene Abläufe zählen als zu Ende (allSettled), ein leerer Bereich endet sofort
    const abgebrochen = { getAnimations: () => [{ finished: Promise.reject(new Error('abgebrochen')) }] } as unknown as Element;
    const ende2 = vi.fn();
    warteAufEnde(abgebrochen, ende2);
    await vi.advanceTimersByTimeAsync(0);
    expect(ende2).toHaveBeenCalledTimes(1);

    const ohne = vi.fn();
    warteAufEnde(element, ohne);
    await vi.advanceTimersByTimeAsync(ABLAUF_NETZ_MS - 1);
    expect(ohne).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(ohne).toHaveBeenCalledTimes(1);

    const abgemeldet = vi.fn();
    warteAufEnde(element, abgemeldet)();
    await vi.advanceTimersByTimeAsync(ABLAUF_NETZ_MS * 2);
    expect(abgemeldet).not.toHaveBeenCalled();
  });
});
