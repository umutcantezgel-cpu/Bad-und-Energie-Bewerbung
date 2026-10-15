/**
 * Bausteine der Büro-Zeichnungsfamilie (E-031, Paket W3): eine Szene ist eine Liste von Gruppen aus Pfaden mit
 * Linienart, dazu die Lage der Beschriftungen (die Wörter stehen als HTML über der Zeichnung, lib/themen/text.ts).
 * Dieselben Daten zeichnen die Themenseite (components/themen/buero, inline, mit einmaligem Ablauf) und die Dateien
 * der Stellenseite (lib/zeichnung/buero/svg.ts, still). Linienarten wie die technischen Zeichnungen (KERN K-010,
 * lib/zeichnung/norm.ts): Kontur stumpf mit runden Ecken, feine und Maßlinien stumpf und spitz; keine Leitung, keine
 * Rohrfarbe, nichts fließt. Wärme nur als Fläche (`warm1` … `warm3`, Rollen --waerme-1…3 im Wärmebereich).
 */
import { r1 } from '../norm';

/** Linienart und Fläche eines Pfads. */
export type Art =
  /** Kontur 2 px, Fläche der Umgebung (Papier). */
  | 'kontur'
  /** Kontur 2 px ohne Fläche. */
  | 'konturOffen'
  /** Feine Linie 1 px. */
  | 'fein'
  /** Maß- und Bezugslinie 1 px. */
  | 'mass'
  /** Gefüllt in der Markenrolle, ohne Strich (Punkte der Bezugslinien, Pfeilspitzen). */
  | 'voll'
  /** Kontur 2 px auf einer Stufe der Wärmerampe. */
  | 'warm1'
  | 'warm2'
  | 'warm3';

export const ARTEN: readonly Art[] = ['kontur', 'konturOffen', 'fein', 'mass', 'voll', 'warm1', 'warm2', 'warm3'];

export interface Strich {
  d: string;
  art: Art;
}

/**
 * Einmaliger Ablauf einer Gruppe beim Sichtbarwerden (Register `buero-ablauf`, Auslöser `sicht`): `ein` gleitet aus
 * dem Versatz (x, y in Einheiten der Zeichnung) und blendet auf, `schreiben` zieht eine Zeile von links auf (scaleX).
 * Endzustand ist immer die Lage in den Daten.
 */
export interface Ablauf {
  art: 'ein' | 'schreiben';
  /** Verzögerung in Takten (--takt), halbe Takte erlaubt. */
  takte: number;
  dauer: 'd-3' | 'd-4';
  x?: number;
  y?: number;
}

export interface Gruppe {
  id: string;
  teile: readonly Strich[];
  /** Feste Lage einer Gruppe (Glyphen im Raster 24 × 24): `translate(x y) scale(s)`. */
  lage?: { x: number; y: number; s: number };
  ablauf?: Ablauf;
}

/** Lage einer Beschriftung über der Zeichnung (Einheiten des Rahmens); Anker wie text-anchor, Mitte der Zeile auf y. */
export interface Beschriftung {
  id: string;
  x: number;
  y: number;
  anker: 'start' | 'middle' | 'end';
}

export type BueroSzeneId = 'leitstelle' | 'wochenplan' | 'beleg' | 'material' | 'ablage';

export interface BueroSzene {
  id: BueroSzeneId;
  rahmen: { breite: number; hoehe: number };
  /** Maßstab der Zeichnung in mm je Einheit; null bei Szenen ohne Maßstab (Plantafel). */
  mmJeEinheit: number | null;
  gruppen: readonly Gruppe[];
  beschriftungen: readonly Beschriftung[];
}

// ─── Formen ─────────────────────────────────────────────────────────────────

const z = (n: number) => String(r1(n));

/** Rechteck als geschlossener Pfad. */
export function rechteck(x: number, y: number, b: number, h: number): string {
  return `M${z(x)} ${z(y)}H${z(x + b)}V${z(y + h)}H${z(x)}Z`;
}

/** Rechteck mit runden Ecken (Radius r) als geschlossener Pfad. */
export function rundRechteck(x: number, y: number, b: number, h: number, r: number): string {
  const q = Math.min(r, b / 2, h / 2);
  const bogen = (zx: number, zy: number) => `A${z(q)} ${z(q)} 0 0 1 ${z(zx)} ${z(zy)}`;
  return (
    `M${z(x + q)} ${z(y)}H${z(x + b - q)}${bogen(x + b, y + q)}V${z(y + h - q)}${bogen(x + b - q, y + h)}` +
    `H${z(x + q)}${bogen(x, y + h - q)}V${z(y + q)}${bogen(x + q, y)}Z`
  );
}

/** Strecke. */
export function strecke(x1: number, y1: number, x2: number, y2: number): string {
  return `M${z(x1)} ${z(y1)}L${z(x2)} ${z(y2)}`;
}

/** Waagerechte Strecke. */
export function waagerecht(x1: number, x2: number, y: number): string {
  return `M${z(x1)} ${z(y)}H${z(x2)}`;
}

/** Senkrechte Strecke. */
export function senkrecht(x: number, y1: number, y2: number): string {
  return `M${z(x)} ${z(y1)}V${z(y2)}`;
}

/** Kreis als Pfad aus zwei Bögen. */
export function kreis(cx: number, cy: number, r: number): string {
  return `M${z(cx - r)} ${z(cy)}A${z(r)} ${z(r)} 0 1 0 ${z(cx + r)} ${z(cy)}A${z(r)} ${z(r)} 0 1 0 ${z(cx - r)} ${z(cy)}Z`;
}

/** Häkchen in einem Kästchen der Kantenlänge k (oben links x, y), Schenkel unter 45°. */
export function haken(x: number, y: number, k: number): string {
  return `M${z(x + k * 0.22)} ${z(y + k * 0.52)}L${z(x + k * 0.42)} ${z(y + k * 0.72)}L${z(x + k * 0.8)} ${z(y + k * 0.32)}`;
}

/** Giebelhaus von vorn: Wände, Dach unter 45° mit Überstand, Tür. Der Giebel ist halb so hoch wie das Haus breit. */
export function giebelhaus(x: number, unten: number, breite: number, wandHoehe: number): { waende: string; dach: string; tuer: string } {
  const traufe = unten - wandHoehe;
  const halb = breite / 2;
  const ueber = breite * 0.1;
  return {
    waende: rechteck(x, traufe, breite, wandHoehe),
    dach: `M${z(x - ueber)} ${z(traufe + ueber)}L${z(x + halb)} ${z(traufe - halb)}L${z(x + breite + ueber)} ${z(traufe + ueber)}`,
    tuer: rechteck(x + breite * 0.2, unten - wandHoehe * 0.5, breite * 0.22, wandHoehe * 0.5),
  };
}

/** Alle Pfade einer Szene in Zeichenreihenfolge (Prüfungen: Inline und Datei gleich). */
export function pfadeVon(szene: BueroSzene): string[] {
  return szene.gruppen.flatMap((g) => g.teile.map((t) => t.d));
}

/** Die Verzögerungen (Takte) aller Abläufe einer Szene, aufsteigend, je einmal. */
export function takteVon(szene: BueroSzene): number[] {
  return [...new Set(szene.gruppen.flatMap((g) => (g.ablauf ? [g.ablauf.takte] : [])))].sort((a, b) => a - b);
}
