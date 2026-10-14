import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUFTAKT_KLASSE } from '@/lib/motion/head-script';
import { AUFTAKT_ENDE_MS, DAUER_MS, MOTION_IDS, MOTION_REGISTER, TAKT_MS, type MotionId } from '@/lib/motion/register';

const CSS = readFileSync(path.resolve(__dirname, '../einstieg/einstieg.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Millisekunden eines Ausdrucks aus --d-n, --takt, Zahlen, + und * (wie im CSS-Modul geschrieben). */
function ms(ausdruck: string): number {
  const js = ausdruck
    .replace(/calc\(/g, '(')
    .replace(/var\(--d-(\d)\)/g, (_, n: string) => String(DAUER_MS[`d-${n}` as keyof typeof DAUER_MS]))
    .replace(/var\(--takt\)/g, String(TAKT_MS));
  if (!/^[\d\s+*/().]+$/.test(js)) throw new Error(`unbekannter Ausdruck: ${ausdruck}`);
  return Function(`"use strict"; return (${js});`)() as number;
}

interface Ablauf {
  selektor: string;
  /** Kennung aus [data-motion="…"] im Selektor. */
  id: MotionId;
  dauer: number;
  verzoegerung: number;
  /** Verzögerung als Ausdruck, wie geschrieben. */
  ausdruck: string;
  kurve: string;
}

/** Alle animation-Kurzformen des Moduls mit Selektor; je Teil eines Selektors ein Eintrag. */
function ablaeufe(): Ablauf[] {
  const out: Ablauf[] = [];
  for (const [, selektor, rumpf] of CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const kurz = rumpf.match(/animation:\s*([^;]+);/);
    if (!kurz) continue;
    // Name Dauer Kurve Verzögerung backwards
    const teile = kurz[1].trim().match(/^(\S+)\s+(var\(--d-[1-4]\))\s+(var\(--k-[a-z]+\)|linear)\s+(.+?)\s+backwards$/);
    if (!teile) throw new Error(`unerwartete Kurzform: ${kurz[1]}`);
    for (const teil of selektor.split(',').map((s) => s.trim())) {
      const id = teil.match(/\[data-motion="([^"]+)"\]/)?.[1] as MotionId | undefined;
      if (!id) throw new Error(`Ablauf ohne Kennung: ${teil}`);
      out.push({ selektor: teil, id, dauer: ms(teile[2]), verzoegerung: ms(teile[4]), ausdruck: teile[4], kurve: teile[3] });
    }
  }
  return out;
}

const kurve = (k: string) => (k === 'linear' ? 'linear' : k.replace(/^var\(--(k-[a-z]+)\)$/, '$1'));

describe('Auftakt „Die Anlage läuft an“ (K-009, E-029, Register)', () => {
  const liste = ablaeufe();
  const von = (klasse: string) => liste.find((a) => a.selektor.includes(`.${klasse}[`))!;

  it('läuft nur unter `.auftakt` (Kopfskript) im Abschnitt `.held`; es gibt keinen zweiten Auslöser und keine Schleife', () => {
    expect(liste.length).toBeGreaterThanOrEqual(13);
    for (const { selektor } of liste) {
      expect(selektor, selektor).toMatch(new RegExp(`^:global\\(\\.${AUFTAKT_KLASSE}\\) \\.held `));
    }
    expect(CSS).not.toMatch(/data-kreislauf|infinite|animation-iteration-count/);
  });

  it('jede Kennung steht im Register mit dem Auslöser `auftakt`, Dauer, Kurve und Verzögerung wie dort eingetragen', () => {
    for (const a of liste) {
      expect(MOTION_IDS as readonly string[], a.selektor).toContain(a.id);
      const eintrag = MOTION_REGISTER[a.id];
      expect(eintrag.ausloeser, a.selektor).toEqual(['auftakt']);
      expect(eintrag.dauer.map((d) => DAUER_MS[d]), a.selektor).toContain(a.dauer);
      expect(eintrag.kurve, a.selektor).toContain(kurve(a.kurve));
      expect(eintrag.verzoegerungTakte, a.selektor).toContain(a.verzoegerung / TAKT_MS);
      // Das Register nennt das späteste Ende des Teils
      expect(a.verzoegerung + a.dauer, a.selektor).toBeLessThanOrEqual(eintrag.endeMs!);
    }
    // Jede Kennung erreicht ihr eingetragenes Ende genau einmal
    for (const id of new Set(liste.map((a) => a.id))) {
      const ende = Math.max(...liste.filter((a) => a.id === id).map((a) => a.verzoegerung + a.dauer));
      expect(ende, id).toBe(MOTION_REGISTER[id].endeMs);
    }
  });

  it('Verzögerungen nur als Vielfache des Takts (ganze oder halbe Takte), Dauer nur Stufen d-1…d-4', () => {
    for (const a of liste) {
      expect(a.ausdruck, a.selektor).toMatch(/^calc\(var\(--takt\) \* \d+(?:\.5)?\)$/);
      expect(Object.values(DAUER_MS), a.selektor).toContain(a.dauer);
    }
    expect(CSS).not.toMatch(/\d+ms\b|\d+(?:\.\d+)?s\b(?![a-z-])/);
  });

  it('endet nach AUFTAKT_ENDE_MS (1.120 ms, Budget ≤ 1,5 s) mit dem Maß „35 km“; die Uhr und der Zirkel sind entfallen', () => {
    const ende = Math.max(...liste.map((a) => a.dauer + a.verzoegerung));
    expect(ende).toBe(AUFTAKT_ENDE_MS);
    expect(ende).toBeLessThanOrEqual(1500);
    const mass = liste.find((a) => a.id === 'radius-einrasten')!;
    expect(mass.verzoegerung + mass.dauer).toBe(AUFTAKT_ENDE_MS);
    expect(mass.dauer).toBe(DAUER_MS['d-2']);
    expect(mass.verzoegerung).toBe(11 * TAKT_MS);
    expect(CSS).not.toMatch(/data-motion="(?:uhr|kreislauf-zeigen|luefter|waerme)"/);
    expect(CSS).not.toMatch(/zirkel/i);
  });

  it('Fließrichtung (K-001): erst der Vorlauf aus der Anlage, dann der Rücklauf; die Leitung zur Bewerbung folgt dem Vorlauf', () => {
    const vl = liste.find((a) => a.id === 'vorlauf-haus')!;
    const rl = liste.find((a) => a.id === 'ruecklauf-haus')!;
    expect(vl.verzoegerung).toBeLessThan(rl.verzoegerung);
    // Mobil: Leiste → Schacht oben → Abzweig in den Knopf (Vorlauf); danach unten zurück
    const mobil = ['leisteVl', 'schachtVlOben', 'abzweig'].map((k) => von(k).verzoegerung);
    expect(mobil).toEqual([...mobil].sort((a, b) => a - b));
    expect(new Set(mobil).size).toBe(3);
    expect(mobil[0]).toBeGreaterThanOrEqual(vl.verzoegerung + vl.dauer);
    // Der Rücklauf steigt erst, wenn der Vorlauf im Knopf ist
    expect(von('leisteRl').verzoegerung).toBeGreaterThan(von('abzweig').verzoegerung);
    // Desktop: Fläche → Bogen → Steigleitung → Bogen → Knopf, lückenlos nacheinander
    const desktop = ['rohrD1', 'rohrD2', 'rohrD3', 'rohrD4'].map((k) => von(k));
    for (const d of desktop) expect(d.id).toBe('erdleitung-d');
    for (let i = 1; i < desktop.length; i++) expect(desktop[i].verzoegerung).toBeGreaterThan(desktop[i - 1].verzoegerung);
    expect(desktop[0].verzoegerung).toBeGreaterThanOrEqual(vl.verzoegerung + vl.dauer);
    // Der Vorlauf fällt von oben (Anlage), der Rücklauf steigt von unten
    expect(CSS).toMatch(/\.schachtVlOben,\s*\.schachtVlUnten,\s*\.leisteVl \{\s*transform-origin: top;/);
    expect(CSS).toMatch(/\.schachtRl,\s*\.leisteRl \{\s*transform-origin: bottom;/);
  });

  it('Füllart backwards: der Grundwert ist der Endzustand (ohne Skript und reduziert sofort fertig)', () => {
    for (const kurz of CSS.matchAll(/animation:\s*([^;]+);/g)) {
      expect(kurz[1]).toMatch(/\bbackwards$/);
    }
    expect(CSS).not.toMatch(/\bforwards\b|\bboth\b/);
  });

  it('bewegt nur transform, opacity und stroke-dashoffset', () => {
    const keyframes = [...CSS.matchAll(/@keyframes\s+\w+\s*\{([\s\S]*?\})\s*\}/g)].map((m) => m[1]);
    expect(keyframes.length).toBeGreaterThanOrEqual(4);
    for (const kf of keyframes) {
      for (const prop of kf.matchAll(/([a-z-]+)\s*:/g)) expect(['transform', 'opacity', 'stroke-dashoffset']).toContain(prop[1]);
    }
    expect(CSS).not.toMatch(/transition:\s*[^;]*(?:width|height|top|left|stroke-width|fill)\b/);
  });
});
