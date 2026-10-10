import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TOKENS } from '@/lib/tokens';
import { Leitungstrenner, Rohrklammer } from '..';

const DIR = path.resolve(__dirname, '..');
const quelle = (datei: string) => readFileSync(path.join(DIR, datei), 'utf8');
const trenner = (props: Parameters<typeof Leitungstrenner>[0] = {}) => renderToStaticMarkup(createElement(Leitungstrenner, props));
const klammer = (props: Parameters<typeof Rohrklammer>[0] = {}) => renderToStaticMarkup(createElement(Rohrklammer, props));

/** Absolute Eckpunkte eines Pfads aus M/L/H/V (absolute Befehle, wie in den Zeichnungen). */
function punkte(d: string): number[][] {
  let x = 0;
  let y = 0;
  return [...d.matchAll(/([MLHV])\s*(-?[\d.]+)(?:\s+(-?[\d.]+))?/g)].map((m) => {
    const a = Number(m[2]);
    if (m[1] === 'H') x = a;
    else if (m[1] === 'V') y = a;
    else [x, y] = [a, Number(m[3])];
    return [x, y];
  });
}

describe('Leitungstrenner (R3-HOME-01, B Runde 1 / Variante 1)', () => {
  const html = trenner();

  it('ist dekorativ: aria-hidden, nicht fokussierbar, ohne Bewegung', () => {
    expect(html).toMatch(/^<svg [^>]*aria-hidden="true"[^>]*focusable="false"/);
    expect(html).not.toContain('data-motion');
    expect(html).not.toMatch(/<title|role=/);
  });

  it('zeichnet das Paar: Vorlauf oben, Rücklauf unten, je eine Linie mit 45°-Versatz', () => {
    const pfade = [...html.matchAll(/<path class="([^"]+)" d="([^"]+)"/g)];
    expect(pfade).toHaveLength(2);
    expect(pfade[0][1]).toMatch(/vorlauf/);
    expect(pfade[1][1]).toMatch(/ruecklauf/);
    for (const [, , d] of pfade) {
      const [, knickVon, knickBis] = punkte(d);
      // 45°: Weg in x = Weg in y
      expect(Math.abs(knickBis[0] - knickVon[0])).toBe(Math.abs(knickBis[1] - knickVon[1]));
      expect(knickBis[1] - knickVon[1]).toBe(TOKENS.paar);
    }
  });

  it('die Zeichnungswerte folgen --paar und --m-strich (lib/tokens): 1,5 / 13,5 / 25,5 und Schrägen im Abstand --paar', () => {
    const halb = TOKENS.strich / 2;
    const ys = [halb, halb + TOKENS.paar, halb + 2 * TOKENS.paar];
    const [vl, rl] = [...html.matchAll(/ d="([^"]+)"/g)].map((m) => punkte(m[1]));
    expect([vl[0][1], vl[3][1]]).toEqual([ys[0], ys[1]]);
    expect([rl[0][1], rl[3][1]]).toEqual([ys[1], ys[2]]);
    // Abstand der parallelen Schrägen y = x + c: |c1 − c2| / √2 ≈ --paar (auf 0,1 px)
    const c = (p: number[][]) => p[2][1] - p[2][0];
    expect(Math.abs(Math.abs(c(vl) - c(rl)) / Math.SQRT2 - TOKENS.paar)).toBeLessThan(0.1);
    // Höhe im CSS: zwei Paarabstände + ein Strich = unterster Linienrand
    expect(quelle('zeichnung.module.css')).toMatch(/height: calc\(var\(--paar\) \* 2 \+ var\(--m-strich\)\)/);
    expect(ys[2] + halb).toBe(2 * TOKENS.paar + TOKENS.strich);
  });

  it('der Knick ist einstellbar (Standard 18 %), Klassen des Aufrufers kommen dazu', () => {
    expect(html).toContain('<svg x="18%" overflow="visible">');
    const eigen = trenner({ knick: '40%', className: 'my-8' });
    expect(eigen).toContain('<svg x="40%" overflow="visible">');
    expect(eigen).toMatch(/^<svg class="[^"]*\bmy-8\b/);
  });
});

describe('Rohrklammer (R3-HOME-01, B Runde 1 / Variante 1)', () => {
  const html = klammer({ className: 'absolute' });

  it('ist dekorativ und nimmt Lage und Höhe vom Aufrufer', () => {
    expect(html).toMatch(/^<svg class="[^"]*\babsolute\b[^"]*" aria-hidden="true" focusable="false"/);
    expect(html).not.toMatch(/<title|role=/);
  });

  it('oben Vorlauf, unten Rücklauf; die senkrechten Teile treffen sich bei 50 %', () => {
    const teile = [...html.matchAll(/<(path|line) class="([^"]+)"([^>]*)>/g)].map((m) => ({ tag: m[1], klasse: m[2], attr: m[3] }));
    expect(teile.slice(0, 2).every((t) => /vorlauf/.test(t.klasse))).toBe(true);
    expect(teile.slice(2).every((t) => /ruecklauf/.test(t.klasse))).toBe(true);
    expect(teile[1].attr).toContain('y2="50%"');
    expect(teile[2].attr).toContain('y1="-50%"');
    expect(html).toContain('<svg y="100%" overflow="visible">');
  });

  it('Bögen mit --r-2 (12), Strichmitte bei --m-strich/2, Arme enden an --a-5 (24 px)', () => {
    const bogen = [...html.matchAll(/A(\d+) (\d+)/g)].map((m) => Number(m[1]));
    expect(bogen).toEqual([TOKENS.radius.r2, TOKENS.radius.r2]);
    expect(html).toContain(`M${24 - TOKENS.strich / 2} ${TOKENS.strich / 2}H`);
    expect(quelle('zeichnung.module.css')).toMatch(/\.klammer \{[^}]*width: var\(--a-5\)/);
  });
});

describe('Formsystem der Zeichnungen', () => {
  it('eine Strichstärke (--m-strich), runde Enden, nur Rollenfarben, keine Rohwerte', () => {
    const css = quelle('zeichnung.module.css').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/stroke-width: var\(--m-strich\)/);
    expect(css).toMatch(/stroke-linecap: round/);
    expect(css).toMatch(/stroke: var\(--vorlauf\)/);
    expect(css).toMatch(/stroke: var\(--ruecklauf\)/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|--p-[a-z]|rgb\(/);
  });

  it('Server-Komponenten ohne Zustand und ohne lucide', () => {
    for (const datei of ['Leitungstrenner.tsx', 'Rohrklammer.tsx']) {
      const src = quelle(datei);
      expect(src).not.toMatch(/['"]use client['"]|\buse(State|Effect|Ref)\b|lucide-react/);
    }
  });
});
