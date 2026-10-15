/**
 * Raumschnitt (E-031, KERN K-010): ein Raum im Schnitt für den Vergleich „So verteilt sich die Wärme im Raum“ auf der
 * Wärmepumpen-Seite, einmal mit Flachheizkörper, einmal mit Fußbodenheizung. Derselbe Raum wie im Hausschnitt
 * (lichte Breite 4,2 m, lichte Höhe 2,5 m), 1 Einheit = 10 mm, Koordinaten ab der linken oberen Ecke des Rauminneren.
 * Gezeichnet in components/zeichnung/technik/Raumschnitt.tsx; das Wärmefeld im Inneren rechnet
 * scripts/zeichnung/waermefeld.ts (Aufgabe in lib/zeichnung/waerme/eingabe.ts).
 *
 * Links steht die Außenwand, rechts eine Innenwand zum beheizten Nachbarraum. Maße ohne Beleg tragen `geschaetzt`.
 */
import { schaetzung, type Mass } from '../geraete/typen';
import { HEIZKOERPER_MM } from './hausschnitt';

/** mm → Einheiten. */
const e = (mm: number) => mm / 10;

/** Rauminneres: lichte Breite 4,2 m und lichte Höhe 2,5 m wie im Hausschnitt. */
export const RAUM_INNEN = Object.freeze({ x: 0, y: 0, breite: 420, hoehe: 250 });

export const RAUM_MASSE: Readonly<Record<'wand' | 'decke' | 'estrich' | 'daemmung' | 'rohdecke' | 'wandabstand' | 'bautiefe', Mass>> = Object.freeze({
  wand: schaetzung(300, 'Wanddicke gewählt (Außen- und Innenwand gleich gezeichnet)'),
  decke: schaetzung(200, 'Geschossdecke wie im Hausschnitt (200 mm)'),
  estrich: schaetzung(65, 'Heizestrich nach DIN 18560-2: mindestens 45 mm über dem Rohr, mit Rohr Ø 16 mm rund 65 mm'),
  daemmung: schaetzung(50, 'Dämmschicht unter dem Estrich (Wärme- und Trittschall), gewählt'),
  rohdecke: schaetzung(200, 'Rohdecke bzw. Bodenplatte, angeschnitten'),
  wandabstand: schaetzung(50, 'Abstand des Heizkörpers zur Wand (Halterung), gewählt'),
  bautiefe: schaetzung(100, 'Bautiefe eines zweireihigen Flachheizkörpers (Typ 22), rund 100 mm'),
});

/** Fußbodenheizung: Rohr Ø 16 mm, Verlegeabstand 150 mm, Vorlauf und Rücklauf im Wechsel (Schnecke). */
export const FUSSBODEN_ROHR = Object.freeze({
  durchmesser: schaetzung(16, 'Heizrohr 16 × 2 mm, übliche Größe für Fußbodenheizungen'),
  abstand: schaetzung(150, 'Verlegeabstand 150 mm, üblicher Wert'),
  ueberdeckung: schaetzung(45, 'Estrich über dem Rohr nach DIN 18560-2 mindestens 45 mm'),
});

/** Flachheizkörper an der Außenwand (von der Seite geschnitten): 600 mm hoch, 150 mm über dem Boden. */
export const RAUM_HEIZKOERPER = Object.freeze({
  x: e(RAUM_MASSE.wandabstand.mm),
  y: RAUM_INNEN.hoehe - e(HEIZKOERPER_MM.bodenabstand) - e(HEIZKOERPER_MM.bauhoehe),
  breite: e(RAUM_MASSE.bautiefe.mm),
  hoehe: e(HEIZKOERPER_MM.bauhoehe),
});

const WAND = e(RAUM_MASSE.wand.mm);
const DECKE = e(RAUM_MASSE.decke.mm);
const ESTRICH = e(RAUM_MASSE.estrich.mm);
const DAEMMUNG = e(RAUM_MASSE.daemmung.mm);
/** Von der Rohdecke zeigt der Schnitt nur einen Streifen (angeschnitten). */
const ROHDECKE_SICHTBAR = 12;

/** Rahmen der Zeichnung: Rauminneres mit Wänden, Decke und Fußbodenaufbau. */
export const RAUMSCHNITT_RAHMEN = Object.freeze({
  x: -WAND,
  y: -DECKE,
  breite: RAUM_INNEN.breite + 2 * WAND,
  hoehe: DECKE + RAUM_INNEN.hoehe + ESTRICH + DAEMMUNG + ROHDECKE_SICHTBAR,
});

const rechteck = (x0: number, y0: number, x1: number, y1: number) => `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
const unten = RAUMSCHNITT_RAHMEN.y + RAUMSCHNITT_RAHMEN.hoehe;
const boden = RAUM_INNEN.hoehe;

/** Schnittflächen und Fußbodenaufbau (Einheiten). */
export const RAUM_BAUTEILE = Object.freeze({
  waende: [rechteck(-WAND, -DECKE, 0, unten), rechteck(RAUM_INNEN.breite, -DECKE, RAUM_INNEN.breite + WAND, unten)],
  decke: rechteck(0, -DECKE, RAUM_INNEN.breite, 0),
  estrich: rechteck(0, boden, RAUM_INNEN.breite, boden + ESTRICH),
  daemmung: rechteck(0, boden + ESTRICH, RAUM_INNEN.breite, boden + ESTRICH + DAEMMUNG),
  rohdecke: rechteck(0, boden + ESTRICH + DAEMMUNG, RAUM_INNEN.breite, unten),
});

/** Rohre der Fußbodenheizung im Estrich: Mitten im Verlegeabstand, abwechselnd Vorlauf und Rücklauf. */
export const FUSSBODEN_ROHRE: readonly { x: number; y: number; r: number; medium: 'vorlauf' | 'ruecklauf' }[] = Object.freeze(
  (() => {
    const r = e(FUSSBODEN_ROHR.durchmesser.mm) / 2;
    const y = boden + e(FUSSBODEN_ROHR.ueberdeckung.mm) + r;
    const abstand = e(FUSSBODEN_ROHR.abstand.mm);
    const out: { x: number; y: number; r: number; medium: 'vorlauf' | 'ruecklauf' }[] = [];
    for (let k = 0, x = abstand / 2; x < RAUM_INNEN.breite; k += 1, x += abstand) out.push({ x, y, r, medium: k % 2 === 0 ? 'vorlauf' : 'ruecklauf' });
    return out;
  })(),
);
