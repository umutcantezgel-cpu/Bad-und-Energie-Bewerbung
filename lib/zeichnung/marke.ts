/**
 * Bosch-Sperre (E-029, KERN K-010): Die Markenfassung der Gerätezeichnung (Logo, Anker, gestufter Ring-Diffusor)
 * erscheint erst mit der schriftlichen Erlaubnis von Bosch (M-021). Bis dahin gilt nur die neutrale, maßgenaue
 * Fassung. Übernommen werden aus den Anleitungen ausschließlich Zahlen; Fotos, Renderings und Zeichnungen der
 * Anleitungen werden weder abgepaust noch vektorisiert (§§ 2 Abs. 1 Nr. 7, 23, 72 UrhG; Bosch-Nutzungsbedingungen
 * für digitale Inhalte, Ziffer 7.2).
 *
 * Freischalten (nur durch den Orchestrator, mit Eintrag in _relaunch/ENTSCHEIDUNGEN.md):
 * 1. Die Erlaubnis als Datei unter `_relaunch/belege/` ablegen (PDF oder E-Mail als Text),
 * 2. hier `erteilt: true`, `beleg` (Pfad), `datum` und `umfang` (Web, Teilen-Bilder, Druck …) eintragen,
 * 3. die von Bosch gelieferten Vektordaten als eigenes Modul einbinden (`ebene`).
 * lib/zeichnung/__tests__/zeichnung-daten.test.ts und components/zeichnung/__tests__/technik.test.ts sperren den Schalter, solange der Beleg fehlt.
 */

export interface BoschFreigabe {
  erteilt: boolean;
  /** Pfad der Erlaubnis im Repository (z. B. `_relaunch/belege/bosch-erlaubnis.pdf`). */
  beleg: string | null;
  /** Datum der Erlaubnis (ISO). */
  datum: string | null;
  /** Wofür die Erlaubnis gilt (Web, Teilen-Bilder, Social, Druck). */
  umfang: readonly string[];
}

export const BOSCH_FREIGABE: BoschFreigabe = Object.freeze({
  erteilt: false,
  beleg: null,
  datum: null,
  umfang: Object.freeze([]) as readonly string[],
});

/** Die Markenfassung ist nur mit erteilter Erlaubnis, Beleg und Datum erlaubt. */
export function markeErlaubt(freigabe: BoschFreigabe = BOSCH_FREIGABE): boolean {
  return freigabe.erteilt === true && typeof freigabe.beleg === 'string' && freigabe.beleg.length > 0 && typeof freigabe.datum === 'string';
}

export type Variante = 'neutral' | 'marke';

/** Die tatsächlich gezeichnete Fassung: `marke` nur mit Erlaubnis, sonst immer `neutral`. */
export function wirksameVariante(gewuenscht: Variante, freigabe: BoschFreigabe = BOSCH_FREIGABE): Variante {
  return gewuenscht === 'marke' && markeErlaubt(freigabe) ? 'marke' : 'neutral';
}
