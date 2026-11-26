/**
 * Spielstand eines Wurfs mit dem WhatsApp-Knopf und der Spruch danach (Inhaber, 26.11.2026: „optimal gamifiziert“).
 * Rein und ohne Dokument, damit er im Test läuft. Der Rekord lebt nur im Arbeitsspeicher der Seite (kein Speicher im
 * Browser): Er gilt, solange die Seite offen ist.
 */

export interface WurfBilanz {
  /** Abpraller an der linken oder rechten Fensterwand */
  banden: number;
  /** Ist er oben angestoßen? */
  decke: boolean;
  /** Im Flug wieder gefangen? */
  gefangen: boolean;
  /** Zeit vom Loslassen bis zum Einrasten in Millisekunden */
  flugMs: number;
}

export const LEERE_BILANZ: WurfBilanz = Object.freeze({ banden: 0, decke: false, gefangen: false, flugMs: 0 });

/** Aufforderung unter jedem Spruch: Antippen öffnet WhatsApp. */
export const SPRUCH_AUFRUF = 'Jetzt antippen und schreiben.';

/** Ab wie vielen Banden ein Wurf als Rekord zählen kann */
const REKORD_AB = 2;

/** Spruch nach dem Wurf und ob er einen neuen Rekord aufstellt (mehr Banden als je zuvor auf dieser Seite). */
export function wurfSpruch(b: WurfBilanz, rekord: number): { titel: string; rekord: boolean } {
  const neuerRekord = b.banden >= REKORD_AB && b.banden > rekord;
  let titel: string;
  if (b.gefangen) titel = 'Gefangen!';
  else if (b.banden >= 3) titel = `${b.banden}× Bande!`;
  else if (b.banden === 2) titel = 'Doppelbande!';
  else if (b.banden === 1 && b.decke) titel = 'Bande und Decke!';
  else if (b.banden === 1) titel = 'Bande!';
  else if (b.decke) titel = 'Bis unter die Decke!';
  else if (b.flugMs > 1500) titel = 'Weitwurf!';
  else titel = 'Guter Wurf!';
  return { titel: neuerRekord ? `${titel} Rekord!` : titel, rekord: neuerRekord };
}
