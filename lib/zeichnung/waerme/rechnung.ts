/**
 * Rechnung des Wärmefelds (E-031, KERN K-010): von den Aufgaben (eingabe.ts) über den Löser (feld.ts) und die
 * Konturen (kontur.ts) zu den Daten in lib/zeichnung/szenen/waermefeld.ts. Benutzt vom Skript
 * scripts/zeichnung/waermefeld.ts (schreiben, `--pruefen`) und vom Lock-Test lib/zeichnung/__tests__/waermefeld.test.ts;
 * nie von der Seite (node:crypto).
 *
 * Ablauf je Feld:
 * 1. Stationäres Feld auf dem Gitter von 2 Einheiten (SOR).
 * 2. Normieren: θ̂ = 0 an der kühlsten, 1 an der wärmsten Stelle des Raums (die Oberkante der Heizfläche); geglättet
 *    mit dem Binomialkern.
 * 3. Schwellen der Bänder 1–4 je Feld aus denselben Flächenanteilen: oberhalb liegen 64, 36, 16 und 6 % der Raumfläche.
 *    (Feste θ̂-Schwellen aus dem Hausschnitt erreicht die Fußbodenheizung nicht: Ihr Raum ist gleichmäßiger, das
 *    heißeste Band fehlte. Mit gleichen Anteilen zeigen beide Vergleichsräume, wo die wärmsten 6, 16, 36 und 64 % des
 *    Raums liegen; wie gleichmäßig er ist, prüft lib/zeichnung/__tests__/waermefeld.test.ts am Feld selbst.)
 * 4. Je Band die größte geschlossene Kontur (Marching Squares), Ramer-Douglas-Peucker mit ε = EPSILON, Catmull-Rom als
 *    Bézier, 0,5-Raster.
 * 5. Reihenfolge aus einem echten zeitabhängigen Lauf (Gitter rund 4 Einheiten, ab θ = 0 mit eingeschalteter
 *    Heizfläche): t_k = Zeit, zu der der Ring des Bands k (zwischen seiner Kontur und der des nächst heißeren Bands,
 *    aus dem Endzustand auf demselben Gitter) im Mittel ANKUNFT = 60 % seiner Endtemperatur erreicht. So setzt ein Band
 *    ein, wenn seine Zone zu 60 % erwärmt ist, und wächst dann vom Startmaßstab 0,6 auf 1 (√t). Die Zeiten gehen linear
 *    ins Fenster des Felds (heißestes Band am Anfang, kühlstes am Ende), auf halbe Takte. Kommt das heißeste Band nicht
 *    zuerst oder fallen zwei auf denselben halben Takt, bricht die Rechnung ab.
 *    (Ein Maß über die Fläche der Bänder, „36 % der Endfläche“, ordnet die Bänder über der Fußbodenheizung nicht: Dort
 *    wächst jede Schicht fast gleich schnell aus der Bodenfläche. Der Ring misst, wann die Wärme in der Zone ankommt.)
 */
import { createHash } from 'node:crypto';
import { DURCHMISCHUNG, FELDEINGABEN, KALIBRIERUNG, PECLET, type Feldeingabe, type FeldId } from './eingabe';
import { K, OMEGA, TOLERANZ, laufeZeit, loeseStationaer, type Loesung, type Rechteck } from './feld';
import { SPIEGELRAND, anteilUeber, bezierPfad, extrema, flaeche, glaetten, konturen, normieren, quantil, rdp, type P } from './kontur';

export const SKRIPT = 'scripts/zeichnung/waermefeld.ts';
/** Gitter des stationären Felds und des zeitabhängigen Laufs (Einheiten). */
export const RASTER = 2 as const;
export const RASTER_ZEIT = 4;
/** Flächenanteile der Bänder 1–4 (bestimmen die Schwellen je Feld). */
export const ANTEILE = Object.freeze([0.64, 0.36, 0.16, 0.06]);
/** Genauigkeit der Vereinfachung (Einheiten). */
export const EPSILON = 0.35;
/** Anteil der Endtemperatur im Ring eines Bands, bei dem es „ankommt“ (wie der Startmaßstab 0,6 der Bewegung). */
export const ANKUNFT = 0.6;

export const MODELL =
  'Stationäre Wärmeausbreitung mit Konvektion, K∇²θ − u·∇θ = 0, θ = 0 außen, 1 am Vorlauf; Konvektion aus Walzen ' +
  '(Stromfunktion 16ξ(1−ξ)η(1−η), divergenzfrei, Pe 16 am Heizkörper, 2 an der Fußbodenheizung mit vierfacher ' +
  'Durchmischung); Heizkörper mit fester Temperatur (1,0 oben, 0,8 unten); Wände, Decke und Boden als Robin-Rand mit ' +
  'U nach dem GEG-Referenzgebäude (0,28 / 0,20 / 0,35 × 0,6), Fußbodenheizung als Robin-Rand mit θ 0,6 und ' +
  '10,8 W/(m²·K) (DIN EN 1264-5); eine Kalibrierkonstante (0,01). SOR (ω 1,85) auf 2 Einheiten, Bänder bei 64, 36, ' +
  '16 und 6 % der Raumfläche, Reihenfolge aus einem expliziten Zeitlauf auf rund 4 Einheiten (Ring eines Bands zu ' +
  '60 % erwärmt). Hausschnitt: Schnittebene vor der Rückwand, der Heizkörper an der Rückwand liegt in der Ebene.';

export interface Band {
  stufe: 1 | 2 | 3 | 4;
  schwelle: number;
  d: string;
  ursprung: P;
  startTakte: number;
  flaecheAnteil: number;
}

export interface Feldergebnis {
  id: FeldId;
  innen: Rechteck;
  baender: Band[];
  herkunft: { skript: string; eingabeHash: string; modell: string; raster: 2; iterationen: number; residuum: number };
}

/** Zwischenstand je Feld für Prüfungen (Feld, Normierung, Konturen vor dem Runden). */
export interface Feldrechnung {
  eingabe: Feldeingabe;
  loesung: Loesung;
  /** θ an der kühlsten und an der wärmsten Stelle. */
  normierung: { min: number; max: number };
  /** Normiert und geglättet. */
  glatt: Float64Array;
  /** Schwellen der Bänder 1–4 (θ̂). */
  schwellen: number[];
  /** Ankunftszeiten der Bänder 1–4. */
  ankunft: number[];
}

const auf3 = (x: number) => Math.round(x * 1000) / 1000;

/** Hash der Eingaben: Aufgaben, Konstanten und Verfahren (ändert sich eine, muss die Datei neu geschrieben werden). */
export function eingabeHash(): string {
  const eingaben = {
    felder: FELDEINGABEN,
    konstanten: { K, OMEGA, TOLERANZ, KALIBRIERUNG, PECLET, DURCHMISCHUNG, RASTER, RASTER_ZEIT, ANTEILE, EPSILON, ANKUNFT, SPIEGELRAND },
  };
  return createHash('sha256').update(JSON.stringify(eingaben)).digest('hex').slice(0, 16);
}

/**
 * Zeiten, zu denen der Ring jedes Bands im Mittel ANKUNFT seiner Endtemperatur erreicht (zeitabhängiger Lauf auf
 * RASTER_ZEIT; Ringe und Endtemperaturen aus dem stationären Feld auf demselben Gitter, normiert wie das Feld).
 */
function ankunftszeiten(e: Feldeingabe, schwellen: readonly number[], grob: Loesung): number[] {
  const ende = grob.theta;
  const { min, max } = extrema(ende);
  const ringe = schwellen.map((s, k) => {
    const unten = min + s * (max - min);
    const oben = k < schwellen.length - 1 ? min + schwellen[k + 1] * (max - min) : Infinity;
    const knoten: number[] = [];
    for (let q = 0; q < ende.length; q += 1) if (ende[q] >= unten && ende[q] < oben) knoten.push(q);
    if (knoten.length === 0) throw new Error(`waermefeld: ${e.id}: Band ${k + 1} ohne Knoten auf dem Zeitgitter`);
    return knoten;
  });
  const endmittel = ringe.map((r) => r.reduce((summe, q) => summe + ende[q], 0) / r.length);
  const zeiten = schwellen.map(() => NaN);
  laufeZeit(
    e.aufgabe,
    RASTER_ZEIT,
    (zeit, theta) => {
      for (let k = 0; k < ringe.length; k += 1) {
        if (!Number.isNaN(zeiten[k])) continue;
        const mittel = ringe[k].reduce((summe, q) => summe + theta[q], 0) / ringe[k].length;
        if (mittel >= ANKUNFT * endmittel[k]) zeiten[k] = zeit;
      }
      return zeiten.every((z) => !Number.isNaN(z));
    },
    1e7,
  );
  return zeiten;
}

/** Linear ins Fenster: frühestes → Anfang, spätestes → Ende, auf halbe Takte. */
function insFenster(zeiten: readonly number[], [anfang, ende]: readonly [number, number]): number[] {
  const t0 = Math.min(...zeiten);
  const t1 = Math.max(...zeiten);
  return zeiten.map((t) => Math.round((anfang + ((t - t0) / (t1 - t0)) * (ende - anfang)) * 2) / 2);
}

export interface Rechnung {
  felder: Feldergebnis[];
  zwischen: Map<FeldId, Feldrechnung>;
}

export function berechneWaermefelder(): Rechnung {
  const hash = eingabeHash();
  const zwischen = new Map<FeldId, Feldrechnung>();
  const felder: Feldergebnis[] = [];
  for (const e of FELDEINGABEN) {
    // 1.–2. Feld rechnen (Startwert: dasselbe Feld auf dem Zeitgitter) und normieren
    const grob = loeseStationaer(e.aufgabe, RASTER_ZEIT);
    const loesung = loeseStationaer(e.aufgabe, RASTER, grob);
    const normierung = extrema(loesung.theta);
    const glatt = glaetten(normieren(loesung.theta, normierung.min, normierung.max), loesung.gitter);
    const z: Feldrechnung = { eingabe: e, loesung, normierung, glatt, schwellen: [], ankunft: [] };
    zwischen.set(e.id, z);
    const g = loesung.gitter;
    // 3. Schwellen aus den Flächenanteilen
    const schwellen = ANTEILE.map((a) => auf3(quantil(glatt, a)));
    for (let k = 1; k < schwellen.length; k += 1) {
      if (!(schwellen[k] > schwellen[k - 1])) throw new Error(`waermefeld: ${e.id}: Schwellen nicht steigend (${schwellen.join(', ')})`);
    }
    z.schwellen = schwellen;
    // 5. Ankunftszeiten
    z.ankunft = ankunftszeiten(e, schwellen, grob);
    for (let k = 1; k < z.ankunft.length; k += 1) {
      if (!(z.ankunft[k] < z.ankunft[k - 1])) {
        throw new Error(`waermefeld: ${e.id}: Band ${k + 1} kommt nicht vor Band ${k} an (${z.ankunft.join(', ')}); das heißeste muss zuerst kommen`);
      }
    }
    const takte = insFenster(z.ankunft, e.fenster);
    // 4. Konturen
    const baender: Band[] = schwellen.map((s, k) => {
      const schleifen = konturen(z.glatt, g, s);
      if (schleifen.length === 0) throw new Error(`waermefeld: ${e.id}: keine Kontur auf ${s}`);
      const groesste = schleifen.reduce((a, b) => (Math.abs(flaeche(b)) > Math.abs(flaeche(a)) ? b : a));
      const d = bezierPfad(rdp(groesste, EPSILON), {
        x0: e.innen.x - SPIEGELRAND,
        y0: e.innen.y - SPIEGELRAND,
        x1: e.innen.x + e.innen.breite + SPIEGELRAND,
        y1: e.innen.y + e.innen.hoehe + SPIEGELRAND,
      });
      return {
        stufe: (k + 1) as Band['stufe'],
        schwelle: s,
        d,
        ursprung: { ...e.ursprung },
        startTakte: takte[k],
        flaecheAnteil: auf3(anteilUeber(z.glatt, s)),
      };
    });
    for (let k = 1; k < baender.length; k += 1) {
      if (!(baender[k].startTakte < baender[k - 1].startTakte)) throw new Error(`waermefeld: ${e.id}: Verzögerungen fallen auf halbe Takte zusammen (${takte.join(', ')})`);
    }
    felder.push({
      id: e.id,
      innen: { ...e.innen },
      baender,
      herkunft: { skript: SKRIPT, eingabeHash: hash, modell: MODELL, raster: RASTER, iterationen: z.loesung.iterationen, residuum: z.loesung.residuum },
    });
  }
  return { felder, zwischen };
}

/** Pfad der erzeugten Datei (vom Wurzelverzeichnis). */
export const DATEI = 'lib/zeichnung/szenen/waermefeld.ts';

const zitat = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const zahl = (x: number) => String(x);

/** Inhalt von lib/zeichnung/szenen/waermefeld.ts für die gerechneten Felder (Typen, Daten, Herkunft). */
export function dateiText(felder: readonly Feldergebnis[]): string {
  const feld = (f: Feldergebnis) => {
    const baender = f.baender
      .map(
        (b) =>
          `      {\n` +
          `        stufe: ${b.stufe},\n` +
          `        schwelle: ${zahl(b.schwelle)},\n` +
          `        d: ${zitat(b.d)},\n` +
          `        ursprung: { x: ${zahl(b.ursprung.x)}, y: ${zahl(b.ursprung.y)} },\n` +
          `        startTakte: ${zahl(b.startTakte)},\n` +
          `        flaecheAnteil: ${zahl(b.flaecheAnteil)},\n` +
          `      },\n`,
      )
      .join('');
    const h = f.herkunft;
    return (
      `  ${zitat(f.id)}: {\n` +
      `    id: ${zitat(f.id)},\n` +
      `    innen: { x: ${zahl(f.innen.x)}, y: ${zahl(f.innen.y)}, breite: ${zahl(f.innen.breite)}, hoehe: ${zahl(f.innen.hoehe)} },\n` +
      `    baender: [\n${baender}    ],\n` +
      `    herkunft: {\n` +
      `      skript: ${zitat(h.skript)},\n` +
      `      eingabeHash: ${zitat(h.eingabeHash)},\n` +
      `      modell: MODELL,\n` +
      `      raster: ${h.raster},\n` +
      `      iterationen: ${zahl(h.iterationen)},\n` +
      `      residuum: ${zahl(h.residuum)},\n` +
      `    },\n` +
      `  },\n`
    );
  };
  return `/**
 * Wärmefeld 2.0 (E-031, KERN K-010): berechnete Isothermen im Rauminneren als Bänder, kühl → heiß.
 *
 * ERZEUGT von ${SKRIPT} (\`bun run zeichnung:waermefeld\`), nicht von Hand ändern. Geprüft von
 * \`bun run zeichnung:waermefeld --pruefen\` und lib/zeichnung/__tests__/waermefeld.test.ts (Lock: die Rechnung ergibt
 * genau diese Datei). Rechnung: lib/zeichnung/waerme/ (eingabe.ts Aufgaben, feld.ts Löser, kontur.ts Isothermen,
 * rechnung.ts Ablauf).
 *
 * Vertrag (lib/zeichnung/__tests__/waermefeld-vertrag.test.ts, lib/motion/__tests__/register.test.ts):
 * - Band 0 ist das Innenrechteck \`innen\` (eine Fläche ohne Pfad, steht still); \`baender\` sind die Bänder 1–4,
 *   aufsteigend nach Stufe (kühl → heiß), in der Reihenfolge, in der sie übereinander liegen.
 * - \`schwelle\`: θ̂ (0 an der kühlsten, 1 an der wärmsten Stelle des Raums), oberhalb der 64, 36, 16 bzw. 6 % des Raums
 *   liegen (\`flaecheAnteil\`).
 * - Jedes Band liegt in \`innen\` (± 4 Einheiten Spiegelrand, den die Wände der Zeichnung decken), Band k + 1 liegt in
 *   Band k, alle Zahlen im Pfad liegen auf dem 0,5-Raster.
 * - \`startTakte\` (Verzögerung in Takten zu 80 ms, halbe Takte) steigt streng von heiß nach kühl. Hausschnitt (Hero,
 *   Auslöser \`nachlauf\`) im Fenster 7…16,5 Takte, die Vergleichsräume der Wärmepumpen-Seite (Auslöser \`sicht\`) im
 *   Fenster 0…22 Takte; das Bewegungsregister (lib/motion/register.ts, \`waerme-breitet-sich-aus\`) führt genau diese
 *   Werte. \`ursprung\`: Mitte, aus der ein Band wächst (Oberkante des Heizkörpers bzw. Mitte des Bodens).
 * - Einheiten wie in der Szene, 1 Einheit = 10 mm: Hausschnitt in den Koordinaten von HAUS_LAGE
 *   (lib/zeichnung/szenen/hausschnitt.ts), die Vergleichsräume ab der linken oberen Ecke des Rauminneren
 *   (lib/zeichnung/szenen/raumschnitt.ts).
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
  /** Normierte Temperatur θ̂ (0 kühlste, 1 wärmste Stelle des Raums), oberhalb der das Band liegt. */
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

const MODELL =
  ${zitat(MODELL)};

/** Tief eingefroren: Die Daten ändert nur das Skript. */
function fest<T>(wert: T): T {
  if (wert && typeof wert === 'object') {
    for (const teil of Object.values(wert)) fest(teil);
    Object.freeze(wert);
  }
  return wert;
}

export const WAERMEFELDER: Readonly<Record<WaermefeldId, Waermefeld>> = fest<Record<WaermefeldId, Waermefeld>>({
${felder.map(feld).join('')}});
`;
}
