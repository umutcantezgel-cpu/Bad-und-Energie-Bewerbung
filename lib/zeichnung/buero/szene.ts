/**
 * Bausteine der Büro-Zeichnungsfamilie (E-031, Paket W3): eine Szene ist eine Liste von Gruppen aus Pfaden mit
 * Linienart, dazu die Lage der Beschriftungen (die Wörter stehen als HTML über der Zeichnung, lib/themen/text.ts).
 * Dieselben Daten zeichnen die Themenseite (components/themen/buero, inline, mit einmaligem Ablauf) und die Dateien
 * der Stellenseite (lib/zeichnung/buero/svg.ts, still). Linienarten wie die technischen Zeichnungen (KERN K-010,
 * lib/zeichnung/norm.ts): Kontur stumpf mit runden Ecken, feine und Maßlinien stumpf und spitz; keine Leitung, keine
 * Rohrfarbe, nichts fließt. Eine einzige Markierfläche (`markiert`, Rolle --markierung): Stufen der Wärmerampe trügen
 * hier keine Bedeutung und verwässerten die Temperatur der Wärmefelder (Prüfrunde 2 A2-9); die Rampe bleibt Temperatur
 * (Prüfrunde 4 A4-6).
 */
import type { CSSProperties } from 'react';
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
  /** Kontur 2 px auf der Markierfläche (Rolle --markierung): was die Szene hervorhebt. */
  | 'markiert';

export const ARTEN: readonly Art[] = ['kontur', 'konturOffen', 'fein', 'mass', 'voll', 'markiert'];

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
  /** Feste Lage einer Gruppe (Glyphen im Raster 24 × 24): `translate(x y) scale(s)`. Glyphen sind Sinnbilder. */
  lage?: { x: number; y: number; s: number };
  /**
   * Sinnbild ohne Maßstab in einer maßstäblichen Szene (Gebäude, ein Blatt über dem Lager): steht nicht auf derselben
   * Linie wie die maßstäblichen Teile, und das Schriftfeld der Szene sagt „ohne Maßstab“ (Prüfrunde 1 A1-4, B1-3;
   * Prüfrunde 2 B2-4).
   */
  sinnbild?: true;
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

/**
 * Haus als Glyphe im Raster 24 × 24 (Rand 2, Giebel 45°) wie die Familien-Icons: Wände 16 × 9, Dach mit Überstand,
 * Tür. Für Sinnbilder neben anderen Glyphen (Leitstelle: die Kunden).
 */
export const HAUS_GLYPHE = Object.freeze(giebelhaus(4, 21, 16, 9));

/**
 * Lage einer Beschriftung über dem Bild in Prozent des Rahmens, Anker wie text-anchor (Mitte der Zeile auf y). Für die
 * Inline-Zeichnung (components/themen/buero/BueroZeichnung.tsx) und die Dateien auf der Stellenseite
 * (components/jobs/stelle/BueroBeschriftungen.tsx) gleich.
 */
export function beschriftungsLage(szene: BueroSzene, b: Beschriftung): CSSProperties {
  const pct = (wert: number, von: number) => `${Math.round((wert / von) * 100_000) / 1000}%`;
  return {
    left: pct(b.x, szene.rahmen.breite),
    top: pct(b.y, szene.rahmen.hoehe),
    translate: `${b.anker === 'start' ? '0' : b.anker === 'middle' ? '-50%' : '-100%'} -50%`,
  };
}

/** Alle Pfade einer Szene in Zeichenreihenfolge (Prüfungen: Inline und Datei gleich). */
export function pfadeVon(szene: BueroSzene): string[] {
  return szene.gruppen.flatMap((g) => g.teile.map((t) => t.d));
}

/** Rahmen in Einheiten der Zeichnung (links, oben, Breite, Höhe). */
export interface Rahmen {
  x: number;
  y: number;
  b: number;
  h: number;
}

/**
 * Umgebendes Rechteck der Pfade einer Gruppe (Einheiten der Szene), großzügig: Bögen zählen mit ihren Radien um den
 * Endpunkt. Nur absolute Befehle M, L, H, V, A und Z, wie die Formen oben sie schreiben; alles andere bricht ab
 * (eine Ebene schnitte sonst einen Teil der Gruppe ab). Gruppen mit fester Lage (Glyphen) haben keinen Rahmen hier.
 */
export function rahmenVon(teile: readonly Strich[]): Rahmen {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const { d } of teile) {
    for (const [, befehl, werte] of d.matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
      const n = (werte.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
      if (befehl === 'M' || befehl === 'L') {
        for (let i = 0; i + 1 < n.length; i += 2) {
          xs.push(n[i]);
          ys.push(n[i + 1]);
        }
      } else if (befehl === 'H') xs.push(...n);
      else if (befehl === 'V') ys.push(...n);
      else if (befehl === 'A') {
        for (let i = 0; i + 6 < n.length; i += 7) {
          const [rx, ry, , , , x, y] = n.slice(i, i + 7);
          xs.push(x - rx, x + rx);
          ys.push(y - ry, y + ry);
        }
      } else if (befehl !== 'Z') throw new Error(`rahmenVon: Befehl ${befehl} wird nicht unterstützt (${d.slice(0, 40)})`);
    }
  }
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, b: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Rand um den Rahmen einer bewegten Ebene (Einheiten): Platz für Striche und Gelenke. */
export const EBENE_RAND = 3;

/** Eine Ebene der bewegten Zeichnung: stille Gruppen in Zeichenreihenfolge oder eine bewegte Gruppe mit Rahmen. */
export type Ebene = { still: readonly Gruppe[] } | { gruppe: Gruppe & { ablauf: Ablauf }; rahmen: Rahmen };

/**
 * Ebenen einer Szene für den einmaligen Ablauf (Prüfrunde 3 C3-2): Jede bewegte Gruppe liegt auf einer eigenen
 * HTML-Ebene in der Größe ihres Rahmens (mit EBENE_RAND), damit der Compositor sie bewegt und die Zeichnung nicht je
 * Bild neu gemalt wird. Die stillen Gruppen dazwischen bleiben zusammen, die Reihenfolge der Daten bleibt (was später
 * kommt, liegt oben). Die erste Ebene ist immer still (sie trägt die Größe der Zeichnung), auch wenn leer.
 */
export function ebenenVon(szene: BueroSzene): Ebene[] {
  const ebenen: Ebene[] = [{ still: [] }];
  for (const g of szene.gruppen) {
    const letzte = ebenen[ebenen.length - 1];
    if (g.ablauf) {
      if (g.lage) throw new Error(`ebenenVon: bewegte Gruppe ${g.id} mit fester Lage wird nicht unterstützt`);
      const r = rahmenVon(g.teile);
      ebenen.push({ gruppe: g as Gruppe & { ablauf: Ablauf }, rahmen: { x: r.x - EBENE_RAND, y: r.y - EBENE_RAND, b: r.b + 2 * EBENE_RAND, h: r.h + 2 * EBENE_RAND } });
    } else if ('still' in letzte) ebenen[ebenen.length - 1] = { still: [...letzte.still, g] };
    else ebenen.push({ still: [g] });
  }
  return ebenen;
}

/** Die Verzögerungen (Takte) aller Abläufe einer Szene, aufsteigend, je einmal. */
export function takteVon(szene: BueroSzene): number[] {
  return [...new Set(szene.gruppen.flatMap((g) => (g.ablauf ? [g.ablauf.takte] : [])))].sort((a, b) => a - b);
}
