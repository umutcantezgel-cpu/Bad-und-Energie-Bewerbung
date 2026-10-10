/**
 * Logik des Vorteils-Konfigurators (E-START-024, E-START-016), rein und ohne Laufzeit-Importe:
 * die Client-Insel bekommt nur diese Datei und reine Daten vom Server (keine Registry, kein zod;
 * scripts/qa/check-client-imports.mjs). Aufgebaut werden die Daten in ./vorteile-text.ts.
 */

/** Die vier Wünsche aus dem alten Funnel („Was ist Dir … besonders wichtig?“). */
export const WUNSCH_IDS = ['feierabend', 'verguetung', 'ausstattung', 'naehe'] as const;
export type WunschId = (typeof WUNSCH_IDS)[number];

export interface WunschOption {
  id: WunschId;
  label: string;
}

export interface PaketZeile {
  /** Eindeutig je Rolle: `extra-<Label>` oder `fakt-<FactId>`. */
  key: string;
  /** Planbeschriftung links (Mono-Etikett). */
  etikett: string;
  /** Wortlaut aus `packageExtras` oder `FACTS[id].short`. */
  text: string;
  /** Wünsche, zu denen die Zeile passt. */
  wuensche: readonly WunschId[];
  /** Fakt-Zeilen erscheinen nur, wenn einer ihrer Wünsche gewählt ist; Paketzeilen immer. */
  nurAufWunsch: boolean;
}

export interface PaketRolle {
  /** Stellen-ID aus der Registry. */
  id: string;
  /** shortTitle der Stelle (für Ansage und Knopf). */
  titel: string;
  /** Derselbe Titel mit weichen Trennstellen aus titleShy, für die Anzeige auf schmalen Bildschirmen. */
  anzeige: string;
  stelleHref: string;
  bewerbenHref: string;
  zeilen: readonly PaketZeile[];
}

export interface SichtbareZeile extends PaketZeile {
  passt: boolean;
}

/** Zeilen einer Rolle für eine Auswahl: Paketzeilen immer, Fakt-Zeilen nur auf Wunsch; Reihenfolge bleibt. */
export function sichtbareZeilen(rolle: PaketRolle, auswahl: readonly WunschId[]): SichtbareZeile[] {
  const gewaehlt = new Set(auswahl);
  return rolle.zeilen
    .map((zeile) => ({ ...zeile, passt: zeile.wuensche.some((w) => gewaehlt.has(w)) }))
    .filter((zeile) => !zeile.nurAufWunsch || zeile.passt);
}

/** Ansage der Live-Region: „3 Zeilen im Paket als Kundendiensttechniker. 2 passen zu deiner Auswahl.“ */
export function paketStatus(rolle: PaketRolle, zeilen: readonly SichtbareZeile[], auswahl: readonly WunschId[]): string {
  const anzahl = zeilen.length;
  const satz = `${anzahl} ${anzahl === 1 ? 'Zeile' : 'Zeilen'} im Paket als ${rolle.titel}.`;
  if (auswahl.length === 0) return satz;
  const passend = zeilen.filter((zeile) => zeile.passt).length;
  return `${satz} ${passend} ${passend === 1 ? 'passt' : 'passen'} zu deiner Auswahl.`;
}

/** Auswahl umschalten, in der festen Reihenfolge der Wünsche. */
export function wunschUmschalten(auswahl: readonly WunschId[], id: WunschId, an: boolean): WunschId[] {
  const neu = new Set(auswahl);
  if (an) neu.add(id);
  else neu.delete(id);
  return WUNSCH_IDS.filter((w) => neu.has(w));
}
