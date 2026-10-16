/**
 * Bewegungsregister (KERN K-009, verbindlich nach _relaunch/ausbau/richtungen/1/BEGRUENDUNG.md §9, Stand 1.3 nach E-031).
 *
 * Jedes animierte Element trägt seine Kennung als `data-motion`. scripts/qa/check-design-tokens.mjs
 * liest MOTION_IDS aus dieser Datei und lehnt jede Kennung ab, die hier fehlt. Neue Bewegungen kommen
 * zuerst hierher (mit Zweck und reduzierter Fassung), dann in die Komponente.
 *
 * Regeln: Eigenschaften nur transform, opacity und stroke-dashoffset (seit E-031 kein View-Übergang mehr);
 * Dauern d-1…d-4 (einzige Ausnahme die Ringe der Wärmefront: ganze Takte, FRONT_RINGE), Verzögerungen als Vielfache des
 * Takts (80 ms); Eingänge d-2 mit k-aus, Ausgänge d-1 mit k-ein;
 * Auftakt endet nach ≤ 1.120 ms. Ausnahmen vom Ausgang, je im Eintrag vermerkt (Prüfrunde 4 C4-3; Owner-Feedback
 * 16.10.2026): Die Klick-Wärme verklingt d-3 mit k-wechsel, die Wärmefront verblasst d-3 mit k-wechsel, und der
 * Hauptinhalt steigt dabei an seinen Platz.
 * Schleifen gibt es nur mit dem Auslöser `dauer` (E-029): Produkt- und Prozesszeichnungen auf Erzählseiten,
 * pausierbar, nur im Sichtfeld, Periode ≥ 400 ms; Startbedingung in lib/motion/dauer.ts, Steuerung
 * components/zeichnung/bewegung/DauerSteuerung.tsx, `infinite` nur in components/zeichnung/bewegung/dauer.module.css.
 * Wärme (E-031): `nachlauf` (Hero, nach dem Vorlauf, Ende ≤ NACHLAUF_ENDE_MS) und `sicht` (einmal beim
 * Sichtbarwerden über components/zeichnung/bewegung/SichtStart.tsx, Ende ≤ SICHT_ENDE_MS, höchstens auf der Hälfte
 * der Abschnitte einer Seite); Klick-Wärme (`tippen`, KLICK_ENDE_MS) und Wärmefront (`navigation`, WECHSEL).
 * Skalieren nur nach √t: jeder Keyframe-Ablauf mit `scale` genau auf den Stützstellen DIFFUSION_STUETZ, auch die Ringe
 * der Wärmefront; einzige Ausnahme ihr Schleier und ihre Seitenfarbe (Owner-Feedback 16.10.2026: Sie wachsen ruhig mit
 * k-wechsel ab FRONT_START, ohne Antritt; lib/motion/__tests__/register.test.ts prüft sie eigens).
 * Malzeit (KERN K-013, e2e/support/malzeit.ts): Während Wärme, Büro-Szenen, Klick-Wärme und Wärmefront laufen, malt
 * nach den ersten zwei Bildern kein Bild 2 ms oder länger (mobil, CPU 4×). Ausnahmen, je einmal und außerhalb der
 * Bewegung: das Ende eines Sicht-Ablaufs (`fertig`, will-change bzw. die Füllung fällt) und bei der Wärmefront das
 * Malen der neuen Seite unter voller Deckung (vom Wechsel, router.push, bis sie ruht; Prüfrunde 3 C3-1; dabei hebt die
 * Insel auch den Hauptinhalt auf eine eigene Ebene), und wenn die Front zu ist, gibt der Hauptinhalt diese Ebene
 * einmal wieder ab. Abdecken und Aufdecken selbst sind ausnahmslos, mit jedem Bandende (Füllung both, Prüfrunde 2 C2-4);
 * e2e/interaktion.spec.ts misst vom Klick bis zum Wechsel und vom Aufdecken bis die Front zu ist, e2e/buero.spec.ts
 * jede Büro-Szene von laeuft bis fertig (Prüfrunde 3 C3-2: bewegte Gruppen auf eigenen HTML-Ebenen).
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
  'waerme-breitet-sich-aus',
  'buero-ablauf',
  'klick-waerme',
] as const;

export type MotionId = (typeof MOTION_IDS)[number];

/** Dauerstufen (theme.css --d-1…--d-4). */
export type DauerToken = 'd-1' | 'd-2' | 'd-3' | 'd-4';
/** Kurven (theme.css --k-aus, --k-wechsel, --k-ein) und linear. */
export type KurveToken = 'k-aus' | 'k-wechsel' | 'k-ein' | 'linear';
/** Erlaubte animierte Eigenschaften (E-031: der View-Übergang ist entfallen). */
export type Eigenschaft = 'transform' | 'opacity' | 'stroke-dashoffset';
/** Die erlaubten Eigenschaften als Liste (Prüfungen lesen sie hier). */
export const EIGENSCHAFTEN: readonly Eigenschaft[] = ['transform', 'opacity', 'stroke-dashoffset'];
/**
 * Auslöser: `auftakt` = Klasse aus dem Kopfskript (einmal, nur ohne reduzierte Bewegung);
 * `nachlauf` = einmal im Hero unter derselben Klasse, nach dem Vorlauf (E-031, Start NACHLAUF_START_TAKTE, Ende
 * ≤ NACHLAUF_ENDE_MS vor dem Sicherheitsnetz); `sicht` = einmal beim Sichtbarwerden (E-031, SichtStart,
 * `data-ablauf`, Ende ≤ SICHT_ENDE_MS); `hover` nur bei (hover: hover) and (pointer: fine); `druck` = :active;
 * `tippen` = Bedienung (auch Klick); `zustand` = Zustandswechsel der Seite; `knopf` = ausdrücklicher Knopfdruck;
 * `navigation` = Seitenwechsel; `dauer` = Schleife einer Produkt- oder Prozesszeichnung unter der Startbedingung
 * (lib/motion/dauer.ts).
 */
export type Ausloeser =
  | 'auftakt'
  | 'nachlauf'
  | 'sicht'
  | 'hover'
  | 'druck'
  | 'tippen'
  | 'zustand'
  | 'knopf'
  | 'navigation'
  | 'dauer';
/** Einmalige Abläufe mit eigenem Zeitfenster (E-031). */
export type FensterAusloeser = 'nachlauf' | 'sicht';
/** Wo die Bewegung vorkommen darf (K-011): Signatur nur auf Erzählseiten. */
export type Seitenart = 'erzaehlseiten' | 'alle';

/** Schleife einer Dauerbewegung (E-029): Periode, immer pausierbar und nur im Sichtfeld. */
export interface Schleife {
  /** Dauer eines Durchgangs in ms (≥ 400, Vielfache des halben Takts). */
  periodeMs: number;
  pausierbar: true;
  nurSichtbar: true;
}

/** Zeitplan eines einmaligen Ablaufs ab seinem Auslöser (E-031). */
export interface Fenster {
  /** Verzögerungen in Takten, streng steigend (je Band bzw. Teil). */
  verzoegerungTakte: readonly number[];
  /** Ende des letzten Teils in ms ab dem Auslöser. */
  endeMs: number;
}

/**
 * Zeitplan der Wärmefront (Kennung `seitenwechsel`, E-031; Owner-Feedback 16.10.2026: sanfter Wärmeschleier statt
 * Blitz), in ms ab dem Klick bzw. wie angegeben.
 */
export interface Wechsel {
  /**
   * Vorlauf: Die Schichten stehen in der Startgröße als eigene Ebenen und blenden ein, bevor sie wachsen (Prüfrunde 4
   * A4-3, C4-1: gerastert, bevor sie groß werden; kein Antritt am Anfang).
   */
  vorlaufMs: number;
  /** Die Seitenfarbe deckt das Fenster: Erst dann wechselt die Seite (router.push). */
  wechselMs: number;
  /** Der Wärmeschleier wächst vom Klickpunkt bis über die fernste Ecke (k-wechsel), zuletzt deckt die Seitenfarbe. */
  abdeckenMs: number;
  /** Ruht die neue Seite, verblasst die Front, und der Hauptinhalt steigt ein Stück an seinen Platz („warme Luft steigt“). */
  aufdeckenMs: number;
  /** Spätestens so lange nach dem Wechsel-Auftrag wird aufgedeckt, auch ohne neuen Pfad (langsames Netz). */
  haltenMs: number;
  /**
   * Höchstens so lange nach dem neuen Pfad wartet die Front auf die Ruhe der neuen Seite (Prüfrunde 3 C3-1; Prüfrunde 5
   * C5-2: nachladende Bereiche wartet sie nicht ab).
   */
  ruheMs: number;
}

/**
 * Die drei Ringe der Wärmefront (Kennung `seitenwechsel`; Owner-Feedback 16.10.2026 (2): die ungleichmäßig
 * nachziehenden Ringe von Runde 1 auf dem Schleier), von außen nach innen, je Ring gleich lang wie die anderen Listen.
 */
export interface Ringe {
  /** Ab dem Klick: Einblenden (d-1) und Wachsen nach √t beginnen gemeinsam, in Takten, streng steigend. */
  verzoegerungTakte: readonly number[];
  /** Dauer des Wachsens nach √t in ganzen Takten (die Ausnahme von d-1…d-4), nach innen kürzer. */
  dauerTakte: readonly number[];
  /** Deckkraft (der Schleier scheint durch), nach innen dichter. */
  deckkraft: readonly number[];
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
  /**
   * Ende in ms ab dem Auslöser: beim Auftakt ab Aufruf (≤ AUFTAKT_ENDE_MS), bei `nachlauf` und `sicht` das späteste
   * Ende der Fenster, bei `tippen` ab dem Klick.
   */
  endeMs?: number;
  /** Nur mit Auslöser `nachlauf` oder `sicht` (E-031): Zeitplan je Auslöser; `verzoegerungTakte` ist ihre Vereinigung. */
  fenster?: Readonly<Partial<Record<FensterAusloeser, Fenster>>>;
  /** Nur `seitenwechsel` (E-031): Zeitplan der Wärmefront. */
  wechsel?: Readonly<Wechsel>;
  /** Nur `seitenwechsel` (Owner-Feedback 16.10.2026 (2)): die Ringe der Wärmefront. */
  ringe?: Readonly<Ringe>;
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

/**
 * Nachlauf (E-031): Die Wärme im Hero beginnt nach 7 Takten, wenn der Vorlauf den Heizkörper erreicht hat (Ende von
 * `vorlauf-haus`, 560 ms), und endet spätestens nach 1.920 ms, also vor dem 2-s-Sicherheitsnetz des Kopfskripts.
 */
export const NACHLAUF_START_TAKTE = 7;
export const NACHLAUF_ENDE_MS = 1920;
/**
 * Sicht-Auftritt (E-031, Prüfrunde 3 C3-3): Der Ablauf startet, wenn der Bereich sichtbar ist und seine Bilder dekodiert
 * sind, spätestens SICHT_WARTEN_MS nach dem Sichtbarwerden (lib/motion/ablauf.ts ABLAUF_BILD_NETZ_MS, Prüfrunde 2
 * C2-5), und endet spätestens SICHT_ENDE_MS nach dem Start, also höchstens 3.900 ms nach dem Sichtbarwerden. Ohne
 * Bilder oder mit geladenen Bildern beginnt er mit dem Sichtbarwerden.
 */
export const SICHT_WARTEN_MS = 1500;
export const SICHT_ENDE_MS = 2400;
/**
 * Klick-Wärme (E-031; Owner-Feedback 16.10.2026): Der innere Ring steht nach d-2, dann verklingen alle (ein Takt + d-3),
 * Ende 720 ms nach dem Klick.
 */
export const KLICK_ENDE_MS = 720;
/**
 * Wärmefront (E-031; Owner-Feedback 16.10.2026, „viel zu schnell … erschreckend“; ersetzt Prüfrunde 4 A4-2; Ringe nach
 * dem zweiten Feedback, FRONT_RINGE): Die zwei Schichten des Schleiers blenden ab dem Klick ½ Takt versetzt ein (d-1:
 * Der Klick antwortet sofort sichtbar) und wachsen nach einem Takt Vorlauf (d-4, k-wechsel), die Ringe darauf nach √t,
 * nach 5½ Takten blendet die Seitenfarbe ein (d-2) und deckt nach 680 ms, wenn das Wachsen des Schleiers endet: Wechsel. Aufgedeckt wird, sobald die neue Seite ruht, höchstens 320 ms nach dem neuen Pfad und spätestens 1.200 ms
 * nach dem Wechsel: ein Takt + d-3 = 480 ms. Ohne Warten: Klick bis Front zu 1.160 ms; mit dem Einsetzen der neuen
 * Seite (Desktop rund 60–90 ms) und der Ruhe (vier Bilder) rund 1,2–1,3 s.
 */
export const WECHSEL: Readonly<Wechsel> = Object.freeze({ vorlaufMs: 80, wechselMs: 680, abdeckenMs: 680, aufdeckenMs: 480, haltenMs: 1200, ruheMs: 320 });
/**
 * Ringe der Wärmefront (Owner-Feedback 16.10.2026 (2), E-031; nachgeschärft nach dem Art Director: so kräftig und so
 * früh wie Runde 1): Auf dem Schleier liegen drei Ringe, --waerme-2 mit ½ und ¾, innen --waerme-4 mit 0,95 (der Lachston
 * von Runde 1). Jeder blendet nach 1, 1½ bzw. 2 Takten ein (d-1) und steht nach 200, 240 und 280 ms voll, mindestens
 * 160 ms bevor die Seitenfarbe einblendet; ab demselben Moment wächst er nach √t (6, 5 bzw. 4 Takte, also 480, 400 und
 * 320 ms). So starten sie versetzt, enden verschieden (560, 520, 480 ms), und die inneren ziehen ungleichmäßig nach; dann
 * stehen sie, bis die Seitenfarbe deckt.
 */
export const FRONT_RINGE: Readonly<Ringe> = Object.freeze({
  verzoegerungTakte: Object.freeze([1, 1.5, 2]),
  dauerTakte: Object.freeze([6, 5, 4]),
  deckkraft: Object.freeze([0.5, 0.75, 0.95]),
});
/**
 * Diffusionsgesetz r ∝ √t (E-031): Stützstellen [Zeitanteil, Fortschritt] mit Fortschritt = √Zeitanteil. Jeder
 * Keyframe-Ablauf mit `scale` steht genau auf diesen Stellen (linear dazwischen), monoton, ohne Überschwingen; der
 * Wert an Stelle i ist Start + Fortschritt_i × (Ende − Start). Für das Wärmefeld und die Ringe der Wärmefront (sie
 * blenden dabei ein, so bleibt der Antritt zart); Schleier und Seitenfarbe der Front wachsen seit dem Owner-Feedback vom
 * 16.10.2026 ruhig mit k-wechsel, die Klick-Wärme skaliert nicht mehr.
 */
export const DIFFUSION_STUETZ: readonly (readonly [number, number])[] = Object.freeze([
  Object.freeze([0, 0] as const),
  Object.freeze([0.0625, 0.25] as const),
  Object.freeze([0.25, 0.5] as const),
  Object.freeze([0.5625, 0.75] as const),
  Object.freeze([1, 1] as const),
]);

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
      'Signatur der Ortsseiten (E-028, Lageplan seit E-029): Im Seitenkopf zeichnet sich einmal die Verbindung vom ' +
      'Firmensitz zum Ort, danach die Maßkette der Messung (keine Leitungen: Rohr nur, wo Wasser fließt).',
    ausloeser: ['auftakt'],
    eigenschaften: ['stroke-dashoffset'],
    dauer: ['d-3'],
    verzoegerungTakte: [4, 7],
    kurve: ['k-wechsel'],
    reduziert: 'Verbindung und Maßkette stehen vollständig zwischen Firmensitz und Ort.',
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
    zweck:
      'Wärmefront (E-031; Owner-Feedback 16.10.2026: sanfter Wärmeschleier statt Blitz, danach die Ringe von Runde 1 ' +
      'darauf): Beim Klick auf einen Link zu einer Erzählseite legt sich vom Klickpunkt aus ein zarter, durchscheinender ' +
      'Wärmeschleier über die Seite. Er beginnt nicht als Punkt, sondern bei 15 % der Fensterdiagonale, blendet sofort ein ' +
      'und wächst nach einem Takt ruhig (k-wechsel) bis über die fernste Ecke. Gleich darauf ziehen drei warme Ringe ' +
      'ungleichmäßig nach, kräftig wie in Runde 1: je versetzt eingeblendet, wachsen sie nach √t, verschieden lang, nach ' +
      'innen wärmer und dichter, das heißeste zuletzt und innen – wie Wärmeleitung von einer Quelle, ohne kalten Kern. ' +
      'Sie kommen im Fenster zur Ruhe, ' +
      'außen bleibt der Schleier. Zuletzt blendet die Seitenfarbe ein und deckt; erst dann wechselt die Seite. Die Wärme ' +
      'ist durchgezogen, nie steht eine einfarbige Pfirsichfläche. Ruht die neue Seite, verblasst die Front als Ganzes, ' +
      'und der Hauptinhalt (<main>) taucht auf und steigt ein Stück an seinen Platz. Nachladende Bereiche wartet sie ' +
      'nicht ab, sie setzen ihren Inhalt nach der Front ein. Eine dauerhafte Überlagerung (Popover), kein ' +
      'View-Übergang.',
    ausloeser: ['navigation'],
    eigenschaften: ['transform', 'opacity'],
    // Wachsen des Schleiers d-4, Aufdecken d-3 (Front und Hauptinhalt), Einblenden der Seitenfarbe d-2, von Schleier und
    // Ringen d-1 (waermefront.module.css); die Ringe wachsen ganze Takte (FRONT_RINGE)
    dauer: ['d-4', 'd-3', 'd-2', 'd-1'],
    // Einblenden je Schicht: Schleier ab dem Klick, die Ringe nach 1, 1½, 2 Takten, die Seitenfarbe nach 5½ Takten
    verzoegerungTakte: [0, 0.5, 1, 1.5, 2, 5.5],
    // Schleier und Seitenfarbe wachsen mit k-wechsel; Einblenden und das Wachsen der Ringe nach √t linear
    kurve: ['k-wechsel', 'linear'],
    reduziert: 'Kein Übergang: die Seite wechselt sofort.',
    seitenart: 'erzaehlseiten',
    wechsel: WECHSEL,
    ringe: FRONT_RINGE,
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
      'Wasser fließt (Prozesszeichnung, E-029): Auf Vorlauf und Rücklauf wandert ein Strichmuster in Fließrichtung, ' +
      'je gerades Leitungsstück eine eigene HTML-Ebene über der Zeichnung, verschoben per transform (Compositor, ' +
      'Prüfung E-029 Befund 10); die Stücke folgen dem Pfad in Fließrichtung, so stimmt die Richtung von selbst.',
    ausloeser: ['dauer'],
    eigenschaften: ['transform'],
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
      'Kreis Verdampfer → Verdichter → Plattenwärmeübertrager → Expansionsventil; wie beim Wasser je gerades Stück ' +
      'eine eigene HTML-Ebene, verschoben per transform.',
    ausloeser: ['dauer'],
    eigenschaften: ['transform'],
    dauer: [],
    verzoegerungTakte: [0],
    kurve: ['linear'],
    reduziert: 'Standbild: der Kreis mit festen Fließpfeilen und den Etiketten Heißgas, flüssig, Sauggas.',
    seitenart: 'erzaehlseiten',
    schleife: { periodeMs: 960, pausierbar: true, nurSichtbar: true },
  },
  'waerme-breitet-sich-aus': {
    zweck:
      'Die Wärme verteilt sich im Raum (E-031): Die Bänder 1–4 des berechneten Wärmefelds (lib/zeichnung/szenen/' +
      'waermefeld.ts) erscheinen nach √t, das heißeste zuerst; Band 0 (der ganze Raum) steht still. Erst steigt die ' +
      'Fahne senkrecht (scaleY) aus der Oberkante des Heizkörpers, dann blendet die Deckenschicht an Ort und Stelle ein ' +
      '(nur Deckkraft), in keinem Zwischenstand kühlere über wärmerer Luft (Prüfrunde 4 B4-2); mit Fußbodenheizung ' +
      'wächst die warme Schicht aus dem Boden. Im Hero als Nachlauf, wenn der Vorlauf den Heizkörper erreicht hat, auf ' +
      'der Wärmepumpen-Seite beim Sichtbarwerden.',
    ausloeser: ['nachlauf', 'sicht'],
    eigenschaften: ['transform', 'opacity'],
    dauer: ['d-4'],
    verzoegerungTakte: [0, 0.5, 7, 8, 11, 13, 16.5, 22],
    kurve: ['linear'],
    reduziert: 'Endzustand: das Wärmefeld steht.',
    seitenart: 'erzaehlseiten',
    endeMs: 2360,
    fenster: {
      nachlauf: { verzoegerungTakte: [7, 8, 13, 16.5], endeMs: 1920 },
      sicht: { verzoegerungTakte: [0, 0.5, 11, 22], endeMs: 2360 },
    },
  },
  'buero-ablauf': {
    zweck:
      'Büro und Verwaltung (E-031): Die Szenen der Themenseite laufen einmal beim Sichtbarwerden ab – Blöcke gleiten in ' +
      'den Wochenplan, Zeilen schreiben sich auf das Blatt, Pakete wandern, Ordner gleiten in die Ablage.',
    ausloeser: ['sicht'],
    eigenschaften: ['transform', 'opacity'],
    dauer: ['d-3', 'd-4'],
    // Aus den Szenen (lib/zeichnung/buero, je Gruppe `ablauf`): Zeilen je ½ Takt, Termine je 1½ Takte, Pakete,
    // Ordner, Brief und Blatt; zuletzt das Häkchen an der Rechnung (14 Takte + d-3 = 1.520 ms). buero.test hält es gleich.
    verzoegerungTakte: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 7.5, 9, 11.5, 13, 14],
    kurve: ['k-aus'],
    reduziert: 'Endzustand: Plan, Blatt, Lieferung, Ablage stehen.',
    seitenart: 'erzaehlseiten',
    endeMs: 1520,
    fenster: { sicht: { verzoegerungTakte: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 7.5, 9, 11.5, 13, 14], endeMs: 1520 } },
  },
  'klick-waerme': {
    zweck:
      'Rückmeldung beim Klick (E-031; Owner-Feedback 16.10.2026: zart, nichts Plötzliches): Um die Box des ' +
      'Bedienelements stehen drei Wärmeringe im Abstand von 8, 16 und 24 px, der heißeste innen, nach außen kühler und ' +
      'durchsichtiger wie die Schichten der Front. Sie blenden je ½ Takt versetzt ein (d-2 linear, der äußere zuerst), ' +
      'und steht er, verklingen alle gemeinsam (d-3 mit k-wechsel nach einem Takt; Ausnahme vom Ausgang d-1 mit k-ein: ' +
      'ein Verklingen, kein Abgang); kein Wachsen. Ringe ohne Fläche und außerhalb der Box, damit die Beschriftung frei ' +
      'bleibt (Prüfrunde 5 A5-4). Nur an Bedienelementen, nicht in Formularen, nicht auf /bewerbung und nicht auf dem ' +
      'Weg dorthin.',
    ausloeser: ['tippen'],
    eigenschaften: ['opacity'],
    // Eingang (Einblenden je Ring) d-2, Ausgang (Verklingen der Überlagerung) d-3 – beide aus waermefront.module.css
    dauer: ['d-2', 'd-3'],
    verzoegerungTakte: [0, 0.5, 1],
    kurve: ['linear', 'k-wechsel'],
    reduziert: 'Keine Welle; der Klick wirkt sofort.',
    seitenart: 'alle',
    endeMs: 720,
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
  return Math.max(0, ...entry.dauer.map((token) => DAUER_MS[token]));
}

/** Spätester Start eines Eintrags in ms (größte Verzögerung × Takt). */
export function maxVerzoegerungMs(entry: MotionEntry): number {
  return Math.max(0, ...entry.verzoegerungTakte) * TAKT_MS;
}
