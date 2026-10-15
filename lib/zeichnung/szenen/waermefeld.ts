/**
 * Wärmefeld 2.0 (E-031, KERN K-010): berechnete Isothermen im Rauminneren als Bänder, kühl → heiß.
 *
 * PLATZHALTER aus Paket W0. Diese Datei legt nur Form und Vertrag fest: Typen, die drei Felder und kleine, gültige
 * Rechteck-Bänder ohne Berechnung. Paket W1 ersetzt sie durch die Ausgabe des Lösers (`bun run zeichnung:waermefeld`,
 * scripts/zeichnung/waermefeld.ts); danach wird sie nur noch vom Skript geschrieben und von
 * `bun run zeichnung:waermefeld --pruefen` gegen die Rechnung geprüft.
 *
 * Vertrag (Prüfungen: lib/zeichnung/__tests__/waermefeld-vertrag.test.ts, lib/motion/__tests__/register.test.ts):
 * - Band 0 ist das Innenrechteck `innen` (eine Fläche ohne Pfad, steht still); `baender` sind die Bänder 1–4,
 *   aufsteigend nach Stufe (kühl → heiß), also in der Reihenfolge, in der sie übereinander liegen.
 * - Jedes Band liegt in `innen` (± 4 Einheiten Spiegelrand), Band k + 1 liegt in Band k, alle Zahlen im Pfad liegen
 *   auf dem 0,5-Raster; Schwelle steigt, Flächenanteil sinkt mit der Stufe.
 * - `startTakte` (Verzögerung in Takten zu 80 ms, halbe Takte) steigt streng von heiß nach kühl: Das heißeste Band
 *   beginnt zuerst. Hausschnitt (Hero, Auslöser `nachlauf`) im Fenster 7…16,5 Takte, die Vergleichsräume der
 *   Wärmepumpen-Seite (Auslöser `sicht`) im Fenster 0…22 Takte; das Bewegungsregister (lib/motion/register.ts,
 *   `waerme-breitet-sich-aus`) führt genau diese Werte.
 * - Einheiten wie in der Szene: Hausschnitt 1 Einheit = 10 mm (lib/zeichnung/szenen/hausschnitt.ts, HAUS_LAGE).
 */
import type { Punkt } from '../norm';

/** Rechteck in Einheiten der Szene. */
export interface Rechteck {
  x: number;
  y: number;
  breite: number;
  hoehe: number;
}

export type WaermefeldId = 'hausschnitt' | 'raum-heizkoerper' | 'raum-fussboden';

export interface Waermeband {
  /** 1 = kühlstes bewegtes Band … 4 = heißestes (Band 0 ist das Innenrechteck). */
  stufe: 1 | 2 | 3 | 4;
  /** Normierte Temperatur θ̂ (0 außen … 1 Vorlaufoberfläche), oberhalb der das Band liegt. */
  schwelle: number;
  /** Geschlossene Kontur (beginnt mit M, endet mit Z), alle Zahlen auf dem 0,5-Raster. */
  d: string;
  /** Ursprung des Wachstums (transform-origin) in Einheiten der Szene. */
  ursprung: Punkt;
  /** Startverzögerung in Takten (80 ms), halbe Takte. */
  startTakte: number;
  /** Anteil der Bandfläche am Innenrechteck (0 < a ≤ 1). */
  flaecheAnteil: number;
}

export interface Waermefeld {
  id: WaermefeldId;
  /** Rauminneres = Band 0. */
  innen: Rechteck;
  /** Bänder 1–4, aufsteigend nach Stufe. */
  baender: readonly Waermeband[];
  herkunft: {
    skript: string;
    eingabeHash: string;
    modell: string;
    raster: 2;
    iterationen: number;
    residuum: number;
  };
}

const HERKUNFT = Object.freeze({
  skript: 'scripts/zeichnung/waermefeld.ts',
  eingabeHash: 'platzhalter',
  modell: 'Platzhalter (Paket W0): Rechtecke ohne Berechnung; Paket W1 ersetzt die Datei durch die Ausgabe des Lösers.',
  raster: 2 as const,
  iterationen: 0,
  residuum: 0,
});

/** Rauminneres des Hausschnitts: HAUS_LAGE x 330…750, y 305…555 (4,2 × 2,5 m). */
const HAUS_INNEN: Rechteck = Object.freeze({ x: 330, y: 305, breite: 420, hoehe: 250 });
/** Vergleichsraum der Wärmepumpen-Seite: gleicher Raum, eigene Koordinaten ab 0. */
const RAUM_INNEN: Rechteck = Object.freeze({ x: 0, y: 0, breite: 420, hoehe: 250 });

const rechteck = (x0: number, y0: number, x1: number, y1: number) => `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
const anteil = (innen: Rechteck, x0: number, y0: number, x1: number, y1: number) =>
  Math.round((((x1 - x0) * (y1 - y0)) / (innen.breite * innen.hoehe)) * 1000) / 1000;

function band(innen: Rechteck, stufe: Waermeband['stufe'], box: [number, number, number, number], ursprung: Punkt, startTakte: number): Waermeband {
  const [x0, y0, x1, y1] = box;
  return Object.freeze({
    stufe,
    schwelle: [0, 0.2, 0.4, 0.6, 0.8][stufe],
    d: rechteck(x0, y0, x1, y1),
    ursprung,
    startTakte,
    flaecheAnteil: anteil(innen, x0, y0, x1, y1),
  });
}

const HK_OBEN: Punkt = Object.freeze({ x: 610, y: 480 });
const WAND_HK: Punkt = Object.freeze({ x: 5, y: 205 });
const BODEN: Punkt = Object.freeze({ x: 210, y: 250 });

export const WAERMEFELDER: Readonly<Record<WaermefeldId, Waermefeld>> = Object.freeze({
  hausschnitt: Object.freeze({
    id: 'hausschnitt',
    innen: HAUS_INNEN,
    baender: Object.freeze([
      band(HAUS_INNEN, 1, [430, 320, 750, 555], HK_OBEN, 16.5),
      band(HAUS_INNEN, 2, [500, 380, 720, 552], HK_OBEN, 13),
      band(HAUS_INNEN, 3, [530, 430, 690, 550], HK_OBEN, 10),
      band(HAUS_INNEN, 4, [550, 466, 670, 546], HK_OBEN, 7),
    ]),
    herkunft: HERKUNFT,
  }),
  'raum-heizkoerper': Object.freeze({
    id: 'raum-heizkoerper',
    innen: RAUM_INNEN,
    baender: Object.freeze([
      band(RAUM_INNEN, 1, [0, 20, 230, 250], WAND_HK, 22),
      band(RAUM_INNEN, 2, [0, 70, 140, 248], WAND_HK, 14.5),
      band(RAUM_INNEN, 3, [0, 120, 80, 245], WAND_HK, 7.5),
      band(RAUM_INNEN, 4, [0, 160, 40, 240], WAND_HK, 0),
    ]),
    herkunft: HERKUNFT,
  }),
  'raum-fussboden': Object.freeze({
    id: 'raum-fussboden',
    innen: RAUM_INNEN,
    baender: Object.freeze([
      band(RAUM_INNEN, 1, [0, 140, 420, 250], BODEN, 22),
      band(RAUM_INNEN, 2, [0, 190, 420, 250], BODEN, 14.5),
      band(RAUM_INNEN, 3, [0, 220, 420, 250], BODEN, 7.5),
      band(RAUM_INNEN, 4, [0, 238, 420, 250], BODEN, 0),
    ]),
    herkunft: HERKUNFT,
  }),
});
