/**
 * Texte des Abschnitts „Unterlagen einreichen“ (E-BEW-012, E-START-007), gebaut aus FACTS und COMPANY.
 * Vor Phase 2 verspricht nichts einen Upload: Der Hinweis sagt ehrlich, dass Hochladen noch nicht geht, und
 * nennt die zwei Wege, die heute funktionieren (WhatsApp, E-Mail). Kein „verifiziert“, kein „beigefügt“.
 */
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

/** Anker des Abschnitts (Zweitweg im Seitenkopf, alte Links `?tab=vault`). */
export const UNTERLAGEN_ANKER = 'unterlagen';

/** Vorausgefüllter WhatsApp-Text: wie die übrigen Texte an Sabri Demir, ohne Platzhalterdaten. */
export const UNTERLAGEN_WHATSAPP_TEXT = 'Guten Tag Herr Demir, ich möchte Ihnen meine Bewerbungsunterlagen schicken.';
export const UNTERLAGEN_MAIL_BETREFF = 'Bewerbungsunterlagen';

export const UNTERLAGEN_TEXT = Object.freeze({
  etikett: 'Freiwillig',
  titel: 'Unterlagen einreichen',
  /** Fakt noCvNeeded: Unterlagen sind ein Angebot, keine Bedingung. */
  einleitung: `Lebenslauf, Gesellenbrief oder Zeugnisse sind willkommen. ${FACTS.noCvNeeded.long}`,
  /** Wortlaut des Passes E-BEW-012 für den Betrieb ohne Anbindung. */
  hinweis: 'Hochladen ist noch nicht verfügbar.',
  hinweisWeg: 'Schick uns die Unterlagen per WhatsApp oder E-Mail.',
  /** Die Danke-Seite nennt die Bewerbungsnummer (E-START-020); mit ihr lassen sich Unterlagen zuordnen. */
  tipp: 'Schon beworben? Schreib deine Bewerbungsnummer dazu, dann ordnen wir alles gleich zu.',
  whatsapp: 'Per WhatsApp schicken',
  mail: 'Per E-Mail schicken',
  neuerTab: ' (öffnet in neuem Tab)',
});

export function unterlagenWhatsAppHref(): string {
  return buildWhatsAppUrl(UNTERLAGEN_WHATSAPP_TEXT);
}

export function unterlagenMailHref(): string {
  return `${COMPANY.emailHref}?subject=${encodeURIComponent(UNTERLAGEN_MAIL_BETREFF)}`;
}
