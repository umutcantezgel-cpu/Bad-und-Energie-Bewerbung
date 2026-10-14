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
import { GESCHAETZT, LINIENARTEN, MASSSTAB, SCHRIFTFELD, ZEICHNUNG_LINIEN, fliesspfeil, leitungsweg, masslinie } from '../norm';
import {
  BAUTEILE,
  GERAET_LAGE,
  HAUSSCHNITT_ANSCHLUSS,
  HAUSSCHNITT_ERDLEITUNG,
  HAUSSCHNITT_GOK,
  HAUSSCHNITT_RAHMEN,
  HEIZKOERPER_LAGE,
  HEIZKOERPER_MM,
  LEITUNGEN,
  PFEILE,
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
  it('nimmt die Stärken aus den Tokens; in Zeichnungen sind alle Enden stumpf, rund nur das Bedienzeichen', () => {
    for (const id of ZEICHNUNG_LINIEN) {
      expect(LINIENARTEN[id].enden, id).toBe('butt');
      expect(TOKENS.linien[id], id).toBe(LINIENARTEN[id].px);
    }
    expect(LINIENARTEN.icon.enden).toBe('round');
    expect(ZEICHNUNG_LINIEN).not.toContain('icon');
    expect(LINIENARTEN.kontur.ecken).toBe('miter');
    expect(LINIENARTEN.leitung.ecken).toBe('round');
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
    expect([g.breite.mm, g.hoehe.mm, g.tiefe.mm, g.tiefeMitKonsolen.mm]).toEqual([1100, 800, 540, 580]);
    expect([g.konsolen.anzahl, g.konsolen.abstand.mm, g.konsolen.randabstand.mm]).toEqual([4, 881, 107]);
    expect(g.tiefeMitKonsolen.mm - g.tiefe.mm).toBe(2 * g.konsolen.ueberstand.mm);
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
    expect(seite.masse.map((m) => m.text.wert)).toEqual(['540', '97', '580', '202', '800']);
    // Von der Seite ein Rechteck mit Deckellinie (Bild 14, 17, 20), keine Rundung vorn
    expect(seite.kontur[0]).toBe('M0 0H540V775H0Z');
    expect(seite.fein).toContain('M0 60H540');
    // 202 von der Aufstellfläche bis zur Mitte der Anschlüsse; Kondensat 97 mm von der Rückseite, hinter der Halterung
    const k202 = seite.masse[3];
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
    expect(HAUSSCHNITT_RAHMEN).toEqual({ breite: 800, hoehe: 680 });
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

  it('Kreuzungen: ohne die Leitungen zur Bewerbung keine; mit ihnen liegt an jeder Kreuzung eine Leitung mit Mantel vorn', () => {
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
    // Kleiner Hausschnitt und Teilen-Bild ohne Knopf: nichts kreuzt sich
    expect(kreuzungen(sichtbar.filter((l) => !l.nur))).toEqual([]);
    // Startseite: je Fassung (mobil, Desktop) kreuzt der Vorlauf zur Bewerbung die Steigleitung des Rücklaufs
    for (const fassung of ['knopf-mobil', 'knopf-desktop'] as const) {
      const k = kreuzungen(sichtbar.filter((l) => !l.nur || l.nur === fassung || l.nur === 'knopf'));
      expect(k.length, fassung).toBeGreaterThan(0);
      for (const { ids, q } of k) {
        const mitMantel = ids.map((id) => LEITUNGEN.find((l) => l.id === id)!).filter((l) => l.mantel);
        expect(mitMantel.length, `${fassung} ${ids.join('/')}`).toBe(1);
        const m = mitMantel[0].mantel!.match(/^M(-?[\d.]+) (-?[\d.]+)V(-?[\d.]+)$/)!;
        expect(Number(m[1]), ids.join('/')).toBe(q.x);
        expect(q.y, ids.join('/')).toBeGreaterThan(Number(m[2]));
        expect(q.y, ids.join('/')).toBeLessThan(Number(m[3]));
      }
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
    expect(schneidet({ x: sockel.x + 5, y: GERAET_LAGE.boden - 2 }, { x: sockel.x + 5, y: HAUSSCHNITT_GOK + 40 }, sockel)).toBe(true);
    expect(schneidet({ x: 0, y: sockel.y + 4 }, { x: sockel.x + 30, y: sockel.y + 4 }, sockel)).toBe(true);
    expect(schneidet({ x: sockel.x + 5, y: HAUSSCHNITT_GOK }, { x: sockel.x + 5, y: HAUSSCHNITT_GOK + 40 }, sockel)).toBe(false);
    for (const l of LEITUNGEN.filter((x) => !x.verdeckt)) {
      for (let i = 1; i < l.punkte.length; i += 1) {
        for (const r of [...SOCKEL_LAGE, geraet]) expect(schneidet(l.punkte[i - 1], l.punkte[i], r), `${l.id} Stück ${i}`).toBe(false);
      }
    }
    // Die verdeckten Stücke führen vom Anschluss senkrecht bis zur Geländeoberkante, je eins für Vor- und Rücklauf
    const verdeckt = LEITUNGEN.filter((x) => x.verdeckt);
    expect(verdeckt.map((l) => l.id).sort()).toEqual(['ruecklauf-anschluss', 'vorlauf-anschluss']);
    for (const l of verdeckt) {
      const ys = l.punkte.map((q) => q.y).sort((a, b) => a - b);
      expect(ys, l.id).toEqual([HAUSSCHNITT_ANSCHLUSS.y, HAUSSCHNITT_GOK]);
      expect(new Set(l.punkte.map((q) => q.x)).size, l.id).toBe(1);
      expect(l.nur, l.id).toBeUndefined();
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
    // Der Vorlauf zur Bewerbung verlässt das Bild (links bzw. unten), er beginnt nie dort
    const knopf = LEITUNGEN.filter((l) => l.nur?.startsWith('knopf') && l.medium === 'vorlauf');
    for (const l of knopf) {
      const ende = l.punkte.at(-1)!;
      expect(ende.x === 0 || ende.y === HAUSSCHNITT_RAHMEN.hoehe, l.id).toBe(true);
    }
    // Feste Fließpfeile für beide Medien
    expect(PFEILE.some((p) => p.medium === 'vorlauf')).toBe(true);
    expect(PFEILE.some((p) => p.medium === 'ruecklauf')).toBe(true);
  });
});
