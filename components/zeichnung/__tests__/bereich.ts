/**
 * Prüfhilfe für Bereiche (E-029, E-031): Kennungen (`data-motion`) im Markup, die außerhalb eines umschließenden
 * Elements mit dem passenden Attribut liegen – Dauerbewegung in `data-dauer` (DauerSteuerung), Sicht-Auftritte in
 * `data-ablauf` (SichtStart). Nur für Tests. React liefert wohlgeformtes Markup (leere Elemente mit „/>“).
 */

/** `data-ablauf` mit einem der drei Werte aus lib/motion/ablauf.ts. */
export const ABLAUF_BEREICH = /\sdata-ablauf="(?:fertig|bereit|laeuft)"/;
/** `data-dauer` an oder aus (DauerSteuerung). */
export const DAUER_BEREICH = /\sdata-dauer="(?:an|aus)"/;

/** Gibt die Kennungen aus `ids` zurück, die nicht in einem Element mit `bereich` (oder selbst daran) stehen. */
export function kennungenAusserhalb(markup: string, ids: readonly string[], bereich: RegExp): string[] {
  const stapel: boolean[] = [];
  const fehler: string[] = [];
  for (const m of markup.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const [, zu, , attribute, leer] = m;
    if (zu) {
      stapel.pop();
      continue;
    }
    const hier = bereich.test(attribute);
    const drin = stapel.some(Boolean) || hier;
    for (const id of attribute.match(/\sdata-motion="([^"]+)"/)?.[1].split(/\s+/) ?? []) {
      if (ids.includes(id) && !drin) fehler.push(id);
    }
    if (!leer) stapel.push(hier);
  }
  return fehler;
}
