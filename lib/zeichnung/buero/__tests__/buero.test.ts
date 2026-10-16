import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobSections } from '@/components/jobs/JobSections';
import { GLYPH_SHAPES } from '@/components/icons/glyphs';
import { BueroSeite } from '@/components/themen/BueroSeite';
import { BueroZeichnung, KLASSE } from '@/components/themen/buero/BueroZeichnung';
import { Leitstelle } from '@/components/themen/buero/Leitstelle';
import { ABLAUF_BEREICH, kennungenAusserhalb } from '@/components/zeichnung/__tests__/bereich';
import { getActiveJobs, getJobById, isJobLive } from '@/lib/jobs/registry';
import { DAUER_MS, MOTION_REGISTER, SICHT_ENDE_MS, TAKT_MS } from '@/lib/motion/register';
import { getThemaPageText } from '@/lib/themen/text';
import { ogThemaText } from '@/lib/themen/og';
import { ogJobText } from '@/lib/seo/og-image';
import { renderJobImage } from '@/lib/seo/og-render';
import { TOKENS } from '@/lib/tokens';
import { keyframesIn, skaliert } from '@/lib/motion/__tests__/keyframes';
import { BUERO_DATEI, BUERO_MARKE } from '../../../../scripts/qa/check-design-tokens.mjs';
import { MERKMAL_LAENGE, pruefeBueroBlock } from '../../../../scripts/qa/check-css-chunks.mjs';
import { ABLAGE, BESCHRIFTUNG_Y, BRIEF, ORDNER } from '../ablage';
import { ANSCHRIFT, BELEG, BLATT } from '../beleg';
import { BEZUG, LEITSTELLE, TISCH, ZIELE } from '../leitstelle';
import { BUERO_MASSE, BUERO_SCHRIFTFELD } from '../masse';
import { BODEN, EINZELHEIT, GELAENDE, KARTON_HAUS, MATERIAL, PALETTE as PALETTE_SEITE } from '../material';
import { ARTEN, EBENE_RAND, ebenenVon, pfadeVon, rahmenVon, takteVon, type BueroSzene, type Rahmen } from '../szene';
import { BUERO_SZENEN, BUERO_SZENEN_ARTEN } from '../szenen';
import { BUERO_SVG_FARBEN, DATEI_KLASSE, bueroSzenePfad, bueroSzenenDateien, leitstelleSvg, szeneSvg } from '../svg';
import { BAHNGRENZE, TAFEL, WOCHENPLAN } from '../wochenplan';

/**
 * Büro-Zeichnungsfamilie (E-031, Paket W3): echte und genormte Maße im richtigen Verhältnis, Inline und Datei mit
 * denselben Pfaden, kleine Dateien, keine alten Spielereien und keine Marken, Ziffern nur aus Maßen, der einmalige
 * Ablauf genau wie im Register und nur in SichtStart, die Stellenseite nur mit Dateien.
 */

const ROOT = path.resolve(__dirname, '../../../..');
const quelle = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const gzip = (s: string) => gzipSync(Buffer.from(s, 'utf8'), { level: 9 }).length;
const NOW = new Date('2026-10-15T10:00:00Z');
const JOBS = getActiveJobs().filter((job) => isJobLive(job, NOW));
const SEITE = getThemaPageText('buero-und-verwaltung', { jobs: JOBS, now: NOW });
if (SEITE.id !== 'buero-und-verwaltung') throw new Error('falsche Seite');
const ALLE: readonly BueroSzene[] = [LEITSTELLE, ...BUERO_SZENEN_ARTEN.map((art) => BUERO_SZENEN[art])];

/** Rechtecke eines Pfads aus `rechteck()` (M x y H x2 V y2 H x Z) als [breite, hoehe]. */
function rechtecke(d: string): [number, number][] {
  return [...d.matchAll(/M(-?[\d.]+) (-?[\d.]+)H(-?[\d.]+)V(-?[\d.]+)H-?[\d.]+Z/g)].map((m) => [
    Math.round((Number(m[3]) - Number(m[1])) * 10) / 10,
    Math.round((Number(m[4]) - Number(m[2])) * 10) / 10,
  ]);
}
const alleRechtecke = (szene: BueroSzene) => pfadeVon(szene).flatMap(rechtecke);
const nah = (a: number, b: number, toleranz = 0.06) => Math.abs(a - b) <= toleranz;

/** Pfade (d) und Rollen eines Markups in Reihenfolge: Datei-Klassen bzw. Klassen der Komponente auf Arten abgebildet. */
function pfadeUndArten(markup: string, modul: boolean): string[] {
  const zuArt = new Map<string, string>();
  for (const art of ARTEN) zuArt.set(modul ? KLASSE[art] : DATEI_KLASSE[art], art);
  return [...markup.matchAll(/<path d="([^"]+)" class="([^"]+)"(?:\/>|><\/path>)/g)].map((m) => `${m[1]} ${zuArt.get(m[2]) ?? `?${m[2]}`}`);
}

describe('Maße: genormt und im richtigen Verhältnis', () => {
  it('die Normwerte stimmen und sind belegt, Schätzwerte tragen ihren Grund', () => {
    expect([BUERO_MASSE.a4.breite.mm, BUERO_MASSE.a4.hoehe.mm]).toEqual([210, 297]);
    expect([BUERO_MASSE.dinLang.breite.mm, BUERO_MASSE.dinLang.hoehe.mm]).toEqual([220, 110]);
    expect([BUERO_MASSE.europalette.laenge.mm, BUERO_MASSE.europalette.breite.mm, BUERO_MASSE.europalette.hoehe.mm]).toEqual([1200, 800, 144]);
    expect(BUERO_MASSE.schreibtisch.hoehe).toMatchObject({ mm: 740, stelle: expect.stringContaining('DIN EN 527-1') });
    expect(BUERO_MASSE.ordner.ruecken).toMatchObject({ mm: 80, geschaetzt: 'geschaetzt' });
    expect(BUERO_MASSE.a4.breite.stelle).toContain('ISO 216');
    expect(BUERO_MASSE.dinLang.breite.stelle).toContain('DIN 678');
    // Lage des Fensters nach DIN 680 (Fensterbriefhüllen), nicht DIN 678 (Prüfrunde 1 B1-7)
    for (const k of ['fensterBreite', 'fensterHoehe', 'fensterLinks', 'fensterUnten'] as const) expect(BUERO_MASSE.dinLang[k].stelle, k).toContain('DIN 680');
    expect(BUERO_MASSE.europalette.laenge.stelle).toContain('EN 13698-1');
    // Aufbau der Palette in der Seitenansicht ergibt ihre Höhe
    const p = BUERO_MASSE.europalette;
    expect(3 * p.brett.mm + p.klotz.mm).toBe(p.hoehe.mm);
    for (const gruppe of Object.values(BUERO_MASSE)) {
      for (const m of Object.values(gruppe)) expect(m.stelle.length, JSON.stringify(m)).toBeGreaterThan(8);
    }
  });

  it('Leitstelle 1 : 10 mm: Tisch 1600 × 800, Blätter A4, Ordner 285 × 318; die vier Ziele gleich große Sinnbilder', () => {
    expect(LEITSTELLE.mmJeEinheit).toBe(10);
    expect([TISCH.breite, TISCH.tiefe]).toEqual([160, 80]);
    const r = alleRechtecke(LEITSTELLE);
    expect(r).toContainEqual([160, 80]);
    expect(r.filter(([b, h]) => nah(b, 21) && nah(h, 29.7))).toHaveLength(2);
    expect(r.some(([b, h]) => nah(b, 28.5) && nah(h, 31.8))).toBe(true);
    // Prüfrunde 1 A1-4, B1-3: Monteure, Kundendienst, Kunden, Lager sind Glyphen im selben Maßstab (kein Spielzeughaus
    // neben einer maßstäblichen Palette); maßstäblich ist nur der Tisch, das Schriftfeld sagt es
    const ziele = LEITSTELLE.gruppen.filter((g) => g.id in ZIELE);
    expect(ziele.map((g) => g.id)).toEqual(['monteure', 'kundendienst', 'kunden', 'lager']);
    expect(new Set(ziele.map((g) => g.lage?.s))).toEqual(new Set([ZIELE.monteure.s]));
    for (const g of LEITSTELLE.gruppen) if (g.id !== 'tisch' && g.id !== 'bezug') expect(g.lage, g.id).toBeDefined();
    expect(BUERO_SCHRIFTFELD.leitstelle).toContain('Sinnbild ohne Maßstab');
    expect(BUERO_SCHRIFTFELD.leitstelle).not.toMatch(/Europalette|EN.13698/);
    // Jede Bezugslinie endet kurz vor ihrem Ziel (höchstens 12 Einheiten neben dem Glyphenfeld 24 × 24)
    for (const [id, b] of Object.entries(BEZUG)) {
      const z = ZIELE[id as keyof typeof ZIELE];
      const dx = Math.max(z.x - b.bis.x, 0, b.bis.x - (z.x + 24 * z.s));
      const dy = Math.max(z.y - b.bis.y, 0, b.bis.y - (z.y + 24 * z.s));
      expect(Math.hypot(dx, dy), id).toBeLessThanOrEqual(12);
    }
  });

  it('Material (Prüfrunde 1 A1-4, B1-3): nur das Lager maßstäblich, im eigenen Rahmen; Halle und Haus Sinnbilder auf eigenen Geländestücken', () => {
    const gruppe = (id: string) => MATERIAL.gruppen.find((g) => g.id === id)!;
    // Prüfrunde 2 B2-4: auch der Lieferschein (samt Häkchen) und der Karton am Haus sind gekennzeichnet
    expect(MATERIAL.gruppen.filter((g) => g.sinnbild).map((g) => g.id)).toEqual(['grosshandel', 'baustelle', 'lieferschein', 'paket-3', 'haken']);
    expect(BUERO_SCHRIFTFELD.material).toContain('Halle, Haus und Lieferschein als Sinnbild ohne Maßstab');
    // Das Lager steht in seinem Rahmen: Palette und Kartons ganz darin
    const imRahmen = (x: number, y: number) => x >= EINZELHEIT.x && x <= EINZELHEIT.x + EINZELHEIT.breite && y >= EINZELHEIT.y && y <= EINZELHEIT.y + EINZELHEIT.hoehe;
    for (const id of ['lager', 'paket-1', 'paket-2']) {
      for (const d of gruppe(id).teile.map((t) => t.d)) {
        for (const m of d.matchAll(/M(-?[\d.]+) (-?[\d.]+)H(-?[\d.]+)V(-?[\d.]+)/g)) {
          expect(imRahmen(Number(m[1]), Number(m[2])) && imRahmen(Number(m[3]), Number(m[4])), `${id} ${m[0]}`).toBe(true);
        }
      }
    }
    // Kein Geländestück trägt maßstäbliche und Sinnbild-Teile zugleich: die Palette hat ihre Linie im Rahmen
    expect(GELAENDE).toHaveLength(3);
    const [halle, lager, haus] = GELAENDE;
    expect(lager.von).toBeGreaterThan(EINZELHEIT.x);
    expect(lager.bis).toBeLessThan(EINZELHEIT.x + EINZELHEIT.breite);
    expect(halle.bis).toBeLessThan(EINZELHEIT.x);
    expect(haus.von).toBeGreaterThan(EINZELHEIT.x + EINZELHEIT.breite);
    expect(gruppe('wege').teile[0].d).toBe(GELAENDE.map((g) => `M${g.von} ${BODEN}H${g.bis}`).join(''));
    // Der Karton am Haus im Maß des Sinnbilds: kleiner als die Tür (0,22 × 92 breit, 0,5 × 76 hoch)
    const [kb, kh] = rechtecke(gruppe('paket-3').teile[0].d)[0];
    expect(kb).toBeCloseTo(60 * KARTON_HAUS.teil, 6);
    expect(kb).toBeLessThan(0.22 * 92);
    expect(kh).toBeLessThan(0.5 * 76);
  });

  it('jedes Teil einer maßstäblichen Szene ist maßstäblich (geprüft) oder gekennzeichnet (Prüfrunde 2 B2-4)', () => {
    // Die ungekennzeichneten Gruppen je Szene; ihre Maße prüfen die Tests oben und „Blatt A4 …“. Eine neue Gruppe ohne
    // Kennzeichnung (sinnbild oder Glyphe mit Lage) fällt hier auf und braucht eine Maßprüfung.
    const MASSSTAEBLICH: Record<string, string[]> = {
      leitstelle: ['tisch', 'bezug'],
      beleg: BELEG.gruppen.map((g) => g.id),
      material: ['lager', 'wege', 'paket-1', 'paket-2'],
      ablage: ['regal', 'ordner', 'ordner-oben', 'ordner-unten', 'brief', 'blatt'],
    };
    for (const szene of ALLE.filter((s) => s.mmJeEinheit !== null)) {
      const frei = szene.gruppen.filter((g) => !g.sinnbild && !g.lage).map((g) => g.id);
      expect(frei, szene.id).toEqual(MASSSTAEBLICH[szene.id]);
    }
    // Der Lieferschein bliebe maßstäblich zu klein für Zeilen und Kästchen (A4 = 21 × 29,7 Einheiten): Sinnbild
    const schein = rechtecke(MATERIAL.gruppen.find((g) => g.id === 'lieferschein')!.teile[1].d)[0];
    expect(schein[0] / schein[1]).toBeCloseTo(210 / 297, 2);
    expect(schein[0] * MATERIAL.mmJeEinheit!).toBeGreaterThan(210);
  });

  it('Europalette von der Seite (Prüfrunde 2 B2-5): Deckbrett durchgehend, darunter drei Querbrett-Abschnitte über den Klötzen', () => {
    const p = BUERO_MASSE.europalette;
    const mm = (x: number) => Math.round(x * MATERIAL.mmJeEinheit! * 10) / 10;
    const palette = rechtecke(MATERIAL.gruppen.find((g) => g.id === 'lager')!.teile[1].d).map(([b, h]) => [mm(b), mm(h)]);
    expect(palette).toEqual([
      [p.laenge.mm, p.brett.mm],
      ...Array.from({ length: 3 }, () => [p.klotzBreite.mm, p.brett.mm]),
      ...Array.from({ length: 3 }, () => [p.klotzBreite.mm, p.klotz.mm]),
      [p.laenge.mm, p.brett.mm],
    ]);
    // Kein durchgehender Streifen aus Deck- und Querbrett mehr (2 × 22 mm)
    expect(palette.some(([, h]) => h === 2 * p.brett.mm)).toBe(false);
    // Die Querbrett-Abschnitte stehen genau über den Klötzen
    const d = MATERIAL.gruppen.find((g) => g.id === 'lager')!.teile[1].d;
    const links = [...d.matchAll(/M(-?[\d.]+) (-?[\d.]+)H/g)].map((m) => Number(m[1]));
    expect(links.slice(1, 4)).toEqual(links.slice(4, 7));
  });

  it('Ablage (Prüfrunde 3 B3-5): Die Ablagen sind Sinnbilder, das Schriftfeld sagt es; Brief und Blatt bleiben maßstäblich', () => {
    // Ein Blatt A4 (99 Einheiten) stünde in einem 60 mm hohen Korb 80 Einheiten frei: kein echter Briefkorb
    expect(ABLAGE.gruppen.filter((g) => g.sinnbild).map((g) => g.id)).toEqual(['ablage-post', 'ablage-gf']);
    expect(BUERO_SCHRIFTFELD.ablage).toContain('Ablagen als Sinnbild ohne Maßstab');
    expect(BUERO_SCHRIFTFELD.ablage).toContain('DIN lang');
  });

  it('Ablage (Prüfrunde 3 A3-7): Jede Beschriftung steht nah an ihrem Fach – Abstand zum eigenen höchstens halb so groß wie zum fremden', () => {
    // Zeilenhöhe der Beschriftung in Einheiten: bei 280 px Bildbreite 12 px Schrift (17,1 Einheiten), Zeile 1,1
    const halbeZeile = ((12 * 400) / 280) * 1.1 * 0.5;
    const rahmen = (ids: string[]) => {
      const r = ids.map((id) => rahmenVon(ABLAGE.gruppen.find((g) => g.id === id)!.teile));
      return { oben: Math.min(...r.map((x) => x.y)), unten: Math.max(...r.map((x) => x.y + x.h)) };
    };
    const abstand = (y: number, o: { oben: number; unten: number }) => Math.max(0, o.oben - (y + halbeZeile), y - halbeZeile - o.unten);
    const post = { eigen: rahmen(['brief', 'ablage-post']), fremd: rahmen(['blatt', 'ablage-gf']) };
    const gf = { eigen: rahmen(['blatt', 'ablage-gf']), fremd: rahmen(['brief', 'ablage-post']) };
    expect(ABLAGE.beschriftungen.map((b) => [b.id, b.y])).toEqual([
      ['post', BESCHRIFTUNG_Y.post],
      ['gf', BESCHRIFTUNG_Y.gf],
    ]);
    for (const [y, f] of [
      [BESCHRIFTUNG_Y.post, post],
      [BESCHRIFTUNG_Y.gf, gf],
    ] as const) {
      expect(abstand(y, f.eigen) * 2, `${y}`).toBeLessThanOrEqual(abstand(y, f.fremd));
      // ganz im Bild
      expect(y - halbeZeile).toBeGreaterThanOrEqual(0);
      expect(y + halbeZeile).toBeLessThanOrEqual(ABLAGE.rahmen.hoehe);
    }
    // So stand es (y 140 zwischen den Fächern): näher an der Post als am eigenen Blatt
    expect(abstand(140, gf.eigen) * 2).toBeGreaterThan(abstand(140, gf.fremd));
  });

  it('Wochenplan (Prüfrunde 3 D3-3): zwei Bahnen, ihre Grenze als Kontur kräftiger als das Raster; die Glyphen mittig in ihrer Bahn, auf keiner Linie', () => {
    const tafel = WOCHENPLAN.gruppen.find((g) => g.id === 'tafel')!;
    const grenze = tafel.teile.filter((t) => t.d === BAHNGRENZE);
    expect(grenze.map((t) => t.art)).toEqual(['konturOffen']);
    // Waagerechte feine Linien: nur die Kopfzeile, keine Mitte der Bahnen mehr (sonst las man vier gleiche Zeilen)
    const fein = tafel.teile.filter((t) => t.art === 'fein').map((t) => t.d).join('');
    const waagerechte = [...fein.matchAll(/M(-?[\d.]+) (-?[\d.]+)H/g)].map((m) => Number(m[2]));
    expect(waagerechte).toEqual([TAFEL.y + TAFEL.kopf]);
    const bahn = (TAFEL.hoehe - TAFEL.kopf) / 2;
    const linien = [TAFEL.y + TAFEL.kopf, TAFEL.y + TAFEL.kopf + bahn, TAFEL.y + TAFEL.hoehe];
    for (const [id, i] of [
      ['monteure', 0],
      ['kundendienst', 1],
    ] as const) {
      const g = WOCHENPLAN.gruppen.find((x) => x.id === id)!;
      const mitte = g.lage!.y + 12 * g.lage!.s;
      const bahnMitte = TAFEL.y + TAFEL.kopf + (i + 0.5) * bahn;
      expect(Math.abs(mitte - bahnMitte), id).toBeLessThanOrEqual(3);
      for (const y of linien) expect(Math.abs(mitte - y), `${id} ${y}`).toBeGreaterThan(12 * g.lage!.s);
    }
    // Die Beschreibung nennt, was das Bild zeigt
    expect(SEITE.aufgaben.szenen.find((x) => x.id === 'wochenplan')!.bild).toMatch(/zwei Bahnen, oben die Monteure, unten der Kundendienst/);
  });

  it('jede maßstäbliche Szene mit Sinnbildern sagt „ohne Maßstab“; Szenen ohne Sinnbild behaupten keins', () => {
    for (const szene of ALLE) {
      const sinnbilder = szene.gruppen.filter((g) => g.sinnbild || g.lage);
      const feld = BUERO_SCHRIFTFELD[szene.id];
      if (szene.mmJeEinheit === null) expect(feld, szene.id).toContain('ohne Maßstab');
      else expect(feld.includes('ohne Maßstab'), szene.id).toBe(sinnbilder.length > 0);
    }
  });

  it('Schriftfelder brechen sauber um (Prüfrunde 1 A1-9): Zahl und Einheit, Norm und Nummer, Maß und Malzeichen ungetrennt; nie „·“ am Zeilenanfang', () => {
    for (const [id, feld] of Object.entries(BUERO_SCHRIFTFELD)) {
      expect(feld, id).not.toMatch(/ ·/);
      expect(feld, id).not.toMatch(/\b(?:DIN|EN|ISO) \d/);
      expect(feld, id).not.toMatch(/\d ×|× \d/);
      expect(feld, id).not.toMatch(/ mm\b|Maße in/);
    }
    const css = quelle(BUERO_DATEI);
    expect(css).toMatch(/\.bueroSchriftfeld \{\s*line-height: 1\.4;/);
    expect(quelle('components/themen/buero/BueroSzene.tsx')).toContain("cn('text-etikett', styles.bueroSchriftfeld)");
  });

  it('Blatt A4 (1,5 mm je Einheit) mit Anschriftfeld nach DIN 5008; Palette von der Seite 1200 × 144; Ordner 80, Brief DIN lang', () => {
    expect(BLATT.breite / BLATT.hoehe).toBeCloseTo(210 / 297, 6);
    expect(BLATT.breite * BELEG.mmJeEinheit!).toBeCloseTo(210, 6);
    const mmBeleg = BELEG.mmJeEinheit!;
    expect(ANSCHRIFT.breite * mmBeleg).toBeCloseTo(85, 6);
    expect(ANSCHRIFT.hoehe * mmBeleg).toBeCloseTo(45, 6);
    expect((ANSCHRIFT.x - BLATT.x) * mmBeleg).toBeCloseTo(20, 6);
    expect((ANSCHRIFT.y - BLATT.y) * mmBeleg).toBeCloseTo(45, 6);
    expect(PALETTE_SEITE.laenge * MATERIAL.mmJeEinheit!).toBeCloseTo(1200, 6);
    expect(PALETTE_SEITE.hoehe * MATERIAL.mmJeEinheit!).toBeCloseTo(144, 6);
    expect(ORDNER.breite * ABLAGE.mmJeEinheit!).toBeCloseTo(80, 6);
    expect(BRIEF.breite / BRIEF.hoehe).toBeCloseTo(2, 6);
    expect(BRIEF.breite * ABLAGE.mmJeEinheit!).toBeCloseTo(220, 6);
    // Der Wochenplan hat keinen Maßstab und sagt es
    expect(WOCHENPLAN.mmJeEinheit).toBeNull();
    expect(BUERO_SCHRIFTFELD.wochenplan).toContain('ohne Maßstab');
  });

  it('alles bleibt im Rahmen; jede Datei hat einen Pfad, an dem die CSS-Prüfung sie erkennt', () => {
    for (const szene of ALLE) {
      for (const d of pfadeVon(szene)) {
        // Glyphen liegen im eigenen 24er-Raster (Gruppe mit Lage), alle anderen Zahlen im Rahmen
        if (szene.gruppen.some((g) => g.lage && g.teile.some((t) => t.d === d))) continue;
        const zahlen = [...d.matchAll(/[MLHVZ]\s*(-?[\d.]+)(?:\s(-?[\d.]+))?/g)];
        for (const m of zahlen) {
          const x = Number(m[1]);
          expect(x, `${szene.id} ${d.slice(0, 40)}`).toBeGreaterThanOrEqual(0);
          expect(x, `${szene.id} ${d.slice(0, 40)}`).toBeLessThanOrEqual(Math.max(szene.rahmen.breite, szene.rahmen.hoehe));
        }
      }
      for (const b of szene.beschriftungen) {
        expect(b.x, `${szene.id} ${b.id}`).toBeGreaterThanOrEqual(0);
        expect(b.x, `${szene.id} ${b.id}`).toBeLessThanOrEqual(szene.rahmen.breite);
        expect(b.y, `${szene.id} ${b.id}`).toBeLessThanOrEqual(szene.rahmen.hoehe);
      }
    }
    for (const svg of [leitstelleSvg(), ...bueroSzenenDateien().map((x) => x.svg)]) {
      expect([...svg.matchAll(/\sd="([^"]+)"/g)].some((m) => m[1].length >= MERKMAL_LAENGE)).toBe(true);
    }
  });
});

describe('Bewegte Gruppen auf eigenen Ebenen (Prüfrunde 3 C3-2)', () => {
  const szenen = BUERO_SZENEN_ARTEN.map((art) => BUERO_SZENEN[art]);

  it('rahmenVon: Rechtecke, Linien und Bögen (mit Radius), nur absolute Befehle', () => {
    expect(rahmenVon([{ d: 'M10 20H30V50H10Z', art: 'kontur' }])).toEqual({ x: 10, y: 20, b: 20, h: 30 });
    expect(rahmenVon([{ d: 'M0 5L4 9', art: 'fein' }, { d: 'M2 1A3 3 0 0 1 8 1', art: 'fein' }])).toEqual({ x: 0, y: -2, b: 11, h: 11 });
    expect(() => rahmenVon([{ d: 'm0 0l4 4', art: 'fein' }])).toThrow(/nicht unterstützt/);
    expect(() => rahmenVon([{ d: 'M0 0C1 1 2 2 3 3', art: 'fein' }])).toThrow(/nicht unterstützt/);
  });

  it.each(szenen.map((s) => [s.id, s] as const))('%s: jede bewegte Gruppe eine Ebene in ihrem Rahmen, die stillen dazwischen zusammen, Reihenfolge wie die Daten', (_id, szene) => {
    const ebenen = ebenenVon(szene);
    expect('still' in ebenen[0]).toBe(true);
    const reihe = ebenen.flatMap((e) => ('still' in e ? e.still.map((g) => g.id) : [e.gruppe.id]));
    expect(reihe).toEqual(szene.gruppen.map((g) => g.id));
    const bewegt = ebenen.filter((e): e is Extract<typeof e, { rahmen: Rahmen }> => !('still' in e));
    expect(bewegt.map((e) => e.gruppe.id)).toEqual(szene.gruppen.filter((g) => g.ablauf).map((g) => g.id));
    for (const e of bewegt) {
      const r = rahmenVon(e.gruppe.teile);
      expect(e.rahmen).toEqual({ x: r.x - EBENE_RAND, y: r.y - EBENE_RAND, b: r.b + 2 * EBENE_RAND, h: r.h + 2 * EBENE_RAND });
      // jede Ecke jedes Pfads liegt in der Ebene
      for (const t of e.gruppe.teile) {
        for (const m of t.d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)) {
          expect(Number(m[1])).toBeGreaterThanOrEqual(e.rahmen.x);
          expect(Number(m[1])).toBeLessThanOrEqual(e.rahmen.x + e.rahmen.b);
          expect(Number(m[2])).toBeGreaterThanOrEqual(e.rahmen.y);
          expect(Number(m[2])).toBeLessThanOrEqual(e.rahmen.y + e.rahmen.h);
        }
      }
    }
    // zwischen zwei stillen Ebenen liegt immer eine bewegte
    for (let i = 1; i < ebenen.length; i += 1) expect('still' in ebenen[i] && 'still' in ebenen[i - 1]).toBe(false);
  });

  it.each(szenen.map((s) => [s.id, s] as const))('%s inline mit Ablauf: jede bewegte Gruppe ein <svg data-a data-motion>, dieselben Pfade in derselben Reihenfolge wie still', (_id, szene) => {
    const bewegt = renderToStaticMarkup(createElement(BueroZeichnung, { szene, motion: 'buero-ablauf' }));
    const still = renderToStaticMarkup(createElement(BueroZeichnung, { szene }));
    expect(pfadeUndArten(bewegt, true)).toEqual(pfadeUndArten(still, true));
    const ebenen = [...bewegt.matchAll(/<svg ([^>]*)>/g)].map((m) => m[1]);
    const mitAblauf = ebenen.filter((a) => a.includes('data-a='));
    expect(mitAblauf).toHaveLength(szene.gruppen.filter((g) => g.ablauf).length);
    for (const a of mitAblauf) {
      expect(a).toContain('data-motion="buero-ablauf"');
      expect(a).toMatch(/style="left:[\d.]+%;top:[\d.]+%;width:[\d.]+%;height:[\d.]+%;--v:[\d.]+;--x:-?[\d.]+cqi;--y:-?[\d.]+cqi/);
    }
    // nur die bewegten Ebenen tragen eine Kennung; still eine einzige Zeichnung ohne Ablauf
    expect(ebenen.filter((a) => a.includes('data-motion=')).length).toBe(mitAblauf.length);
    expect([...still.matchAll(/<svg /g)]).toHaveLength(1);
    expect(still).not.toMatch(/data-a=|data-motion=/);
    // Zeilen schreiben sich vom Anfang der Linie: Ursprung am Rand der Ebene
    for (const a of mitAblauf.filter((x) => x.includes('data-a="schreiben"'))) expect(a).toMatch(/transform-origin:[\d.]+% 50%/);
  });
});

describe('Inline und Datei: dieselbe Zeichnung', () => {
  it.each(ALLE.map((s) => [s.id, s] as const))('%s: gleiche Pfade, gleiche Linienarten, gleiche Reihenfolge', (_id, szene) => {
    const inline = renderToStaticMarkup(createElement(BueroZeichnung, { szene }));
    const datei = szene.id === 'leitstelle' ? leitstelleSvg() : szeneSvg(szene, 'papier');
    const soll = pfadeUndArten(datei, false);
    expect(soll.length).toBeGreaterThan(5);
    expect(soll.every((x) => !x.includes(' ?'))).toBe(true);
    expect(pfadeUndArten(inline, true)).toEqual(soll);
    expect(pfadeVon(szene)).toEqual(soll.map((x) => x.slice(0, x.lastIndexOf(' '))));
    // Lage der Glyphen gleich
    const lagen = (m: string) => [...m.matchAll(/transform="(translate\([^"]+)"/g)].map((x) => x[1]);
    expect(lagen(inline)).toEqual(lagen(datei));
  });

  it('die Szenen-Dateien in den Papier-Rollen, die Leitstelle auf Navy; je hell, dunkel und Druck aus den Primitiven', () => {
    const theme = quelle('app/styles/theme.css');
    const p = (name: string) => theme.match(new RegExp(`--p-${name}: (#[0-9A-Fa-f]{6});`))![1].toUpperCase();
    // Eine Markierfläche (Prüfrunde 2 A2-9), als eigene Rolle --markierung auf den Primitiven der Stufe 2 (Prüfrunde 4
    // A4-6): die Datei wie die Seite, die Rampe bleibt Temperatur
    const rolle = (block: RegExp) => theme.replace(/\/\*[\s\S]*?\*\//g, '').match(block)![1];
    expect(rolle(/:root \{[^}]*--markierung: var\(--p-([\w-]+)\);/)).toBe('waerme-2');
    expect(rolle(/prefers-color-scheme: dark\) \{\s*:root \{[^}]*--markierung: var\(--p-([\w-]+)\);/)).toBe('glimm-2');
    expect(BUERO_SVG_FARBEN.papier.hell).toEqual({ marke: p('navy'), flaeche: p('papier'), markiert: p('waerme-2') });
    expect(BUERO_SVG_FARBEN.papier.dunkel).toEqual({ marke: p('creme'), flaeche: p('nacht'), markiert: p('glimm-2') });
    expect(BUERO_SVG_FARBEN.papier.druck).toEqual({ ...BUERO_SVG_FARBEN.papier.hell, flaeche: p('weiss') });
    expect(BUERO_SVG_FARBEN.papier.hell.markiert).toBe(TOKENS.markierung.hell);
    expect(BUERO_SVG_FARBEN.papier.dunkel.markiert).toBe(TOKENS.markierung.dunkel);
    // Keine Stufe der Wärmerampe im Code der Büro-Familie
    for (const name of readdirSync(path.join(ROOT, 'lib/zeichnung/buero')).filter((n) => n.endsWith('.ts'))) {
      expect(quelle(`lib/zeichnung/buero/${name}`).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''), name).not.toMatch(/TOKENS\.waerme|--waerme-|glimm/);
    }
    for (const { svg } of bueroSzenenDateien()) {
      expect(svg).toContain('@media screen and (prefers-color-scheme:dark)');
      expect(svg).toContain('@media print');
      expect(svg).not.toMatch(/href=|url\(|<image|<script|<foreignObject|@font-face|<text|<filter|Gradient/);
      expect(svg).not.toContain('stroke-linecap:round');
    }
  });

  it('je Zeichnung höchstens 12 KB gzip, als Datei und inline', () => {
    for (const szene of ALLE) {
      const inline = renderToStaticMarkup(createElement(BueroZeichnung, { szene, motion: 'buero-ablauf' }));
      expect(gzip(inline), szene.id).toBeLessThanOrEqual(12 * 1024);
    }
    for (const svg of [leitstelleSvg(), ...bueroSzenenDateien().map((x) => x.svg)]) expect(gzip(svg)).toBeLessThanOrEqual(12 * 1024);
  });
});

describe('Ernsthaft: keine Spielereien, keine Marken, Ziffern nur aus Maßen', () => {
  const quellen = readdirSync(path.join(ROOT, 'lib/zeichnung/buero'))
    .filter((name) => name.endsWith('.ts'))
    .map((name) => quelle(`lib/zeichnung/buero/${name}`))
    .concat(readdirSync(path.join(ROOT, 'components/themen/buero')).map((name) => quelle(`components/themen/buero/${name}`)));
  const markup = [
    renderToStaticMarkup(createElement(BueroSeite, { text: SEITE, jobs: JOBS })),
    leitstelleSvg(),
    ...bueroSzenenDateien().map((x) => x.svg),
  ].join('\n');

  it('Bannliste: keine Uhr, kein Zirkel, kein Kompass, kein Windrad, kein Propeller (Kennungen, Klassen, Daten)', () => {
    const kennungen = ALLE.flatMap((s) => [s.id, ...s.gruppen.map((g) => g.id), ...s.beschriftungen.map((b) => b.id)]);
    for (const k of kennungen) expect(k).not.toMatch(/uhr|zirkel|kompass|windrad|propeller|luefter|rotor/i);
    expect(markup).not.toMatch(/data-[\w-]+="[^"]*(?:uhr|zirkel|kompass|windrad|propeller|luefter)/i);
    for (const q of quellen) expect(q).not.toMatch(/\b(?:Uhr|Zirkel|Kompass|Windrad|Propeller)\b/);
  });

  it('keine Software- oder Markennamen, kein Betrag, kein Logo', () => {
    const marken = /DATEV|SAP\b|Lexware|sevDesk|Microsoft|Excel|Outlook|Windows|Google|Apple|Leitz|Sortimo|Hilti|Buderus|Bosch|Viessmann|NIBE|Euro\b|€/;
    const szenen = renderToStaticMarkup(createElement('div', null, ...SEITE.aufgaben.szenen.map((s) => createElement(BueroZeichnung, { key: s.id, szene: BUERO_SZENEN[s.id], beschriftungen: s.beschriftungen }))));
    expect(szenen).not.toMatch(marken);
    expect(renderToStaticMarkup(createElement(Leitstelle, SEITE.leitstelle))).not.toMatch(marken);
    expect(JSON.stringify(SEITE.aufgaben)).not.toMatch(marken);
    for (const q of quellen) expect(q.replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, '')).not.toMatch(marken);
  });

  it('Ziffern nur aus Maßen und Normen: Beschriftungen ohne Ziffer, Schriftfelder und Bildnamen aus lib/zeichnung/buero/masse.ts', () => {
    const erlaubt = new Set(JSON.stringify(BUERO_MASSE).match(/\d[\d.,]*\d|\d/g));
    for (const szene of SEITE.aufgaben.szenen) {
      for (const wort of Object.values(szene.beschriftungen)) expect(wort, szene.id).not.toMatch(/\d/);
      for (const zahl of `${szene.schriftfeld} ${szene.bild} ${szene.titel}`.match(/\d[\d.,]*\d|\d/g) ?? []) {
        expect(erlaubt.has(zahl), `${szene.id}: ${zahl}`).toBe(true);
      }
    }
    for (const wort of Object.values(SEITE.leitstelle.ziele)) expect(wort).not.toMatch(/\d/);
    expect(SEITE.leitstelle.titel).not.toMatch(/\d/);
    // Der zugängliche Name beschreibt, was die Zeichnung zeigt (Prüfrunde 2 D2-3): jedes Teil, das die Quelle der
    // Leitstelle als Kommentar nennt, steht im Titel
    const teile = quelle('lib/zeichnung/buero/leitstelle.ts');
    for (const [teil, wort] of [
      ['Tischplatte', 'Schreibtisch'],
      ['Stuhl', 'Stuhl'],
      ['Bildschirm', 'Bildschirm'],
      ['BLATT', 'Blättern'],
      ['ORDNER', 'Ordner'],
      ['Bezugslinien', 'Bezugslinien'],
    ] as const) {
      expect(teile, teil).toContain(teil);
      expect(SEITE.leitstelle.titel, wort).toContain(wort);
    }
    // In den Zeichnungen steht keine Schrift: Wörter nur als HTML
    expect(markup).not.toMatch(/<text\b/);
  });

  it('Linienarten: keine Leitung, keine Rohrfarbe, nichts fließt; kein Verlauf, kein Filter, kein Bild', () => {
    const t = quelle('components/themen/buero/BueroZeichnung.tsx');
    expect(t).not.toMatch(/t\.leitung|t\.vorlauf|t\.ruecklauf|t\.kaeltemittel|t\.pfeilVorlauf|t\.pfeilRuecklauf/);
    expect(markup).not.toMatch(/<linearGradient|<radialGradient|<filter|<image\b|<pattern/);
    for (const art of ARTEN) expect(['kontur', 'konturOffen', 'fein', 'mass', 'voll', 'markiert']).toContain(art);
  });

  it('fünf Glyphen der Familie Büro: kalender, ordner, paket, beleg, brief', () => {
    for (const name of ['kalender', 'ordner', 'paket', 'beleg', 'brief'] as const) expect(GLYPH_SHAPES[name].length).toBeGreaterThan(1);
  });
});

describe('Bewegung: einmal beim Sichtbarwerden, genau wie im Register', () => {
  const szenen = BUERO_SZENEN_ARTEN.map((art) => BUERO_SZENEN[art]);
  const ablaeufe = szenen.flatMap((s) => s.gruppen.flatMap((g) => (g.ablauf ? [{ szene: s.id, ...g.ablauf }] : [])));

  it('Register buero-ablauf: Verzögerungen = alle Takte der Szenen, Ende = spätester Ablauf, ≤ 2.400 ms; Leitstelle still', () => {
    const r = MOTION_REGISTER['buero-ablauf'];
    const takte = [...new Set(szenen.flatMap(takteVon))].sort((a, b) => a - b);
    expect([...r.verzoegerungTakte]).toEqual(takte);
    expect([...r.fenster!.sicht!.verzoegerungTakte]).toEqual(takte);
    const ende = Math.max(...ablaeufe.map((a) => a.takte * TAKT_MS + DAUER_MS[a.dauer]));
    expect(r.endeMs).toBe(ende);
    expect(r.fenster!.sicht!.endeMs).toBe(ende);
    expect(ende).toBeLessThanOrEqual(SICHT_ENDE_MS);
    expect(Math.max(...takte)).toBeLessThanOrEqual(22);
    expect([...new Set(ablaeufe.map((a) => a.dauer))].sort()).toEqual([...r.dauer].sort());
    expect(LEITSTELLE.gruppen.some((g) => g.ablauf)).toBe(false);
    for (const a of ablaeufe) {
      expect(Number.isInteger(a.takte * 2), `${a.szene} ${a.takte}`).toBe(true);
      if (a.art === 'schreiben') expect(a.dauer).toBe('d-3');
    }
  });

  it('jede Szene läuft ab: Termine, Zeilen und Markierung, Pakete und Häkchen, Ordner, Brief und Blatt', () => {
    const je = (id: string) => ablaeufe.filter((a) => a.szene === id);
    expect(je('wochenplan').length).toBe(7);
    expect(je('beleg').filter((a) => a.art === 'schreiben').length).toBeGreaterThanOrEqual(8);
    expect(je('beleg').some((a) => a.dauer === 'd-4' && (a.y ?? 0) < 0)).toBe(true);
    expect(je('material').filter((a) => (a.x ?? 0) < 0).length).toBe(3);
    expect(je('ablage').length).toBe(4);
  });

  it('CSS im Büro-Block: Startzustand unter bereit, Abläufe unter laeuft mit both (Prüfrunde 3 C3-2), nur transform und opacity, kein Skalieren', () => {
    const css = quelle(BUERO_DATEI);
    const block = css.slice(css.indexOf(BUERO_MARKE));
    expect(pruefeBueroBlock(css)).toEqual([]);
    expect(block).toMatch(/\.bueroBild\[data-ablauf='bereit'\] \[data-a\] \{\s*opacity: 0;/);
    expect(block).toMatch(
      /\.bueroBild\[data-ablauf='laeuft'\] \[data-a\] \{\s*animation: bueroEin var\(--d-3\) var\(--k-aus\) calc\(var\(--takt\) \* var\(--v\)\) both;/,
    );
    expect(block).toMatch(/\[data-a='lang'\] \{\s*animation-duration: var\(--d-4\);/);
    expect(block).toMatch(/\[data-a='schreiben'\] \{\s*animation-name: bueroSchreiben;/);
    // Animationen nur unter laeuft; keine Schleife
    // (außer dem Abschalten im Druck: animation: none)
    for (const m of block.matchAll(/([^{}]+)\{[^}]*animation(?:-name)?: (?!none)/g)) expect(m[1]).toContain("[data-ablauf='laeuft']");
    expect(block).not.toMatch(/infinite|alternate/);
    const keyframes = keyframesIn(block);
    expect(keyframes.map((k) => k.name).sort()).toEqual(['bueroEin', 'bueroSchreiben']);
    for (const k of keyframes) {
      expect(skaliert(k), k.name).toBe(false);
      for (const stopp of k.stopps) for (const eigenschaft of stopp.deklarationen.keys()) expect(['opacity', 'transform']).toContain(eigenschaft);
    }
    // Farben nur aus Rollen: die eine Markierfläche (Prüfrunde 2 A2-9) als eigene Rolle, keine Stufe der Wärmerampe
    // (Prüfrunde 4 A4-6), sonst keine Farbwerte
    expect(block).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|gradient|filter:|mix-blend|--waerme|--klick|--p-/i);
    expect([...block.matchAll(/var\(--markierung\)/g)]).toHaveLength(1);
    // Gedruckt steht der Endzustand
    expect(block).toMatch(/@media print \{\s*\.bueroBild\[data-ablauf\] \[data-a\] \{\s*opacity: 1;\s*animation: none;/);
  });

  it('Themenseite: vier Szenen, jede in SichtStart; Sicht-Auftritte in höchstens der Hälfte der Abschnitte (K-011)', () => {
    const html = renderToStaticMarkup(createElement(BueroSeite, { text: SEITE, jobs: JOBS }));
    // Jede bewegte Gruppe trägt die Kennung auf ihrer eigenen Ebene (Prüfrunde 3 C3-2)
    const bewegteGruppen = BUERO_SZENEN_ARTEN.flatMap((art) => BUERO_SZENEN[art].gruppen.filter((g) => g.ablauf));
    expect(html.match(/data-motion="buero-ablauf"/g)).toHaveLength(bewegteGruppen.length);
    expect(kennungenAusserhalb(html, ['buero-ablauf'], ABLAUF_BEREICH)).toEqual([]);
    // Der Server liefert den Endzustand
    expect(html.match(/data-ablauf="fertig"/g)).toHaveLength(4);
    expect(html).not.toMatch(/data-ablauf="(?:bereit|laeuft)"/);
    // Abschnitte der Seite (Section-Wurzeln) und die mit einem Sicht-Bereich
    const abschnitte = html.split(/(?=<section\b)/).filter((teil) => teil.startsWith('<section'));
    const mitSicht = abschnitte.filter((teil) => teil.includes('data-ablauf='));
    expect(abschnitte.length).toBeGreaterThanOrEqual(6);
    expect(mitSicht.length).toBeGreaterThan(0);
    expect(mitSicht.length * 2).toBeLessThanOrEqual(abschnitte.length);
    // Die Leitstelle im Kopf steht still
    const kopf = html.slice(0, html.indexOf('id="aufgaben"'));
    expect(kopf).toContain('data-zeichnung="leitstelle"');
    expect(kopf).not.toMatch(/data-a=|data-motion="buero-ablauf"/);
  });

  it('Stellenseite der Bürofachkraft: die Szenen nur als stille Dateien (lazy), mit Weg zur Themenseite; keine inline', () => {
    const job = getJobById('buerofachkraft')!;
    const html = renderToStaticMarkup(createElement(JobSections, { job }));
    for (const art of BUERO_SZENEN_ARTEN) {
      const bild = html.match(/<img [^>]*>/g)!.find((tag) => tag.includes(bueroSzenePfad(art)))!;
      expect(bild, art).toContain('loading="lazy"');
      expect(bild, art).toContain('alt=""');
    }
    expect(html).toContain('href="/arbeiten-bei-uns/buero-und-verwaltung"');
    expect(html).not.toMatch(/data-motion="buero-ablauf"|data-ablauf=|data-a=/);
    for (const szene of ALLE) for (const d of pfadeVon(szene).filter((x) => x.length >= MERKMAL_LAENGE)) expect(html).not.toContain(d);
    // Andere Stellen zeigen keine Büro-Szenen
    const am = renderToStaticMarkup(createElement(JobSections, { job: getJobById('anlagenmechaniker-shk')! }));
    expect(am).not.toContain('/zeichnung/buero-');
  });
});

describe('Teilen-Bilder (E-031): Büro-Zweig mit der Leitstelle, ohne Leitung zum Knopf', () => {
  it('Bürofachkraft und „Büro und Verwaltung“ zeichnen die Leitstelle, alle anderen den Hausschnitt', async () => {
    const buero = getJobById('buerofachkraft')!;
    expect(ogJobText(buero, true).zeichnung).toBe('buero');
    for (const job of JOBS.filter((j) => j.category !== 'buero')) expect(ogJobText(job, true).zeichnung, job.id).toBe('haus');
    expect(ogThemaText(SEITE).zeichnung).toBe('buero');
    expect(ogThemaText(getThemaPageText('gehalt', { jobs: JOBS, now: NOW })).zeichnung).toBe('haus');
    const quelleOg = quelle('lib/seo/og-render.tsx');
    expect(quelleOg).toContain("{zeichnung === 'buero' ? <Leitstelle /> : <Haus knopf={action !== null} />}");
    expect(quelleOg).toContain("{zeichnung === 'haus' ? <VorlaufZumKnopf /> : null}");
    const bild = await renderJobImage(ogJobText(buero, true));
    expect(bild.headers.get('content-type')).toBe('image/png');
    const png = Buffer.from(await bild.arrayBuffer());
    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(1200);
  }, 30_000);
});
