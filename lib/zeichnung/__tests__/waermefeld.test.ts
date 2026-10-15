import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { WAERMEFELDER, type WaermefeldId } from '../szenen/waermefeld';
import { FELDEINGABEN } from '../waerme/eingabe';
import { imPolygon, pfadPunkte, schwerpunkt, type P } from '../waerme/kontur';
import { DATEI, SKRIPT, berechneWaermefelder, dateiText, eingabeHash, type Rechnung } from '../waerme/rechnung';

/**
 * Wärmefeld 2.0 (E-031, Paket W1): Lock und Physik. Der Vertrag der Daten (Form, Raster, Fenster) steht in
 * waermefeld-vertrag.test.ts; hier wird nachgerechnet (bun und V8 rechnen bitgleich) und geprüft, dass die Bänder
 * zeigen, was in einem beheizten Raum geschieht: Die warme Luft steigt über dem Heizkörper als Fahne auf und sammelt sich
 * unter der Decke; mit Fußbodenheizung ist der Raum gleichmäßiger, am Boden am wärmsten.
 */

const ROOT = path.resolve(__dirname, '../../..');
const IDS: readonly WaermefeldId[] = ['hausschnitt', 'raum-heizkoerper', 'raum-fussboden'];
const HEIZKOERPER: readonly WaermefeldId[] = ['hausschnitt', 'raum-heizkoerper'];

let rechnung: Rechnung;
beforeAll(() => {
  rechnung = berechneWaermefelder();
}, 120_000);

const eingabe = (id: WaermefeldId) => FELDEINGABEN.find((e) => e.id === id)!;
const polygon = (d: string): P[] => pfadPunkte(d, 8);

/** Mittlere Temperatur θ einer Zeile `ab` Einheiten über dem Boden im Aufenthaltsbereich (50 von den Wänden, 30 vom Heizkörper). */
function zeile(id: WaermefeldId, ab: number): number {
  const z = rechnung.zwischen.get(id)!;
  const { gitter: g, theta } = z.loesung;
  const { innen, heizflaeche: hf } = z.eingabe;
  const j = Math.round((innen.y + innen.hoehe - ab - g.y0) / g.dy);
  let summe = 0;
  let n = 0;
  for (let i = 0; i < g.nx; i += 1) {
    const x = g.x0 + i * g.dx;
    if (x < innen.x + 50 || x > innen.x + innen.breite - 50) continue;
    if (hf.hoehe > 0 && x > hf.x - 30 && x < hf.x + hf.breite + 30) continue;
    summe += theta[j * g.nx + i];
    n += 1;
  }
  return summe / n;
}

const schicht = (id: WaermefeldId, von: number, bis: number) => {
  let summe = 0;
  let n = 0;
  for (let ab = von; ab <= bis; ab += 2) {
    summe += zeile(id, ab);
    n += 1;
  }
  return summe / n;
};

describe('Wärmefeld: Lock (E-031)', () => {
  it('die Rechnung ergibt genau die gespeicherten Daten und genau die Datei', () => {
    expect(rechnung.felder.map((f) => f.id)).toEqual([...IDS]);
    for (const f of rechnung.felder) expect(f, f.id).toEqual(WAERMEFELDER[f.id]);
    expect(dateiText(rechnung.felder)).toBe(readFileSync(path.join(ROOT, DATEI), 'utf8'));
    for (const id of IDS) {
      expect(WAERMEFELDER[id].herkunft.eingabeHash, id).toBe(eingabeHash());
      expect(WAERMEFELDER[id].herkunft.skript, id).toBe(SKRIPT);
    }
    // Das Paketskript rechnet und prüft mit derselben Rechnung
    const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts['zeichnung:waermefeld']).toBe(`bun ${SKRIPT}`);
    expect(readFileSync(path.join(ROOT, SKRIPT), 'utf8')).toMatch(/--pruefen/);
  });

  it('bitgleich in bun und V8: Löser und Konturen nutzen nur +, −, ×, ÷, sqrt, round und floor', () => {
    for (const datei of ['feld.ts', 'kontur.ts', 'rechnung.ts', 'eingabe.ts']) {
      const src = readFileSync(path.join(ROOT, 'lib/zeichnung/waerme', datei), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      for (const m of src.matchAll(/Math\.([a-zA-Z0-9]+)/g)) expect(['sqrt', 'round', 'floor', 'min', 'max', 'abs'], `${datei}: Math.${m[1]}`).toContain(m[1]);
      expect(src, datei).not.toMatch(/\*\*/);
    }
  });
});

describe('Wärmefeld: Bänder (E-031)', () => {
  it.each(IDS)('%s: Band k + 1 liegt in Band k (Punkt-in-Polygon über den ganzen Verlauf)', (id) => {
    const { baender, innen } = WAERMEFELDER[id];
    for (let k = 1; k < baender.length; k += 1) {
      const aussen = polygon(baender[k - 1].d);
      const innenBand = polygon(baender[k].d);
      // Stichproben im Raum (am Spiegelrand decken die Wände)
      const proben = innenBand.filter((q) => q.x > innen.x + 1 && q.x < innen.x + innen.breite - 1 && q.y > innen.y + 1 && q.y < innen.y + innen.hoehe - 1);
      expect(proben.length, `${id} ${k + 1}`).toBeGreaterThan(20);
      const draussen = proben.filter((q) => !imPolygon(q, aussen));
      expect(draussen.length / proben.length, `${id}: Band ${k + 1} ragt aus Band ${k}`).toBeLessThanOrEqual(0.02);
    }
  });

  it('Heizkörper: das heißeste Band umschließt die Oberkante (Vorlauf), die Bänder 2–4 liegen mit ihrem Schwerpunkt darüber', () => {
    for (const id of HEIZKOERPER) {
      const hf = eingabe(id).heizflaeche;
      const mitte = hf.y + hf.hoehe / 2;
      const [, ...warm] = WAERMEFELDER[id].baender;
      const heissestes = polygon(warm[warm.length - 1].d);
      for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) expect(imPolygon({ x: hf.x + t * hf.breite, y: hf.y + 1 }, heissestes), `${id} Oberkante ${t}`).toBe(true);
      for (const b of warm) expect(schwerpunkt(polygon(b.d)).y, `${id} Band ${b.stufe}`).toBeLessThan(mitte);
      // Ursprung des Wachstums: Mitte der Oberkante
      for (const b of WAERMEFELDER[id].baender) expect(b.ursprung, `${id} Band ${b.stufe}`).toEqual({ x: hf.x + hf.breite / 2, y: hf.y });
    }
  });

  it('Heizkörper: die warme Luft steigt als Fahne auf und liegt als Schicht unter der Decke; der Boden bleibt kühler', () => {
    for (const id of HEIZKOERPER) {
      const { innen, baender } = WAERMEFELDER[id];
      const oben = schicht(id, innen.hoehe - 82, innen.hoehe - 2);
      const unten = schicht(id, 2, 82);
      expect(oben, id).toBeGreaterThan(unten + 0.03);
      // Das zweitheißeste Band reicht bis unter die Decke (Fahne), Band 1 liegt an der Decke breiter als am Boden
      const fahne = polygon(baender[2].d);
      expect(Math.min(...fahne.map((q) => q.y)), id).toBeLessThan(innen.y + innen.hoehe * 0.3);
      const band1 = polygon(baender[0].d);
      const breite = (y: number) => {
        let n = 0;
        for (let x = innen.x + 1; x < innen.x + innen.breite; x += 2) if (imPolygon({ x, y }, band1)) n += 1;
        return n;
      };
      expect(breite(innen.y + 6), id).toBeGreaterThan(breite(innen.y + innen.hoehe - 6));
    }
  });

  it('Fußbodenheizung: am Boden am wärmsten, die beiden heißesten Bänder liegen am Boden (an der Außenwand fällt kalte Luft)', () => {
    const { innen, baender } = WAERMEFELDER['raum-fussboden'];
    expect(schicht('raum-fussboden', 2, 82)).toBeGreaterThan(schicht('raum-fussboden', innen.hoehe - 82, innen.hoehe - 2));
    const proben = Array.from({ length: 41 }, (_, i) => ({ x: innen.x + 5 + (i * (innen.breite - 10)) / 40, y: innen.y + innen.hoehe - 1 }));
    const amBoden = (b: number) => proben.filter((q) => imPolygon(q, polygon(baender[b].d))).length / proben.length;
    expect(amBoden(2)).toBeGreaterThanOrEqual(0.9);
    expect(amBoden(3)).toBeGreaterThanOrEqual(2 / 3);
    // Die kühle Stelle am Boden liegt an der Außenwand (links), nicht an der Innenwand
    expect(imPolygon(proben[0], polygon(baender[3].d))).toBe(false);
    expect(imPolygon(proben[proben.length - 1], polygon(baender[3].d))).toBe(true);
    // Je heißer, desto tiefer der Schwerpunkt
    const tiefe = baender.map((b) => schwerpunkt(polygon(b.d)).y);
    for (let k = 1; k < tiefe.length; k += 1) expect(tiefe[k]).toBeGreaterThan(tiefe[k - 1]);
    for (const b of baender) expect(b.ursprung).toEqual({ x: innen.x + innen.breite / 2, y: innen.y + innen.hoehe });
  });

  it('Fußbodenheizung gleichmäßiger: zwischen Knöchel (0,1 m) und Kopf (1,1 m) ein kleinerer Unterschied als mit Heizkörper', () => {
    const unterschied = (id: WaermefeldId) => Math.abs(zeile(id, 110) - zeile(id, 10));
    for (const id of HEIZKOERPER) expect(unterschied('raum-fussboden'), id).toBeLessThan(unterschied(id));
    // Mit Heizkörper am Kopf wärmer als an den Füßen, mit Fußbodenheizung umgekehrt
    for (const id of HEIZKOERPER) expect(zeile(id, 110), id).toBeGreaterThan(zeile(id, 10));
    expect(zeile('raum-fussboden', 10)).toBeGreaterThan(zeile('raum-fussboden', 110));
  });

  it('Reihenfolge: heiß → kühl streng steigend, Fenster ganz genutzt (Hero 7…16,5, Seite 0…22), halbe Takte', () => {
    for (const id of IDS) {
      const takte = WAERMEFELDER[id].baender.map((b) => b.startTakte).reverse();
      for (let k = 1; k < takte.length; k += 1) expect(takte[k], id).toBeGreaterThan(takte[k - 1]);
      for (const t of takte) expect(Number.isInteger(t * 2), `${id}: ${t}`).toBe(true);
      expect([takte[0], takte[takte.length - 1]], id).toEqual([...eingabe(id).fenster]);
      // Die Rechnung: die Zone des heißesten Bands erwärmt sich zuerst
      const ankunft = rechnung.zwischen.get(id)!.ankunft;
      for (let k = 1; k < ankunft.length; k += 1) expect(ankunft[k], id).toBeLessThan(ankunft[k - 1]);
    }
  });

  it('alle Zahlen der Pfade auf dem 0,5-Raster; der Hausschnitt liegt im Rauminneren aus HAUS_LAGE', () => {
    for (const id of IDS) {
      for (const b of WAERMEFELDER[id].baender) {
        for (const zahl of b.d.match(/-?\d+(?:\.\d+)?/g) ?? []) expect(Number.isInteger(Number(zahl) * 2), `${id} ${b.stufe}: ${zahl}`).toBe(true);
        expect(b.d, `${id} ${b.stufe}`).toMatch(/^M-?[\d.]+ -?[\d.]+(?:C(?:-?[\d.]+ ){5}-?[\d.]+)+Z$/);
        // Auch die Kontrollpunkte bleiben im Rauminneren samt Spiegelrand (4 Einheiten)
        const { innen } = WAERMEFELDER[id];
        const zahlen = b.d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        for (let k = 0; k < zahlen.length; k += 2) {
          expect(zahlen[k], `${id} ${b.stufe}`).toBeGreaterThanOrEqual(innen.x - 4);
          expect(zahlen[k], `${id} ${b.stufe}`).toBeLessThanOrEqual(innen.x + innen.breite + 4);
          expect(zahlen[k + 1], `${id} ${b.stufe}`).toBeGreaterThanOrEqual(innen.y - 4);
          expect(zahlen[k + 1], `${id} ${b.stufe}`).toBeLessThanOrEqual(innen.y + innen.hoehe + 4);
        }
      }
    }
    expect(WAERMEFELDER.hausschnitt.innen).toEqual(eingabe('hausschnitt').innen);
  });
});
