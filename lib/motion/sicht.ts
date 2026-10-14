import { motionAllowed, type MediaWindow } from './prefers';

/**
 * Sichtbarkeit (E-013: IntersectionObserver statt Scroll-Ereignissen):
 * - `beobachteSicht` meldet jeden Wechsel „im Sichtfeld / außerhalb“ (Dauerbewegung, K-009: Stopp außerhalb des
 *   Sichtfelds). Ohne IntersectionObserver gilt die Zeichnung als sichtbar.
 * - `onceVisible` löst einmal beim Sichtbarwerden aus (die wenigen Auftritte auf Erzählseiten, K-011); bei
 *   reduzierter Bewegung und ohne Observer sofort, damit der Endzustand stimmt.
 * - `beobachteTab` meldet, ob der Tab sichtbar ist (Stopp bei verstecktem Tab).
 * Alle geben die Abmeldung zurück.
 */
export interface SichtOptionen {
  /** Anteil des Elements, der sichtbar sein muss (0–1). Standard 0,25. */
  schwelle?: number;
  /** rootMargin des Observers. Standard: unten 10 % früher auslösen. */
  rand?: string;
  /** Für Tests: Fenster mit matchMedia und IntersectionObserver. */
  win?: MediaWindow & { IntersectionObserver?: typeof IntersectionObserver };
}

type SichtFenster = NonNullable<SichtOptionen['win']>;

function fenster(win: SichtOptionen['win']): SichtFenster | undefined {
  return win ?? (typeof window === 'undefined' ? undefined : window);
}

/**
 * Meldet jeden Wechsel der Sichtbarkeit (`true` im Sichtfeld). Gleiche Zustände hintereinander meldet sie nur einmal.
 * Ohne Observer: einmal `true` (das Standbild darf dann laufen, die übrigen Bedingungen entscheiden).
 */
export function beobachteSicht(element: Element, melden: (sichtbar: boolean) => void, options: SichtOptionen = {}): () => void {
  const Observer = fenster(options.win)?.IntersectionObserver;
  if (!Observer) {
    melden(true);
    return () => {};
  }
  let zuletzt: boolean | null = null;
  const observer = new Observer(
    (entries) => {
      const sichtbar = entries.some((entry) => entry.isIntersecting);
      if (sichtbar === zuletzt) return;
      zuletzt = sichtbar;
      melden(sichtbar);
    },
    { threshold: options.schwelle ?? 0, rootMargin: options.rand ?? '0px' },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

export function onceVisible(element: Element, callback: () => void, options: SichtOptionen = {}): () => void {
  const win = fenster(options.win);
  if (!win?.IntersectionObserver || !motionAllowed(win)) {
    callback();
    return () => {};
  }
  let done = false;
  const stop = beobachteSicht(
    element,
    (sichtbar) => {
      if (done || !sichtbar) return;
      done = true;
      stop();
      callback();
    },
    { win, schwelle: options.schwelle ?? 0.25, rand: options.rand ?? '0px 0px -10% 0px' },
  );
  return () => {
    done = true;
    stop();
  };
}

/** Der Teil von document, den `beobachteTab` braucht (für Tests austauschbar). */
export interface TabDokument {
  visibilityState?: DocumentVisibilityState;
  addEventListener?: (typ: 'visibilitychange', hoerer: () => void) => void;
  removeEventListener?: (typ: 'visibilitychange', hoerer: () => void) => void;
}

/** Meldet sofort und bei jedem Wechsel, ob der Tab sichtbar ist. Ohne Dokument: sichtbar. */
export function beobachteTab(melden: (sichtbar: boolean) => void, doc: TabDokument | undefined = typeof document === 'undefined' ? undefined : document): () => void {
  const lesen = () => melden(doc?.visibilityState !== 'hidden');
  lesen();
  if (!doc?.addEventListener) return () => {};
  doc.addEventListener('visibilitychange', lesen);
  return () => doc.removeEventListener?.('visibilitychange', lesen);
}
