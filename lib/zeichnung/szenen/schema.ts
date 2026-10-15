/**
 * Gemeinsame Bausteine der Fließschemata (Anlagenschema, Kältekreis): Symbole mit Lage und Leitungen in
 * Fließrichtung. Ein Schema ist kein Maßstab (Schriftfeld: „Fließschema · Symbole nach DIN EN ISO 10628-2“);
 * Symbole sind gleich groß (Vergrößerung `massstab`), Leitungen biegen mit Radius.
 */
import { anschlussPunkt, SYMBOLE, type Lage, type SymbolId } from '../symbole';
import { fliesspfeil, leitungsStrecken, leitungsweg, r1, type Medium, type Punkt, type Strecke } from '../norm';

export interface SchemaSymbol {
  /** Kennung im Schema (für Legende und Prüfung). */
  key: string;
  id: SymbolId;
  lage: Lage;
  /** Beschriftung neben dem Symbol (Versalien), nur auf breiten Flächen sichtbar. */
  text?: { wert: string; x: number; y: number; anker: 'start' | 'middle' | 'end' };
}

export interface SchemaLeitung {
  key: string;
  medium: Medium;
  punkte: readonly Punkt[];
  d: string;
  /** Etikett am Weg (Kältemittel: Heißgas, flüssig, Nassdampf, Sauggas). */
  etikett?: { wert: string; x: number; y: number; anker: 'start' | 'middle' | 'end' };
}

export interface SchemaPfeil {
  medium: Medium;
  d: string;
  /** Spitze des Pfeils: Um sie wächst er je Breite der Fläche (technik.module.css, --pfeil). */
  spitze: Punkt;
  /** Richtung (Einheitsvektor), in die er zeigt: Fließrichtung. */
  nach: Punkt;
}

export const SCHEMA_BOGEN = 12;

export function symbol(key: string, id: SymbolId, lage: Lage, text?: SchemaSymbol['text']): SchemaSymbol {
  return text ? { key, id, lage, text } : { key, id, lage };
}

export function leitung(key: string, medium: Medium, punkte: Punkt[], etikett?: SchemaLeitung['etikett']): SchemaLeitung {
  const out: SchemaLeitung = { key, medium, punkte, d: leitungsweg(punkte, SCHEMA_BOGEN) };
  return etikett ? { ...out, etikett } : out;
}

/**
 * Fließpfeil der Schemata in Grundgröße (13 lang, 12 breit, Einheiten). Gezeichnet wächst er je Breite der Fläche um
 * seine Spitze (Faktor --pfeil in technik.module.css), damit er im Standbild auch am Handy mindestens 10 px lang und
 * 9 px breit ist, das Dreifache der Leitung (Prüfung E-029, Runde 2, Befund 6).
 */
export const PFEIL_GRUNDMASS = Object.freeze({ laenge: 13, breite: 12 });

export function pfeil(medium: Medium, spitze: Punkt, nach: Punkt): SchemaPfeil {
  const l = Math.hypot(nach.x, nach.y);
  return { medium, d: fliesspfeil(spitze, nach, PFEIL_GRUNDMASS.laenge, PFEIL_GRUNDMASS.breite), spitze, nach: { x: nach.x / l, y: nach.y / l } };
}

/**
 * Strichmuster der Dauerbewegung (Register `wasser-fliesst`, `kaeltemittel-fliesst`) in Einheiten der Zeichnung,
 * abgeleitet aus ihrer Breite: bei rund 350 px Darstellungsbreite (Handy) ein Strich von 4 px Länge alle 16 px wie
 * vor der Prüfung E-029. `rand` ist die halbe Höhe des Ausschnitts je Stück (rund 2 px), Platz für den 1-px-Strich.
 */
export function flussMuster(breite: number): { periode: number; strich: number; rand: number } {
  const periode = r1((breite * 16) / 350);
  return { periode, strich: r1(periode / 4), rand: r1(breite / 175) };
}

/**
 * Rechteck in Einheiten der Zeichnung, in dem das Strichmuster der Dauerbewegung aussetzt: Dort liegt über der Leitung
 * ein Symbol, ein fester Fließpfeil oder die Wanddurchführung (Prüfung E-029, Runde 3: Die Fluss-Ebene liegt als
 * HTML über der ganzen Zeichnung, ihre Striche schnitten sonst durch Armaturen, Pumpen und Pfeile).
 */
export interface FlussSperre {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Was dort liegt (Kennung des Symbols, `pfeil`, `wanddurchfuehrung`), für Prüfung und Fehlermeldungen. */
  grund: string;
}

/** Fläche eines Symbols (halbe Breite und Höhe mal Vergrößerung, gedreht) um `rand` erweitert. */
export function symbolSperre(s: SchemaSymbol, rand: number): FlussSperre {
  const { halb } = SYMBOLE[s.id];
  const m = s.lage.massstab ?? 1;
  const quer = Math.abs((s.lage.drehung ?? 0) % 180) === 90;
  const hx = (quer ? halb.y : halb.x) * m + rand;
  const hy = (quer ? halb.x : halb.y) * m + rand;
  return { x0: r1(s.lage.x - hx), y0: r1(s.lage.y - hy), x1: r1(s.lage.x + hx), y1: r1(s.lage.y + hy), grund: s.key };
}

/**
 * Fläche eines festen Fließpfeils in der größten Stufe (`faktor` = --pfeil der schmalsten Fläche, technik.module.css):
 * von der Spitze eine Pfeillänge zurück, eine Pfeilbreite quer, um `rand` erweitert. Kleinere Stufen liegen darin.
 */
export function pfeilSperre(p: SchemaPfeil, faktor: number, rand: number): FlussSperre {
  const l = PFEIL_GRUNDMASS.laenge * faktor;
  const b = (PFEIL_GRUNDMASS.breite * faktor) / 2;
  const basis = { x: p.spitze.x - p.nach.x * l, y: p.spitze.y - p.nach.y * l };
  const quer = { x: -p.nach.y * b, y: p.nach.x * b };
  const xs = [p.spitze.x, basis.x + quer.x, basis.x - quer.x];
  const ys = [p.spitze.y, basis.y + quer.y, basis.y - quer.y];
  return {
    x0: r1(Math.min(...xs) - rand),
    y0: r1(Math.min(...ys) - rand),
    x1: r1(Math.max(...xs) + rand),
    y1: r1(Math.max(...ys) + rand),
    grund: 'pfeil',
  };
}

/**
 * Alle Sperren eines Schemas: jedes Symbol, jeder feste Fließpfeil in der größten Stufe und weitere Flächen (etwa die
 * Wanddurchführung), je um den Rand des Strichmusters erweitert (flussMuster: rund 2 px), damit die Striche sichtbar
 * vor der Kontur enden.
 */
export function flussSperren({
  breite,
  symbole,
  pfeile,
  pfeilFaktor,
  flaechen = [],
}: {
  /** Breite der Zeichnung in Einheiten (wie flussMuster). */
  breite: number;
  symbole: readonly SchemaSymbol[];
  pfeile: readonly SchemaPfeil[];
  pfeilFaktor: number;
  flaechen?: ReadonlyArray<{ x: number; y: number; breite: number; hoehe: number; grund: string }>;
}): FlussSperre[] {
  const { rand } = flussMuster(breite);
  return [
    ...symbole.map((x) => symbolSperre(x, rand)),
    ...pfeile.map((x) => pfeilSperre(x, pfeilFaktor, rand)),
    ...flaechen.map((f) => ({ x0: r1(f.x - rand), y0: r1(f.y - rand), x1: r1(f.x + f.breite + rand), y1: r1(f.y + f.hoehe + rand), grund: f.grund })),
  ];
}

/** Abschnitt [t0, t1] eines geraden Stücks (t = Weg ab `von`), der im Rechteck liegt, oder null. */
function abschnittIn(von: Punkt, u: Punkt, laenge: number, k: FlussSperre): [number, number] | null {
  let t0 = 0;
  let t1 = laenge;
  for (const [d, lo, hi, q] of [
    [u.x, k.x0, k.x1, von.x],
    [u.y, k.y0, k.y1, von.y],
  ] as const) {
    if (Math.abs(d) < 1e-9) {
      if (q < lo || q > hi) return null;
    } else {
      const a = (lo - q) / d;
      const b = (hi - q) / d;
      t0 = Math.max(t0, Math.min(a, b));
      t1 = Math.min(t1, Math.max(a, b));
    }
  }
  return t1 > t0 ? [t0, t1] : null;
}

/**
 * Die geraden Stücke einer Leitung, über die das Strichmuster wandert (Bögen ohne Muster), ohne die Abschnitte unter
 * den `sperren`; Reste kürzer als `mindest` entfallen. Jedes Teilstück behält seine Weglänge ab dem Anfang der Leitung
 * (`anfang`), so laufen die Striche über Lücken und Ecken im Takt weiter.
 */
export function flussStrecken(l: SchemaLeitung, sperren: readonly FlussSperre[] = [], mindest = 0): Strecke[] {
  const out: Strecke[] = [];
  for (const s of leitungsStrecken(l.punkte, SCHEMA_BOGEN)) {
    const u = { x: (s.bis.x - s.von.x) / s.laenge, y: (s.bis.y - s.von.y) / s.laenge };
    const belegt = sperren
      .map((k) => abschnittIn(s.von, u, s.laenge, k))
      .filter((a): a is [number, number] => a !== null)
      .sort((a, b) => a[0] - b[0]);
    const teil = (a: number, b: number): Strecke => ({
      von: { x: r1(s.von.x + u.x * a), y: r1(s.von.y + u.y * a) },
      bis: { x: r1(s.von.x + u.x * b), y: r1(s.von.y + u.y * b) },
      laenge: b - a,
      winkel: s.winkel,
      anfang: s.anfang + a,
    });
    let t = 0;
    for (const [a, b] of belegt) {
      if (a - t > Math.max(mindest, 1e-6)) out.push(teil(t, a));
      t = Math.max(t, b);
    }
    if (s.laenge - t > Math.max(mindest, 1e-6)) out.push(teil(t, s.laenge));
  }
  return out;
}

/**
 * Striche eines geraden Stücks in seinen eigenen Koordinaten (x in Fließrichtung ab dem Anfang des Stücks, y = 0 auf
 * der Leitung). Die Striche beginnen eine Periode vor dem Anfang und reichen bis zum Ende: Um eine Periode
 * verschoben, deckt das Muster das Stück immer ganz, und Anfang und Ende der Bewegung sehen gleich aus. Die Lage im
 * Muster richtet sich nach der Weglänge (`anfang`), so laufen die Striche über die Ecken im Takt weiter.
 */
export function flussStriche(s: Strecke, muster: { periode: number; strich: number }): string {
  const { periode, strich } = muster;
  const versatz = s.anfang % periode;
  let d = '';
  for (let x = -versatz - periode; x < s.laenge; x += periode) d += `M${r1(x)} 0h${strich}`;
  return d;
}

/** Anschluss eines Symbols aus der Liste (wirft, wenn es fehlt). */
export function an(symbole: readonly SchemaSymbol[], key: string, anschluss: string): Punkt {
  const s = symbole.find((x) => x.key === key);
  if (!s) throw new Error(`schema: Symbol ${key} fehlt`);
  return anschlussPunkt(s.id, anschluss, s.lage);
}
