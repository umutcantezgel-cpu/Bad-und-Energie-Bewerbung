import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { TOKENS } from '@/lib/tokens';
import { MODES, checkTheme } from '../../../scripts/qa/check-contrast.mjs';
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

  it('Linienarten der Zeichnungen (K-010, E-029): Leitung 3 · Kontur 2 · fein 1 · Maß 1 · verdeckt · Mittellinie · Icon 2', () => {
    const { linien } = TOKENS;
    expect(px(cssVar('--m-leitung'))).toBe(linien.leitung);
    expect(px(cssVar('--m-kontur'))).toBe(linien.kontur);
    expect(px(cssVar('--m-fein'))).toBe(linien.fein);
    expect(px(cssVar('--m-mass'))).toBe(linien.mass);
    expect(px(cssVar('--m-verdeckt'))).toBe(linien.verdeckt);
    expect(px(cssVar('--m-mittellinie'))).toBe(linien.mittellinie);
    expect(px(cssVar('--m-icon'))).toBe(linien.icon);
    const muster = (name: string) => cssVar(name).split(/\s+/).map(px);
    expect(muster('--m-verdeckt-muster')).toEqual([...linien.verdecktMuster]);
    expect(muster('--m-mittellinie-muster')).toEqual([...linien.mittellinieMuster]);
    // Werte der Tabelle in KERN K-010; die Leitung behält die Stärke des alten Strichs (--m-strich)
    expect([linien.leitung, linien.kontur, linien.fein, linien.mass, linien.icon]).toEqual([3, 2, 1, 1, 2]);
    expect(linien.leitung).toBe(TOKENS.strich);
    // Strich-Punkt: langer Strich, Lücke, Punkt, Lücke; gestrichelt: Strich und Lücke
    expect(linien.mittellinieMuster).toHaveLength(4);
    expect(linien.mittellinieMuster[0]).toBeGreaterThan(linien.mittellinieMuster[2]);
    expect(linien.verdecktMuster).toHaveLength(2);
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

  it('Wärmerampe (E-031): fünf Stufen je Modus, Primitive und Rollen gespiegelt; hell auch im Band und im Druck', () => {
    const { hell, dunkel } = TOKENS.waerme;
    expect(hell).toHaveLength(5);
    expect(dunkel).toHaveLength(5);
    hell.forEach((hex, i) => expect(cssVar(`--p-waerme-${i}`), `hell ${i}`).toBe(hex));
    dunkel.forEach((hex, i) => expect(cssVar(`--p-glimm-${i}`), `dunkel ${i}`).toBe(hex));
    // Jede Rolle in jedem Modus aufgelöst wie in check-contrast (Seite, Band, Wärmebereich, Druck)
    const { role } = checkTheme(readFileSync(path.resolve(__dirname, '../../../app/styles/theme.css'), 'utf8'));
    const modi = MODES as ReadonlyArray<{ name: string; dark: boolean; print: boolean }>;
    expect(modi.length).toBeGreaterThanOrEqual(13);
    for (const modus of modi) {
      const soll = modus.dark && !modus.print ? dunkel : hell;
      for (let i = 0; i < 5; i += 1) expect(role(modus.name, `waerme-${i}`), `${modus.name} waerme-${i}`).toBe(soll[i]);
    }
    // Keine Utilities: die Rampe gehört nur in die freigegebenen Stylesheets (Guard waerme-rollen)
    expect(theme).not.toMatch(/--color-waerme-\d/);
  });

  it('Markierfläche der Büro-Szenen (Prüfrunde 4 A4-6): eigene Rolle auf dem Primitivwert der Stufe 2, in jedem Modus gespiegelt, ohne Utility', () => {
    const { role } = checkTheme(readFileSync(path.resolve(__dirname, '../../../app/styles/theme.css'), 'utf8'));
    expect(TOKENS.markierung).toEqual({ hell: TOKENS.waerme.hell[2], dunkel: TOKENS.waerme.dunkel[2] });
    for (const modus of MODES as ReadonlyArray<{ name: string; dark: boolean; print: boolean }>) {
      const soll = modus.dark && !modus.print ? TOKENS.markierung.dunkel : TOKENS.markierung.hell;
      expect(role(modus.name, 'markierung'), modus.name).toBe(soll);
    }
    expect(cssVar('--markierung')).toBe('var(--p-waerme-2)');
    expect(theme).not.toMatch(/--color-markierung/);
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
