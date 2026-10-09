import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const FONTS = path.resolve(__dirname, '..');
const ROOT = path.resolve(FONTS, '../..');
const source = readFileSync(path.join(FONTS, 'index.ts'), 'utf8');
const files = readdirSync(FONTS).filter((f) => f.endsWith('.woff2'));

/** localFont({...})-Aufrufe als Text, je Variable. */
const calls = [...source.matchAll(/const (\w+) = localFont\(\{([\s\S]*?)\n\}\);/g)].map((m) => ({ name: m[1], body: m[2] }));

describe('Schriften (KERN K-005, K-013)', () => {
  it('liefert drei Familien in latin und latin-ext, zusammen ≤ 250 KB', () => {
    expect(files.sort()).toEqual([
      'atkinson-hyperlegible-next-latin-ext-wght-normal.woff2',
      'atkinson-hyperlegible-next-latin-wght-normal.woff2',
      'bricolage-grotesque-latin-ext-opsz-normal.woff2',
      'bricolage-grotesque-latin-opsz-normal.woff2',
      'martian-mono-latin-ext-wdth-normal.woff2',
      'martian-mono-latin-wdth-normal.woff2',
    ]);
    const total = files.reduce((sum, f) => sum + statSync(path.join(FONTS, f)).size, 0);
    expect(total).toBeLessThanOrEqual(250 * 1024);
  });

  it('bindet jede Datei mit unicode-range ein und lädt genau zwei vor (Display-latin, Text-latin)', () => {
    expect(calls).toHaveLength(6);
    for (const { name, body } of calls) {
      expect(body, name).toMatch(/prop: 'unicode-range'/);
      expect(body, name).toMatch(/display: 'swap'/);
    }
    const preloaded = calls.filter((c) => /preload: true/.test(c.body)).map((c) => c.body.match(/src: '\.\/([^']+)'/)![1]);
    expect(preloaded.sort()).toEqual(['atkinson-hyperlegible-next-latin-wght-normal.woff2', 'bricolage-grotesque-latin-opsz-normal.woff2']);
    for (const file of files) expect(source, file).toContain(`'./${file}'`);
  });

  it('gibt die Ersatzschrift mit Metrik-Ausgleich nur den latin-Teilmengen (latin-ext stünde sonst davor)', () => {
    for (const { name, body } of calls) {
      if (name.endsWith('Ext')) {
        expect(body, name).toMatch(/adjustFontFallback: false/);
        expect(body, name).not.toMatch(/fallback: \[/);
      } else if (name === 'martian') {
        // eigene, auf Breite 75 % abgeglichene Ersatzschrift in globals.css
        expect(body, name).toMatch(/adjustFontFallback: false/);
        expect(body, name).toMatch(/fallback: \['Martian Ersatz'/);
      } else expect(body, name).toMatch(/adjustFontFallback: 'Arial'/);
    }
    const globals = readFileSync(path.join(ROOT, 'app/globals.css'), 'utf8');
    expect(globals).toMatch(/font-family: "Martian Ersatz";[\s\S]*?size-adjust: \d+%;[\s\S]*?ascent-override/);
  });

  it('öffnet die Breitenachse von Martian Mono (font-stretch 75 %)', () => {
    for (const { name, body } of calls.filter((c) => c.name.startsWith('martian'))) {
      expect(body, name).toMatch(/prop: 'font-stretch', value: '75% 112.5%'/);
    }
  });

  it('nutzt die Variablen, die theme.css zusammensetzt; Inter und next/font/google entfallen', () => {
    const theme = readFileSync(path.join(ROOT, 'app/styles/theme.css'), 'utf8');
    for (const variable of source.matchAll(/variable: '(--font-[\w-]+)'/g)) expect(theme).toContain(`var(${variable[1]}`);
    const layout = readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf8');
    expect(layout).not.toMatch(/next\/font\/google|Inter\(/);
    expect(layout).toContain("from './fonts'");
  });

  it('führt die Lizenzen (OFL) mit Copyright-Vermerken', () => {
    const licenses = readFileSync(path.join(FONTS, 'LIZENZEN.md'), 'utf8');
    expect(licenses).toContain('SIL OPEN FONT LICENSE Version 1.1');
    for (const family of ['Bricolage Grotesque', 'Atkinson Hyperlegible Next', 'Martian Mono']) expect(licenses).toContain(family);
    for (const file of files) expect(licenses).toContain(file);
  });
});
