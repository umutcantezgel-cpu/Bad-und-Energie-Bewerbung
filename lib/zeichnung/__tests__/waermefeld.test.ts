import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { DAUER_MS, DIFFUSION_STUETZ, TAKT_MS } from '@/lib/motion/register';
import { keyframesIn } from '@/lib/motion/__tests__/keyframes';
import { WAERMEFELDER, type WaermefeldId } from '../szenen/waermefeld';
import { FELDEINGABEN, HEIZKOERPER_THETA, MITTEL, SKALA_HERO, SKALA_VERGLEICH, SPANNE, TEMPERATUREN } from '../waerme/eingabe';
import { aufHeizkoerper, fahnenrand, fahnenzuschlag, halbbreite, inFahne, ln, luftmittel, rechneFeld, stroemung } from '../waerme/feld';
import { anteilUeber, glaetten, imPolygon, pfadPunkte, schwerpunkt, type P } from '../waerme/kontur';
import { DATEI, MAX_STRECKE, MIN_FLAECHE, SKRIPT, berechneWaermefelder, dateiText, eingabeHash, luftknoten, type Rechnung } from '../waerme/rechnung';

/**
 * Wärmefeld 2.0 (E-031, Paket W1, Prüfrunde 4): Lock und Physik des halbempirischen Raumluftmodells. Der Vertrag der Daten
 * (Form, Raster, Fenster) steht in waermefeld-vertrag.test.ts; hier wird nachgerechnet (bun und V8 rechnen bitgleich)
 * und geprüft, dass die Bänder zeigen, was in einem beheizten Raum geschieht: Über dem Heizkörper steigt eine Fahne auf,
 * die sich nach oben aufweitet und unter der Decke in die warme Schicht übergeht; außerhalb von Fahne und Wand ist die
 * Luft stabil geschichtet, ihre Isothermen liegen nahezu waagerecht; mit Fußbodenheizung ist der Raum gleichmäßiger, am
 * Boden am wärmsten. Die Bewegung (scaleY je Band aus seinem Ursprung) zeigt in keinem Zwischenstand kühlere Luft über
 * wärmerer.
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
/** Temperatur in K über der mittleren Raumluft aus θ. */
const kelvin = (theta: number) => theta * SPANNE - MITTEL;

/** Mittlere Temperatur θ einer Zeile `ab` Einheiten über dem Boden im Aufenthaltsbereich (50 von den Wänden, außerhalb von Fahne und Heizkörper). */
function zeile(id: WaermefeldId, ab: number): number {
  const z = rechnung.zwischen.get(id)!;
  const { gitter: g, theta } = z.loesung;
  const { innen, aufgabe } = z.eingabe;
  const j = Math.round((innen.y + innen.hoehe - ab - g.y0) / g.dy);
  let summe = 0;
  let n = 0;
  for (let i = 0; i < g.nx; i += 1) {
    const x = g.x0 + i * g.dx;
    const y = g.y0 + j * g.dy;
    if (x < innen.x + 50 || x > innen.x + innen.breite - 50) continue;
    if (aufHeizkoerper(aufgabe, x, y) || inFahne(aufgabe, x, y) || fahnenzuschlag(aufgabe, x, y) >= 0.1) continue;
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

/**
 * Kern des Raums (Prüfrunde 4 B4-1): mindestens 0,3 m von den Wänden, 0,1 m von Decke und Boden, 0,3 m vom Heizkörper,
 * und die Fahne erwärmt die Luft dort und 0,3 m daneben um weniger als 0,1 K.
 */
function imKern(id: WaermefeldId, x: number, y: number): boolean {
  const e = eingabe(id);
  const { innen, heizflaeche: hf } = e;
  if (x < innen.x + 30 || x > innen.x + innen.breite - 30 || y < innen.y + 10 || y > innen.y + innen.hoehe - 10) return false;
  if (hf.hoehe > 0 && x > hf.x - 30 && x < hf.x + hf.breite + 30 && y > hf.y - 30) return false;
  return [-30, 0, 30].every((dx) => fahnenzuschlag(e.aufgabe, x + dx, y) < 0.1);
}

/** Liegt (x, y) höchstens `rand` Einheiten neben dem Heizkörper oder auf ihm (seine Grenzschicht)? */
function amHeizkoerper(id: WaermefeldId, x: number, y: number, rand: number): boolean {
  const hf = eingabe(id).heizflaeche;
  return hf.hoehe > 0 && x > hf.x - rand && x < hf.x + hf.breite + rand && y > hf.y - rand && y < hf.y + hf.hoehe + rand;
}

/** Achse der Fahne (x) eines Raums mit Heizkörper. */
const achse = (id: WaermefeldId) => eingabe(id).aufgabe.heizkoerper!.fahne.achse;

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

  it('deterministisch: zweimal gerechnet gibt dieselben Daten', () => {
    expect(berechneWaermefelder().felder).toEqual(rechnung.felder);
  });

  it('bitgleich in bun und V8: Modell und Konturen nutzen nur +, −, ×, ÷, sqrt, round und floor', () => {
    for (const datei of ['feld.ts', 'kontur.ts', 'rechnung.ts', 'eingabe.ts']) {
      const src = readFileSync(path.join(ROOT, 'lib/zeichnung/waerme', datei), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      for (const m of src.matchAll(/Math\.([a-zA-Z0-9]+)/g)) expect(['sqrt', 'round', 'floor', 'min', 'max', 'abs'], `${datei}: Math.${m[1]}`).toContain(m[1]);
      expect(src, datei).not.toMatch(/\*\*/);
    }
    // Der Logarithmus der Ankunft (nur Wurzeln) stimmt auf 1e-9
    for (const x of [1, 1.5, 2, 10, 250]) expect(Math.abs(ln(x) - Math.log(x)), `ln ${x}`).toBeLessThan(1e-9);
  });

  it('Herkunft (Prüfrunde 4 B4-3): das Raummittel ist auf den Sollwert eingestellt, Iterationen und Rest beschreiben diese Einstellung', () => {
    for (const id of IDS) {
      const z = rechnung.zwischen.get(id)!;
      expect(Math.abs(luftmittel(z.eingabe.aufgabe, z.loesung.gitter, z.loesung.theta) - MITTEL / SPANNE), id).toBeLessThan(1e-11);
      expect(WAERMEFELDER[id].herkunft.residuum, id).toBe(z.loesung.residuum);
      expect(WAERMEFELDER[id].herkunft.iterationen, id).toBe(z.loesung.iterationen);
      expect(WAERMEFELDER[id].herkunft.modell, id).toMatch(/Baines & Turner 1969/);
      expect(WAERMEFELDER[id].herkunft.modell, id).toMatch(/Morton, Taylor & Turner 1956/);
    }
  });
});

describe('Wärmefeld: Niveau und Gitter (Prüfrunde 4 B4-3)', () => {
  it('physikalisch plausibel: Raumluft um die Norm-Innentemperatur, deutlich kühler als der Heizkörper', () => {
    expect(TEMPERATUREN).toEqual({ aussen: -12, vorlauf: 55, raum: 20 });
    for (const id of IDS) {
      const z = rechnung.zwischen.get(id)!;
      const { gitter: g, theta } = z.loesung;
      // 98 % der Raumluft außerhalb der Fahne liegen zwischen 4 K unter und 4 K über dem Mittel (16 bis 24 °C)
      const werte: number[] = [];
      for (let q = 0; q < theta.length; q += 1) {
        const x = g.x0 + (q % g.nx) * g.dx;
        const y = g.y0 + Math.floor(q / g.nx) * g.dy;
        if (inFahne(z.eingabe.aufgabe, x, y) || fahnenzuschlag(z.eingabe.aufgabe, x, y) >= 0.5) continue;
        if (z.eingabe.aufgabe.heizkoerper && x >= z.eingabe.heizflaeche.x && x <= z.eingabe.heizflaeche.x + z.eingabe.heizflaeche.breite && y >= z.eingabe.heizflaeche.y && y <= z.eingabe.heizflaeche.y + z.eingabe.heizflaeche.hoehe) continue;
        werte.push(kelvin(theta[q]));
      }
      const innen = werte.filter((k) => k >= -4 && k <= 4).length / werte.length;
      expect(innen, id).toBeGreaterThan(0.98);
      // Die wärmste Raumluft außerhalb der Fahne bleibt unter θ 0,6, also weit unter der Unterkante des Heizkörpers (0,8)
      expect(Math.max(...werte.map((k) => (k + MITTEL) / SPANNE)), id).toBeLessThan(HEIZKOERPER_THETA.unten - 0.2);
    }
  });

  it('gitterunabhängig: auf 1 und 2 Einheiten gleiches Mittel und gleiche Flächen der Bänder', () => {
    for (const id of IDS) {
      const e = eingabe(id);
      const fein = rechneFeld(e.aufgabe, 1);
      const feinGlatt = glaetten(fein.theta, fein.gitter);
      const z = rechnung.zwischen.get(id)!;
      expect(Math.abs(luftmittel(e.aufgabe, fein.gitter, feinGlatt) - z.mittel), id).toBeLessThan(0.001);
      for (const b of WAERMEFELDER[id].baender) expect(Math.abs(anteilUeber(feinGlatt, b.schwelle) - b.flaecheAnteil), `${id} Band ${b.stufe}`).toBeLessThan(0.01);
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
    }
  });

  it('Heizkörper (Prüfrunde 4 B4-2): Bewegung und Ursprung je Band – ein Band, das die Decke außerhalb der Fahne berührt, blendet an der Decke ein (Ursprung dort über der Fahne), jedes andere wächst aus der Oberkante des Heizkörpers; die heißesten Stufen sind Fahne', () => {
    for (const id of HEIZKOERPER) {
      const e = eingabe(id);
      const { innen, baender } = WAERMEFELDER[id];
      const hf = e.heizflaeche;
      const z = rechnung.zwischen.get(id)!;
      const h = e.aufgabe.heizkoerper!;
      baender.forEach((b, k) => {
        const p = polygon(b.d);
        const decke = p.some((q) => q.y <= innen.y + 0.5 && q.x >= innen.x && q.x <= innen.x + innen.breite && Math.abs(q.x - achse(id)) > fahnenrand(h, innen.y) + h.grenzschicht);
        expect(z.deckenband[k], `${id} Band ${b.stufe}`).toBe(decke);
        expect(b.bewegung, `${id} Band ${b.stufe}`).toBe(decke ? 'einblenden' : 'wachsen');
        expect(b.ursprung, `${id} Band ${b.stufe}`).toEqual(decke ? { x: hf.x + hf.breite / 2, y: innen.y } : { x: hf.x + hf.breite / 2, y: hf.y });
      });
      // Die beiden kühlsten Stufen sind Deckenschicht (an der Decke über die ganze Breite), die beiden heißesten nur Fahne
      expect(z.deckenband, id).toEqual([true, true, false, false]);
    }
  });

  it('Heizkörper: die warme Luft steigt als Fahne bis unter die Decke und liegt als Schicht unter der Decke; der Boden bleibt kühler', () => {
    for (const id of HEIZKOERPER) {
      const { innen, baender } = WAERMEFELDER[id];
      const hf = eingabe(id).heizflaeche;
      const oben = schicht(id, innen.hoehe - 82, innen.hoehe - 2);
      const unten = schicht(id, 2, 82);
      expect(oben, id).toBeGreaterThan(unten + 0.03);
      // Eine warme Stufe (≥ 2) reicht zusammenhängend von der Oberkante des Heizkörpers bis unter die Decke über der Fahne
      const x = hf.x + hf.breite / 2 + (achse(id) > hf.x ? 0 : -hf.breite / 2 + 2);
      const fahne = baender.slice(1).some((b) => {
        const p = polygon(b.d);
        for (let y = hf.y - 2; y > innen.y + 2; y -= 2) if (!imPolygon({ x, y }, p)) return false;
        return true;
      });
      expect(fahne, id).toBe(true);
      // Band 1 liegt an der Decke breiter als am Boden
      const band1 = polygon(baender[0].d);
      const breite = (y: number) => {
        let n = 0;
        for (let xx = innen.x + 1; xx < innen.x + innen.breite; xx += 2) if (imPolygon({ x: xx, y }, band1)) n += 1;
        return n;
      };
      expect(breite(innen.y + 6), id).toBeGreaterThan(breite(innen.y + innen.hoehe - 6));
    }
  });

  it('Heizkörper (Prüfrunde 4 B4-1): in den obersten 0,3 m liegt über die ganze Breite mindestens Band 1 (warme Schicht unter der Decke)', () => {
    for (const id of HEIZKOERPER) {
      const { innen, baender } = WAERMEFELDER[id];
      const band1 = polygon(baender[0].d);
      for (let y = innen.y + 1; y <= innen.y + 30; y += 2) {
        for (let x = innen.x + 2; x <= innen.x + innen.breite - 2; x += 4) expect(imPolygon({ x, y }, band1), `${id} ${x} ${y}`).toBe(true);
      }
    }
  });

  it('Heizkörper (Prüfrunde 2 B2-1): keine kühlere Schicht unter der Decke – in jeder Spalte ist die Luft 2 Einheiten unter der Decke höchstens 0,01 kühler als die wärmste der Spalte (außerhalb der Fahne)', () => {
    for (const id of HEIZKOERPER) {
      const z = rechnung.zwischen.get(id)!;
      const { innen, aufgabe } = z.eingabe;
      const { gitter: g } = z.loesung;
      for (const [art, feld] of [['geglättet', z.glatt], ['roh', z.loesung.theta]] as const) {
        const j = Math.round((innen.y + 2 - g.y0) / g.dy);
        let spalten = 0;
        for (let i = 0; i < g.nx; i += 2) {
          const x = g.x0 + i * g.dx;
          if (fahnenzuschlag(aufgabe, x, innen.y + 2) >= 0.1) continue;
          let max = -Infinity;
          for (let q = 0; q < g.ny; q += 1) {
            if (inFahne(aufgabe, x, g.y0 + q * g.dy)) continue;
            max = Math.max(max, feld[q * g.nx + i]);
          }
          expect(feld[j * g.nx + i], `${id} ${art} x = ${x}`).toBeGreaterThanOrEqual(max - 0.01);
          spalten += 1;
        }
        expect(spalten, id).toBeGreaterThan(25);
      }
    }
  });

  it('Heizkörper (Prüfrunde 3 B3-2): jedes Band ist in jeder Höhe 1–10 Einheiten unter der Decke mindestens so breit wie in halber Höhe (kein Hals an der Decke)', () => {
    for (const id of HEIZKOERPER) {
      const { innen, baender } = WAERMEFELDER[id];
      for (const b of baender) {
        const flaeche = polygon(b.d);
        const voll = (y: number) => {
          let n = 0;
          for (let x = innen.x + 1; x < innen.x + innen.breite; x += 1) if (imPolygon({ x, y }, flaeche)) n += 1;
          return n;
        };
        if (voll(innen.y + 10) === 0) continue;
        for (let d = 1; d <= 10; d += 1) expect(voll(innen.y + d), `${id} Band ${b.stufe}, ${d} unter der Decke`).toBeGreaterThanOrEqual(voll(innen.y + innen.hoehe / 2));
      }
    }
  });

  it('Heizkörper (Filling Box, Prüfrunde 4 B4-1): außerhalb von Fahne, Heizkörper (0,2 m) und Wand steigt θ überall mit der Höhe (stabil geschichtet), in der mittleren Raumhälfte streng', () => {
    for (const id of HEIZKOERPER) {
      const z = rechnung.zwischen.get(id)!;
      const { innen, aufgabe } = z.eingabe;
      const { gitter: g } = z.loesung;
      for (const [art, feld] of [['geglättet', z.glatt], ['roh', z.loesung.theta]] as const) {
        let spalten = 0;
        for (let i = 0; i < g.nx; i += 1) {
          const x = g.x0 + i * g.dx;
          if (x < innen.x + 12 || x > innen.x + innen.breite - 12) continue;
          const wert = (j: number) => feld[j * g.nx + i];
          let geprueft = false;
          for (let j = g.ny - 2; j > 0; j -= 1) {
            const y = g.y0 + j * g.dy;
            if (inFahne(aufgabe, x, y) || inFahne(aufgabe, x, y - g.dy) || fahnenzuschlag(aufgabe, x, y) >= 0.1 || amHeizkoerper(id, x, y, 20)) continue;
            expect(wert(j - 1) - wert(j), `${id} ${art} x = ${x}, Zeile ${j}`).toBeGreaterThan(-1e-12);
            geprueft = true;
          }
          if (geprueft) spalten += 1;
        }
        expect(spalten, id).toBeGreaterThan(120);
        // Im Kern (Prüfrunde 4 B4-1): von 0,1 m über dem Boden bis 0,1 m unter der Decke streng steigend
        let kern = 0;
        for (let i = 0; i < g.nx; i += 1) {
          const x = g.x0 + i * g.dx;
          const zeilen: number[] = [];
          for (let j = Math.round(10 / g.dy); j <= Math.round((innen.hoehe - 10) / g.dy); j += 1) zeilen.push(j);
          if (!zeilen.every((j) => imKern(id, x, g.y0 + j * g.dy))) continue;
          for (const j of zeilen.slice(1)) expect(feld[(j - 1) * g.nx + i], `${id} ${art} x = ${x}, Zeile ${j}`).toBeGreaterThan(feld[j * g.nx + i]);
          kern += 1;
        }
        expect(kern, id).toBeGreaterThan(30);
      }
    }
  });

  it.each(IDS)('%s (Prüfrunde 4 B4-1): im Kern ist der waagerechte Unterschied in jeder Zeile höchstens ein Viertel des senkrechten vom Boden zur Decke in Raummitte', (id) => {
    const z = rechnung.zwischen.get(id)!;
    const { innen } = z.eingabe;
    const g = z.loesung.gitter;
    const wert = (x: number, y: number) => z.glatt[Math.round((y - g.y0) / g.dy) * g.nx + Math.round((x - g.x0) / g.dx)];
    const mx = innen.x + innen.breite / 2;
    const senkrecht = Math.abs(wert(mx, innen.y) - wert(mx, innen.y + innen.hoehe));
    let zeilen = 0;
    for (let j = 0; j < g.ny; j += 1) {
      const y = g.y0 + j * g.dy;
      const werte: number[] = [];
      for (let i = 0; i < g.nx; i += 1) if (imKern(id, g.x0 + i * g.dx, y)) werte.push(z.glatt[j * g.nx + i]);
      if (werte.length < 20) continue;
      expect(Math.max(...werte) - Math.min(...werte), `${id} y = ${y}`).toBeLessThanOrEqual(senkrecht / 4);
      zeilen += 1;
    }
    expect(zeilen, id).toBeGreaterThan(80);
  });

  it('Heizkörper (Prüfrunde 4 B4-1): die Isothermen liegen im Kern nahezu waagerecht – kein Stück steiler als 0,25 (14°), im Mittel flacher als 0,05', () => {
    for (const id of HEIZKOERPER) {
      for (const b of WAERMEFELDER[id].baender) {
        const p = polygon(b.d);
        const neigungen: number[] = [];
        for (let i = 1; i < p.length; i += 1) {
          const m = { x: (p[i].x + p[i - 1].x) / 2, y: (p[i].y + p[i - 1].y) / 2 };
          const dx = Math.abs(p[i].x - p[i - 1].x);
          const dy = Math.abs(p[i].y - p[i - 1].y);
          if (!imKern(id, m.x, m.y) || dx + dy < 0.5) continue;
          neigungen.push(dy / Math.max(dx, 1e-9));
        }
        if (neigungen.length === 0) continue;
        expect(Math.max(...neigungen), `${id} Band ${b.stufe}`).toBeLessThanOrEqual(0.25);
        expect(neigungen.reduce((a, c) => a + c, 0) / neigungen.length, `${id} Band ${b.stufe}`).toBeLessThan(0.05);
      }
    }
  });

  it('Heizkörper (Prüfrunde 4 A4-1, Morton, Taylor & Turner 1956): die Fahne weitet sich nach oben auf – Halbbreite linear in der Höhe, im Feld wächst ihre Breite mit der Höhe', () => {
    for (const id of HEIZKOERPER) {
      const e = eingabe(id);
      const h = e.aufgabe.heizkoerper!;
      const { innen } = e;
      // Halbbreite b = 0,12·ζ (+ von vorn ein fester Anteil der Baulänge): gleiche Zuwächse je gleicher Höhe
      const b = (dy: number) => halbbreite(h, h.y0 - dy);
      expect(b(100) - b(50), id).toBeCloseTo(b(50) - b(0), 9);
      expect((b(100) - b(0)) / 100, id).toBeCloseTo(0.12, 9);
      // Im Feld: Breite des Bereichs, in dem die Fahne mehr als ein Zehntel ihrer Achsenübertemperatur zufügt
      const breite = (y: number) => {
        const amAchse = fahnenzuschlag(e.aufgabe, achse(id), y);
        let n = 0;
        for (let x = innen.x; x <= innen.x + innen.breite; x += 0.5) if (fahnenzuschlag(e.aufgabe, x, y) >= amAchse / 10) n += 1;
        return n;
      };
      let vorher = 0;
      for (let y = h.y0 - 5; y > innen.y + 5; y -= 10) {
        const jetzt = breite(y);
        expect(jetzt, `${id} y = ${y}`).toBeGreaterThan(vorher);
        vorher = jetzt;
      }
    }
  });

  it('Prüfrunde 4 A4-1: keine senkrechte Kante – außer an Wänden (Fallströmung und Wandfahne, 12 Einheiten) und am Heizkörper (10 Einheiten) keine Punktfolge mit |dx| ≤ 1,5 über mehr als 30 Einheiten', () => {
    for (const id of IDS) {
      const { innen, baender } = WAERMEFELDER[id];
      const hf = eingabe(id).heizflaeche;
      const frei = (q: P) =>
        q.x > innen.x + 12 &&
        q.x < innen.x + innen.breite - 12 &&
        q.y > innen.y + 1 &&
        q.y < innen.y + innen.hoehe - 1 &&
        !(hf.hoehe > 0 && q.x > hf.x - 10 && q.x < hf.x + hf.breite + 10 && q.y > hf.y - 10 && q.y < hf.y + hf.hoehe + 10);
      for (const b of baender) {
        const p = polygon(b.d);
        for (let i = 0; i < p.length; i += 1) {
          if (!frei(p[i])) continue;
          let j = i;
          while (j + 1 < p.length && frei(p[j + 1]) && Math.abs(p[j + 1].x - p[i].x) <= 1.5) j += 1;
          expect(Math.abs(p[j].y - p[i].y), `${id} Band ${b.stufe} ab ${p[i].x} ${p[i].y}`).toBeLessThanOrEqual(30);
        }
      }
    }
  });

  it('Vergleichsraum mit Heizkörper (Prüfrunde 2 B2-2, Filling Box): die Luft sinkt über die ganze Breite, strömt am Boden zum Heizkörper zurück; die Innenwand ist oben wärmer als unten', () => {
    const z = rechnung.zwischen.get('raum-heizkoerper')!;
    const { aufgabe, innen, heizflaeche: hf } = z.eingabe;
    // Halbe Höhe: Aufstrom nur am Heizkörper (höchstens das erste Viertel der Breite), danach bis an die Innenwand überall
    // abwärts (v > 0, y nach unten) und nirgends mehr als das Doppelte des Mittels (kein Abstrom an einer Wand)
    const xs: number[] = [];
    for (let x = innen.x + 5; x < innen.x + innen.breite; x += 5) xs.push(x);
    const v = xs.map((x) => stroemung(aufgabe, x, innen.y + innen.hoehe / 2)[1]);
    const ab = v.findIndex((w) => w > 0);
    expect(v.slice(0, ab).every((w) => w < 0), 'Aufstrom am Heizkörper').toBe(true);
    expect(xs[ab] - innen.x, 'Ende des Aufstroms').toBeLessThan(innen.breite / 4);
    expect(xs[ab], 'Aufstrom am Heizkörper').toBeGreaterThan(hf.x + hf.breite);
    const abwaerts = v.slice(ab);
    expect(abwaerts.every((w) => w > 0)).toBe(true);
    const mittel = abwaerts.reduce((a, b) => a + b, 0) / abwaerts.length;
    expect(Math.max(...abwaerts)).toBeLessThan(2 * mittel);
    // Am Boden (5 Einheiten darüber) strömt die Luft überall zum Heizkörper (links, u < 0), unter der Decke von ihm weg
    for (let x = innen.x + 5; x < innen.x + innen.breite - 5; x += 5) {
      expect(stroemung(aufgabe, x, innen.y + innen.hoehe - 5)[0], `x = ${x}`).toBeLessThan(0);
      expect(stroemung(aufgabe, x, innen.y + 5)[0], `x = ${x}`).toBeGreaterThan(0);
    }
    // Die Innenwand ist nicht die kälteste Zone: oben deutlich wärmer als unten und als der Boden im Raum
    const { gitter: g, theta } = z.loesung;
    const i = g.nx - 1;
    const wert = (abBoden: number) => theta[Math.round((innen.y + innen.hoehe - abBoden - g.y0) / g.dy) * g.nx + i];
    expect(wert(innen.hoehe - 10) - wert(10)).toBeGreaterThan(0.02);
    expect(wert(innen.hoehe - 10)).toBeGreaterThan(schicht('raum-heizkoerper', 2, 12) + 0.02);
  });

  it('Fußbodenheizung: am Boden am wärmsten, das heißeste Band liegt am Boden; nur an der Außenwand kühler (Band 0 an der Decke nur bis 1 m von ihr, Prüfrunde 4 B4-1)', () => {
    const { innen, baender } = WAERMEFELDER['raum-fussboden'];
    expect(schicht('raum-fussboden', 2, 82)).toBeGreaterThan(schicht('raum-fussboden', innen.hoehe - 82, innen.hoehe - 2));
    const proben = Array.from({ length: 41 }, (_, i) => ({ x: innen.x + 5 + (i * (innen.breite - 10)) / 40, y: innen.y + innen.hoehe - 1 }));
    const amBoden = (b: number) => proben.filter((q) => imPolygon(q, polygon(baender[b].d))).length / proben.length;
    // Auf der gemeinsamen Skala hat sie weniger Bänder; jedes deckt den Boden fast ganz
    for (let k = 0; k < baender.length; k += 1) expect(amBoden(k), `Band ${k + 1}`).toBeGreaterThanOrEqual(0.9);
    // Die kühle Stelle am Boden liegt an der Außenwand: das heißeste Band reicht dort weniger als ein Viertel so hoch wie an der Innenwand
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
    // Unter der Decke: Band 1 überall, außer bis 1 m von der Außenwand
    const band1 = polygon(baender[0].d);
    for (let x = innen.x + 100; x < innen.x + innen.breite - 2; x += 4) expect(imPolygon({ x, y: innen.y + 1 }, band1), `x = ${x}`).toBe(true);
    // Je heißer, desto tiefer der Schwerpunkt; jedes Band wächst aus der Mitte des Bodens
    const tiefe = baender.map((b) => schwerpunkt(polygon(b.d)).y);
    for (let k = 1; k < tiefe.length; k += 1) expect(tiefe[k]).toBeGreaterThan(tiefe[k - 1]);
    for (const b of baender) expect(b.ursprung).toEqual({ x: innen.x + innen.breite / 2, y: innen.y + innen.hoehe });
  });

  it('Vergleichsräume auf derselben absoluten Skala (Prüfrunde 4 B4-1, B4-3): gleiches Raummittel, gleiche Schwellen, die heißesten Stufen nur in der Fahne über dem Heizkörper', () => {
    const hk = rechnung.zwischen.get('raum-heizkoerper')!;
    const fb = rechnung.zwischen.get('raum-fussboden')!;
    const [hkBaender, fbBaender] = [WAERMEFELDER['raum-heizkoerper'].baender, WAERMEFELDER['raum-fussboden'].baender];
    // Dasselbe Mittel der Raumluft (Thermostat) und Schwellen bei festen K über diesem Mittel
    expect(Math.abs(hk.mittel - fb.mittel)).toBeLessThan(0.0002);
    expect(SKALA_VERGLEICH.art).toBe('absolut');
    const stufenK = SKALA_VERGLEICH.art === 'absolut' ? SKALA_VERGLEICH.stufenK : [];
    hkBaender.forEach((b, k) => expect(b.schwelle).toBe(Math.round(((MITTEL + stufenK[k]) / SPANNE) * 1000) / 1000));
    fbBaender.forEach((b, k) => expect(b.schwelle).toBe(hkBaender[k].schwelle));
    expect(hkBaender.map((b) => b.schwelle)).toEqual(hk.schwellen);
    // Der Raum mit Heizkörper hat alle vier Stufen, die Fußbodenheizung weniger und nie die beiden heißesten
    expect(hkBaender.map((b) => b.stufe)).toEqual([1, 2, 3, 4]);
    expect(fbBaender.map((b) => b.stufe)).not.toContain(3);
    expect(fbBaender.map((b) => b.stufe)).not.toContain(4);
    // „mit Fußbodenheizung ist die Luft fast nirgends so warm“ (lib/zeichnung/erklaerung.ts): über Stufe 3 weniger als 1 %, über 4 nichts
    expect(anteilUeber(fb.glatt, hkBaender[2].schwelle)).toBeLessThan(0.01);
    expect(anteilUeber(fb.glatt, hkBaender[3].schwelle)).toBe(0);
    // Stufe 3 und 4 liegen nur in der Fahne: jeder Knoten über Stufe 3 ist Heizkörper, Fahne oder von ihr um mehr als 0,5 K erwärmt
    const g = hk.loesung.gitter;
    const { aufgabe, heizflaeche: hf } = hk.eingabe;
    for (let q = 0; q < hk.glatt.length; q += 1) {
      if (hk.glatt[q] < hkBaender[2].schwelle) continue;
      const x = g.x0 + (q % g.nx) * g.dx;
      const y = g.y0 + Math.floor(q / g.nx) * g.dy;
      const amHk = x >= hf.x - 6 && x <= hf.x + hf.breite + 6 && y >= hf.y - 6 && y <= hf.y + hf.hoehe + 6;
      expect(amHk || inFahne(aufgabe, x, y) || fahnenzuschlag(aufgabe, x, y) >= 0.5, `${x} ${y}`).toBe(true);
    }
    // Gleichmäßiger, im Bild: die kühlste Stufe deckt mehr vom Raum, die heißeste gezeichnete weniger als beim Heizkörper
    expect(fbBaender[0].flaecheAnteil).toBeGreaterThan(hkBaender[0].flaecheAnteil);
    const oben = fbBaender[fbBaender.length - 1];
    expect(oben.flaecheAnteil).toBeLessThan(hkBaender[oben.stufe - 1].flaecheAnteil);
    // Jedes gezeichnete Band hat mindestens MIN_FLAECHE; die nächste Stufe hätte sie nicht
    for (const b of [...hkBaender, ...fbBaender]) expect(b.flaecheAnteil, `Stufe ${b.stufe}`).toBeGreaterThanOrEqual(MIN_FLAECHE);
    expect(anteilUeber(fb.glatt, hkBaender[fbBaender.length].schwelle)).toBeLessThan(MIN_FLAECHE);
  });

  it('Hausschnitt (Hero, ohne Vergleich): Schwellen bei 64, 45, 2 und 1 % der Raumluft; die beiden heißesten Stufen sind Kuppeln über dem Heizkörper unter der Decke', () => {
    expect(SKALA_HERO).toEqual({ art: 'flaeche', anteile: [0.64, 0.45, 0.02, 0.01] });
    const z = rechnung.zwischen.get('hausschnitt')!;
    const luft = luftknoten(z.eingabe, z.loesung.gitter, z.glatt);
    const anteile = SKALA_HERO.art === 'flaeche' ? SKALA_HERO.anteile : [];
    // Schwellen auf 0,001 gerundet: der Anteil weicht höchstens um einen Prozentpunkt ab
    WAERMEFELDER.hausschnitt.baender.forEach((b, k) => expect(Math.abs(anteilUeber(luft, b.schwelle) - anteile[k]), `Stufe ${b.stufe}`).toBeLessThanOrEqual(0.01));
    const { innen } = WAERMEFELDER.hausschnitt;
    for (const b of WAERMEFELDER.hausschnitt.baender.slice(2)) expect(Math.min(...polygon(b.d).map((q) => q.y)), `Stufe ${b.stufe}`).toBeGreaterThan(innen.y + 30);
  });

  it('Heizkörper (Prüfrunde 1 B1-2): unter dem Heizkörper kein heißes Band, die Luft dort nicht wärmer als unten in Raummitte', () => {
    for (const id of HEIZKOERPER) {
      const z = rechnung.zwischen.get(id)!;
      const { innen, heizflaeche: hf } = z.eingabe;
      const unten = innen.y + innen.hoehe;
      // Zwischen Unterkante und Boden: höchstens Band 1
      const proben: { x: number; y: number }[] = [];
      for (let x = Math.max(hf.x, innen.x) + 1; x < hf.x + hf.breite; x += 2) for (let y = hf.y + hf.hoehe + 1; y < unten; y += 2) proben.push({ x, y });
      expect(proben.length, id).toBeGreaterThan(20);
      for (const b of WAERMEFELDER[id].baender.slice(1)) {
        const flaeche = polygon(b.d);
        expect(proben.filter((q) => imPolygon(q, flaeche)), `${id} Band ${b.stufe}`).toEqual([]);
      }
      // Mittel unter dem Heizkörper ≤ Schicht 0–0,8 m in Raummitte + 0,025
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

  it('Fußbodenheizung gleichmäßiger: zwischen Knöchel (0,1 m) und Kopf (1,1 m) und vom Boden zur Decke ein kleinerer Unterschied als mit Heizkörper', () => {
    const unterschied = (id: WaermefeldId) => Math.abs(zeile(id, 110) - zeile(id, 10));
    for (const id of HEIZKOERPER) expect(unterschied('raum-fussboden'), id).toBeLessThan(unterschied(id));
    // Mit Heizkörper am Kopf wärmer als an den Füßen, mit Fußbodenheizung umgekehrt
    for (const id of HEIZKOERPER) expect(zeile(id, 110), id).toBeGreaterThan(zeile(id, 10));
    expect(zeile('raum-fussboden', 10)).toBeGreaterThan(zeile('raum-fussboden', 110));
    // Über die ganze Höhe in Raummitte: höchstens ein Drittel der Spanne des Raums mit Heizkörper
    const spanne = (id: WaermefeldId) => {
      const werte = Array.from({ length: 125 }, (_, k) => zeile(id, 2 * k + 2));
      return Math.max(...werte) - Math.min(...werte);
    };
    expect(spanne('raum-fussboden')).toBeLessThan(spanne('raum-heizkoerper') / 3);
  });

  it('Reihenfolge: heiß → kühl streng steigend, erst die Fahne, dann die Deckenschicht; Fenster ganz genutzt (Hero 7…16,5, Seite 0…22), halbe Takte', () => {
    for (const id of IDS) {
      const takte = WAERMEFELDER[id].baender.map((b) => b.startTakte).reverse();
      for (let k = 1; k < takte.length; k += 1) expect(takte[k], id).toBeGreaterThan(takte[k - 1]);
      for (const t of takte) expect(Number.isInteger(t * 2), `${id}: ${t}`).toBe(true);
      expect([takte[0], takte[takte.length - 1]], id).toEqual([...eingabe(id).fenster]);
      // Die Rechnung: die Zone des heißesten Bands erwärmt sich zuerst; jedes Band der Fahne vor jedem der Deckenschicht
      const z = rechnung.zwischen.get(id)!;
      const ankunft = z.ankunft;
      for (let k = 1; k < ankunft.length; k += 1) expect(ankunft[k], id).toBeLessThan(ankunft[k - 1]);
      const fahne = WAERMEFELDER[id].baender.filter((_, k) => !z.deckenband[k]).map((b) => b.startTakte);
      const decke = WAERMEFELDER[id].baender.filter((_, k) => z.deckenband[k]).map((b) => b.startTakte);
      if (fahne.length > 0 && decke.length > 0) expect(Math.min(...decke), id).toBeGreaterThan(Math.max(...fahne));
      // Jeder Ring besteht nur aus Luftknoten (keiner auf dem Heizkörper), mindestens 20 je Band; die Wärme braucht Zeit
      const g = z.loesung.gitter;
      expect(z.ringe.length, id).toBe(ankunft.length);
      for (const [k, ring] of z.ringe.entries()) {
        expect(ring.length, `${id} Band ${k + 1}`).toBeGreaterThanOrEqual(20);
        const aufHk = ring.filter((q) => {
          const x = g.x0 + (q % g.nx) * g.dx;
          const y = g.y0 + Math.floor(q / g.nx) * g.dy;
          const hf = z.eingabe.heizflaeche;
          return hf.hoehe > 0 && x >= hf.x && x <= hf.x + hf.breite && y >= hf.y && y <= hf.y + hf.hoehe;
        });
        expect(aufHk, `${id} Band ${k + 1}`).toEqual([]);
      }
      expect(Math.min(...ankunft), id).toBeGreaterThan(0);
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

/**
 * Zwischenstände der Bewegung (Prüfrunde 4 B4-2): die Keyframes aus waerme.module.css – `wachsen` (scaleY um den Ursprung
 * und Deckkraft) bzw. `einblenden` (nur Deckkraft, die Deckenschicht) –, je Band ab `startTakte` über d-4. Auf senkrechten
 * Linien außerhalb der Fahne wird die Farbe als Stufe gemischt (Band über Band, Deckkraft wie im Browser); sie darf nach
 * oben nie fallen (Heizkörper) bzw. nie steigen (Fußbodenheizung, am Boden am wärmsten). Jedes Band der Deckenschicht
 * hängt, sobald es sichtbar ist, an der Decke; kein Band mit Deckenkontakt außerhalb der Fahne wird skaliert.
 */
describe('Wärmefeld: Zwischenstände der Bewegung (Prüfrunde 4 B4-2)', () => {
  const css = readFileSync(path.join(ROOT, 'components/zeichnung/waerme/waerme.module.css'), 'utf8');
  const ablaeufe = keyframesIn(css);
  const wachsen = ablaeufe.find((k) => k.name === 'wachsen')!;
  const einblenden = ablaeufe.find((k) => k.name === 'einblenden')!;
  /** Wert einer Eigenschaft zur Stelle p (0…1), linear zwischen den Keyframes, die sie setzen (am Ende der Endwert 1). */
  const wert = (eigenschaft: 'scaleY' | 'opacity', p: number, ablauf = wachsen) => {
    const punkte = ablauf.stopps
      .map((s) => {
        const roh = eigenschaft === 'scaleY' ? s.deklarationen.get('transform')?.match(/^scaleY\(([\d.]+)\)$/)?.[1] : s.deklarationen.get('opacity');
        return roh === undefined ? null : ([s.anteil / 100, Number(roh)] as const);
      })
      .filter((q): q is readonly [number, number] => q !== null);
    if (punkte.at(-1)![0] < 1) punkte.push([1, 1]);
    if (p <= 0) return punkte[0][1];
    for (let i = 1; i < punkte.length; i += 1) {
      const [a, va] = punkte[i - 1];
      const [b, vb] = punkte[i];
      if (p <= b) return va + ((p - a) / (b - a)) * (vb - va);
    }
    return punkte.at(-1)![1];
  };

  it('die Keyframes sind die einzige Bewegung: scaleY auf den √t-Stützstellen, Deckkraft 0 → 1 im ersten Viertel', () => {
    expect(wachsen.stopps.map((s) => s.anteil)).toEqual(DIFFUSION_STUETZ.map(([t]) => t * 100));
    DIFFUSION_STUETZ.forEach(([t, f]) => expect(wert('scaleY', t)).toBeCloseTo(0.6 + 0.4 * f, 9));
    expect([wert('opacity', 0), wert('opacity', 0.25), wert('opacity', 1)]).toEqual([0, 1, 1]);
    // Einblenden: kein Maßstab, Deckkraft nach √t
    expect(einblenden.stopps.every((s) => !s.deklarationen.has('transform'))).toBe(true);
    DIFFUSION_STUETZ.forEach(([t, f]) => expect(wert('opacity', t, einblenden)).toBeCloseTo(f, 9));
  });

  it.each(IDS)('%s: in keinem Zwischenstand liegt außerhalb der Fahne eine kühlere Stufe über einer wärmeren (bzw. bei der Fußbodenheizung eine wärmere über einer kühleren); die Deckenschicht hängt an der Decke', (id) => {
    const { innen, baender } = WAERMEFELDER[id];
    const e = eingabe(id);
    const z = rechnung.zwischen.get(id)!;
    const h = e.aufgabe.heizkoerper;
    const polygone = baender.map((b) => polygon(b.d));
    const ende = Math.max(...baender.map((b) => b.startTakte)) * TAKT_MS + DAUER_MS['d-4'];
    const linien: number[] = [];
    for (let x = innen.x + 13; x < innen.x + innen.breite - 12; x += 5) {
      if (h && Math.abs(x - achse(id)) <= fahnenrand(h, innen.y) + h.grenzschicht + 6) continue;
      linien.push(x);
    }
    expect(linien.length, id).toBeGreaterThan(30);
    let staende = 0;
    for (let t = 0; t <= ende + 40; t += 40) {
      // Maßstab und Deckkraft je Band zur Zeit t
      const zustand = baender.map((b) => {
        const p = (t - b.startTakte * TAKT_MS) / DAUER_MS['d-4'];
        if (b.bewegung === 'einblenden') return { s: 1, a: wert('opacity', p, einblenden), o: b.ursprung.y };
        return { s: wert('scaleY', p), a: wert('opacity', p), o: b.ursprung.y };
      });
      const deckt = (k: number, x: number, y: number) => imPolygon({ x, y: zustand[k].o + (y - zustand[k].o) / zustand[k].s }, polygone[k]);
      for (const x of linien) {
        let vorher = h ? -Infinity : Infinity;
        for (let y = innen.y + 1; y < innen.y + innen.hoehe - 1; y += 2) {
          let w = 0;
          for (let k = 0; k < baender.length; k += 1) if (zustand[k].a > 0 && deckt(k, x, y)) w = (1 - zustand[k].a) * w + zustand[k].a * baender[k].stufe;
          // y wächst nach unten: mit Heizkörper wird die Stufe nach unten nie größer, mit Fußbodenheizung nie kleiner
          if (h) expect(w, `${id} t = ${t} ms, x = ${x}, y = ${y}`).toBeLessThanOrEqual(vorher === -Infinity ? Infinity : vorher + 1e-9);
          else expect(w, `${id} t = ${t} ms, x = ${x}, y = ${y}`).toBeGreaterThanOrEqual(vorher === Infinity ? -Infinity : vorher - 1e-9);
          vorher = w;
        }
        // Ein sichtbares Band der Deckenschicht deckt an dieser Stelle auch die Luft direkt unter der Decke (es wird nie skaliert)
        baender.forEach((_, k) => {
          if (z.deckenband[k]) expect(baender[k].bewegung, `${id} Band ${k + 1}`).toBe('einblenden');
          if (!z.deckenband[k] || zustand[k].a <= 0) return;
          if (imPolygon({ x, y: innen.y + 1 }, polygone[k])) expect(deckt(k, x, innen.y + 1), `${id} Band ${k + 1}, t = ${t} ms, x = ${x}`).toBe(true);
        });
      }
      staende += 1;
    }
    expect(staende, id).toBeGreaterThan(10);
  });
});
