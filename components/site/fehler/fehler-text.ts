import { APPLY_PATH, NAV_ITEMS, SHORT_APPLY_LABEL } from '@/components/site/nav';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';

/**
 * Texte der 404-Seite (R4-404 in R5-RUHE, E-SHELL-025/-026/-027), nur aus belegten Quellen gebaut:
 * lib/content/facts.ts, COMPANY (lib/content/company.ts) und die Navigation des Rahmens (components/site/nav.ts).
 * Reines Modul ohne JSX, geprüft in components/site/fehler/__tests__/fehler.test.ts.
 *
 * Ton (E-SHELL-025, Entscheidung bei KERN): ein sicherer Satz ohne „wohl“. Die h1 trägt „Rohrleitung verirrt“.
 * Die Kennzeile des Altstands („Fehlercode 404 • Nicht Gefunden“) teilt sich in Etikett („Seite nicht gefunden“)
 * und Maß („404 Fehlercode“); „Fehler 404“ bleibt für Screenreader der erste Satz der Seite.
 */

const NBSP = '\u00a0';

/**
 * Etikett über der h1 (Versalien über text-etikett). Der Fehlercode steht groß als Maß an der Zeichnung; für
 * Screenreader beginnt das Etikett mit „Fehler 404:“ (FEHLER_ETIKETT_SR, nur vorgelesen).
 */
export const FEHLER_ETIKETT = 'Seite nicht gefunden';
export const FEHLER_ETIKETT_SR = 'Fehler 404: ';

/** Maß an der Zeichnung (Martian Mono mit Maßlinie): der Fehlercode in Bildgröße. */
export const FEHLER_MASSE = Object.freeze([{ wert: '404', name: 'Fehlercode' }] as const);

/** h1 (TEXTVORSCHLAG zu E-SHELL-025: Altstand „Hier hat sich wohl eine Rohrleitung verirrt“ ohne „wohl“). */
export const FEHLER_TITEL = 'Hier hat sich eine Rohrleitung verirrt.';

/** Unterzeile mit Rohrklammer: zwei kurze Sätze, je eine Zeile (wie „Ehrliches Handwerk. / Pünktlich Feierabend.“). */
export const FEHLER_UNTERZEILE = Object.freeze(['Diese Adresse führt ins Leere.', 'Der Weg zu uns nicht.'] as const);

/**
 * Einleitung: der Altstand-Text in der Anrede des Rahmens („Dir“ → „dir“), mit dem Satz der bisherigen Seite
 * verschmolzen („Die offenen Stellen und die Bewerbung findest du hier.“).
 */
export const FEHLER_EINLEITUNG = `Die aufgerufene Seite existiert nicht oder ist umgezogen. Unsere offenen Stellen in ${COMPANY.address.city} und die Bewerbung findest du weiterhin hier.`;

/** Hauptaktion (rot, mit Vorlauf aus der Zeichnung): die Bewerbung. */
export const FEHLER_AKTION = Object.freeze({ href: APPLY_PATH, label: SHORT_APPLY_LABEL });

/** Mikrotext unter dem Knopf (Fakten apply60s, noCvNeeded), wortgleich mit dem Einstieg der Startseite. */
export const FEHLER_MIKROTEXT = `Dauert ca. ${FACTS.apply60s.value}${NBSP}${FACTS.apply60s.label}. ${FACTS.noCvNeeded.short}.`;

/** Zweitweg: die Stellen (Ziel aus der Navigation des Rahmens). */
export const FEHLER_ZWEITWEG = Object.freeze({
  href: NAV_ITEMS.find((item) => item.label === 'Stellen')?.href ?? '/jobs',
  label: 'Offene Stellen ansehen',
});

/**
 * Weitere Wege (E-SHELL-026): Startseite, dazu Ablauf und FAQ der Startseite aus der Navigation. Stellen und
 * Bewerbung stehen schon im Kopf (Zweitweg und Hauptaktion) und werden hier nicht wiederholt.
 */
export const FEHLER_WEGE: readonly { href: string; label: string }[] = Object.freeze([
  { href: '/', label: 'Zur Startseite' },
  ...NAV_ITEMS.filter((item) => item.href === '/#ablauf' || item.href === '/#faq').map((item) => ({
    href: item.href,
    label: item.href === '/#ablauf' ? 'So läuft die Bewerbung' : 'Fragen und Antworten',
  })),
]);

/** Schneller Direktkontakt (E-SHELL-027). */
export const DIREKT_ETIKETT = 'Schneller Direktkontakt';
export const DIREKT_TITEL = 'Lieber direkt fragen?';
/** Einleitung: wer über einen toten Link kommt, erreicht eine Person (Fakt quickResponse). */
export const DIREKT_EINLEITUNG = `Du kommst über einen alten Link oder eine Anzeige? Ruf an oder schreib per WhatsApp. ${FACTS.quickResponse.long}`;

/**
 * Vorausgefüllte WhatsApp-Nachricht (Altstand: „Hallo Herr Demir, ich hatte einen Fehler auf der Karriereseite …“,
 * im Ton des Rahmens „Guten Tag Herr Demir, …“; Freiraum des Passes: „… ich habe eine Seite nicht gefunden“).
 * Ohne Berufsangabe (E-SHELL-005).
 */
export const FEHLER_WHATSAPP = `Guten Tag Herr Demir, ich habe auf der Karriereseite eine Seite nicht gefunden und melde mich direkt bei Ihnen.`;

/** Ansprechpartner aus COMPANY (Name und Rolle wie auf den Stellenseiten). */
export const FEHLER_ANSPRECHPARTNER = Object.freeze({
  name: COMPANY.managingDirector.name,
  role: COMPANY.managingDirector.title,
});
