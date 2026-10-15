import { describe, expect, it } from 'vitest';
import { WAERMEFRONT_AN } from '@/lib/motion/seitenwechsel';
import { DAUER_MS, NACHLAUF_ENDE_MS, NACHLAUF_START_TAKTE, SICHT_ENDE_MS, TAKT_MS } from '@/lib/motion/register';
import { HAUS_LAGE } from '../szenen/hausschnitt';
import { WAERMEFELDER, type Rechteck, type WaermefeldId } from '../szenen/waermefeld';
import { WAERMEFELD_AN } from '../waerme/schalter';

/**
 * Vertrag des Wärmefelds (E-031, Paket W0): Form der Daten, die der Löser (Paket W1) schreibt und die Darstellung
 * (components/zeichnung/waerme) liest. Gilt für den Platzhalter wie für die berechnete Datei; die Physik prüft
 * lib/zeichnung/__tests__/waermefeld.test.ts (W1).
 */

const IDS: readonly WaermefeldId[] = ['hausschnitt', 'raum-heizkoerper', 'raum-fussboden'];
const RAND = 4;

/** Punkte auf der Kurve (Endpunkte der Abschnitte) eines Pfads aus absoluten Befehlen M, L, H, V, C, Q, Z. */
function punkte(d: string): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  let x = 0;
  let y = 0;
  for (const [, befehl, rest] of d.matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
    const n = rest.trim() ? rest.trim().split(/[\s,]+/).map(Number) : [];
    switch (befehl) {
      case 'M':
      case 'L':
        for (let i = 0; i < n.length; i += 2) out.push({ x: (x = n[i]), y: (y = n[i + 1]) });
        break;
      case 'H':
        for (const v of n) out.push({ x: (x = v), y });
        break;
      case 'V':
        for (const v of n) out.push({ x, y: (y = v) });
        break;
      case 'C':
        for (let i = 0; i < n.length; i += 6) out.push({ x: (x = n[i + 4]), y: (y = n[i + 5]) });
        break;
      case 'Q':
        for (let i = 0; i < n.length; i += 4) out.push({ x: (x = n[i + 2]), y: (y = n[i + 3]) });
        break;
      case 'Z':
        break;
      default:
        throw new Error(`Befehl ${befehl} nicht erlaubt (nur absolute M, L, H, V, C, Q, Z)`);
    }
  }
  return out;
}

const box = (p: { x: number; y: number }[]) => ({
  x0: Math.min(...p.map((q) => q.x)),
  y0: Math.min(...p.map((q) => q.y)),
  x1: Math.max(...p.map((q) => q.x)),
  y1: Math.max(...p.map((q) => q.y)),
});

const imRechteck = (q: { x: number; y: number }, r: Rechteck, rand: number) =>
  q.x >= r.x - rand && q.x <= r.x + r.breite + rand && q.y >= r.y - rand && q.y <= r.y + r.hoehe + rand;

describe('Wärmefeld: Vertrag der Daten (E-031)', () => {
  it('genau drei Felder; der Hausschnitt nimmt das Rauminnere aus HAUS_LAGE', () => {
    expect(Object.keys(WAERMEFELDER).sort()).toEqual([...IDS].sort());
    for (const id of IDS) expect(WAERMEFELDER[id].id, id).toBe(id);
    expect(WAERMEFELDER.hausschnitt.innen).toEqual({
      x: HAUS_LAGE.links + HAUS_LAGE.wand,
      y: HAUS_LAGE.deckeUnten,
      breite: HAUS_LAGE.rechts - HAUS_LAGE.links - 2 * HAUS_LAGE.wand,
      hoehe: HAUS_LAGE.fussboden - HAUS_LAGE.deckeUnten,
    });
    // 4,2 × 2,5 m, 1 Einheit = 10 mm; der Vergleichsraum hat dieselbe Größe
    for (const id of IDS) expect([WAERMEFELDER[id].innen.breite, WAERMEFELDER[id].innen.hoehe], id).toEqual([420, 250]);
  });

  it.each(IDS)('%s: Bänder 1 bis höchstens 4 aufsteigend, Schwelle steigt, Fläche sinkt', (id) => {
    const { baender } = WAERMEFELDER[id];
    // Hausschnitt und Bezugsraum alle vier; die Fußbodenheizung auf der gemeinsamen Skala nur, was ihr Feld erreicht
    expect(baender.map((b) => b.stufe)).toEqual([1, 2, 3, 4].slice(0, baender.length));
    expect(baender.length, id).toBeGreaterThanOrEqual(id === 'raum-fussboden' ? 1 : 4);
    for (let i = 0; i < baender.length; i += 1) {
      const b = baender[i];
      expect(b.schwelle, `${id} ${b.stufe}`).toBeGreaterThan(0);
      expect(b.schwelle, `${id} ${b.stufe}`).toBeLessThan(1);
      expect(b.flaecheAnteil, `${id} ${b.stufe}`).toBeGreaterThan(0);
      expect(b.flaecheAnteil, `${id} ${b.stufe}`).toBeLessThanOrEqual(1);
      if (i === 0) continue;
      expect(b.schwelle, `${id} ${b.stufe}`).toBeGreaterThan(baender[i - 1].schwelle);
      expect(b.flaecheAnteil, `${id} ${b.stufe}`).toBeLessThan(baender[i - 1].flaecheAnteil);
    }
  });

  it.each(IDS)('%s: geschlossene Pfade auf dem 0,5-Raster, im Raum (± 4), Band k + 1 in Band k', (id) => {
    const { baender, innen } = WAERMEFELDER[id];
    let vorher: ReturnType<typeof box> | null = null;
    for (const b of baender) {
      expect(b.d, `${id} ${b.stufe}`).toMatch(/^M[\d.\s-]/);
      expect(b.d, `${id} ${b.stufe}`).toMatch(/Z$/);
      for (const zahl of b.d.match(/-?\d+(?:\.\d+)?/g) ?? []) expect(Number.isInteger(Number(zahl) * 2), `${id} ${b.stufe}: ${zahl}`).toBe(true);
      const p = punkte(b.d);
      expect(p.length, `${id} ${b.stufe}`).toBeGreaterThanOrEqual(3);
      for (const q of p) expect(imRechteck(q, innen, RAND), `${id} ${b.stufe}: ${q.x} ${q.y}`).toBe(true);
      expect(imRechteck(b.ursprung, innen, 0), `${id} ${b.stufe}: Ursprung`).toBe(true);
      const jetzt = box(p);
      if (vorher) {
        expect(jetzt.x0, `${id} ${b.stufe}`).toBeGreaterThanOrEqual(vorher.x0 - 0.5);
        expect(jetzt.y0, `${id} ${b.stufe}`).toBeGreaterThanOrEqual(vorher.y0 - 0.5);
        expect(jetzt.x1, `${id} ${b.stufe}`).toBeLessThanOrEqual(vorher.x1 + 0.5);
        expect(jetzt.y1, `${id} ${b.stufe}`).toBeLessThanOrEqual(vorher.y1 + 0.5);
      }
      vorher = jetzt;
    }
  });

  it('Reihenfolge: das heißeste Band beginnt zuerst; Hausschnitt im Fenster des Nachlaufs, Vergleichsräume im Fenster der Sicht', () => {
    for (const id of IDS) {
      const takte = WAERMEFELDER[id].baender.map((b) => b.startTakte);
      for (const t of takte) expect(Number.isInteger(t * 2), `${id}: ${t}`).toBe(true);
      // heiß → kühl streng steigend, also in der Reihenfolge der Stufen streng fallend
      for (let i = 1; i < takte.length; i += 1) expect(takte[i], id).toBeLessThan(takte[i - 1]);
      const ende = Math.max(...takte) * TAKT_MS + DAUER_MS['d-4'];
      if (id === 'hausschnitt') {
        expect(Math.min(...takte)).toBeGreaterThanOrEqual(NACHLAUF_START_TAKTE);
        expect(ende).toBeLessThanOrEqual(NACHLAUF_ENDE_MS);
      } else {
        expect(Math.min(...takte), id).toBeGreaterThanOrEqual(0);
        expect(ende, id).toBeLessThanOrEqual(SICHT_ENDE_MS);
      }
    }
  });

  it('Herkunft: Skript, Raster 2, Residuum unter 1e-7', () => {
    for (const id of IDS) {
      const h = WAERMEFELDER[id].herkunft;
      expect(h.skript, id).toBe('scripts/zeichnung/waermefeld.ts');
      expect(h.raster, id).toBe(2);
      expect(Number.isInteger(h.iterationen) && h.iterationen >= 0, id).toBe(true);
      expect(h.residuum, id).toBeLessThan(1e-7);
      expect(h.eingabeHash.length, id).toBeGreaterThan(0);
      expect(h.modell.length, id).toBeGreaterThan(10);
    }
  });

  it('Notschalter sind Wahrheitswerte (E-031, Entscheidung 8)', () => {
    expect(typeof WAERMEFELD_AN).toBe('boolean');
    expect(typeof WAERMEFRONT_AN).toBe('boolean');
  });
});
