import type { Attribution } from '@/lib/applications/schema';
import { WHATSAPP_NUMBER } from '@/lib/data/contact';
import { buildWhatsAppUrl, mitHerkunftscode } from '@/lib/utils/whatsapp-utils';
import { deriveChannel, HERKUNFT_CODES } from './channel';
import { sendeEreignis, stelleAusAdresse } from './ereignisse';
import { herkunftParameter, mitHerkunft } from './link';
import { ereignisseAktiv } from './schalter';

/**
 * Ein Beobachter für alle Links der Seite (Delegation am Dokument, Capture-Phase), eingerichtet beim ersten Erfassen
 * der Attribution (store.ts lädt diese Datei nach, sie liegt nicht im Start-Bündel). Er ändert nur den Link, den der
 * Besucher gerade benutzt, kurz bevor der Browser ihn öffnet:
 *
 * - Interne Links auf /bewerbung (und die Mappe) bekommen `?herkunft=…` bzw. `ref=…` (link.ts): Der Kanal gilt so
 *   auch in einem neuen Tab, ohne Cookie und ohne Speicher im Browser.
 * - WhatsApp-Links an unsere Nummer bekommen den sichtbaren Code „– W-…“ als letzte Zeile (Plan §D).
 * - Ein Klick auf WhatsApp oder Telefon zählt als Ereignis (ereignisse.ts).
 *
 * Alles nur mit dem Schalter FUNNEL_EVENTS (schalter.ts, Freigabe M-034): Ohne ihn bleibt jeder Link, wie er ist,
 * so wie es /datenschutz#herkunft beschreibt.
 *
 * Next-Links navigieren beim normalen Klick im Client mit ihrer eigenen Adresse, dort bleibt die Attribution ohnehin
 * im Arbeitsspeicher. Für neuen Tab (Strg-/Mittelklick), Kontextmenü, langes Tippen und Ziehen gilt das geänderte
 * href. React setzt ein href erst wieder, wenn sich die Adresse ändert; dann hängt der nächste Klick erneut an.
 */

export type LinkArt = 'whatsapp' | 'telefon' | 'sonst';

const WHATSAPP_ZIFFERN = WHATSAPP_NUMBER.replace(/\D/g, '');

/** WhatsApp-Link an unsere Nummer (api.whatsapp.com/send?phone=…); andere Nummern bleiben unberührt. */
function whatsappUrl(href: string): URL | null {
  try {
    const url = new URL(href);
    const nummer = url.searchParams.get('phone')?.replace(/\D/g, '');
    return url.protocol === 'https:' && url.hostname === 'api.whatsapp.com' && url.pathname === '/send' && nummer === WHATSAPP_ZIFFERN ? url : null;
  } catch {
    return null;
  }
}

/** Zählt ein Klick auf diesen Link als Ereignis? Telefon (tel:) und WhatsApp an unsere Nummer. */
export function linkArt(href: string): LinkArt {
  if (/^tel:/i.test(href.trim())) return 'telefon';
  return whatsappUrl(href) ? 'whatsapp' : 'sonst';
}

/**
 * Das href, das der Browser öffnen soll: mit Herkunft (interner Bewerbungslink) bzw. mit Code (WhatsApp). Ohne
 * passende Attribution, bei Telefon und allen anderen Links unverändert. Rein, ohne DOM.
 */
export function bearbeiteHref(href: string, attribution: Attribution, origin: string): string {
  const kanal = deriveChannel(attribution);
  const code = HERKUNFT_CODES[kanal];

  const whatsapp = whatsappUrl(href);
  if (whatsapp) {
    const text = whatsapp.searchParams.get('text') ?? '';
    const neu = mitHerkunftscode(text, code);
    return neu === text ? href : buildWhatsAppUrl(neu, whatsapp.searchParams.get('phone') ?? WHATSAPP_NUMBER);
  }
  return mitHerkunft(href, herkunftParameter(kanal, code, attribution), origin);
}

/** Was der Beobachter von einem Link braucht (DOM-Element oder Attrappe im Test). */
interface Anker {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
}

interface ZielElement {
  closest?(selector: string): Anker | null;
}

/** Ereignisse, vor denen ein Link geöffnet, kopiert oder gezogen werden kann. */
const VORBEREITEN = ['click', 'auxclick', 'contextmenu', 'touchstart', 'dragstart'] as const;

export interface BeobachterDokument extends Pick<Document, 'querySelector'> {
  addEventListener(type: string, listener: (event: Event) => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: string, listener: (event: Event) => void, options?: EventListenerOptions): void;
  location: Pick<Location, 'origin' | 'pathname' | 'search'>;
}

/**
 * Richtet den Beobachter ein und gibt eine Funktion zum Abmelden zurück. `quelle` liefert die Attribution der
 * Seitenladung (store.ts, getAttribution).
 */
export function beobachteLinks(doc: BeobachterDokument, quelle: () => Attribution): () => void {
  const behandeln = (event: Event) => {
    try {
      // Schalter je Ereignis gelesen: Das Meta-Element kommt aus dem Root-Layout und ändert sich nicht ohne Neuladen.
      if (!ereignisseAktiv(doc)) return;
      const anker = (event.target as ZielElement | null)?.closest?.('a[href]');
      const href = anker?.getAttribute('href');
      if (!anker || !href) return;

      const origin = doc.location.origin;
      const neu = bearbeiteHref(href, quelle(), origin);
      if (neu !== href) anker.setAttribute('href', neu);

      // Gezählt wird nur, was den Link wirklich öffnet: Klick, Tastatur (Enter löst click aus) und Mittelklick.
      const oeffnet = event.type === 'click' || (event.type === 'auxclick' && (event as MouseEvent).button === 1);
      if (!oeffnet) return;
      const art = linkArt(href);
      if (art === 'whatsapp' || art === 'telefon') {
        sendeEreignis({ ereignis: art === 'whatsapp' ? 'whatsapp_klick' : 'telefon_klick', stelle: stelleAusAdresse(doc.location) });
      }
    } catch {
      // Ein Fehler hier darf nie einen Link blockieren.
    }
  };

  const optionen = { capture: true, passive: true };
  for (const typ of VORBEREITEN) doc.addEventListener(typ, behandeln, optionen);
  return () => {
    for (const typ of VORBEREITEN) doc.removeEventListener(typ, behandeln, optionen);
  };
}
