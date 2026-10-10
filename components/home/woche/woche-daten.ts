import { FACTS } from '@/lib/content/facts';

/**
 * Arbeitswoche als Heizkreisverteiler (Variante 1 `.woche`, B Runde 1 `figure.woche`).
 *
 * Die Zeiten kommen nur aus dem Faktenregister: `workingHours` (Mo–Do 07:00–16:45, Fr 07:00–13:30),
 * `friday1330` (Freitag endet um 13:30) und `noWeekendOnCall` (Sa/So ohne Kreis). Ändert sich ein Fakt,
 * zieht die Zeichnung mit; widersprechen sich die Fakten, bricht der Build statt eine falsche Woche zu
 * zeichnen. Eine Wochenarbeitszeit ist nicht belegt und wird nicht gezeigt.
 */

export const TAG_KUERZEL = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
export type TagKuerzel = (typeof TAG_KUERZEL)[number];

const TAG_NAME: Readonly<Record<TagKuerzel, string>> = {
  Mo: 'Montag',
  Di: 'Dienstag',
  Mi: 'Mittwoch',
  Do: 'Donnerstag',
  Fr: 'Freitag',
  Sa: 'Samstag',
  So: 'Sonntag',
};

export interface Arbeitstag {
  kuerzel: TagKuerzel;
  name: string;
  /** Uhrzeit wie im Fakt, z. B. '07:00'. */
  von: string;
  bis: string;
  /** Dezimalstunden, z. B. 16.75 für 16:45. */
  vonStunde: number;
  bisStunde: number;
}

const ZEIT = String.raw`(\d{2}):(\d{2})`;
const TAG = TAG_KUERZEL.join('|');
const ABSCHNITT = new RegExp(`(${TAG})(?:–(${TAG}))?\\s+${ZEIT}–${ZEIT}`, 'g');

const stunde = (h: string, m: string) => Number(h) + Number(m) / 60;

/**
 * Liest Angaben wie „Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr“ in Wochentage.
 * Tagesbereiche (Mo–Do) werden aufgefaltet; die Reihenfolge folgt der Woche.
 */
export function parseArbeitszeiten(text: string): Arbeitstag[] {
  const tage: Arbeitstag[] = [];
  for (const m of text.matchAll(ABSCHNITT)) {
    const [, start, ende, vh, vm, bh, bm] = m;
    const i0 = TAG_KUERZEL.indexOf(start as TagKuerzel);
    const i1 = ende ? TAG_KUERZEL.indexOf(ende as TagKuerzel) : i0;
    if (i1 < i0) throw new Error(`Arbeitszeiten: Tagesbereich „${m[0]}“ läuft rückwärts`);
    for (let i = i0; i <= i1; i++) {
      const kuerzel = TAG_KUERZEL[i];
      if (tage.some((t) => t.kuerzel === kuerzel)) throw new Error(`Arbeitszeiten: ${kuerzel} doppelt`);
      tage.push({
        kuerzel,
        name: TAG_NAME[kuerzel],
        von: `${vh}:${vm}`,
        bis: `${bh}:${bm}`,
        vonStunde: stunde(vh, vm),
        bisStunde: stunde(bh, bm),
      });
    }
  }
  if (tage.length === 0) throw new Error(`Arbeitszeiten: keine Angabe in „${text}“`);
  return tage.sort((a, b) => TAG_KUERZEL.indexOf(a.kuerzel) - TAG_KUERZEL.indexOf(b.kuerzel));
}

/** „Montag bis Donnerstag von 07:00 bis 16:45 Uhr, Freitag von 07:00 bis 13:30 Uhr“ (gleiche Zeiten zusammengefasst). */
export function beschreibeWoche(tage: readonly Arbeitstag[]): string {
  const gruppen: Arbeitstag[][] = [];
  for (const tag of tage) {
    const letzte = gruppen.at(-1);
    const vorher = letzte?.at(-1);
    const folgt = vorher && TAG_KUERZEL.indexOf(tag.kuerzel) === TAG_KUERZEL.indexOf(vorher.kuerzel) + 1;
    if (letzte && vorher && folgt && vorher.von === tag.von && vorher.bis === tag.bis) letzte.push(tag);
    else gruppen.push([tag]);
  }
  return gruppen
    .map((g) => {
      const erster = g[0];
      const tageText = g.length > 1 ? `${erster.name} bis ${g[g.length - 1].name}` : erster.name;
      return `${tageText} von ${erster.von} bis ${erster.bis} Uhr`;
    })
    .join(', ');
}

export const ARBEITSTAGE: readonly Arbeitstag[] = Object.freeze(parseArbeitszeiten(FACTS.workingHours.short));

/** Tage ohne Arbeitszeit (Sa, So): ohne Kreis, mit „Kein Wochenend-Notdienst“. */
export const FREIE_TAGE: readonly TagKuerzel[] = Object.freeze(
  TAG_KUERZEL.filter((k) => !ARBEITSTAGE.some((t) => t.kuerzel === k)),
);

const freitag = ARBEITSTAGE.find((t) => t.kuerzel === 'Fr');
if (!freitag || freitag.bis !== FACTS.friday1330.value) {
  throw new Error(`Fakten widersprechen sich: workingHours (Fr bis ${freitag?.bis}) ≠ friday1330 (${FACTS.friday1330.value})`);
}
if (new Set(ARBEITSTAGE.map((t) => t.von)).size !== 1) {
  // Der Verteiler steht auf dem gemeinsamen Arbeitsbeginn; unterschiedliche Anfänge bräuchten eine andere Zeichnung.
  throw new Error('Arbeitszeiten: Die Zeichnung setzt einen gemeinsamen Arbeitsbeginn voraus');
}

/** Freitag: der kürzeste Kreis, das Hauptmaß der Woche. */
export const FEIERABEND_FREITAG: Arbeitstag = freitag;

/**
 * Zeitachse der Zeichnung: eine Stunde Luft vor dem Arbeitsbeginn und nach dem spätesten Feierabend
 * (Variante 1: 06–18 Uhr), Striche alle drei Stunden ab Arbeitsbeginn (07 · 10 · 13 · 16).
 */
const beginn = ARBEITSTAGE[0].vonStunde;
const spaetestens = Math.max(...ARBEITSTAGE.map((t) => t.bisStunde));
export const ACHSE = Object.freeze({
  von: Math.floor(beginn) - 1,
  bis: Math.ceil(spaetestens) + 1,
  striche: Object.freeze(
    Array.from({ length: Math.floor((spaetestens - beginn) / 3) + 1 }, (_, i) => beginn + i * 3),
  ),
});

/** Anteil (0–1) einer Uhrzeit auf der Achse. */
export function anteil(stunde: number): number {
  return (stunde - ACHSE.von) / (ACHSE.bis - ACHSE.von);
}

/** Lage auf der Spur als SVG-Prozentwert (die Spur ist das SVG selbst, ohne viewBox). */
export function prozent(stunde: number): string {
  return `${Number((anteil(stunde) * 100).toFixed(4))}%`;
}

/** Achsbeschriftung „07“, „10“ … */
export const stundeKurz = (stunde: number) => String(Math.floor(stunde)).padStart(2, '0');

/**
 * Maße der Zeichnung in px (das SVG hat keine viewBox: eine Einheit = 1 px, Text und Strich skalieren
 * nicht mit der Breite). Abhängigkeiten von den Tokens (S-05), bei Änderung nachziehen:
 * spalte/rechts = --a-8 (Tagesspalte 48 + Lücke 16 wie Variante 1), reihe = --a-8, kopf/achse = --a-7,
 * paar = --paar, bogenInnen/-Aussen = --r-2/--r-3, kreis = halbe Kreishöhe = --r-2, strich = --m-strich.
 * Die Ränder links und rechts setzt WeekSection mit px-16 (= spalte/rechts).
 */
export const MASS = Object.freeze({
  spalte: 64,
  rechts: 64,
  kopf: 48,
  reihe: 64,
  achse: 48,
  paar: 12,
  bogenInnen: 12,
  bogenAussen: 24,
  kreis: 12,
  strich: 3,
  /** Lücke im Rücklauf-Verteiler, wo der Vorlauf kreuzt (Brücke, Schaltplan-Regel): 3 Striche. */
  bruecke: 9,
  /** Abstand der Endmaße vom Bogen. */
  mass: 12,
  /** Weit genug nach links, um aus jedem Satzspiegel bis an den Seitenrand zu reichen (der Abschnitt schneidet ab). */
  zulauf: 4000,
});

/** Mitte der Reihe i (0 = Montag). */
export const reihenMitte = (i: number) => MASS.kopf + i * MASS.reihe + MASS.reihe / 2;

/** Gesamthöhe: Zulauf, fünf Arbeitstage, eine Reihe Wochenende, Achse. */
export const PLAN_HOEHE = MASS.kopf + (ARBEITSTAGE.length + (FREIE_TAGE.length > 0 ? 1 : 0)) * MASS.reihe + MASS.achse;

/** Texte des Abschnitts, alle aus dem Faktenregister. */
export const WOCHE_TEXT = Object.freeze({
  /** „Freitags ab 13:30 Uhr Feierabend“ (friday1330.short, Variante 1). */
  titel: FACTS.friday1330.short,
  /** „Feste Arbeitszeiten: Montag bis Donnerstag von 07:00 bis 16:45 Uhr, Freitag von 07:00 bis 13:30 Uhr.“ */
  einleitung: FACTS.workingHours.long,
  /** Titel der Zeichnung (B Runde 1). */
  bildTitel: 'Arbeitszeit der Woche',
  /** Beschreibung der Zeichnung für Screenreader: dieselben Zeiten, aus den gelesenen Tagen gebaut. */
  bildText: `${beschreibeWoche(ARBEITSTAGE)}. ${FREIE_TAGE.map((k) => TAG_NAME[k]).join(' und ')}: ${FACTS.noWeekendOnCall.short}.`,
  /** „Sa, So“ */
  freieTage: FREIE_TAGE.join(', '),
  wochenende: FACTS.noWeekendOnCall.short,
});
