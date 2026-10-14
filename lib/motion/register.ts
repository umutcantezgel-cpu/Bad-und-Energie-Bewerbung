/**
 * Bewegungsregister (KERN K-009, verbindlich nach _relaunch/ausbau/richtungen/1/BEGRUENDUNG.md §9, Stand 1.2 nach E-029).
 *
 * Jedes animierte Element trägt seine Kennung als `data-motion`. scripts/qa/check-design-tokens.mjs
 * liest MOTION_IDS aus dieser Datei und lehnt jede Kennung ab, die hier fehlt. Neue Bewegungen kommen
 * zuerst hierher (mit Zweck und reduzierter Fassung), dann in die Komponente.
 *
 * Regeln: Eigenschaften nur transform, opacity und stroke-dashoffset (dazu der View-Übergang zwischen
 * Erzählseiten); Dauern d-1…d-4, Verzögerungen als Vielfache des Takts (80 ms); Eingänge d-2 mit k-aus,
 * Ausgänge d-1 mit k-ein; kein Scroll-Auftritt, Auftakt endet nach ≤ 1.120 ms.
 * Schleifen gibt es nur mit dem Auslöser `dauer` (E-029): Produkt- und Prozesszeichnungen auf Erzählseiten,
 * pausierbar, nur im Sichtfeld, Periode ≥ 400 ms; Startbedingung in lib/motion/dauer.ts, Steuerung
 * components/zeichnung/bewegung/DauerSteuerung.tsx, `infinite` nur in components/zeichnung/bewegung/dauer.module.css.
 */

/** Alle Kennungen. Reihenfolge wie im Register; der Guard liest diese Liste wörtlich. */
export const MOTION_IDS = [
  'vorlauf-haus',
  'ruecklauf-haus',
  'erdleitung',
  'erdleitung-d',
  'pfeile',
  'radius-einrasten',
  'pendel-zeichnen',
  'ringe-zeichnen',
  'menue-oeffnen',
  'menue-leitung',
  'menue-eintrag',
  'unterstrich',
  'flaeche',
  'druck',
  'fortschritt',
  'kreis-schliessen',
  'seitenwechsel',
  'rotor-dreht',
  'wasser-fliesst',
  'kaeltemittel-fliesst',
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
 * `zustand` = Zustandswechsel der Seite; `knopf` = ausdrücklicher Knopfdruck; `navigation` = Seitenwechsel;
 * `dauer` = Schleife einer Produkt- oder Prozesszeichnung unter der Startbedingung (lib/motion/dauer.ts).
 */
export type Ausloeser = 'auftakt' | 'hover' | 'druck' | 'tippen' | 'zustand' | 'knopf' | 'navigation' | 'dauer';
/** Wo die Bewegung vorkommen darf (K-011): Signatur nur auf Erzählseiten. */
export type Seitenart = 'erzaehlseiten' | 'alle';

/** Schleife einer Dauerbewegung (E-029): Periode, immer pausierbar und nur im Sichtfeld. */
export interface Schleife {
  /** Dauer eines Durchgangs in ms (≥ 400, Vielfache des halben Takts). */
  periodeMs: number;
  pausierbar: true;
  nurSichtbar: true;
}

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
  /** Nur mit Auslöser `dauer`: die Schleife. */
  schleife?: Schleife;
}

export const TAKT_MS = 80;
export const DAUER_MS: Readonly<Record<DauerToken, number>> = { 'd-1': 120, 'd-2': 240, 'd-3': 400, 'd-4': 600 };
/**
 * Ende des gesamten Auftakts (das Maß „35 km“ im Giebel blendet ein); kein Auftakt läuft länger. Die Schleifen
 * (Auslöser `dauer`) haben stattdessen den Knopf „Anhalten“ (WCAG 2.2.2).
 */
export const AUFTAKT_ENDE_MS = 1120;

export const MOTION_REGISTER: Readonly<Record<MotionId, MotionEntry>> = {
  'vorlauf-haus': {
    zweck:
      'Wärme geht ins Haus: Der Vorlauf zeichnet sich von der Außeneinheit (Wärmeerzeuger) durch die Erdleitung zur ' +
      'Inneneinheit und weiter zum Heizkörper, in Fließrichtung (E-029).',
    ausloeser: ['auftakt'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: ['d-3'],
    verzoegerungTakte: [2],
    kurve: ['k-wechsel'],
    reduziert: 'Endzustand mit Pfeil.',
    seitenart: 'erzaehlseiten',
    endeMs: 560,
  },
  'ruecklauf-haus': {
    zweck: 'Der Rücklauf kehrt vom Heizkörper über die Erdleitung zur Außeneinheit zurück.',
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
      'Die Leitungen laufen in den Knopf: mobil fällt der Vorlauf aus der Anlage senkrecht in die Daumenzone und zweigt ' +
      'in den Knopf ab, der Rücklauf steigt im Bogen zurück (Startseite, je Stück d-1); am Desktop der Stellenseiten läuft ' +
      'das Paar waagerecht aus der Navy-Fläche in den Flansch (d-2).',
    ausloeser: ['auftakt'],
    eigenschaften: ['transform'],
    dauer: ['d-2', 'd-1'],
    verzoegerungTakte: [5, 7, 8, 8.5, 10, 11.5],
    kurve: ['k-wechsel', 'linear', 'k-aus'],
    reduziert: 'Leitungen stehen.',
    seitenart: 'erzaehlseiten',
    endeMs: 1040,
  },
  'erdleitung-d': {
    zweck:
      'Desktop der Startseite: Der Vorlauf läuft aus der Anlage zur Hauptaktion (E-029, K-001: er endet in deiner ' +
      'Bewerbung): vom Rand der Navy-Fläche über Bogen, Steigleitung und Bogen in den Knopf, je Stück d-1.',
    ausloeser: ['auftakt'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: ['d-1'],
    verzoegerungTakte: [7, 8.5, 10, 11.5],
    kurve: ['linear'],
    reduziert: 'Die Leitung steht vollständig von der Anlage bis zum Knopf.',
    seitenart: 'erzaehlseiten',
    endeMs: 1040,
  },
  pfeile: {
    zweck: 'Die Fließrichtung bestätigen: Die festen Fließpfeile blenden ein, wenn die Leitungen stehen.',
    ausloeser: ['auftakt'],
    eigenschaften: ['opacity'],
    dauer: ['d-2'],
    verzoegerungTakte: [9],
    kurve: ['k-aus'],
    reduziert: 'Pfeile sichtbar (sie gehören zum Standbild).',
    seitenart: 'erzaehlseiten',
    endeMs: 960,
  },
  'radius-einrasten': {
    zweck:
      'Schlusstakt (Leitmotiv „35 km“, E-027, E-029): Das Maß „35 km“ im Giebel blendet ein. Zirkel und Einrasten ' +
      '(Skalierung) sind mit E-029 entfallen; es bleibt eine Überblendung.',
    ausloeser: ['auftakt'],
    eigenschaften: ['opacity'],
    dauer: ['d-2'],
    verzoegerungTakte: [11],
    kurve: ['k-aus'],
    reduziert: 'Das Maß „35 km“ steht im Giebel.',
    seitenart: 'erzaehlseiten',
    endeMs: 1120,
  },
  'pendel-zeichnen': {
    zweck:
      'Signatur der Ortsseiten (E-028): Der Arbeitsweg zeichnet sich einmal im Seitenkopf, der Vorlauf rot vom ' +
      'Firmensitz zum Ort, danach der Rücklauf blau zurück (Pendelweg).',
    ausloeser: ['auftakt'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: ['d-3'],
    verzoegerungTakte: [4, 7],
    kurve: ['k-wechsel'],
    reduziert: 'Vorlauf und Rücklauf stehen vollständig zwischen Firmensitz und Ort.',
    seitenart: 'erzaehlseiten',
    endeMs: 960,
  },
  'ringe-zeichnen': {
    zweck:
      'Signatur der Gebietsseite (E-028): Die Ringe des Einsatzgebiets ziehen sich einmal um den Firmensitz auf, ' +
      'erst 15, dann 25, dann 35 km.',
    ausloeser: ['auftakt'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: ['d-3'],
    verzoegerungTakte: [2, 4, 6],
    kurve: ['k-aus'],
    reduziert: 'Alle drei Ringe stehen.',
    seitenart: 'erzaehlseiten',
    endeMs: 880,
  },
  'menue-oeffnen': {
    zweck:
      'Das Menü als eigener Moment (Popover, @starting-style); ebenso die Untermenüs der Kopf-Navigation am Desktop ' +
      '(„Arbeiten bei uns“, „Einsatzgebiet“, E-028), deren Winkel sich dabei dreht.',
    ausloeser: ['tippen', 'hover'],
    eigenschaften: ['opacity', 'transform'],
    dauer: ['d-2', 'd-1'],
    verzoegerungTakte: [0],
    kurve: ['k-aus', 'k-ein'],
    reduziert: 'Menü und Untermenü stehen sofort offen bzw. sind sofort zu, der Winkel wechselt ohne Drehung.',
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
    zweck:
      'Die Menüeinträge zweigen von der Leitung ab (Staffel ½ Takt, vier Einträge); die Unterseiten unter „Arbeiten ' +
      'bei uns“ und „Einsatzgebiet“ kommen mit ihrem Eintrag (E-028).',
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
  'rotor-dreht': {
    zweck:
      'Die Maschine läuft (Produktzeichnung, E-029): Der Axialrotor des Außengeräts dreht hinter dem Schutzgitter, ' +
      'linear, ein Blattabstand (90° bei vier Blättern) je 600 ms; der Rotor liegt auf eigener HTML-Ebene.',
    ausloeser: ['dauer'],
    eigenschaften: ['transform'],
    dauer: ['d-4'],
    verzoegerungTakte: [0],
    kurve: ['linear'],
    reduziert: 'Standbild: Der Rotor steht hinter dem Gitter.',
    seitenart: 'erzaehlseiten',
    schleife: { periodeMs: 600, pausierbar: true, nurSichtbar: true },
  },
  'wasser-fliesst': {
    zweck:
      'Wasser fließt (Prozesszeichnung, E-029): Auf Vorlauf und Rücklauf wandert ein Strichmuster in Fließrichtung ' +
      '(Überlagerungspfad, stroke-dashoffset); der Pfad ist in Fließrichtung gezeichnet, so stimmt die Richtung von selbst.',
    ausloeser: ['dauer'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: [],
    verzoegerungTakte: [0],
    kurve: ['linear'],
    reduziert: 'Standbild: volle Leitungen mit festen Fließpfeilen, kein Strichmuster.',
    seitenart: 'erzaehlseiten',
    schleife: { periodeMs: 1200, pausierbar: true, nurSichtbar: true },
  },
  'kaeltemittel-fliesst': {
    zweck:
      'Das Kältemittel kreist im Außengerät (Kältekreis, Monoblock, E-029): Strichmuster in Fließrichtung auf dem ' +
      'Kreis Verdampfer → Verdichter → Plattenwärmeübertrager → Expansionsventil.',
    ausloeser: ['dauer'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: [],
    verzoegerungTakte: [0],
    kurve: ['linear'],
    reduziert: 'Standbild: der Kreis mit festen Fließpfeilen und den Etiketten Heißgas, flüssig, Sauggas.',
    seitenart: 'erzaehlseiten',
    schleife: { periodeMs: 960, pausierbar: true, nurSichtbar: true },
  },
};

/** Die Kennungen der Dauerbewegung (Auslöser `dauer`). */
export const DAUER_IDS = MOTION_IDS.filter((id) => MOTION_REGISTER[id].ausloeser.includes('dauer'));

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
