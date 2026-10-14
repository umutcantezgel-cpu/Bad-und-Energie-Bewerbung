/**
 * Hausschnitt (KERN K-001, K-010, E-029): die Anlage im Schnitt durch das Haus, 1 Einheit = 10 mm. Dieselbe Geometrie
 * zeichnen der Einstieg der Startseite (components/home/einstieg/Szene.tsx), der kleine Hausschnitt
 * (components/zeichnung/technik/HausschnittKlein.tsx) und die Teilen-Bilder (lib/seo/og-render.tsx).
 *
 * Inhalt: Geländeschnitt mit Erdreich (45°-Schraffur), links vor dem Haus die Außeneinheit maßstäblich (110 × 80
 * Einheiten = 1.100 × 800 mm, compress-aw-s.ts) auf zwei Sockeln, die Erdleitung im Rohrgraben, durch die
 * Wanddurchführung im Fundament ins Haus, die Inneneinheit als Symbol (Modell offen, M-022) und ein Flachheizkörper
 * 600 × 1.000 mm. Im Giebel steht das Maß „35 km“ in Schrift (Leitmotiv E-027, ohne Zirkel seit E-029).
 *
 * Fließrichtung (K-003.2): Jeder Leitungsweg ist in Fließrichtung angelegt. Der Vorlauf beginnt an der Außeneinheit
 * (Wärmeerzeuger) und läuft zur Inneneinheit, von dort zum Heizkörper; ein Abzweig läuft zur Bewerbung (Startseite:
 * links aus dem Bild in den roten Knopf). Der Rücklauf kommt vom Verbraucher zurück zur Außeneinheit.
 * Maße ohne Beleg tragen `geschaetzt` (Sockel, Raumhöhe, Lage der Inneneinheit); Prüfung:
 * lib/zeichnung/__tests__/hausschnitt.test.ts.
 */
import { COMPRESS_AW_S } from '../geraete/compress-aw-s';
import { fliesspfeil, leitungsweg, MASSSTAB, r1, type Medium, type Punkt } from '../norm';

/** mm → Einheiten des Hausschnitts. */
const e = (mm: number) => r1(mm / MASSSTAB.haus);

export const HAUSSCHNITT_RAHMEN = Object.freeze({ breite: 800, hoehe: 680 });

/** Geländeoberkante (GOK). */
const GOK = 570;
/** Radius der Leitungsbögen und Abstand eines Leitungspaars (12 Einheiten = 12 cm, wie --paar). */
const BOGEN = 10;

const G = COMPRESS_AW_S;

/** Außeneinheit: Lage links vor dem Haus; Größe aus dem Geräte-Modul (110 × 80). */
const SOCKEL_HOEHE = 10; // geschaetzt: Betonsockel 100 mm über Gelände (Herstelleranleitung Bild 17: fester Untergrund)
const GERAET = {
  x: 100,
  breite: e(G.breite.mm),
  hoehe: e(G.hoehe.mm),
  konsole: e(G.konsolen.hoehe.mm),
};
const GERAET_UNTEN = GOK - SOCKEL_HOEHE - GERAET.konsole;
const GERAET_OBEN = GERAET_UNTEN - GERAET.hoehe;

/** Haus: Außenwände, Bodenplatte, Decke, Dach 45°. Alle Werte geschätzt (ein typischer eingeschossiger Schnitt). */
const HAUS = {
  links: 300,
  rechts: 780,
  wand: 30,
  /** Fertigfußboden 150 mm über Gelände, Bodenplatte 250 mm. */
  fussboden: GOK - 15,
  platteUnten: GOK + 10,
  /** Fundament (Frostschürze) bis 0,9 m unter Gelände. */
  fundamentUnten: GOK + 90,
  /** Lichte Raumhöhe 2,50 m, Decke 200 mm. */
  deckeUnten: GOK - 15 - 250,
  traufe: GOK - 15 - 250 - 20,
  /** Dachstärke 250 mm senkrecht zur Dachfläche, Überstand 400 mm. */
  dach: 25,
  ueberstand: 40,
} as const;
const FIRST = { x: (HAUS.links + HAUS.rechts) / 2, y: HAUS.traufe - (HAUS.rechts - HAUS.links) / 2 };

/** Inneneinheit als Symbol (Systemgrenze, keine Maße: M-022). */
const IE = { x: 345, y: 445, breite: 56, hoehe: HAUS.fussboden - 445 };
/** Flachheizkörper 600 × 1.000 mm (Bauhöhe × Baulänge, gewählte Normgröße), 150 mm über dem Boden. */
export const HEIZKOERPER_MM = Object.freeze({ bauhoehe: 600, baulaenge: 1000, bodenabstand: 150 });
const HK = {
  x: 560,
  breite: e(HEIZKOERPER_MM.baulaenge),
  hoehe: e(HEIZKOERPER_MM.bauhoehe),
  y: HAUS.fussboden - e(HEIZKOERPER_MM.bodenabstand) - e(HEIZKOERPER_MM.bauhoehe),
};

/**
 * Anschlüsse der Außeneinheit (hinten, von vorn gesehen rechts; 87 und 87 + 90 mm vom rechten Rand): Die Steigleitungen
 * werden unter dem Gehäuse sichtbar. Welcher Stutzen Vorlauf und welcher Rücklauf ist, nennt Bild 4 nicht; die
 * Zuordnung hier (Vorlauf innen) ist gewählt (geschaetzt) und Teil der Abnahme (M-037).
 */
const ANSCHLUSS = {
  vorlauf: r1(GERAET.x + GERAET.breite - e(G.hydraulik.abstandRand.mm + G.hydraulik.abstandZwischen.mm)),
  ruecklauf: r1(GERAET.x + GERAET.breite - e(G.hydraulik.abstandRand.mm)),
};

/** Tiefe der Erdleitung (frostfrei, 0,6–0,7 m; geschaetzt), Rücklauf über dem Vorlauf. */
const ERD = { ruecklauf: GOK + 58, vorlauf: GOK + 70 };
/** Lage der Leitungen zur Bewerbung (Startseite): senkrecht links (mobil) bzw. waagerecht aus dem Bild (Desktop). */
export const KNOPF_LEITUNG = Object.freeze({ vorlaufX: 28, ruecklaufX: 14, desktopY: ERD.vorlauf });

export interface Leitung {
  id: string;
  medium: Medium;
  /** Pfad in Fließrichtung (beginnt am Erzeuger bzw. am Verbraucher beim Rücklauf). */
  d: string;
  punkte: readonly Punkt[];
  /** Nur in einer Fassung: `knopf` (Startseite, Leitung zur Bewerbung), `mobil`/`desktop` (Lage des Knopfs). */
  nur?: 'knopf-mobil' | 'knopf-desktop' | 'knopf';
  /** Liegt vor anderen Leitungen (Mantel in der Fläche an Kreuzungen). */
  vorn?: boolean;
}

const weg = (id: string, medium: Medium, punkte: Punkt[], extra: Partial<Leitung> = {}): Leitung => ({
  id,
  medium,
  punkte,
  d: leitungsweg(punkte, BOGEN),
  ...extra,
});

const VL_IE_X = IE.x + 40;
const RL_IE_X = IE.x + 16;

export const LEITUNGEN: readonly Leitung[] = [
  // Vorlauf: aus der Außeneinheit nach unten in den Rohrgraben, durch die Wanddurchführung zur Inneneinheit
  weg(
    'vorlauf-erde',
    'vorlauf',
    [
      { x: ANSCHLUSS.vorlauf, y: GERAET_UNTEN },
      { x: ANSCHLUSS.vorlauf, y: ERD.vorlauf },
      { x: VL_IE_X, y: ERD.vorlauf },
      { x: VL_IE_X, y: HAUS.fussboden },
    ],
    { vorn: true },
  ),
  // Vorlauf von der Inneneinheit zum Heizkörper (oben angeschlossen)
  weg('vorlauf-haus', 'vorlauf', [
    { x: IE.x + IE.breite, y: HK.y + 6 },
    { x: HK.x, y: HK.y + 6 },
  ]),
  // Rücklauf vom Heizkörper (unten) zur Inneneinheit
  weg('ruecklauf-haus', 'ruecklauf', [
    { x: HK.x, y: HK.y + HK.hoehe - 6 },
    { x: IE.x + IE.breite, y: HK.y + HK.hoehe - 6 },
  ]),
  // Rücklauf: aus der Inneneinheit durch die Wanddurchführung zurück zur Außeneinheit
  weg('ruecklauf-erde', 'ruecklauf', [
    { x: RL_IE_X, y: HAUS.fussboden },
    { x: RL_IE_X, y: ERD.ruecklauf },
    { x: ANSCHLUSS.ruecklauf, y: ERD.ruecklauf },
    { x: ANSCHLUSS.ruecklauf, y: GERAET_UNTEN },
  ]),
  // Abzweig zur Bewerbung: Vorlauf nach links aus dem Bild (Desktop) bzw. senkrecht nach unten (Handy)
  weg(
    'vorlauf-knopf',
    'vorlauf',
    [
      { x: ANSCHLUSS.vorlauf, y: ERD.vorlauf },
      { x: KNOPF_LEITUNG.vorlaufX, y: ERD.vorlauf },
      { x: KNOPF_LEITUNG.vorlaufX, y: HAUSSCHNITT_RAHMEN.hoehe },
    ],
    { nur: 'knopf-mobil' },
  ),
  weg(
    'vorlauf-knopf-desktop',
    'vorlauf',
    [
      { x: ANSCHLUSS.vorlauf, y: ERD.vorlauf },
      { x: 0, y: ERD.vorlauf },
    ],
    { nur: 'knopf-desktop' },
  ),
  // Rücklauf von der Bewerbung (Handy): links herauf, unter dem Gerät in die Rücklauf-Steigleitung
  weg(
    'ruecklauf-knopf',
    'ruecklauf',
    [
      { x: KNOPF_LEITUNG.ruecklaufX, y: HAUSSCHNITT_RAHMEN.hoehe },
      { x: KNOPF_LEITUNG.ruecklaufX, y: ERD.ruecklauf },
      { x: ANSCHLUSS.ruecklauf, y: ERD.ruecklauf },
    ],
    { nur: 'knopf-mobil' },
  ),
];

/** Feste Fließpfeile (Standbild): auf der Strecke, Spitze in Fließrichtung. */
export interface Pfeil {
  medium: Medium;
  d: string;
  nur?: Leitung['nur'];
}

const pfeil = (medium: Medium, spitze: Punkt, nach: Punkt, nur?: Leitung['nur']): Pfeil => ({ medium, d: fliesspfeil(spitze, nach, 14, 10), nur });

export const PFEILE: readonly Pfeil[] = [
  pfeil('vorlauf', { x: 268, y: ERD.vorlauf }, { x: 1, y: 0 }),
  pfeil('ruecklauf', { x: 238, y: ERD.ruecklauf }, { x: -1, y: 0 }),
  pfeil('vorlauf', { x: 500, y: HK.y + 6 }, { x: 1, y: 0 }),
  pfeil('ruecklauf', { x: 456, y: HK.y + HK.hoehe - 6 }, { x: -1, y: 0 }),
  pfeil('vorlauf', { x: 80, y: ERD.vorlauf }, { x: -1, y: 0 }, 'knopf'),
];

/** Erdreich und Schnittflächen (Wände, Decke, Bodenplatte, Fundament, Dach). */
const dachAussen = (x: number) => r1(FIRST.y - HAUS.dach * Math.SQRT2 + Math.abs(x - FIRST.x));
const dachInnen = (x: number) => r1(FIRST.y + Math.abs(x - FIRST.x));
const xl = HAUS.links - HAUS.ueberstand;
const xr = HAUS.rechts + HAUS.ueberstand;

export const BAUTEILE = {
  /** Dach als Band (Schnitt), mit Überstand und senkrechtem Abschluss an der Traufe. */
  dach: `M${xl} ${dachInnen(xl)}L${FIRST.x} ${FIRST.y}L${xr} ${dachInnen(xr)}V${dachAussen(xr)}L${FIRST.x} ${r1(FIRST.y - HAUS.dach * Math.SQRT2)}L${xl} ${dachAussen(xl)}Z`,
  waende: [
    `M${HAUS.links} ${HAUS.traufe}H${HAUS.links + HAUS.wand}V${HAUS.fundamentUnten}H${HAUS.links}Z`,
    `M${HAUS.rechts - HAUS.wand} ${HAUS.traufe}H${HAUS.rechts}V${HAUS.fundamentUnten}H${HAUS.rechts - HAUS.wand}Z`,
  ],
  decke: `M${HAUS.links + HAUS.wand} ${HAUS.traufe}H${HAUS.rechts - HAUS.wand}V${HAUS.deckeUnten}H${HAUS.links + HAUS.wand}Z`,
  bodenplatte: `M${HAUS.links + HAUS.wand} ${HAUS.fussboden}H${HAUS.rechts - HAUS.wand}V${HAUS.platteUnten}H${HAUS.links + HAUS.wand}Z`,
  /** Erdreich unter dem Gelände, ohne Haus (Wände, Bodenplatte) und Rohrgraben. */
  erdreich: `M0 ${GOK}H${HAUS.links}V${HAUS.fundamentUnten}H${HAUS.rechts}V${GOK}H${HAUSSCHNITT_RAHMEN.breite}V${HAUSSCHNITT_RAHMEN.hoehe}H0Z`,
  erdreichUnterPlatte: `M${HAUS.links + HAUS.wand} ${HAUS.platteUnten}H${HAUS.rechts - HAUS.wand}V${HAUS.fundamentUnten}H${HAUS.links + HAUS.wand}Z`,
  /** Rohrgraben mit Sandbett (ohne Schraffur), vom Gerät bis an das Fundament. */
  graben: `M0 ${GOK + 44}H${HAUS.links}V${GOK + 86}H0Z`,
  /** Geländeoberkante: links bis an die Wand, rechts ab der Wand. */
  gelaende: `M0 ${GOK}H${HAUS.links}M${HAUS.rechts} ${GOK}H${HAUSSCHNITT_RAHMEN.breite}`,
  /** Wanddurchführung (Futterrohr) im Fundament für beide Leitungen. */
  durchfuehrung: `M${HAUS.links - 4} ${ERD.ruecklauf - 10}H${HAUS.links + HAUS.wand + 4}V${ERD.vorlauf + 10}H${HAUS.links - 4}Z`,
  /** Betonsockel unter den Bodenhalterungen (geschaetzt). */
  sockel: [G.konsolen.randabstand.mm, G.konsolen.randabstand.mm + G.konsolen.abstand.mm].map(
    (mm) => `M${r1(GERAET.x + e(mm) - 12)} ${GOK - SOCKEL_HOEHE}H${r1(GERAET.x + e(mm) + 12)}V${GOK}H${r1(GERAET.x + e(mm) - 12)}Z`,
  ),
} as const;

/** Lage der Außeneinheit (verschachtelte Zeichnung mit viewBox in mm; 110 × 80 Einheiten). */
export const GERAET_LAGE = Object.freeze({
  x: GERAET.x,
  y: GERAET_OBEN,
  breite: GERAET.breite,
  hoehe: GERAET.hoehe,
  /** Unterkante der Halterungen (auf den Sockeln). */
  boden: GERAET_UNTEN + GERAET.konsole,
});

export const INNENEINHEIT_LAGE = Object.freeze({ ...IE, pumpe: { x: IE.x + IE.breite / 2, y: IE.y + IE.hoehe / 2 } });
export const HEIZKOERPER_LAGE = Object.freeze({ ...HK, lamellen: 9 });
export const HAUS_LAGE = Object.freeze({ ...HAUS, first: FIRST, gok: GOK });

/** Einzelheit „X“ (DIN ISO 128: Kreis in feiner Volllinie um die Stelle, Kennbuchstabe daneben). */
export const EINZELHEIT = Object.freeze({
  cx: r1(GERAET.x + GERAET.breite / 2),
  cy: r1(GERAET_OBEN + GERAET.hoehe / 2 + 4),
  r: 72,
  buchstabe: 'X',
  schrift: { x: GERAET.x - 34, y: GERAET_OBEN - 30 },
});

/** Maß „35 km“ im Giebel (Mitte der Schrift). */
export const GIEBEL_MASS = Object.freeze({ x: FIRST.x, y: r1(FIRST.y + (HAUS.deckeUnten - FIRST.y) * 0.62) });

/** Freier Himmel links über dem Gerät für die Einzelheit (Einstieg): oben links bis vor die Dachfläche. */
export const HIMMEL_LINKS = Object.freeze({ x: 12, y: 12, breite: 268, hoehe: 250 });

export { ANSCHLUSS as HAUSSCHNITT_ANSCHLUSS, ERD as HAUSSCHNITT_ERDLEITUNG, GOK as HAUSSCHNITT_GOK };
