/**
 * Bewegungsregister (KERN K-009, verbindlich nach _relaunch/ausbau/richtungen/1/BEGRUENDUNG.md §9).
 *
 * Jedes animierte Element trägt seine Kennung als `data-motion`. scripts/qa/check-design-tokens.mjs
 * liest MOTION_IDS aus dieser Datei und lehnt jede Kennung ab, die hier fehlt. Neue Bewegungen kommen
 * zuerst hierher (mit Zweck und reduzierter Fassung), dann in die Komponente.
 *
 * Regeln: Eigenschaften nur transform, opacity und stroke-dashoffset (dazu der View-Übergang zwischen
 * Erzählseiten); Dauern d-1…d-4, Verzögerungen als Vielfache des Takts (80 ms); Eingänge d-2 mit k-aus,
 * Ausgänge d-1 mit k-ein; keine Schleife, kein Scroll-Auftritt, Auftakt endet nach ≤ 1.120 ms.
 */

/** Alle Kennungen. Reihenfolge wie im Register; der Guard liest diese Liste wörtlich. */
export const MOTION_IDS = [
  'luft',
  'luefter',
  'vorlauf-haus',
  'waerme',
  'ruecklauf-haus',
  'erdleitung',
  'erdleitung-d',
  'pfeile',
  'uhr',
  'menue-oeffnen',
  'menue-leitung',
  'menue-eintrag',
  'unterstrich',
  'flaeche',
  'druck',
  'kreislauf-zeigen',
  'fortschritt',
  'kreis-schliessen',
  'seitenwechsel',
] as const;

export type MotionId = (typeof MOTION_IDS)[number];

/** Dauerstufen (theme.css --d-1…--d-4). */
export type DauerToken = 'd-1' | 'd-2' | 'd-3' | 'd-4';
/** Kurven (theme.css --k-aus, --k-wechsel, --k-ein) und linear. */
export type KurveToken = 'k-aus' | 'k-wechsel' | 'k-ein' | 'linear';
/** Erlaubte animierte Eigenschaften. */
export type Eigenschaft = 'transform' | 'opacity' | 'stroke-dashoffset' | 'view-transition';
/**
 * Auslöser: `auftakt` = Klasse aus dem Kopfskript (einmal, nur ohne reduzierte Bewegung);
 * `hover` nur bei (hover: hover) and (pointer: fine); `druck` = :active; `tippen` = Bedienung;
 * `zustand` = Zustandswechsel der Seite; `knopf` = ausdrücklicher Knopfdruck; `navigation` = Seitenwechsel.
 */
export type Ausloeser = 'auftakt' | 'hover' | 'druck' | 'tippen' | 'zustand' | 'knopf' | 'navigation';
/** Wo die Bewegung vorkommen darf (K-011): Signatur nur auf Erzählseiten. */
export type Seitenart = 'erzaehlseiten' | 'alle';

export interface MotionEntry {
  /** Wozu die Bewegung da ist (Bedeutung, nicht Effekt). */
  zweck: string;
  ausloeser: readonly Ausloeser[];
  eigenschaften: readonly Eigenschaft[];
  /** Dauerstufen; bei Ein- und Ausgang zuerst der Eingang. */
  dauer: readonly DauerToken[];
  /** Verzögerungen in Takten (80 ms), je animiertem Teil. */
  verzoegerungTakte: readonly number[];
  kurve: readonly KurveToken[];
  /** Was bei reduzierter Bewegung (und ohne Skript) zu sehen ist. */
  reduziert: string;
  seitenart: Seitenart;
  /** Für Auftakt-Abläufe: Ende des Teils in ms ab Aufruf (≤ AUFTAKT_ENDE_MS). */
  endeMs?: number;
  /** Abweichende Dauer in ms, wo keine Stufe passt (nur der View-Übergang: 250–450 ms). */
  dauerMsBereich?: readonly [number, number];
}

export const TAKT_MS = 80;
export const DAUER_MS: Readonly<Record<DauerToken, number>> = { 'd-1': 120, 'd-2': 240, 'd-3': 400, 'd-4': 600 };
/** Ende des gesamten Auftakts (Uhr rastet ein); nichts läuft länger, darum kein Pause-Knopf. */
export const AUFTAKT_ENDE_MS = 1120;

export const MOTION_REGISTER: Readonly<Record<MotionId, MotionEntry>> = {
  luft: {
    zweck: 'Die Pumpe zieht Luft (Logo-Motiv Luft).',
    ausloeser: ['auftakt'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: ['d-2'],
    verzoegerungTakte: [0, 0.5, 1],
    kurve: ['k-aus'],
    reduziert: 'Endzustand: alle drei Luftpfade stehen.',
    seitenart: 'erzaehlseiten',
    endeMs: 320,
  },
  luefter: {
    zweck: 'Die Anlage läuft an (Lüfter dreht eine halbe Umdrehung).',
    ausloeser: ['auftakt'],
    eigenschaften: ['transform'],
    dauer: ['d-3'],
    verzoegerungTakte: [0],
    kurve: ['k-wechsel'],
    reduziert: 'Lüfter steht.',
    seitenart: 'erzaehlseiten',
    endeMs: 400,
  },
  'vorlauf-haus': {
    zweck: 'Wärme geht ins Haus (Vorlauf zeichnet sich zum Heizkörper).',
    ausloeser: ['auftakt'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: ['d-3'],
    verzoegerungTakte: [2],
    kurve: ['k-wechsel'],
    reduziert: 'Endzustand mit Pfeil.',
    seitenart: 'erzaehlseiten',
    endeMs: 560,
  },
  waerme: {
    zweck: 'Das Haus wird warm (Pegel steigt; im Einstieg nach Variante 3 breitet sich das Wärmebild vom Heizkörper aus, heiß zuerst).',
    ausloeser: ['auftakt'],
    eigenschaften: ['transform', 'opacity'],
    dauer: ['d-4'],
    verzoegerungTakte: [4],
    kurve: ['k-aus'],
    reduziert: 'Haus warm.',
    seitenart: 'erzaehlseiten',
    endeMs: 920,
  },
  'ruecklauf-haus': {
    zweck: 'Der Rücklauf kehrt zur Pumpe zurück.',
    ausloeser: ['auftakt'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: ['d-3'],
    verzoegerungTakte: [6],
    kurve: ['k-wechsel'],
    reduziert: 'Endzustand mit Pfeil.',
    seitenart: 'erzaehlseiten',
    endeMs: 880,
  },
  erdleitung: {
    zweck:
      'Die Leitungen laufen in den Knopf: mobil fallen sie senkrecht in die Daumenzone (Startseite, Stellenseiten), am Desktop der Stellenseiten laufen sie waagerecht aus der Navy-Fläche in den Flansch.',
    ausloeser: ['auftakt'],
    eigenschaften: ['transform'],
    dauer: ['d-2'],
    verzoegerungTakte: [5, 8],
    kurve: ['k-wechsel'],
    reduziert: 'Leitungen stehen.',
    seitenart: 'erzaehlseiten',
    endeMs: 880,
  },
  'erdleitung-d': {
    zweck: 'Desktop der Startseite: Der Vorlauf läuft aus der Hauptaktion in die Wärmepumpe, der Rücklauf kommt zurück.',
    ausloeser: ['auftakt'],
    eigenschaften: ['stroke-dashoffset'],
    // Vorlauf: Fall d-1, Bogen d-1, Lauf d-2 ab 4 Takten; Rücklauf: Lauf d-2, Bogen d-1, Fall d-1 ab 8 Takten
    dauer: ['d-1', 'd-2'],
    verzoegerungTakte: [4, 8],
    kurve: ['linear', 'k-aus', 'k-ein'],
    reduziert: 'Leitungen stehen.',
    seitenart: 'erzaehlseiten',
    endeMs: 1120,
  },
  pfeile: {
    zweck: 'Die Fließrichtung bestätigen.',
    ausloeser: ['auftakt'],
    eigenschaften: ['opacity'],
    dauer: ['d-2'],
    verzoegerungTakte: [9],
    kurve: ['k-aus'],
    reduziert: 'Pfeile sichtbar.',
    seitenart: 'erzaehlseiten',
    endeMs: 960,
  },
  uhr: {
    zweck: 'Schlusstakt: Der Freitag rastet auf 13:30 ein (Bindung an die Zusage).',
    ausloeser: ['auftakt'],
    eigenschaften: ['transform'],
    dauer: ['d-2'],
    verzoegerungTakte: [11],
    kurve: ['k-aus'],
    reduziert: 'Uhr steht auf 13:30.',
    seitenart: 'erzaehlseiten',
    endeMs: 1120,
  },
  'menue-oeffnen': {
    zweck: 'Das Menü als eigener Moment (Popover, @starting-style).',
    ausloeser: ['tippen'],
    eigenschaften: ['opacity', 'transform'],
    dauer: ['d-2', 'd-1'],
    verzoegerungTakte: [0],
    kurve: ['k-aus', 'k-ein'],
    reduziert: 'Menü steht sofort offen bzw. ist sofort zu.',
    seitenart: 'alle',
  },
  'menue-leitung': {
    zweck: 'Das Leitungspaar fällt im Menü in den Knopf.',
    ausloeser: ['zustand'],
    eigenschaften: ['transform'],
    dauer: ['d-2'],
    verzoegerungTakte: [0],
    kurve: ['k-aus'],
    reduziert: 'Leitungspaar steht.',
    seitenart: 'alle',
  },
  'menue-eintrag': {
    zweck: 'Die Menüeinträge zweigen von der Leitung ab (Staffel ½ Takt, vier Einträge).',
    ausloeser: ['zustand'],
    eigenschaften: ['opacity', 'transform'],
    dauer: ['d-1'],
    verzoegerungTakte: [0, 0.5, 1, 1.5],
    kurve: ['k-aus'],
    reduziert: 'Einträge stehen sofort.',
    seitenart: 'alle',
  },
  unterstrich: {
    zweck: 'Hover-Rückmeldung von Navigation, Telefon und Logo (Strich in Navy, dunkel Creme).',
    ausloeser: ['hover'],
    eigenschaften: ['transform'],
    dauer: ['d-2', 'd-1'],
    verzoegerungTakte: [0],
    kurve: ['k-aus', 'k-ein'],
    reduziert: 'Strich erscheint sofort.',
    seitenart: 'alle',
  },
  flaeche: {
    zweck: 'Hover-Rückmeldung von „Menü“ und „Schließen“ (Fläche Wand).',
    ausloeser: ['hover'],
    eigenschaften: ['opacity'],
    dauer: ['d-2', 'd-1'],
    verzoegerungTakte: [0],
    kurve: ['k-aus', 'k-ein'],
    reduziert: 'Fläche erscheint sofort.',
    seitenart: 'alle',
  },
  druck: {
    zweck:
      'Hover- und Druck-Rückmeldung der Hauptaktion (Deckschicht Rot-Hover, :active Rot-Druck und 1 px). ' +
      'Die 1-px-Druckbewegung allein tragen wie in Variante 1 auch Kopf-Navigation, Telefon, Menüknopf, Logo, ' +
      'Zweitweg und Stellenzeilen (globals.css: [data-motion~="druck"]:active).',
    ausloeser: ['hover', 'druck'],
    eigenschaften: ['opacity', 'transform'],
    dauer: ['d-2', 'd-1'],
    verzoegerungTakte: [0],
    kurve: ['k-aus', 'k-ein'],
    reduziert: 'Zustand wechselt sofort; ohne 1-px-Versatz (keine Positionsänderung).',
    seitenart: 'alle',
  },
  'kreislauf-zeigen': {
    zweck: 'Wiederholung des Auftakts auf Knopfdruck „Kreislauf zeigen“ (B Runde 1).',
    ausloeser: ['knopf'],
    eigenschaften: ['transform', 'opacity', 'stroke-dashoffset'],
    dauer: ['d-1', 'd-2', 'd-3', 'd-4'],
    verzoegerungTakte: [0],
    kurve: ['k-aus', 'k-wechsel', 'k-ein', 'linear'],
    reduziert: 'Knopf bleibt verborgen; die Zeichnung steht im Endzustand.',
    seitenart: 'erzaehlseiten',
    endeMs: 1120,
  },
  fortschritt: {
    zweck: 'Der Leitungsstrang im Bewerbungsflow wächst mit jedem Schritt.',
    ausloeser: ['zustand'],
    eigenschaften: ['transform', 'stroke-dashoffset'],
    dauer: ['d-2'],
    verzoegerungTakte: [0],
    kurve: ['k-aus'],
    reduziert: 'Strang steht sofort auf dem neuen Schritt.',
    seitenart: 'alle',
  },
  'kreis-schliessen': {
    zweck: 'Danke-Seite: Der Kreis schließt sich (Erfolg, ruhig, einmal).',
    ausloeser: ['zustand'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: ['d-3'],
    verzoegerungTakte: [0],
    kurve: ['k-wechsel'],
    reduziert: 'Kreis steht geschlossen.',
    seitenart: 'alle',
  },
  seitenwechsel: {
    zweck: 'View-Übergang zwischen Erzählseiten (Zusammenhang Startseite ↔ Stellenseite).',
    ausloeser: ['navigation'],
    eigenschaften: ['view-transition'],
    dauer: [],
    verzoegerungTakte: [0],
    kurve: ['k-wechsel'],
    reduziert: 'Kein Übergang.',
    seitenart: 'erzaehlseiten',
    dauerMsBereich: [250, 450],
  },
};

export function isMotionId(value: unknown): value is MotionId {
  return typeof value === 'string' && (MOTION_IDS as readonly string[]).includes(value);
}

/** Registereintrag einer Kennung. */
export function motionEntry(id: MotionId): MotionEntry {
  return MOTION_REGISTER[id];
}

/** Längste Dauer eines Eintrags in ms (für Sicherheitsnetze und Prüfungen). */
export function maxDauerMs(entry: MotionEntry): number {
  const stufen = entry.dauer.map((token) => DAUER_MS[token]);
  return Math.max(0, ...stufen, ...(entry.dauerMsBereich ?? []));
}

/** Spätester Start eines Eintrags in ms (größte Verzögerung × Takt). */
export function maxVerzoegerungMs(entry: MotionEntry): number {
  return Math.max(0, ...entry.verzoegerungTakte) * TAKT_MS;
}
