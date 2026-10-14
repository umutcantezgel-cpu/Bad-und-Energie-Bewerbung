/**
 * Kältekreis einer Monoblock-Wärmepumpe (KERN K-010, E-029) als Fließschema: Der Kreis bleibt ganz in der
 * Außeneinheit, ins Haus gehen nur Heizwasser-Leitungen. Reihenfolge in Fließrichtung des Kältemittels:
 * Verdampfer → Verdichter → Plattenwärmeübertrager (Verflüssiger) → Expansionsventil → Verdampfer.
 *
 * - Verdampfer: Das Kältemittel nimmt Wärme aus der Außenluft auf und verdampft (Niederdruck).
 * - Verdichter: Er verdichtet das Sauggas; Druck und Temperatur steigen (Heißgas, Hochdruck).
 * - Plattenwärmeübertrager: Das Heißgas gibt seine Wärme an das Heizwasser ab und verflüssigt sich.
 * - Expansionsventil: Der Druck des flüssigen Kältemittels sinkt; es wird kalt (Nassdampf) und fließt zum Verdampfer.
 * Vereinfacht: ohne 4-Wege-Ventil zum Abtauen und Kühlen, ohne Sammler und Filter (Anleitung Bild 2 und 3).
 * Gezeichnet in components/zeichnung/technik/Kaeltekreis.tsx, geprüft in lib/zeichnung/__tests__/schemata.test.ts.
 */
import { an, leitung, pfeil, symbol, type SchemaLeitung, type SchemaPfeil, type SchemaSymbol } from './schema';

/** Rechts läuft das Heizwasser aus dem Gehäuse; die Etiketten Vorlauf und Rücklauf stehen innerhalb des Rahmens. */
export const KAELTEKREIS_RAHMEN = Object.freeze({ breite: 860, hoehe: 520 });

/** Gehäuse der Außeneinheit (Grenze des Kältekreises). */
export const KAELTEKREIS_GERAET = Object.freeze({ x: 70, y: 40, breite: 610, hoehe: 440 });

const S = 3;

export const KAELTEKREIS_SYMBOLE: readonly SchemaSymbol[] = [
  symbol('verdampfer', 'verdampfer', { x: 160, y: 270, massstab: S }, { wert: 'Verdampfer', x: 206, y: 300, anker: 'start' }),
  symbol('verdichter', 'verdichter', { x: 380, y: 120, massstab: S }, { wert: 'Verdichter', x: 330, y: 190, anker: 'end' }),
  symbol('verfluessiger', 'plattenwaermetauscher', { x: 600, y: 270, massstab: S }, { wert: 'Verflüssiger', x: 600, y: 352, anker: 'middle' }),
  symbol('expansionsventil', 'expansionsventil', { x: 380, y: 420, drehung: 180, massstab: S }, { wert: 'Expansionsventil', x: 336, y: 372, anker: 'end' }),
];

const p = (key: string, anschluss: string) => an(KAELTEKREIS_SYMBOLE, key, anschluss);

/** Die vier Wege des Kältemittels, jeder vom Austritt eines Bauteils zum Eintritt des nächsten. */
export const KAELTEKREIS_WEGE: readonly SchemaLeitung[] = [
  leitung(
    'sauggas',
    'kaeltemittel',
    [p('verdampfer', 'aus'), { x: 160, y: 120 }, p('verdichter', 'ein')],
    { wert: 'Sauggas', x: 250, y: 102, anker: 'middle' },
  ),
  leitung(
    'heissgas',
    'kaeltemittel',
    [p('verdichter', 'aus'), { x: 520, y: 120 }, { x: 520, y: p('verfluessiger', 'linksEin').y }, p('verfluessiger', 'linksEin')],
    // Neben der Fallleitung zum Verflüssiger (oben stehen Verdichter und Druckgrenze)
    { wert: 'Heißgas', x: 534, y: 176, anker: 'start' },
  ),
  leitung(
    'fluessig',
    'kaeltemittel',
    [p('verfluessiger', 'linksAus'), { x: 520, y: p('verfluessiger', 'linksAus').y }, { x: 520, y: 420 }, p('expansionsventil', 'ein')],
    { wert: 'flüssig', x: 534, y: 370, anker: 'start' },
  ),
  leitung(
    'nassdampf',
    'kaeltemittel',
    [p('expansionsventil', 'aus'), { x: 160, y: 420 }, p('verdampfer', 'ein')],
    { wert: 'Nassdampf', x: 250, y: 448, anker: 'middle' },
  ),
];

/** Heizwasser: Vorlauf aus dem Plattenwärmeübertrager nach rechts aus dem Gerät, Rücklauf zurück. */
export const KAELTEKREIS_WASSER: readonly SchemaLeitung[] = [
  leitung('vorlauf', 'vorlauf', [p('verfluessiger', 'rechtsAus'), { x: KAELTEKREIS_RAHMEN.breite, y: p('verfluessiger', 'rechtsAus').y }], {
    wert: 'Vorlauf',
    x: KAELTEKREIS_RAHMEN.breite - 6,
    y: p('verfluessiger', 'rechtsAus').y - 22,
    anker: 'end',
  }),
  leitung('ruecklauf', 'ruecklauf', [{ x: KAELTEKREIS_RAHMEN.breite, y: p('verfluessiger', 'rechtsEin').y }, p('verfluessiger', 'rechtsEin')], {
    wert: 'Rücklauf',
    x: KAELTEKREIS_RAHMEN.breite - 6,
    y: p('verfluessiger', 'rechtsEin').y + 34,
    anker: 'end',
  }),
];

/** Grenze zwischen Hochdruck (rechts: Heißgas, flüssig) und Niederdruck (links: Nassdampf, Sauggas). */
export const KAELTEKREIS_DRUCKGRENZE = Object.freeze({ x: 380, y0: 60, y1: 466 });

export const KAELTEKREIS_PFEILE: readonly SchemaPfeil[] = [
  pfeil('kaeltemittel', { x: 270, y: 120 }, { x: 1, y: 0 }),
  pfeil('kaeltemittel', { x: 520, y: 200 }, { x: 0, y: 1 }),
  pfeil('kaeltemittel', { x: 520, y: 370 }, { x: 0, y: 1 }),
  pfeil('kaeltemittel', { x: 250, y: 420 }, { x: -1, y: 0 }),
  pfeil('vorlauf', { x: 790, y: p('verfluessiger', 'rechtsAus').y }, { x: 1, y: 0 }),
  pfeil('ruecklauf', { x: 712, y: p('verfluessiger', 'rechtsEin').y }, { x: -1, y: 0 }),
];

/** Außenluft tritt links in den Verdampfer (Etikett mit Pfeil außerhalb des Gehäuses). */
export const KAELTEKREIS_LUFT = Object.freeze({ wert: 'Luft', x: 40, y: 240, pfeil: { von: { x: 18, y: 270 }, bis: { x: 108, y: 270 } } });
