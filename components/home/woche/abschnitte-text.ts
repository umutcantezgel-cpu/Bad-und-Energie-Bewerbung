/**
 * Kopftexte der Abschnitte „Ablauf“ und „FAQ“ (Paket R3-HOME-05). Nur Wortlaute aus dem Wesenskern der
 * Pässe (atlas/paesse-start.md), keine neuen Arbeitgeber-Aussagen; Titel, Schritte, Zusage und Fragen
 * bleiben in lib/content/process.ts und lib/content/faq.ts.
 */

/** E-START-027, Wesenskern: Eyebrow des Altstands „Einfach und ohne Bürokratie“. */
export const ABLAUF_KOPF = Object.freeze({
  etikett: 'Einfach und ohne Bürokratie',
});

/**
 * E-START-050: Die Überschrift „Häufige Fragen“ bleibt; die Einleitung des Altstands kehrt zurück
 * (Freiraum des Passes: „die Einleitung ‚Offene Antworten …‘ darf zurückkehren“).
 */
export const FAQ_KOPF = Object.freeze({
  /** Etikett wie der Menüpunkt (Planbeschriftung, E-023 SectionHeader-Muster). */
  etikett: 'FAQ',
  titel: 'Häufige Fragen',
  einleitung: 'Offene Antworten auf Fragen, die Monteuren und Gesellen wichtig sind.',
});
