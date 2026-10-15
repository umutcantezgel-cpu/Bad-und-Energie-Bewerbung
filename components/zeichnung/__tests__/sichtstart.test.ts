import { readFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SichtStart } from '../bewegung/SichtStart';

const ROOT = path.resolve(__dirname, '../../..');
const quelle = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const gzip = (s: string) => gzipSync(Buffer.from(s, 'utf8'), { level: 9 }).length;
const EINGANG = 'components/zeichnung/bewegung/SichtStart.tsx';

describe('SichtStart (E-031, Auslöser sicht)', () => {
  it('der Server liefert den Endzustand: data-ablauf="fertig" um den Bereich', () => {
    const m = renderToStaticMarkup(createElement(SichtStart, { className: 'figur' }, createElement('svg', { 'data-motion': 'waerme-breitet-sich-aus' })));
    expect(m).toBe('<div class="figur" data-ablauf="fertig"><svg data-motion="waerme-breitet-sich-aus"></svg></div>');
    expect(renderToStaticMarkup(createElement(SichtStart, null))).toBe('<div data-ablauf="fertig"></div>');
  });

  it('Client-Insel ≤ 1 KB: minifiziertes Bündel mit allem, was sie in den Browser zieht (React extern)', async () => {
    expect(quelle(EINGANG).startsWith("'use client';")).toBe(true);
    // Die Insel importiert nur React und die reine Logik; die zieht nur die Medienabfragen nach, die nichts weiter
    const importe = [...quelle(EINGANG).matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    expect(importe.sort()).toEqual(['@/lib/motion/ablauf', 'react']);
    expect([...quelle('lib/motion/ablauf.ts').matchAll(/from '([^']+)'/g)].map((m) => m[1])).toEqual(['./prefers']);
    expect([...quelle('lib/motion/prefers.ts').matchAll(/from '([^']+)'/g)]).toEqual([]);
    const { build } = await import('rolldown');
    const ergebnis = await build({
      input: path.join(ROOT, EINGANG),
      external: [/^react(?:\/|$)/],
      resolve: { alias: { '@': ROOT } },
      output: { minify: true, format: 'esm' },
      write: false,
    });
    const code = ergebnis.output[0].code;
    expect(code).toContain('IntersectionObserver');
    expect(code).toContain('getAnimations');
    expect(code).toContain('data-ablauf');
    expect(gzip(code)).toBeLessThanOrEqual(1024);
  }, 30_000);
});
