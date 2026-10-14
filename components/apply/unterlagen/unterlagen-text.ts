/**
 * Texte zu Unterlagen (E-BEW-012, E-START-007), gebaut aus FACTS und COMPANY. Ohne Anbindung (vor Phase 2) gibt es
 * keinen abgeschalteten Upload-Kasten mehr (Plan §D „Upload-Sackgasse entfernen“): eine Zeile sagt, dass Unterlagen
 * später per WhatsApp oder E-Mail gehen und der erste Schritt keinen Lebenslauf braucht (Fakt noCvNeeded). Kein
 * Wort „Upload“, kein „verifiziert“, kein „beigefügt“.
 */
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

/** Anker der Zeile bzw. des Abschnitts (Zweitweg im Seitenkopf, Erklärteil, alte Links `?tab=vault`). */
export const UNTERLAGEN_ANKER = 'unterlagen';

/** Vorausgefüllter WhatsApp-Text: wie die übrigen Texte an Sabri Demir, ohne Platzhalterdaten. */
export const UNTERLAGEN_WHATSAPP_TEXT = 'Guten Tag Herr Demir, ich möchte Ihnen meine Bewerbungsunterlagen schicken.';
export const UNTERLAGEN_MAIL_BETREFF = 'Bewerbungsunterlagen';

/** „Für den ersten Schritt …“ → „für den ersten Schritt …“ (Fakt im Satzinneren nach dem Gedankenstrich). */
function kleinerAnfang(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Die Zeile auf /bewerbung statt des abgeschalteten Kastens, in drei Teilen um die zwei Links (WhatsApp, E-Mail).
 * Satz: „Unterlagen kannst du später per WhatsApp oder E-Mail schicken – für den ersten Schritt brauchst du weder
 * Anschreiben noch Lebenslauf.“ Der zweite Teil ist der Fakt noCvNeeded im Wortlaut.
 */
export const UNTERLAGEN_ZEILE = Object.freeze({
  vor: 'Unterlagen kannst du später per',
  whatsapp: 'WhatsApp',
  oder: 'oder',
  mail: 'E-Mail',
  // Geschütztes Leerzeichen vor dem Gedankenstrich: Keine Zeile beginnt mit „–“.
  nach: `schicken – ${kleinerAnfang(FACTS.noCvNeeded.long)}`,
  neuerTab: ' (öffnet in neuem Tab)',
});

/** Die Zeile als ein Satz (Tests, Zusammenfassungen). */
export const UNTERLAGEN_ZEILE_TEXT = [UNTERLAGEN_ZEILE.vor, UNTERLAGEN_ZEILE.whatsapp, UNTERLAGEN_ZEILE.oder, UNTERLAGEN_ZEILE.mail, UNTERLAGEN_ZEILE.nach].join(' ');

/** Abschnitt mit Anbindung (Phase 2, `<Unterlagen auswahl={…} />`). */
export const UNTERLAGEN_TEXT = Object.freeze({
  etikett: 'Freiwillig',
  titel: 'Unterlagen einreichen',
  /** Fakt noCvNeeded: Unterlagen sind ein Angebot, keine Bedingung. */
  einleitung: `Lebenslauf, Gesellenbrief oder Zeugnisse sind willkommen. ${FACTS.noCvNeeded.long}`,
});

export function unterlagenWhatsAppHref(): string {
  return buildWhatsAppUrl(UNTERLAGEN_WHATSAPP_TEXT);
}

export function unterlagenMailHref(): string {
  return `${COMPANY.emailHref}?subject=${encodeURIComponent(UNTERLAGEN_MAIL_BETREFF)}`;
}
