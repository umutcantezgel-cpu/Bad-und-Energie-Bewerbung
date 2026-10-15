import { describe, expect, it } from 'vitest';
import { ARMATUR_SYMBOLE, KUGEL_R, PFLICHT_SYMBOLE, SYMBOLE, anschlussPunkt, type SymbolDef, type SymbolForm } from '../symbole';

/**
 * Formtests der Armaturen aus E-031 (KERN 1.3, K-003.2): Kugelhahn offen und geschlossen (Absperrung „Diskret
 * wechseln“) und Durchflussmesser (Verteiler des Themen-Hubs), Grundlage DIN EN ISO 10628-2 wie die übrigen Symbole.
 */

/** Eckpunkte eines Pfads aus M/L/H/V (absolut). */
function ecken(d: string): Array<[number, number]> {
  let x = 0;
  let y = 0;
  return [...d.matchAll(/([MLHV])\s*(-?[\d.]+)(?:\s+(-?[\d.]+))?/g)].map((m) => {
    if (m[1] === 'H') x = Number(m[2]);
    else if (m[1] === 'V') y = Number(m[2]);
    else [x, y] = [Number(m[2]), Number(m[3])];
    return [x, y];
  });
}

const pfade = (def: SymbolDef) => def.formen.filter((f): f is Extract<SymbolForm, { d: string }> => 'd' in f);

describe('Armaturen (E-031): Kugelhahn und Durchflussmesser nach DIN EN ISO 10628-2', () => {
  it('Pflichtumfang K-010 unverändert; die Armaturen kommen getrennt dazu, jede mit Namen, Lesart und Anschlüssen auf dem Rand', () => {
    expect(PFLICHT_SYMBOLE).toHaveLength(13);
    expect(ARMATUR_SYMBOLE).toEqual(['kugelhahn', 'kugelhahnGeschlossen', 'durchflussmesser']);
    for (const id of ARMATUR_SYMBOLE) {
      const def: SymbolDef = SYMBOLE[id];
      expect(PFLICHT_SYMBOLE, id).not.toContain(id);
      expect(def.name.length, id).toBeGreaterThan(3);
      expect(def.beschreibung.length, id).toBeGreaterThan(10);
      // Durchgangsarmaturen: Eintritt links, Austritt rechts, auf der Achse und auf dem Rand der Hülle
      expect(def.anschluesse, id).toEqual({ ein: { x: -def.halb.x, y: 0 }, aus: { x: def.halb.x, y: 0 } });
      for (const f of pfade(def)) {
        for (const [x, y] of ecken(f.d)) {
          expect(Math.abs(x), `${id} ${f.d}`).toBeLessThanOrEqual(def.halb.x);
          expect(Math.abs(y), `${id} ${f.d}`).toBeLessThanOrEqual(def.halb.y);
        }
      }
    }
  });

  it('Kugelhahn: Ventilkörper wie das Absperrventil, dazu die Kugel als gefüllter Kreis um die Mitte', () => {
    const offen = SYMBOLE.kugelhahn;
    expect(offen.formen.slice(0, 2)).toEqual(SYMBOLE.absperrventil.formen);
    const kugel = offen.formen[2] as { d: string; voll?: boolean };
    expect(kugel.voll).toBe(true);
    // Zwei Halbbögen mit dem Halbmesser der Kugel, von (−r | 0) über (r | 0) zurück: ein Kreis um (0 | 0)
    expect(kugel.d).toBe(`M${-KUGEL_R} 0A${KUGEL_R} ${KUGEL_R} 0 1 0 ${KUGEL_R} 0A${KUGEL_R} ${KUGEL_R} 0 1 0 ${-KUGEL_R} 0Z`);
    // Die Kugel ist kleiner als der Körper: Die Dreiecke bleiben an der Spitze sichtbar
    expect(KUGEL_R * 2).toBeLessThan(offen.halb.y * 2);
    expect(KUGEL_R).toBeGreaterThan(2);
  });

  it('Kugelhahn geschlossen: derselbe Körper gefüllt (geschlossene Armatur), die Kugel als Ring darüber; offen bleibt der Körper leer', () => {
    const offen = SYMBOLE.kugelhahn.formen as readonly SymbolForm[];
    const zu = SYMBOLE.kugelhahnGeschlossen.formen as readonly SymbolForm[];
    // Gleiche Dreiecke, geschlossen gefüllt, offen leer
    expect(zu.slice(0, 2).map((f) => ('d' in f ? f.d : null))).toEqual(offen.slice(0, 2).map((f) => ('d' in f ? f.d : null)));
    expect(zu.slice(0, 2).every((f) => 'd' in f && f.voll === true)).toBe(true);
    expect(offen.slice(0, 2).some((f) => 'd' in f && f.voll === true)).toBe(false);
    // Die Kugel an derselben Stelle mit demselben Halbmesser: offen gefüllt, geschlossen als Ring (Kontur mit Fläche),
    // sonst verschwände sie im gefüllten Körper; die Kugel liegt zuletzt, also über den Dreiecken
    expect(zu[2]).toEqual({ cx: 0, cy: 0, r: KUGEL_R });
    expect(zu).toHaveLength(3);
    expect(SYMBOLE.kugelhahnGeschlossen.beschreibung).toMatch(/geschlossen/);
    expect(SYMBOLE.kugelhahn.beschreibung).toMatch(/offen/);
  });

  it('Durchflussmesser: konisches Messrohr, eng am Eintritt, weit am Austritt; der Schwebekörper liegt im Rohr', () => {
    const def = SYMBOLE.durchflussmesser;
    const [rohr, koerper] = pfade(def);
    const r = ecken(rohr.d);
    // Eintritt (x = −14) schmaler als Austritt (x = 14), symmetrisch zur Achse
    const breite = (x: number) => {
      const ys = r.filter(([px]) => px === x).map(([, py]) => py);
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(breite(-def.halb.x)).toBeLessThan(breite(def.halb.x));
    expect(breite(def.halb.x)).toBe(def.halb.y * 2);
    expect(r.every(([, y]) => r.some(([, y2]) => y2 === -y))).toBe(true);
    expect(rohr).not.toHaveProperty('voll');
    // Der Schwebekörper ist gefüllt und liegt an jeder Stelle innerhalb der Rohrwand (Wand: lineare Weitung)
    expect(koerper.voll).toBe(true);
    const halbeWeite = (x: number) => 3.5 + ((x + def.halb.x) / (2 * def.halb.x)) * (6 - 3.5);
    for (const [x, y] of ecken(koerper.d)) expect(Math.abs(y), `${x} ${y}`).toBeLessThanOrEqual(halbeWeite(x));
  });

  it('Anschlüsse drehen mit: senkrecht gestellt (−90°) liegt der Eintritt unten, der Austritt oben', () => {
    const lage = { x: 100, y: 50, drehung: -90, massstab: 2 };
    expect(anschlussPunkt('durchflussmesser', 'ein', lage)).toEqual({ x: 100, y: 78 });
    expect(anschlussPunkt('durchflussmesser', 'aus', lage)).toEqual({ x: 100, y: 22 });
    expect(anschlussPunkt('kugelhahnGeschlossen', 'aus', { x: 36, y: 0 })).toEqual({ x: 48, y: 0 });
  });
});
