import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { WAERMEFELDER, type WaermefeldId } from '../szenen/waermefeld';
import { ANPASSUNG, FELDEINGABEN } from '../waerme/eingabe';
import { stroemung } from '../waerme/feld';
import { anteilUeber, imPolygon, pfadPunkte, schwerpunkt, type P } from '../waerme/kontur';
import { ANTEILE, DATEI, MIN_FLAECHE, SKRIPT, berechneWaermefelder, dateiText, eingabeHash, type Rechnung } from '../waerme/rechnung';

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

  it('Heizkörper (Prüfrunde 2 B2-1): keine kühlere Schicht unter der Decke – in jeder Spalte außerhalb der Fahne ist die Luft 0,1 m unter der Decke höchstens 0,01 kühler als die wärmste der Spalte', () => {
    for (const id of HEIZKOERPER) {
      const z = rechnung.zwischen.get(id)!;
      const { innen, heizflaeche: hf } = z.eingabe;
      const { gitter: g } = z.loesung;
      // Gezeichnet wird das geglättete Feld; ungeglättet gilt es ebenso
      for (const [art, feld] of [['geglättet', z.glatt], ['roh', z.loesung.theta]] as const) {
        const j = Math.round((innen.y + ANPASSUNG.randschicht - g.y0) / g.dy);
        let spalten = 0;
        for (let i = 0; i < g.nx; i += 5) {
          const x = g.x0 + i * g.dx;
          if (x > hf.x - 30 && x < hf.x + hf.breite + 30) continue;
          let max = -Infinity;
          for (let q = 0; q < g.ny; q += 1) max = Math.max(max, feld[q * g.nx + i]);
          expect(feld[j * g.nx + i], `${id} ${art} x = ${x}`).toBeGreaterThanOrEqual(max - 0.01);
          spalten += 1;
        }
        expect(spalten, id).toBeGreaterThan(25);
      }
    }
  });

  it('Heizkörper (Prüfrunde 2 B2-1): jedes Band ist 0,1 m unter der Decke mindestens so breit wie in halber Höhe (außerhalb der Fahne)', () => {
    for (const id of HEIZKOERPER) {
      const { innen, baender } = WAERMEFELDER[id];
      const hf = eingabe(id).heizflaeche;
      for (const b of baender) {
        const flaeche = polygon(b.d);
        const breite = (y: number) => {
          let n = 0;
          for (let x = innen.x + 1; x < innen.x + innen.breite; x += 1) {
            if (x > hf.x - 30 && x < hf.x + hf.breite + 30) continue;
            if (imPolygon({ x, y }, flaeche)) n += 1;
          }
          return n;
        };
        expect(breite(innen.y + ANPASSUNG.randschicht), `${id} Band ${b.stufe}`).toBeGreaterThanOrEqual(breite(innen.y + innen.hoehe / 2));
      }
    }
  });

  it('Vergleichsraum mit Heizkörper (Prüfrunde 2 B2-2): die Luft sinkt über die ganze Breite, strömt am Boden zum Heizkörper zurück; die Innenwand ist oben wärmer als unten', () => {
    const z = rechnung.zwischen.get('raum-heizkoerper')!;
    const { aufgabe, innen, heizflaeche: hf } = z.eingabe;
    // Halbe Höhe: Aufstrom nur am Heizkörper (höchstens das erste Viertel der Breite), danach bis an die Innenwand überall
    // abwärts (v > 0, y nach unten) und nirgends mehr als das Doppelte des Mittels (kein Abstrom an einer Wand)
    const xs: number[] = [];
    for (let x = innen.x + 5; x < innen.x + innen.breite; x += 5) xs.push(x);
    const v = xs.map((x) => stroemung(aufgabe, x, innen.y + innen.hoehe / 2)[1]);
    const ab = v.findIndex((w) => w > 0);
    expect(xs[ab] - innen.x, 'Ende des Aufstroms').toBeLessThan(innen.breite / 4);
    expect(xs[ab], 'Aufstrom am Heizkörper').toBeGreaterThan(hf.x + hf.breite);
    const abwaerts = v.slice(ab);
    expect(abwaerts.every((w) => w > 0)).toBe(true);
    const mittel = abwaerts.reduce((a, b) => a + b, 0) / abwaerts.length;
    expect(Math.max(...abwaerts)).toBeLessThan(2 * mittel);
    // Am Boden (5 Einheiten darüber) strömt die Luft überall zum Heizkörper (links, u < 0)
    for (let x = innen.x + 5; x < innen.x + innen.breite - 5; x += 5) expect(stroemung(aufgabe, x, innen.y + innen.hoehe - 5)[0], `x = ${x}`).toBeLessThan(0);
    // Die Innenwand (adiabat) ist nicht die kälteste Zone: oben deutlich wärmer als unten und als der Boden im Raum
    const { gitter: g, theta } = z.loesung;
    const i = g.nx - 1;
    const wert = (ab: number) => theta[Math.round((innen.y + innen.hoehe - ab - g.y0) / g.dy) * g.nx + i];
    expect(wert(innen.hoehe - 10) - wert(10)).toBeGreaterThan(0.02);
    expect(wert(innen.hoehe - 10)).toBeGreaterThan(schicht('raum-heizkoerper', 2, 12) + 0.02);
  });

  it('Fußbodenheizung: am Boden am wärmsten, das heißeste Band liegt am Boden (an der Außenwand fällt kalte Luft)', () => {
    const { innen, baender } = WAERMEFELDER['raum-fussboden'];
    expect(schicht('raum-fussboden', 2, 82)).toBeGreaterThan(schicht('raum-fussboden', innen.hoehe - 82, innen.hoehe - 2));
    const proben = Array.from({ length: 41 }, (_, i) => ({ x: innen.x + 5 + (i * (innen.breite - 10)) / 40, y: innen.y + innen.hoehe - 1 }));
    const amBoden = (b: number) => proben.filter((q) => imPolygon(q, polygon(baender[b].d))).length / proben.length;
    // Auf der gemeinsamen Skala (Prüfrunde 1 B1-1) hat sie weniger Bänder; jedes deckt den Boden fast ganz
    for (let k = 0; k < baender.length; k += 1) expect(amBoden(k), `Band ${k + 1}`).toBeGreaterThanOrEqual(0.9);
    // Die kühle Stelle am Boden liegt an der Außenwand (links), nicht an der Innenwand
    const heissestes = polygon(baender[baender.length - 1].d);
    expect(imPolygon(proben[0], heissestes)).toBe(false);
    expect(imPolygon(proben[proben.length - 1], heissestes)).toBe(true);
    // Je heißer, desto tiefer der Schwerpunkt
    const tiefe = baender.map((b) => schwerpunkt(polygon(b.d)).y);
    for (let k = 1; k < tiefe.length; k += 1) expect(tiefe[k]).toBeGreaterThan(tiefe[k - 1]);
    for (const b of baender) expect(b.ursprung).toEqual({ x: innen.x + innen.breite / 2, y: innen.y + innen.hoehe });
  });

  it('Vergleichsräume auf einer Skala (Prüfrunde 1 B1-1): gleiche Abstände vom Raummittel, die Fußbodenheizung erreicht die heißen Stufen nicht', () => {
    const hk = rechnung.zwischen.get('raum-heizkoerper')!;
    const fb = rechnung.zwischen.get('raum-fussboden')!;
    const [hkBaender, fbBaender] = [WAERMEFELDER['raum-heizkoerper'].baender, WAERMEFELDER['raum-fussboden'].baender];
    // Gezeichnete Schwellen = Schwellen der Rechnung; jede Stufe liegt in beiden Räumen gleich weit über dem Raummittel
    expect(hkBaender.map((b) => b.schwelle)).toEqual(hk.schwellen);
    expect(fbBaender.map((b) => b.schwelle)).toEqual(fb.schwellen);
    fbBaender.forEach((b, k) => expect(b.schwelle - fb.mittel, `Stufe ${b.stufe}`).toBeCloseTo(hkBaender[k].schwelle - hk.mittel, 2));
    // Der Raum mit Heizkörper hat alle vier Stufen, die Fußbodenheizung weniger und nie die heißeste
    expect(hkBaender.map((b) => b.stufe)).toEqual([1, 2, 3, 4]);
    expect(fbBaender.length).toBeLessThan(hkBaender.length);
    // „Die kräftigsten Stufen erreicht nur der Heizkörper“ (lib/zeichnung/erklaerung.ts): 3 und 4 fehlen
    expect(fbBaender.map((b) => b.stufe)).not.toContain(3);
    expect(fbBaender.map((b) => b.stufe)).not.toContain(4);
    // Gleichmäßiger, im Bild: die kühlste Stufe deckt mehr vom Raum, die heißeste gezeichnete weniger als beim Heizkörper
    expect(fbBaender[0].flaecheAnteil).toBeGreaterThan(hkBaender[0].flaecheAnteil);
    const oben = fbBaender[fbBaender.length - 1];
    expect(oben.flaecheAnteil).toBeLessThan(hkBaender[oben.stufe - 1].flaecheAnteil);
    // Jedes gezeichnete Band hat mindestens MIN_FLAECHE; die nächste Stufe hätte sie nicht
    for (const b of fbBaender) expect(b.flaecheAnteil, `Stufe ${b.stufe}`).toBeGreaterThanOrEqual(MIN_FLAECHE);
    const naechste = hkBaender[fbBaender.length].schwelle - hk.mittel + fb.mittel;
    expect(anteilUeber(fb.glatt, naechste)).toBeLessThan(MIN_FLAECHE);
    // Der Hausschnitt bleibt auf seiner eigenen Skala (64/36/16/6 % der Fläche)
    WAERMEFELDER.hausschnitt.baender.forEach((b, k) => expect(b.flaecheAnteil).toBeCloseTo(ANTEILE[k], 1));
  });

  it('Heizkörper (Prüfrunde 1 B1-2): unter dem Heizkörper kein heißes Band, die Luft dort nicht wärmer als unten in Raummitte', () => {
    for (const id of HEIZKOERPER) {
      const z = rechnung.zwischen.get(id)!;
      const { innen, heizflaeche: hf } = z.eingabe;
      const unten = innen.y + innen.hoehe;
      // Zwischen Unterkante und Boden: höchstens Band 1 (die kühle Raumluft strömt am Boden zum Heizkörper)
      const proben: { x: number; y: number }[] = [];
      for (let x = Math.max(hf.x, innen.x) + 1; x < hf.x + hf.breite; x += 2) for (let y = hf.y + hf.hoehe + 1; y < unten; y += 2) proben.push({ x, y });
      expect(proben.length, id).toBeGreaterThan(20);
      for (const b of WAERMEFELDER[id].baender.slice(1)) {
        const flaeche = polygon(b.d);
        expect(proben.filter((q) => imPolygon(q, flaeche)), `${id} Band ${b.stufe}`).toEqual([]);
      }
      // Mittel unter dem Heizkörper ≤ Schicht 0–0,8 m in Raummitte + 0,025 (ein Drittel des Abstands zweier Stufen)
      const { gitter: g, theta } = z.loesung;
      let summe = 0;
      let n = 0;
      for (let j = 0; j < g.ny; j += 1) {
        for (let i = 0; i < g.nx; i += 1) {
          const x = g.x0 + i * g.dx;
          const y = g.y0 + j * g.dy;
          if (x < Math.max(hf.x, innen.x) || x > hf.x + hf.breite || y <= hf.y + hf.hoehe || y > unten) continue;
          summe += theta[j * g.nx + i];
          n += 1;
        }
      }
      expect(summe / n, id).toBeLessThanOrEqual(schicht(id, 0, 80) + 0.025);
    }
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
