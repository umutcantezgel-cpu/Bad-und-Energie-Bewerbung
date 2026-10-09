import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Display-Stufen am längsten Wort geprüft (KERN K-005, Z-13, R2-FUND-01 Runde 2).
 *
 * Die Wortbreiten sind gemessen, nicht geschätzt: Chromium 141, app/fonts/bricolage-grotesque-latin-
 * opsz-normal.woff2, Gewicht 800, letter-spacing −0,01 em, font-optical-sizing auto (die opsz-Achse folgt
 * der Schriftgröße bis 96, darum wird das Wort mit wachsender Größe relativ schmaler). Breite in em je
 * Schriftgröße in px; dazwischen linear.
 */
const BREITE_EM: Record<string, Record<number, number>> = {
  'Feierabend.': { 40: 5.548, 44: 5.5202, 48: 5.486, 52: 5.4585, 56: 5.4249, 60: 5.3974, 64: 5.363, 68: 5.3355, 72: 5.304, 76: 5.2724, 80: 5.242, 88: 5.18, 96: 5.118 },
  'Handwerk.': { 40: 5.1211, 48: 5.0664, 56: 5.0117, 64: 4.957, 72: 4.9023, 80: 4.8475, 88: 4.7917, 96: 4.7371 },
  'Pünktlich': { 40: 4.4664, 48: 4.4131, 56: 4.3616, 64: 4.3081, 72: 4.2535, 80: 4.2, 88: 4.1475, 96: 4.0931 },
  'in Wetzlar.': { 40: 4.8805, 48: 4.8236, 56: 4.7706, 64: 4.7148, 72: 4.6589, 80: 4.6029, 88: 4.5471, 96: 4.491 },
  'SHK-Jobs': { 40: 4.35, 48: 4.2965, 56: 4.245, 64: 4.1936, 72: 4.1382, 80: 4.0859, 88: 4.0336, 96: 3.9821 },
};

function wortbreite(wort: string, px: number): number {
  const table = Object.entries(BREITE_EM[wort]).map(([size, em]) => [Number(size), em] as const);
  if (px <= table[0][0]) return table[0][1] * px;
  for (let i = 1; i < table.length; i++) {
    const [s1, e1] = table[i];
    const [s0, e0] = table[i - 1];
    if (px <= s1) return (e0 + ((e1 - e0) * (px - s0)) / (s1 - s0)) * px;
  }
  return table[table.length - 1][1] * px;
}

// ── theme.css lesen: Deklarationen mit ihrer Medienbedingung, in Quellreihenfolge ──
const css = readFileSync(path.resolve(__dirname, '../../styles/theme.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

interface Decl {
  prop: string;
  value: string;
  media: string[];
}

function walk(src: string, media: string[], out: Decl[]): Decl[] {
  let i = 0;
  let flat = '';
  while (i < src.length) {
    const open = src.indexOf('{', i);
    if (open === -1) {
      flat += src.slice(i);
      break;
    }
    let depth = 0;
    let close = open;
    for (; close < src.length; close++) {
      if (src[close] === '{') depth++;
      else if (src[close] === '}' && --depth === 0) break;
    }
    const before = src.slice(i, open);
    const cut = before.lastIndexOf(';');
    flat += before.slice(0, cut + 1);
    const prelude = before.slice(cut + 1).trim();
    const inner = prelude.startsWith('@media') ? [...media, prelude.slice(6).trim()] : media;
    walk(src.slice(open + 1, close), inner, out);
    i = close + 1;
  }
  for (const part of flat.split(';')) {
    const m = part.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) out.push({ prop: m[1], value: m[2], media });
  }
  return out;
}

const DECLS = walk(css, [], []);

/** Breite und Höhe in px; 1 em = 16 px. Nur Breiten- und Höhenabfragen, `screen`; alles andere gilt nicht. */
function matches(media: string[], w: number, h: number): boolean {
  return media.every((condition) =>
    condition.split(/\s+and\s+/).every((part) => {
      const p = part.trim();
      if (p === 'screen' || p === 'all') return true;
      const m = p.match(/^\((min|max)-(width|height):\s*([\d.]+)(em|px)\)$/);
      if (!m) return false;
      const limit = Number(m[3]) * (m[4] === 'em' ? 16 : 1);
      const value = m[2] === 'width' ? w : h;
      return m[1] === 'min' ? value >= limit : value <= limit;
    }),
  );
}

/** Wertet clamp(a, b ± c, d) mit rem- und vw-Anteilen aus. */
function px(value: string, w: number): number {
  const term = (t: string) => {
    const m = t.trim().match(/^(-?[\d.]+)(rem|vw|px)$/);
    if (!m) throw new Error(`unbekannter Wert ${t}`);
    return Number(m[1]) * (m[2] === 'rem' ? 16 : m[2] === 'vw' ? w / 100 : 1);
  };
  const sum = (expr: string) =>
    expr
      .replace(/\s+-\s+/g, ' + -')
      .split(/\s+\+\s+/)
      .reduce((acc, t) => acc + term(t), 0);
  const m = value.match(/^clamp\(([^,]+),([^,]+),([^)]+)\)$/);
  if (!m) return sum(value);
  return Math.min(sum(m[3]), Math.max(sum(m[1]), sum(m[2])));
}

/** Letzter passender Wert einer Variable (Quellreihenfolge = Kaskade, alle Regeln auf :root). */
function resolve(prop: string, w: number, h: number): number {
  const hits = DECLS.filter((d) => d.prop === prop && matches(d.media, w, h));
  if (hits.length === 0) throw new Error(`${prop} fehlt`);
  return px(hits[hits.length - 1].value, w);
}

/** Spalte des PageHeader-Titels: Container (px-gutter, max-w-content) und h1 max-w-4xl (56 rem). */
function spalte(w: number, h: number): number {
  const gutter = resolve('--spacing-gutter', w, h);
  const content = resolve('--container-content', w, h);
  return Math.min(w - 2 * gutter, content, 56 * 16);
}

const BREITEN = [320, 340, 359, 360, 375, 390, 393, 412, 430, 480, 600, 768, 820, 1023, 1024, 1280, 1440, 1920, 2560];

describe('Display-Stufe passt mit dem längsten Wort in die Spalte (K-005, Z-13)', () => {
  it.each(BREITEN)('Breite %i px: „Feierabend.“, „Handwerk.“ und „Pünktlich“ ohne Bruch im Wort', (w) => {
    const h = 900;
    const size = resolve('--text-display', w, h);
    for (const wort of ['Feierabend.', 'Handwerk.', 'Pünktlich']) {
      expect(wortbreite(wort, size), `${wort} bei ${size.toFixed(1)} px in ${spalte(w, h).toFixed(0)} px`).toBeLessThanOrEqual(spalte(w, h));
    }
  });

  it('liegt auf dem Handy bei 60 px (390) und 47 px (320), nicht mehr bei 76 px', () => {
    expect(resolve('--text-display', 390, 844)).toBeCloseTo(60.55, 1);
    expect(resolve('--text-display', 430, 932)).toBeCloseTo(66.35, 1);
    expect(resolve('--text-display', 320, 568)).toBeCloseTo(47.2, 1);
    // das Wort lässt in der 350-px-Spalte bei 390 px noch ≥ 20 px Luft (Ersatzschrift, Schriftgrößen-Einstellung)
    expect(spalte(390, 844) - wortbreite('Feierabend.', resolve('--text-display', 390, 844))).toBeGreaterThanOrEqual(20);
  });
});

describe('Plakat-Stufe (Variante 1) für „SHK-Jobs / in Wetzlar.“', () => {
  // Variante 1 setzt die Zeilen ohne Umbruch mit 16 px Rand (--rand: var(--a-4)); mit dem Seitenrand der
  // Plattform (20 px bei 390) wäre „in Wetzlar.“ bei 76 px 3 px zu breit – R3 nutzt den Rand aus Variante 1.
  const ANSICHTEN: Array<[number, number]> = [
    [320, 568],
    [360, 780],
    [375, 667],
    [375, 812],
    [390, 664],
    [390, 844],
    [393, 852],
    [412, 915],
    [430, 932],
    [768, 1024],
  ];

  it.each(ANSICHTEN)('%i × %i: jede Zeile passt in die Breite abzüglich 2 × 16 px', (w, h) => {
    const size = resolve('--text-plakat', w, h);
    for (const zeile of ['SHK-Jobs', 'in Wetzlar.']) {
      expect(wortbreite(zeile, size), `${zeile} bei ${size.toFixed(1)} px`).toBeLessThanOrEqual(w - 32);
    }
  });

  it('übernimmt die Werte aus Variante 1 (390 × 844: 76 px, 390 × 664: 60 px, 320 × 568: 40 px, 1440: 128 px)', () => {
    expect(resolve('--text-plakat', 390, 844)).toBeCloseTo(76.15, 1);
    expect(resolve('--text-plakat', 390, 664)).toBeCloseTo(60, 1);
    expect(resolve('--text-plakat', 320, 568)).toBeCloseTo(40, 1);
    expect(resolve('--text-plakat', 1440, 900)).toBeCloseTo(127.84, 1);
  });
});
