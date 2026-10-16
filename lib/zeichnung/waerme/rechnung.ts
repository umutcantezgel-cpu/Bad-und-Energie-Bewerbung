/**
 * Rechnung des Wärmefelds (E-031, KERN K-010, Prüfrunde 4): von den Aufgaben (eingabe.ts) über das Raumluftmodell
 * (feld.ts) und die Konturen (kontur.ts) zu den Daten in lib/zeichnung/szenen/waermefeld.ts. Benutzt vom Skript
 * scripts/zeichnung/waermefeld.ts (schreiben, `--pruefen`) und vom Lock-Test lib/zeichnung/__tests__/waermefeld.test.ts;
 * nie von der Seite (node:crypto).
 *
 * Ablauf je Feld:
 * 1. Feld des Raumluftmodells auf dem Gitter von 2 Einheiten, θ absolut (0 außen, 1 Vorlauf), Raummittel auf den
 *    Sollwert eingestellt (Thermostat); geglättet mit dem Binomialkern.
 * 2. Schwellen der Bänder nach der Skala des Felds (eingabe.ts Skala): die beiden Vergleichsräume auf derselben
 *    absoluten Skala, Stufe k bei stufenK[k] K über der mittleren Raumluft; beide haben dasselbe Raummittel, gleiche Farbe
 *    heißt also in beiden Räumen gleich warm. Der Hausschnitt (Hero, ohne Vergleich) bei Flächenanteilen der Raumluft.
 *    Ein Feld bekommt nur die Stufen, die es auf mindestens MIN_FLAECHE des Raums erreicht (die Fußbodenheizung erreicht
 *    die beiden heißesten nicht, sie stehen nur in der Fahne über dem Heizkörper).
 * 3. Je Band die größte geschlossene Kontur (Marching Squares), Ramer-Douglas-Peucker mit ε = EPSILON und Strecken
 *    höchstens MAX_STRECKE lang, Catmull-Rom als Bézier, 0,5-Raster.
 * 4. Reihenfolge aus der Ankunft der Wärme im Modell (feld.ts ankunft): Der Ring eines Bands sind die Luftknoten
 *    zwischen ihm und dem nächst heißeren; t_k = Median der Ankunft im Ring (bei einem Band der Deckenschicht außerhalb
 *    der Fahne, bei einem der Fahne in ihr). Erst steigt die Fahne, dann sinkt die Deckenschicht von der Decke (Baines &
 *    Turner 1969), mit Fußbodenheizung steigt die Wärme vom Boden. Die Zeiten gehen nach √t ins Fenster des Felds
 *    (heißestes Band am Anfang, kühlstes am Ende), auf halbe Takte. Kommt das heißeste Band nicht zuerst, ein Band der
 *    Deckenschicht vor der Fahne oder fallen zwei auf denselben halben Takt, bricht die Rechnung ab.
 * 5. Bewegung je Band (Prüfrunde 4 B4-2): Ein Band, das die Decke außerhalb der Fahne berührt (Deckenschicht), blendet
 *    an Ort und Stelle ein (`einblenden`, Ursprung an der Decke über der Fahne): Mit scaleY von der Decke würden sein Stiel
 *    und die Grenzschicht um den Heizkörper mit nach oben gezogen (ein Umriss des Heizkörpers schwebte über ihm), mit
 *    scaleY vom Boden zöge seine flache Kante an der Decke durch den Raum (Prüfrunde 4 A4-1). Die übrigen wachsen
 *    senkrecht (`wachsen`): die Fahne aus der Oberkante des Heizkörpers nach oben, mit Fußbodenheizung aus der Mitte des
 *    Bodens nach oben.
 */
import { createHash } from 'node:crypto';
import { FELDEINGABEN, type Feldeingabe, type FeldId } from './eingabe';
import { ankunft, aufHeizkoerper, inFahne, luftmittel, rechneFeld, type Gitter, type Loesung, type Rechteck } from './feld';
import { SPIEGELRAND, anteilUeber, bezierPfad, flaeche, glaetten, konturen, quantil, rdp, type P } from './kontur';

export const SKRIPT = 'scripts/zeichnung/waermefeld.ts';
/** Gitter des Felds (Einheiten). */
export const RASTER = 2 as const;
/** Kleinster Flächenanteil, mit dem ein Band gezeichnet wird. */
export const MIN_FLAECHE = 0.02;
/** Genauigkeit der Vereinfachung (Einheiten). */
export const EPSILON = 0.35;
/**
 * Längste Strecke der Vereinfachung (Einheiten, Prüfrunde 3 A3-5): Eine längere Strecke teilt RDP am Punkt der größten
 * Abweichung, auch wenn alle Punkte innerhalb von ε liegen; so folgt auch eine fast gerade Isotherme den Stützpunkten
 * des Rasters statt einer Sehne über die halbe Raumbreite.
 */
export const MAX_STRECKE = 40;
/** Ein Band berührt die Decke, wenn seine Kontur bis auf so viele Einheiten an sie heranreicht. */
export const DECKENKONTAKT = 0.5;

export const MODELL =
  'Halbempirisches Raumluftmodell (Prüfrunde 4), θ = 0 außen, 1 am Vorlauf (Schätzwerte −12 und 55 °C), Raumluft im ' +
  'Mittel 20 °C (DIN/TS 12831-1, außerhalb der Fahne gemittelt, wie ein Thermostat). Mit Heizkörper stabile Schichtung ' +
  'nach dem Filling-Box-Modell (Baines & Turner 1969): Isothermen außerhalb von Fahne und Wandgrenzschicht waagerecht, ' +
  '1 K/m im Kern, warme Schicht unter der Decke (+1,5 K, Grenze 0,7 m unter der Decke), Kaltluftsee am Boden (−1,2 K); ' +
  'Auftriebsfahne über dem Heizkörper nach Morton, Taylor & Turner 1956 (Halbbreite 0,12·ζ ab dem virtuellen Ursprung, ' +
  'Übertemperatur auf der Achse ∝ 1/ζ, 8 K an der Oberkante, von vorn eine Glocke über die Baulänge); auf und am ' +
  'Heizkörper die Luft seiner Grenzschicht, darunter keine; kalte Außenwand mit der Oberfläche U·R_si unter der Raumluft ' +
  '(0,28 W/(m²·K), 0,13 m²·K/W), Fallströmung 80 mm am Boden und Kaltluftsee am Fuß, außer wo der Heizkörper davor steht ' +
  '(VDI 6030). Fußbodenheizung: −0,2 K/m, +1 K über dem warmen Boden, nur an der Außenwand kühler. Größen ohne Quelle sind ' +
  'Schätzwerte (lib/zeichnung/waerme/eingabe.ts). Bänder: Vergleichsräume auf derselben absoluten Skala bei −0,4, +0,3, ' +
  '+3 und +3,7 K über der mittleren Raumluft (die beiden heißesten nur in der Fahne), Hausschnitt bei 64, 45, 2 und 1 % ' +
  'der Raumluft; ein Band nur ab 2 % der Fläche. Reihenfolge aus der Ankunft der Wärme, nach √t ins Fenster: erst die ' +
  'Fahne, dann die Deckenschicht von oben (erste Front nach Baines & Turner), mit Fußbodenheizung vom Boden. Gitter 2 ' +
  'Einheiten, auf 1 Einheit gleiches Mittel und gleiche Flächen. Hausschnitt: Schnittebene vor der Rückwand, der ' +
  'Heizkörper an der Rückwand liegt in der Ebene.';

export interface Band {
  stufe: 1 | 2 | 3 | 4;
  schwelle: number;
  d: string;
  ursprung: P;
  bewegung: 'wachsen' | 'einblenden';
  startTakte: number;
  flaecheAnteil: number;
}

export interface Feldergebnis {
  id: FeldId;
  innen: Rechteck;
  wachstum: 'senkrecht';
  baender: Band[];
  herkunft: { skript: string; eingabeHash: string; modell: string; raster: 2; iterationen: number; residuum: number };
}

/** Zwischenstand je Feld für Prüfungen (Feld, Skala, Ankunft, Deckenschicht). */
export interface Feldrechnung {
  eingabe: Feldeingabe;
  loesung: Loesung;
  /** Mittlere Temperatur der Raumluft (geglättet, ohne Heizfläche). */
  mittel: number;
  /** Geglättet, θ absolut. */
  glatt: Float64Array;
  /** Schwellen der gezeichneten Bänder (θ absolut), aufsteigend. */
  schwellen: number[];
  /** Ankunftszeiten der gezeichneten Bänder (mittlere Ankunft im Ring). */
  ankunft: number[];
  /** Ringe je Band: Indizes der Luftknoten auf dem Gitter der Lösung zwischen dem Band und dem nächst heißeren. */
  ringe: number[][];
  /** Je Band: berührt es die Decke außerhalb der Fahne (Band der Deckenschicht, blendet an Ort und Stelle ein)? */
  deckenband: boolean[];
}

const auf3 = (x: number) => Math.round(x * 1000) / 1000;

/**
 * Schwellen der Stufen 1–4 nach der Skala des Felds (θ absolut, auf 0,001), vor der Auswahl nach MIN_FLAECHE; die
 * Flächenanteile der Skala `flaeche` gelten für die Raumluft (ohne den Heizkörper, der sonst allein die heißeste Stufe
 * füllte).
 */
export function stufenSchwellen(e: Feldeingabe, g: Gitter, glatt: Float64Array): number[] {
  const s = e.skala;
  if (s.art === 'absolut') return s.stufenK.map((k) => auf3((e.aufgabe.mittel + k) / e.aufgabe.spanne));
  const luft = luftknoten(e, g, glatt);
  return s.anteile.map((a) => auf3(quantil(luft, a)));
}

/** θ der Luftknoten (ohne Heizkörper). */
export function luftknoten(e: Feldeingabe, g: Gitter, glatt: Float64Array): Float64Array {
  const werte: number[] = [];
  for (let q = 0; q < glatt.length; q += 1) {
    if (!aufHeizkoerper(e.aufgabe, g.x0 + (q % g.nx) * g.dx, g.y0 + Math.floor(q / g.nx) * g.dy)) werte.push(glatt[q]);
  }
  return Float64Array.from(werte);
}

/** Hash der Eingaben: Aufgaben, Konstanten und Verfahren (ändert sich eine, muss die Datei neu geschrieben werden). */
export function eingabeHash(): string {
  const eingaben = {
    felder: FELDEINGABEN,
    konstanten: { RASTER, MIN_FLAECHE, EPSILON, MAX_STRECKE, SPIEGELRAND, DECKENKONTAKT },
  };
  return createHash('sha256').update(JSON.stringify(eingaben)).digest('hex').slice(0, 16);
}

/** Ringe: je Band die Luftknoten zwischen ihm und dem nächst heißeren (geglättetes Feld); ein leerer Ring bricht ab. */
export function ringeImFeld(e: Feldeingabe, g: Gitter, glatt: Float64Array, schwellen: readonly number[]): number[][] {
  return schwellen.map((s, k) => {
    const oben = k < schwellen.length - 1 ? schwellen[k + 1] : Infinity;
    const knoten: number[] = [];
    for (let q = 0; q < glatt.length; q += 1) {
      const x = g.x0 + (q % g.nx) * g.dx;
      const y = g.y0 + Math.floor(q / g.nx) * g.dy;
      if (aufHeizkoerper(e.aufgabe, x, y)) continue;
      if (glatt[q] >= s && glatt[q] < oben) knoten.push(q);
    }
    if (knoten.length === 0) throw new Error(`waermefeld: ${e.id}: Band ${k + 1} ohne Luftknoten`);
    return knoten;
  });
}

/**
 * Ankunft der Wärme in jedem Ring: Median über seine Knoten (robust gegen die wenigen Knoten, die die Glättung neben dem
 * Heizkörper oder am Boden in einen Ring schiebt). Bei einem Band der Deckenschicht zählen nur die Knoten außerhalb der
 * Fahne (dort kommt die Front an), bei einem Band der Fahne nur die in ihr (dort steigt sie).
 */
function ankunftszeiten(e: Feldeingabe, g: Gitter, ringe: readonly number[][], deckenband: readonly boolean[]): number[] {
  return ringe.map((ring, k) => {
    const lage = (q: number): [number, number] => [g.x0 + (q % g.nx) * g.dx, g.y0 + Math.floor(q / g.nx) * g.dy];
    const auswahl = e.aufgabe.heizkoerper ? ring.filter((q) => inFahne(e.aufgabe, ...lage(q)) !== deckenband[k]) : ring;
    const knoten = auswahl.length > 0 ? auswahl : ring;
    const zeiten = Float64Array.from(knoten, (q) => ankunft(e.aufgabe, ...lage(q))).sort();
    const m = zeiten.length >> 1;
    return zeiten.length % 2 === 1 ? zeiten[m] : (zeiten[m - 1] + zeiten[m]) / 2;
  });
}

/**
 * Berührt die Kontur die Decke außerhalb der Fahne (ein Band der Deckenschicht)? Ein Band, das die Decke nur in der
 * Fahne erreicht, gehört zur Fahne (sie steigt bis unter die Decke). Ohne Heizkörper zählt jeder Kontakt mit der Decke.
 */
function beruehrtDeckeAusserhalbDerFahne(e: Feldeingabe, kontur: readonly P[]): boolean {
  return kontur.some((q) => q.y <= e.innen.y + DECKENKONTAKT && q.x >= e.innen.x && q.x <= e.innen.x + e.innen.breite && !inFahne(e.aufgabe, q.x, e.innen.y));
}

/**
 * Ins Fenster nach √t (wie die Bewegung selbst, E-031 Entscheidung 3): frühestes → Anfang, spätestes → Ende, linear in
 * √t dazwischen, auf halbe Takte (ein einzelnes Band am Anfang). Die Fahne steigt in Sekunden, die Front der
 * Deckenschicht sinkt in Minuten; linear in t fielen die Bänder der Fahne auf denselben Takt.
 */
export function insFenster(zeiten: readonly number[], [anfang, ende]: readonly [number, number]): number[] {
  const w = zeiten.map((t) => Math.sqrt(t));
  const w0 = Math.min(...w);
  const w1 = Math.max(...w);
  if (w1 === w0) return zeiten.map(() => anfang);
  return w.map((v) => Math.round((anfang + ((v - w0) / (w1 - w0)) * (ende - anfang)) * 2) / 2);
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
    // 1. Feld rechnen (Raummittel eingestellt) und glätten
    const loesung = rechneFeld(e.aufgabe, RASTER);
    const g = loesung.gitter;
    const glatt = glaetten(loesung.theta, g);
    const mittel = luftmittel(e.aufgabe, g, glatt);
    // 2. Schwellen nach der Skala; nur Stufen ab MIN_FLAECHE (die Fläche fällt mit der Stufe, es fehlen nur die obersten)
    const alle = stufenSchwellen(e, g, glatt);
    for (let k = 1; k < alle.length; k += 1) {
      if (!(alle[k] > alle[k - 1])) throw new Error(`waermefeld: ${e.id}: Schwellen nicht steigend (${alle.join(', ')})`);
    }
    const schwellen = alle.filter((s) => anteilUeber(glatt, s) >= MIN_FLAECHE);
    if (schwellen.length === 0) throw new Error(`waermefeld: ${e.id}: kein Band auf der Skala`);
    // 3. Konturen; 5. Band der Deckenschicht oder der Fahne
    const schleifen = schwellen.map((s) => {
      const alle = konturen(glatt, g, s);
      if (alle.length === 0) throw new Error(`waermefeld: ${e.id}: keine Kontur auf ${s}`);
      return alle.reduce((a, b) => (Math.abs(flaeche(b)) > Math.abs(flaeche(a)) ? b : a));
    });
    const deckenband = schleifen.map((kontur) => beruehrtDeckeAusserhalbDerFahne(e, kontur));
    // 4. Ankunft je Ring: das heißeste zuerst, jedes Band der Fahne vor jedem der Deckenschicht
    const ringe = ringeImFeld(e, g, glatt, schwellen);
    const zeiten = ankunftszeiten(e, g, ringe, deckenband);
    for (let k = 1; k < zeiten.length; k += 1) {
      if (!(zeiten[k] < zeiten[k - 1])) {
        throw new Error(`waermefeld: ${e.id}: Band ${k + 1} kommt nicht vor Band ${k} an (${zeiten.join(', ')}); das heißeste muss zuerst kommen`);
      }
    }
    const fahne = zeiten.filter((_, k) => !deckenband[k]);
    const decke = zeiten.filter((_, k) => deckenband[k]);
    if (fahne.length > 0 && decke.length > 0 && !(Math.min(...decke) > Math.max(...fahne))) {
      throw new Error(`waermefeld: ${e.id}: ein Band der Deckenschicht kommt vor der Fahne an (${zeiten.join(', ')})`);
    }
    zwischen.set(e.id, { eingabe: e, loesung, mittel, glatt, schwellen, ankunft: zeiten, ringe, deckenband });
    const takte = insFenster(zeiten, e.fenster);
    const baender: Band[] = schwellen.map((s, k) => ({
      stufe: (k + 1) as Band['stufe'],
      schwelle: s,
      d: bezierPfad(rdp(schleifen[k], EPSILON, MAX_STRECKE), {
        x0: e.innen.x - SPIEGELRAND,
        y0: e.innen.y - SPIEGELRAND,
        x1: e.innen.x + e.innen.breite + SPIEGELRAND,
        y1: e.innen.y + e.innen.hoehe + SPIEGELRAND,
      }),
      ursprung: { ...(deckenband[k] && e.ursprung.decke ? e.ursprung.decke : e.ursprung.fahne) },
      bewegung: deckenband[k] ? 'einblenden' : 'wachsen',
      startTakte: takte[k],
      flaecheAnteil: auf3(anteilUeber(glatt, s)),
    }));
    for (let k = 1; k < baender.length; k += 1) {
      if (!(baender[k].startTakte < baender[k - 1].startTakte)) throw new Error(`waermefeld: ${e.id}: Verzögerungen fallen auf halbe Takte zusammen (${takte.join(', ')})`);
    }
    felder.push({
      id: e.id,
      innen: { ...e.innen },
      wachstum: e.wachstum,
      baender,
      herkunft: { skript: SKRIPT, eingabeHash: hash, modell: MODELL, raster: RASTER, iterationen: loesung.iterationen, residuum: loesung.residuum },
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
          `        bewegung: ${zitat(b.bewegung)},\n` +
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
 * genau diese Datei). Rechnung: lib/zeichnung/waerme/ (eingabe.ts Aufgaben und Quellen, feld.ts Raumluftmodell,
 * kontur.ts Isothermen, rechnung.ts Ablauf).
 *
 * Vertrag (lib/zeichnung/__tests__/waermefeld-vertrag.test.ts, lib/motion/__tests__/register.test.ts):
 * - Band 0 ist das Innenrechteck \`innen\` (eine Fläche ohne Pfad, steht still); \`baender\` sind die Bänder 1 bis
 *   höchstens 4, aufsteigend nach Stufe (kühl → heiß), in der Reihenfolge, in der sie übereinander liegen.
 * - \`schwelle\`: θ (0 außen, 1 Vorlauf), oberhalb der das Band liegt; jedes Feld auf das Raummittel 20 °C eingestellt
 *   (Thermostat). Vergleichsräume auf derselben absoluten Skala: Stufe k bei einer festen Temperatur über der mittleren
 *   Raumluft (lib/zeichnung/waerme/eingabe.ts SKALA_VERGLEICH), gleiche Stufe heißt in beiden Räumen gleich warm; die
 *   Fußbodenheizung erreicht die beiden heißesten Stufen nicht (sie stehen nur in der Fahne über dem Heizkörper).
 *   Hausschnitt bei 64, 45, 2 und 1 % der Raumluft (SKALA_HERO). Ein Band erst ab 2 % der Fläche (\`flaecheAnteil\`).
 * - Jedes Band liegt in \`innen\` (± 4 Einheiten Spiegelrand, den die Wände der Zeichnung decken), Band k + 1 liegt in
 *   Band k, alle Zahlen im Pfad liegen auf dem 0,5-Raster.
 * - \`startTakte\` (Verzögerung in Takten zu 80 ms, halbe Takte) steigt streng von heiß nach kühl. Hausschnitt (Hero,
 *   Auslöser \`nachlauf\`) im Fenster 7…16,5 Takte, die Vergleichsräume der Wärmepumpen-Seite (Auslöser \`sicht\`) im
 *   Fenster 0…22 Takte; das Bewegungsregister (lib/motion/register.ts, \`waerme-breitet-sich-aus\`) führt genau diese
 *   Werte. Erst steigt die Fahne, dann erscheint die Deckenschicht (Prüfrunde 4 B4-2): \`bewegung\` \`wachsen\` heißt
 *   senkrecht (\`wachstum\`, scaleY) aus \`ursprung\` – die Fahne aus der Mitte der Oberkante des Heizkörpers nach oben,
 *   die warme Schicht der Fußbodenheizung aus der Mitte des Bodens; \`einblenden\` heißt an Ort und Stelle nur über die
 *   Deckkraft – jedes Band, das die Decke außerhalb der Fahne berührt (die Deckenschicht hängt von Anfang an an der
 *   Decke, \`ursprung\` dort über der Fahne; ohne Heizkörper am Boden).
 * - \`herkunft\`: \`iterationen\` = Runden, in denen das Raummittel eingestellt wurde, \`residuum\` = verbleibende
 *   Abweichung des Raummittels (θ).
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
  /**
   * \`wachsen\`: senkrecht (scaleY) aus dem Ursprung, die Fahne und die warme Schicht über dem Fußboden;
   * \`einblenden\`: an Ort und Stelle (nur Deckkraft), jedes Band, das die Decke außerhalb der Fahne berührt.
   */
  bewegung: 'wachsen' | 'einblenden';
  /** Startverzögerung in Takten (80 ms), halbe Takte. */
  startTakte: number;
  /** Anteil der Bandfläche am Innenrechteck (0 < a ≤ 1). */
  flaecheAnteil: number;
}

export interface Waermefeld {
  id: WaermefeldId;
  /** Rauminneres = Band 0. */
  innen: Rechteck;
  /** Wie die Bänder wachsen: senkrecht (scaleY) aus dem Ursprung jedes Bands. */
  wachstum: 'senkrecht';
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
