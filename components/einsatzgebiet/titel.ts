/**
 * h1 der lokalen Seiten (E-028): Der Name (Ort, Kreis, „Einsatzgebiet“) steht in Bildgröße, der Rest der h1 kleiner
 * davor bzw. dahinter. Die Bildgröße passt sich dem längsten nicht umbrechbaren Stück des Namens an, damit lange
 * Namen („Münchholzhausen“, „Grävenwiesbach“) bei 320 px nicht über die Spalte laufen und nicht mitten im Wort
 * brechen (KERN K-005, Z-13, wie app/fonts/__tests__/display.test.ts).
 *
 * Breiten gemessen, nicht geschätzt: Chromium 141, Bricolage Grotesque 800 (app/fonts, latin + latin-ext),
 * letter-spacing −0,01 em, opsz auto, je Zeichen als Mittel aus zehn Wiederholungen bei 40 px, in em. Bei 40 px ist
 * die Schrift relativ am breitesten (die opsz-Achse macht sie mit der Größe schmaler), die Summe liegt also auf der
 * sicheren Seite; gemessene Wörter weichen höchstens 1,4 % nach unten ab (components/einsatzgebiet/__tests__).
 */
export const BRICOLAGE_800_EM: Readonly<Record<string, number>> = Object.freeze({
  a: 0.5668, b: 0.615, c: 0.551, d: 0.616, e: 0.5646, f: 0.397, g: 0.578, h: 0.607, i: 0.259, j: 0.2667, k: 0.575,
  l: 0.257, m: 0.92, n: 0.607, o: 0.588, p: 0.6156, q: 0.615, r: 0.421, s: 0.5344, t: 0.39, u: 0.6, v: 0.5708,
  w: 0.8648, x: 0.5726, y: 0.5766, z: 0.5136, ä: 0.5668, ö: 0.5904, ü: 0.6, ß: 0.664,
  A: 0.694, B: 0.655, C: 0.658, D: 0.6668, E: 0.593, F: 0.562, G: 0.694, H: 0.69, I: 0.274, J: 0.3479, K: 0.664,
  L: 0.483, M: 0.903, N: 0.749, O: 0.695, P: 0.6212, Q: 0.7106, R: 0.655, S: 0.6316, T: 0.576, U: 0.6906,
  V: 0.6683, W: 0.9898, X: 0.6849, Y: 0.6454, Z: 0.5727, Ä: 0.694, Ö: 0.695, Ü: 0.6906,
  '-': 0.334, '(': 0.281, ')': 0.281, ':': 0.248, '.': 0.2418, ',': 0.196,
});

/** Unbekannte Zeichen zählen wie das breiteste Kleinzeichen (m). */
const UNBEKANNT_EM = 0.92;

/** Breite eines Stücks in em (Bricolage 800, 40 px). */
export function breiteEm(text: string): number {
  return [...text].reduce((summe, zeichen) => summe + (BRICOLAGE_800_EM[zeichen] ?? UNBEKANNT_EM), 0);
}

/**
 * Längstes Stück, das nicht umbrechen kann: Wörter trennen an Leerzeichen, Bindestrich-Namen nach dem Strich
 * („Limburg-“ / „Weilburg“), wie es der Browser tut.
 */
export function breitestesStueckEm(text: string): number {
  const stuecke = text.split(/\s+/).flatMap((wort) => wort.split(/(?<=-)/));
  return Math.max(0, ...stuecke.map(breiteEm));
}

/** Etwas Luft für Ersatzschrift und Rundung: Das Stück füllt die Spalte höchstens zu 96 %. */
export const SPALTEN_ANTEIL = 0.96;

export interface Titelteile {
  /** Text vor dem Namen, z. B. „SHK-Jobs für“; null, wenn die h1 mit dem Namen beginnt. */
  vor: string | null;
  /** Der Name in Bildgröße. */
  haupt: string;
  /** Text nach dem Namen, z. B. „und seine Stadtteile: dein Weg zum Firmensitz“. */
  nach: string | null;
  /** Breitestes Stück des Namens in em (für die Größe). */
  stueckEm: number;
}

/**
 * Teilt die h1 am Namen. `${vor} ${haupt} ${nach}` ergibt wieder die h1 (Metadaten, Gate U8 und JSON-LD hängen am
 * Wortlaut); fehlt der Name, steht die ganze h1 in Bildgröße.
 */
export function titelTeilen(h1: string, name: string): Titelteile {
  const at = h1.indexOf(name);
  if (at < 0) return { vor: null, haupt: h1, nach: null, stueckEm: breitestesStueckEm(h1) };
  const vor = h1.slice(0, at).trim();
  const nach = h1.slice(at + name.length).trim();
  return { vor: vor || null, haupt: name, nach: nach || null, stueckEm: breitestesStueckEm(name) };
}
