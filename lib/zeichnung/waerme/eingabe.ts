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
 * - Beide Räume mit Heizkörper strömen in dünnen Schichten (SCHICHTEN, Prüfrunde 3 B3-2): Die Luft steigt in einer
 *   dünnen Fahne über dem Heizkörper auf, breitet sich als Deckenstrahl unter der Decke aus und sinkt im Hausschnitt an
 *   den kalten Außenwänden, im Vergleichsraum langsam im ganzen Raum (an der Innenwand fällt keine kalte Luft,
 *   Prüfrunde 2 B2-2); die Fahne saugt Raumluft aus der unteren Raumhälfte an.
 * - Beide Räume mit Heizkörper mit konvektiver Anpassung (ANPASSUNG, Prüfrunde 2 B2-1): Die Walzen sind fest vorgegeben;
 *   wo die Luft oben kühler wäre als darunter, mischt sie sich, wie es der Auftrieb täte. So liegt die wärmste Luft
 *   unter der Decke und nicht 1 m tiefer.
 * - Beide Heizkörper geben nach unten keine Wärme an die Luft ab (Unterseite adiabat): Die erwärmte Luft steigt; ohne
 *   diese Angabe diffundierte die feste Temperatur der Heizfläche bis auf den Boden darunter.
 * - Vergleichsraum mit Fußbodenheizung: der ganze Boden gibt Wärme ab (Robin-Rand mit θ_F = 0,6, Wärmeübergang am
 *   Fußboden), schwache Konvektion: eine Walze, die Luft sinkt an der kalten Außenwand und steigt an der Innenwand.
 *   Die erhöhte Leitfähigkeit über dem Boden (DURCHMISCHUNG) ersetzt den Strahlungsaustausch der warmen Bodenfläche
 *   mit Wänden und Decke, den das Modell nicht eigens abbildet – eine Kalibrierung ohne Quelle wie KALIBRIERUNG.
 *
 * Ränder: Robin mit h = C · U. U nach dem Referenzgebäude des GEG (Anlage 1): Außenwand 0,28, oberste Geschossdecke
 * 0,20, Bodenplatte 0,35 W/(m²·K), diese mal Temperatur-Korrekturfaktor 0,6 gegen Erdreich (DIN V 4108-6, vereinfacht).
 * Am Fußboden mit Fußbodenheizung der Wärmeübergang 10,8 W/(m²·K) (DIN EN 1264-5). Eine globale Kalibrierkonstante
 * C (Einheiten je Zeiteinheit und W/(m²·K)) setzt die Ränder ins Verhältnis zur Leitfähigkeit der Raumluft K = 1.
 */
import { HAUS_LAGE, HEIZKOERPER_LAGE } from '../szenen/hausschnitt';
import { RAUM_HEIZKOERPER, RAUM_INNEN } from '../szenen/raumschnitt';
import type { Anpassung, Feldaufgabe, Rand, Rechteck } from './feld';
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
 * Wirksame Leitfähigkeit der Raumluft (Vielfaches von K). Mit Heizkörper 1. Mit Fußbodenheizung 4: Kalibrierung ohne
 * Quelle (Prüfrunde 1 B1-4), als Ersatz für den Strahlungsaustausch der großen, wenig warmen Bodenfläche mit Wänden und
 * Decke – der Robin-Rand mit α = 10,8 W/(m²·K) gibt die ganze Leistung (Konvektion und Strahlung) an die Luft am Boden
 * ab, ohne diesen Ausgleich stünde eine zu starke Schichtung über dem Boden. Gewählt so, dass der Raum gleichmäßiger
 * ist als mit Heizkörper, wie es der Strahlungsanteil der Fußbodenheizung bewirkt (ENTSCHEIDUNGEN E-031).
 */
export const DURCHMISCHUNG = Object.freeze({ heizkoerper: 1, fussboden: 4 });
/**
 * Walzen der Räume mit Heizkörper aus dünnen Schichten (Prüfrunde 3 B3-2, lib/zeichnung/waerme/feld.ts
 * Walze.schichten), je als Anteil der Walzenbreite bzw. der Raumhöhe. Gewählt, nicht gemessen:
 * - aufstrom 0,05: die Fahne über dem Heizkörper (im Vergleichsraum 0,05 × 4,2 m ≈ 0,2 m, Wandabstand und Bautiefe des
 *   Heizkörpers samt der aufsteigenden Schicht davor, wie die Aufstromschicht aus Prüfrunde 1 B1-2).
 * - decke 0,05 (0,05 × 2,5 m ≈ 0,12 m): der Deckenstrahl, in dem die Fahne die warme Luft unter der Decke verteilt.
 *   Vorher stieg die Luft in einer Walze über die ganze Höhe und kehrte in der oberen Raumhälfte um; die Isothermen
 *   standen dort senkrecht, und unter der Decke war der waagerechte Unterschied größer als der senkrechte.
 * - boden 1: die Rückströmung zur Fahne verteilt sich über die untere Raumhälfte (die Fahne saugt Raumluft an).
 * - abstrom: im Hausschnitt 0,05, die Luft sinkt an den kalten Außenwänden; im Vergleichsraum 4, sie sinkt langsam im
 *   ganzen Raum, zur Innenwand hin etwas stärker (Prüfrunde 2 B2-2: keine kalte Wand, an der sie fiele).
 */
export const SCHICHTEN = Object.freeze({
  hausschnitt: Object.freeze({ aufstrom: 0.05, abstrom: 0.05, decke: 0.05, boden: 1 }),
  raum: Object.freeze({ aufstrom: 0.05, abstrom: 4, decke: 0.05, boden: 0.5 }),
});

/**
 * Konvektive Anpassung der Räume mit Heizkörper (Prüfrunde 2 B2-1, lib/zeichnung/waerme/feld.ts Anpassung): Wo die Luft
 * oben kühler ist als darunter, mischt sie sich mit der 41-fachen Leitfähigkeit (faktor 40) – eine instabile Schichtung
 * baut sich so bis auf rund ein Vierzigstel ab. Ausgenommen ist eine Gitterzeile an Decke und Boden (randschicht 2
 * Einheiten = 20 mm, Prüfrunde 3 B3-2; vorher 0,1 m): Dort gibt die Luft Wärme an die Fläche ab, die Grenzschicht ist
 * Millimeter bis Zentimeter dick. Gewählt, nicht gemessen. Nicht bei der Fußbodenheizung: Über dem warmen Boden ist
 * die Schichtung überall instabil, das Modell bildet diese Durchmischung dort schon mit DURCHMISCHUNG ab (Prüfrunde 1
 * B1-4); beides zusammen zählte den Auftrieb doppelt.
 */
export const ANPASSUNG: Anpassung = Object.freeze({ faktor: 40, randschicht: 2 });

const robin = (u: number, bezug = 0): Rand => ({ h: KALIBRIERUNG * u, bezug });
const ADIABAT: Rand = { h: 0, bezug: 0 };

/**
 * Skala der Bänder (Prüfrunde 1 B1-1, Prüfrunde 3 B3-1): `eigen` – Schwellen aus den Flächenanteilen des Felds selbst
 * (Hausschnitt); `vergleich` – die beiden Vergleichsräume stehen auf einer gemeinsamen Skala: gleiche mittlere
 * Raumtemperatur (wie mit einem Thermostat geregelt). Das Feld ist linear in der Quelle (Robin-Bezug 0 an Wänden und
 * Decke, Heizfläche bzw. Fußboden als einzige Quelle; die konvektive Anpassung hängt nur vom Vorzeichen der
 * Unterschiede ab): Hebt der Thermostat die Vorlauftemperatur, wachsen alle Temperaturen über außen mit demselben
 * Faktor. Die Schwellen eines Raums sind darum die des Bezugsraums (Heizkörper, bei 64/36/16/6 % seiner Fläche) mal
 * dem Verhältnis der Raummittel. Ein Raum bekommt nur die Bänder, die sein Feld erreicht.
 */
export type Skala = { art: 'eigen' } | { art: 'vergleich'; bezug: FeldId };

/**
 * Wie die Bänder wachsen (Darstellung, components/zeichnung/waerme/waerme.module.css): `radial` aus dem Ursprung an der
 * Oberkante des Heizkörpers; `senkrecht` nur nach oben aus der Bodenlinie – die Fußbodenheizung erwärmt die ganze
 * Fläche zugleich, die Schichten wachsen nur in die Höhe (Prüfrunde 1 B1-6).
 */
export type Wachstum = 'radial' | 'senkrecht';

export interface Feldeingabe {
  id: FeldId;
  innen: Rechteck;
  skala: Skala;
  wachstum: Wachstum;
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
    skala: { art: 'eigen' },
    wachstum: 'radial',
    aufgabe: {
      innen: HAUS_INNEN,
      heizflaechen: [{ x0: HK.x, y0: HK.y, x1: HK.x + HK.breite, y1: HK.y + HK.hoehe, ...HEIZKOERPER_THETA, unterseiteAdiabat: true }],
      raender: {
        links: robin(U_WERTE.aussenwand),
        rechts: robin(U_WERTE.aussenwand),
        oben: robin(U_WERTE.decke),
        unten: robin(U_WERTE.bodenplatte * F_ERDREICH),
      },
      walzen: [
        { x0: HAUS_INNEN.x, x1: HK_MITTE, aufstrom: 'rechts', schichten: SCHICHTEN.hausschnitt },
        { x0: HK_MITTE, x1: HAUS_INNEN.x + HAUS_INNEN.breite, aufstrom: 'links', schichten: SCHICHTEN.hausschnitt },
      ],
      peclet: PECLET.heizkoerper,
      durchmischung: DURCHMISCHUNG.heizkoerper,
      anpassung: ANPASSUNG,
    },
    ursprung: { x: HK_MITTE, y: HK.y },
    fenster: [7, 16.5],
    heizflaeche: { x: HK.x, y: HK.y, breite: HK.breite, hoehe: HK.hoehe },
  },
  {
    id: 'raum-heizkoerper',
    innen: RAUM_INNEN,
    skala: { art: 'vergleich', bezug: 'raum-heizkoerper' },
    wachstum: 'radial',
    aufgabe: {
      innen: RAUM_INNEN,
      heizflaechen: [{ x0: RHK.x, y0: RHK.y, x1: RHK.x + RHK.breite, y1: RHK.y + RHK.hoehe, ...HEIZKOERPER_THETA, unterseiteAdiabat: true }],
      raender: {
        links: robin(U_WERTE.aussenwand),
        rechts: ADIABAT,
        oben: robin(U_WERTE.decke),
        unten: robin(U_WERTE.bodenplatte * F_ERDREICH),
      },
      walzen: [{ x0: RAUM_INNEN.x, x1: RAUM_INNEN.x + RAUM_INNEN.breite, aufstrom: 'links', schichten: SCHICHTEN.raum }],
      peclet: PECLET.heizkoerper,
      durchmischung: DURCHMISCHUNG.heizkoerper,
      anpassung: ANPASSUNG,
    },
    ursprung: { x: RHK.x + RHK.breite / 2, y: RHK.y },
    fenster: [0, 22],
    heizflaeche: { x: RHK.x, y: RHK.y, breite: RHK.breite, hoehe: RHK.hoehe },
  },
  {
    id: 'raum-fussboden',
    innen: RAUM_INNEN,
    skala: { art: 'vergleich', bezug: 'raum-heizkoerper' },
    wachstum: 'senkrecht',
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
