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
import { BAUTEILE, GERAET_LAGE, HAUSSCHNITT_RAHMEN, HEIZKOERPER_LAGE, HEIZKOERPER_MM, LEITUNGEN, PFEILE } from '../szenen/hausschnitt';
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
    expect([g.kondensat.vonRechts.mm, g.kondensat.vonVorn.mm]).toEqual([330, 97]);
    expect(g.quelle).toMatchObject({ titel: 'Bosch Installationsanleitung AW 4|5|7 OR-S', dokument: '6721840669', ausgabe: '2025/06' });
    expect(g.hoehe.hinweis).toMatch(/802/);
    expect(g.verdampfer.lage).toMatch(/hinten/);
  });

  it('AW 10|12 OR-T: 1.350 × 1.100 × 540 mm (Anleitung 6721842854)', () => {
    const g = COMPRESS_AW_L;
    expect([g.breite.mm, g.hoehe.mm, g.tiefe.mm]).toEqual([1350, 1100, 540]);
    expect(g.quelle.dokument).toBe('6721842854');
    expect(g.konsolen.randabstand.mm * 2 + g.konsolen.abstand.mm).toBe(g.breite.mm);
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
      expect(g.ausblas.mitteY.mm + g.ausblas.durchmesser.mm / 2).toBeLessThan(g.hoehe.mm);
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
    expect(vorne.kontur[0]).toBe('M0 0H1100V800H0Z');
    expect(vorne.masse.map((m) => m.text.wert)).toEqual(['1100', '800', '107', '881', '330']);
    const seite = seitenansicht(COMPRESS_AW_S, { massketten: 'voll' });
    expect(seite.breite).toBe(540);
    expect(seite.masse.map((m) => m.text.wert)).toEqual(['540', '580', '202', '97', '800']);
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

  it('Vorlauf beginnt am Wärmeerzeuger (oder zweigt von einem Vorlauf ab), Rücklauf endet dort (oder mündet in einen Rücklauf)', () => {
    const anGeraet = (q: { x: number; y: number }) =>
      q.x >= GERAET_LAGE.x && q.x <= GERAET_LAGE.x + GERAET_LAGE.breite && Math.abs(q.y - (GERAET_LAGE.y + GERAET_LAGE.hoehe)) < 0.5;
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
    const ersterVorlauf = LEITUNGEN.find((l) => l.id === 'vorlauf-erde')!;
    expect(anGeraet(ersterVorlauf.punkte[0])).toBe(true);
    for (const l of vorlauf) {
      const start = l.punkte[0];
      expect(anGeraet(start) || aufWeg(start, 'vorlauf', l.id) || start.x === 345 + 56, l.id).toBe(true);
      // Der Pfad beginnt dort, wo die Punkte beginnen
      expect(endpunkte(l.d)[0], l.id).toEqual(start);
    }
    const ruecklaufErde = LEITUNGEN.find((l) => l.id === 'ruecklauf-erde')!;
    expect(anGeraet(ruecklaufErde.punkte.at(-1)!)).toBe(true);
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
