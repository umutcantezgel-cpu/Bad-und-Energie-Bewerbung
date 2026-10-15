import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FRONT_BUDGET, FRONT_CSS, modulBytes } from '@/scripts/qa/check-css-chunks.mjs';
import { CURSOR_DATEI, WAERME_ROLLEN_ERLAUBT } from '@/scripts/qa/check-design-tokens.mjs';
import { DAUER_MS, DIFFUSION_STUETZ, KLICK_ENDE_MS, MOTION_REGISTER, TAKT_MS, WECHSEL } from '@/lib/motion/register';
import { diffusionsFehler, keyframesIn } from '@/lib/motion/__tests__/keyframes';
import { Waermefront } from '../Waermefront';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: () => {}, prefetch: () => {} }),
}));

const ROOT = path.resolve(__dirname, '../../../..');
const lies = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const gzip = (s: string) => gzipSync(Buffer.from(s, 'utf8'), { level: 9 }).length;
const EINGANG = 'components/site/waermefront/Waermefront.tsx';
const css = lies(FRONT_CSS).replace(/\/\*[\s\S]*?\*\//g, '');

/** Deklarationen der Regel mit genau diesem Selektor (Quelle ohne Kommentare). */
function regel(selektor: string): Record<string, string> {
  const flucht = selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`(?:^|\\})\\s*${flucht}\\s*\\{([^}]*)\\}`));
  if (!m) throw new Error(`Regel ${selektor} fehlt`);
  return Object.fromEntries(
    m[1]
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]),
  );
}

describe('Waermefront: Markup (E-031)', () => {
  const markup = renderToStaticMarkup(createElement(Waermefront));

  it('zwei Überlagerungen als popover="manual", aria-hidden und inert, mit je einer Schicht pro Verzögerung des Registers', () => {
    const ueberlagerungen = [...markup.matchAll(/<div ([^>]*)>((?:<i><\/i>)*)<\/div>/g)];
    expect(ueberlagerungen.map((u) => u[0]).join('')).toBe(markup);
    const nach = Object.fromEntries(ueberlagerungen.map((u) => [u[1].match(/data-motion="([^"]+)"/)![1], u]));
    expect(Object.keys(nach).sort()).toEqual(['klick-waerme', 'seitenwechsel']);
    for (const [id, [, attribute, schichten]] of Object.entries(nach)) {
      expect(attribute, id).toMatch(/^popover="manual" class="[^"]+" aria-hidden="true" inert="" data-motion="[^"]+"$/);
      expect(schichten.match(/<i>/g)!.length, id).toBe(MOTION_REGISTER[id as 'klick-waerme' | 'seitenwechsel'].verzoegerungTakte.length);
    }
    // nichts Fokussierbares, kein Text: die Überlagerungen erscheinen nicht im Baum der Barrierefreiheit
    expect(markup.replace(/<[^>]+>/g, '')).toBe('');
    expect(markup).not.toMatch(/tabindex|<a\b|<button\b|role=/);
  });

  it('nur das Layout setzt die Insel ein, einmal und außerhalb von Suspense; ihr CSS lädt nur die Insel (globaler Chunk)', () => {
    const layout = lies('app/layout.tsx');
    expect(layout).toMatch(/^import \{ Waermefront \} from '@\/components\/site\/waermefront\/Waermefront';$/m);
    expect(layout.match(/<Waermefront \/>/g)).toHaveLength(1);
    expect(layout.slice(layout.indexOf('<Waermefront />') - 200, layout.indexOf('<Waermefront />'))).not.toMatch(/<Suspense[^/]*$/);
    const importeure: string[] = [];
    const lauf = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (name === 'node_modules' || name === '__tests__' || name.startsWith('.')) continue;
        if (statSync(p).isDirectory()) lauf(p);
        else if (/\.(?:tsx?|css)$/.test(name) && /waermefront(?:\.module\.css|\/Waermefront)['"]/.test(readFileSync(p, 'utf8'))) {
          importeure.push(path.relative(ROOT, p));
        }
      }
    };
    for (const dir of ['app', 'components', 'lib']) lauf(path.join(ROOT, dir));
    expect(importeure.sort()).toEqual(['app/layout.tsx', EINGANG]);
  });
});

describe('Waermefront: CSS (E-031, K-009)', () => {
  it('Wachstum nur nach √t: waechst skaliert 0 → 1 genau auf DIFFUSION_STUETZ, linear; steigt nur opacity und translate', () => {
    expect(diffusionsFehler(css)).toEqual([]);
    const k = Object.fromEntries(keyframesIn(css).map((x) => [x.name, x]));
    expect(Object.keys(k).sort()).toEqual(['steigt', 'waechst']);
    expect(k.waechst.stopps.map((s) => [s.anteil / 100, Number(s.deklarationen.get('scale'))])).toEqual(DIFFUSION_STUETZ.map(([t, f]) => [t, f]));
    expect(k.waechst.stopps.every((s) => [...s.deklarationen.keys()].join() === 'scale')).toBe(true);
    expect(k.steigt.stopps).toHaveLength(1);
    expect(Object.fromEntries(k.steigt.stopps[0].deklarationen)).toEqual({ opacity: '0', translate: '0 var(--h, 0)' });
  });

  it('Farben nur aus der Wärmerampe und die Seitenfarbe: Front --waerme-1, -2, -4, Seite; Klick --waerme-0 außen, -2, -4 innen', () => {
    expect(Object.keys(WAERME_ROLLEN_ERLAUBT)).toContain(FRONT_CSS);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|gradient|color-mix|filter|shadow|blend|backdrop|rgba?\(|hsla?\(|oklch|will-change|infinite/i);
    expect(regel('.e')['--c']).toBe('var(--waerme-1)');
    expect(regel('.k')['--c']).toBe('var(--waerme-0)');
    expect(regel('.e > *').background).toBe('var(--c)');
    expect(regel('.e > * + *').background).toBe('var(--waerme-2)');
    expect(regel('.e > * + * + *').background).toBe('var(--waerme-4)');
    expect(regel('.e > * + * + * + *').background).toBe('var(--surface)');
    const farben = [...css.matchAll(/(?:background|--c)\s*:\s*([^;]+);/g)].map((m) => m[1].trim());
    for (const f of farben) expect(f).toMatch(/^(?:none|var\(--c\)|var\(--surface\)|var\(--waerme-[0124]\))$/);
  });

  it('Zeitplan wie im Register: je Schicht ½ Takt versetzt; Front d-2, Klick d-3 bis 480 ms; Aufdecken d-2 mit k-aus', () => {
    const schicht = regel('.e > *');
    expect(schicht.animation).toBe('waechst var(--d) linear calc(var(--takt) * var(--n, 0) / 2) backwards');
    const n = [0, Number(regel('.e > * + *')['--n']), Number(regel('.e > * + * + *')['--n']), Number(regel('.e > * + * + * + *')['--n'])];
    const front = MOTION_REGISTER.seitenwechsel;
    const klick = MOTION_REGISTER['klick-waerme'];
    expect(n.map((x) => x / 2)).toEqual(front.verzoegerungTakte);
    expect(n.slice(0, 3).map((x) => x / 2)).toEqual(klick.verzoegerungTakte);
    expect(regel('.e')['--d']).toBe(`var(--${front.dauer[0]})`);
    expect(regel('.k')['--d']).toBe(`var(--${klick.dauer[0]})`);
    // Klick-Wärme: Scheiben --a-8 (64 px); verblassen in der zweiten Hälfte, Ende = KLICK_ENDE_MS
    expect(regel('.k')['--s']).toBe('var(--a-8)');
    // durchscheinend über der Beschriftung, ab dort verblassend auf 0
    expect(Number(regel('.k').opacity)).toBeGreaterThan(0.5);
    expect(Number(regel('.k').opacity)).toBeLessThan(1);
    expect(lies('app/styles/theme.css')).toMatch(/--a-8: 4rem;/);
    expect(regel('.k').animation).toBe('steigt var(--d-2) linear var(--d-2) forwards');
    expect(2 * DAUER_MS['d-2']).toBe(KLICK_ENDE_MS);
    expect(Math.max(...klick.verzoegerungTakte) * TAKT_MS + DAUER_MS['d-3']).toBe(KLICK_ENDE_MS);
    // Aufdecken: Die Front verblasst und steigt um --a-4, d-2 mit k-aus
    expect(regel('.e[data-auf]')).toEqual({ '--h': 'calc(-1 * var(--a-4))', animation: 'steigt var(--d-2) var(--k-aus) forwards' });
    expect(DAUER_MS['d-2']).toBe(WECHSEL.aufdeckenMs);
    expect(front.kurve).toEqual(['linear', 'k-aus']);
  });

  it('die Überlagerung ist still: keine Zeigerereignisse, contain: strict, beschnitten, ohne Rahmen und Fläche des Popovers', () => {
    expect(regel('.e')).toMatchObject({
      width: 'auto',
      height: 'auto',
      border: '0',
      background: 'none',
      overflow: 'hidden',
      'pointer-events': 'none',
      contain: 'strict',
    });
    expect(regel('.e > *')).toMatchObject({ position: 'absolute', 'aspect-ratio': '1', translate: '-50% -50%', 'border-radius': 'var(--radius-voll)' });
    // Selektoren: nur die beiden Klassen, ihre Schichten und [data-auf]
    const selektoren = [...css.matchAll(/(?:^|\})\s*([^{}@]+?)\s*\{/g)].map((m) => m[1].trim()).filter((s) => s.startsWith('.'));
    expect(selektoren).toEqual(['.e', '.k', '.e > *', '.e > * + *', '.e > * + * + *', '.e > * + * + * + *', '.e[data-auf]']);
  });

  it(`Budget: ≤ ${FRONT_BUDGET} B im globalen Chunk, gemessen wie check-css-chunks (verkleinert, Klassen mit Präfix)`, async () => {
    const { transform } = await import('lightningcss');
    const { code } = transform({
      filename: FRONT_CSS,
      code: Buffer.from(lies(FRONT_CSS)),
      minify: true,
      cssModules: { pattern: 'waermefront-module__AbCd3f__[local]' },
    });
    const gebaut = code.toString();
    expect(gebaut).toContain('waermefront-module__AbCd3f__e');
    expect(modulBytes(gebaut, ['waermefront'])).toBe(gebaut.length);
    expect(gebaut.length).toBeLessThanOrEqual(FRONT_BUDGET);
  });
});

describe('Waermefront: Insel ≤ 2 KB gzip (K-013)', () => {
  it('minifiziertes Bündel mit allem, was sie in den Browser zieht (React und Next extern)', async () => {
    expect(lies(EINGANG).startsWith("'use client';")).toBe(true);
    // Die Insel importiert nur React, Next-Navigation, die reine Logik und ihr CSS-Modul; die Logik zieht nichts nach
    const importe = [...lies(EINGANG).matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    expect(importe.sort()).toEqual(['./waermefront.module.css', '@/lib/motion/prefers', '@/lib/motion/seitenwechsel', 'next/navigation', 'react']);
    expect([...lies('lib/motion/seitenwechsel.ts').matchAll(/from '([^']+)'/g)]).toEqual([]);
    expect([...lies('lib/motion/prefers.ts').matchAll(/from '([^']+)'/g)]).toEqual([]);
    // keine Bild-Cursor und keine Wärmerollen im Code (Guards cursor und waerme-rollen)
    expect(lies(EINGANG)).not.toMatch(/\/cursor\/|--waerme-/);
    expect(CURSOR_DATEI).toBe('app/globals.css');
    const { build } = await import('rolldown');
    const ergebnis = await build({
      input: path.join(ROOT, EINGANG),
      external: [/^react(?:\/|$)/, /^next(?:\/|$)/],
      resolve: { alias: { '@': ROOT } },
      plugins: [
        {
          name: 'css-modul',
          resolveId: (quelle: string) => (quelle.endsWith('.module.css') ? '\0css-modul' : null),
          load: (id: string) => (id === '\0css-modul' ? 'export default { e: "a", k: "b" };' : null),
        },
      ],
      output: { minify: true, format: 'esm' },
      write: false,
    });
    const code = ergebnis.output[0].code;
    for (const teil of ['showPopover', ':popover-open', 'animationend', 'pageshow', 'popstate', 'prefetch', 'preventDefault', 'requestAnimationFrame']) {
      expect(code, teil).toContain(teil);
    }
    // Klick in der Erfassungsphase am Dokument: vor next/link, nach den onClickCapture-Handlern von React
    expect(code).toMatch(/document\.addEventListener\(`click`,\w+,!0\)/);
    expect(code).not.toMatch(/Zwecktext|zweck:/);
    expect(gzip(code)).toBeLessThanOrEqual(2 * 1024);
  }, 30_000);
});
