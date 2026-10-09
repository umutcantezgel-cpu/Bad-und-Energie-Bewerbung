import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { TOKENS } from '@/lib/tokens';
import { AUFTAKT_ENDE_MS, DAUER_MS, TAKT_MS } from '../register';
import { SICHERHEITSNETZ_MS } from '../head-script';

/** lib/tokens spiegelt app/styles/theme.css (K-004); diese Prüfung hält beide gleich. */
const theme = readFileSync(path.resolve(__dirname, '../../../app/styles/theme.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function cssVar(name: string): string {
  const m = theme.match(new RegExp(`${name.replace(/[-]/g, '\\-')}\\s*:\\s*([^;]+);`));
  if (!m) throw new Error(`${name} fehlt in theme.css`);
  return m[1].trim();
}

const ms = (value: string) => Number(value.replace(/ms$/, ''));
const px = (value: string) => (value.endsWith('rem') ? Number(value.replace(/rem$/, '')) * 16 : Number(value.replace(/px$/, '')));
const normalize = (curve: string) => curve.replace(/\s+/g, '').replace(/(^|[,(])\./g, '$10.');

describe('Spiegel theme.css ↔ lib/tokens', () => {
  it('Dauern und Takt (K-009)', () => {
    expect(ms(cssVar('--d-1'))).toBe(TOKENS.motion.d1);
    expect(ms(cssVar('--d-2'))).toBe(TOKENS.motion.d2);
    expect(ms(cssVar('--d-3'))).toBe(TOKENS.motion.d3);
    expect(ms(cssVar('--d-4'))).toBe(TOKENS.motion.d4);
    expect(ms(cssVar('--takt'))).toBe(TOKENS.motion.takt);
    expect([TOKENS.motion.d1, TOKENS.motion.d2, TOKENS.motion.d3, TOKENS.motion.d4]).toEqual(Object.values(DAUER_MS));
    expect(TOKENS.motion.takt).toBe(TAKT_MS);
    expect(TOKENS.motion.auftaktEnde).toBe(AUFTAKT_ENDE_MS);
    expect(TOKENS.motion.sicherheitsnetz).toBe(SICHERHEITSNETZ_MS);
  });

  it('Kurven (K-009)', () => {
    expect(normalize(cssVar('--k-aus'))).toBe(normalize(TOKENS.curves.aus));
    expect(normalize(cssVar('--k-wechsel'))).toBe(normalize(TOKENS.curves.wechsel));
    expect(normalize(cssVar('--k-ein'))).toBe(normalize(TOKENS.curves.ein));
    // Ältere Namen zeigen auf dieselben drei Kurven und vier Dauern
    expect(TOKENS.easing.standard).toBe(TOKENS.curves.aus);
    expect(TOKENS.easing.emphasized).toBe(TOKENS.curves.wechsel);
    expect(cssVar('--ease-standard')).toBe('var(--k-aus)');
    expect(cssVar('--ease-emphasized')).toBe('var(--k-wechsel)');
    expect(cssVar('--transition-duration-fast')).toBe('var(--d-1)');
    expect(TOKENS.duration.fast).toBe(TOKENS.motion.d1);
    expect(TOKENS.duration.step).toBe(TOKENS.motion.d2);
    expect(TOKENS.duration.sheet).toBe(TOKENS.motion.d2);
  });

  it('Abstandsskala mit 11 Stufen (K-007)', () => {
    const scale = Array.from({ length: 11 }, (_, i) => px(cssVar(`--a-${i + 1}`)));
    expect(scale).toEqual([...TOKENS.space]);
    expect(scale).toEqual([4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128]);
    expect(cssVar('--paar')).toBe('var(--a-3)');
    expect(px(cssVar('--spacing-paar'))).toBe(TOKENS.paar);
    expect(px(cssVar('--m-strich'))).toBe(TOKENS.strich);
    expect(TOKENS.paar).toBe(12);
    expect(TOKENS.strich).toBe(3);
  });

  it('vier Radien und ein Schatten (K-008)', () => {
    expect(px(cssVar('--radius-1'))).toBe(TOKENS.radius.r1);
    expect(px(cssVar('--radius-2'))).toBe(TOKENS.radius.r2);
    expect(px(cssVar('--radius-3'))).toBe(TOKENS.radius.r3);
    expect(px(cssVar('--radius-voll'))).toBe(TOKENS.radius.voll);
    // äußerer Bogen eines Paars = innerer Bogen + Paarabstand
    expect(TOKENS.radius.r3).toBe(TOKENS.radius.r2 + TOKENS.paar);
    const radii = [...theme.matchAll(/--radius-[\w-]+\s*:\s*([^;]+);/g)].map((m) => px(m[1].trim()));
    expect(new Set(radii)).toEqual(new Set([4, 12, 24, 999]));
    const shadows = [...theme.matchAll(/--shadow-([\w-]+)\s*:/g)].map((m) => m[1]);
    expect(shadows).toEqual(['lg']);
  });

  it('Schriftskala: höchstens 10 Stufen, fließend mit rem-Anteil (K-005)', () => {
    const sizes = [...theme.matchAll(/--text-([\w-]+)\s*:\s*([^;]+);/g)].filter((m) => !m[1].includes('--'));
    const names = new Set(sizes.map((m) => m[1]));
    // Stufen = Namen; die Werte einer Stufe nach Breite und Höhe (display, plakat) bleiben eine Stufe
    expect([...names].sort()).toEqual(
      ['body', 'callout', 'display', 'footnote', 'lead', 'numeral', 'plakat', 'title-1', 'title-2', 'title-3'].sort(),
    );
    expect(names.size).toBeLessThanOrEqual(10);
    for (const [, name, value] of sizes) {
      if (value.trim().startsWith('clamp(')) expect(value, name).toMatch(/clamp\([\d.]+rem,\s*[\d.]+rem \+ [\d.]+vw,\s*[\d.]+rem\)/);
    }
    for (const stufe of ['display', 'plakat']) {
      expect(cssVar(`--text-${stufe}--font-weight`), stufe).toBe('800');
      expect(cssVar(`--text-${stufe}--letter-spacing`), stufe).toBe('-0.01em');
      expect(Number(cssVar(`--text-${stufe}--line-height`)), stufe).toBeGreaterThanOrEqual(0.92);
    }
    // plakat = --t-7 aus Variante 1 (mobil/Tablet), unverändert übernommen
    expect(cssVar('--text-plakat')).toBe('clamp(3.75rem, 0.25rem + 18.5vw, 7.5rem)');
    expect(Number(cssVar('--text-body--line-height'))).toBeGreaterThanOrEqual(1.5);
  });

  it('theme-color = Dokumenthintergrund: Papier hell, Nacht dunkel (K-006)', () => {
    expect(cssVar('--p-papier')).toBe(TOKENS.themeColor.light);
    expect(cssVar('--p-nacht')).toBe(TOKENS.themeColor.dark);
    const layout = readFileSync(path.resolve(__dirname, '../../../app/layout.tsx'), 'utf8');
    expect(layout).toContain("{ media: '(prefers-color-scheme: light)', color: TOKENS.themeColor.light }");
    expect(layout).toContain("{ media: '(prefers-color-scheme: dark)', color: TOKENS.themeColor.dark }");
    expect(layout).not.toMatch(/#[0-9a-fA-F]{6}\b/);
  });

  it('Druck-Rückmeldung: 1 px, nur mit Kennung „druck“ und nur ohne reduzierte Bewegung (K-009, Z-09)', () => {
    const globals = readFileSync(path.resolve(__dirname, '../../../app/globals.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(TOKENS.druckVersatz).toBe(1);
    expect(TOKENS).not.toHaveProperty('pressScale');
    expect(globals).toMatch(
      /@media \(prefers-reduced-motion: no-preference\) \{\s*:where\(\[data-motion~="druck"\]\):active \{\s*transform: translateY\(1px\);\s*\}\s*\}/,
    );
    // keine Verschiebung aller Links und Knöpfe mehr
    expect(globals).not.toMatch(/:where\(a\[href\][^{]*\):active/);
  });

  it('Schriften: Bricolage, Atkinson, Martian Mono; Inter entfällt', () => {
    expect(cssVar('--font-display')).toContain('--font-bricolage');
    expect(cssVar('--font-sans')).toContain('--font-atkinson');
    expect(cssVar('--font-mass')).toContain('--font-martian');
    expect(theme).not.toMatch(/inter/i);
  });
});
