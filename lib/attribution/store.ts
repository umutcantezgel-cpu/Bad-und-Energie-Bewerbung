import type { Attribution } from '@/lib/applications/schema';
import { attributionFromUrl, type CaptureInput } from './capture';

/**
 * Attribution der aktuellen Seitenladung (ROADMAP §3.2, §9.6), nur im Arbeitsspeicher.
 *
 * Bewusst KEINE Cookies, kein localStorage und kein sessionStorage: Nach § 25 TDDDG bräuchte
 * das Speichern auf dem Endgerät eine Einwilligung, weil die Kanal-Messung nicht unbedingt
 * erforderlich ist. Die Werte leben deshalb nur in diesem Modul und sind nach einem Reload
 * oder in einem neuen Tab weg. Clientseitige Navigation (Next.js-Links) behält sie.
 *
 * First Touch: Es zählt der erste Aufruf je Seitenladung; spätere Aufrufe ändern nichts.
 */

let captured: Attribution | null = null;

function freeze(attribution: Attribution): Attribution {
  return Object.freeze({ ...attribution });
}

/** Merkt sich die Attribution der Einstiegsseite (einmal je Seitenladung). */
export function captureAttribution(input: CaptureInput): Attribution {
  if (captured) return captured;
  captured = freeze(attributionFromUrl(input));
  return captured;
}

/**
 * Attribution für den Bewerbungs-Payload. Wurde noch nichts erfasst (Flow schneller als der
 * Effekt im Layout), wird jetzt aus der aktuellen Adresse erfasst. Auf dem Server immer leer.
 */
export function getAttribution(): Attribution {
  if (captured) return { ...captured };
  if (typeof window === 'undefined') return {};
  return { ...captureAttribution({ url: window.location.href, referrer: document.referrer }) };
}

/** Nur für Tests. */
export function resetAttributionForTests(): void {
  captured = null;
}
