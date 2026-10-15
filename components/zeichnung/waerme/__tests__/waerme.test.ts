import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import ThemaPage from '@/app/arbeiten-bei-uns/[thema]/page';
import { Hero } from '@/components/home/Hero';
import { HAUSSCHNITT_RAHMEN, LEITUNGEN, PFEILE } from '@/lib/zeichnung/szenen/hausschnitt';
import { RAUMSCHNITT_RAHMEN } from '@/lib/zeichnung/szenen/raumschnitt';
import { WAERMEFELDER, type WaermefeldId } from '@/lib/zeichnung/szenen/waermefeld';
import { HausschnittKlein } from '../../technik/Hausschnitt';
import { Raumschnitt } from '../../technik/Raumschnitt';
import { ABLAUF_BEREICH, kennungenAusserhalb } from '../../__tests__/bereich';
import { TOKENS } from '@/lib/tokens';
import { WAERME_DATEI_FELDER, waermeBandPfad, waermeBandSvg } from '@/lib/zeichnung/waerme/dateien';
import { WaermefeldDateien, WaermefeldEbenen, WaermefeldStill } from '../Waermefeld';

/**
 * Wärmefeld 2.0 (E-031, Paket W1): Darstellung. Waermefeld.tsx ist der einzige Renderer der Wärme und zeichnet nur die
 * berechneten Daten; die Orte sind freigegeben (Hero, Wärmepumpen-Seite, HausschnittKlein, Kopfbild-Datei, Teilen-Bild),
 * nie Gerät oder Lageplan; der Notschalter nimmt alles zurück.
 */

const ROOT = path.resolve(__dirname, '../../../..');
const quelle = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const html = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(el);
const IDS: readonly WaermefeldId[] = ['hausschnitt', 'raum-heizkoerper', 'raum-fussboden'];

/** Alle .ts/.tsx unter app/, components/, lib/ ohne Tests. */
function quellen(): string[] {
  const out: string[] = [];
  const lauf = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name === '__tests__' || name.startsWith('.')) continue;
      const p = path.join(dir, name);
      if (statSync(p).isDirectory()) lauf(p);
      else if (/\.tsx?$/.test(name)) out.push(path.relative(ROOT, p));
    }
  };
  for (const dir of ['app', 'components', 'lib']) lauf(path.join(ROOT, dir));
  return out.sort();
}

describe('Wärmefeld: nur aus den Daten (E-031)', () => {
  it.each(IDS)('%s: Ebenen = Grund-div und je Band ein SVG mit genau den Pfaden der Daten', (id) => {
    const m = html(createElement(WaermefeldEbenen, { id, rahmen: { x: 0, y: 0, ...HAUSSCHNITT_RAHMEN } }));
    const { innen, baender, wachstum } = WAERMEFELDER[id];
    expect(m).toMatch(
      new RegExp(`^<div class="[^"]*" style="[^"]*" data-waermefeld="${id}" data-wachstum="${wachstum}" aria-hidden="true"><div class="[^"]*" aria-hidden="true" data-band="0"></div>`),
    );
    expect([...m.matchAll(/<path d="([^"]+)">/g)].map((x) => x[1])).toEqual(baender.map((b) => b.d));
    expect([...m.matchAll(/viewBox="([^"]+)"/g)].map((x) => x[1])).toEqual(baender.map(() => `${innen.x} ${innen.y} ${innen.breite} ${innen.hoehe}`));
    expect([...m.matchAll(/--start:([\d.]+)/g)].map((x) => Number(x[1]))).toEqual(baender.map((b) => b.startTakte));
    expect(m.match(/data-motion="waerme-breitet-sich-aus"/g)).toHaveLength(baender.length);
    expect(m).not.toMatch(/Gradient|<filter|<image|<foreignObject|fill="|stroke="|style="[^"]*(?:color|fill|stroke)/);
  });

  it.each(WAERME_DATEI_FELDER)('%s als Dateien (Prüfrunde 1 C1-6): je Band ein Bild aus seiner Datei, kein Pfad im Dokument', (id) => {
    const rahmen = { x: 0, y: 0, ...HAUSSCHNITT_RAHMEN };
    const m = html(createElement(WaermefeldDateien, { id, rahmen }));
    const { innen, baender } = WAERMEFELDER[id];
    // Gleicher Rahmen und gleiche Bewegung wie die Ebenen, nur die Bänder als Bild
    const ebenen = html(createElement(WaermefeldEbenen, { id, rahmen }));
    expect(m.slice(0, m.indexOf('<img'))).toBe(ebenen.slice(0, ebenen.indexOf('<svg')));
    const bilder = [...m.matchAll(/<img ([^>]*)\/>/g)].map((x) => x[1]);
    expect(bilder).toHaveLength(baender.length);
    bilder.forEach((attr, i) => {
      const b = baender[i];
      expect(attr).toContain(`src="${waermeBandPfad(id, b.stufe)}"`);
      expect(attr).toContain('alt=""');
      expect(attr).toContain('loading="lazy"');
      expect(attr).toContain(`width="${innen.breite}" height="${innen.hoehe}"`);
      expect(attr).toContain(`data-band="${b.stufe}"`);
      expect(attr).toContain('data-motion="waerme-breitet-sich-aus"');
      expect(attr).toContain(`--start:${b.startTakte}`);
    });
    expect(m).not.toMatch(/<path|<svg/);
    for (const b of baender) expect(m).not.toContain(b.d.slice(0, 40));
    // Die Datei: genau der Pfad der Daten in der Rampenfarbe der Stufe, hell und dunkel, viewBox = Rauminneres
    for (const b of baender) {
      const svg = waermeBandSvg(id, b.stufe);
      expect(svg).toContain(`viewBox="${innen.x} ${innen.y} ${innen.breite} ${innen.hoehe}"`);
      expect([...svg.matchAll(/<path d="([^"]+)"\/>/g)].map((x) => x[1])).toEqual([b.d]);
      expect(svg).toContain(`path{fill:${TOKENS.waerme.hell[b.stufe]}}@media screen and (prefers-color-scheme:dark){path{fill:${TOKENS.waerme.dunkel[b.stufe]}}}`);
      expect(svg).not.toMatch(/Gradient|<filter|<image|<foreignObject|stroke/);
    }
  });

  it('still: Band 0 als Rechteck und die vier Pfade der Daten in einer Zeichnung mit der viewBox des Rauminneren, ohne Bewegung', () => {
    const m = html(createElement('svg', null, createElement(WaermefeldStill, { id: 'hausschnitt' })));
    const { innen, baender } = WAERMEFELDER.hausschnitt;
    expect(m).toContain(`<svg x="${innen.x}" y="${innen.y}" width="${innen.breite}" height="${innen.hoehe}" viewBox="${innen.x} ${innen.y} ${innen.breite} ${innen.hoehe}" data-waermefeld="hausschnitt">`);
    expect([...m.matchAll(/<path d="([^"]+)"/g)].map((x) => x[1])).toEqual(baender.map((b) => b.d));
    expect(m).not.toContain('data-motion');
  });

  it('der Renderer enthält keine eigenen Formen (keine d-Literale, keine Zahlenpfade)', () => {
    const src = quelle('components/zeichnung/waerme/Waermefeld.tsx');
    expect(src).not.toMatch(/\bd="|d=\{['`"]M|['"`]M-?\d/);
    expect(src).toContain('WAERMEFELDER');
    // Wärmebild (E-029) bleibt verboten, Waermefeld.tsx ist der einzige Renderer
    expect(quellen().filter((f) => /waermebild/i.test(f))).toEqual([]);
  });

  it('freigegebene Orte: Hero, Raumschnitt (Wärmepumpen), HausschnittKlein, Kopfbild-Datei und Teilen-Bild; nie Gerät oder Lageplan', () => {
    const nutzt = (muster: RegExp) => quellen().filter((f) => muster.test(quelle(f)));
    // Wer den Renderer einsetzt
    expect(nutzt(/from '(?:\.\.\/waerme|@\/components\/zeichnung\/waerme)\/Waermefeld'/)).toEqual([
      'components/home/einstieg/Einstieg.tsx',
      'components/zeichnung/technik/Hausschnitt.tsx',
      'components/zeichnung/technik/Raumschnitt.tsx',
    ]);
    // Wer die Daten liest (Renderer, Kopfbild-Datei, Teilen-Bild, Banddateien der Vergleichsräume)
    expect(nutzt(/from '(?:\.\/|\.\.\/|@\/lib\/zeichnung\/)szenen\/waermefeld'/)).toEqual([
      'components/zeichnung/waerme/Waermefeld.tsx',
      'lib/seo/og-haus.ts',
      'lib/zeichnung/kopf-svg.ts',
      'lib/zeichnung/waerme/dateien.ts',
    ]);
    // Wo Raumschnitt und HausschnittKlein stehen: Wärmepumpen-Seite bzw. HausKlein; nie Gerät, Schema oder Lageplan
    expect(nutzt(/<Raumschnitt\b/)).toEqual(['components/themen/WaermepumpenSeite.tsx']);
    for (const f of ['components/zeichnung/technik/Aussengeraet.tsx', 'components/zeichnung/technik/Anlagenschema.tsx', 'components/zeichnung/technik/Kaeltekreis.tsx', 'components/zeichnung/Pendelweg.tsx']) {
      expect(quelle(f), f).not.toMatch(/waerme\/|Waermefeld|WAERMEFELDER|data-tone="warm"/);
    }
  });

  it('im Hausschnitt sind genau die Leitungen und Pfeile des Rauminneren markiert (Wärmebereich)', () => {
    const innen = WAERMEFELDER.hausschnitt.innen;
    const imRaum = (punkte: readonly { x: number; y: number }[]) =>
      punkte.every((q) => q.x >= innen.x && q.x <= innen.x + innen.breite && q.y >= innen.y && q.y <= innen.y + innen.hoehe);
    for (const l of LEITUNGEN) expect(Boolean(l.raum), l.id).toBe(imRaum(l.punkte));
    const spitzen = (d: string) => [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
    for (const p of PFEILE) expect(Boolean(p.raum), p.d).toBe(imRaum(spitzen(p.d)));
  });
});

describe('Wärmefeld an den Orten (E-031)', () => {
  it('HausschnittKlein: still im Raum, Raum im Wärmebereich, Heizkörper und Inneneinheit ohne Fläche', () => {
    const m = html(createElement(HausschnittKlein, {}));
    expect(m).toContain('data-waermefeld="hausschnitt"');
    expect(m.indexOf('data-waermefeld')).toBeLessThan(m.indexOf('<path'));
    const warm = m.match(/<g data-tone="warm">([\s\S]*?)<\/g><\/g>/)![1];
    expect(warm).toMatch(/<rect [^>]*class="_kontur_[^" ]+" data-heizkoerper=""/);
    expect(warm).toMatch(/<rect [^>]*class="_mittellinie_[^" ]+" data-inneneinheit=""/);
    expect(m).not.toContain('data-motion');
    // Ohne Wärme wie vor E-031
    const aus = html(createElement(HausschnittKlein, { waerme: 'aus' }));
    expect(aus).not.toMatch(/data-waermefeld|data-tone/);
    expect(aus).toMatch(/<rect [^>]*class="_kontur_[^" ]+ _flaeche_[^" ]+" data-heizkoerper=""/);
  });

  it('Raumschnitt: Wärmefeld als Ebenen unter der Zeichnung, Heizkörper im Wärmebereich bzw. Rohre im Estrich', () => {
    const hk = html(createElement(Raumschnitt, { art: 'heizkoerper', titel: 'Raum mit Heizkörper im Schnitt' }));
    expect(hk).toMatch(/^<div class="relative" style="aspect-ratio:480 \/ 293.5" data-zeichnung="raumschnitt" data-raum="heizkoerper"><div [^>]*data-waermefeld="raum-heizkoerper"/);
    expect(hk).toMatch(/<g data-tone="warm"><rect [^>]*data-heizkoerper=""><\/rect><\/g>/);
    expect(hk).toContain('role="img"');
    expect(hk).toContain('<title>Raum mit Heizkörper im Schnitt</title>');
    const fb = html(createElement(Raumschnitt, { art: 'fussboden' }));
    expect(fb).toContain('data-waermefeld="raum-fussboden"');
    expect(fb).not.toContain('data-heizkoerper');
    expect(fb.match(/<circle [^>]*data-medium="vorlauf"/g)!.length).toBeGreaterThan(10);
    expect(fb.match(/<circle [^>]*data-medium="ruecklauf"/g)!.length).toBeGreaterThan(10);
    expect(fb).toMatch(/aria-hidden="true"/);
    // Lage der Ebenen = Rauminneres im Rahmen der Zeichnung
    const R = RAUMSCHNITT_RAHMEN;
    const p = (x: number) => `${Math.round(x * 10000) / 100}%`;
    expect(fb).toContain(`style="left:${p(-R.x / R.breite)};top:${p(-R.y / R.hoehe)};width:${p(420 / R.breite)};height:${p(250 / R.hoehe)}"`);
  });

  it('Wärmepumpen-Seite: der Vergleich steht in SichtStart, jedes Band liegt in data-ablauf; Sicht-Auftritte höchstens auf der Hälfte der Abschnitte (K-011)', async () => {
    const m = html(await ThemaPage({ params: Promise.resolve({ thema: 'waermepumpen' }) }));
    const anzahl = WAERME_DATEI_FELDER.reduce((n, id) => n + WAERMEFELDER[id].baender.length, 0);
    expect(m.match(/data-motion="waerme-breitet-sich-aus"/g)).toHaveLength(anzahl);
    // Die Bänder kommen als Dateien, ihre Pfade stehen nicht im Dokument (Prüfrunde 1 C1-6)
    for (const id of WAERME_DATEI_FELDER) {
      for (const b of WAERMEFELDER[id].baender) {
        expect(m).toContain(`src="${waermeBandPfad(id, b.stufe)}"`);
        expect(m).not.toContain(b.d.slice(0, 40));
      }
    }
    expect(kennungenAusserhalb(m, ['waerme-breitet-sich-aus'], ABLAUF_BEREICH)).toEqual([]);
    expect(m).toContain('data-waermefeld="raum-heizkoerper"');
    expect(m).toContain('data-waermefeld="raum-fussboden"');
    // Neben dem Text untereinander in voller Spaltenbreite, nicht als Daumennagel (Prüfrunde 1 A1-10)
    const sicht = m.match(/<div class="([^"]*)" data-ablauf="[^"]*"[^>]*>(?:(?!<\/figure>)[\s\S])*data-waermefeld="raum-heizkoerper"/);
    expect(sicht?.[1].split(' ')).toEqual(expect.arrayContaining(['sm:grid-cols-2', 'lg:grid-cols-1']));
    const abschnitte = m.split(/<section\b/).slice(1);
    const mitSicht = abschnitte.filter((a) => /data-ablauf=/.test(a.split(/<\/section>/)[0]));
    expect(mitSicht.length).toBeGreaterThan(0);
    expect(mitSicht.length * 2).toBeLessThanOrEqual(abschnitte.length);
  });

  it('Hero: Wärme als Nachlauf (keine Sicht-Region), Band 0 und vier Bänder unter der Szene', () => {
    const m = html(createElement(Hero, { now: new Date('2026-10-14T09:00:00Z') }));
    expect(m).not.toContain('data-ablauf');
    expect(m.match(/data-waermefeld="hausschnitt"/g)).toHaveLength(1);
    expect(m.indexOf('data-waermefeld="hausschnitt"')).toBeLessThan(m.indexOf('data-szene="einstieg"'));
  });
});

describe('Notschalter WAERMEFELD_AN = false (E-031, Entscheidung 8)', () => {
  it('nimmt das Wärmefeld überall zurück: keine Bänder, kein Wärmebereich, Heizkörper wieder mit Fläche', async () => {
    vi.resetModules();
    vi.doMock('@/lib/zeichnung/waerme/schalter', () => ({ WAERMEFELD_AN: false }));
    try {
      const { HausschnittKlein: Klein } = await import('../../technik/Hausschnitt');
      const { Raumschnitt: Raum } = await import('../../technik/Raumschnitt');
      const { Hero: Held } = await import('@/components/home/Hero');
      const { hausschnittSvg } = await import('@/lib/zeichnung/kopf-svg');
      const { OG_WAERMEFELD } = await import('@/lib/seo/og-haus');
      const markups = [
        html(createElement(Klein, {})),
        html(createElement(Raum, { art: 'heizkoerper' })),
        html(createElement(Raum, { art: 'fussboden' })),
        html(createElement(Held, { now: new Date('2026-10-14T09:00:00Z') })),
      ];
      for (const m of markups) {
        expect(m).not.toMatch(/data-waermefeld|data-tone="warm"|waerme-breitet-sich-aus/);
      }
      expect(markups[0]).toMatch(/<rect [^>]*class="_kontur_[^" ]+ _flaeche_[^" ]+" data-heizkoerper=""/);
      expect(markups[1]).toMatch(/<rect [^>]*class="_kontur_[^" ]+ _flaeche_[^" ]+" data-heizkoerper=""/);
      expect(hausschnittSvg()).not.toMatch(/class="w\d"|class="wb"|--w0/);
      expect(OG_WAERMEFELD).toBeNull();
    } finally {
      vi.doUnmock('@/lib/zeichnung/waerme/schalter');
      vi.resetModules();
    }
  });
});
