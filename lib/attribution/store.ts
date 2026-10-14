import type { Attribution } from '@/lib/applications/schema';
import { attributionFromUrl, type CaptureInput } from './capture';
import { ereignisseAktiv } from './schalter';

/**
 * Attribution der aktuellen Seitenladung (ROADMAP §3.2, §9.6), nur im Arbeitsspeicher.
 *
 * Bewusst KEINE Cookies, kein localStorage und kein sessionStorage: Nach § 25 TDDDG bräuchte
 * das Speichern auf dem Endgerät eine Einwilligung, weil die Kanal-Messung nicht unbedingt
 * erforderlich ist. Die Werte leben deshalb nur in diesem Modul und sind nach einem Reload
 * oder in einem neuen Tab weg. Clientseitige Navigation (Next.js-Links) behält sie. Erst mit dem Schalter
 * FUNNEL_EVENTS (schalter.ts, Freigabe M-034) trägt ein Bewerbungslink in einem neuen Tab den Kanal als `?herkunft=`
 * (link.ts, klick.ts), und nur dann wird der Parameter gelesen; so lange gilt der Wortlaut von /datenschutz#herkunft.
 *
 * First Touch: Es zählt der erste Aufruf je Seitenladung; spätere Aufrufe ändern nichts.
 */

let captured: Attribution | null = null;
let linksBeobachtet = false;

function freeze(attribution: Attribution): Attribution {
  return Object.freeze({ ...attribution });
}

/**
 * Lädt den Link-Beobachter nach (klick.ts, eigenes Bündel nach dem ersten Rendern): Herkunft an Bewerbungslinks,
 * Code an WhatsApp-Links, Ereignisse bei Klicks auf WhatsApp und Telefon. Einmal je Seitenladung, nur im Browser und
 * nur mit Schalter: Ohne ihn hätte der Beobachter nichts zu tun.
 */
function beobachteLinksEinmal(): void {
  if (linksBeobachtet || typeof document === 'undefined' || !ereignisseAktiv()) return;
  linksBeobachtet = true;
  import('./klick')
    .then(({ beobachteLinks }) => beobachteLinks(document, getAttribution))
    .catch(() => {
      // Ohne Beobachter funktionieren alle Links wie bisher, nur ohne Herkunft und Code.
    });
}

/** Merkt sich die Attribution der Einstiegsseite (einmal je Seitenladung). */
export function captureAttribution(input: CaptureInput): Attribution {
  if (captured) return captured;
  captured = freeze(attributionFromUrl({ ...input, herkunft: input.herkunft ?? ereignisseAktiv() }));
  beobachteLinksEinmal();
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
  linksBeobachtet = false;
}
