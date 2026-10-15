import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TOKENS } from '@/lib/tokens';
import { LINIENARTEN } from '@/lib/zeichnung/norm';
import { Leitungstrenner, Rohrklammer } from '..';
import { TRENNER_BOGEN } from '../Leitungstrenner';

const DIR = path.resolve(__dirname, '..');
const quelle = (datei: string) => readFileSync(path.join(DIR, datei), 'utf8');
const trenner = (props: Parameters<typeof Leitungstrenner>[0] = {}) => renderToStaticMarkup(createElement(Leitungstrenner, props));
const klammer = (props: Parameters<typeof Rohrklammer>[0] = {}) => renderToStaticMarkup(createElement(Rohrklammer, props));

describe('Leitungstrenner (R3-HOME-01, Variante 1; seit E-031 mit S-Bogen)', () => {
  const html = trenner();
  const { breite, hoehe } = TRENNER_BOGEN;

  /** Bögen eines Pfads: Anfang, Halbmesser, Drehsinn und Ende (absolute M/A). */
  function boegen(d: string) {
    const start = d.match(/^M(-?[\d.]+) (-?[\d.]+)/)!;
    let von = [Number(start[1]), Number(start[2])];
    return [...d.matchAll(/A([\d.]+) ([\d.]+) 0 0 ([01]) (-?[\d.]+) (-?[\d.]+)/g)].map((m) => {
      const bis = [Number(m[4]), Number(m[5])];
      const bogen = { von, r: Number(m[1]), ry: Number(m[2]), sweep: Number(m[3]), bis };
      von = bis;
      return bogen;
    });
  }
  /** Abstand zweier Punkte. */
  const abstand = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  it('ist dekorativ: aria-hidden, nicht fokussierbar, ohne Bewegung', () => {
    expect(html).toMatch(/^<span [^>]*aria-hidden="true"[^>]*data-zeichnung="leitungstrenner"/);
    expect(html.match(/<svg /g)).toHaveLength(3);
    expect(html.match(/focusable="false"/g)).toHaveLength(3);
    expect(html).not.toContain('data-motion');
    expect(html).not.toMatch(/<title|role=/);
  });

  it('zeichnet das Paar: Vorlauf oben, Rücklauf darunter, beide als Linienart leitung (runde Enden über .strich)', () => {
    const teile = [...html.matchAll(/<(line|path) class="([^"]+)"/g)].map((m) => m[2]);
    expect(teile).toHaveLength(6);
    expect(teile.filter((k) => /vorlauf/.test(k))).toHaveLength(3);
    expect(teile.filter((k) => /ruecklauf/.test(k))).toHaveLength(3);
    expect(teile.every((k) => /strich/.test(k))).toBe(true);
    // keine Linienenden als Attribut: Enden und Ecken kommen allein aus der Klasse .strich
    expect(html).not.toMatch(/stroke-linecap|stroke-linejoin/);
  });

  it('S-Bogen: konzentrische Bögen mit --radius-2 und --radius-3, Versatz genau ein Paarabstand (lib/tokens)', () => {
    const halb = TOKENS.strich / 2;
    const vl = boegen(TRENNER_BOGEN.vorlauf);
    // Rücklauf ist in Fließrichtung gezeichnet (von rechts zurück): umgedreht, damit beide von links lesen
    const rl = boegen(TRENNER_BOGEN.ruecklauf)
      .reverse()
      .map((b) => ({ ...b, von: b.bis, bis: b.von, sweep: 1 - b.sweep }));
    expect(vl.map((b) => b.r)).toEqual([TOKENS.radius.r3, TOKENS.radius.r2]);
    expect(rl.map((b) => b.r)).toEqual([TOKENS.radius.r2, TOKENS.radius.r3]);
    for (const b of [...vl, ...rl]) expect(b.ry).toBe(b.r);
    // erst nach unten (im Uhrzeigersinn), dann zurück in die Waagerechte
    expect(vl.map((b) => b.sweep)).toEqual([1, 0]);
    expect(rl.map((b) => b.sweep)).toEqual([1, 0]);
    // Anfang und Ende: Vorlauf 1,5 → 13,5, Rücklauf 13,5 → 25,5 (Versatz --paar), Bogen von x = 0 bis zur Breite
    expect([vl[0].von, vl[1].bis]).toEqual([[0, halb], [breite, halb + TOKENS.paar]]);
    expect([rl[0].von, rl[1].bis]).toEqual([[0, halb + TOKENS.paar], [breite, halb + 2 * TOKENS.paar]]);
    // Mittelpunkte: Tangente am Anfang und Ende waagerecht, also Mittelpunkt senkrecht darunter bzw. darüber
    const m1 = [0, halb + TOKENS.radius.r3];
    const m2 = [breite, halb];
    expect([vl[0].von[0], vl[0].von[1] + vl[0].r]).toEqual(m1);
    expect([rl[0].von[0], rl[0].von[1] + rl[0].r]).toEqual(m1);
    expect([vl[1].bis[0], vl[1].bis[1] - vl[1].r]).toEqual(m2);
    expect([rl[1].bis[0], rl[1].bis[1] - rl[1].r]).toEqual(m2);
    // Wendepunkte liegen auf beiden Kreisen (auf 0,02 px): konzentrisch, überall im Abstand --paar
    for (const [bogen, mitte] of [
      [vl[0], m1],
      [rl[0], m1],
      [vl[1], m2],
      [rl[1], m2],
    ] as const) {
      expect(Math.abs(abstand(bogen.von, mitte) - bogen.r)).toBeLessThan(0.02);
      expect(Math.abs(abstand(bogen.bis, mitte) - bogen.r)).toBeLessThan(0.02);
    }
    expect(TOKENS.radius.r3 - TOKENS.radius.r2).toBe(TOKENS.paar);
    // Höhe: zwei Paarabstände + ein Strich, im CSS wie im SVG
    expect(hoehe).toBe(2 * TOKENS.paar + TOKENS.strich);
    expect(html).toContain(`width="${breite}" height="${hoehe}" viewBox="0 0 ${breite} ${hoehe}"`);
    expect(quelle('zeichnung.module.css')).toMatch(/\.trenner \{[^}]*height: calc\(var\(--paar\) \* 2 \+ var\(--m-strich\)\)/);
  });

  it('gerade Stücke vor und nach dem Bogen auf der Höhe der Bogenenden; runde Enden im Seitenrand statt abgeschnitten', () => {
    const halb = TOKENS.strich / 2;
    const linien = [...html.matchAll(/<line class="[^"]*" x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)].map((m) => m.slice(1));
    expect(linien.map(([, y1, , y2]) => [Number(y1), Number(y2)])).toEqual([
      [halb, halb],
      [halb + TOKENS.paar, halb + TOKENS.paar],
      [halb + TOKENS.paar, halb + TOKENS.paar],
      [halb + 2 * TOKENS.paar, halb + 2 * TOKENS.paar],
    ]);
    const css = quelle('zeichnung.module.css').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.trenner \{[^}]*padding-inline: var\(--spacing-gutter\);/);
    expect(css).not.toMatch(/\.trenner \{[^}]*overflow: hidden/);
    expect(css).toMatch(/\.trennerGerade \{[^}]*overflow: visible;/);
  });

  it('der Bogen ist einstellbar (Standard 18 %), Klassen des Aufrufers kommen dazu', () => {
    expect(html).toContain('style="flex-basis:18%"');
    const eigen = trenner({ knick: '40%', className: 'my-8' });
    expect(eigen).toContain('style="flex-basis:40%"');
    expect(eigen).toMatch(/^<span class="[^"]*\bmy-8\b/);
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
  it('Linienarten aus lib/zeichnung/norm.ts (E-029, E-031): Leitung 3 px rund, Kontur 2 px, sonst stumpf, nur Rollenfarben', () => {
    const css = quelle('zeichnung.module.css').replace(/\/\*[\s\S]*?\*\//g, '');
    // Leitungen in der Linienart `leitung` mit runden Enden und Bögen, Abgänge in `kontur`; beide aus den Tokens (theme.css)
    expect(css).toMatch(/\.strich \{[^}]*stroke-width: var\(--m-leitung\);[^}]*stroke-linecap: round;[^}]*stroke-linejoin: round;/);
    expect([LINIENARTEN.leitung.px, LINIENARTEN.kontur.px]).toEqual([TOKENS.linien.leitung, TOKENS.linien.kontur]);
    expect([LINIENARTEN.leitung.enden, LINIENARTEN.leitung.ecken]).toEqual(['round', 'round']);
    const breiten = [...css.matchAll(/stroke-width:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(breiten.length).toBeGreaterThan(3);
    for (const b of breiten) expect(b).toMatch(/^(?:var\(--m-(?:leitung|kontur|fein|mass|strich)\)|calc\(var\(--m-(?:leitung|strich)\) [/+] var\(--[a-z0-9-]+\)\))$/);
    // Runde Enden nur an der Leitung (.strich); jede andere Regel bleibt stumpf (Kreis, Lageplan, Abgänge)
    expect([...css.matchAll(/([^{}]+)\{[^}]*stroke-linecap: round/g)].map((m) => m[1].trim())).toEqual(['.strich']);
    expect([...css.matchAll(/([^{}]+)\{[^}]*stroke-linecap: butt/g)].map((m) => m[1].trim())).toEqual(['.kreisStrich', '.pendelLinie', '.lsAbgang']);
    expect(css).toMatch(/stroke: var\(--vorlauf\)/);
    expect(css).toMatch(/stroke: var\(--ruecklauf\)/);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|--p-[a-z]|rgb\(|--wb-|iso(?:Kalt|Warm)/);
  });

  it('Server-Komponenten ohne Zustand und ohne lucide', () => {
    for (const datei of ['Leitungstrenner.tsx', 'Rohrklammer.tsx']) {
      const src = quelle(datei);
      expect(src).not.toMatch(/['"]use client['"]|\buse(State|Effect|Ref)\b|lucide-react/);
    }
  });
});
