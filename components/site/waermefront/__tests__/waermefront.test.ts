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

describe('Waermefront: die neue Seite steht oben (Prüfrunde 1 A1-2, C1-5)', () => {
  it('<html data-scroll-behavior="smooth">, solange globals.css weich scrollt: Next springt beim Wechsel ohne Weichheit', () => {
    const layout = lies('app/layout.tsx');
    expect(layout).toMatch(/<html [^>]*data-scroll-behavior="smooth"[^>]*>/);
    expect(lies('app/globals.css')).toMatch(/html \{\s*scroll-behavior: smooth;\s*\}/);
    // Vertrag der installierten Next-Version: Nur mit dem Attribut schaltet der Router das weiche Scrollen beim Wechsel ab
    const next = lies('node_modules/next/dist/shared/lib/router/utils/disable-smooth-scroll.js');
    expect(next).toContain("htmlElement.dataset.scrollBehavior === 'smooth'");
    expect(next).toContain("htmlElement.style.scrollBehavior = 'auto'");
  });
});

describe('Waermefront: CSS (E-031, K-009)', () => {
  it('Wachstum nur nach √t: w skaliert 0 → 1 genau auf DIFFUSION_STUETZ, linear; s nur opacity und translate', () => {
    expect(diffusionsFehler(css)).toEqual([]);
    const k = Object.fromEntries(keyframesIn(css).map((x) => [x.name, x]));
    expect(Object.keys(k).sort()).toEqual(['s', 'w']);
    expect(k.w.stopps.map((s) => [s.anteil / 100, Number(s.deklarationen.get('scale'))])).toEqual(DIFFUSION_STUETZ.map(([t, f]) => [t, f]));
    expect(k.w.stopps.every((s) => [...s.deklarationen.keys()].join() === 'scale')).toBe(true);
    expect(k.s.stopps).toHaveLength(1);
    expect(Object.fromEntries(k.s.stopps[0].deklarationen)).toEqual({ opacity: '0', translate: '0 var(--h, 0)' });
  });

  it('Farben nur aus der Wärmerampe, kühl → heiß von der ersten zur letzten Schicht; keine Seitenfarbe (Prüfrunde 1 A1-12, B1-5)', () => {
    expect(Object.keys(WAERME_ROLLEN_ERLAUBT)).toContain(FRONT_CSS);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|gradient|color-mix|filter|shadow|blend|backdrop|rgba?\(|hsla?\(|oklch|will-change|infinite|--surface/i);
    expect(regel('.e')['--c']).toBe('var(--waerme-1)');
    expect(regel('.e > * + *')['--c']).toBe('var(--waerme-2)');
    expect(regel('.e > * + * + *')['--c']).toBe('var(--waerme-3)');
    // Die heißeste ist die letzte Schicht der Front: Sie startet zuletzt, liegt oben und damit immer innen; alle wachsen
    // auf denselben Durchmesser (--s, bis zur fernsten Ecke), am Ende deckt die heißeste das Fenster (kein kalter Kern)
    expect(regel('.e > * + * + * + *')['--c']).toBe('var(--waerme-4)');
    expect(regel('.e > *').background).toBe('var(--f, var(--c))');
    expect(regel('.e > *').border).toBe('var(--m-leitung) solid var(--c)');
    const farben = [...css.matchAll(/(?:background|--c|--f)\s*:\s*([^;]+);/g)].map((m) => m[1].trim());
    for (const f of farben) expect(f).toMatch(/^(?:none|var\(--f, var\(--c\)\)|var\(--waerme-[1-4]\))$/);
  });

  it('Klick-Wärme: nur Ringe ohne Fläche und ohne Durchsicht (die Beschriftung bleibt rein, auch im Navy-Band; Prüfrunde 1 A1-3)', () => {
    const k = regel('.k');
    expect(k['--f']).toBe('none');
    // Keine durchscheinende Fläche: weder Deckkraft unter 1 noch eine Füllung, die Text verdecken oder färben könnte
    expect(k.opacity).toBeUndefined();
    expect(css).not.toMatch(/opacity\s*:\s*0?\.\d/);
    expect(regel('.e > *').border).toMatch(/^var\(--m-leitung\) solid /);
  });

  it('Klick-Wärme: die drei Ringe enden auf verschiedenen Durchmessern, innen der heißeste (Prüfrunde 1 A1-11)', () => {
    expect(regel('.e > *').width).toBe('calc(var(--s) - var(--n, 0) * var(--q, 0px))');
    expect(regel('.k')['--s']).toBe('var(--a-8)');
    expect(regel('.k')['--q']).toBe('var(--a-6)');
    expect(regel('.e')['--q']).toBeUndefined();
    const theme = lies('app/styles/theme.css');
    const rem = (name: string) => Number(theme.match(new RegExp(`${name}: ([\\d.]+)rem;`))![1]) * 16;
    const n = [0, Number(regel('.e > * + *')['--n']), Number(regel('.e > * + * + *')['--n'])];
    const durchmesser = n.map((x) => rem('--a-8') - x * rem('--a-6'));
    expect(durchmesser).toEqual([64, 48, 32]);
  });

  it('Zeitplan wie im Register: je Schicht ½ Takt versetzt; Front d-2, Klick d-3 bis 480 ms; Aufdecken d-2 mit k-aus', () => {
    const schicht = regel('.e > *');
    // Füllung both (Prüfrunde 2 C2-4): Die Schicht hält nach dem Ende den Endwert, das Bandende malt die Seite nicht neu
    expect(schicht.animation).toBe('w var(--d) linear calc(var(--takt) * var(--n, 0)) both');
    const n = [0, Number(regel('.e > * + *')['--n']), Number(regel('.e > * + * + *')['--n']), Number(regel('.e > * + * + * + *')['--n'])];
    const front = MOTION_REGISTER.seitenwechsel;
    const klick = MOTION_REGISTER['klick-waerme'];
    expect(n).toEqual(front.verzoegerungTakte);
    expect(n.slice(0, 3)).toEqual(klick.verzoegerungTakte);
    expect(regel('.e')['--d']).toBe(`var(--${front.dauer[0]})`);
    expect(regel('.k')['--d']).toBe(`var(--${klick.dauer[0]})`);
    // Klick-Wärme: Ringe bis --a-8 (64 px); verblassen in der zweiten Hälfte, Ende = KLICK_ENDE_MS
    expect(lies('app/styles/theme.css')).toMatch(/--a-8: 4rem;/);
    expect(regel('.k').animation).toBe('s var(--d-2) linear var(--d-2) both');
    expect(2 * DAUER_MS['d-2']).toBe(KLICK_ENDE_MS);
    expect(Math.max(...klick.verzoegerungTakte) * TAKT_MS + DAUER_MS['d-3']).toBe(KLICK_ENDE_MS);
    // Aufdecken: Die Front kühlt als Ganzes ab, verblasst und steigt um --a-4, d-2 mit k-aus
    expect(regel('.e[data-auf]')).toEqual({ '--h': 'calc(-1*var(--a-4))', animation: 's var(--d-2) var(--k-aus) both' });
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
