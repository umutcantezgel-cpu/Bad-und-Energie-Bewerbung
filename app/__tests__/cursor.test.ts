import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CURSOR_DATEI } from '@/scripts/qa/check-design-tokens.mjs';

/**
 * Eigener Zeiger (E-031): Navy-Pfeil (#111D6D) mit 2 px Creme-Rand (#F6F0E4) und runden Ecken, 32 × 32, Hotspot 4 3;
 * die Hand ist derselbe Pfeil mit einem Punkt in Vorlaufrot (#D60000) im Creme-Ring. Je Datei ≤ 1,5 KB, 1x und 2x.
 * Nur bei feinem Zeiger mit Hover und ohne erzwungene Farben, immer mit Schlüsselwort dahinter.
 */
const ROOT = path.resolve(__dirname, '../..');
const ORDNER = path.join(ROOT, 'public/cursor');
const lies = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const DATEIEN = ['hand-2x.svg', 'hand.svg', 'zeiger-2x.svg', 'zeiger.svg'];
const HOTSPOT = [4, 3] as const;
const MEDIA = '@media (hover: hover) and (pointer: fine) and (forced-colors: none)';

/** Primitive aus theme.css (die Farben des Zeigers spiegeln sie). */
function primitiv(name: string): string {
  return lies('app/styles/theme.css').match(new RegExp(`--p-${name}:\\s*(#[0-9A-Fa-f]{6});`))![1];
}

/** Eckpunkte eines Pfads aus absoluten M/L/H/V und relativen l/h/v (Z schließt). */
function punkte(d: string): [number, number][] {
  const out: [number, number][] = [];
  let x = 0;
  let y = 0;
  for (const [, befehl, zahlen] of d.matchAll(/([MLHVZmlhvz])([^MLHVZmlhvz]*)/g)) {
    const z = (zahlen.match(/-?\d*\.?\d+/g) ?? []).map(Number);
    if (/[MLml]/.test(befehl)) {
      for (let i = 0; i < z.length; i += 2) {
        const rel = befehl === befehl.toLowerCase() && !(befehl === 'm' && out.length === 0);
        x = rel ? x + z[i] : z[i];
        y = rel ? y + z[i + 1] : z[i + 1];
        out.push([x, y]);
      }
    } else if (/[Hh]/.test(befehl)) {
      for (const w of z) out.push([(x = befehl === 'h' ? x + w : w), y]);
    } else if (/[Vv]/.test(befehl)) {
      for (const w of z) out.push([x, (y = befehl === 'v' ? y + w : w)]);
    } else if (!/[Zz]/.test(befehl)) {
      throw new Error(`Befehl ${befehl} nicht erwartet`);
    }
  }
  return out;
}

/** Abstand eines Punkts von einer Strecke. */
function abstand([px, py]: readonly [number, number], [ax, ay]: readonly [number, number], [bx, by]: readonly [number, number]): number {
  const l = (bx - ax) ** 2 + (by - ay) ** 2;
  const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l));
  return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)));
}

describe('Zeiger-Dateien (E-031)', () => {
  const svg = Object.fromEntries(DATEIEN.map((n) => [n, readFileSync(path.join(ORDNER, n), 'utf8')]));

  it('genau vier Dateien, je ≤ 1,5 KB; 1x 32 × 32, 2x 64 × 64, beide mit viewBox 0 0 32 32', () => {
    expect(readdirSync(ORDNER).sort()).toEqual(DATEIEN);
    for (const [name, inhalt] of Object.entries(svg)) {
      expect(Buffer.byteLength(inhalt), name).toBeLessThanOrEqual(1536);
      const groesse = name.includes('-2x') ? 64 : 32;
      expect(inhalt, name).toMatch(new RegExp(`^<svg xmlns="http://www\\.w3\\.org/2000/svg" width="${groesse}" height="${groesse}" viewBox="0 0 32 32">`));
      // still und eigenständig: kein Skript, kein Verweis nach außen, kein Bild, keine Schrift, kein Verlauf
      expect(inhalt, name).not.toMatch(/<script|<image|<text|<style|<foreignObject|href=|url\(|gradient|filter|on\w+=/i);
    }
    // 2x ist dieselbe Zeichnung in doppelter Auflösung
    expect(svg['zeiger-2x.svg'].replace('width="64" height="64"', 'width="32" height="32"')).toBe(svg['zeiger.svg']);
    expect(svg['hand-2x.svg'].replace('width="64" height="64"', 'width="32" height="32"')).toBe(svg['hand.svg']);
  });

  it('Farben nur Navy, Creme und (nur in der Hand) Vorlaufrot, gleich den Primitiven des Themas', () => {
    const navy = primitiv('navy');
    const creme = primitiv('creme');
    const rot = primitiv('rot');
    expect([navy, creme, rot]).toEqual(['#111D6D', '#F6F0E4', '#D60000']);
    for (const [name, inhalt] of Object.entries(svg)) {
      const farben = new Set(inhalt.match(/#[0-9A-Fa-f]{3,8}\b/g));
      expect([...farben].sort(), name).toEqual(name.startsWith('hand') ? [navy, rot, creme].sort() : [navy, creme].sort());
    }
  });

  it('der Pfeil: Spitze im Hotspot 4 3, 2 px Creme-Rand mit runden Ecken um die Navy-Fläche, alles im Feld 32 × 32', () => {
    const inhalt = svg['zeiger.svg'];
    const pfade = [...inhalt.matchAll(/<path d="([^"]+)" ([^>]*)\/>/g)];
    expect(pfade).toHaveLength(2);
    const [rand, flaeche] = pfade;
    expect(rand[1]).toBe(flaeche[1]);
    expect(rand[2]).toBe('fill="#F6F0E4" stroke="#F6F0E4" stroke-width="5" stroke-linejoin="round"');
    expect(flaeche[2]).toBe('fill="#111D6D" stroke="#111D6D" stroke-linejoin="round"');
    // sichtbarer Rand: (5 − 1) / 2 = 2 px
    const ecken = punkte(rand[1]);
    expect(ecken[0]).toEqual([...HOTSPOT]);
    // Die Spitze ist der oberste und linke Punkt; der Rand (2,5 Einheiten) bleibt im Feld
    expect(Math.min(...ecken.map(([x]) => x))).toBe(HOTSPOT[0]);
    expect(Math.min(...ecken.map(([, y]) => y))).toBe(HOTSPOT[1]);
    for (const [x, y] of ecken) {
      expect(x - 2.5).toBeGreaterThanOrEqual(0);
      expect(y - 2.5).toBeGreaterThanOrEqual(0);
      expect(x + 2.5).toBeLessThanOrEqual(32);
      expect(y + 2.5).toBeLessThanOrEqual(32);
    }
  });

  it('die Hand: derselbe Pfeil und ein Vorlaufrot-Punkt im Creme-Ring, frei vom Pfeil und im Feld', () => {
    const pfeil = svg['zeiger.svg'].replace(/^<svg[^>]*>|<\/svg>\n?$/g, '');
    expect(svg['hand.svg']).toContain(pfeil);
    const kreise = [...svg['hand.svg'].matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="(#[0-9A-F]{6})"\/>/g)].map((m) => ({
      x: Number(m[1]),
      y: Number(m[2]),
      r: Number(m[3]),
      farbe: m[4],
    }));
    expect(kreise.map((k) => [k.r, k.farbe])).toEqual([
      [5, '#F6F0E4'],
      [3, '#D60000'],
    ]);
    const [ring, punkt] = kreise;
    expect([punkt.x, punkt.y]).toEqual([ring.x, ring.y]);
    expect(ring.r - punkt.r).toBe(2);
    expect(ring.x + ring.r).toBeLessThanOrEqual(32);
    expect(ring.y + ring.r).toBeLessThanOrEqual(32);
    // Abstand zum Rand des Pfeils (2,5 Einheiten um den Pfad) mindestens 1 Einheit
    const ecken = punkte(svg['zeiger.svg'].match(/d="([^"]+)"/)![1]);
    const kanten = ecken.map((p, i) => [p, ecken[(i + 1) % ecken.length]] as const);
    const naechste = Math.min(...kanten.map(([a, b]) => abstand([ring.x, ring.y], a, b)));
    expect(naechste - ring.r - 2.5).toBeGreaterThanOrEqual(1);
  });
});

describe('Zeiger im CSS (E-031, nur app/globals.css)', () => {
  const globals = lies(CURSOR_DATEI).replace(/\/\*[\s\S]*?\*\//g, '');
  const bild = [...globals.matchAll(/cursor:\s*([^;]*(?:url|image-set)\([^;]*);/g)].map((m) => ({ wert: m[1], index: m.index }));

  /** Kopf aller Blöcke, in denen eine Stelle liegt (von außen nach innen). */
  function bloecke(index: number): string[] {
    const stapel: string[] = [];
    let kopf = '';
    for (let i = 0; i < index; i += 1) {
      const c = globals[i];
      if (c === '{') {
        stapel.push(kopf.trim());
        kopf = '';
      } else if (c === '}') {
        stapel.pop();
        kopf = '';
      } else if (c === ';') kopf = '';
      else kopf += c;
    }
    return stapel;
  }

  it('jede Bild-Deklaration: Hotspot 4 3, Schlüsselwort dahinter, nur bei feinem Zeiger mit Hover und ohne erzwungene Farben', () => {
    expect(bild.length).toBe(6);
    for (const { wert, index } of bild) {
      expect(wert).toMatch(/\) 4 3, (?:auto|pointer)$/);
      expect(bloecke(index), wert).toContain(MEDIA);
      for (const [, datei] of wert.matchAll(/url\("\/cursor\/([^"]+)"\)/g)) expect(existsSync(path.join(ORDNER, datei)), datei).toBe(true);
    }
  });

  it('erst die einfache Adresse, dann image-set mit 1x und 2x derselben Zeichnung, im selben Block', () => {
    for (let i = 0; i < bild.length; i += 2) {
      const [einfach, satz] = [bild[i].wert, bild[i + 1].wert];
      const name = einfach.match(/^url\("\/cursor\/(zeiger|hand)\.svg"\) 4 3, (auto|pointer)$/)!;
      expect(name, einfach).not.toBeNull();
      expect(satz).toBe(`image-set(url("/cursor/${name[1]}.svg") 1x, url("/cursor/${name[1]}-2x.svg") 2x) 4 3, ${name[2]}`);
      expect(bloecke(bild[i + 1].index)).toEqual(bloecke(bild[i].index));
      // Pfeil mit auto, Hand mit pointer als Rückfall
      expect(name[2]).toBe(name[1] === 'zeiger' ? 'auto' : 'pointer');
    }
  });

  it('Pfeil auf der Seite, Hand über Links, Knöpfen und cursor-pointer; Text in Feldern, not-allowed bei Deaktiviertem', () => {
    const block = globals.slice(globals.indexOf(MEDIA));
    expect(block).toMatch(/:root \{\s*cursor: url\("\/cursor\/zeiger\.svg"\)/);
    expect(block).toMatch(
      /a\[href\]:not\(\[aria-disabled="true"\]\),\s*button:not\(:disabled, \[aria-disabled="true"\]\),\s*\[role="button"\]:not\(\[aria-disabled="true"\]\),\s*summary \{\s*cursor: url\("\/cursor\/hand\.svg"\)/,
    );
    expect(block).toMatch(/textarea,[\s\S]*?\{\s*cursor: text;\s*\}/);
    expect(block).toMatch(/:disabled,\s*\[aria-disabled="true"\] \{\s*cursor: not-allowed;\s*\}/);
    const utility = globals.slice(globals.lastIndexOf(MEDIA));
    expect(bloecke(globals.indexOf('cursor:', globals.lastIndexOf('.cursor-pointer')))).toEqual(['@layer utilities', MEDIA, '.cursor-pointer']);
    expect(utility).toMatch(/\.cursor-pointer \{\s*cursor: url\("\/cursor\/hand\.svg"\) 4 3, pointer;/);
    // Ohne feinen Zeiger (Touch) und in forced-colors bleiben die Systemzeiger: Knöpfe weiter mit pointer
    expect(globals).toMatch(/button:not\(:disabled, \[aria-disabled="true"\]\),\s*\[role="button"\]:not\(\[aria-disabled="true"\]\) \{\s*cursor: pointer;\s*\}/);
  });

  it('Wirkung: Kein Selektor mit Hand oder pointer trifft ein deaktiviertes Element (aria-disabled oder :disabled) – sonst schlüge seine höhere Spezifität not-allowed (Prüfrunde 1 C1-7)', () => {
    // Alle Regeln mit cursor: url(hand)… oder cursor: pointer; jeder Teilselektor, der ein Bedienelement nennt, schließt
    // aria-disabled="true" aus (Knöpfe auch :disabled). Die Utility .cursor-pointer verlässt sich auf disabled:cursor-not-allowed.
    const regeln = [...globals.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => /cursor:\s*(?:url\("\/cursor\/hand|pointer)/.test(m[2]));
    expect(regeln.length).toBeGreaterThanOrEqual(3);
    for (const [, kopf] of regeln) {
      for (const teil of kopf.split(/,(?![^(]*\))/).map((t) => t.trim())) {
        if (teil === '.cursor-pointer') continue;
        expect(teil, teil).toMatch(/:not\([^)]*\[aria-disabled="true"\][^)]*\)|^summary$/);
        if (teil.startsWith('button')) expect(teil, teil).toMatch(/:not\([^)]*:disabled/);
      }
    }
  });

  it('kein View-Übergang mehr im globalen Blatt (E-031: die Wärmefront ist eine Überlagerung)', () => {
    expect(globals).not.toMatch(/view-transition/);
  });
});
