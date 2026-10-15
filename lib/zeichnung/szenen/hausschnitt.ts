/**
 * Hausschnitt (KERN K-001, K-010, E-029): die Anlage im Schnitt durch das Haus, 1 Einheit = 10 mm. Dieselbe Geometrie
 * zeichnen der Einstieg der Startseite (components/home/einstieg/Szene.tsx), der kleine Hausschnitt
 * (HausschnittKlein in components/zeichnung/technik/Hausschnitt.tsx) und die Teilen-Bilder (lib/seo/og-haus.ts).
 *
 * Inhalt: Geländeschnitt mit Erdreich (45°-Schraffur), links vor dem Haus die Außeneinheit maßstäblich (110 × 80
 * Einheiten = 1.100 × 800 mm, compress-aw-s.ts) auf zwei Betonsockeln in einer Schotterschicht, darunter das
 * Kondensatrohr ins Kiesbett unter der Frosttiefe, die Erdleitung im Rohrgraben unter der Frosttiefe, durch die
 * Wanddurchführung in der Frostschürze ins Haus, die Inneneinheit als Symbol (Modell offen, M-022) und ein
 * Flachheizkörper 600 × 1.000 mm. Im Giebel steht das Maß „35 km“ in Schrift (Leitmotiv E-027, ohne Zirkel seit E-029).
 *
 * Eine Frosttiefe für alles (Prüfung E-029, Runde 2): Erdleitung, Kondensatweg und Gründung liegen unter FROSTTIEFE; die
 * Kernbohrung mit dem Futterrohr sitzt in der Frostschürze mit Beton darunter.
 *
 * Fließrichtung (K-003.2): Jeder Leitungsweg ist in Fließrichtung angelegt. Der Vorlauf beginnt an der Außeneinheit
 * (Wärmeerzeuger) und läuft zur Inneneinheit, von dort zum Heizkörper; ein Abzweig läuft zur Bewerbung (Startseite:
 * links aus dem Bild in den roten Knopf). Der Rücklauf kommt vom Verbraucher zurück zur Außeneinheit. Auch die
 * Leitungen zur Bewerbung liegen waagerecht nur unter der Frosttiefe (Prüfung E-029, Runde 3, KNOPF_LEITUNG).
 *
 * Die Anschlüsse sitzen hinten am Gerät (202 mm über der Aufstellfläche). Von vorn liegen die Leitungen dort hinter
 * Gehäuse und Sockel: bis unter die Geländeoberkante als verdeckte Linie (`verdeckt`), erst im Erdreich voll.
 * Maße ohne Beleg tragen `geschaetzt` (Sockel, Raumhöhe, Lage der Inneneinheit); Prüfung:
 * lib/zeichnung/__tests__/zeichnung-daten.test.ts und schemata.test.ts.
 */
import { COMPRESS_AW_S } from '../geraete/compress-aw-s';
import { schaetzung } from '../geraete/typen';
import { fliesspfeil, leitungsweg, MASSSTAB, r1, SCHRAFFUR, schraffurLinien, type Medium, type Punkt } from '../norm';

/** mm → Einheiten des Hausschnitts. */
const e = (mm: number) => r1(mm / MASSSTAB.haus);

/**
 * Rahmen bis 1,22 m unter Gelände (GOK + 122, die Unterkante der Frostschürze): Unter dem Kiesbett des Kondensats
 * braucht der Vorlauf zur Bewerbung am Handy Platz (KNOPF_LEITUNG; Prüfung E-029, Runde 3).
 */
export const HAUSSCHNITT_RAHMEN = Object.freeze({ breite: 800, hoehe: 692 });
/** Gelände und Erdreich laufen rechts über den Rahmen hinaus (breite Flächen am Desktop schneiden sie ab). */
const RAND_RECHTS = 1100;

/** Geländeoberkante (GOK). */
const GOK = 570;
/** Radius der Leitungsbögen und Abstand eines Leitungspaars (12 Einheiten = 12 cm, wie --paar). */
const BOGEN = 10;

const G = COMPRESS_AW_S;

/**
 * Frosttiefe: Bis hierhin kann der Boden gefrieren. Erdleitung, Kondensatweg und Gründung liegen tiefer (Bosch
 * 6721864591, Kap. 5.1/5.2: Wasser in den Leitungen kann gefrieren, das Kondensat muss frostfrei abfließen).
 */
export const FROSTTIEFE = schaetzung(
  800,
  'Frostfreie Gründungstiefe in Deutschland in der Regel 0,80 m (DIN 1054), regional mehr; Bosch führt den Kondensatweg auf 900 mm (Bild 27)',
);
const FROST = GOK + e(FROSTTIEFE.mm);

/** Außeneinheit: Lage links vor dem Haus; Größe aus dem Geräte-Modul (110 × 80). */
const SOCKEL_HOEHE = 10; // geschaetzt: Betonsockel 100 mm über Gelände (Herstelleranleitung Bild 17: fester Untergrund)
/**
 * Betonsockel binden 100 mm ins Erdreich ein und stehen auf der Schotterschicht (Bild 27 [1], [2]; die Einbindung ist
 * nicht bemaßt, geschaetzt). Unter ihnen die Schotterschicht (300 mm, Geräte-Modul) über die ganze Breite des Geräts.
 */
export const SOCKEL_EINBINDUNG = schaetzung(100, 'Betonsockel stehen in Bild 27 teils im Erdreich; Einbindung nicht bemaßt');
const SOCKEL_UNTEN = GOK + e(SOCKEL_EINBINDUNG.mm);
const ABLEITUNG = COMPRESS_AW_S.kondensat.ableitung;
const GERAET = {
  x: 100,
  breite: e(G.breite.mm),
  /** Höhe ab Aufstellfläche (mit Bodenhalterungen), wie im Geräte-Modul. */
  hoehe: e(G.hoehe.mm),
};
/** Aufstellfläche: Oberkante der Sockel, Unterkante der Bodenhalterungen. */
const AUFSTELLFLAECHE = GOK - SOCKEL_HOEHE;
const GERAET_OBEN = AUFSTELLFLAECHE - GERAET.hoehe;

/** Haus: Außenwände, Bodenplatte, Decke, Dach 45°. Alle Werte geschätzt (ein typischer eingeschossiger Schnitt). */
const HAUS = {
  links: 300,
  rechts: 780,
  wand: 30,
  /** Fertigfußboden 150 mm über Gelände, Bodenplatte 250 mm. */
  fussboden: GOK - 15,
  platteUnten: GOK + 10,
  /**
   * Frostschürze bis unter das Futterrohr der Erdleitung, mit 160 mm Beton darunter (geschaetzt; unter der Frosttiefe).
   * Sie reicht unter den unteren Rand der Zeichnung und ist dort angeschnitten.
   */
  fundamentUnten: GOK + 122,
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
 * Anschlüsse der Außeneinheit hinten, von vorn gesehen rechts: 87 und 87 + 90 mm vom rechten Rand, 202 mm über der
 * Aufstellfläche (Bild 4). Der Vorlauf (Heizwasser zur Inneneinheit) ist der äußere Stutzen, der Rücklauf der innere:
 * Bild 28 [1] und [2] (DK: S. 16 Fig. 28), im Geräte-Modul unter `hydraulik.vorlauf`.
 */
const AUSSEN = r1(GERAET.x + GERAET.breite - e(G.hydraulik.abstandRand.mm));
const INNEN = r1(GERAET.x + GERAET.breite - e(G.hydraulik.abstandRand.mm + G.hydraulik.abstandZwischen.mm));
const ANSCHLUSS = {
  vorlauf: G.hydraulik.vorlauf.lage === 'aussen' ? AUSSEN : INNEN,
  ruecklauf: G.hydraulik.vorlauf.lage === 'aussen' ? INNEN : AUSSEN,
  y: r1(AUFSTELLFLAECHE - e(G.hydraulik.hoehe.mm)),
};

/**
 * Tiefe der Erdleitung unter der Frosttiefe (Achse 0,88 und 0,98 m; geschaetzt). Der Vorlauf kommt vom äußeren Stutzen
 * und biegt höher zum Haus ab, der Rücklauf vom inneren Stutzen läuft darunter: Die Bögen liegen ineinander, nichts
 * kreuzt sich.
 */
const ERD = { vorlauf: GOK + 88, ruecklauf: GOK + 98 };

/** Kiesbett am Ende des Kondensatrohrs (Höhe nicht bemaßt: geschaetzt 150 mm), unter der Frosttiefe. */
export const KIESBETT_HOEHE = schaetzung(150, 'Höhe des Kiesbetts [4] in Bild 27 nicht bemaßt');
/** Oberkante (900 mm unter Gelände, Bild 27) und Unterkante des Kiesbetts. */
const KIESBETT = { oben: GOK + e(ABLEITUNG.tiefe.mm), unten: GOK + e(ABLEITUNG.tiefe.mm) + e(KIESBETT_HOEHE.mm) };

/**
 * Leitungen zur Bewerbung (Startseite) unter der Frosttiefe wie die Erdleitung (Prüfung E-029, Runde 3: vorher lagen
 * sie 0,46 und 0,60 m tief). Sie zweigen mit T-Stücken direkt an den Anschlüssen hinten am Gerät ab (hinter dem Gehäuse,
 * verdeckt), laufen links neben den Steigleitungen der Anlage senkrecht hinab und erst unter der Frosttiefe waagerecht
 * nach links. Unter dem Gerät liegt ab 0,90 m das Kiesbett des Kondensats: Zwischen Frosttiefe und Kiesbett
 * (0,80–0,90 m) ist Platz für genau eine Leitung (`band`), die zweite läuft unter dem Kiesbett (`unterKiesbett`).
 * - Desktop und Teilen-Bild: nur der Vorlauf, im Band links aus dem Bild (`desktopY`).
 * - Handy: der Rücklauf von der Bewerbung im Band (außen, x 14), der Vorlauf unter dem Kiesbett (innen, x 28). So kreuzt
 *   sich keine Leitung, auch nicht mit der Anlage.
 */
const KNOPF_TIEFE = { band: r1((FROST + KIESBETT.oben) / 2), unterKiesbett: r1(KIESBETT.unten + 7) };
/**
 * Senkrechte Stücke neben den Steigleitungen: links vom Rücklauf-Stutzen und vom Rohrgraben der Erdleitung, rechts vom
 * Kiesbett, 100 mm auseinander.
 */
const KNOPF_SENKRECHT = { vorlauf: r1(ANSCHLUSS.ruecklauf - 20), ruecklauf: r1(ANSCHLUSS.ruecklauf - 30) };
/** Höhe der T-Stücke an den Anschlüssen, hinter dem Gehäuse; der Rücklauf darüber, damit sich nichts kreuzt. */
const KNOPF_T = { vorlauf: r1(ANSCHLUSS.y + 11), ruecklauf: r1(ANSCHLUSS.y + 5) };

/** Lage der Leitungen zur Bewerbung: senkrecht links (mobil) bzw. waagerecht aus dem Bild (Desktop), Tiefen wie oben. */
export const KNOPF_LEITUNG = Object.freeze({
  vorlaufX: 28,
  ruecklaufX: 14,
  desktopY: KNOPF_TIEFE.band,
  mobilVorlaufY: KNOPF_TIEFE.unterKiesbett,
  mobilRuecklaufY: KNOPF_TIEFE.band,
  senkrecht: KNOPF_SENKRECHT,
  t: KNOPF_T,
});

export interface Leitung {
  id: string;
  medium: Medium;
  /** Pfad in Fließrichtung (beginnt am Erzeuger bzw. am Verbraucher beim Rücklauf). */
  d: string;
  punkte: readonly Punkt[];
  /** Nur in einer Fassung: `knopf` (Startseite, Leitung zur Bewerbung), `mobil`/`desktop` (Lage des Knopfs). */
  nur?: 'knopf-mobil' | 'knopf-desktop' | 'knopf';
  /**
   * Stück hinter Gehäuse und Sockel (vom Anschluss bis unter die Geländeoberkante bzw. bis unter das Gehäuse):
   * gezeichnet in der Linienart `verdeckt`, ohne Bewegung.
   */
  verdeckt?: true;
}

const weg = (id: string, medium: Medium, punkte: Punkt[], extra: Partial<Leitung> = {}): Leitung => ({
  id,
  medium,
  punkte,
  d: leitungsweg(punkte, BOGEN),
  ...extra,
});

/** Steigleitungen in der Inneneinheit: der höher liegende Vorlauf innen, der Rücklauf außen herum. */
const VL_IE_X = IE.x + 16;
const RL_IE_X = IE.x + 40;

export const LEITUNGEN: readonly Leitung[] = [
  // Vorlauf: vom Anschluss hinten am Gerät hinter Gehäuse und Sockel abwärts (verdeckt) …
  weg(
    'vorlauf-anschluss',
    'vorlauf',
    [
      { x: ANSCHLUSS.vorlauf, y: ANSCHLUSS.y },
      { x: ANSCHLUSS.vorlauf, y: SOCKEL_UNTEN },
    ],
    { verdeckt: true },
  ),
  // … und unter dem Sockel durch die Schotterschicht in den Rohrgraben, durch die Wanddurchführung zur Inneneinheit
  weg(
    'vorlauf-erde',
    'vorlauf',
    [
      { x: ANSCHLUSS.vorlauf, y: SOCKEL_UNTEN },
      { x: ANSCHLUSS.vorlauf, y: ERD.vorlauf },
      { x: VL_IE_X, y: ERD.vorlauf },
      { x: VL_IE_X, y: HAUS.fussboden },
    ],
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
  // Rücklauf: aus der Inneneinheit durch die Wanddurchführung zurück zur Außeneinheit, unter dem Gelände sichtbar …
  weg(
    'ruecklauf-erde',
    'ruecklauf',
    [
      { x: RL_IE_X, y: HAUS.fussboden },
      { x: RL_IE_X, y: ERD.ruecklauf },
      { x: ANSCHLUSS.ruecklauf, y: ERD.ruecklauf },
      { x: ANSCHLUSS.ruecklauf, y: SOCKEL_UNTEN },
    ],
  ),
  // … und hinter Sockel und Gehäuse (verdeckt) hinauf zum Anschluss
  weg(
    'ruecklauf-anschluss',
    'ruecklauf',
    [
      { x: ANSCHLUSS.ruecklauf, y: SOCKEL_UNTEN },
      { x: ANSCHLUSS.ruecklauf, y: ANSCHLUSS.y },
    ],
    { verdeckt: true },
  ),
  // Abzweig zur Bewerbung: T-Stück am Vorlauf-Anschluss hinter dem Gehäuse (verdeckt), über die Rücklauf-Steigleitung
  // hinweg links neben die Steigleitungen …
  weg(
    'vorlauf-knopf-anschluss',
    'vorlauf',
    [
      { x: ANSCHLUSS.vorlauf, y: KNOPF_T.vorlauf },
      { x: KNOPF_SENKRECHT.vorlauf, y: KNOPF_T.vorlauf },
      { x: KNOPF_SENKRECHT.vorlauf, y: AUFSTELLFLAECHE },
    ],
    { nur: 'knopf', verdeckt: true },
  ),
  // … unter dem Gehäuse senkrecht hinab und erst unter der Frosttiefe nach links: am Handy unter dem Kiesbett und links
  // senkrecht nach unten aus dem Bild …
  weg(
    'vorlauf-knopf',
    'vorlauf',
    [
      { x: KNOPF_SENKRECHT.vorlauf, y: AUFSTELLFLAECHE },
      { x: KNOPF_SENKRECHT.vorlauf, y: KNOPF_TIEFE.unterKiesbett },
      { x: KNOPF_LEITUNG.vorlaufX, y: KNOPF_TIEFE.unterKiesbett },
      { x: KNOPF_LEITUNG.vorlaufX, y: HAUSSCHNITT_RAHMEN.hoehe },
    ],
    { nur: 'knopf-mobil' },
  ),
  // … am Desktop zwischen Frosttiefe und Kiesbett links aus dem Bild
  weg(
    'vorlauf-knopf-desktop',
    'vorlauf',
    [
      { x: KNOPF_SENKRECHT.vorlauf, y: AUFSTELLFLAECHE },
      { x: KNOPF_SENKRECHT.vorlauf, y: KNOPF_TIEFE.band },
      { x: 0, y: KNOPF_TIEFE.band },
    ],
    { nur: 'knopf-desktop' },
  ),
  // Rücklauf von der Bewerbung (Handy): links herauf, zwischen Frosttiefe und Kiesbett nach rechts und neben den
  // Steigleitungen hinauf unter das Gehäuse …
  weg(
    'ruecklauf-knopf',
    'ruecklauf',
    [
      { x: KNOPF_LEITUNG.ruecklaufX, y: HAUSSCHNITT_RAHMEN.hoehe },
      { x: KNOPF_LEITUNG.ruecklaufX, y: KNOPF_TIEFE.band },
      { x: KNOPF_SENKRECHT.ruecklauf, y: KNOPF_TIEFE.band },
      { x: KNOPF_SENKRECHT.ruecklauf, y: AUFSTELLFLAECHE },
    ],
    { nur: 'knopf-mobil' },
  ),
  // … und hinter dem Gehäuse (verdeckt) mit einem T-Stück in den Rücklauf-Anschluss
  weg(
    'ruecklauf-knopf-anschluss',
    'ruecklauf',
    [
      { x: KNOPF_SENKRECHT.ruecklauf, y: AUFSTELLFLAECHE },
      { x: KNOPF_SENKRECHT.ruecklauf, y: KNOPF_T.ruecklauf },
      { x: ANSCHLUSS.ruecklauf, y: KNOPF_T.ruecklauf },
    ],
    { nur: 'knopf-mobil', verdeckt: true },
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
  pfeil('vorlauf', { x: 80, y: KNOPF_TIEFE.band }, { x: -1, y: 0 }, 'knopf-desktop'),
  pfeil('vorlauf', { x: 80, y: KNOPF_TIEFE.unterKiesbett }, { x: -1, y: 0 }, 'knopf-mobil'),
];

/**
 * Betonsockel unter den Bodenhalterungen (geschaetzt: 240 mm breit, 100 mm über Gelände, 100 mm eingebunden), mittig
 * unter jeder Halterung. Als Rechtecke für Zeichnung und Prüfung (keine sichtbare Leitung darin).
 */
export const SOCKEL_LAGE: readonly { x: number; y: number; breite: number; hoehe: number }[] = Object.freeze(
  [G.konsolen.randabstand.mm, G.konsolen.randabstand.mm + G.konsolen.abstand.mm].map((mm) => ({
    x: r1(GERAET.x + e(mm) - 12),
    y: AUFSTELLFLAECHE,
    breite: 24,
    hoehe: SOCKEL_UNTEN - AUFSTELLFLAECHE,
  })),
);

/** Schotterschicht unter den Sockeln (Geräte-Modul: 300 mm), über die Breite beider Sockel. */
export const SCHOTTER_LAGE = Object.freeze({
  x: SOCKEL_LAGE[0].x,
  y: SOCKEL_UNTEN,
  breite: r1(SOCKEL_LAGE[1].x + SOCKEL_LAGE[1].breite - SOCKEL_LAGE[0].x),
  hoehe: e(ABLEITUNG.schotter.mm),
});

/**
 * Kondensatweg: Ablaufstutzen unter dem Gerät (330 mm vom linken Rand, Geräte-Modul), darunter das Kondensatrohr
 * Ø 100 mm senkrecht durch die Schotterschicht bis 900 mm unter Gelände ins Kiesbett (Bild 27), also unter der
 * Frosttiefe. Das Rohr beginnt knapp unter dem Stutzen (Ablauf frei, Stutzen und Rohr nicht ineinander gesteckt).
 */
export const KONDENSAT_LAGE = Object.freeze({
  x: r1(GERAET.x + e(G.kondensat.vonLinks.mm)),
  rohr: e(ABLEITUNG.rohr.mm),
  /** Oberkante des Rohrs: 15 mm unter dem Ende des Stutzens. */
  oben: r1(AUFSTELLFLAECHE - e(G.konsolen.hoehe.mm) + e(G.kondensat.laenge.mm) + 1.5),
  /** Oberkante des Kiesbetts: 900 mm unter Gelände. */
  kiesbett: KIESBETT.oben,
  kiesbettHoehe: e(KIESBETT_HOEHE.mm),
  kiesbettBreite: 40,
});

/** Kreuzschraffur (45° und 135°) in einem Rechteck: Schotter und Kies, wie das Erdreich in der feinen Linie. */
function kreuzSchraffur(x0: number, y0: number, x1: number, y1: number, abstand: number): string {
  const spiegel = (d: string) =>
    d.replace(/([ML])(-?[\d.]+) (-?[\d.]+)/g, (_, cmd: string, x: string, y: string) => `${cmd}${r1(x0 + x1 - Number(x))} ${y}`);
  const einfach = schraffurLinien(x0, y0, x1, y1, abstand);
  return einfach + spiegel(einfach);
}

/**
 * Futterrohr der Kernbohrung in der Frostschürze, um Vor- und Rücklauf: mittig in der Schürze unter der Frosttiefe,
 * darunter bleibt Beton (mindestens 150 mm, geprüft in zeichnung-daten.test.ts).
 */
export const DURCHFUEHRUNG = Object.freeze({ oben: ERD.vorlauf - 8, unten: ERD.ruecklauf + 8 });

/** Unterkante der gezeichneten Wände: die Frostschürze, höchstens bis an den Rand der Zeichnung. */
const WAND_UNTEN = Math.min(HAUS.fundamentUnten, HAUSSCHNITT_RAHMEN.hoehe);

/** Kiesbett als Rechteck, am unteren Rand der Zeichnung angeschnitten. */
function kiesbettPfad(): string {
  const k = KONDENSAT_LAGE;
  const x0 = r1(k.x - k.kiesbettBreite / 2);
  const x1 = r1(k.x + k.kiesbettBreite / 2);
  const y1 = Math.min(k.kiesbett + k.kiesbettHoehe, HAUSSCHNITT_RAHMEN.hoehe);
  return `M${x0} ${k.kiesbett}H${x1}V${y1}H${x0}Z`;
}

/** Erdreich und Schnittflächen (Wände, Decke, Bodenplatte, Fundament, Dach). */
const dachAussen = (x: number) => r1(FIRST.y - HAUS.dach * Math.SQRT2 + Math.abs(x - FIRST.x));
const dachInnen = (x: number) => r1(FIRST.y + Math.abs(x - FIRST.x));
const xl = HAUS.links - HAUS.ueberstand;
const xr = HAUS.rechts + HAUS.ueberstand;

export const BAUTEILE = {
  /** Dach als Band (Schnitt), mit Überstand und senkrechtem Abschluss an der Traufe. */
  dach: `M${xl} ${dachInnen(xl)}L${FIRST.x} ${FIRST.y}L${xr} ${dachInnen(xr)}V${dachAussen(xr)}L${FIRST.x} ${r1(FIRST.y - HAUS.dach * Math.SQRT2)}L${xl} ${dachAussen(xl)}Z`,
  // Die Frostschürze reicht unter den Rand der Zeichnung: dort angeschnitten (Schnittkante = unterer Rand)
  waende: [
    `M${HAUS.links} ${HAUS.traufe}H${HAUS.links + HAUS.wand}V${WAND_UNTEN}H${HAUS.links}Z`,
    `M${HAUS.rechts - HAUS.wand} ${HAUS.traufe}H${HAUS.rechts}V${WAND_UNTEN}H${HAUS.rechts - HAUS.wand}Z`,
  ],
  decke: `M${HAUS.links + HAUS.wand} ${HAUS.traufe}H${HAUS.rechts - HAUS.wand}V${HAUS.deckeUnten}H${HAUS.links + HAUS.wand}Z`,
  bodenplatte: `M${HAUS.links + HAUS.wand} ${HAUS.fussboden}H${HAUS.rechts - HAUS.wand}V${HAUS.platteUnten}H${HAUS.links + HAUS.wand}Z`,
  /** Erdreich unter dem Gelände, ohne Haus (Wände, Bodenplatte) und Rohrgraben. */
  /**
   * Rohrgraben mit Sandbett (ohne Schraffur) um die Erdleitung unter der Frosttiefe, von den Steigleitungen am Gerät
   * bis an die Frostschürze.
   */
  graben: `M${ANSCHLUSS.ruecklauf - 14} ${ERD.vorlauf - 12}H${HAUS.links}V${ERD.ruecklauf + 8}H${ANSCHLUSS.ruecklauf - 14}Z`,
  /** Geländeoberkante: links bis an die Wand, rechts ab der Wand. */
  gelaende: `M0 ${GOK}H${HAUS.links}M${HAUS.rechts} ${GOK}H${RAND_RECHTS}`,
  /** 45°-Schraffur des Erdreichs (fein, 1 px); Haus, Fundament und Graben decken sie ab. */
  schraffur: schraffurLinien(0, GOK, RAND_RECHTS, HAUSSCHNITT_RAHMEN.hoehe, SCHRAFFUR.abstandHaus),
  /** Dieselbe Schraffur mit doppeltem Abstand für kleine Einsätze (unter rund 16rem Breite stünden die Linien dicht). */
  schraffurGrob: schraffurLinien(0, GOK, RAND_RECHTS, HAUSSCHNITT_RAHMEN.hoehe, SCHRAFFUR.abstandHaus * 2),
  /** Wanddurchführung (Futterrohr) in der Frostschürze für beide Leitungen (DURCHFUEHRUNG). */
  durchfuehrung: `M${HAUS.links - 4} ${DURCHFUEHRUNG.oben}H${HAUS.links + HAUS.wand + 4}V${DURCHFUEHRUNG.unten}H${HAUS.links - 4}Z`,
  /** Betonsockel unter den Bodenhalterungen (SOCKEL_LAGE). */
  sockel: SOCKEL_LAGE.map((q) => `M${q.x} ${q.y}H${r1(q.x + q.breite)}V${q.y + q.hoehe}H${q.x}Z`),
  /** Schotterschicht unter den Sockeln (Fläche und Kreuzschraffur). */
  schotter: `M${SCHOTTER_LAGE.x} ${SCHOTTER_LAGE.y}H${r1(SCHOTTER_LAGE.x + SCHOTTER_LAGE.breite)}V${SCHOTTER_LAGE.y + SCHOTTER_LAGE.hoehe}H${SCHOTTER_LAGE.x}Z`,
  schotterSchraffur: kreuzSchraffur(SCHOTTER_LAGE.x, SCHOTTER_LAGE.y, r1(SCHOTTER_LAGE.x + SCHOTTER_LAGE.breite), SCHOTTER_LAGE.y + SCHOTTER_LAGE.hoehe, SCHRAFFUR.abstandHaus),
  /** Kiesbett am Ende des Kondensatrohrs (Fläche und Kreuzschraffur), am unteren Rand angeschnitten. */
  kiesbett: kiesbettPfad(),
  kiesbettSchraffur: kreuzSchraffur(
    r1(KONDENSAT_LAGE.x - KONDENSAT_LAGE.kiesbettBreite / 2),
    KONDENSAT_LAGE.kiesbett,
    r1(KONDENSAT_LAGE.x + KONDENSAT_LAGE.kiesbettBreite / 2),
    Math.min(KONDENSAT_LAGE.kiesbett + KONDENSAT_LAGE.kiesbettHoehe, HAUSSCHNITT_RAHMEN.hoehe),
    SCHRAFFUR.abstandHaus,
  ),
  /** Kondensatrohr Ø 100 mm als Umriss (Fläche), vom Stutzen bis ins Kiesbett. */
  kondensat: `M${r1(KONDENSAT_LAGE.x - KONDENSAT_LAGE.rohr / 2)} ${KONDENSAT_LAGE.oben}H${r1(KONDENSAT_LAGE.x + KONDENSAT_LAGE.rohr / 2)}V${r1(KONDENSAT_LAGE.kiesbett + 4)}H${r1(KONDENSAT_LAGE.x - KONDENSAT_LAGE.rohr / 2)}Z`,
} as const;

/** Lage der Außeneinheit (verschachtelte Zeichnung mit viewBox in mm; 110 × 80 Einheiten). */
export const GERAET_LAGE = Object.freeze({
  x: GERAET.x,
  y: GERAET_OBEN,
  breite: GERAET.breite,
  /** Höhe ab Aufstellfläche (mit Bodenhalterungen): 800 mm = 80 Einheiten. */
  hoehe: GERAET.hoehe,
  /** Unterkante der Halterungen (auf den Sockeln). */
  boden: AUFSTELLFLAECHE,
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

export { ANSCHLUSS as HAUSSCHNITT_ANSCHLUSS, ERD as HAUSSCHNITT_ERDLEITUNG, FROST as HAUSSCHNITT_FROST, GOK as HAUSSCHNITT_GOK };
