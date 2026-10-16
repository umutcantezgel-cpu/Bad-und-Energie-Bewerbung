import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUFTAKT_KLASSE, SICHERHEITSNETZ_MS } from '@/lib/motion/head-script';
import { DAUER_MS, DIFFUSION_STUETZ, MOTION_REGISTER, NACHLAUF_ENDE_MS, SICHT_ENDE_MS, TAKT_MS } from '@/lib/motion/register';
import { diffusionsFehler, keyframesIn } from '@/lib/motion/__tests__/keyframes';
import { HEIZKOERPER_LAGE } from '@/lib/zeichnung/szenen/hausschnitt';
import { RAUM_HEIZKOERPER } from '@/lib/zeichnung/szenen/raumschnitt';
import { WAERMEFELDER } from '@/lib/zeichnung/szenen/waermefeld';

/**
 * Bewegung des Wärmefelds (E-031, K-009, Register `waerme-breitet-sich-aus`): waerme.module.css wird gelesen wie
 * einstieg.module.css in components/home/__tests__/einstieg-bewegung.test.ts. Die Bänder wachsen einmal nach √t (d-4,
 * linear auf DIFFUSION_STUETZ), senkrecht aus ihrem Ursprung (Prüfrunde 4 B4-2: die Fahne aus der Oberkante des
 * Heizkörpers, die Deckenschicht von der Decke, die Fußbodenheizung vom Boden), im Hero unter `.auftakt` (Auslöser
 * `nachlauf`), auf Seiten beim Sichtbarwerden (`sicht`, [data-ablauf="laeuft"]); die Startverzögerung kommt aus den
 * Daten (`--start`, Takte). Was die Zwischenstände zeigen, prüft lib/zeichnung/__tests__/waermefeld.test.ts.
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
    expect(mitAnimation).toHaveLength(2);
    const [regel, decke] = mitAnimation;
    // Genau zwei Orte (Hero unter `.auftakt`, Sicht-Bereich), in einer :is()-Liste (sonst schriebe der Build die Regel doppelt)
    const ORTE = [`:global(.${AUFTAKT_KLASSE}) [data-waermefeld="hausschnitt"]`, '[data-ablauf="laeuft"]'];
    const liste = regel.selektor.match(/^:is\((.+)\) \.band$/)?.[1];
    expect(liste?.split(/,\s*(?![^()]*\))/).map((s) => s.trim())).toEqual(ORTE);
    expect(regel.rumpf).toMatch(/animation: wachsen var\(--d-4\) linear calc\(var\(--takt\) \* var\(--start\)\) backwards;/);
    // Die Deckenschicht (Prüfrunde 4 B4-2) an denselben Orten, genauer (Attribut aus den Daten), danach: gleiche Zeit und Füllart
    const listeDecke = decke.selektor.match(/^:is\((.+)\) \.band\[data-bewegung="einblenden"\]$/)?.[1];
    expect(listeDecke?.split(/,\s*(?![^()]*\))/).map((s) => s.trim())).toEqual(ORTE);
    expect(decke.rumpf.trim()).toBe('animation: einblenden var(--d-4) linear calc(var(--takt) * var(--start)) backwards;');
    expect(CSS.indexOf(decke.selektor)).toBeGreaterThan(CSS.indexOf(regel.selektor));
    // Die Richtung gibt allein der Ursprung jedes Bands (keine eigene Bewegung je Feld mehr)
    expect(CSS).not.toMatch(/data-wachstum|steigen/);
    expect(CSS).not.toMatch(/infinite|animation-iteration-count|animation-name|\bforwards\b|\bboth\b/);
    expect(CSS).not.toMatch(/\d+ms\b|\d+(?:\.\d+)?s\b(?![a-z-])/);
    // Register: Dauer d-4, Kurve linear, nur transform und opacity
    expect(W.dauer).toEqual(['d-4']);
    expect(W.kurve).toEqual(['linear']);
    expect([...W.eigenschaften].sort()).toEqual(['opacity', 'transform']);
  });

  it('wächst nach √t, senkrecht (Prüfrunde 4 B4-2): genau ein Ablauf `wachsen`, scaleY 0,6 → 1 auf DIFFUSION_STUETZ, Deckkraft 0 → 1 im ersten Viertel, nur transform und opacity', () => {
    // Der allgemeine Prüfer zählt einachsiges Skalieren (Leitungen zeichnen) nicht; hier gilt die √t-Regel ausdrücklich
    expect(diffusionsFehler(ROH)).toEqual([]);
    const kf = keyframesIn(ROH);
    expect(kf.map((k) => k.name)).toEqual(['wachsen', 'einblenden']);
    const [wachsen, einblenden] = kf;
    for (const stopp of wachsen.stopps) for (const name of stopp.deklarationen.keys()) expect(['transform', 'opacity']).toContain(name);
    expect(wachsen.stopps.map((s) => s.anteil)).toEqual(DIFFUSION_STUETZ.map(([t]) => t * 100));
    const achse = wachsen.stopps.map((s) => Number(s.deklarationen.get('transform')!.match(/^scaleY\(([\d.]+)\)$/)![1]));
    expect([achse[0], achse.at(-1)]).toEqual([0.6, 1]);
    DIFFUSION_STUETZ.forEach(([, f], i) => expect((achse[i] - 0.6) / 0.4).toBeCloseTo(f, 3));
    expect(wachsen.stopps.map((s) => s.deklarationen.get('opacity'))).toEqual(['0', '0.5', '1', undefined, undefined]);
    // Einblenden: nur die Deckkraft, 0 → 1 nach √t auf denselben Stützstellen, kein Maßstab
    expect(einblenden.stopps.map((s) => s.anteil)).toEqual(DIFFUSION_STUETZ.map(([t]) => t * 100));
    expect(einblenden.stopps.map((s) => [...s.deklarationen.keys()])).toEqual(DIFFUSION_STUETZ.map(() => ['opacity']));
    DIFFUSION_STUETZ.forEach(([, f], i) => expect(Number(einblenden.stopps[i].deklarationen.get('opacity'))).toBeCloseTo(f, 9));
  });

  it('Bewegung und Ursprung je Band aus den Daten (Prüfrunde 4 B4-2): Deckenschicht blendet an der Decke ein, die Fahne wächst aus der Oberkante des Heizkörpers, die warme Schicht der Fußbodenheizung aus dem Boden', () => {
    for (const [id, feld] of Object.entries(WAERMEFELDER)) {
      expect(feld.wachstum, id).toBe('senkrecht');
      const { innen } = feld;
      for (const b of feld.baender) {
        if (id === 'raum-fussboden') expect(b.ursprung.y, `${id} ${b.stufe}`).toBe(innen.y + innen.hoehe);
        else expect(b.ursprung.y, `${id} ${b.stufe}`).toBe(b.bewegung === 'einblenden' ? innen.y : id === 'hausschnitt' ? HEIZKOERPER_LAGE.y : RAUM_HEIZKOERPER.y);
      }
    }
    // Die beiden kühlsten Stufen der Räume mit Heizkörper sind Deckenschicht, die beiden heißesten Fahne; mit
    // Fußbodenheizung blendet die Luft bis zur Decke ein, die warme Schicht über dem Boden wächst
    for (const id of ['hausschnitt', 'raum-heizkoerper'] as const) expect(WAERMEFELDER[id].baender.map((b) => b.bewegung), id).toEqual(['einblenden', 'einblenden', 'wachsen', 'wachsen']);
    expect(WAERMEFELDER['raum-fussboden'].baender.map((b) => b.bewegung)).toEqual(['einblenden', 'wachsen']);
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
    // Unsichtbar nur am Bildschirm; im Druck gilt der Grundwert (sichtbar)
    const bereit = alle.filter((r) => r.selektor.includes('[data-ablauf="bereit"]'));
    expect(bereit.map((r) => [r.selektor, r.media, r.rumpf.replace(/\s+/g, ' ').trim()])).toEqual([['[data-ablauf="bereit"] .band', 'screen', 'opacity: 0;']]);
    expect(alle.filter((r) => /(?:^|;)\s*opacity\s*:/.test(r.rumpf)).map((r) => r.selektor)).toEqual(['[data-ablauf="bereit"] .band']);
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
