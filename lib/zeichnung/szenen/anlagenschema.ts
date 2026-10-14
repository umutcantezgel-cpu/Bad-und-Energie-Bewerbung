/**
 * Anlagenschema einer Luft/Wasser-Wärmepumpe in Monoblock-Bauweise (KERN K-010, E-029) als Fließschema mit
 * Normsymbolen: Außeneinheit (Kältekreis vereinfacht, Plattenwärmeübertrager) → Erdleitung und Wanddurchführung →
 * Inneneinheit (Sicherheitsventil, Absperrung, Vorlauffühler, Umwälzpumpe, Rückschlagventil, 3-Wege-Ventil, Speicher,
 * Ausdehnungsgefäß) → Heizkörper und Fußbodenheizung. Sicherheitsventil und Ausdehnungsgefäß sitzen zwischen
 * Wärmeerzeuger und Absperrung (DIN EN 12828: vom Wärmeerzeuger nicht absperrbar).
 *
 * Fließrichtung (K-003.2): Der Vorlauf beginnt am Plattenwärmeübertrager der Außeneinheit (Wärmeerzeuger) und endet an
 * den Verbrauchern; der Rücklauf beginnt an den Verbrauchern und endet am Plattenwärmeübertrager. Die Inneneinheit ist
 * eine typische Anordnung, kein bestimmtes Modell (M-022); die Systemgrenze steht als Strich-Punkt-Linie.
 * Gezeichnet in components/zeichnung/technik/Anlagenschema.tsx, geprüft in lib/zeichnung/__tests__/schemata.test.ts.
 */
import { an, leitung, pfeil, symbol, type SchemaLeitung, type SchemaPfeil, type SchemaSymbol } from './schema';

export const ANLAGENSCHEMA_RAHMEN = Object.freeze({ breite: 1200, hoehe: 620 });

const S = 2;

/** Bereiche: Außeneinheit (Gehäuse), Inneneinheit (Systemgrenze), Wand und Erdreich. */
export const ANLAGENSCHEMA_BEREICHE = Object.freeze({
  aussen: { x: 20, y: 170, breite: 300, hoehe: 280 },
  innen: { x: 476, y: 74, breite: 414, hoehe: 486 },
  wand: { x: 420, y: 40, breite: 32, hoehe: 580 },
  gok: 470,
  durchfuehrung: { x: 414, y: 494, breite: 44, hoehe: 52 },
});

export const ANLAGENSCHEMA_SYMBOLE: readonly SchemaSymbol[] = [
  // Außeneinheit: Ventilator, Verdampfer, Verdichter, Expansionsventil, Plattenwärmeübertrager
  symbol('ventilator', 'ventilator', { x: 58, y: 300, massstab: S }),
  symbol('verdampfer', 'verdampfer', { x: 116, y: 300, massstab: S }),
  symbol('verdichter', 'verdichter', { x: 184, y: 214, massstab: S }),
  symbol('expansionsventil', 'expansionsventil', { x: 184, y: 400, drehung: 180, massstab: S }),
  symbol('pwt', 'plattenwaermetauscher', { x: 260, y: 300, massstab: S }),
  // Inneneinheit, Vorlauf: das Sicherheitsventil vor der ersten Absperrung (DIN EN 12828: vom Wärmeerzeuger nicht
  // absperrbar), dahinter Absperrung, Vorlauffühler, Pumpe, Rückschlagventil und Umschaltventil
  symbol('sicherheitsventil', 'sicherheitsventil', { x: 548, y: 126, massstab: S }, { wert: 'SV', x: 522, y: 104, anker: 'end' }),
  symbol('absperrung-vl', 'absperrventil', { x: 600, y: 150, massstab: S }),
  symbol('fuehler', 'fuehler', { x: 662, y: 150, massstab: S }),
  symbol('pumpe', 'pumpe', { x: 724, y: 150, massstab: S }, { wert: 'Pumpe', x: 724, y: 204, anker: 'middle' }),
  symbol('rueckschlag', 'rueckschlagventil', { x: 786, y: 150, massstab: S }),
  symbol('umschaltventil', 'dreiwegeventil', { x: 850, y: 150, massstab: S }),
  symbol('speicher', 'speicher', { x: 850, y: 342, massstab: S }, { wert: 'Speicher', x: 850, y: 420, anker: 'middle' }),
  // Inneneinheit, Rücklauf (Fließrichtung nach links): erst die Absperrung, dann das Ausdehnungsgefäß, damit es zum
  // Wärmeerzeuger hin nicht absperrbar ist (DIN EN 12828)
  symbol('absperrung-rl', 'absperrventil', { x: 690, y: 450, massstab: S }),
  symbol('ausdehnung', 'ausdehnungsgefaess', { x: 580, y: 410, massstab: S }, { wert: 'MAG', x: 604, y: 404, anker: 'start' }),
  // Verbraucher
  symbol('heizkoerper', 'heizkoerper', { x: 1080, y: 162, massstab: S }, { wert: 'Heizkörper', x: 1080, y: 220, anker: 'middle' }),
  symbol('fussboden', 'fussbodenheizung', { x: 1090, y: 320, massstab: S }, { wert: 'Fußbodenheizung', x: 1188, y: 372, anker: 'end' }),
];

const p = (key: string, anschluss: string) => an(ANLAGENSCHEMA_SYMBOLE, key, anschluss);

/** Heizwasser in Fließrichtung. Vorlauf außen um den Rücklauf herum, damit sich keine Leitungen kreuzen. */
export const ANLAGENSCHEMA_LEITUNGEN: readonly SchemaLeitung[] = [
  leitung('vorlauf-erzeuger', 'vorlauf', [
    p('pwt', 'rechtsAus'),
    { x: 366, y: p('pwt', 'rechtsAus').y },
    { x: 366, y: 512 },
    { x: 500, y: 512 },
    { x: 500, y: 150 },
    p('umschaltventil', 'ein'),
  ]),
  leitung('vorlauf-heizkoerper', 'vorlauf', [p('umschaltventil', 'a'), p('heizkoerper', 'ein')]),
  leitung('vorlauf-fussboden', 'vorlauf', [{ x: 930, y: 150 }, { x: 930, y: p('fussboden', 'ein').y }, p('fussboden', 'ein')]),
  leitung('vorlauf-speicher', 'vorlauf', [
    p('umschaltventil', 'b'),
    { x: 850, y: 232 },
    { x: 790, y: 232 },
    { x: 790, y: p('speicher', 'wendelEin').y },
    p('speicher', 'wendelEin'),
  ]),
  leitung('ruecklauf-heizkreis', 'ruecklauf', [
    p('heizkoerper', 'aus'),
    { x: 1160, y: p('heizkoerper', 'aus').y },
    { x: 1160, y: 450 },
    { x: 530, y: 450 },
    { x: 530, y: 532 },
    { x: 346, y: 532 },
    { x: 346, y: p('pwt', 'rechtsEin').y },
    p('pwt', 'rechtsEin'),
  ]),
  leitung('ruecklauf-fussboden', 'ruecklauf', [p('fussboden', 'aus'), { x: 1160, y: p('fussboden', 'aus').y }]),
  leitung('ruecklauf-speicher', 'ruecklauf', [p('speicher', 'wendelAus'), { x: 776, y: p('speicher', 'wendelAus').y }, { x: 776, y: 450 }]),
];

/** Kältemittel im Außengerät (vereinfacht; der Kältekreis im Einzelnen: kaeltekreis.ts). */
export const ANLAGENSCHEMA_KAELTE: readonly SchemaLeitung[] = [
  leitung('sauggas', 'kaeltemittel', [p('verdampfer', 'aus'), { x: 116, y: 214 }, p('verdichter', 'ein')]),
  leitung('heissgas', 'kaeltemittel', [p('verdichter', 'aus'), { x: 226, y: 214 }, { x: 226, y: p('pwt', 'linksEin').y }, p('pwt', 'linksEin')]),
  leitung('fluessig', 'kaeltemittel', [p('pwt', 'linksAus'), { x: 226, y: p('pwt', 'linksAus').y }, { x: 226, y: 400 }, p('expansionsventil', 'ein')]),
  leitung('nassdampf', 'kaeltemittel', [p('expansionsventil', 'aus'), { x: 116, y: 400 }, p('verdampfer', 'ein')]),
];

export const ANLAGENSCHEMA_PFEILE: readonly SchemaPfeil[] = [
  pfeil('vorlauf', { x: 398, y: 512 }, { x: 1, y: 0 }),
  pfeil('ruecklauf', { x: 380, y: 532 }, { x: -1, y: 0 }),
  pfeil('vorlauf', { x: 990, y: 150 }, { x: 1, y: 0 }),
  pfeil('vorlauf', { x: 990, y: p('fussboden', 'ein').y }, { x: 1, y: 0 }),
  pfeil('ruecklauf', { x: 1160, y: 300 }, { x: 0, y: 1 }),
  pfeil('ruecklauf', { x: 750, y: 450 }, { x: -1, y: 0 }),
  pfeil('kaeltemittel', { x: 150, y: 214 }, { x: 1, y: 0 }),
  pfeil('kaeltemittel', { x: 150, y: 400 }, { x: -1, y: 0 }),
];

/** Beschriftung der Bereiche (Versalien, immer sichtbar). */
export const ANLAGENSCHEMA_TEXTE = Object.freeze([
  { wert: 'Außeneinheit', x: 20, y: 156, anker: 'start' as const },
  { wert: 'Inneneinheit', x: 476, y: 56, anker: 'start' as const },
  { wert: 'Erdreich', x: 30, y: 600, anker: 'start' as const },
  { wert: 'Heizkreis', x: 1180, y: 104, anker: 'end' as const },
]);
