/**
 * Technische Zeichnung 2.0 (KERN K-010, E-029): Linienarten, Maßstab und Maßlinien als Daten.
 *
 * Grundlage DIN EN ISO 128-2 (Linienarten), an den Bildschirm angepasst: feste Strichstärken in px (CSS-Tokens in
 * app/styles/theme.css, Spiegel in lib/tokens), alle mit `vector-effect: non-scaling-stroke`. In Zeichnungen sind alle
 * Enden stumpf, Konturen haben spitze Ecken, Leitungen biegen mit Radius; runde Enden nur bei Bedienzeichen.
 * Maßlinien nach DIN 406-11 mit 45°-Begrenzungsstrichen, Maßzahl über der Linie, lesbar von unten oder von rechts.
 *
 * Reines Modul ohne React: Website (components/zeichnung/technik), Hausschnitt (lib/zeichnung/szenen) und
 * Teilen-Bilder (lib/seo/og-render.tsx) rechnen mit denselben Helfern. Prüfung: lib/zeichnung/__tests__/zeichnung-daten.test.ts.
 */
import { TOKENS } from '@/lib/tokens';

export type LinienartId = 'leitung' | 'kontur' | 'fein' | 'mass' | 'verdeckt' | 'mittellinie' | 'icon';

export interface Linienart {
  /** Strichstärke in px bei jeder Größe (non-scaling-stroke). */
  px: number;
  /** stroke-linecap: stumpf in Zeichnungen, rund nur für Bedienzeichen. */
  enden: 'butt' | 'round';
  /** stroke-linejoin: Konturen spitz, Leitungen und Bedienzeichen rund (Bögen mit Radius). */
  ecken: 'miter' | 'round';
  /** Strichmuster in px (stroke-dasharray) oder null für Volllinien. */
  muster: readonly number[] | null;
  /** CSS-Token der Stärke. */
  token: string;
  /** Wofür die Linienart steht (KERN K-010). */
  verwendung: string;
}

const L = TOKENS.linien;

export const LINIENARTEN: Readonly<Record<LinienartId, Linienart>> = {
  leitung: {
    px: L.leitung,
    enden: 'butt',
    ecken: 'round',
    muster: null,
    token: '--m-leitung',
    verwendung: 'Vorlauf, Rücklauf, Kältemittel; Bögen mit Radius',
  },
  kontur: { px: L.kontur, enden: 'butt', ecken: 'miter', muster: null, token: '--m-kontur', verwendung: 'Gehäuse, Wände, Geräte' },
  fein: { px: L.fein, enden: 'butt', ecken: 'miter', muster: null, token: '--m-fein', verwendung: 'Gitter, Lamellen, Fugen, Schraffur' },
  mass: { px: L.mass, enden: 'butt', ecken: 'miter', muster: null, token: '--m-mass', verwendung: 'Maß- und Hinweislinien' },
  verdeckt: {
    px: L.verdeckt,
    enden: 'butt',
    ecken: 'miter',
    muster: L.verdecktMuster,
    token: '--m-verdeckt',
    verwendung: 'Verdeckte Kanten, z. B. Verdampfer hinter der Front',
  },
  mittellinie: {
    px: L.mittellinie,
    enden: 'butt',
    ecken: 'miter',
    muster: L.mittellinieMuster,
    token: '--m-mittellinie',
    verwendung: 'Mittellinien und Achsen, z. B. Lüfterachse; Systemgrenzen',
  },
  icon: { px: L.icon, enden: 'round', ecken: 'round', muster: null, token: '--m-icon', verwendung: 'Nur Bedienzeichen (Icons, Knöpfe)' },
};

/** Linienarten, die in Zeichnungen vorkommen dürfen (alle stumpf); `icon` gehört nur zu Bedienzeichen. */
export const ZEICHNUNG_LINIEN: readonly LinienartId[] = ['leitung', 'kontur', 'fein', 'mass', 'verdeckt', 'mittellinie'];

/** Maßstab als Daten (K-010): Millimeter je Einheit. Gerätezeichnung 1 Einheit = 1 mm, Hausschnitt 1 Einheit = 10 mm. */
export const MASSSTAB = Object.freeze({ geraet: 1, haus: 10 });

/** Schriftfeld jeder maßstäblichen Zeichnung (Martian Mono, K-010). */
export const SCHRIFTFELD = 'Maße in mm · maßstäblich gezeichnet';

/** Schriftfeld eines Fließschemas: Normsymbole, ohne Maßstab. */
export const SCHRIFTFELD_SCHEMA = 'Fließschema · Symbole nach DIN EN ISO 10628-2';

/** Rollen der Leitungen (K-006, K-003.2): Vorlauf rot, Rücklauf blau, Kältemittel Navy mit Etikett. */
export type Medium = 'vorlauf' | 'ruecklauf' | 'kaeltemittel';

export interface Punkt {
  x: number;
  y: number;
}

/** Auf eine Nachkommastelle runden (kurze Pfade, stabile Prüfungen). */
export function r1(wert: number): number {
  const r = Math.round(wert * 10) / 10;
  return Object.is(r, -0) ? 0 : r;
}

const p = (q: Punkt) => `${r1(q.x)} ${r1(q.y)}`;

/** Einheitsvektor von a nach b. */
function richtung(a: Punkt, b: Punkt): Punkt {
  const laenge = Math.hypot(b.x - a.x, b.y - a.y);
  if (laenge === 0) throw new Error('norm: Strecke ohne Länge');
  return { x: (b.x - a.x) / laenge, y: (b.y - a.y) / laenge };
}

/** Vektor um `grad` drehen (Bildschirmkoordinaten, y nach unten; positiv = im Uhrzeigersinn). */
export function drehen(v: Punkt, grad: number): Punkt {
  const w = (grad * Math.PI) / 180;
  return { x: v.x * Math.cos(w) - v.y * Math.sin(w), y: v.x * Math.sin(w) + v.y * Math.cos(w) };
}

/**
 * Leitungsweg mit Bögen (K-008: Leitungen biegen mit Radius): ein Linienzug durch `punkte`, jede Ecke als Kreisbogen
 * mit `radius` (bei kurzen Schenkeln kleiner). Der Weg läuft in der Reihenfolge der Punkte, also in Fließrichtung.
 */
export function leitungsweg(punkte: readonly Punkt[], radius: number): string {
  if (punkte.length < 2) throw new Error('norm: Leitungsweg braucht zwei Punkte');
  let d = `M${p(punkte[0])}`;
  for (let i = 1; i < punkte.length - 1; i += 1) {
    const [a, ecke, b] = [punkte[i - 1], punkte[i], punkte[i + 1]];
    const u1 = richtung(a, ecke);
    const u2 = richtung(ecke, b);
    const kreuz = u1.x * u2.y - u1.y * u2.x;
    const winkel = Math.acos(Math.max(-1, Math.min(1, u1.x * u2.x + u1.y * u2.y)));
    if (Math.abs(kreuz) < 1e-9 || winkel < 1e-6) {
      d += `L${p(ecke)}`;
      continue;
    }
    const schenkel = Math.min(Math.hypot(ecke.x - a.x, ecke.y - a.y), Math.hypot(b.x - ecke.x, b.y - ecke.y)) / 2;
    const tangente = Math.min(radius * Math.tan(winkel / 2), schenkel);
    const r = tangente / Math.tan(winkel / 2);
    const von = { x: ecke.x - u1.x * tangente, y: ecke.y - u1.y * tangente };
    const bis = { x: ecke.x + u2.x * tangente, y: ecke.y + u2.y * tangente };
    d += `L${p(von)}A${r1(r)} ${r1(r)} 0 0 ${kreuz > 0 ? 1 : 0} ${p(bis)}`;
  }
  return `${d}L${p(punkte[punkte.length - 1])}`;
}

/**
 * Fließpfeil (fest, auch im Standbild): gefülltes Dreieck mit der Spitze in `spitze`, zeigt in `richtung`
 * (Einheitsvektor oder beliebiger Vektor). Länge und Breite in Einheiten der Zeichnung.
 */
export function fliesspfeil(spitze: Punkt, nach: Punkt, laenge = 10, breite = 7): string {
  const u = richtung({ x: 0, y: 0 }, nach);
  const n = { x: -u.y, y: u.x };
  const basis = { x: spitze.x - u.x * laenge, y: spitze.y - u.y * laenge };
  const l = { x: basis.x + n.x * (breite / 2), y: basis.y + n.y * (breite / 2) };
  const r = { x: basis.x - n.x * (breite / 2), y: basis.y - n.y * (breite / 2) };
  return `M${p(spitze)}L${p(l)}L${p(r)}Z`;
}

export interface MasslinieOptionen {
  /** Messpunkte am Körper; die Maßlinie läuft parallel zur Strecke von → bis. */
  von: Punkt;
  bis: Punkt;
  /**
   * Abstand der Maßlinie vom Körper, senkrecht zur Strecke: positiv auf der Seite rechts der Laufrichtung (bei
   * von links nach rechts also unten, bei von unten nach oben rechts).
   */
  abstand: number;
  /** Maßzahl (ohne Einheit, die steht im Schriftfeld). */
  wert: string | number;
  /** Halbe Länge der 45°-Begrenzungsstriche. */
  strich?: number;
  /** Überstand der Maßhilfslinien über die Maßlinie hinaus. */
  ueberstand?: number;
  /** Abstand der Maßzahl von der Maßlinie (Mitte der Schrift). */
  schriftAbstand?: number;
  /** Lücke zwischen Körper und Maßhilfslinie (DIN 406: im Maschinenbau 0). */
  luecke?: number;
}

export interface Masslinie {
  /** Maßlinie mit den beiden Begrenzungsstrichen. */
  linie: string;
  /** Maßhilfslinien vom Körper bis über die Maßlinie. */
  hilfslinien: string;
  /** Lage und Drehung der Maßzahl (Mitte, Grad; 0 = waagerecht, −90 = von rechts lesbar). */
  text: Punkt & { wert: string; winkel: number };
  /** Endpunkte der Maßlinie (für Prüfungen und Ketten). */
  a: Punkt;
  b: Punkt;
}

/**
 * Maßlinie nach DIN 406-11 (Architektur- und Anlagenbau-Darstellung): Maßhilfslinien vom Körper, Maßlinie parallel
 * zur gemessenen Strecke, an beiden Enden ein Begrenzungsstrich unter 45° zur Maßlinie, die Maßzahl mittig über der
 * Linie. Waagerechte Maße liest man von unten, senkrechte von rechts; dafür läuft `von → bis` nach rechts bzw. oben.
 */
export function masslinie({ von, bis, abstand, wert, strich = 6, ueberstand = 6, schriftAbstand = 10, luecke = 0 }: MasslinieOptionen): Masslinie {
  const u = richtung(von, bis);
  // Rechts der Laufrichtung (y nach unten): Drehung um +90°
  const n = drehen(u, 90);
  const versatz = (q: Punkt, f: number) => ({ x: q.x + n.x * f, y: q.y + n.y * f });
  const a = versatz(von, abstand);
  const b = versatz(bis, abstand);
  const s = Math.sign(abstand) || 1;
  const hilf = (q: Punkt) => `M${p(versatz(q, luecke * s))}L${p(versatz(q, abstand + ueberstand * s))}`;
  // 45°-Begrenzungsstrich: von links unten nach rechts oben (bezogen auf die Leserichtung)
  const t = drehen(u, -45);
  const begrenzung = (q: Punkt) => `M${p({ x: q.x - t.x * strich, y: q.y - t.y * strich })}L${p({ x: q.x + t.x * strich, y: q.y + t.y * strich })}`;
  // Maßzahl über der Linie: links der Leserichtung (Drehung um −90°)
  const oben = drehen(u, -90);
  const mitte = { x: (a.x + b.x) / 2 + oben.x * schriftAbstand, y: (a.y + b.y) / 2 + oben.y * schriftAbstand };
  return {
    linie: `M${p(a)}L${p(b)}${begrenzung(a)}${begrenzung(b)}`,
    hilfslinien: `${hilf(von)}${hilf(bis)}`,
    text: { x: r1(mitte.x), y: r1(mitte.y), wert: String(wert), winkel: r1((Math.atan2(u.y, u.x) * 180) / Math.PI) },
    a: { x: r1(a.x), y: r1(a.y) },
    b: { x: r1(b.x), y: r1(b.y) },
  };
}

/** Schraffur (K-008): Erdreich und Schnittflächen unter 45° in der feinen Linie, Abstand in Einheiten der Zeichnung. */
export const SCHRAFFUR = Object.freeze({ winkel: 45, abstandHaus: 9, abstandSchema: 14 });

/**
 * 45°-Schraffur als einzelne Linien in einem Rechteck (von links unten nach rechts oben, am Rand abgeschnitten): ein
 * Pfad in der Linienart `fein` mit non-scaling-stroke, also 1 px bei jeder Größe (ein `<pattern>` skalierte mit).
 */
export function schraffurLinien(x0: number, y0: number, x1: number, y1: number, abstand: number): string {
  const h = y1 - y0;
  let d = '';
  for (let x = x0 - h + abstand / 2; x < x1; x += abstand) {
    const a = { x: Math.max(x, x0), y: y1 - Math.max(0, x0 - x) };
    const b = { x: Math.min(x + h, x1), y: y0 + Math.max(0, x + h - x1) };
    if (b.x - a.x > 0.5) d += `M${r1(a.x)} ${r1(a.y)}L${r1(b.x)} ${r1(b.y)}`;
  }
  return d;
}

/** Versalien für Etiketten an der Zeichnung (in SVG-Schrift statt text-transform, wie die Teilen-Bilder). */
export function versal(text: string): string {
  return text.toLocaleUpperCase('de-DE');
}

/** Ein geschätzter Wert trägt diese Marke (Geräte- und Szenenmodule): sichtbar in Prüfung und Abnahme (M-037). */
export const GESCHAETZT = 'geschaetzt' as const;
