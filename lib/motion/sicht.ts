import { motionAllowed, type MediaWindow } from './prefers';

/**
 * Einmaliger Auslöser beim Sichtbarwerden (E-013: IntersectionObserver statt Scroll-Ereignissen).
 * Nur für die wenigen Auftritte auf Erzählseiten (K-011: höchstens die Hälfte der Abschnitte).
 *
 * Ohne IntersectionObserver oder bei reduzierter Bewegung ruft er sofort auf: der Endzustand ist
 * dann sofort richtig. Gibt die Abmeldung zurück.
 */
export interface SichtOptionen {
  /** Anteil des Elements, der sichtbar sein muss (0–1). Standard 0,25. */
  schwelle?: number;
  /** rootMargin des Observers. Standard: unten 10 % früher auslösen. */
  rand?: string;
  /** Für Tests: Fenster mit matchMedia und IntersectionObserver. */
  win?: MediaWindow & { IntersectionObserver?: typeof IntersectionObserver };
}

export function onceVisible(element: Element, callback: () => void, options: SichtOptionen = {}): () => void {
  const win = options.win ?? (typeof window === 'undefined' ? undefined : window);
  const Observer = win?.IntersectionObserver;
  if (!Observer || !motionAllowed(win)) {
    callback();
    return () => {};
  }
  let done = false;
  const observer = new Observer(
    (entries) => {
      if (done || !entries.some((entry) => entry.isIntersecting)) return;
      done = true;
      observer.disconnect();
      callback();
    },
    { threshold: options.schwelle ?? 0.25, rootMargin: options.rand ?? '0px 0px -10% 0px' },
  );
  observer.observe(element);
  return () => {
    done = true;
    observer.disconnect();
  };
}
