import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUFTAKT_KLASSE, SICHERHEITSNETZ_MS } from '@/lib/motion/head-script';
import { DAUER_MS, MOTION_REGISTER, NACHLAUF_ENDE_MS, SICHT_ENDE_MS, TAKT_MS } from '@/lib/motion/register';
import { diffusionsFehler, keyframesIn } from '@/lib/motion/__tests__/keyframes';
import { WAERMEFELDER } from '@/lib/zeichnung/szenen/waermefeld';

/**
 * Bewegung des Wärmefelds (E-031, K-009, Register `waerme-breitet-sich-aus`): waerme.module.css wird gelesen wie
 * einstieg.module.css in components/home/__tests__/einstieg-bewegung.test.ts. Die Bänder wachsen einmal nach √t (d-4,
 * linear auf DIFFUSION_STUETZ), im Hero unter `.auftakt` (Auslöser `nachlauf`), auf Seiten beim Sichtbarwerden
 * (`sicht`, [data-ablauf="laeuft"]); die Startverzögerung kommt aus den Daten (`--start`, Takte).
 */

const ROH = readFileSync(path.resolve(__dirname, '../waerme.module.css'), 'utf8');
const CSS = ROH.replace(/\/\*[\s\S]*?\*\//g, '');
const W = MOTION_REGISTER['waerme-breitet-sich-aus'];

/** Regeln mit Selektor und Rumpf (ohne @keyframes, mit @media-Inhalten). */
function regeln(css: string): { selektor: string; rumpf: string; media: string | null }[] {
  const out: { selektor: string; rumpf: string; media: string | null }[] = [];
  const ohneKeyframes = css.replace(/@keyframes\s+[\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*\s*\}/g, '');
  for (const m of ohneKeyframes.matchAll(/@media([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)) {
    for (const [, selektor, rumpf] of m[2].matchAll(/([^{}]+)\{([^{}]*)\}/g)) out.push({ selektor: selektor.trim(), rumpf, media: m[1].trim() });
  }
  const ohneMedia = ohneKeyframes.replace(/@media[^{]+\{(?:[^{}]*\{[^{}]*\})*\s*\}/g, '');
  for (const [, selektor, rumpf] of ohneMedia.matchAll(/([^{}]+)\{([^{}]*)\}/g)) out.push({ selektor: selektor.trim(), rumpf, media: null });
  return out;
}

describe('Wärmefeld: Bewegung (E-031)', () => {
  const alle = regeln(CSS);

  it('läuft nur im Hero unter `.auftakt` oder in einem SichtStart-Bereich unter [data-ablauf="laeuft"], einmal, Füllart backwards', () => {
    const mitAnimation = alle.filter((r) => /animation\s*:/.test(r.rumpf));
    expect(mitAnimation).toHaveLength(1);
    const [regel] = mitAnimation;
    expect(regel.selektor.split(',').map((s) => s.trim())).toEqual([`:global(.${AUFTAKT_KLASSE}) [data-waermefeld="hausschnitt"] .band`, '[data-ablauf="laeuft"] .band']);
    expect(regel.rumpf).toMatch(/animation: wachsen var\(--d-4\) linear calc\(var\(--takt\) \* var\(--start\)\) backwards;/);
    expect(CSS).not.toMatch(/infinite|animation-iteration-count|animation-name|\bforwards\b|\bboth\b/);
    expect(CSS).not.toMatch(/\d+ms\b|\d+(?:\.\d+)?s\b(?![a-z-])/);
    // Register: Dauer d-4, Kurve linear, nur transform und opacity
    expect(W.dauer).toEqual(['d-4']);
    expect(W.kurve).toEqual(['linear']);
    expect([...W.eigenschaften].sort()).toEqual(['opacity', 'transform']);
  });

  it('wächst nach √t: Stützstellen DIFFUSION_STUETZ, Maßstab 0,6 → 1, nur transform und opacity in den Keyframes', () => {
    expect(diffusionsFehler(ROH)).toEqual([]);
    const kf = keyframesIn(ROH);
    expect(kf.map((k) => k.name)).toEqual(['wachsen']);
    for (const stopp of kf[0].stopps) for (const name of stopp.deklarationen.keys()) expect(['transform', 'opacity']).toContain(name);
    expect(kf[0].stopps[0].deklarationen.get('transform')).toBe('scale(0.6)');
    expect(kf[0].stopps.at(-1)!.deklarationen.get('transform')).toBe('scale(1)');
    expect(kf[0].stopps[0].deklarationen.get('opacity')).toBe('0');
  });

  it('Enden wie im Register: Hero (nachlauf) ≤ 1.920 ms vor dem Sicherheitsnetz, Wärmepumpen-Seite (sicht) ≤ 2.400 ms', () => {
    const ende = (takte: number[]) => Math.max(...takte) * TAKT_MS + DAUER_MS['d-4'];
    const hero = WAERMEFELDER.hausschnitt.baender.map((b) => b.startTakte);
    expect(ende(hero)).toBe(W.fenster!.nachlauf!.endeMs);
    expect(ende(hero)).toBeLessThanOrEqual(NACHLAUF_ENDE_MS);
    expect(ende(hero)).toBeLessThan(SICHERHEITSNETZ_MS);
    const raum = [...WAERMEFELDER['raum-heizkoerper'].baender, ...WAERMEFELDER['raum-fussboden'].baender].map((b) => b.startTakte);
    expect(ende(raum)).toBe(W.fenster!.sicht!.endeMs);
    expect(ende(raum)).toBeLessThanOrEqual(SICHT_ENDE_MS);
    // Der erste Start im Hero, wenn der Vorlauf den Heizkörper erreicht (Ende vorlauf-haus)
    expect(Math.min(...hero) * TAKT_MS).toBe(MOTION_REGISTER['vorlauf-haus'].endeMs);
  });

  it('Grundwerte = Endzustand; will-change nur während des Laufs; vor dem Sichtbarwerden unsichtbar, im Druck da', () => {
    const band = alle.find((r) => r.selektor === '.grund,\n.band' || r.selektor.replace(/\s+/g, ' ') === '.grund, .band')!;
    expect(band.rumpf).not.toMatch(/opacity|transform|will-change|animation/);
    const willChange = alle.filter((r) => /will-change/.test(r.rumpf));
    expect(willChange).toHaveLength(1);
    expect(willChange[0].rumpf).toMatch(/animation:/);
    const bereit = alle.filter((r) => r.selektor === '[data-ablauf="bereit"] .band');
    expect(bereit.map((r) => [r.media, r.rumpf.replace(/\s+/g, ' ').trim()])).toEqual([
      ['print', 'opacity: 1;'],
      [null, 'opacity: 0;'],
    ]);
  });

  it('Farben nur aus der Wärmerampe (Band 0 bis 4), keine Verläufe, Filter, Mischfarben oder Rohfarben', () => {
    const farben = [...CSS.matchAll(/(?:^|[\s;{])(fill|stroke|color|background-color|border(?:-color)?)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]);
    expect(farben).toEqual([
      ['background-color', 'var(--waerme-0)'],
      ['fill', 'var(--waerme-0)'],
      ['fill', 'var(--waerme-1)'],
      ['fill', 'var(--waerme-2)'],
      ['fill', 'var(--waerme-3)'],
      ['fill', 'var(--waerme-4)'],
    ]);
    for (const [, wert] of farben) expect(wert).toMatch(/^(?:var\(--waerme-[0-4]\)|transparent)$/);
    expect(CSS).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl|oklch)a?\(|color-mix|gradient|filter|mix-blend|box-shadow|--p-[a-z]/);
  });
});
