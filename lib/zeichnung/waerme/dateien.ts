/**
 * Bänder der Vergleichsräume als eigene SVG-Dateien (Prüfrunde 1 C1-6, wie lib/zeichnung/kopf-svg.ts): Die Abbildung
 * „So verteilt sich die Wärme im Raum“ steht weit unter dem ersten Bildschirm der Wärmepumpen-Seite. Inline lagen ihre
 * Bandpfade zweimal im Dokument (HTML und RSC-Nutzlast) und machten es um rund 10 KB gzip schwerer (LCP schlechter,
 * K-013). Als Datei per `<img loading="lazy">` lädt der Browser sie erst, wenn die Abbildung näherkommt; bewegt werden
 * die Bilder wie die Inline-Ebenen (components/zeichnung/waerme/Waermefeld.tsx, WaermefeldDateien).
 *
 * Je Band eine Datei: der Pfad aus WAERMEFELDER (keine eigene Form) in der Farbe seiner Stufe, gespiegelt aus der
 * Wärmerampe (lib/tokens: hell auf Papier und im Druck, dunkel = Pflaume per prefers-color-scheme), viewBox = Rauminneres.
 * Der Dateiname trägt einen Hash des Inhalts (SVG-Dateien werden ein Jahr gecacht, next.config.ts). Ausgeliefert über
 * app/zeichnung/[datei]/route.ts. Prüfung: components/zeichnung/waerme/__tests__/waerme.test.ts,
 * scripts/qa/check-css-chunks.mjs (nie inline im Dokument).
 */
import { createHash } from 'node:crypto';
import { TOKENS } from '@/lib/tokens';
import { WAERMEFELDER, type WaermefeldId } from '../szenen/waermefeld';

/** Felder, deren Bänder als Datei ausgeliefert werden (die Vergleichsräume der Wärmepumpen-Seite). */
export const WAERME_DATEI_FELDER = Object.freeze(['raum-heizkoerper', 'raum-fussboden'] as const satisfies readonly WaermefeldId[]);
export type WaermeDateiFeld = (typeof WAERME_DATEI_FELDER)[number];

/** SVG eines Bands: Pfad der Daten in der Rampenfarbe seiner Stufe, hell, dunkel, Druck. */
export function waermeBandSvg(id: WaermeDateiFeld, stufe: number): string {
  const { innen, baender } = WAERMEFELDER[id];
  const band = baender.find((b) => b.stufe === stufe);
  if (!band) throw new Error(`waerme/dateien: ${id} hat kein Band ${stufe}`);
  const hell = TOKENS.waerme.hell[stufe];
  const dunkel = TOKENS.waerme.dunkel[stufe];
  const stil = `path{fill:${hell}}@media screen and (prefers-color-scheme:dark){path{fill:${dunkel}}}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${innen.x} ${innen.y} ${innen.breite} ${innen.hoehe}" ` +
    `width="${innen.breite}" height="${innen.hoehe}">` +
    `<style>${stil}</style><path d="${band.d}"/></svg>\n`
  );
}

const inhalte = new Map<string, string>();
function inhalt(id: WaermeDateiFeld, stufe: number): string {
  const schluessel = `${id}-${stufe}`;
  if (!inhalte.has(schluessel)) inhalte.set(schluessel, waermeBandSvg(id, stufe));
  return inhalte.get(schluessel)!;
}

/** Dateiname mit den ersten 10 Zeichen des SHA-256 über den Inhalt. */
export function waermeBandDatei(id: WaermeDateiFeld, stufe: number): string {
  return `waerme-${id}-${stufe}-${createHash('sha256').update(inhalt(id, stufe)).digest('hex').slice(0, 10)}.svg`;
}

/** Pfad der Datei auf der Website. */
export function waermeBandPfad(id: WaermeDateiFeld, stufe: number): string {
  return `/zeichnung/${waermeBandDatei(id, stufe)}`;
}

/** Alle Banddateien mit Inhalt, für generateStaticParams und den Route-Handler. */
export function waermeBandDateien(): Array<{ datei: string; svg: string }> {
  return WAERME_DATEI_FELDER.flatMap((id) =>
    WAERMEFELDER[id].baender.map((b) => ({ datei: waermeBandDatei(id, b.stufe), svg: inhalt(id, b.stufe) })),
  );
}
