import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { TOKENS } from '@/lib/tokens';
import { COMPRESS_AW_L } from '../geraete/compress-aw-l';
import { COMPRESS_AW_S } from '../geraete/compress-aw-s';
import { INNENEINHEIT } from '../geraete/inneneinheit';
import { seitenansicht, vorderansicht } from '../geraete/ansicht';
import { alleMasse } from '../geraete/typen';
import { BOSCH_FREIGABE, markeErlaubt, wirksameVariante } from '../marke';
import { GESCHAETZT, LINIENARTEN, MASSSTAB, SCHRIFTFELD, ZEICHNUNG_LINIEN, fliesspfeil, leitungsStrecken, leitungsweg, masslinie } from '../norm';
import {
  BAUTEILE,
  DURCHFUEHRUNG,
  FROSTTIEFE,
  GERAET_LAGE,
  HAUS_LAGE,
  HAUSSCHNITT_ANSCHLUSS,
  HAUSSCHNITT_ERDLEITUNG,
  HAUSSCHNITT_FROST,
  HAUSSCHNITT_GOK,
  HAUSSCHNITT_RAHMEN,
  HEIZKOERPER_LAGE,
  HEIZKOERPER_MM,
  KIESBETT_HOEHE,
  KNOPF_LEITUNG,
  KONDENSAT_LAGE,
  LEITUNGEN,
  PFEILE,
  SCHOTTER_LAGE,
  SOCKEL_EINBINDUNG,
  SOCKEL_LAGE,
} from '../szenen/hausschnitt';
import { PFLICHT_SYMBOLE, SYMBOLE, anschlussPunkt } from '../symbole';

const ROOT = path.resolve(__dirname, '../../..');

/** Punkte eines Pfads aus M/L/H/V/A/Q (absolut), Endpunkte je Befehl. */
function endpunkte(d: string): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  let x = 0;
  let y = 0;
  for (const m of d.matchAll(/([MLHVAQZ])([^MLHVAQZ]*)/g)) {
    const n = (m[2].match(/-?\d*\.?\d+/g) ?? []).map(Number);
    if (m[1] === 'H') x = n[0];
    else if (m[1] === 'V') y = n[0];
    else if (m[1] === 'A') [x, y] = [n[5], n[6]];
    else if (m[1] === 'Q') [x, y] = [n[2], n[3]];
    else if (m[1] === 'Z') continue;
    else [x, y] = [n[0], n[1]];
    out.push({ x, y });
  }
  return out;
}

describe('Linienarten (K-010, DIN EN ISO 128-2)', () => {
  it('nimmt die Stärken aus den Tokens; Enden und Ecken je Linienart exakt (E-031: nur die Leitung rund)', () => {
    for (const id of ZEICHNUNG_LINIEN) expect(TOKENS.linien[id], id).toBe(LINIENARTEN[id].px);
    // Leitung rund (Enden und Ecken), Kontur stumpf mit runden Ecken, feine, Maß-, verdeckte und Mittellinie nach DIN
    // stumpf und spitz; das Bedienzeichen bleibt rund und gehört nicht in Zeichnungen
    expect(Object.fromEntries(Object.entries(LINIENARTEN).map(([id, l]) => [id, [l.enden, l.ecken]]))).toEqual({
      leitung: ['round', 'round'],
      kontur: ['butt', 'round'],
      fein: ['butt', 'miter'],
      mass: ['butt', 'miter'],
      verdeckt: ['butt', 'miter'],
      mittellinie: ['butt', 'miter'],
      icon: ['round', 'round'],
    });
    expect(ZEICHNUNG_LINIEN).not.toContain('icon');
    expect(ZEICHNUNG_LINIEN.filter((id) => LINIENARTEN[id].enden === 'round')).toEqual(['leitung']);
    expect(LINIENARTEN.verdeckt.muster).toEqual(TOKENS.linien.verdecktMuster);
    expect(LINIENARTEN.mittellinie.muster).toEqual(TOKENS.linien.mittellinieMuster);
    expect(MASSSTAB).toEqual({ geraet: 1, haus: 10 });
    expect(SCHRIFTFELD).toBe('Maße in mm · maßstäblich gezeichnet');
  });

  it('Maßlinie nach DIN 406: Begrenzungsstriche unter 45°, Maßzahl über der Linie, senkrechte Maße von rechts lesbar', () => {
    const waagerecht = masslinie({ von: { x: 0, y: 0 }, bis: { x: 1100, y: 0 }, abstand: 100, wert: 1100, strich: 10 });
    expect(waagerecht.a).toEqual({ x: 0, y: 100 });
    expect(waagerecht.b).toEqual({ x: 1100, y: 100 });
    expect(waagerecht.text).toMatchObject({ wert: '1100', winkel: 0 });
    expect(waagerecht.text.y).toBeLessThan(100);
    const striche = [...waagerecht.linie.matchAll(/M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/g)].slice(1);
    expect(striche).toHaveLength(2);
    for (const s of striche) {
      const [x0, y0, x1, y1] = s.slice(1).map(Number);
      // 45°: gleicher Weg in x und y, von links unten nach rechts oben
      expect(Math.abs(Math.abs(x1 - x0) - Math.abs(y1 - y0))).toBeLessThan(0.21);
      expect(x1).toBeGreaterThan(x0);
      expect(y1).toBeLessThan(y0);
    }
    const senkrecht = masslinie({ von: { x: 0, y: 800 }, bis: { x: 0, y: 0 }, abstand: 100, wert: 800 });
    expect(senkrecht.a.x).toBe(100);
    expect(senkrecht.text.winkel).toBe(-90);
    expect(senkrecht.text.x).toBeLessThan(100);
    // Maßhilfslinien gehen über die Maßlinie hinaus
    expect(waagerecht.hilfslinien).toMatch(/^M0 0L0 106M1100 0L1100 106$/);
  });

  it('Leitungsweg: Bögen mit Radius an jeder Ecke, Anfang und Ende wie angegeben (Fließrichtung)', () => {
    const d = leitungsweg([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }], 10);
    expect(d).toBe('M0 0L90 0A10 10 0 0 1 100 10L100 50');
    // Linkskurve: Bogen gegen den Uhrzeigersinn
    expect(leitungsweg([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: -50 }], 10)).toContain('A10 10 0 0 0 100 -10');
    expect(() => leitungsweg([{ x: 0, y: 0 }], 10)).toThrow();
    expect(fliesspfeil({ x: 10, y: 0 }, { x: 1, y: 0 }, 10, 6)).toBe('M10 0L0 3L0 -3Z');
  });

  it('Gerade Stücke des Leitungswegs (Strichmuster der Dauerbewegung): ohne Bögen, in Fließrichtung, Weglänge mit Bögen', () => {
    const punkte = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 100, y: 80 }, { x: 40, y: 80 }];
    // Gleiche Punkte wie leitungsweg: M0 0 L90 0 A… 100 10 L100 50 L100 70 A… 90 80 L40 80
    expect(leitungsweg(punkte, 10)).toBe('M0 0L90 0A10 10 0 0 1 100 10L100 50L100 70A10 10 0 0 1 90 80L40 80');
    const s = leitungsStrecken(punkte, 10);
    expect(s.map((x) => [x.von, x.bis, x.winkel])).toEqual([
      [{ x: 0, y: 0 }, { x: 90, y: 0 }, 0],
      [{ x: 100, y: 10 }, { x: 100, y: 50 }, 90],
      [{ x: 100, y: 50 }, { x: 100, y: 70 }, 90],
      [{ x: 90, y: 80 }, { x: 40, y: 80 }, 180],
    ]);
    expect(s.map((x) => x.laenge)).toEqual([90, 40, 20, 50]);
    // Weglänge bis zum Anfang: Viertelkreis mit r = 10 zählt mit (π · 10 / 2), die gerade Ecke bei (100 | 50) nicht
    const bogen = (Math.PI * 10) / 2;
    expect(s[0].anfang).toBe(0);
    expect(s[1].anfang).toBeCloseTo(90 + bogen, 6);
    expect(s[2].anfang).toBeCloseTo(130 + bogen, 6);
    expect(s[3].anfang).toBeCloseTo(150 + 2 * bogen, 6);
    expect(() => leitungsStrecken([{ x: 0, y: 0 }], 10)).toThrow();
  });
});

describe('Normsymbole (DIN EN ISO 10628-2)', () => {
  it('enthält den Pflichtumfang aus KERN K-010, jedes mit Namen, Lesart und Anschlüssen auf dem Rand', () => {
    expect(PFLICHT_SYMBOLE).toHaveLength(13);
    for (const id of PFLICHT_SYMBOLE) {
      const def = SYMBOLE[id];
      expect(def.name.length, id).toBeGreaterThan(3);
      expect(def.beschreibung.length, id).toBeGreaterThan(10);
      expect(def.formen.length, id).toBeGreaterThan(0);
      for (const [name, punkt] of Object.entries(def.anschluesse)) {
        // Anschluss liegt in der Hülle des Symbols
        expect(Math.abs(punkt.x), `${id}.${name}`).toBeLessThanOrEqual(def.halb.x);
        expect(Math.abs(punkt.y), `${id}.${name}`).toBeLessThanOrEqual(def.halb.y);
      }
    }
    // Förderrichtung: die Pumpe zeigt mit der Spitze zum Austritt
    expect(SYMBOLE.pumpe.formen[1]).toEqual({ d: 'M12 0L-6 -10.4L-6 10.4Z' });
    expect(SYMBOLE.pumpe.anschluesse.aus).toEqual({ x: 12, y: 0 });
    // Rückschlagventil: gefüllt auf der Austrittsseite
    expect(SYMBOLE.rueckschlagventil.formen[1]).toMatchObject({ voll: true });
  });

  it('rechnet Anschlüsse nach Verschiebung und Drehung um', () => {
    expect(anschlussPunkt('pumpe', 'aus', { x: 100, y: 50 })).toEqual({ x: 112, y: 50 });
    expect(anschlussPunkt('pumpe', 'aus', { x: 100, y: 50, drehung: 90 })).toEqual({ x: 100, y: 62 });
    expect(() => anschlussPunkt('pumpe', 'gibtsnicht', { x: 0, y: 0 })).toThrow(/keinen Anschluss/);
  });
});

describe('Gerätedaten (Bosch-Anleitungen, nur Zahlen)', () => {
  it('AW 4|5|7 OR-S: 1.100 × 800 × 540 mm, Halterungen, Anschlüsse und Kondensat wie in der Anleitung', () => {
    const g = COMPRESS_AW_S;
    expect([g.breite.mm, g.hoehe.mm, g.tiefe.mm]).toEqual([1100, 800, 540]);
    expect([g.konsolen.anzahl, g.konsolen.abstand.mm, g.konsolen.randabstand.mm]).toEqual([4, 881, 107]);
    // Bild 5: 580 ist der Abstand der Bohrungen (Maßhilfslinien an den Bohrungen, Bild 24 bohrt im Raster 881 × 580),
    // 20 die Gehäusekante bis zur Bohrung; beide belegt. Länge und Überstand der getrennten Halterungen sind geschätzt
    expect([g.konsolen.lochabstandTiefe.mm, g.konsolen.lochRand.mm]).toEqual([580, 20]);
    expect(g.konsolen.lochabstandTiefe.geschaetzt).toBeUndefined();
    expect(g.konsolen.lochRand.geschaetzt).toBeUndefined();
    expect(g.konsolen.lochabstandTiefe.hinweis).toMatch(/Bohrungen/);
    expect(g.konsolen.lochabstandTiefe.hinweis).toMatch(/Bild 24/);
    expect(g.konsolen.lochabstandTiefe.mm - g.tiefe.mm).toBe(2 * g.konsolen.lochRand.mm);
    for (const teil of [g.konsolen.laenge, g.konsolen.ueberstand]) {
      expect(teil.geschaetzt).toBe(GESCHAETZT);
      expect(teil.stelle).toMatch(/Bild 5/);
    }
    // Die Bohrung liegt in der Halterung, und vorn und hinten bleibt eine Lücke zwischen den beiden Halterungen
    expect(g.konsolen.ueberstand.mm).toBeGreaterThan(g.konsolen.lochRand.mm);
    expect(g.konsolen.laenge.mm - g.konsolen.ueberstand.mm).toBeGreaterThan(0);
    expect(2 * (g.konsolen.laenge.mm - g.konsolen.ueberstand.mm)).toBeLessThan(g.tiefe.mm);
    expect([g.hydraulik.hoehe.mm, g.hydraulik.abstandRand.mm, g.hydraulik.abstandZwischen.mm]).toEqual([202, 87, 90]);
    // 202 und 802 zählen ab der Aufstellfläche (Bild 4: Maßhilfslinien an der Unterkante der Bodenhalterungen)
    expect(g.hydraulik.hoehe.hinweis).toMatch(/Aufstellfläche/);
    expect(g.hoehe.hinweis).toMatch(/802/);
    expect(g.hoehe.hinweis).toMatch(/ab Aufstellfläche/);
    // Vorlauf ist der äußere Stutzen (Bild 28 [1] Austritt zur Inneneinheit), der Rücklauf der innere ([2])
    expect(g.hydraulik.vorlauf.lage).toBe('aussen');
    expect(g.hydraulik.vorlauf.stelle).toMatch(/Bild 28/);
    expect(g.hydraulik.vorlauf.stelle).toMatch(/DK: S\. 16 Fig\. 28/);
    // Kondensatablauf (Bild 6 von unten, Front oben): 330 mm vom linken Rand, 97 mm von der Rückseite; im
    // Fundamentplan (Bild 24) liegt er 223 mm rechts der linken Halterung: 107 + 223 = 330
    expect([g.kondensat.vonLinks.mm, g.kondensat.vonHinten.mm]).toEqual([330, 97]);
    expect(g.kondensat.vonLinks.mm - g.konsolen.randabstand.mm).toBe(223);
    expect(g.kondensat.vonLinks.hinweis).toMatch(/Bild 24/);
    // Der Stutzen hängt nicht unter die Halterungen (steht nicht auf)
    expect(g.kondensat.laenge.mm).toBeLessThanOrEqual(g.konsolen.hoehe.mm);
    expect(g.quelle).toMatchObject({ titel: 'Bosch Installationsanleitung AW 4|5|7 OR-S', dokument: '6721840669', ausgabe: '2025/06' });
    expect(g.verdampfer.lage).toMatch(/hinten/);
    expect(g.oberkante.radius.stelle).toMatch(/Längskanten links und rechts/);
  });

  it('AW 10|12 OR-T: 1.350 × 1.100 × 540 mm (Anleitung 6721842854)', () => {
    const g = COMPRESS_AW_L;
    expect([g.breite.mm, g.hoehe.mm, g.tiefe.mm]).toEqual([1350, 1100, 540]);
    expect(g.quelle.dokument).toBe('6721842854');
    // Bild 5 wie bei AW 4|5|7: 580 von Bohrung zu Bohrung, 20 von der Gehäusekante; die Halterung ist geschätzt
    expect([g.konsolen.lochabstandTiefe.mm, g.konsolen.lochRand.mm]).toEqual([580, 20]);
    expect(g.konsolen.lochabstandTiefe.mm - g.tiefe.mm).toBe(2 * g.konsolen.lochRand.mm);
    expect([g.konsolen.laenge.geschaetzt, g.konsolen.ueberstand.geschaetzt]).toEqual([GESCHAETZT, GESCHAETZT]);
    expect(g.konsolen.randabstand.mm * 2 + g.konsolen.abstand.mm).toBe(g.breite.mm);
    expect([g.kondensat.vonLinks.mm, g.kondensat.vonHinten.mm]).toEqual([270, 97]);
    expect(g.kondensat.laenge.mm).toBeLessThanOrEqual(g.konsolen.hoehe.mm);
    expect(g.hydraulik.vorlauf.lage).toBe('aussen');
    expect(g.hydraulik.vorlauf.stelle).toMatch(/Bild 26/);
  });

  it('jedes Maß nennt seine Fundstelle; nicht bemaßte Werte sind als geschätzt markiert, die Ausblasöffnung immer', () => {
    for (const g of [COMPRESS_AW_S, COMPRESS_AW_L]) {
      const masse = alleMasse(g);
      expect(masse.length, g.id).toBeGreaterThan(20);
      for (const [pfad, m] of masse) {
        expect(m.stelle.length, `${g.id} ${pfad}`).toBeGreaterThan(5);
        expect(m.mm, `${g.id} ${pfad}`).toBeGreaterThan(0);
        // Belegte Werte nennen Bild oder Tabelle, Schätzungen ihren Grund
        if (!m.geschaetzt) expect(m.stelle, `${g.id} ${pfad}`).toMatch(/(?:Bild|Tabelle) \d+/);
      }
      for (const teil of [g.ausblas.mitteX, g.ausblas.mitteY, g.ausblas.durchmesser, g.rotor.durchmesser]) {
        expect(teil.geschaetzt).toBe(GESCHAETZT);
      }
      // Die Gegenprobe nennt die zweite Ausgabe
      expect(g.quelle.gegenprobe?.dokument).toMatch(/^\d{10}$/);
      // Ausblasöffnung links der Mitte und ganz in der Front
      expect(g.ausblas.mitteX.mm).toBeLessThan(g.breite.mm / 2);
      expect(g.ausblas.mitteY.mm + g.ausblas.durchmesser.mm / 2).toBeLessThan(g.hoehe.mm - g.konsolen.hoehe.mm);
      expect(g.rotor.durchmesser.mm).toBeLessThan(g.ausblas.durchmesser.mm);
      expect(g.rotor.blaetter).toBe(4);
    }
  });

  it('Inneneinheit: Maße null, bis das Modell feststeht (M-022)', () => {
    expect(INNENEINHEIT.masse).toBeNull();
    expect(INNENEINHEIT.modell).toBeNull();
    expect(INNENEINHEIT.offen).toBe('M-022');
  });

  it('Ansichten folgen den Maßen: Vorderansicht 1100 × 800, Seitenansicht 540, Maßketten tragen die Werte der Anleitung', () => {
    const vorne = vorderansicht(COMPRESS_AW_S, { massketten: 'voll' });
    expect([vorne.breite, vorne.hoehe]).toEqual([1100, 800]);
    // Höhe ab Aufstellfläche: Boden bei 800, das Gehäuse endet über den Halterungen (800 − 25)
    expect([vorne.boden, vorne.unterkante]).toEqual([800, 775]);
    // Von vorn zwei runde obere Ecken (Bild 4, 18, 28), keine Übergangslinie
    expect(vorne.kontur[0]).toBe('M0 775V60A60 60 0 0 1 60 0H1040A60 60 0 0 1 1100 60V775Z');
    expect(vorne.fein.some((d) => /^M0 60H1100$/.test(d))).toBe(false);
    expect(vorne.masse.map((m) => m.text.wert)).toEqual(['330', '107', '881', '1100', '800']);
    // Kondensatablauf 330 mm vom linken Rand, Kette von links; die Höhe ab dem Boden
    const kondVorne = vorne.masse[0];
    expect([Math.min(kondVorne.a.x, kondVorne.b.x), Math.max(kondVorne.a.x, kondVorne.b.x)]).toEqual([0, 330]);
    expect(vorne.kontur).toContain('M315 775H345V795H315Z');
    const hoeheVorne = vorne.masse[4];
    expect([Math.min(hoeheVorne.a.y, hoeheVorne.b.y), Math.max(hoeheVorne.a.y, hoeheVorne.b.y)]).toEqual([0, vorne.boden]);
    // Anschlüsse (verdeckt) 202 mm über dem Boden
    for (const k of vorne.kreise.filter((x) => x.art === 'verdeckt')) expect(vorne.boden - k.cy).toBe(202);
    const seite = seitenansicht(COMPRESS_AW_S, { massketten: 'voll' });
    expect(seite.breite).toBe(540);
    expect(seite.masse.map((m) => m.text.wert)).toEqual(['540', '97', '20', '580', '202', '800']);
    // Von der Seite ein Rechteck mit Deckellinie (Bild 14, 17, 20), keine Rundung vorn
    expect(seite.kontur[0]).toBe('M0 0H540V775H0Z');
    expect(seite.fein).toContain('M0 60H540');
    // Bodenhalterungen (Bild 5, Draufsicht): zwei getrennte Konturen unter dem Gehäuse, vorn und hinten, mit Lücke
    // dazwischen; keine durchgehende Schiene über die 580 (Prüfung E-029, Runde 3)
    const halterungen = seite.kontur
      .map((d) => d.match(/^M(-?[\d.]+) ([\d.]+)H(-?[\d.]+)V([\d.]+)H(-?[\d.]+)Z$/))
      .filter((t): t is RegExpMatchArray => t !== null && Number(t[2]) === seite.unterkante && Number(t[4]) === seite.boden)
      .map((t) => [Number(t[1]), Number(t[3])]);
    expect(halterungen).toEqual([
      [-50, 107],
      [433, 590],
    ]);
    expect(seite.kontur).not.toContain('M-20 775H560V800H-20Z');
    expect(halterungen[1][0] - halterungen[0][1]).toBeGreaterThan(300);
    // 580 von Bohrung zu Bohrung: die Achsen der Bohrungen liegen je 20 vor der Gehäusekante in den Halterungen, die
    // Maßhilfslinien der 580 setzen sie fort; die 20 reicht von der Gehäusekante (an ihrer Ecke) bis zur Bohrung
    const achsen = seite.mittellinie.filter((d) => /^M-?[\d.]+ [\d.]+V[\d.]+$/.test(d)).map((d) => Number(d.match(/^M(-?[\d.]+)/)![1]));
    expect(achsen).toEqual([-20, 560]);
    for (const [x, [a, b]] of achsen.map((x, i) => [x, halterungen[i]] as const)) {
      expect(x).toBeGreaterThan(a);
      expect(x).toBeLessThan(b);
    }
    const k580 = seite.masse[3];
    expect([k580.a.x, k580.b.x, k580.b.x - k580.a.x]).toEqual([-20, 560, 580]);
    expect(k580.hilfslinien).toBe(`M-20 ${seite.boden}L-20 1036M560 ${seite.boden}L560 1036`);
    const k20 = seite.masse[2];
    expect([Math.min(k20.a.x, k20.b.x), Math.max(k20.a.x, k20.b.x)]).toEqual([-20, 0]);
    expect(k20.hilfslinien.startsWith(`M-20 ${seite.unterkante}L`)).toBe(true);
    expect(k20.hilfslinien).toContain(`M0 ${seite.unterkante}L`);
    // Halterungen und Anschlüsse liegen im Rahmen der Zeichnung
    expect(seite.rahmen.x0).toBeLessThan(halterungen[0][0]);
    expect(seite.rahmen.x1).toBeGreaterThan(halterungen[1][1]);
    // 202 von der Aufstellfläche bis zur Mitte der Anschlüsse; Kondensat 97 mm von der Rückseite, hinter der Halterung
    const k202 = seite.masse[4];
    expect([Math.max(k202.a.y, k202.b.y), Math.abs(k202.a.y - k202.b.y)]).toEqual([seite.boden, 202]);
    const k97 = seite.masse[1];
    expect([Math.min(k97.a.x, k97.b.x), Math.max(k97.a.x, k97.b.x)]).toEqual([443, 540]);
    expect(seite.verdeckt).toContain('M428 775H458V795H428Z');
    // Kein Maß ohne Beleg: jede Maßzahl ist ein belegter Wert der Anleitung, geschätzte (Ausblasöffnung, Rotor) nie
    const belegt = new Set(alleMasse(COMPRESS_AW_S).filter(([, m]) => !m.geschaetzt).map(([, m]) => String(m.mm)));
    for (const m of [...vorne.masse, ...seite.masse]) expect(belegt, m.text.wert).toContain(m.text.wert);
  });
});

describe('Bosch-Sperre (E-029, M-021)', () => {
  it('die Markenfassung ist gesperrt, solange kein Beleg vorliegt', () => {
    if (!BOSCH_FREIGABE.erteilt) {
      expect(markeErlaubt()).toBe(false);
      expect(wirksameVariante('marke')).toBe('neutral');
    } else {
      // Freigabe nur mit Datei im Repository und Datum
      expect(BOSCH_FREIGABE.beleg).toBeTruthy();
      expect(existsSync(path.join(ROOT, BOSCH_FREIGABE.beleg!))).toBe(true);
      expect(BOSCH_FREIGABE.datum).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(BOSCH_FREIGABE.umfang.length).toBeGreaterThan(0);
    }
    expect(markeErlaubt({ erteilt: true, beleg: null, datum: '2026-10-14', umfang: ['web'] })).toBe(false);
    expect(markeErlaubt({ erteilt: true, beleg: '_relaunch/belege/x.pdf', datum: '2026-10-14', umfang: ['web'] })).toBe(true);
    expect(wirksameVariante('neutral', { erteilt: true, beleg: 'x', datum: '2026-10-14', umfang: [] })).toBe('neutral');
  });

  it('keine Datei setzt die Markenfassung oder Bosch-Gestaltung ein, solange die Freigabe fehlt', () => {
    if (BOSCH_FREIGABE.erteilt) return;
    const dateien: string[] = [];
    const gehen = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const voll = path.join(dir, name);
        if (name === 'node_modules' || name === '__tests__' || name.startsWith('.')) continue;
        if (statSync(voll).isDirectory()) gehen(voll);
        else if (/\.tsx?$/.test(name)) dateien.push(voll);
      }
    };
    for (const dir of ['app', 'components', 'lib']) gehen(path.join(ROOT, dir));
    for (const datei of dateien) {
      const src = readFileSync(datei, 'utf8');
      expect(src, datei).not.toMatch(/variante=["{']*marke/);
      expect(src, datei).not.toMatch(/bosch[-_]?logo|anker[-_]?logo|ring[-_]?diffusor\.(?:svg|png)/i);
    }
  });
});

describe('Hausschnitt (1 Einheit = 10 mm)', () => {
  it('das eingesetzte Gerät misst 110 × 80 Einheiten, der Flachheizkörper 100 × 60 (600 × 1.000 mm)', () => {
    expect([GERAET_LAGE.breite, GERAET_LAGE.hoehe]).toEqual([110, 80]);
    expect([HEIZKOERPER_LAGE.breite, HEIZKOERPER_LAGE.hoehe]).toEqual([HEIZKOERPER_MM.baulaenge / 10, HEIZKOERPER_MM.bauhoehe / 10]);
    // Bis 1,22 m unter Gelände (Unterkante der Frostschürze): Platz für den Vorlauf zur Bewerbung unter dem Kiesbett
    expect(HAUSSCHNITT_RAHMEN).toEqual({ breite: 800, hoehe: 692 });
    expect(HAUSSCHNITT_RAHMEN.hoehe).toBe(HAUS_LAGE.fundamentUnten);
    expect(BAUTEILE.dach).toMatch(/^M/);
  });

  it('Anschlüsse am Gerät wie in der Anleitung: Vorlauf außen (87 mm vom rechten Rand), Rücklauf innen (177 mm), 202 mm über der Aufstellfläche', () => {
    const rechts = GERAET_LAGE.x + GERAET_LAGE.breite;
    // Vorlauf näher am rechten Rand (Bild 28 [1]), Rücklauf innen ([2])
    expect(HAUSSCHNITT_ANSCHLUSS.vorlauf).toBeGreaterThan(HAUSSCHNITT_ANSCHLUSS.ruecklauf);
    expect(rechts - HAUSSCHNITT_ANSCHLUSS.vorlauf).toBeCloseTo(8.7, 5);
    expect(rechts - HAUSSCHNITT_ANSCHLUSS.ruecklauf).toBeCloseTo(17.7, 5);
    expect(GERAET_LAGE.boden - HAUSSCHNITT_ANSCHLUSS.y).toBeCloseTo(20.2, 5);
    // Der Rücklauf (innerer Stutzen) liegt in der Erde tiefer als der Vorlauf: die Bögen liegen ineinander
    expect(HAUSSCHNITT_ERDLEITUNG.ruecklauf).toBeGreaterThan(HAUSSCHNITT_ERDLEITUNG.vorlauf);
  });

  it('Kreuzungen: in keiner Fassung kreuzen sich sichtbare Leitungen, auch nicht die Leitungen zur Bewerbung (Runde 3)', () => {
    type Stueck = { id: string; a: { x: number; y: number }; b: { x: number; y: number } };
    const stuecke = (ls: readonly (typeof LEITUNGEN)[number][]): Stueck[] =>
      ls.flatMap((l) => l.punkte.slice(1).map((b, i) => ({ id: l.id, a: l.punkte[i], b })));
    const zwischen = (v: number, p: number, q: number) => v > Math.min(p, q) + 0.01 && v < Math.max(p, q) - 0.01;
    // Echte Kreuzung: ein senkrechtes und ein waagerechtes Stück schneiden sich im Inneren beider (kein T-Stück)
    const kreuzungen = (ls: readonly (typeof LEITUNGEN)[number][]) => {
      const out: Array<{ ids: [string, string]; q: { x: number; y: number } }> = [];
      const alle = stuecke(ls);
      for (const s1 of alle) {
        for (const s2 of alle) {
          if (s1.id >= s2.id || s1.a.x !== s1.b.x || s2.a.y !== s2.b.y) continue;
          const q = { x: s1.a.x, y: s2.a.y };
          if (zwischen(q.x, s2.a.x, s2.b.x) && zwischen(q.y, s1.a.y, s1.b.y)) out.push({ ids: [s1.id, s2.id], q });
        }
        for (const s2 of alle) {
          if (s1.id >= s2.id || s1.a.y !== s1.b.y || s2.a.x !== s2.b.x) continue;
          const q = { x: s2.a.x, y: s1.a.y };
          if (zwischen(q.x, s1.a.x, s1.b.x) && zwischen(q.y, s2.a.y, s2.b.y)) out.push({ ids: [s1.id, s2.id], q });
        }
      }
      return out;
    };
    const sichtbar = LEITUNGEN.filter((l) => !l.verdeckt);
    // Gegenprobe der Prüfung: die Lage der Leitungen zur Bewerbung aus Runde 2 (0,60 m, T-Stück auf der
    // Vorlauf-Steigleitung, über die Rücklauf-Steigleitung nach links) fiele als Kreuzung auf
    const runde2 = { id: 'runde-2', medium: 'vorlauf' as const, d: '', punkte: [{ x: HAUSSCHNITT_ANSCHLUSS.vorlauf, y: HAUSSCHNITT_GOK + 60 }, { x: 0, y: HAUSSCHNITT_GOK + 60 }] };
    expect(kreuzungen([...sichtbar.filter((l) => !l.nur), runde2]).map((k) => k.ids)).toEqual([['ruecklauf-erde', 'runde-2']]);
    // Kleiner Hausschnitt und Teilen-Bild ohne Knopf, Startseite je Fassung (mobil, Desktop), Teilen-Bild mit Knopf:
    // nichts kreuzt sich, darum braucht keine Leitung einen Mantel, der eine hintere aussetzen ließe
    expect(kreuzungen(sichtbar.filter((l) => !l.nur))).toEqual([]);
    for (const fassung of ['knopf-mobil', 'knopf-desktop'] as const) {
      const ls = sichtbar.filter((l) => !l.nur || l.nur === fassung || l.nur === 'knopf');
      expect(ls.some((l) => l.nur === fassung), fassung).toBe(true);
      expect(kreuzungen(ls), fassung).toEqual([]);
    }
    // Auch die verdeckten Stücke einer Fassung kreuzen keine sichtbare Leitung
    for (const fassung of ['knopf-mobil', 'knopf-desktop'] as const) {
      const ls = LEITUNGEN.filter((l) => !l.nur || l.nur === fassung || l.nur === 'knopf');
      const k = kreuzungen(ls).filter(({ ids }) => ids.some((id) => !LEITUNGEN.find((l) => l.id === id)!.verdeckt));
      expect(k, fassung).toEqual([]);
    }
  });

  it('von vorn liegen die Leitungen hinter Gehäuse und Sockel verdeckt: keine sichtbare Leitung im Gerät oder in einem Sockel', () => {
    type Rechteck = { x: number; y: number; breite: number; hoehe: number };
    const geraet: Rechteck = { x: GERAET_LAGE.x, y: GERAET_LAGE.y, breite: GERAET_LAGE.breite, hoehe: GERAET_LAGE.hoehe };
    expect(SOCKEL_LAGE).toHaveLength(2);
    // Achsparalleles Stück schneidet das Innere des Rechtecks (der Rand zählt nicht)
    const offen = (v: number, lo: number, hi: number) => v > lo && v < hi;
    const ueberlappt = (v0: number, v1: number, lo: number, hi: number) => Math.max(v0, lo) < Math.min(v1, hi);
    const schneidet = (a: { x: number; y: number }, b: { x: number; y: number }, r: Rechteck) => {
      const [x0, x1] = [Math.min(a.x, b.x), Math.max(a.x, b.x)];
      const [y0, y1] = [Math.min(a.y, b.y), Math.max(a.y, b.y)];
      const inX = x0 === x1 ? offen(x0, r.x, r.x + r.breite) : ueberlappt(x0, x1, r.x, r.x + r.breite);
      const inY = y0 === y1 ? offen(y0, r.y, r.y + r.hoehe) : ueberlappt(y0, y1, r.y, r.y + r.hoehe);
      return inX && inY;
    };
    // Gegenprobe der Prüfung: eine Steigleitung von der Unterkante des Geräts durch den Sockel ins Erdreich fiele auf
    const sockel = SOCKEL_LAGE[1];
    const sockelUnten = sockel.y + sockel.hoehe;
    expect(schneidet({ x: sockel.x + 5, y: GERAET_LAGE.boden - 2 }, { x: sockel.x + 5, y: HAUSSCHNITT_GOK + 40 }, sockel)).toBe(true);
    expect(schneidet({ x: 0, y: sockel.y + 4 }, { x: sockel.x + 30, y: sockel.y + 4 }, sockel)).toBe(true);
    expect(schneidet({ x: sockel.x + 5, y: sockelUnten }, { x: sockel.x + 5, y: HAUSSCHNITT_GOK + 40 }, sockel)).toBe(false);
    // Die Sockel binden ins Erdreich ein (Gründung, Prüfung E-029, Runde 2)
    expect(sockelUnten).toBeGreaterThan(HAUSSCHNITT_GOK);
    for (const l of LEITUNGEN.filter((x) => !x.verdeckt)) {
      for (let i = 1; i < l.punkte.length; i += 1) {
        for (const r of [...SOCKEL_LAGE, geraet]) expect(schneidet(l.punkte[i - 1], l.punkte[i], r), `${l.id} Stück ${i}`).toBe(false);
      }
    }
    // Die verdeckten Stücke der Anlage führen vom Anschluss senkrecht bis unter den Sockel, je eins für Vor- und Rücklauf
    const verdeckt = LEITUNGEN.filter((x) => x.verdeckt && !x.nur);
    expect(verdeckt.map((l) => l.id).sort()).toEqual(['ruecklauf-anschluss', 'vorlauf-anschluss']);
    for (const l of verdeckt) {
      const ys = l.punkte.map((q) => q.y).sort((a, b) => a - b);
      expect(ys, l.id).toEqual([HAUSSCHNITT_ANSCHLUSS.y, sockelUnten]);
      expect(new Set(l.punkte.map((q) => q.x)).size, l.id).toBe(1);
    }
    // Die T-Stücke der Leitungen zur Bewerbung liegen ganz hinter dem Gehäuse (über der Aufstellfläche, zwischen seinen
    // Seiten) und sitzen auf dem geraden, verdeckten Stück der Steigleitung ihres Mediums, nie an seinem Ende
    const knopfVerdeckt = LEITUNGEN.filter((x) => x.verdeckt && x.nur);
    expect(knopfVerdeckt.map((l) => l.id).sort()).toEqual(['ruecklauf-knopf-anschluss', 'vorlauf-knopf-anschluss']);
    for (const l of knopfVerdeckt) {
      for (const q of l.punkte) {
        expect(q.x, l.id).toBeGreaterThan(geraet.x);
        expect(q.x, l.id).toBeLessThan(geraet.x + geraet.breite);
        expect(q.y, l.id).toBeGreaterThan(HAUSSCHNITT_ANSCHLUSS.y);
        expect(q.y, l.id).toBeLessThanOrEqual(GERAET_LAGE.boden);
      }
      const t = l.medium === 'vorlauf' ? l.punkte[0] : l.punkte.at(-1)!;
      expect(t.x, l.id).toBe(l.medium === 'vorlauf' ? HAUSSCHNITT_ANSCHLUSS.vorlauf : HAUSSCHNITT_ANSCHLUSS.ruecklauf);
      expect(t.y, l.id).toBeGreaterThan(HAUSSCHNITT_ANSCHLUSS.y);
      expect(t.y, l.id).toBeLessThan(sockelUnten);
    }
  });

  it('Vorlauf beginnt am Wärmeerzeuger (oder zweigt von einem Vorlauf ab), Rücklauf endet dort (oder mündet in einen Rücklauf)', () => {
    const anGeraet = (q: { x: number; y: number }) =>
      (Math.abs(q.x - HAUSSCHNITT_ANSCHLUSS.vorlauf) < 0.01 || Math.abs(q.x - HAUSSCHNITT_ANSCHLUSS.ruecklauf) < 0.01) &&
      Math.abs(q.y - HAUSSCHNITT_ANSCHLUSS.y) < 0.01;
    const aufWeg = (q: { x: number; y: number }, medium: string, ohne: string) =>
      LEITUNGEN.filter((l) => l.medium === medium && l.id !== ohne).some((l) =>
        l.punkte.slice(1).some((b, i) => {
          const a = l.punkte[i];
          const innen = (v: number, p0: number, p1: number) => v >= Math.min(p0, p1) - 0.5 && v <= Math.max(p0, p1) + 0.5;
          return innen(q.x, a.x, b.x) && innen(q.y, a.y, b.y);
        }),
      );
    const vorlauf = LEITUNGEN.filter((l) => l.medium === 'vorlauf');
    const ruecklauf = LEITUNGEN.filter((l) => l.medium === 'ruecklauf');
    expect(vorlauf.length).toBeGreaterThan(2);
    expect(ruecklauf.length).toBeGreaterThan(1);
    const ersterVorlauf = LEITUNGEN.find((l) => l.id === 'vorlauf-anschluss')!;
    expect(ersterVorlauf.punkte[0]).toEqual({ x: HAUSSCHNITT_ANSCHLUSS.vorlauf, y: HAUSSCHNITT_ANSCHLUSS.y });
    for (const l of vorlauf) {
      const start = l.punkte[0];
      expect(anGeraet(start) || aufWeg(start, 'vorlauf', l.id) || start.x === 345 + 56, l.id).toBe(true);
      // Der Pfad beginnt dort, wo die Punkte beginnen
      expect(endpunkte(l.d)[0], l.id).toEqual(start);
    }
    const ruecklaufAnschluss = LEITUNGEN.find((l) => l.id === 'ruecklauf-anschluss')!;
    expect(ruecklaufAnschluss.punkte.at(-1)!).toEqual({ x: HAUSSCHNITT_ANSCHLUSS.ruecklauf, y: HAUSSCHNITT_ANSCHLUSS.y });
    for (const l of ruecklauf) {
      const ende = l.punkte.at(-1)!;
      expect(anGeraet(ende) || aufWeg(ende, 'ruecklauf', l.id) || ende.x === 345 + 56, l.id).toBe(true);
      expect(endpunkte(l.d).at(-1), l.id).toEqual(ende);
    }
    // Der Vorlauf zur Bewerbung verlässt das Bild (links bzw. unten), er beginnt nie dort; das verdeckte T-Stück am
    // Anschluss ist sein Anfang
    const knopf = LEITUNGEN.filter((l) => l.nur?.startsWith('knopf') && l.medium === 'vorlauf' && !l.verdeckt);
    expect(knopf.map((l) => l.id).sort()).toEqual(['vorlauf-knopf', 'vorlauf-knopf-desktop']);
    for (const l of knopf) {
      const ende = l.punkte.at(-1)!;
      expect(ende.x === 0 || ende.y === HAUSSCHNITT_RAHMEN.hoehe, l.id).toBe(true);
    }
    // Feste Fließpfeile für beide Medien
    expect(PFEILE.some((p) => p.medium === 'vorlauf')).toBe(true);
    expect(PFEILE.some((p) => p.medium === 'ruecklauf')).toBe(true);
  });
});

describe('Hausschnitt: Kreuzung, Frosttiefe, Gründung und Kondensat (Prüfung E-029, Runde 2)', () => {
  /** Rohrstärken der Darstellungen in Einheiten: Startseite je Breite (einstieg.module.css), Teilen-Bild (og-render). */
  const einstiegCss = readFileSync(path.join(ROOT, 'components/home/einstieg/einstieg.module.css'), 'utf8');
  const rohre = [...einstiegCss.matchAll(/--rohr-e: ([\d.]+);/g)].map((m) => Number(m[1]));
  // Teilen-Bild: Navy-Fläche ab x 660 von 1.200 px, der Schnitt über ihre ganze Breite (lib/seo/og-render.tsx)
  const ogQuelle = readFileSync(path.join(ROOT, 'lib/seo/og-render.tsx'), 'utf8');
  const panelX = Number(ogQuelle.match(/const PANEL_X = (\d+);/)![1]);
  const ogRohr = TOKENS.linien.leitung / ((1200 - panelX) / HAUSSCHNITT_RAHMEN.breite);

  it('Leitungen zur Bewerbung (Runde 3): neben den Steigleitungen hinab, waagerecht nur über bzw. unter dem Kiesbett', () => {
    expect(rohre.length).toBeGreaterThanOrEqual(4);
    expect(ogQuelle).toContain('const S = PANEL_W / OG_HAUS_RAHMEN.breite;');
    const id = (x: string) => LEITUNGEN.find((l) => l.id === x)!;
    const kies = {
      x0: KONDENSAT_LAGE.x - KONDENSAT_LAGE.kiesbettBreite / 2,
      x1: KONDENSAT_LAGE.x + KONDENSAT_LAGE.kiesbettBreite / 2,
      y0: KONDENSAT_LAGE.kiesbett,
      y1: KONDENSAT_LAGE.kiesbett + KONDENSAT_LAGE.kiesbettHoehe,
    };
    const rechterSockel = SOCKEL_LAGE[1];
    const knopf = LEITUNGEN.filter((l) => l.nur && !l.verdeckt);
    expect(knopf.map((l) => l.id).sort()).toEqual(['ruecklauf-knopf', 'vorlauf-knopf', 'vorlauf-knopf-desktop']);
    for (const rohr of [...rohre, ogRohr]) {
      for (const l of knopf) {
        for (let i = 1; i < l.punkte.length; i += 1) {
          const [a, b] = [l.punkte[i - 1], l.punkte[i]];
          // Kein Stück (mit seiner Rohrstärke) im Kiesbett des Kondensats
          const box = { x0: Math.min(a.x, b.x) - rohr / 2, x1: Math.max(a.x, b.x) + rohr / 2, y0: Math.min(a.y, b.y) - rohr / 2, y1: Math.max(a.y, b.y) + rohr / 2 };
          const imKies = Math.min(box.x1, kies.x1) - Math.max(box.x0, kies.x0) > 0 && Math.min(box.y1, kies.y1) - Math.max(box.y0, kies.y0) > 0;
          expect(imKies, `Rohr ${rohr}: ${l.id} Stück ${i} im Kiesbett`).toBe(false);
          // Senkrecht unter dem Gerät nur zwischen Kiesbett und rechtem Sockel, links der Rücklauf-Steigleitung
          if (a.x === b.x && Math.min(a.y, b.y) < KONDENSAT_LAGE.kiesbett && a.x > kies.x1) {
            expect(a.x - rohr / 2, `${l.id} ${rohr}`).toBeGreaterThan(kies.x1);
            expect(a.x + rohr / 2, `${l.id} ${rohr}`).toBeLessThan(rechterSockel.x);
            expect(a.x + rohr / 2, `${l.id} ${rohr}`).toBeLessThan(HAUSSCHNITT_ANSCHLUSS.ruecklauf - rohr / 2);
            // … und neben dem Rohrgraben der Erdleitung, nicht auf seinem Rand
            expect(a.x + rohr / 2, `${l.id} ${rohr}`).toBeLessThan(Math.min(...endpunkte(BAUTEILE.graben).map((q) => q.x)));
          }
        }
        // Die beiden senkrechten Leitungen am Handy halten Abstand zueinander
        expect(Math.abs(KNOPF_LEITUNG.senkrecht.vorlauf - KNOPF_LEITUNG.senkrecht.ruecklauf) - rohr, `${rohr}`).toBeGreaterThan(2);
      }
    }
    // Zwischen Frosttiefe und Kiesbett eine Leitung (Desktop: Vorlauf; Handy: Rücklauf), unter dem Kiesbett der Vorlauf
    // am Handy, innerhalb des Rahmens
    expect(KNOPF_LEITUNG.desktopY).toBe(KNOPF_LEITUNG.mobilRuecklaufY);
    expect(KNOPF_LEITUNG.desktopY).toBeGreaterThan(HAUSSCHNITT_FROST);
    expect(KNOPF_LEITUNG.desktopY).toBeLessThan(kies.y0);
    expect(KNOPF_LEITUNG.mobilVorlaufY).toBeGreaterThan(kies.y1);
    expect(KNOPF_LEITUNG.mobilVorlaufY + Math.max(...rohre) / 2).toBeLessThan(HAUSSCHNITT_RAHMEN.hoehe);
    expect(id('vorlauf-knopf-desktop').punkte.map((q) => q.y)).toContain(KNOPF_LEITUNG.desktopY);
    expect(id('vorlauf-knopf').punkte.map((q) => q.y)).toContain(KNOPF_LEITUNG.mobilVorlaufY);
    expect(id('ruecklauf-knopf').punkte.map((q) => q.y)).toContain(KNOPF_LEITUNG.mobilRuecklaufY);
    // Die T-Stücke sitzen hinter dem Gehäuse, der Rücklauf über dem Vorlauf (so kreuzen sich auch die verdeckten nicht)
    expect(KNOPF_LEITUNG.t.ruecklauf).toBeLessThan(KNOPF_LEITUNG.t.vorlauf);
    expect(KNOPF_LEITUNG.senkrecht.ruecklauf).toBeLessThan(KNOPF_LEITUNG.senkrecht.vorlauf);
  });

  it('eine Frosttiefe für alles: Erdleitung, Kondensatweg und Frostschürze liegen darunter (DIN 1054, geschätzt)', () => {
    expect(FROSTTIEFE.mm).toBe(800);
    expect(FROSTTIEFE.geschaetzt).toBe(GESCHAETZT);
    expect(FROSTTIEFE.stelle).toMatch(/DIN 1054/);
    expect(HAUSSCHNITT_FROST).toBe(HAUSSCHNITT_GOK + FROSTTIEFE.mm / 10);
    // Erdleitung: auch die Oberkante des dicksten gezeichneten Rohrs liegt unter der Frosttiefe
    const dickstes = Math.max(...rohre);
    expect(HAUSSCHNITT_ERDLEITUNG.vorlauf - dickstes / 2).toBeGreaterThan(HAUSSCHNITT_FROST);
    expect(HAUSSCHNITT_ERDLEITUNG.ruecklauf).toBeGreaterThan(HAUSSCHNITT_ERDLEITUNG.vorlauf);
    // Jedes waagerechte Stück mit Vorlauf oder Rücklauf unter dem Gelände, auch die Leitungen zur Bewerbung (`nur`)
    // und verdeckte Stücke, liegt mit der Oberkante des dicksten Rohrs unter der Frosttiefe (Prüfung E-029, Runde 3)
    const unterGelaende = (q: { y: number }) => q.y > HAUSSCHNITT_GOK;
    const geprueft = new Set<string>();
    for (const l of LEITUNGEN.filter((x) => x.medium === 'vorlauf' || x.medium === 'ruecklauf')) {
      const waagerecht = l.punkte.slice(1).filter((q, i) => q.y === l.punkte[i].y && unterGelaende(q));
      for (const q of waagerecht) {
        expect(q.y - dickstes / 2, l.id).toBeGreaterThan(HAUSSCHNITT_FROST);
        geprueft.add(l.id);
      }
    }
    expect([...geprueft].sort()).toEqual(['ruecklauf-erde', 'ruecklauf-knopf', 'vorlauf-erde', 'vorlauf-knopf', 'vorlauf-knopf-desktop']);
    // Waagerecht über dem Gelände und vor dem Haus nur die verdeckten T-Stücke hinter dem Gehäuse
    const draussen = LEITUNGEN.filter((l) => l.punkte.slice(1).some((q, i) => q.y === l.punkte[i].y && !unterGelaende(q) && Math.max(q.x, l.punkte[i].x) < HAUS_LAGE.links));
    expect(draussen.map((l) => l.id).sort()).toEqual(['ruecklauf-knopf-anschluss', 'vorlauf-knopf-anschluss']);
    for (const l of draussen) expect(l.verdeckt, l.id).toBe(true);
    // Frostschürze bis unter die Frosttiefe
    expect(HAUS_LAGE.fundamentUnten).toBeGreaterThan(HAUSSCHNITT_FROST);
  });

  it('Futterrohr in der Frostschürze: Leitungen darin, mindestens 150 mm Beton darunter und darüber', () => {
    expect(DURCHFUEHRUNG.oben).toBeLessThan(HAUSSCHNITT_ERDLEITUNG.vorlauf);
    expect(DURCHFUEHRUNG.unten).toBeGreaterThan(HAUSSCHNITT_ERDLEITUNG.ruecklauf);
    expect(HAUS_LAGE.fundamentUnten - DURCHFUEHRUNG.unten).toBeGreaterThanOrEqual(15);
    expect(DURCHFUEHRUNG.oben - HAUS_LAGE.platteUnten).toBeGreaterThanOrEqual(15);
    expect(BAUTEILE.durchfuehrung).toContain(`${DURCHFUEHRUNG.oben}H`);
    expect(BAUTEILE.durchfuehrung).toContain(`V${DURCHFUEHRUNG.unten}`);
    // Die gezeichnete Wand endet am Rand der Zeichnung (Schürze angeschnitten), nie darüber
    for (const d of BAUTEILE.waende) expect(endpunkte(d).every((q) => q.y <= HAUSSCHNITT_RAHMEN.hoehe), d).toBe(true);
  });

  it('Gründung: Betonsockel binden ein und stehen auf 300 mm Schotter über die Breite des Geräts', () => {
    const ableitung = COMPRESS_AW_S.kondensat.ableitung;
    expect(ableitung.schotter.mm).toBe(300);
    expect(ableitung.schotter.stelle).toMatch(/Bild 27/);
    expect(SOCKEL_EINBINDUNG.geschaetzt).toBe(GESCHAETZT);
    for (const sockel of SOCKEL_LAGE) {
      expect(sockel.y + sockel.hoehe).toBe(HAUSSCHNITT_GOK + SOCKEL_EINBINDUNG.mm / 10);
      expect(sockel.y + sockel.hoehe).toBe(SCHOTTER_LAGE.y);
      expect(sockel.x).toBeGreaterThanOrEqual(SCHOTTER_LAGE.x);
      expect(sockel.x + sockel.breite).toBeLessThanOrEqual(SCHOTTER_LAGE.x + SCHOTTER_LAGE.breite + 0.01);
    }
    expect(SCHOTTER_LAGE.hoehe).toBe(ableitung.schotter.mm / 10);
    expect(BAUTEILE.schotter).toMatch(/^M/);
  });

  it('Kondensat: Stutzen unter dem Gerät, Rohr Ø 100 mm senkrecht ins Kiesbett 900 mm unter Gelände, unter der Frosttiefe', () => {
    const g = COMPRESS_AW_S;
    const { rohr, tiefe } = g.kondensat.ableitung;
    expect([rohr.mm, tiefe.mm]).toEqual([100, 900]);
    for (const m of [rohr, tiefe]) expect(m.stelle).toMatch(/Bild 27/);
    expect(COMPRESS_AW_L.kondensat.ableitung.tiefe.mm).toBe(900);
    // Lage: unter dem Ablaufstutzen (330 mm vom linken Rand), zwischen den Sockeln
    expect(KONDENSAT_LAGE.x).toBeCloseTo(GERAET_LAGE.x + g.kondensat.vonLinks.mm / 10, 5);
    expect(KONDENSAT_LAGE.rohr).toBe(rohr.mm / 10);
    expect(KONDENSAT_LAGE.x - KONDENSAT_LAGE.rohr / 2).toBeGreaterThan(SOCKEL_LAGE[0].x + SOCKEL_LAGE[0].breite);
    expect(KONDENSAT_LAGE.x + KONDENSAT_LAGE.rohr / 2).toBeLessThan(SOCKEL_LAGE[1].x);
    // Oberkante knapp unter dem Stutzen (nicht ineinander gesteckt), unter dem Gerät
    const stutzenUnten = GERAET_LAGE.boden - g.konsolen.hoehe.mm / 10 + g.kondensat.laenge.mm / 10;
    expect(KONDENSAT_LAGE.oben).toBeGreaterThan(stutzenUnten);
    expect(KONDENSAT_LAGE.oben).toBeLessThan(HAUSSCHNITT_GOK);
    // Kiesbett 900 mm unter Gelände, unter der Frosttiefe; das Rohr reicht hinein
    expect(KONDENSAT_LAGE.kiesbett).toBe(HAUSSCHNITT_GOK + tiefe.mm / 10);
    expect(KONDENSAT_LAGE.kiesbett).toBeGreaterThan(HAUSSCHNITT_FROST);
    expect(KIESBETT_HOEHE.geschaetzt).toBe(GESCHAETZT);
    const punkte = endpunkte(BAUTEILE.kondensat);
    expect(Math.min(...punkte.map((q) => q.y))).toBe(KONDENSAT_LAGE.oben);
    expect(Math.max(...punkte.map((q) => q.y))).toBeGreaterThan(KONDENSAT_LAGE.kiesbett);
    expect(endpunkte(BAUTEILE.kiesbett).map((q) => q.y)).toContain(KONDENSAT_LAGE.kiesbett);
    // Der Stutzen ist auch in der einfachen Detailstufe gezeichnet (Hausschnitt, Teilen-Bilder)
    const einfach = vorderansicht(g, { detail: 'einfach', massketten: false });
    const kx = g.kondensat.vonLinks.mm;
    expect(einfach.kontur.some((d) => d.startsWith(`M${kx - g.kondensat.durchmesser.mm / 2} `))).toBe(true);
  });
});
