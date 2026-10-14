/**
 * Schalter FUNNEL_EVENTS im Browser (lib/env.ts, Standard aus bis zur Freigabe durch den Datenschutz, M-034): Ist er
 * an, setzt das Root-Layout auf jeder Seite `<meta name="be-ereignisse" content="an">`
 * (components/analytics/EreignisSchalter.tsx). Er gibt alles frei, was die veröffentlichte Datenschutzerklärung erst
 * mit der Freigabe beschreibt (Entwürfe in docs/operations/datenschutz-aenderungen.md):
 *
 * - die cookielosen Ereignisse (ereignisse.ts),
 * - die Herkunft im Bewerbungslink `?herkunft=`/`ref=` für einen neuen Tab (link.ts, klick.ts) und das Lesen dieses
 *   Parameters (capture.ts),
 * - den sichtbaren Herkunftscode „– W-…“ in WhatsApp-Texten (klick.ts).
 *
 * Ohne ihn gilt, was /datenschutz#herkunft heute sagt: Die Herkunft bleibt im Arbeitsspeicher der Seite und ist in
 * einem neuen Tab weg. Eigene Datei ohne weitere Importe, damit capture.ts und store.ts klein bleiben.
 */

/** Name des Meta-Elements, mit dem das Root-Layout den Schalter ins HTML reicht. */
export const EREIGNIS_META = 'be-ereignisse';

/** Ist der Schalter auf dieser Seite an? Ohne DOM (Server, Tests ohne Dokument) immer aus. */
export function ereignisseAktiv(doc: Pick<Document, 'querySelector'> | undefined = typeof document === 'undefined' ? undefined : document): boolean {
  // querySelector mit ?.: Attrappen ohne DOM-Methoden (Tests) gelten als „aus“
  return doc?.querySelector?.(`meta[name="${EREIGNIS_META}"]`)?.getAttribute('content') === 'an';
}
