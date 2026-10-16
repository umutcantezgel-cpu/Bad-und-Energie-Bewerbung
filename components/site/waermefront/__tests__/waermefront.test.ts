import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FRONT_BUDGET, FRONT_CSS, modulBytes } from '@/scripts/qa/check-css-chunks.mjs';
import { CURSOR_DATEI, WAERME_ROLLEN_ERLAUBT } from '@/scripts/qa/check-design-tokens.mjs';
import { DAUER_MS, DIFFUSION_STUETZ, KLICK_ENDE_MS, MOTION_REGISTER, TAKT_MS, WECHSEL } from '@/lib/motion/register';
import { FRONT_START, FRONT_VORLAUF_TAKTE } from '@/lib/motion/seitenwechsel';
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
  it('Wachstum nur nach √t: w skaliert FRONT_START → 1 genau auf DIFFUSION_STUETZ, linear; s nur opacity (Verblassen der Klick-Wärme)', () => {
    expect(diffusionsFehler(css)).toEqual([]);
    const k = Object.fromEntries(keyframesIn(css).map((x) => [x.name, x]));
    expect(Object.keys(k).sort()).toEqual(['s', 'w']);
    // Prüfrunde 4 A4-3, C4-1: nicht von Maßstab 0 (eine Scheibe ohne Fläche hat nichts vorzurastern), ein paar Prozent
    expect(FRONT_START).toBeGreaterThan(0);
    const rund = (x: number) => Math.round(x * 1e6) / 1e6;
    expect(k.w.stopps.map((s) => [s.anteil / 100, Number(s.deklarationen.get('scale'))])).toEqual(
      DIFFUSION_STUETZ.map(([t, f]) => [t, rund(FRONT_START + f * (1 - FRONT_START))]),
    );
    expect(k.w.stopps.every((s) => [...s.deklarationen.keys()].join() === 'scale')).toBe(true);
    expect(k.s.stopps).toHaveLength(1);
    expect(Object.fromEntries(k.s.stopps[0].deklarationen)).toEqual({ opacity: '0' });
    // s gehört nur der Klick-Wärme: Die Front verblasst nie (Prüfrunde 3 A3-2: keine Mischfarbe aus Front und Seite)
    expect([...css.matchAll(/animation\s*:\s*s\b/g)]).toHaveLength(1);
    expect(regel('.k').animation).toMatch(/^s /);
  });

  it('Farben: drei warme Bänder kühl → heiß, zuletzt und innen die Seitenfarbe, nie eine einfarbige Pfirsichfläche (Prüfrunde 4 A4-2)', () => {
    expect(Object.keys(WAERME_ROLLEN_ERLAUBT)).toContain(FRONT_CSS);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|gradient|color-mix|filter|shadow|blend|backdrop|rgba?\(|hsla?\(|oklch|infinite/i);
    expect(regel('.e')['--c']).toBe('var(--waerme-1)');
    expect(regel('.e > * + *')['--c']).toBe('var(--waerme-2)');
    expect(regel('.e > * + * + *')['--c']).toBe('var(--waerme-3)');
    // Die letzte Schicht der Front startet zuletzt, liegt oben und damit immer innen; alle wachsen auf denselben
    // Durchmesser (--s, bis zur fernsten Ecke). Am Ende deckt sie das Fenster in der Farbe der Seite, nicht in Pfirsich;
    // sie blendet nie aus (opacity fest 1), die warmen Bänder darunter schon (--o)
    expect(regel('.e > * + * + * + *')).toEqual({ '--n': '1.5', '--c': 'var(--surface)', opacity: '1' });
    expect([...css.matchAll(/--surface/g)]).toHaveLength(1);
    expect(css).not.toMatch(/--waerme-4/);
    expect(regel('.e > *').opacity).toBe('var(--o, 1)');
    expect(regel('.e > *').background).toBe('var(--f, var(--c))');
    expect(regel('.e > *').border).toBe('var(--m-leitung) solid var(--c)');
    const farben = [...css.matchAll(/(?:background|--c|--f)\s*:\s*([^;]+);/g)].map((m) => m[1].trim());
    for (const f of farben) expect(f).toMatch(/^(?:none|var\(--f, var\(--c\)\)|var\(--waerme-[1-3]\)|var\(--surface\))$/);
    // Die Insel blendet die warmen Bänder erst aus, wenn die Seitenfarbe das Fenster deckt
    const quelle = lies(EINGANG);
    expect(quelle).toMatch(/else if \(event\.target === front\.lastElementChild\) \{\s*voll = true;\s*front\.style\.cssText \+= ';--o:0';/);
    expect(quelle.match(/cssText \+= ';--o:/g)).toHaveLength(1);
  });

  it('Ebenen vor dem Wachsen (Prüfrunde 4 A4-3, C4-1): will-change: transform je Schicht, Vorlauf ½ Takt in jeder Verzögerung der Front', () => {
    expect(regel('.e > *')['will-change']).toBe('transform');
    expect([...css.matchAll(/will-change/g)]).toHaveLength(1);
    expect(regel('.e > *').animation).toBe('w var(--d, var(--d-2)) linear calc(var(--takt) * (var(--n, 0) + var(--v, .5))) both');
    expect(Number('.5')).toBe(FRONT_VORLAUF_TAKTE);
    expect(FRONT_VORLAUF_TAKTE * TAKT_MS).toBe(WECHSEL.vorlaufMs);
    // ≥ 2 Bilder bei 60 Hz stehen die Schichten klein als Ebenen, bevor sie wachsen; die Klick-Wärme hat keinen Vorlauf
    expect(WECHSEL.vorlaufMs).toBeGreaterThanOrEqual(2 * (1000 / 60));
    expect(regel('.k')['--v']).toBe('0');
    expect(regel('.e')['--v']).toBeUndefined();
  });

  it('Klick-Wärme je Ton der Fläche (Prüfrunde 3 A3-1): In ihrer Überlagerung stehen die Stufen 1–3 für --klick-1…3, die Insel setzt den Ton der getroffenen Fläche', () => {
    const theme = lies('app/styles/theme.css').replace(/\/\*[\s\S]*?\*\//g, '');
    const block = theme.match(/\[data-motion="klick-waerme"\]\s*\{([^}]*)\}/);
    expect(block, 'Umleitung in theme.css').not.toBeNull();
    expect(block![1].split(';').map((d) => d.trim()).filter(Boolean)).toEqual([
      '--waerme-1: var(--klick-1)',
      '--waerme-2: var(--klick-2)',
      '--waerme-3: var(--klick-3)',
    ]);
    // nach allen Tönen (sonst gewönne ein [data-tone]-Block derselben Spezifität auf der Überlagerung)
    const umleitung = theme.indexOf('[data-motion="klick-waerme"]');
    const toene = [...theme.matchAll(/\[data-tone="\w+"\][^{]*\{([^}]*)\}/g)].filter((m) => /--(?:waerme|klick)-\d/.test(m[1]));
    expect(toene.length).toBeGreaterThanOrEqual(4);
    for (const m of toene) expect(m.index).toBeLessThan(umleitung);
    // die Front nutzt Stufe 4, die es in der Klick-Wärme nicht gibt; die Klick-Wärme hat drei Schichten
    expect(MOTION_REGISTER['klick-waerme'].verzoegerungTakte).toHaveLength(3);
    const quelle = lies(EINGANG);
    expect(quelle).toMatch(/klick\.dataset\.tone = bedien\.closest<HTMLElement>\('\[data-tone\]'\)\?\.dataset\.tone \?\? '';/);
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

  it('Zeitplan wie im Register: je Schicht ½ Takt versetzt, die Front nach dem Vorlauf; Front d-2, Klick d-3 und d-2 bis 480 ms; Aufdecken d-2 mit k-aus', () => {
    const schicht = regel('.e > *');
    // Füllung both (Prüfrunde 2 C2-4): Die Schicht hält nach dem Ende den Endwert, das Bandende malt die Seite nicht neu
    expect(schicht.animation).toMatch(/ both$/);
    const n = [0, Number(regel('.e > * + *')['--n']), Number(regel('.e > * + * + *')['--n']), Number(regel('.e > * + * + * + *')['--n'])];
    const front = MOTION_REGISTER.seitenwechsel;
    const klick = MOTION_REGISTER['klick-waerme'];
    expect(n.map((x) => x + FRONT_VORLAUF_TAKTE)).toEqual(front.verzoegerungTakte);
    expect(n.slice(0, 3).map((x) => x + Number(regel('.k')['--v']))).toEqual(klick.verzoegerungTakte);
    // Dauerstufen genau wie im Register (Prüfrunde 4 C4-3): Front d-2 (Grundwert in der Kurzform), Klick d-3 wachsen und
    // d-2 verblassen; keine weitere Dauer in der Datei
    expect(front.dauer).toEqual(['d-2']);
    expect(schicht.animation).toMatch(new RegExp(`^w var\\(--d, var\\(--${front.dauer[0]}\\)\\) `));
    expect(regel('.e')['--d']).toBeUndefined();
    expect(klick.dauer).toEqual(['d-3', 'd-2']);
    expect(regel('.k')['--d']).toBe(`var(--${klick.dauer[0]})`);
    expect(regel('.k').animation).toBe(`s var(--${klick.dauer[1]}) linear var(--${klick.dauer[1]}) both`);
    expect([...new Set([...css.matchAll(/--d-(\d)/g)].map((m) => `d-${m[1]}`))].sort()).toEqual(['d-2', 'd-3']);
    // Klick-Wärme: Ringe bis --a-8 (64 px); verblassen in der zweiten Hälfte, Ende = KLICK_ENDE_MS
    expect(lies('app/styles/theme.css')).toMatch(/--a-8: 4rem;/);
    expect(2 * DAUER_MS['d-2']).toBe(KLICK_ENDE_MS);
    expect(Math.max(...klick.verzoegerungTakte) * TAKT_MS + DAUER_MS['d-3']).toBe(KLICK_ENDE_MS);
    // Aufdecken (Prüfrunde 3 A3-2): Die Front steigt als Ganzes um --h aus dem Bild, sobald die Insel --u: 1 setzt; d-2
    // mit k-aus, nur per transform; keine Deckkraft auf der letzten Schicht (keine Mischfarbe), die Überlagerung selbst
    // bewegt sich nicht (sonst eine gerade Kante an ihrem Rand)
    expect(schicht.translate).toBe('-50% calc(-50% - var(--h, 0px) * var(--u, 0))');
    expect(schicht.transition).toBe('translate var(--d-2) var(--k-aus)');
    expect(() => regel('.e[data-auf]')).toThrow();
    expect(() => regel('.e[data-auf] > *')).toThrow();
    expect(regel('.e').translate).toBeUndefined();
    expect(lies(EINGANG)).toContain("front.style.cssText += ';--u:1';");
    expect(DAUER_MS['d-2']).toBe(WECHSEL.aufdeckenMs);
    expect(front.kurve).toEqual(['linear', 'k-aus']);
  });

  it('die Überlagerung ist still: keine Zeigerereignisse, contain: strict (beschnitten durch die Malbegrenzung), ohne Rahmen und Fläche des Popovers', () => {
    // contain: strict schließt paint ein: Der Inhalt ist auf die Überlagerung beschnitten wie mit overflow: hidden
    expect(regel('.e')).toEqual({
      '--c': 'var(--waerme-1)',
      width: 'auto',
      height: 'auto',
      border: '0',
      background: 'none',
      'pointer-events': 'none',
      contain: 'strict',
    });
    expect(regel('.e > *')).toMatchObject({
      position: 'absolute',
      'aspect-ratio': '1',
      translate: '-50% calc(-50% - var(--h, 0px) * var(--u, 0))',
      transform: 'scale(var(--m, 1))',
      'border-radius': 'var(--radius-voll)',
    });
    // Selektoren: nur die beiden Klassen, ihre Schichten und [data-auf]
    const selektoren = [...css.matchAll(/(?:^|\})\s*([^{}@]+?)\s*\{/g)].map((m) => m[1].trim()).filter((s) => s.startsWith('.'));
    expect(selektoren).toEqual(['.e', '.k', '.e > *', '.e > * + *', '.e > * + * + *', '.e > * + * + * + *']);
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
    // reduzierte Bewegung und erzwungene Farben: eine Abfrage aus lib/motion/prefers.ts (Prüfrunde 3 C3-4)
    expect(lies(EINGANG)).toMatch(/if \(matchMedia\(OHNE_UEBERLAGERUNG\)\.matches\) return;/);
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
    for (const teil of [
      'showPopover',
      ':popover-open',
      'animationend',
      'transitionend',
      'takeRecords',
      'pageshow',
      'popstate',
      'prefetch',
      'preventDefault',
      'requestAnimationFrame',
      'MutationObserver',
      '(prefers-reduced-motion: reduce), (forced-colors: active)',
    ]) {
      expect(code, teil).toContain(teil);
    }
    // Klick in der Erfassungsphase am Dokument: vor next/link, nach den onClickCapture-Handlern von React
    expect(code).toMatch(/document\.addEventListener\(`click`,\w+,!0\)/);
    expect(code).not.toMatch(/Zwecktext|zweck:/);
    expect(gzip(code)).toBeLessThanOrEqual(2 * 1024);
  }, 30_000);
});
