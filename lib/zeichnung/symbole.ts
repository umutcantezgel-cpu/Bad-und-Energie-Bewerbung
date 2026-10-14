/**
 * Normsymbole der Fließschemata (KERN K-010, E-029), Grundlage DIN EN ISO 10628-2 (Fließschemata für
 * verfahrenstechnische Anlagen, graphische Symbole), in der in der Heizungstechnik üblichen Lesart. Fließschemata
 * (Anlagenschema, Kältekreis) bestehen nur aus diesen Symbolen und Leitungen.
 *
 * Jedes Symbol liegt in einem eigenen Koordinatensystem um (0 | 0), Fließrichtung von links nach rechts; Größe in
 * Einheiten des Schemas (ein Symbol ist rund 24 Einheiten groß). `anschluesse` nennt die Stellen, an denen Leitungen
 * ansetzen; `anschlussPunkt` rechnet sie nach Verschiebung und Drehung in das Schema um. Gezeichnet wird in der
 * Kontur (2 px), gefüllte Formen (Rückschlagventil, Spitze des Expansionsventils) in der Markenrolle.
 * Rendern: components/zeichnung/technik/Symbol.tsx. Prüfung: lib/zeichnung/__tests__/zeichnung-daten.test.ts.
 */
import { drehen, r1, type Punkt } from './norm';

export type SymbolForm =
  | { d: string; voll?: boolean; fein?: boolean }
  | { cx: number; cy: number; r: number; fein?: boolean }
  | { x: number; y: number; width: number; height: number; rx?: number; fein?: boolean };

export interface SymbolDef {
  name: string;
  /** Kurze Lesart für Legende und Beschriftung. */
  beschreibung: string;
  /** Ausdehnung um den Ursprung (halbe Breite und Höhe), für Abstände und Prüfungen. */
  halb: { x: number; y: number };
  anschluesse: Readonly<Record<string, Punkt>>;
  formen: readonly SymbolForm[];
}

/**
 * Kennbuchstaben im Symbol (M am Stellantrieb, T am Fühler) als gezeichnete Striche um die Mitte (x | y), 6 Einheiten
 * breit und 8 hoch: Sie gehören zum Bildzeichen wie Kreis und Dreieck und wachsen und schrumpfen mit ihm. Als Schrift
 * hätten sie die Mindestgröße der Website nie erreicht (im Kreis mit r 7 am Handy rund 2 px, Prüfung E-029, Befund 7);
 * den Namen jedes Symbols trägt die Legende darunter in HTML.
 */
export function kennbuchstabe(buchstabe: 'M' | 'T', x: number, y: number): string {
  const [l, r, o, u] = [r1(x - 3), r1(x + 3), r1(y - 4), r1(y + 4)];
  return buchstabe === 'M' ? `M${l} ${u}V${o}L${r1(x)} ${r1(y + 1)}L${r} ${o}V${u}` : `M${l} ${o}H${r}M${r1(x)} ${o}V${u}`;
}

/** Ventilkörper: zwei Dreiecke Spitze an Spitze (Durchgangsventil). */
const VENTIL_LINKS = 'M-12 -7L0 0L-12 7Z';
const VENTIL_RECHTS = 'M12 -7L0 0L12 7Z';

export const SYMBOLE = {
  pumpe: {
    name: 'Umwälzpumpe',
    beschreibung: 'Kreis mit einbeschriebenem Dreieck, die Spitze zeigt in Förderrichtung',
    halb: { x: 12, y: 12 },
    anschluesse: { ein: { x: -12, y: 0 }, aus: { x: 12, y: 0 } },
    formen: [{ cx: 0, cy: 0, r: 12 }, { d: 'M12 0L-6 -10.4L-6 10.4Z' }],
  },
  absperrventil: {
    name: 'Absperrventil',
    beschreibung: 'Zwei Dreiecke Spitze an Spitze',
    halb: { x: 12, y: 7 },
    anschluesse: { ein: { x: -12, y: 0 }, aus: { x: 12, y: 0 } },
    formen: [{ d: VENTIL_LINKS }, { d: VENTIL_RECHTS }],
  },
  rueckschlagventil: {
    name: 'Rückschlagventil',
    beschreibung: 'Ventilkörper, das Dreieck auf der Austrittsseite gefüllt: Durchfluss nur in Pfeilrichtung',
    halb: { x: 12, y: 7 },
    anschluesse: { ein: { x: -12, y: 0 }, aus: { x: 12, y: 0 } },
    formen: [{ d: VENTIL_LINKS }, { d: VENTIL_RECHTS, voll: true }],
  },
  sicherheitsventil: {
    name: 'Sicherheitsventil',
    beschreibung: 'Eckventil mit Feder: Eintritt von unten, Abblasen zur Seite',
    halb: { x: 12, y: 18 },
    anschluesse: { ein: { x: 0, y: 12 }, aus: { x: 12, y: 0 } },
    formen: [{ d: 'M-7 12L0 0L7 12Z' }, { d: VENTIL_RECHTS }, { d: 'M0 0V-4L-5 -6L5 -9L-5 -12L5 -15L0 -16V-18' }],
  },
  ausdehnungsgefaess: {
    name: 'Membran-Ausdehnungsgefäß',
    beschreibung: 'Gefäß mit Membran quer in der Mitte',
    halb: { x: 9, y: 20 },
    anschluesse: { ein: { x: 0, y: 20 } },
    formen: [{ x: -9, y: -14, width: 18, height: 28, rx: 9 }, { d: 'M-9 0H9' }, { d: 'M0 14V20' }],
  },
  plattenwaermetauscher: {
    name: 'Plattenwärmeübertrager',
    beschreibung: 'Rechteck mit Zickzack der Platten; links eine Seite, rechts die andere, im Gegenstrom',
    halb: { x: 10, y: 16 },
    anschluesse: {
      // Kältemittel bzw. Primärseite links: oben ein, unten aus; Wasser rechts: unten ein, oben aus (Gegenstrom)
      linksEin: { x: -10, y: -11 },
      linksAus: { x: -10, y: 11 },
      rechtsEin: { x: 10, y: 11 },
      rechtsAus: { x: 10, y: -11 },
    },
    formen: [{ x: -10, y: -16, width: 20, height: 32 }, { d: 'M-10 -8L10 -4L-10 0L10 4L-10 8', fein: true }],
  },
  speicher: {
    name: 'Speicher',
    beschreibung: 'Stehender Behälter mit Heizwendel unten',
    halb: { x: 16, y: 30 },
    anschluesse: { wendelEin: { x: -16, y: 2 }, wendelAus: { x: -16, y: 22 } },
    formen: [{ x: -16, y: -30, width: 32, height: 60, rx: 12 }, { d: 'M-16 2H8L-8 7L8 12L-8 17L8 22H-16', fein: true }],
  },
  dreiwegeventil: {
    name: '3-Wege-Ventil (Umschalten, Mischen)',
    beschreibung: 'Drei Ventildreiecke um einen Punkt, darüber der Stellantrieb (M); als Mischer kommt die Beimischung von unten (b)',
    halb: { x: 12, y: 22 },
    anschluesse: { ein: { x: -12, y: 0 }, a: { x: 12, y: 0 }, b: { x: 0, y: 12 } },
    formen: [
      { d: VENTIL_LINKS },
      { d: VENTIL_RECHTS },
      { d: 'M-7 12L0 0L7 12Z' },
      { d: 'M0 0V-10' },
      { x: -7, y: -22, width: 14, height: 12 },
      { d: kennbuchstabe('M', 0, -16), fein: true },
    ],
  },
  verdichter: {
    name: 'Verdichter',
    beschreibung: 'Kreis mit zwei Linien, die sich in Förderrichtung verengen',
    halb: { x: 14, y: 14 },
    anschluesse: { ein: { x: -14, y: 0 }, aus: { x: 14, y: 0 } },
    formen: [{ cx: 0, cy: 0, r: 14 }, { d: 'M-9.9 -9.9L12.1 -7M-9.9 9.9L12.1 7' }],
  },
  expansionsventil: {
    name: 'Expansionsventil',
    beschreibung: 'Ventilkörper mit Stellpfeil (elektronisch geregelt)',
    halb: { x: 12, y: 12 },
    anschluesse: { ein: { x: -12, y: 0 }, aus: { x: 12, y: 0 } },
    formen: [{ d: VENTIL_LINKS }, { d: VENTIL_RECHTS }, { d: 'M-8 10L7 -5' }, { d: 'M10 -8L5 -6.8L8.8 -3Z', voll: true }],
  },
  heizkoerper: {
    name: 'Heizkörper',
    beschreibung: 'Rechteck mit senkrechten Lamellen; Vorlauf oben links, Rücklauf unten rechts (wechselseitig)',
    halb: { x: 18, y: 11 },
    anschluesse: { ein: { x: -18, y: -6 }, aus: { x: 18, y: 6 } },
    formen: [{ x: -18, y: -11, width: 36, height: 22 }, { d: 'M-9 -11V11M0 -11V11M9 -11V11', fein: true }],
  },
  fussbodenheizung: {
    name: 'Fußbodenheizung',
    beschreibung: 'Rohrschlange im Rechteck des Heizkreises, Vorlauf links oben, Rücklauf rechts unten',
    halb: { x: 22, y: 9 },
    anschluesse: { ein: { x: -22, y: -5 }, aus: { x: 22, y: 5 } },
    formen: [{ x: -22, y: -9, width: 44, height: 18, fein: true }, { d: 'M-22 -5H17V-1.7H-17V1.7H17V5H22' }],
  },
  fuehler: {
    name: 'Temperaturfühler',
    beschreibung: 'Messkreis mit T auf einer Stichleitung',
    halb: { x: 7, y: 20 },
    anschluesse: { an: { x: 0, y: 0 } },
    formen: [{ d: 'M0 0V-7' }, { cx: 0, cy: -14, r: 7 }, { d: kennbuchstabe('T', 0, -14), fein: true }],
  },
  verdampfer: {
    name: 'Verdampfer (Lamellen-Wärmeübertrager, Luft)',
    beschreibung: 'Rechteck mit Lamellen, das Kältemittel läuft im Zickzack hindurch',
    halb: { x: 12, y: 26 },
    anschluesse: { ein: { x: 0, y: 26 }, aus: { x: 0, y: -26 } },
    formen: [
      { x: -12, y: -26, width: 24, height: 52 },
      { d: 'M-12 -18H12M-12 -9H12M-12 0H12M-12 9H12M-12 18H12', fein: true },
      { d: 'M0 26V20L-7 16L7 10L-7 4L7 -2L-7 -8L7 -14L0 -18V-26' },
    ],
  },
  ventilator: {
    name: 'Ventilator',
    beschreibung: 'Kreis mit zwei Flügeln, Achse in der Mitte',
    halb: { x: 12, y: 12 },
    anschluesse: {},
    formen: [{ cx: 0, cy: 0, r: 12 }, { d: 'M0 0C-2 -5 -2 -8 0 -10C2 -8 2 -5 0 0ZM0 0C2 5 2 8 0 10C-2 8 -2 5 0 0Z' }],
  },
} as const satisfies Record<string, SymbolDef>;

export type SymbolId = keyof typeof SYMBOLE;

/** Die Symbole aus KERN K-010 (Pflichtumfang); Verdampfer und Ventilator kommen für den Kältekreis dazu. */
export const PFLICHT_SYMBOLE: readonly SymbolId[] = [
  'pumpe',
  'absperrventil',
  'rueckschlagventil',
  'sicherheitsventil',
  'ausdehnungsgefaess',
  'plattenwaermetauscher',
  'speicher',
  'dreiwegeventil',
  'verdichter',
  'expansionsventil',
  'heizkoerper',
  'fussbodenheizung',
  'fuehler',
];

export interface Lage {
  x: number;
  y: number;
  /** Drehung in Grad (im Uhrzeigersinn, Vielfache von 90). */
  drehung?: number;
  /** Vergrößerung des Symbols (Standard 1); die Strichstärke bleibt die Linienart. */
  massstab?: number;
}

/** Anschlusspunkt eines Symbols im Schema, nach Vergrößerung, Drehung und Verschiebung. */
export function anschlussPunkt(id: SymbolId, anschluss: string, lage: Lage): Punkt {
  const def: SymbolDef = SYMBOLE[id];
  const lokal = def.anschluesse[anschluss];
  if (!lokal) throw new Error(`symbole: ${id} hat keinen Anschluss ${anschluss}`);
  const m = lage.massstab ?? 1;
  const gedreht = drehen({ x: lokal.x * m, y: lokal.y * m }, lage.drehung ?? 0);
  return { x: r1(lage.x + gedreht.x), y: r1(lage.y + gedreht.y) };
}
