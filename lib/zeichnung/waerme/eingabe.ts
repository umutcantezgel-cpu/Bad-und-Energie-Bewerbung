/**
 * Aufgaben des Raumluftmodells (E-031, KERN K-010, Prüfrunde 4): Gebiet, Heizfläche, Außenwände und Schichtung je Feld,
 * gelesen aus den Szenen (lib/zeichnung/szenen/hausschnitt.ts, raumschnitt.ts). Das Modell selbst
 * (lib/zeichnung/waerme/feld.ts) kennt keine Szene. Ersetzt den Löser der Prüfrunden 1–3 (Konvektion aus vorgegebenen
 * Walzen mit Kalibrierung, Prüfrunde 4 B4-1, B4-3): Dessen Isothermen liefen schräg durch den Raum, und sein
 * Temperaturniveau hing an einer Kalibrierkonstante ohne Quelle.
 *
 * Herkunft der Größen (Q = Quelle, S = Schätzwert, G = Geometrie der Szene):
 * - Temperaturen (K über außen, θ = T / SPANNE): Raumluft im Mittel 20 °C (Q: Norm-Innentemperatur eines Wohnraums,
 *   DIN/TS 12831-1), außen −12 °C (S: Norm-Außentemperatur in Mittelhessen in dieser Größe), Vorlauf am Heizkörper
 *   55 °C (S: übliche Auslegung eines Heizkörpers an der Wärmepumpe). Beide Vergleichsräume sind auf dasselbe Mittel
 *   eingestellt (wie mit dem Thermostat) und auf derselben absoluten Skala gezeichnet.
 * - Schichtung mit Heizkörper (Filling Box, Q: Baines & Turner 1969, J. Fluid Mech. 37, 51–80): stabil, oben wärmer,
 *   außerhalb von Fahne und Wandgrenzschicht waagerechte Isothermen (die Schichtung hängt nur von der Höhe ab). Größen S:
 *   Gradient 1 K/m im Kern, warme Schicht unter der Decke +1,5 K mit ihrer Grenze 0,7 m unter der Decke (0,5 m breit),
 *   Kaltluftsee −1,2 K in den untersten 0,3 m. Vom Knöchel (0,1 m) zum Kopf (1,1 m) gibt das rund 1,9 K und bleibt
 *   unter der Grenze 3 K der Kategorie B nach DIN EN ISO 7730 (Q).
 * - Fahne (Q: Morton, Taylor & Turner 1956, Proc. R. Soc. A 234, 1–23; Turner 1973, Buoyancy Effects in Fluids, Kap. 6):
 *   Halbbreite b = 0,12·ζ über dem virtuellen Ursprung, Übertemperatur auf der Achse ∝ 1/ζ (ebene Fahne,
 *   Linienquelle), Einmischkoeffizient α = 0,1. An der Oberkante ist die Fahne so dick wie Wandabstand und Bautiefe
 *   zusammen (G: b₀ = 75 mm, virtueller Ursprung 0,625 m tiefer). Übertemperatur an der Oberkante 8 K (S: Größenordnung
 *   aus der Wärmebilanz der ebenen Fahne über einem Flachheizkörper mit rund 0,7 kW Konvektion je Meter; an der Decke
 *   bleiben rund 2 K). Von vorn gesehen (Hausschnitt) eine Glocke über die Baulänge mit der Halbbreite 0,4 × halbe
 *   Baulänge + b (S): in der Mitte am wärmsten, an den Enden mischt sich Raumluft ein; über der breiten Quelle schnürt
 *   sich die Fahne ein, bevor sie sich aufweitet.
 * - Am Heizkörper (S): Auf seiner Fläche zeigt das Feld die Luft seiner Grenzschicht – unten tritt Raumluft ein, oben ist
 *   sie so warm wie die Oberfläche (Vorlauf); daneben und darüber läuft sie über 30 mm mit einem Rand wie die Fahne aus,
 *   unter dem Heizkörper gibt es keine (die erwärmte Luft steigt, Prüfrunde 1 B1-2).
 * - Kalte Außenwand: Oberfläche um U·R_si·(T_i − T_a) unter der Raumluft (Q: U = 0,28 W/(m²·K) Referenzgebäude GEG
 *   Anlage 1, R_si = 0,13 m²·K/W DIN EN ISO 6946); Fallströmung als dünne Grenzschicht, an der Decke null, am Boden
 *   80 mm (S, Größe nach Heiselberg 1994, Building and Environment 29, 297–301); Kaltluftsee am Fuß der Wand −0,8 K,
 *   0,6 m weit (S). Steht der Heizkörper an der Außenwand, fängt seine Fahne den Kaltluftabfall ab (Q: VDI 6030
 *   Blatt 1): Im Vergleichsraum fällt dort keine kalte Luft.
 * - Fußbodenheizung: schwache Schichtung, am Boden wärmer (S: −0,2 K/m, +1 K in den untersten rund 0,1 m über dem warmen
 *   Boden; die Oberfläche ist höchstens 29 °C warm, DIN EN 1264-2, Q), nur an der Außenwand kühler (S: −0,4 K bis
 *   1,2 m in den Raum, Kaltluftsee −0,5 K, 0,4 m weit).
 *
 * Feldweise:
 * - Hausschnitt: Die Schnittebene liegt dicht vor der Rückwand; der Flachheizkörper hängt an der Rückwand und liegt in
 *   der Ebene (von vorn gesehen, Fahne über die ganze Baulänge). Beide Seitenwände sind Außenwände (Fallströmung).
 * - Vergleichsraum mit Heizkörper: Flachheizkörper an der Außenwand links (von der Seite geschnitten), die Fahne liegt
 *   an der Wand an; rechts eine Innenwand zum beheizten Nachbarraum.
 * - Vergleichsraum mit Fußbodenheizung: links die Außenwand, rechts die Innenwand, die ganze Bodenfläche heizt.
 */
import { HAUS_LAGE, HEIZKOERPER_LAGE } from '../szenen/hausschnitt';
import { RAUM_HEIZKOERPER, RAUM_INNEN, RAUM_MASSE } from '../szenen/raumschnitt';
import type { Aussenwand, Fahne, Feldaufgabe, Heizkoerper, Rechteck, Schichtung } from './feld';
import type { P } from './kontur';

export type FeldId = 'hausschnitt' | 'raum-heizkoerper' | 'raum-fussboden';

/** Temperaturen in °C (Herkunft siehe oben): außen (S), Vorlauf (S), Raumluft im Mittel (Q). */
export const TEMPERATUREN = Object.freeze({ aussen: -12, vorlauf: 55, raum: 20 });
/** Vorlauf − außen in K: θ = T / SPANNE. */
export const SPANNE = TEMPERATUREN.vorlauf - TEMPERATUREN.aussen;
/** Mittlere Raumluft in K über außen. */
export const MITTEL = TEMPERATUREN.raum - TEMPERATUREN.aussen;
/** Heizkörper: oben der Vorlauf (θ = 1), unten abgekühlt (θ = 0,8, S). */
export const HEIZKOERPER_THETA = Object.freeze({ oben: 1, unten: 0.8 });
/** Wärmedurchgang der Außenwand nach dem Referenzgebäude des GEG (Anlage 1), W/(m²·K). */
export const U_AUSSENWAND = 0.28;
/** Wärmeübergangswiderstand innen, waagerechter Wärmestrom (DIN EN ISO 6946), m²·K/W. */
export const R_SI = 0.13;

/** Fahne über dem Heizkörper (MTT 1956, Turner 1973): Ausbreitung db/dζ, Einmischkoeffizient, Übertemperatur (S). */
export const FAHNE = Object.freeze({
  ausbreitung: 0.12,
  einmischung: 0.1,
  /** K an der Oberkante auf der Achse (S). */
  uebertemperatur: 8,
  /** Halbbreite an der Oberkante: (Wandabstand + Bautiefe) / 2 in Einheiten (G). */
  halbbreite: (RAUM_MASSE.wandabstand.mm + RAUM_MASSE.bautiefe.mm) / 2 / 10,
  /** Warme Grenzschicht an der Oberfläche des Heizkörpers, Einheiten (S). */
  grenzschicht: 3,
  /** Von vorn: Halbbreite der Glocke über die Baulänge 0,4 × die halbe Baulänge + b (S; an den Enden mischt sich Raumluft ein). */
  kern: 0.4,
});

/** Schichtung mit Heizkörper (Filling Box) und mit Fußbodenheizung; K bzw. K je Einheit, Längen in Einheiten (S). */
export const SCHICHTUNG = Object.freeze({
  heizkoerper: Object.freeze({
    gradient: 0.01,
    decke: Object.freeze({ stufe: 1.5, tiefe: 70, breite: 50 }),
    boden: Object.freeze({ stufe: -1.2, hoehe: 15, breite: 15 }),
  }) satisfies Schichtung,
  fussboden: Object.freeze({
    gradient: -0.002,
    decke: null,
    boden: Object.freeze({ stufe: 1, hoehe: 6, breite: 6 }),
  }) satisfies Schichtung,
});

/**
 * Außenwand (S außer U und R_si): Fallströmung, Kaltluftsee am Fuß; mit Fußbodenheizung kühlere Luft nahe der Wand (der
 * Raum ist sonst fast gleich warm), mit Heizkörper liegt die Luft außerhalb von Fahne und Grenzschicht geschichtet.
 */
export const AUSSENWAND = Object.freeze({
  heizkoerper: Object.freeze({
    grenzschicht: 8,
    fuss: Object.freeze({ stufe: -0.8, reichweite: 60, hoehe: 10 }),
    naehe: null,
  }),
  fussboden: Object.freeze({
    grenzschicht: 8,
    fuss: Object.freeze({ stufe: -0.5, reichweite: 40, hoehe: 8 }),
    naehe: Object.freeze({ stufe: -0.4, reichweite: 120 }),
  }),
});

/**
 * Skala der Bänder 1–4 (Prüfrunde 4 B4-1, B4-3):
 * - `absolut` (die beiden Vergleichsräume der Wärmepumpen-Seite): Stufe k bei `stufenK[k]` K über der mittleren
 *   Raumluft (S, gewählt für die Zeichnung). Beide Räume haben dasselbe Mittel, gleiche Farbe heißt in beiden Räumen
 *   gleich warm. Stufe 1 und 2 liegen in der Schichtung, Stufe 3 und 4 nur in der Fahne über dem Heizkörper (über der
 *   wärmsten Luft unter der Decke); die Fußbodenheizung erreicht sie nicht.
 * - `flaeche` (Hausschnitt im Hero, ohne Vergleich): Schwellen, oberhalb der 64, 45, 2 und 1 % der Raumluft liegen
 *   (ohne den Heizkörper). Stufe 1 und 2 zeigen die Schichtung und den Trichter, in dem die Fahne in die Deckenschicht
 *   übergeht, Stufe 3 und 4 die Kuppeln der heißen Fahne über dem Heizkörper. Der Hausschnitt zeigt den Heizkörper von
 *   vorn, die Fahne steht der ganzen Baulänge nach in der Schnittebene; auf der Skala der Vergleichsräume (Heizkörper von
 *   der Seite) bedeckten Stufe 3 und 4 dort fast dieselbe Fläche bis unter die Decke.
 * Ein Feld zeichnet nur die Stufen, die es auf mindestens MIN_FLAECHE (rechnung.ts) des Raums erreicht.
 */
export type Skala = Readonly<{ art: 'absolut'; stufenK: readonly number[] }> | Readonly<{ art: 'flaeche'; anteile: readonly number[] }>;
export const SKALA_VERGLEICH: Skala = Object.freeze({ art: 'absolut', stufenK: Object.freeze([-0.4, 0.3, 3, 3.7]) });
export const SKALA_HERO: Skala = Object.freeze({ art: 'flaeche', anteile: Object.freeze([0.64, 0.45, 0.02, 0.01]) });

/**
 * Richtung, in der die Bänder wachsen (Darstellung, components/zeichnung/waerme/waerme.module.css, Prüfrunde 4 B4-2):
 * senkrecht (scaleY) aus dem Ursprung des Bands – die Fahne aus der Oberkante des Heizkörpers nach oben, mit
 * Fußbodenheizung die warme Schicht aus dem Boden. Bänder der Deckenschicht wachsen nicht, sie blenden an Ort und
 * Stelle ein (`bewegung` in rechnung.ts).
 */
export type Wachstum = 'senkrecht';

export interface Feldeingabe {
  id: FeldId;
  innen: Rechteck;
  skala: Skala;
  wachstum: Wachstum;
  aufgabe: Feldaufgabe;
  /**
   * Ursprung des Wachstums (transform-origin): `fahne` für Bänder ohne Deckenkontakt (Mitte der Oberkante des
   * Heizkörpers bzw. Mitte des Bodens), `decke` für Bänder mit Deckenkontakt im Raum mit Heizkörper (über der Fahne).
   */
  ursprung: Readonly<{ fahne: P; decke: P | null }>;
  /** Fenster der Startverzögerungen (Takte): heißestes Band am Anfang, kühlstes am Ende. */
  fenster: readonly [number, number];
  /** Heizfläche als Rechteck (für die Prüfungen: das heißeste Band umschließt die Oberkante). */
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
const RHK_MITTE = RHK.x + RHK.breite / 2;

const wand = (x: number, richtung: 1 | -1, art: keyof typeof AUSSENWAND): Aussenwand => ({
  x,
  richtung,
  oberflaeche: U_AUSSENWAND * R_SI,
  ...AUSSENWAND[art],
});

const heizkoerper = (r: Rechteck, fahne: Pick<Fahne, 'achse' | 'halbeLaenge'>): Heizkoerper => ({
  x0: r.x,
  y0: r.y,
  x1: r.x + r.breite,
  y1: r.y + r.hoehe,
  ...HEIZKOERPER_THETA,
  grenzschicht: FAHNE.grenzschicht,
  fahne: {
    ausbreitung: FAHNE.ausbreitung,
    einmischung: FAHNE.einmischung,
    uebertemperatur: FAHNE.uebertemperatur,
    halbbreite: FAHNE.halbbreite,
    kern: FAHNE.kern,
    ...fahne,
  },
});

export const FELDEINGABEN: readonly Feldeingabe[] = [
  {
    id: 'hausschnitt',
    innen: HAUS_INNEN,
    skala: SKALA_HERO,
    wachstum: 'senkrecht',
    aufgabe: {
      innen: HAUS_INNEN,
      spanne: SPANNE,
      mittel: MITTEL,
      schichtung: SCHICHTUNG.heizkoerper,
      waende: [wand(HAUS_INNEN.x, 1, 'heizkoerper'), wand(HAUS_INNEN.x + HAUS_INNEN.breite, -1, 'heizkoerper')],
      heizkoerper: heizkoerper({ x: HK.x, y: HK.y, breite: HK.breite, hoehe: HK.hoehe }, { achse: HK_MITTE, halbeLaenge: HK.breite / 2 }),
    },
    ursprung: { fahne: { x: HK_MITTE, y: HK.y }, decke: { x: HK_MITTE, y: HAUS_INNEN.y } },
    fenster: [7, 16.5],
    heizflaeche: { x: HK.x, y: HK.y, breite: HK.breite, hoehe: HK.hoehe },
  },
  {
    id: 'raum-heizkoerper',
    innen: RAUM_INNEN,
    skala: SKALA_VERGLEICH,
    wachstum: 'senkrecht',
    aufgabe: {
      innen: RAUM_INNEN,
      spanne: SPANNE,
      mittel: MITTEL,
      schichtung: SCHICHTUNG.heizkoerper,
      waende: [],
      heizkoerper: heizkoerper(RHK, { achse: RAUM_INNEN.x, halbeLaenge: 0 }),
    },
    ursprung: { fahne: { x: RHK_MITTE, y: RHK.y }, decke: { x: RHK_MITTE, y: RAUM_INNEN.y } },
    fenster: [0, 22],
    heizflaeche: { x: RHK.x, y: RHK.y, breite: RHK.breite, hoehe: RHK.hoehe },
  },
  {
    id: 'raum-fussboden',
    innen: RAUM_INNEN,
    skala: SKALA_VERGLEICH,
    wachstum: 'senkrecht',
    aufgabe: {
      innen: RAUM_INNEN,
      spanne: SPANNE,
      mittel: MITTEL,
      schichtung: SCHICHTUNG.fussboden,
      waende: [wand(RAUM_INNEN.x, 1, 'fussboden')],
      heizkoerper: null,
    },
    ursprung: { fahne: { x: RAUM_INNEN.x + RAUM_INNEN.breite / 2, y: RAUM_INNEN.y + RAUM_INNEN.hoehe }, decke: null },
    fenster: [0, 22],
    heizflaeche: { x: RAUM_INNEN.x, y: RAUM_INNEN.y + RAUM_INNEN.hoehe, breite: RAUM_INNEN.breite, hoehe: 0 },
  },
];
