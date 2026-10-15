/**
 * Rechnung des Wärmefelds (E-031, KERN K-010): von den Aufgaben (eingabe.ts) über den Löser (feld.ts) und die
 * Konturen (kontur.ts) zu den Daten in lib/zeichnung/szenen/waermefeld.ts. Benutzt vom Skript
 * scripts/zeichnung/waermefeld.ts (schreiben, `--pruefen`) und vom Lock-Test lib/zeichnung/__tests__/waermefeld.test.ts;
 * nie von der Seite (node:crypto).
 *
 * Ablauf je Feld:
 * 1. Stationäres Feld auf dem Gitter von 2 Einheiten (SOR), θ absolut (0 außen, 1 Vorlauf); geglättet mit dem
 *    Binomialkern.
 * 2. Schwellen der Bänder (Feldeingabe.skala):
 *    - Hausschnitt (`eigen`): oberhalb liegen 64, 36, 16 und 6 % der Raumfläche.
 *    - Vergleichsräume (`vergleich`, Prüfrunde 1 B1-1): eine gemeinsame Skala. Beide Räume haben dieselbe mittlere
 *      Raumtemperatur (wie mit dem Thermostat geregelt); die Schwellen sind dieselben Abstände vom Raummittel, nämlich
 *      die des Raums mit Heizkörper bei 64/36/16/6 % seiner Fläche. Gleiche Farbe heißt so in beiden Räumen gleich
 *      warm. Die Fußbodenheizung erreicht die oberen Abstände nicht: Sie bekommt nur die Bänder, die ihr Feld auf
 *      mindestens MIN_FLAECHE des Raums erreicht – das zeigt, dass sie gleichmäßiger heizt. (Vorher hatte jeder Raum
 *      seine eigenen Anteile; beide sahen gleich geschichtet aus.)
 * 3. Je Band die größte geschlossene Kontur (Marching Squares), Ramer-Douglas-Peucker mit ε = EPSILON, Catmull-Rom als
 *    Bézier, 0,5-Raster.
 * 4. Reihenfolge aus einem echten zeitabhängigen Lauf (Gitter rund 4 Einheiten, ab θ = 0 mit eingeschalteter
 *    Heizfläche): t_k = Zeit, zu der der Ring des Bands k (zwischen seiner Kontur und der des nächst heißeren Bands,
 *    aus dem Endzustand auf demselben Gitter) im Mittel ANKUNFT = 60 % seiner Endtemperatur erreicht. So setzt ein Band
 *    ein, wenn seine Zone zu 60 % erwärmt ist, und wächst dann vom Startmaßstab 0,6 auf 1 (√t). Die Zeiten gehen linear
 *    ins Fenster des Felds (heißestes Band am Anfang, kühlstes am Ende), auf halbe Takte. Kommt das heißeste Band nicht
 *    zuerst oder fallen zwei auf denselben halben Takt, bricht die Rechnung ab.
 *    (Ein Maß über die Fläche der Bänder, „36 % der Endfläche“, ordnet die Bänder über der Fußbodenheizung nicht: Dort
 *    wächst jede Schicht fast gleich schnell aus der Bodenfläche. Der Ring misst, wann die Wärme in der Zone ankommt.)
 */
import { createHash } from 'node:crypto';
import { DURCHMISCHUNG, FELDEINGABEN, GRENZSCHICHT, KALIBRIERUNG, PECLET, type Feldeingabe, type FeldId } from './eingabe';
import { K, OMEGA, TOLERANZ, laufeZeit, loeseStationaer, type Feldaufgabe, type Gitter, type Loesung, type Rechteck } from './feld';
import { SPIEGELRAND, anteilUeber, bezierPfad, flaeche, glaetten, konturen, quantil, rdp, type P } from './kontur';

export const SKRIPT = 'scripts/zeichnung/waermefeld.ts';
/** Gitter des stationären Felds und des zeitabhängigen Laufs (Einheiten). */
export const RASTER = 2 as const;
export const RASTER_ZEIT = 4;
/** Flächenanteile der Bänder 1–4 (bestimmen die Schwellen des Hausschnitts und des Bezugsraums). */
export const ANTEILE = Object.freeze([0.64, 0.36, 0.16, 0.06]);
/** Kleinster Flächenanteil, mit dem ein Band auf der gemeinsamen Skala der Vergleichsräume gezeichnet wird. */
export const MIN_FLAECHE = 0.02;
/** Genauigkeit der Vereinfachung (Einheiten). */
export const EPSILON = 0.35;
/** Anteil der Endtemperatur im Ring eines Bands, bei dem es „ankommt“ (wie der Startmaßstab 0,6 der Bewegung). */
export const ANKUNFT = 0.6;

export const MODELL =
  'Stationäre Wärmeausbreitung mit Konvektion, K∇²θ − u·∇θ = 0, θ = 0 außen, 1 am Vorlauf; Konvektion aus Walzen ' +
  '(Stromfunktion 16ξ(1−ξ)η(1−η), divergenzfrei, Pe 16 am Heizkörper, 2 an der Fußbodenheizung; im Vergleichsraum ' +
  'mit Heizkörper steigt die Luft in einer dünnen Schicht am Heizkörper, F(ξ) = (1−ξ)ξ/(ξ+0,05)); Heizkörper mit ' +
  'fester Temperatur (1,0 oben, 0,8 unten), Unterseite ohne Wärmeabgabe nach unten; Wände, Decke und Boden als ' +
  'Robin-Rand mit U nach dem GEG-Referenzgebäude (0,28 / 0,20 / 0,35 × 0,6), Fußbodenheizung als Robin-Rand mit θ 0,6 ' +
  'und 10,8 W/(m²·K) (DIN EN 1264-5), vierfache Leitfähigkeit über dem Boden als Ersatz für den Strahlungsaustausch ' +
  '(Kalibrierung ohne Quelle); Kalibrierkonstante der Ränder 0,01. SOR (ω 1,5) auf 2 Einheiten. Bänder: Hausschnitt bei 64, 36, 16 ' +
  'und 6 % der Raumfläche; Vergleichsräume bei gleicher mittlerer Raumtemperatur auf derselben Skala (Abstände vom ' +
  'Raummittel wie im Raum mit Heizkörper bei 64/36/16/6 %), ein Band nur ab 2 % der Fläche. Reihenfolge aus einem ' +
  'expliziten Zeitlauf auf rund 4 Einheiten (Ring eines Bands zu 60 % erwärmt). Hausschnitt: Schnittebene vor der ' +
  'Rückwand, der Heizkörper an der Rückwand liegt in der Ebene.';

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
  wachstum: 'radial' | 'senkrecht';
  baender: Band[];
  herkunft: { skript: string; eingabeHash: string; modell: string; raster: 2; iterationen: number; residuum: number };
}

/** Zwischenstand je Feld für Prüfungen (Feld, Skala, Konturen vor dem Runden). */
export interface Feldrechnung {
  eingabe: Feldeingabe;
  loesung: Loesung;
  /** Mittlere Temperatur der Raumluft (geglättet, ohne Heizfläche). */
  mittel: number;
  /** Geglättet, θ absolut. */
  glatt: Float64Array;
  /** Schwellen der gezeichneten Bänder (θ absolut), aufsteigend. */
  schwellen: number[];
  /** Ankunftszeiten der gezeichneten Bänder. */
  ankunft: number[];
}

const auf3 = (x: number) => Math.round(x * 1000) / 1000;

/** Hash der Eingaben: Aufgaben, Konstanten und Verfahren (ändert sich eine, muss die Datei neu geschrieben werden). */
export function eingabeHash(): string {
  const eingaben = {
    felder: FELDEINGABEN,
    konstanten: { K, OMEGA, TOLERANZ, KALIBRIERUNG, PECLET, DURCHMISCHUNG, GRENZSCHICHT, RASTER, RASTER_ZEIT, ANTEILE, MIN_FLAECHE, EPSILON, ANKUNFT, SPIEGELRAND },
  };
  return createHash('sha256').update(JSON.stringify(eingaben)).digest('hex').slice(0, 16);
}

/**
 * Zeiten, zu denen der Ring jedes Bands im Mittel ANKUNFT seiner Endtemperatur erreicht (zeitabhängiger Lauf auf
 * RASTER_ZEIT; Ringe und Endtemperaturen aus dem stationären Feld auf demselben Gitter, Schwellen θ absolut).
 */
function ankunftszeiten(e: Feldeingabe, schwellen: readonly number[], grob: Loesung): number[] {
  const ende = grob.theta;
  const ringe = schwellen.map((s, k) => {
    const unten = s;
    const oben = k < schwellen.length - 1 ? schwellen[k + 1] : Infinity;
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

/** Linear ins Fenster: frühestes → Anfang, spätestes → Ende, auf halbe Takte (ein einzelnes Band am Anfang). */
function insFenster(zeiten: readonly number[], [anfang, ende]: readonly [number, number]): number[] {
  const t0 = Math.min(...zeiten);
  const t1 = Math.max(...zeiten);
  if (t1 === t0) return zeiten.map(() => anfang);
  return zeiten.map((t) => Math.round((anfang + ((t - t0) / (t1 - t0)) * (ende - anfang)) * 2) / 2);
}

/** Liegt der Knoten (x, y) auf einer Heizfläche (feste Temperatur, keine Raumluft)? */
function aufHeizflaeche(a: Feldaufgabe, x: number, y: number): boolean {
  return a.heizflaechen.some((f) => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1);
}

/** Mittlere Temperatur der Raumluft: Mittel über alle Knoten außer denen der Heizflächen. */
function raummittel(theta: Float64Array, g: Gitter, a: Feldaufgabe): number {
  let summe = 0;
  let n = 0;
  for (let j = 0; j < g.ny; j += 1) {
    for (let i = 0; i < g.nx; i += 1) {
      if (aufHeizflaeche(a, g.x0 + i * g.dx, g.y0 + j * g.dy)) continue;
      summe += theta[j * g.nx + i];
      n += 1;
    }
  }
  return summe / n;
}

export interface Rechnung {
  felder: Feldergebnis[];
  zwischen: Map<FeldId, Feldrechnung>;
}

export function berechneWaermefelder(): Rechnung {
  const hash = eingabeHash();
  const zwischen = new Map<FeldId, Feldrechnung>();
  const felder: Feldergebnis[] = [];
  const grobe = new Map<FeldId, Loesung>();
  for (const e of FELDEINGABEN) {
    // 1. Feld rechnen (Startwert: dasselbe Feld auf dem Zeitgitter) und glätten; das Mittel der Raumluft
    const grob = loeseStationaer(e.aufgabe, RASTER_ZEIT);
    const loesung = loeseStationaer(e.aufgabe, RASTER, grob);
    const glatt = glaetten(loesung.theta, loesung.gitter);
    const mittel = raummittel(glatt, loesung.gitter, e.aufgabe);
    zwischen.set(e.id, { eingabe: e, loesung, mittel, glatt, schwellen: [], ankunft: [] });
    grobe.set(e.id, grob);
  }
  for (const e of FELDEINGABEN) {
    const z = zwischen.get(e.id)!;
    const grob = grobe.get(e.id)!;
    const glatt = z.glatt;
    const g = z.loesung.gitter;
    // 2. Schwellen: eigene Flächenanteile oder die Abstände vom Raummittel des Bezugsraums
    let schwellen: number[];
    if (e.skala.art === 'eigen') {
      schwellen = ANTEILE.map((a) => auf3(quantil(glatt, a)));
    } else {
      const bezug = zwischen.get(e.skala.bezug);
      if (!bezug || bezug.eingabe.skala.art !== 'vergleich' || bezug.eingabe.skala.bezug !== e.skala.bezug) {
        throw new Error(`waermefeld: ${e.id}: Bezugsraum ${e.skala.bezug} fehlt oder steht nicht auf seiner eigenen Skala`);
      }
      const abstaende = ANTEILE.map((a) => quantil(bezug.glatt, a) - bezug.mittel);
      schwellen = abstaende.map((d) => auf3(z.mittel + d)).filter((s) => anteilUeber(glatt, s) >= MIN_FLAECHE);
      if (schwellen.length === 0) throw new Error(`waermefeld: ${e.id}: kein Band auf der gemeinsamen Skala`);
    }
    for (let k = 1; k < schwellen.length; k += 1) {
      if (!(schwellen[k] > schwellen[k - 1])) throw new Error(`waermefeld: ${e.id}: Schwellen nicht steigend (${schwellen.join(', ')})`);
    }
    z.schwellen = schwellen;
    // 4. Ankunftszeiten
    z.ankunft = ankunftszeiten(e, schwellen, grob);
    for (let k = 1; k < z.ankunft.length; k += 1) {
      if (!(z.ankunft[k] < z.ankunft[k - 1])) {
        throw new Error(`waermefeld: ${e.id}: Band ${k + 1} kommt nicht vor Band ${k} an (${z.ankunft.join(', ')}); das heißeste muss zuerst kommen`);
      }
    }
    const takte = insFenster(z.ankunft, e.fenster);
    // 3. Konturen
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
      wachstum: e.wachstum,
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
      `    wachstum: ${zitat(f.wachstum)},\n` +
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
 * - Band 0 ist das Innenrechteck \`innen\` (eine Fläche ohne Pfad, steht still); \`baender\` sind die Bänder 1 bis
 *   höchstens 4, aufsteigend nach Stufe (kühl → heiß), in der Reihenfolge, in der sie übereinander liegen.
 * - \`schwelle\`: θ (0 außen, 1 Vorlauf), oberhalb der das Band liegt. Hausschnitt: 64, 36, 16 bzw. 6 % des Raums
 *   (\`flaecheAnteil\`). Vergleichsräume auf gemeinsamer Skala: gleiche mittlere Raumtemperatur, dieselben Abstände vom
 *   Raummittel wie im Raum mit Heizkörper; ein Band erst ab 2 % der Fläche, die Fußbodenheizung hat darum weniger
 *   Bänder (gleichmäßiger).
 * - Jedes Band liegt in \`innen\` (± 4 Einheiten Spiegelrand, den die Wände der Zeichnung decken), Band k + 1 liegt in
 *   Band k, alle Zahlen im Pfad liegen auf dem 0,5-Raster.
 * - \`startTakte\` (Verzögerung in Takten zu 80 ms, halbe Takte) steigt streng von heiß nach kühl. Hausschnitt (Hero,
 *   Auslöser \`nachlauf\`) im Fenster 7…16,5 Takte, die Vergleichsräume der Wärmepumpen-Seite (Auslöser \`sicht\`) im
 *   Fenster 0…22 Takte; das Bewegungsregister (lib/motion/register.ts, \`waerme-breitet-sich-aus\`) führt genau diese
 *   Werte. \`ursprung\`: Mitte, aus der ein Band wächst (Oberkante des Heizkörpers bzw. Mitte des Bodens);
 *   \`wachstum\`: radial aus dem Ursprung, mit Fußbodenheizung senkrecht aus der Bodenlinie (die ganze Fläche heizt).
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
  /** 1 = kühlstes bewegtes Band … 4 = heißestes (Band 0 ist das Innenrechteck); gleiche Stufe = gleiche Farbe. */
  stufe: 1 | 2 | 3 | 4;
  /** Temperatur θ (0 außen, 1 Vorlauf), oberhalb der das Band liegt. */
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
  /** Wie die Bänder wachsen: aus dem Ursprung (radial) oder nur nach oben aus der Bodenlinie (senkrecht). */
  wachstum: 'radial' | 'senkrecht';
  /** Bänder 1 bis höchstens 4, aufsteigend nach Stufe. */
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
