import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUFTAKT_KLASSE, SICHERHEITSNETZ_MS } from '@/lib/motion/head-script';
import { DAUER_MS, DIFFUSION_STUETZ, MOTION_REGISTER, NACHLAUF_ENDE_MS, SICHT_ENDE_MS, TAKT_MS } from '@/lib/motion/register';
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
    expect(mitAnimation).toHaveLength(2);
    const [regel, senkrecht] = mitAnimation;
    // Genau zwei Orte (Hero unter `.auftakt`, Sicht-Bereich), in einer :is()-Liste (sonst schriebe der Build die Regel doppelt)
    const liste = regel.selektor.match(/^:is\((.+)\) \.band$/)?.[1];
    expect(liste?.split(/,\s*(?![^()]*\))/).map((s) => s.trim())).toEqual([`:global(.${AUFTAKT_KLASSE}) [data-waermefeld="hausschnitt"]`, '[data-ablauf="laeuft"]']);
    expect(regel.rumpf).toMatch(/animation: wachsen var\(--d-4\) linear calc\(var\(--takt\) \* var\(--start\)\) backwards;/);
    // Fußbodenheizung (Prüfrunde 1 B1-6): dieselbe Zeit und Füllart, nur senkrecht; nur in einem Sicht-Bereich. Gleiche
    // Spezifität wie die Regel davor (je drei Attribut- bzw. Klassenselektoren), darum muss sie danach stehen
    expect(senkrecht.selektor).toBe('[data-ablauf="laeuft"] [data-wachstum="senkrecht"] .band');
    expect(senkrecht.rumpf.trim()).toBe('animation: steigen var(--d-4) linear calc(var(--takt) * var(--start)) backwards;');
    expect(CSS.indexOf(senkrecht.selektor)).toBeGreaterThan(CSS.indexOf(regel.selektor));
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
    expect(kf.map((k) => k.name)).toEqual(['wachsen', 'steigen']);
    for (const k of kf) for (const stopp of k.stopps) for (const name of stopp.deklarationen.keys()) expect(['transform', 'opacity']).toContain(name);
    expect(kf[0].stopps[0].deklarationen.get('transform')).toBe('scale(0.6)');
    expect(kf[0].stopps.at(-1)!.deklarationen.get('transform')).toBe('scale(1)');
    expect(kf[0].stopps[0].deklarationen.get('opacity')).toBe('0');
  });

  it('steigen (Fußbodenheizung, Prüfrunde 1 B1-6): scaleY genau wie `wachsen` auf DIFFUSION_STUETZ, Deckkraft gleich', () => {
    // Der allgemeine Prüfer zählt einachsiges Skalieren (Leitungen zeichnen) nicht; hier gilt die √t-Regel ausdrücklich
    const [rund, senkrecht] = keyframesIn(ROH);
    expect(senkrecht.stopps.map((s) => s.anteil)).toEqual(DIFFUSION_STUETZ.map(([t]) => t * 100));
    const achse = senkrecht.stopps.map((s) => Number(s.deklarationen.get('transform')!.match(/^scaleY\(([\d.]+)\)$/)![1]));
    const gleich = rund.stopps.map((s) => Number(s.deklarationen.get('transform')!.match(/^scale\(([\d.]+)\)$/)![1]));
    expect(achse).toEqual(gleich);
    const [start, ende] = [achse[0], achse.at(-1)!];
    DIFFUSION_STUETZ.forEach(([, f], i) => expect((achse[i] - start) / (ende - start)).toBeCloseTo(f, 3));
    expect(senkrecht.stopps.map((s) => s.deklarationen.get('opacity'))).toEqual(rund.stopps.map((s) => s.deklarationen.get('opacity')));
    // Nur die Fußbodenheizung wächst senkrecht, aus der Bodenlinie
    for (const [id, feld] of Object.entries(WAERMEFELDER)) {
      expect(feld.wachstum, id).toBe(id === 'raum-fussboden' ? 'senkrecht' : 'radial');
      if (feld.wachstum === 'senkrecht') for (const b of feld.baender) expect(b.ursprung.y, id).toBe(feld.innen.y + feld.innen.hoehe);
    }
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
