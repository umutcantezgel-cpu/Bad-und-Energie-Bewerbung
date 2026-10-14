import { WHATSAPP_NUMBER } from '@/lib/data/contact';

/** Neutraler Standardtext: passt auf jeder Seite, für Fachkräfte wie für Schülerinnen und Schüler. */
export const DEFAULT_WHATSAPP_MESSAGE = 'Guten Tag Herr Demir, ich interessiere mich für eine Stelle bei Bad und Energie.';

/**
 * Text im Bewerbungsflow (/bewerbung): eine Bewerbung, keine „kurze Frage“ (Plan §D). Wortgleich mit dem Anfang der
 * Abkürzung „Lieber direkt per WhatsApp?“ auf jedem Schritt (buildShortcutMessage in lib/apply/whatsapp-message.ts).
 */
export const BEWERBUNG_WHATSAPP_MESSAGE = 'Guten Tag Herr Demir, ich möchte mich bei Bad und Energie bewerben.';

export function buildWhatsAppUrl(message: string = DEFAULT_WHATSAPP_MESSAGE, phone: string = WHATSAPP_NUMBER): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Vorausgefüllter Text je Bereich. Header, Menü und Sticky-Bar nutzen ihn auf jeder Seite, auch auf
 * der Ausbildungsseite: deshalb keine Berufsangabe, sondern der neutrale Standardtext. Im Bewerbungsflow
 * (Fokusmodus) der Bewerbungssatz.
 */
export function whatsAppMessageFor(pathname: string): string {
  if (pathname.includes('/bewerbung')) return BEWERBUNG_WHATSAPP_MESSAGE;
  return DEFAULT_WHATSAPP_MESSAGE;
}

// ---------------------------------------------------------------------------
// Herkunftscode (Plan §D „WhatsApp-Herkunft“)
// ---------------------------------------------------------------------------

/** „W“ wie WhatsApp; dahinter der Kurzcode des Kanals (HERKUNFT_CODES in lib/attribution/channel.ts), z. B. W-IND. */
export const WHATSAPP_CODE_PRAEFIX = 'W-';

/** Letzte Zeile mit Code, z. B. „– W-IND“ (Gedankenstrich, geschütztes Leerzeichen, Code). */
const CODE_ZEILE = /\n–\u00a0W-[A-Z]{2,4}$/;

/** Die sichtbare Zeile am Ende der Nachricht: „– W-IND“. Unbekannte Codes (nicht 2–4 Großbuchstaben) ergeben ''. */
export function herkunftsZeile(code: string): string {
  return /^[A-Z]{2,4}$/.test(code) ? `–\u00a0${WHATSAPP_CODE_PRAEFIX}${code}` : '';
}

/**
 * Hängt den Herkunftscode als eigene letzte Zeile an den vorausgefüllten Text. Sichtbar: Die Person sieht ihn vor
 * dem Senden und kann ihn löschen. Eine vorhandene Codezeile wird ersetzt (nie zwei Codes), ein leerer Text bleibt
 * leer (ein Code allein wäre keine Nachricht).
 */
export function mitHerkunftscode(text: string, code: string): string {
  const zeile = herkunftsZeile(code);
  const ohne = text.replace(CODE_ZEILE, '');
  if (!zeile || !ohne.trim()) return ohne;
  return `${ohne}\n${zeile}`;
}
