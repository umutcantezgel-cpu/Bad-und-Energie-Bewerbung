import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { WAERMEFELDER, type WaermefeldId } from '../szenen/waermefeld';
import { ANPASSUNG, FELDEINGABEN } from '../waerme/eingabe';
import { stroemung } from '../waerme/feld';
import { anteilUeber, imPolygon, pfadPunkte, quantil, schwerpunkt, type P } from '../waerme/kontur';
import { ANTEILE, DATEI, MAX_STRECKE, MIN_FLAECHE, SKRIPT, berechneWaermefelder, dateiText, eingabeHash, type Rechnung } from '../waerme/rechnung';

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

  it('Heizkörper (Prüfrunde 2 B2-1, Prüfrunde 3 B3-2): keine kühlere Schicht unter der Decke – in jeder Spalte außerhalb der Fahne ist die Luft direkt unter der Randschicht (20 mm unter der Decke, vorher 0,1 m) höchstens 0,01 kühler als die wärmste der Spalte', () => {
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

  it('Heizkörper (Prüfrunde 2 B2-1, Prüfrunde 3 B3-2): jedes Band ist in jeder Höhe 1–10 Einheiten unter der Decke mindestens so breit wie in halber Höhe (außerhalb der Fahne; kein Hals an der Decke)', () => {
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
        const mitte = breite(innen.y + innen.hoehe / 2);
        for (let d = 1; d <= 10; d += 1) expect(breite(innen.y + d), `${id} Band ${b.stufe}, ${d} unter der Decke`).toBeGreaterThanOrEqual(mitte);
        // Über die ganze Breite samt Fahne: Jedes Band, das bis unter die Decke reicht, ist dort mindestens so breit wie in
        // halber Höhe (die Fahne schnürt sich an der Decke nicht ein, Prüfrunde 3 B3-2)
        const voll = (y: number) => {
          let n = 0;
          for (let x = innen.x + 1; x < innen.x + innen.breite; x += 1) if (imPolygon({ x, y }, flaeche)) n += 1;
          return n;
        };
        if (voll(innen.y + 10) === 0) continue;
        for (let d = 1; d <= 10; d += 1) expect(voll(innen.y + d), `${id} Band ${b.stufe} (ganze Breite), ${d} unter der Decke`).toBeGreaterThanOrEqual(voll(innen.y + innen.hoehe / 2));
      }
    }
  });

  it('Heizkörper (Prüfrunde 3 B3-2): im oberen Drittel stabil geschichtet – im Aufenthaltsbereich außerhalb der Fahne nirgends kühlere über wärmerer Luft; in der mittleren Raumhälfte steigt θ unter dem Deckenstrahl streng mit der Höhe', () => {
    for (const id of HEIZKOERPER) {
      const z = rechnung.zwischen.get(id)!;
      const { innen, heizflaeche: hf } = z.eingabe;
      const { gitter: g } = z.loesung;
      const zeileVon = (tiefe: number) => Math.round((innen.y + tiefe - g.y0) / g.dy);
      const fahne = (x: number) => x > hf.x - 30 && x < hf.x + hf.breite + 30;
      for (const [art, feld] of [['geglättet', z.glatt], ['roh', z.loesung.theta]] as const) {
        let spalten = 0;
        let mitte = 0;
        for (let i = 0; i < g.nx; i += 1) {
          const x = g.x0 + i * g.dx;
          if (x < innen.x + 50 || x > innen.x + innen.breite - 50 || fahne(x)) continue;
          const wert = (j: number) => feld[j * g.nx + i];
          // Nach oben fällt θ unter der Randschicht nirgends um mehr als 0,001 (wo die Anpassung mischt, ist die Luft
          // neutral geschichtet, etwa im Deckenstrahl); nur die Gitterzeile an der Decke gibt Wärme an sie ab
          for (let j = zeileVon(innen.hoehe / 3); j > zeileVon(ANPASSUNG.randschicht); j -= 1) {
            expect(wert(j - 1) - wert(j), `${id} ${art} x = ${x}, Zeile ${j}`).toBeGreaterThan(-0.001);
          }
          spalten += 1;
          // Mittlere Raumhälfte: von einem Drittel der Höhe bis 0,3 m unter der Decke streng steigend, und 0,1 m unter der
          // Decke mindestens 0,005 wärmer als ein Drittel der Höhe tiefer
          if (x < innen.x + innen.breite / 4 || x > innen.x + (3 * innen.breite) / 4) continue;
          for (let j = zeileVon(innen.hoehe / 3); j > zeileVon(30); j -= 1) expect(wert(j - 1), `${id} ${art} x = ${x}, Zeile ${j}`).toBeGreaterThan(wert(j));
          expect(wert(zeileVon(10)) - wert(zeileVon(innen.hoehe / 3)), `${id} ${art} x = ${x}`).toBeGreaterThan(0.005);
          mitte += 1;
        }
        expect(spalten, id).toBeGreaterThan(80);
        expect(mitte, id).toBeGreaterThan(40);
      }
    }
  });

  it('Heizkörper (Prüfrunde 3 B3-2): Deckenstrahl – 0,1 m unter der Decke ist der waagerechte Unterschied außerhalb der Fahne kleiner als der senkrechte vom Boden zur Decke in Raummitte', () => {
    for (const id of HEIZKOERPER) {
      const z = rechnung.zwischen.get(id)!;
      const { innen, heizflaeche: hf } = z.eingabe;
      const { gitter: g } = z.loesung;
      const wert = (x: number, y: number) => z.glatt[Math.round((y - g.y0) / g.dy) * g.nx + Math.round((x - g.x0) / g.dx)];
      const zeile: number[] = [];
      for (let x = innen.x; x <= innen.x + innen.breite; x += g.dx) if (!(x > hf.x - 30 && x < hf.x + hf.breite + 30)) zeile.push(wert(x, innen.y + 10));
      expect(zeile.length, id).toBeGreaterThan(100);
      const mitte = innen.x + innen.breite / 2;
      const senkrecht = wert(mitte, innen.y) - wert(mitte, innen.y + innen.hoehe);
      expect(Math.max(...zeile) - Math.min(...zeile), id).toBeLessThan(senkrecht);
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
    // Die kühle Stelle am Boden liegt an der Außenwand (links), nicht an der Innenwand: Das Feld ist dort am Boden
    // kühler, und das heißeste Band reicht an der Außenwand weniger als ein Viertel so hoch wie an der Innenwand
    // (Prüfrunde 3 B3-1: Auf der richtigen, proportionalen Skala deckt es den ganzen Boden; vorher endete es vor der
    // Außenwand, die Prüfung „links nicht im Band“ hing an der zu flach gezeichneten Schichtung)
    const heissestes = polygon(baender[baender.length - 1].d);
    expect(imPolygon(proben[proben.length - 1], heissestes)).toBe(true);
    const hoehe = (x: number) => {
      let y = innen.y + innen.hoehe - 1;
      while (y > innen.y && imPolygon({ x, y }, heissestes)) y -= 1;
      return innen.y + innen.hoehe - y;
    };
    expect(hoehe(proben[0].x)).toBeLessThan(hoehe(proben[proben.length - 1].x) / 4);
    const fb = rechnung.zwischen.get('raum-fussboden')!;
    const { gitter: g, theta } = fb.loesung;
    const boden = (x: number) => theta[(g.ny - 1) * g.nx + Math.round((x - g.x0) / g.dx)];
    expect(boden(proben[0].x)).toBeLessThan(boden(proben[proben.length - 1].x) - 0.01);
    // Je heißer, desto tiefer der Schwerpunkt
    const tiefe = baender.map((b) => schwerpunkt(polygon(b.d)).y);
    for (let k = 1; k < tiefe.length; k += 1) expect(tiefe[k]).toBeGreaterThan(tiefe[k - 1]);
    for (const b of baender) expect(b.ursprung).toEqual({ x: innen.x + innen.breite / 2, y: innen.y + innen.hoehe });
  });

  it('Vergleichsräume auf einer Skala (Prüfrunde 1 B1-1, Prüfrunde 3 B3-1): gleiches Raummittel per Thermostat, Schwellen im Verhältnis der Raummittel, die Fußbodenheizung erreicht die heißen Stufen nicht', () => {
    const hk = rechnung.zwischen.get('raum-heizkoerper')!;
    const fb = rechnung.zwischen.get('raum-fussboden')!;
    const [hkBaender, fbBaender] = [WAERMEFELDER['raum-heizkoerper'].baender, WAERMEFELDER['raum-fussboden'].baender];
    // Gezeichnete Schwellen = Schwellen der Rechnung. Das Feld ist linear in der Quelle: Ein Thermostat, der die
    // Fußbodenheizung auf dasselbe Mittel bringt, multipliziert ihr Feld mit m_HK / m_FB. Jede Schwelle ist darum die des
    // Heizkörpers mal m_FB / m_HK (auf 0,001 gerundet), und jede Stufe liegt im selben Verhältnis über dem Raummittel
    expect(hkBaender.map((b) => b.schwelle)).toEqual(hk.schwellen);
    expect(fbBaender.map((b) => b.schwelle)).toEqual(fb.schwellen);
    fbBaender.forEach((b, k) => {
      expect(Math.abs(b.schwelle - (hkBaender[k].schwelle * fb.mittel) / hk.mittel), `Stufe ${b.stufe}`).toBeLessThanOrEqual(0.0005 + 0.0005 * (fb.mittel / hk.mittel));
      expect((b.schwelle - fb.mittel) / fb.mittel, `Stufe ${b.stufe}`).toBeCloseTo((hkBaender[k].schwelle - hk.mittel) / hk.mittel, 2);
    });
    // Der Raum mit Heizkörper hat alle vier Stufen, die Fußbodenheizung weniger und nie die heißeste
    expect(hkBaender.map((b) => b.stufe)).toEqual([1, 2, 3, 4]);
    expect(fbBaender.length).toBeLessThan(hkBaender.length);
    // „Die beiden kräftigsten Stufen zeigt nur der Raum mit Heizkörper; mit Fußbodenheizung ist die Luft fast nirgends so
    // warm“ (lib/zeichnung/erklaerung.ts): 3 und 4 fehlen, über Stufe 3 liegt weniger als 1 % des Raums, über Stufe 4 nichts
    expect(fbBaender.map((b) => b.stufe)).not.toContain(3);
    expect(fbBaender.map((b) => b.stufe)).not.toContain(4);
    const aufSkala = (k: number) => (quantil(hk.glatt, ANTEILE[k]) * fb.mittel) / hk.mittel;
    expect(anteilUeber(fb.glatt, aufSkala(2))).toBeLessThan(0.01);
    expect(anteilUeber(fb.glatt, aufSkala(3))).toBe(0);
    // Gleichmäßiger, im Bild: die kühlste Stufe deckt mehr vom Raum, die heißeste gezeichnete weniger als beim Heizkörper
    expect(fbBaender[0].flaecheAnteil).toBeGreaterThan(hkBaender[0].flaecheAnteil);
    const oben = fbBaender[fbBaender.length - 1];
    expect(oben.flaecheAnteil).toBeLessThan(hkBaender[oben.stufe - 1].flaecheAnteil);
    // Jedes gezeichnete Band hat mindestens MIN_FLAECHE; die nächste Stufe hätte sie nicht
    for (const b of fbBaender) expect(b.flaecheAnteil, `Stufe ${b.stufe}`).toBeGreaterThanOrEqual(MIN_FLAECHE);
    const naechste = (quantil(hk.glatt, ANTEILE[fbBaender.length]) * fb.mittel) / hk.mittel;
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
      const z = rechnung.zwischen.get(id)!;
      const ankunft = z.ankunft;
      for (let k = 1; k < ankunft.length; k += 1) expect(ankunft[k], id).toBeLessThan(ankunft[k - 1]);
      // Prüfrunde 3 B3-3: Jeder Ring besteht nur aus Luftknoten (keiner auf einer Heizfläche, die ab t = 0 ihren
      // Endwert hat), mindestens 20 je Band, und keiner kommt im ersten Zeitschritt an
      const g = z.zeitgitter;
      expect(z.ringe.length, id).toBe(ankunft.length);
      for (const [k, ring] of z.ringe.entries()) {
        expect(ring.length, `${id} Band ${k + 1}`).toBeGreaterThanOrEqual(20);
        const aufHeizflaeche = ring.filter((q) => {
          const x = g.x0 + (q % g.nx) * g.dx;
          const y = g.y0 + Math.floor(q / g.nx) * g.dy;
          return z.eingabe.aufgabe.heizflaechen.some((f) => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1);
        });
        expect(aufHeizflaeche, `${id} Band ${k + 1}`).toEqual([]);
      }
      expect(Math.min(...ankunft), id).toBeGreaterThan(10);
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

  it('Prüfrunde 3 A3-5: keine gerade Schnittkante – kein Bézier-Abschnitt im Raum ist länger als MAX_STRECKE (+ Raster), also keiner über ein Viertel der Raumbreite', () => {
    expect(MAX_STRECKE).toBeLessThanOrEqual(Math.min(...IDS.map((id) => WAERMEFELDER[id].innen.breite)) / 4);
    for (const id of IDS) {
      const { innen } = WAERMEFELDER[id];
      const imRaum = (x: number, y: number) => x > innen.x && x < innen.x + innen.breite && y > innen.y && y < innen.y + innen.hoehe;
      for (const b of WAERMEFELDER[id].baender) {
        const zahlen = b.d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        let abschnitte = 0;
        // M x y, dann je C sechs Zahlen; Abschnitt von (x0, y0) nach (x3, y3)
        for (let k = 2; k + 5 < zahlen.length; k += 6) {
          const [x0, y0] = [zahlen[k - 2], zahlen[k - 1]];
          const [x3, y3] = [zahlen[k + 4], zahlen[k + 5]];
          // Strecken am Spiegelrand (beide Enden außerhalb des Raums) decken die Wände
          if (!imRaum(x0, y0) && !imRaum(x3, y3)) continue;
          abschnitte += 1;
          expect(Math.sqrt((x3 - x0) ** 2 + (y3 - y0) ** 2), `${id} Band ${b.stufe} bei ${x0} ${y0}`).toBeLessThanOrEqual(MAX_STRECKE + 1);
        }
        expect(abschnitte, `${id} Band ${b.stufe}`).toBeGreaterThan(5);
      }
    }
  });
});
