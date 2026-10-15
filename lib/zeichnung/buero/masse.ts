/**
 * Maße der Büro-Zeichnungen (E-031, Paket W3, KERN K-010): jede Szene der Themenseite „Büro und Verwaltung“ und das
 * Kopfbild der Bürofachkraft rechnet mit diesen Werten, in mm. Genormte Formate nennen ihre Norm (`mass`), alles, was
 * im Betrieb nicht vermessen ist, steht als Schätzwert mit Grund (`schaetzung`, M-037): der Tisch, die Ordner, die
 * Kartons. Keine Marke, kein Modell, keine Software; die Zeichnungen zeigen Formate, keine Produkte.
 *
 * Quellen der Normwerte:
 * - ISO 216 (DIN EN ISO 216): Papierformat A4 210 × 297 mm, A-Reihe.
 * - DIN 5008 (Schreib- und Gestaltungsregeln, Geschäftsbrief Form B): Anschriftfeld 85 × 45 mm, 20 mm vom linken
 *   und 45 mm vom oberen Rand; Falzmarken 105 und 210 mm, Lochmarke 148,5 mm vom oberen Rand.
 * - DIN 678 (Briefhüllen, Formate): DIN lang 220 × 110 mm.
 * - DIN 680 (Fensterbriefhüllen, Formate und Lage der Fenster): Fenster 90 × 45 mm, 20 mm von links, 15 mm von unten
 *   (Prüfrunde 1 B1-7: vorher DIN 678 zugeschrieben).
 * - DIN EN 527-1 (Büro-Arbeitstische, Maße): Arbeitstisch fester Höhe 740 mm.
 * - EN 13698-1 (Herstellung von Flachpaletten aus Holz 800 × 1200 mm): 1200 × 800 × 144 mm.
 *
 * Geprüft in lib/zeichnung/buero/__tests__/buero.test.ts (Maßstabsverhältnisse der Szenen).
 */
import { mass, schaetzung, type Mass } from '../geraete/typen';

const NICHT_VERMESSEN = 'Im Betrieb nicht vermessen; übliches Maß gewählt';

export const BUERO_MASSE = Object.freeze({
  a4: Object.freeze({
    breite: mass(210, 'ISO 216: Format A4'),
    hoehe: mass(297, 'ISO 216: Format A4'),
  }),
  /** Geschäftsbrief nach DIN 5008, Form B (Lage auf dem Blatt A4, gemessen von der linken bzw. oberen Kante). */
  brief5008: Object.freeze({
    anschriftLinks: mass(20, 'DIN 5008, Form B: Anschriftfeld'),
    anschriftOben: mass(45, 'DIN 5008, Form B: Anschriftfeld'),
    anschriftBreite: mass(85, 'DIN 5008: Anschriftfeld'),
    anschriftHoehe: mass(45, 'DIN 5008: Anschriftfeld'),
    falzmarke1: mass(105, 'DIN 5008, Form B: Falzmarke'),
    falzmarke2: mass(210, 'DIN 5008, Form B: Falzmarke'),
    lochmarke: mass(148.5, 'DIN 5008: Lochmarke'),
  }),
  dinLang: Object.freeze({
    breite: mass(220, 'DIN 678: Briefhülle DIN lang'),
    hoehe: mass(110, 'DIN 678: Briefhülle DIN lang'),
    fensterBreite: mass(90, 'DIN 680: Fenster der Briefhülle DIN lang'),
    fensterHoehe: mass(45, 'DIN 680: Fenster der Briefhülle DIN lang'),
    fensterLinks: mass(20, 'DIN 680: Fenster der Briefhülle DIN lang'),
    fensterUnten: mass(15, 'DIN 680: Fenster der Briefhülle DIN lang'),
  }),
  schreibtisch: Object.freeze({
    breite: schaetzung(1600, `${NICHT_VERMESSEN}: Büro-Arbeitstisch 1600 × 800`),
    tiefe: schaetzung(800, `${NICHT_VERMESSEN}: Büro-Arbeitstisch 1600 × 800`),
    hoehe: mass(740, 'DIN EN 527-1: Arbeitstisch fester Höhe'),
  }),
  /** Ordner für A4 mit breitem Rücken, von vorn (Rücken) und liegend von oben. */
  ordner: Object.freeze({
    ruecken: schaetzung(80, `${NICHT_VERMESSEN}: Ordner für A4 mit breitem Rücken`),
    hoehe: schaetzung(318, `${NICHT_VERMESSEN}: Ordner für A4, Höhe des Rückens`),
    tiefe: schaetzung(285, `${NICHT_VERMESSEN}: Ordner für A4, Tiefe des Deckels`),
  }),
  europalette: Object.freeze({
    laenge: mass(1200, 'EN 13698-1: Flachpalette 800 × 1200'),
    breite: mass(800, 'EN 13698-1: Flachpalette 800 × 1200'),
    hoehe: mass(144, 'EN 13698-1: Flachpalette 800 × 1200'),
    /** Aufbau in der Seitenansicht (von oben): Deckbrett, Querbrett, Klotz, Bodenbrett; zusammen die Höhe 144. */
    brett: schaetzung(22, 'Dicke der Bretter der Europalette; nicht am Normtext geprüft'),
    klotz: schaetzung(78, 'Höhe der Klötze der Europalette (144 − 3 × 22); nicht am Normtext geprüft'),
    klotzBreite: schaetzung(145, 'Breite der Klötze in der Seitenansicht; nicht am Normtext geprüft'),
  }),
  karton: Object.freeze({
    laenge: schaetzung(600, `${NICHT_VERMESSEN}: Versandkarton`),
    hoehe: schaetzung(400, `${NICHT_VERMESSEN}: Versandkarton`),
  }),
} satisfies Record<string, Record<string, Mass>>);

/** Geschütztes Leerzeichen: hält Zahl und Einheit, Norm und Nummer, Maß und Malzeichen zusammen (Prüfrunde 1 A1-9). */
const NBSP = '\u00A0';

/** „210 × 297“: Maße mit Malzeichen wie in den Schriftfeldern, ungetrennt. */
export const masse = (...werte: readonly Mass[]): string => werte.map((w) => String(w.mm)).join(`${NBSP}×${NBSP}`);

/** „EN 13698-1“, „DIN 5008“, „ISO 216“: Norm und Nummer ungetrennt. */
const norm = (name: 'DIN' | 'EN' | 'ISO', nummer: string) => `${name}${NBSP}${nummer}`;

/** Teile eines Schriftfelds mit Trennpunkt; der Punkt bleibt am vorigen Wort, eine neue Zeile beginnt nie mit „·“. */
const feld = (...teile: readonly string[]) => teile.join(`${NBSP}· `);

/** „Maße in mm“ als Einheit: bricht nie in sich um (vorher „… MASSE IN / MM“). */
const IN_MM = `Maße${NBSP}in${NBSP}mm`;

/**
 * Schriftfeld jeder Szene (K-010): Format und Norm, Maße in mm. Steht als HTML unter der Zeichnung, in der Schrift der
 * Seite; Szenen ohne Maßstab (Wochenplan) sagen das, ebenso die Sinnbilder in maßstäblichen Szenen (Gebäude, Ziele der
 * Leitstelle; Prüfrunde 1 A1-4, B1-3).
 */
export const BUERO_SCHRIFTFELD = Object.freeze({
  leitstelle: feld(
    'Draufsicht',
    `Schreibtisch ${masse(BUERO_MASSE.schreibtisch.breite, BUERO_MASSE.schreibtisch.tiefe)}`,
    IN_MM,
    'Ziele als Sinnbild ohne Maßstab',
  ),
  wochenplan: feld('Plantafel', 'Montag bis Freitag', 'ohne Maßstab'),
  beleg: feld(
    `A4 ${masse(BUERO_MASSE.a4.breite, BUERO_MASSE.a4.hoehe)} nach ${norm('ISO', '216')}`,
    `Anschriftfeld, Falz- und Lochmarken nach ${norm('DIN', '5008')}`,
    IN_MM,
  ),
  material: feld(
    `Europalette ${masse(BUERO_MASSE.europalette.laenge, BUERO_MASSE.europalette.breite, BUERO_MASSE.europalette.hoehe)} nach ${norm('EN', '13698-1')}`,
    IN_MM,
    'Halle und Haus als Sinnbild ohne Maßstab',
  ),
  ablage: feld(
    `Ordnerrücken ${BUERO_MASSE.ordner.ruecken.mm}`,
    `Brief DIN lang ${masse(BUERO_MASSE.dinLang.breite, BUERO_MASSE.dinLang.hoehe)} nach ${norm('DIN', '678')}, Fenster nach ${norm('DIN', '680')}`,
    IN_MM,
  ),
});
