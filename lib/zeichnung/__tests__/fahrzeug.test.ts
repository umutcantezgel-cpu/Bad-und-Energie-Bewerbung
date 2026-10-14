import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Servicefahrzeug, fahrzeugTitel } from '@/components/themen/Servicefahrzeug';
import { GESCHAETZT } from '../norm';
import { FAHRZEUG, FAHRZEUG_MM, FAHRZEUG_RAHMEN } from '../szenen/fahrzeug';

const ETIKETTEN = { sortimo: 'Sortimo-Ausbau', hilti: 'Hilti 22 V', mess: 'Messtechnik' };

/** Alle Zahlenpaare eines Pfads (absolute Befehle M/L/H/V/Q/A, wie norm.ts sie schreibt). */
function punkte(d: string): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  let x = 0;
  let y = 0;
  for (const m of d.matchAll(/([MLHVQAZ])([^MLHVQAZ]*)/g)) {
    const n = (m[2].match(/-?\d*\.?\d+/g) ?? []).map(Number);
    if (m[1] === 'H') x = n[0];
    else if (m[1] === 'V') y = n[0];
    else if (m[1] === 'Q') [x, y] = [n[2], n[3]];
    else if (m[1] === 'A') [x, y] = [n[5], n[6]];
    else if (m[1] === 'Z') continue;
    else [x, y] = [n[0], n[1]];
    out.push({ x, y });
  }
  return out;
}

describe('Servicefahrzeug (Seitenansicht, 1 Einheit = 10 mm, E-029)', () => {
  it('jedes Maß ist geschätzt und begründet: das Modell des Betriebs ist nicht belegt', () => {
    for (const [name, mass] of Object.entries(FAHRZEUG_MM)) {
      expect(mass.geschaetzt, name).toBe(GESCHAETZT);
      expect(mass.stelle, name).toMatch(/Modell nicht belegt/);
    }
  });

  it('Proportionen aus den Maßen: Länge, Höhe, Radstand, Räder auf der Fahrbahn, Radläufe mit Luft', () => {
    expect(FAHRZEUG.front - FAHRZEUG.heck).toBeCloseTo(FAHRZEUG_MM.laenge.mm / 10, 0);
    const [hinten, vorn] = FAHRZEUG.achsen;
    expect(vorn - hinten).toBeCloseTo(FAHRZEUG_MM.radstand.mm / 10, 0);
    expect(FAHRZEUG.front - vorn).toBeCloseTo(FAHRZEUG_MM.ueberhangVorn.mm / 10, 0);
    expect(FAHRZEUG.rad.r * 2).toBeCloseTo(FAHRZEUG_MM.raddurchmesser.mm / 10, 0);
    expect(FAHRZEUG.rad.y + FAHRZEUG.rad.r).toBeCloseTo(FAHRZEUG.boden, 1);
    const dach = Math.min(...punkte(FAHRZEUG.aufbau).map((q) => q.y));
    expect(FAHRZEUG.boden - dach).toBeCloseTo(FAHRZEUG_MM.hoehe.mm / 10, 0);
    // Länge zu Höhe wie ein Transporter (rund 2,3 : 1), nicht wie ein Kleinwagen oder Bus
    expect((FAHRZEUG.front - FAHRZEUG.heck) / (FAHRZEUG.boden - dach)).toBeGreaterThan(2);
    expect((FAHRZEUG.front - FAHRZEUG.heck) / (FAHRZEUG.boden - dach)).toBeLessThan(2.6);
  });

  it('Schiebetür: Öffnung zwischen den Achsen, die offene Tür so breit wie die Öffnung und dahinter geschoben', () => {
    const o = FAHRZEUG.oeffnung;
    const [hinten, vorn] = FAHRZEUG.achsen;
    expect(o.x0).toBeGreaterThan(hinten);
    expect(o.x1).toBeLessThan(vorn);
    expect(o.x1 - o.x0).toBeCloseTo(FAHRZEUG_MM.schiebetuerBreite.mm / 10, 0);
    expect(o.y1 - o.y0).toBeCloseTo(FAHRZEUG_MM.schiebetuerHoehe.mm / 10, 0);
    const tuer = punkte(FAHRZEUG.schiebetuer);
    const tx = tuer.map((q) => q.x);
    expect(Math.max(...tx)).toBeLessThanOrEqual(o.x0);
    expect(Math.max(...tx) - Math.min(...tx)).toBeCloseTo(o.x1 - o.x0, 0);
  });

  it('alles liegt im Rahmen; Stoßfänger stehen vorn und hinten über, Leuchten an Front und Heck', () => {
    const alle = [FAHRZEUG.aufbau, FAHRZEUG.tuer, FAHRZEUG.scheibe, FAHRZEUG.schiebetuer, ...FAHRZEUG.stossfaenger, ...FAHRZEUG.leuchten, ...FAHRZEUG.regal.koffer];
    for (const d of alle) {
      for (const q of punkte(d)) {
        expect(q.x).toBeGreaterThanOrEqual(0);
        expect(q.x).toBeLessThanOrEqual(FAHRZEUG_RAHMEN.breite);
        expect(q.y).toBeGreaterThanOrEqual(0);
        expect(q.y).toBeLessThanOrEqual(FAHRZEUG_RAHMEN.hoehe);
      }
    }
    const [vorn, hinten] = FAHRZEUG.stossfaenger.map((d) => punkte(d).map((q) => q.x));
    expect(Math.max(...vorn)).toBeGreaterThan(FAHRZEUG.front);
    expect(Math.min(...hinten)).toBeLessThan(FAHRZEUG.heck);
    const [scheinwerfer, rueckleuchte] = FAHRZEUG.leuchten.map((d) => punkte(d).map((q) => q.x));
    expect(Math.max(...scheinwerfer)).toBeGreaterThan(FAHRZEUG.front - 10);
    expect(Math.min(...rueckleuchte)).toBe(FAHRZEUG.heck);
  });

  it('gezeichnet ohne Rohr-Metapher: keine Leitungen, keine Wärmefläche, kein Zirkel; Linienarten der Zeichnung', () => {
    const html = renderToStaticMarkup(createElement(Servicefahrzeug, { titel: 'alter Titel mit Rohrpaar', etiketten: ETIKETTEN }));
    expect(html).toContain(`role="img" aria-label="${fahrzeugTitel(ETIKETTEN)}"`);
    expect(fahrzeugTitel(ETIKETTEN)).not.toMatch(/Rohr|Dachträger|Vorlauf|Rücklauf/);
    // Die Zeichnung selbst (ohne die Etiketten-Kästchen mit ihren Icons)
    const bild = html.slice(0, html.indexOf('</svg>'));
    expect(bild).not.toMatch(/vorlauf|ruecklauf|waerme|strich|rohr/i);
    // Kreise nur an den Rädern: je Rad Reifen, Felge, Nabe
    expect(bild.match(/<circle /g)).toHaveLength(FAHRZEUG.achsen.length * 3);
    expect(bild).not.toMatch(/stroke-linecap|stroke-width/);
    for (const wert of Object.values(ETIKETTEN)) expect(html).toContain(wert);
  });
});
