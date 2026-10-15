/**
 * Aufgaben des Wärmefeld-Lösers (E-031, KERN K-010): das Gebiet, die Heizflächen, die Ränder und die Konvektion je
 * Feld, gelesen aus den Szenen (lib/zeichnung/szenen/hausschnitt.ts, raumschnitt.ts). Der Löser selbst
 * (lib/zeichnung/waerme/feld.ts) kennt keine Szene.
 *
 * Temperatur normiert: θ = 0 außen (Norm-Außentemperatur), θ = 1 an der Oberfläche des Heizkörpers oben (Vorlauf).
 *
 * - Hausschnitt: Die Schnittebene liegt dicht vor der Rückwand; der Flachheizkörper hängt an der Rückwand und liegt
 *   damit in der Ebene (HEIZKOERPER_LAGE). Beide Seitenwände sind Außenwände, darüber die oberste Geschossdecke, unten
 *   die Bodenplatte. Zwei gegenläufige Walzen mit gemeinsamem Aufstrom über der Mitte des Heizkörpers.
 * - Vergleichsraum mit Heizkörper: Flachheizkörper an der Außenwand links (von der Seite geschnitten), rechts eine
 *   Innenwand zum beheizten Nachbarraum (adiabat), eine Walze mit Aufstrom am Heizkörper.
 * - Vergleichsraum mit Fußbodenheizung: der ganze Boden gibt Wärme ab (Robin-Rand mit θ_F = 0,6, Wärmeübergang am
 *   Fußboden), schwache Konvektion: eine Walze, die Luft sinkt an der kalten Außenwand und steigt an der Innenwand;
 *   über der warmen Fläche mischen kleine Warmluftsäulen die Luft (vierfache Durchmischung).
 *
 * Ränder: Robin mit h = C · U. U nach dem Referenzgebäude des GEG (Anlage 1): Außenwand 0,28, oberste Geschossdecke
 * 0,20, Bodenplatte 0,35 W/(m²·K), diese mal Temperatur-Korrekturfaktor 0,6 gegen Erdreich (DIN V 4108-6, vereinfacht).
 * Am Fußboden mit Fußbodenheizung der Wärmeübergang 10,8 W/(m²·K) (DIN EN 1264-5). Eine globale Kalibrierkonstante
 * C (Einheiten je Zeiteinheit und W/(m²·K)) setzt die Ränder ins Verhältnis zur Leitfähigkeit der Raumluft K = 1.
 */
import { HAUS_LAGE, HEIZKOERPER_LAGE } from '../szenen/hausschnitt';
import { RAUM_HEIZKOERPER, RAUM_INNEN } from '../szenen/raumschnitt';
import type { Feldaufgabe, Rand, Rechteck } from './feld';
import type { P } from './kontur';

export type FeldId = 'hausschnitt' | 'raum-heizkoerper' | 'raum-fussboden';

/** Wärmedurchgang nach dem Referenzgebäude des GEG (Anlage 1), W/(m²·K). */
export const U_WERTE = Object.freeze({ aussenwand: 0.28, decke: 0.2, bodenplatte: 0.35 });
/** Temperatur-Korrekturfaktor der Bodenplatte gegen Erdreich (DIN V 4108-6, vereinfachter Wert). */
export const F_ERDREICH = 0.6;
/** Wärmeübergang an der Oberfläche einer Fußbodenheizung, W/(m²·K) (DIN EN 1264-5). */
export const ALPHA_FUSSBODEN = 10.8;
/** Oberfläche der Fußbodenheizung im Verhältnis zum Vorlauf des Heizkörpers (θ_F). */
export const THETA_FUSSBODEN = 0.6;
/** Heizkörper: oben der Vorlauf (θ = 1), unten abgekühlt (θ = 0,8). */
export const HEIZKOERPER_THETA = Object.freeze({ oben: 1, unten: 0.8 });
/** Kalibrierkonstante C: h = C · U (siehe oben). */
export const KALIBRIERUNG = 0.01;
/**
 * Péclet-Zahlen der Konvektion (U₀ · H / K): am Heizkörper deutlich (16; mit 8 erreichte die Fahne die Decke im
 * Hausschnitt kaum), an der Fußbodenheizung schwach (2).
 */
export const PECLET = Object.freeze({ heizkoerper: 16, fussboden: 2 });
/**
 * Durchmischung der Raumluft (Vielfaches von K): über dem Heizkörper stabil geschichtet (1), über der warmen Bodenfläche
 * vierfach (instabile Schichtung, die Luft wird ständig umgewälzt).
 */
export const DURCHMISCHUNG = Object.freeze({ heizkoerper: 1, fussboden: 4 });

const robin = (u: number, bezug = 0): Rand => ({ h: KALIBRIERUNG * u, bezug });
const ADIABAT: Rand = { h: 0, bezug: 0 };

export interface Feldeingabe {
  id: FeldId;
  innen: Rechteck;
  aufgabe: Feldaufgabe;
  /** Ursprung des Wachstums der Bänder (Mitte der Oberkante des Heizkörpers bzw. Mitte des Bodens). */
  ursprung: P;
  /** Fenster der Startverzögerungen (Takte): heißestes Band am Anfang, kühlstes am Ende. */
  fenster: readonly [number, number];
  /** Heizfläche als Rechteck (für die Prüfungen: das heißeste Band umschließt sie). */
  heizflaeche: Rechteck;
}

const HK = HEIZKOERPER_LAGE;
const HAUS_INNEN: Rechteck = {
  x: HAUS_LAGE.links + HAUS_LAGE.wand,
  y: HAUS_LAGE.deckeUnten,
  breite: HAUS_LAGE.rechts - HAUS_LAGE.links - 2 * HAUS_LAGE.wand,
  hoehe: HAUS_LAGE.fussboden - HAUS_LAGE.deckeUnten,
};
const HK_MITTE = HK.x + HK.breite / 2;
const RHK = RAUM_HEIZKOERPER;

export const FELDEINGABEN: readonly Feldeingabe[] = [
  {
    id: 'hausschnitt',
    innen: HAUS_INNEN,
    aufgabe: {
      innen: HAUS_INNEN,
      heizflaechen: [{ x0: HK.x, y0: HK.y, x1: HK.x + HK.breite, y1: HK.y + HK.hoehe, ...HEIZKOERPER_THETA }],
      raender: {
        links: robin(U_WERTE.aussenwand),
        rechts: robin(U_WERTE.aussenwand),
        oben: robin(U_WERTE.decke),
        unten: robin(U_WERTE.bodenplatte * F_ERDREICH),
      },
      walzen: [
        { x0: HAUS_INNEN.x, x1: HK_MITTE, aufstrom: 'rechts' },
        { x0: HK_MITTE, x1: HAUS_INNEN.x + HAUS_INNEN.breite, aufstrom: 'links' },
      ],
      peclet: PECLET.heizkoerper,
      durchmischung: DURCHMISCHUNG.heizkoerper,
    },
    ursprung: { x: HK_MITTE, y: HK.y },
    fenster: [7, 16.5],
    heizflaeche: { x: HK.x, y: HK.y, breite: HK.breite, hoehe: HK.hoehe },
  },
  {
    id: 'raum-heizkoerper',
    innen: RAUM_INNEN,
    aufgabe: {
      innen: RAUM_INNEN,
      heizflaechen: [{ x0: RHK.x, y0: RHK.y, x1: RHK.x + RHK.breite, y1: RHK.y + RHK.hoehe, ...HEIZKOERPER_THETA }],
      raender: {
        links: robin(U_WERTE.aussenwand),
        rechts: ADIABAT,
        oben: robin(U_WERTE.decke),
        unten: robin(U_WERTE.bodenplatte * F_ERDREICH),
      },
      walzen: [{ x0: RAUM_INNEN.x, x1: RAUM_INNEN.x + RAUM_INNEN.breite, aufstrom: 'links' }],
      peclet: PECLET.heizkoerper,
      durchmischung: DURCHMISCHUNG.heizkoerper,
    },
    ursprung: { x: RHK.x + RHK.breite / 2, y: RHK.y },
    fenster: [0, 22],
    heizflaeche: { x: RHK.x, y: RHK.y, breite: RHK.breite, hoehe: RHK.hoehe },
  },
  {
    id: 'raum-fussboden',
    innen: RAUM_INNEN,
    aufgabe: {
      innen: RAUM_INNEN,
      heizflaechen: [],
      raender: {
        links: robin(U_WERTE.aussenwand),
        rechts: ADIABAT,
        oben: robin(U_WERTE.decke),
        unten: robin(ALPHA_FUSSBODEN, THETA_FUSSBODEN),
      },
      walzen: [{ x0: RAUM_INNEN.x, x1: RAUM_INNEN.x + RAUM_INNEN.breite, aufstrom: 'rechts' }],
      peclet: PECLET.fussboden,
      durchmischung: DURCHMISCHUNG.fussboden,
    },
    ursprung: { x: RAUM_INNEN.x + RAUM_INNEN.breite / 2, y: RAUM_INNEN.y + RAUM_INNEN.hoehe },
    fenster: [0, 22],
    heizflaeche: { x: RAUM_INNEN.x, y: RAUM_INNEN.y + RAUM_INNEN.hoehe, breite: RAUM_INNEN.breite, hoehe: 0 },
  },
];
