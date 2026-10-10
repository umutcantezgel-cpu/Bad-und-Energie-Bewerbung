import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUFTAKT_KLASSE } from '@/lib/motion/head-script';
import { AUFTAKT_ENDE_MS, DAUER_MS, MOTION_REGISTER, TAKT_MS } from '@/lib/motion/register';
import { KREISLAUF_ATTR, kreislaufStarten } from '../einstieg/KreislaufKnopf';

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

/** Alle animation-Kurzformen und Verzögerungen des Moduls mit ihrem Selektor. */
function ablaeufe() {
  const regeln = [...CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const out: { selektor: string; dauer: number; verzoegerung: number }[] = [];
  for (const [, selektor, rumpf] of regeln) {
    const kurz = rumpf.match(/animation:\s*([^;]+);/);
    if (!kurz) continue;
    // Name Dauer Kurve [Verzögerung] backwards
    const teile = kurz[1].trim().match(/^(\S+)\s+(var\(--d-[1-4]\))\s+(var\(--k-[a-z]+\)|linear)(?:\s+(.+?))?\s+backwards$/);
    if (!teile) throw new Error(`unerwartete Kurzform: ${kurz[1]}`);
    out.push({ selektor: selektor.trim(), dauer: ms(teile[2]), verzoegerung: teile[4] ? ms(teile[4]) : 0 });
  }
  return out;
}

describe('Auftakt „Der Kreislauf läuft an“ (K-009, Register)', () => {
  const liste = ablaeufe();

  it('läuft unter `.auftakt` (Kopfskript) und unter data-kreislauf="lauf" (Knopf), sonst nie', () => {
    expect(liste.length).toBeGreaterThanOrEqual(14);
    for (const { selektor } of liste) {
      const teile = selektor.split(',').map((s) => s.trim());
      expect(teile, selektor).toHaveLength(2);
      expect(teile[0], selektor).toMatch(new RegExp(`^:global\\(\\.${AUFTAKT_KLASSE}\\) \\.held `));
      expect(teile[1], selektor).toMatch(/^\.held\[data-kreislauf="lauf"\] /);
    }
  });

  it('jede Dauer ist eine Stufe d-1…d-4, Verzögerungen nur aus Takt (auch ½) und Dauerstufen', () => {
    for (const { selektor, dauer } of liste) expect(Object.values(DAUER_MS), selektor).toContain(dauer);
    const ausdruecke = [
      ...[...CSS.matchAll(/animation:\s*[^;]*?(calc\([^;]*\))\s+backwards;/g)].map((m) => m[1]),
      ...[...CSS.matchAll(/animation-delay:\s*([^;]+);/g)].map((m) => m[1]),
    ];
    expect(ausdruecke.length).toBeGreaterThan(10);
    for (const a of ausdruecke) {
      expect(a, a).toMatch(/^(?:calc\()?var\(--takt\)(?:\s*[*/]\s*\d+)?(?:\s*\+\s*var\(--d-[1-4]\))*\)?$/);
    }
  });

  it('endet spätestens nach AUFTAKT_ENDE_MS (1.120 ms, Budget ≤ 1,5 s), mit dem Einrasten der Uhr', () => {
    const ende = Math.max(...liste.map((a) => a.dauer + a.verzoegerung));
    expect(ende).toBe(AUFTAKT_ENDE_MS);
    expect(ende).toBeLessThanOrEqual(1500);
    const uhr = liste.find((a) => a.selektor.includes('[data-motion="uhr"]'))!;
    expect(uhr.dauer + uhr.verzoegerung).toBe(MOTION_REGISTER.uhr.endeMs);
    for (const delay of [...CSS.matchAll(/animation-delay:\s*([^;]+);/g)].map((m) => ms(m[1]))) {
      expect(delay).toBeLessThan(AUFTAKT_ENDE_MS);
    }
  });

  it('Füllart backwards: der Grundwert ist der Endzustand (ohne Skript und reduziert sofort fertig)', () => {
    for (const kurz of CSS.matchAll(/animation:\s*([^;]+);/g)) {
      expect(kurz[1]).toMatch(/\bbackwards$/);
    }
    expect(CSS).not.toMatch(/\bforwards\b|\bboth\b|infinite/);
  });

  it('bewegt nur transform, opacity und stroke-dashoffset', () => {
    const keyframes = [...CSS.matchAll(/@keyframes\s+\w+\s*\{([\s\S]*?\})\s*\}/g)].map((m) => m[1]);
    expect(keyframes.length).toBeGreaterThan(0);
    for (const kf of keyframes) {
      for (const prop of kf.matchAll(/([a-z-]+)\s*:/g)) expect(['transform', 'opacity', 'stroke-dashoffset']).toContain(prop[1]);
    }
  });
});

describe('kreislaufStarten (Knopf „Kreislauf zeigen“)', () => {
  function attrappe() {
    const verlauf: string[] = [];
    const attribute = new Map<string, string>();
    const klassen = new Set([AUFTAKT_KLASSE, 'andere']);
    const szene = {
      setAttribute: (name: string, wert: string) => {
        attribute.set(name, wert);
        verlauf.push(`${name}=${wert}`);
      },
      getBoundingClientRect: () => {
        verlauf.push('stil');
        return {};
      },
    } as unknown as Element;
    const html = { classList: { remove: (k: string) => klassen.delete(k) } } as unknown as Element;
    return { szene, html, verlauf, attribute, klassen };
  }

  it('beendet den Kopfskript-Auftakt und startet die Abläufe über ruhe → Stilberechnung → lauf neu', () => {
    const a = attrappe();
    kreislaufStarten(a.szene, a.html);
    expect(a.klassen.has(AUFTAKT_KLASSE)).toBe(false);
    expect(a.klassen.has('andere')).toBe(true);
    expect(a.verlauf).toEqual([`${KREISLAUF_ATTR}=ruhe`, 'stil', `${KREISLAUF_ATTR}=lauf`]);
    expect(a.attribute.get(KREISLAUF_ATTR)).toBe('lauf');
  });

  it('kann beliebig oft wiederholt werden', () => {
    const a = attrappe();
    kreislaufStarten(a.szene, a.html);
    kreislaufStarten(a.szene, a.html);
    expect(a.verlauf.filter((v) => v === 'stil')).toHaveLength(2);
    expect(a.attribute.get(KREISLAUF_ATTR)).toBe('lauf');
  });
});
