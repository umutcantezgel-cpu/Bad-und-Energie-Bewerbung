import { describe, expect, it } from 'vitest';
import { GESCHAETZT, MASSSTAB } from '../norm';
import { VERTEILER_MM, verteiler, type Rechteck } from '../szenen/verteiler';
import { SYMBOLE, anschlussPunkt } from '../symbole';

/**
 * Heizkreisverteiler des Themen-Hubs (E-031, K-003.2): maßstäblich (1 Einheit = 1 mm), ein Kreis je Thema, Leitungen
 * in Fließrichtung, Armaturen nach den Normsymbolen.
 */

/** Anfang und Ende eines Pfads aus M und H/V (absolut). */
function enden(d: string): { von: { x: number; y: number }; bis: { x: number; y: number } } {
  const m = d.match(/^M(-?[\d.]+) (-?[\d.]+)/)!;
  const von = { x: Number(m[1]), y: Number(m[2]) };
  let bis = { ...von };
  for (const [, c, w] of d.matchAll(/([HV])(-?[\d.]+)/g)) bis = c === 'H' ? { ...bis, x: Number(w) } : { ...bis, y: Number(w) };
  return { von, bis };
}

const innen = (r: Rechteck, box: { x: number; y: number; breite: number; hoehe: number }) =>
  r.x >= box.x && r.y >= box.y && r.x + r.width <= box.x + box.breite && r.y + r.height <= box.y + box.hoehe;

describe('Heizkreisverteiler (lib/zeichnung/szenen/verteiler.ts)', () => {
  it('alle Maße begründet und als Schätzung markiert (kein bestimmtes Modell), Maßstab 1 : 1', () => {
    expect(MASSSTAB.geraet).toBe(1);
    for (const [name, m] of Object.entries(VERTEILER_MM)) {
      expect(m.geschaetzt, name).toBe(GESCHAETZT);
      expect(m.stelle.length, name).toBeGreaterThan(10);
      expect(m.mm, name).toBeGreaterThan(0);
    }
    expect([VERTEILER_MM.kreisAbstand.mm, VERTEILER_MM.balkenAbstand.mm]).toEqual([50, 200]);
  });

  it.each([1, 5, 6, 8])('%i Kreise: Abgänge im Abstand von 50 mm, Balken so lang wie die Abgänge plus Rand', (n) => {
    const z = verteiler(n);
    const { rand, kreisAbstand, balkenAbstand, balken } = VERTEILER_MM;
    expect(z.kreise).toHaveLength(n);
    expect(z.kreise.map((k) => k.x)).toEqual(Array.from({ length: n }, (_, i) => rand.mm + i * kreisAbstand.mm));
    for (const b of [z.balken.vorlauf, z.balken.ruecklauf]) {
      expect(b.x).toBe(0);
      expect(b.width).toBe(2 * rand.mm + (n - 1) * kreisAbstand.mm);
      expect(b.height).toBe(balken.mm);
    }
    // Vorlauf oben, Rücklauf darunter im Achsabstand
    expect(z.balken.ruecklauf.y - z.balken.vorlauf.y).toBe(balkenAbstand.mm);
    // Kreisschilder: je Kreis eine Lage als Anteil der Breite, steigend, innerhalb der Zeichnung
    expect(z.schilder).toHaveLength(n);
    z.schilder.forEach((s, i) => {
      expect(s).toBeCloseTo((z.kreise[i].x - z.viewBox.x) / z.viewBox.breite, 3);
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThan(1);
    });
  });

  it('jedes Teil liegt im Rahmen der Zeichnung', () => {
    const z = verteiler(6);
    const teile = [
      z.balken.vorlauf,
      z.balken.ruecklauf,
      ...z.zuleitung.muttern,
      ...z.endstuecke.flatMap((e) => [e.koerper, ...e.entluefter, ...e.kfe]),
      ...z.kreise.flatMap((k) => [k.messerMutter, k.messerKappe, k.vorlaufMutter, k.ruecklaufMutter]),
    ];
    for (const r of teile) expect(innen(r, z.viewBox), JSON.stringify(r)).toBe(true);
    for (const d of [z.zuleitung.vorlauf, z.zuleitung.ruecklauf, ...z.kreise.flatMap((k) => [k.vorlauf, k.ruecklauf])]) {
      const { von, bis } = enden(d);
      for (const p of [von, bis]) {
        expect(p.x).toBeGreaterThanOrEqual(z.viewBox.x);
        expect(p.x).toBeLessThanOrEqual(z.viewBox.x + z.viewBox.breite);
        expect(p.y).toBeGreaterThanOrEqual(z.viewBox.y);
        expect(p.y).toBeLessThanOrEqual(z.viewBox.y + z.viewBox.hoehe);
      }
    }
  });

  it('Leitungen in Fließrichtung: Vorlauf vom Erzeuger in den oberen Balken und in die Kreise, Rücklauf zurück', () => {
    const z = verteiler(5);
    const vb = z.balken.vorlauf;
    const rb = z.balken.ruecklauf;
    // Zuleitung: Vorlauf läuft nach rechts in den Balken, Rücklauf nach links hinaus; beide auf der Balkenachse
    const zv = enden(z.zuleitung.vorlauf);
    const zr = enden(z.zuleitung.ruecklauf);
    expect(zv.bis.x).toBeGreaterThan(zv.von.x);
    expect(zr.bis.x).toBeLessThan(zr.von.x);
    expect([zv.von.y, zr.von.y]).toEqual([vb.y + vb.height / 2, rb.y + rb.height / 2]);
    // Fließpfeile zeigen mit der Spitze in Fließrichtung
    const spitze = (d: string) => Number(d.match(/^M(-?[\d.]+)/)![1]);
    const basis = (d: string) => Number(d.match(/L(-?[\d.]+)/)![1]);
    expect(spitze(z.zuleitung.pfeilVorlauf)).toBeGreaterThan(basis(z.zuleitung.pfeilVorlauf));
    expect(spitze(z.zuleitung.pfeilRuecklauf)).toBeLessThan(basis(z.zuleitung.pfeilRuecklauf));
    for (const k of z.kreise) {
      const v = enden(k.vorlauf);
      const r = enden(k.ruecklauf);
      // Vorlauf beginnt an der Mutter unter dem oberen Balken und läuft nach unten; Rücklauf kommt von unten zurück
      expect(v.von).toEqual({ x: k.x, y: k.vorlaufMutter.y + k.vorlaufMutter.height });
      expect(v.bis.y).toBeGreaterThan(v.von.y);
      expect(r.bis).toEqual({ x: k.x, y: k.ruecklaufMutter.y + k.ruecklaufMutter.height });
      expect(r.bis.y).toBeLessThan(r.von.y);
      // Der Vorlauf eines Kreises endet weit über dem Rücklaufbalken (kein Durchdringen)
      expect(v.bis.y).toBeLessThan(rb.y);
      expect(k.vorlaufMutter.y).toBe(vb.y + vb.height);
      expect(k.ruecklaufMutter.y).toBe(rb.y + rb.height);
    }
  });

  it('Durchflussmesser auf dem Vorlauf: senkrecht, von unten durchströmt, sitzt auf der Mutter, darüber die Kappe', () => {
    for (const k of verteiler(5).kreise) {
      expect(k.messer.drehung).toBe(-90);
      const ein = anschlussPunkt('durchflussmesser', 'ein', k.messer);
      const aus = anschlussPunkt('durchflussmesser', 'aus', k.messer);
      expect(ein).toEqual({ x: k.x, y: k.messerMutter.y });
      expect(aus).toEqual({ x: k.x, y: k.messerKappe.y + k.messerKappe.height });
      expect(k.messerMutter.y + k.messerMutter.height).toBe(-VERTEILER_MM.balken.mm / 2);
      expect(ein.y - aus.y).toBe(VERTEILER_MM.messrohr.mm);
      // Die Kappe ist so breit wie das weite Ende des Messrohrs oder breiter
      expect(k.messerKappe.width).toBeGreaterThanOrEqual(SYMBOLE.durchflussmesser.halb.y * 2 * (k.messer.massstab ?? 1));
    }
  });

  it('Ventilkopf auf der Vorderseite des Rücklaufbalkens, im Balken, mit Stift; Endstücke mit Entlüfter und KFE-Hahn', () => {
    const z = verteiler(4);
    const rb = z.balken.ruecklauf;
    for (const k of z.kreise) {
      expect(k.ventilkopf.cy).toBe(rb.y + rb.height / 2);
      expect(k.ventilkopf.r * 2).toBe(VERTEILER_MM.ventilkopf.mm);
      expect(k.ventilkopf.r).toBeLessThanOrEqual(rb.height / 2);
      expect(k.ventilkopf.stift).toBeLessThan(k.ventilkopf.r);
    }
    expect(z.endstuecke).toHaveLength(2);
    for (const [e, b] of [
      [z.endstuecke[0], z.balken.vorlauf],
      [z.endstuecke[1], z.balken.ruecklauf],
    ] as const) {
      // am rechten Balkenende; der Entlüfter steht oben auf dem Endstück, der KFE-Hahn rechts daran
      expect(e.koerper.x).toBe(b.x + b.width);
      const [schaft, kappe] = e.entluefter;
      expect(schaft.y + schaft.height).toBe(e.koerper.y);
      expect(kappe.y + kappe.height).toBe(schaft.y);
      expect(e.kfe[0].x).toBe(e.koerper.x + e.koerper.width);
      expect(e.tuelle.startsWith(`M${e.kfe[0].x + e.kfe[0].width} `)).toBe(true);
    }
  });

  it('weist unsinnige Kreiszahlen ab', () => {
    expect(() => verteiler(0)).toThrow();
    expect(() => verteiler(2.5)).toThrow();
  });
});
