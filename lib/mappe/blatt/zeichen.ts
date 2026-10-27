import type { MappeDokument } from './dokument';

/**
 * Zeichen der PDF-Schrift (Atkinson Hyperlegible Next, statische Schnitte in lib/mappe/schriften): Eine PDF zeichnet nur,
 * was die eingebettete Schrift kennt; fehlende Zeichen erschienen als leere Kästchen. Darum vor dem Setzen:
 * gleichwertige Zeichen tauschen (weiches Trennzeichen, schmale Leerzeichen, Sonder-Bindestriche), Emojis weglassen, und
 * wenn danach noch etwas fehlt (etwa kyrillische oder arabische Schrift), keine PDF – die Mail zeigt den Text ohnehin.
 * Die Bereiche stammen aus der Zeichentabelle beider Dateien (lib/mappe/__tests__/zeichen.test.ts prüft sie dagegen).
 * Client-sicher, ohne Abhängigkeiten.
 */

/** Zeichen beider Schnitte (gleich), als Bereiche [von, bis] (Unicode). */
export const SCHRIFT_BEREICHE: readonly (readonly [number, number])[] = [
  [0x20, 0x7e], [0xa0, 0xac], [0xae, 0xb4], [0xb6, 0x107], [0x10a, 0x113], [0x116, 0x11b], [0x11e, 0x123],
  [0x126, 0x127], [0x12a, 0x12b], [0x12e, 0x133], [0x136, 0x137], [0x139, 0x13e], [0x141, 0x148], [0x150, 0x155],
  [0x158, 0x15b], [0x15e, 0x165], [0x16a, 0x16b], [0x16e, 0x17e], [0x192, 0x192], [0x218, 0x21b], [0x237, 0x237],
  [0x2c6, 0x2c7], [0x2c9, 0x2c9], [0x2d8, 0x2dd], [0x300, 0x304], [0x306, 0x308], [0x30a, 0x30c], [0x312, 0x312],
  [0x326, 0x328], [0x394, 0x394], [0x3a9, 0x3a9], [0x3bc, 0x3bc], [0x3c0, 0x3c0], [0x1e80, 0x1e85], [0x1e9e, 0x1e9e],
  [0x1ef2, 0x1ef3], [0x2009, 0x2009], [0x2013, 0x2014], [0x2018, 0x201a], [0x201c, 0x201e], [0x2020, 0x2022],
  [0x2026, 0x2026], [0x2030, 0x2030], [0x2039, 0x203a], [0x2044, 0x2044], [0x20ac, 0x20ac], [0x20b9, 0x20b9],
  [0x2113, 0x2113], [0x2122, 0x2122], [0x212e, 0x212e], [0x2202, 0x2202], [0x220f, 0x220f], [0x2211, 0x2212],
  [0x2215, 0x2215], [0x2219, 0x221a], [0x221e, 0x221e], [0x222b, 0x222b], [0x2248, 0x2248], [0x2260, 0x2260],
  [0x2264, 0x2265], [0x25ca, 0x25ca], [0x266a, 0x266a],
];

/**
 * Zeichen der Titelschrift für „Markant“ (Bricolage Grotesque fett, lib/mappe/schriften/bricolage-grotesque-700.ttf):
 * Name und Überschriften. Fehlt dem Namen ein Zeichen (etwa Ţ), setzt die PDF ihn sachlich (Atkinson).
 */
export const TITEL_BEREICHE: readonly (readonly [number, number])[] = [
  [0x20, 0x7e], [0xa0, 0xa3], [0xa5, 0xac], [0xae, 0x107], [0x10a, 0x113], [0x116, 0x11b], [0x11e, 0x123],
  [0x126, 0x12b], [0x12e, 0x133], [0x136, 0x137], [0x139, 0x13e], [0x141, 0x148], [0x14a, 0x14d], [0x150, 0x15b],
  [0x15e, 0x161], [0x164, 0x165], [0x168, 0x17e], [0x1a0, 0x1a1], [0x1af, 0x1b0], [0x1cd, 0x1ce], [0x218, 0x21b],
  [0x237, 0x237], [0x2c6, 0x2c7], [0x2d8, 0x2dd], [0x300, 0x304], [0x306, 0x30c], [0x312, 0x312], [0x31b, 0x31b],
  [0x323, 0x323], [0x326, 0x328], [0x3c0, 0x3c0], [0xe3f, 0xe3f], [0x1e80, 0x1e85], [0x1e9e, 0x1e9e],
  [0x1ea0, 0x1ef9], [0x2000, 0x200b], [0x2013, 0x2014], [0x2016, 0x2016], [0x2018, 0x201a], [0x201c, 0x201e],
  [0x2020, 0x2022], [0x2026, 0x2026], [0x202f, 0x2030], [0x2032, 0x2033], [0x2039, 0x203a], [0x2044, 0x2044],
  [0x2070, 0x2070], [0x2074, 0x2079], [0x2080, 0x2089], [0x20a1, 0x20a1], [0x20a4, 0x20a4], [0x20a6, 0x20a6],
  [0x20a8, 0x20a9], [0x20ab, 0x20ae], [0x20b1, 0x20b2], [0x20b4, 0x20b5], [0x20b8, 0x20ba], [0x20bc, 0x20bf],
  [0x2113, 0x2113], [0x2116, 0x2116], [0x2122, 0x2122], [0x2126, 0x2126], [0x212e, 0x212e], [0x2153, 0x2154],
  [0x215b, 0x215e], [0x2190, 0x2193], [0x2202, 0x2202], [0x2205, 0x2206], [0x220f, 0x220f], [0x2211, 0x2212],
  [0x221a, 0x221a], [0x221e, 0x221e], [0x222b, 0x222b], [0x2248, 0x2248], [0x2260, 0x2260], [0x2264, 0x2265],
  [0x27e8, 0x27e9],
];

/** Gleichwertiger Ersatz für Zeichen, die oft aus Word, Handy-Tastaturen oder Kopien kommen. */
const ERSATZ: Record<string, string> = {
  '\u00ad': '', // weiches Trennzeichen
  '\u00b5': '\u03bc', // Mikro → griechisches My (gleiches Bild)
  '\u2010': '-', // Bindestrich
  '\u2011': '-', // geschützter Bindestrich
  '\u2012': '\u2013', // Ziffernstrich → Halbgeviertstrich
  '\u2015': '\u2014', // Horizontalstrich → Geviertstrich
  '\u2032': "'", // Minutenzeichen
  '\u2033': '"', // Sekundenzeichen
  '\u2027': '\u00b7', // Silbentrennpunkt → Mittelpunkt
};
/** Tabulator (aus Word kopiert) und Leerzeichen anderer Breite (ohne das schmale U+2009, das die Schrift hat) → Leerzeichen. */
const LEERZEICHEN = /[\t\u2000-\u2008\u200a\u202f\u205f\u3000]/g;
/** Unsichtbare Zeichen (Breite null, Wortverbinder, BOM). */
const UNSICHTBAR = /[\u200b-\u200d\u2060\ufeff]/g;
/**
 * Emojis samt Hautton, Flaggenbuchstaben, Varianten-Wählern und Tastenkappe: ein Brief ohne sie bleibt derselbe. Was die
 * Schrift selbst hat (©, ®, ™, ♪ gehören auch zu Extended_Pictographic), bleibt stehen.
 */
const EMOJI = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\ufe0e\ufe0f\u20e3]/gu;

/** Steuerzeichen außer dem Zeilenumbruch (Tabs und Windows-Zeilenenden sind vorher ersetzt). */
function ohneSteuerzeichen(text: string): string {
  return [...text].filter((zeichen) => zeichen === '\n' || (zeichen.charCodeAt(0) >= 0x20 && zeichen !== '\u007f')).join('');
}

/**
 * Text für die PDF-Schrift: zusammengesetzte Umlaute (macOS) zu einem Zeichen, Windows-Zeilenenden, Ersatz wie oben,
 * doppelte Leerzeichen und Leerzeichen am Zeilenrand weg.
 */
export function fuerSchrift(text: string): string {
  const ersetzt = text
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(EMOJI, (zeichen) => (gedeckt(zeichen.codePointAt(0)!) ? zeichen : ''))
    .replace(UNSICHTBAR, '')
    .replace(LEERZEICHEN, ' ');
  return ohneSteuerzeichen(ersetzt)
    .replace(/./gu, (zeichen) => ERSATZ[zeichen] ?? zeichen)
    .replace(/ {2,}/g, ' ')
    .replace(/^ +| +$/gm, '');
}

function gedeckt(codepoint: number, bereiche: readonly (readonly [number, number])[] = SCHRIFT_BEREICHE): boolean {
  return bereiche.some(([von, bis]) => codepoint >= von && codepoint <= bis);
}

/** Kann die Titelschrift („Markant“) diesen Text zeichnen? */
export function titelschriftDeckt(text: string): boolean {
  return [...text].every((zeichen) => gedeckt(zeichen.codePointAt(0)!, TITEL_BEREICHE));
}

/** Zeichen, die die Schrift nicht zeichnen kann (Zeilenumbruch und Tab zählen nicht), je einmal in Reihenfolge. */
export function fehlendeZeichen(text: string): string[] {
  const fehlend = new Set<string>();
  for (const zeichen of text) {
    if (zeichen === '\n' || zeichen === '\r' || zeichen === '\t') continue;
    if (!gedeckt(zeichen.codePointAt(0)!)) fehlend.add(zeichen);
  }
  return [...fehlend];
}

/**
 * Dokument für die PDF: jeder Text durch fuerSchrift; was dabei leer wird (ein Schwerpunkt nur aus Emojis), fällt weg wie
 * vorher die leeren Angaben, ein leerer Name wird null („Bewerbungsmappe“ im Kopf), ein leerer Brief oder Lebenslauf
 * bekommt kein Blatt. null, wenn danach ein Zeichen fehlt (dann keine PDF, damit nie ein Kästchen statt eines
 * Buchstabens im Namen oder im Brief steht).
 */
export function fuerPdf(dokument: MappeDokument): MappeDokument | null {
  // Einzeilige Angaben bleiben einzeilig (Umbrüche → Leerzeichen), im Brief höchstens eine Leerzeile in Folge: Das hält
  // den Satz in den Grenzen des Schemas (Prüfrunde L2: 6000 Umbrüche ergaben 228 Seiten und 6 s Rechenzeit)
  const t = (text: string) => fuerSchrift(text).replace(/\s*\n\s*/g, ' ').trim();
  const liste = (werte: readonly string[]) => werte.map(t).filter(Boolean);
  const name = dokument.name === null ? null : t(dokument.name) || null;
  const text = dokument.anschreiben ? fuerSchrift(dokument.anschreiben.text).replace(/\n{3,}/g, '\n\n').trim() : '';
  const lauf = dokument.lebenslauf;
  const beruf = (lauf?.beruf ?? [])
    .map((station) => ({ zeit: t(station.zeit), titel: t(station.titel), ort: t(station.ort), aufgaben: liste(station.aufgaben) }))
    .filter((station) => station.zeit || station.titel || station.ort || station.aufgaben.length > 0);
  const ausbildung = (lauf?.ausbildung ?? [])
    .map((station) => ({ zeit: t(station.zeit), titel: t(station.titel), ort: t(station.ort) }))
    .filter((station) => station.zeit || station.titel || station.ort);
  const schwerpunkte = liste(lauf?.schwerpunkte ?? []);
  const sauber: MappeDokument = {
    ...dokument,
    // Wird der Name erst hier leer, nennt der Titel wie bei einer nachgereichten Mappe den Betreff
    titel: name === null && dokument.name !== null ? t(dokument.betreff) : t(dokument.titel),
    name,
    betreff: t(dokument.betreff),
    datum: t(dokument.datum),
    anschreiben: dokument.anschreiben && text ? { empfaenger: liste(dokument.anschreiben.empfaenger), text } : null,
    lebenslauf: beruf.length + ausbildung.length + schwerpunkte.length > 0 ? { beruf, ausbildung, schwerpunkte } : null,
    // „Markant“ nur, wenn die Titelschrift den Namen zeichnen kann; sonst sachlich statt eines Kästchens
    design:
      dokument.design.schrift === 'markant' && name !== null && !titelschriftDeckt(name)
        ? { ...dokument.design, schrift: 'sachlich' }
        : dokument.design,
  };
  return texte(sauber).every((eintrag) => fehlendeZeichen(eintrag).length === 0) ? sauber : null;
}

/** Alle Texte eines Dokuments, die auf dem Blatt stehen. */
export function texte(dokument: MappeDokument): string[] {
  const { anschreiben, lebenslauf } = dokument;
  return [
    dokument.titel,
    dokument.name ?? '',
    dokument.betreff,
    dokument.datum,
    ...(anschreiben ? [...anschreiben.empfaenger, anschreiben.text] : []),
    ...(lebenslauf
      ? [
          ...lebenslauf.beruf.flatMap((station) => [station.zeit, station.titel, station.ort, ...station.aufgaben]),
          ...lebenslauf.ausbildung.flatMap((station) => [station.zeit, station.titel, station.ort]),
          ...lebenslauf.schwerpunkte,
        ]
      : []),
  ];
}
