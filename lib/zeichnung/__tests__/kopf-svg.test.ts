import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Anlagenschema } from '@/components/zeichnung/technik/Anlagenschema';
import { HausschnittKlein } from '@/components/zeichnung/technik/Hausschnitt';
import { GET, generateStaticParams } from '@/app/zeichnung/[datei]/route';
import { KOPF_HAUS_VIEWBOX, KOPF_SVG_FARBEN, anlagenschemaSvg, hausschnittSvg, kopfSvgDateien, kopfSvgPfad } from '../kopf-svg';
import { ANLAGENSCHEMA_PFEIL_MAX, ANLAGENSCHEMA_RAHMEN } from '../szenen/anlagenschema';

const ROOT = path.resolve(__dirname, '../../..');
const quelle = (datei: string) => readFileSync(path.join(ROOT, datei), 'utf8');

/** Rollen der Klassen: CSS-Module der Komponenten (`_kontur_…`) und Kurzklassen der Datei. */
const ROLLEN: Record<string, string> = {
  kontur: 'k',
  fein: 'f',
  verdeckt: 'v',
  mittellinie: 'm',
  schraffur: 's',
  leitung: 'l',
  vorlauf: 'vl',
  ruecklauf: 'rl',
  kaeltemittel: 'km',
  flaeche: 'fl',
  schnitt: 'sn',
  voll: 'vo',
  pfeilVorlauf: 'pv',
  pfeilRuecklauf: 'pr',
  pfeilKaeltemittel: 'pk',
  pfeil: 'p',
};

/**
 * Zeichnende Elemente in Reihenfolge, mit Geometrie und Rollen (ohne Schrift, ohne Hüllen): Aus dem Markup der
 * Komponente gelesen, Klassen der CSS-Module auf die Kurzklassen der Datei abgebildet.
 */
function elemente(svg: string, modul: boolean) {
  const out: string[] = [];
  for (const m of svg.matchAll(/<(path|rect|circle|g|svg)\b([^>]*)>/g)) {
    const [, tag, attr] = m;
    const wert = (name: string) => attr.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
    const klasse = wert('class') ?? '';
    const rollen = modul
      ? [...klasse.matchAll(/_([a-zA-Z]+)_[A-Za-z0-9-]+/g)].map((x) => ROLLEN[x[1]]).filter(Boolean)
      : klasse.split(/\s+/).filter((x) => Object.values(ROLLEN).includes(x));
    const geo = ['d', 'x', 'y', 'width', 'height', 'rx', 'cx', 'cy', 'r', 'transform', 'viewBox']
      .map((name) => [name, wert(name)])
      .filter(([, v]) => v !== undefined)
      .map(([name, v]) => `${name}=${v}`)
      .join(' ');
    const origin = attr.match(/transform-origin:\s*([\d.]+)px ([\d.]+)px/);
    if (tag === 'g' && !wert('transform')) continue;
    out.push(`${tag} ${geo} [${rollen.sort().join(',')}]${origin ? ` origin=${origin[1]},${origin[2]}` : ''}`);
  }
  return out;
}

const html = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(el);

describe('Zeichnungen des Stellenkopfs als Datei (Prüfung E-029, Runde 3, Leistung)', () => {
  it('Anlagenschema: dieselbe Geometrie und dieselben Linienarten wie die Komponente, ohne Schrift', () => {
    const komponente = html(createElement(Anlagenschema, { legende: false, schriftfeld: false, titel: null }));
    const svg = komponente.slice(komponente.indexOf('<svg'), komponente.indexOf('</svg>') + 6);
    // Die äußere Hülle (svg mit viewBox) ist in der Datei die Wurzel
    const soll = elemente(svg, true).slice(1);
    const ist = elemente(anlagenschemaSvg(), false).slice(1);
    expect(soll.length).toBeGreaterThan(50);
    expect(ist).toEqual(soll);
    expect(anlagenschemaSvg()).not.toContain('<text');
    expect(anlagenschemaSvg()).toMatch(new RegExp(`^<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANLAGENSCHEMA_RAHMEN.breite} ${ANLAGENSCHEMA_RAHMEN.hoehe}"`));
  });

  it('Hausschnitt: dieselbe Geometrie wie HausschnittKlein, derselbe Ausschnitt', () => {
    const komponente = html(createElement(HausschnittKlein, {}));
    const soll = elemente(komponente, true);
    const ist = elemente(hausschnittSvg(), false);
    expect(soll[0]).toContain(`viewBox=${KOPF_HAUS_VIEWBOX.x} ${KOPF_HAUS_VIEWBOX.y} ${KOPF_HAUS_VIEWBOX.breite} ${KOPF_HAUS_VIEWBOX.hoehe}`);
    expect(ist[0]).toContain(`viewBox=${KOPF_HAUS_VIEWBOX.x} ${KOPF_HAUS_VIEWBOX.y} ${KOPF_HAUS_VIEWBOX.breite} ${KOPF_HAUS_VIEWBOX.hoehe}`);
    expect(soll.length).toBeGreaterThan(30);
    expect(ist.slice(1)).toEqual(soll.slice(1));
  });

  it('eigenständig: feste Farben der Rollen des Inverse-Bands (hell, dunkel, Druck), keine Verweise nach außen', () => {
    const theme = quelle('app/styles/theme.css');
    const p = (name: string) => theme.match(new RegExp(`--p-${name}: (#[0-9A-Fa-f]{6});`))![1].toUpperCase();
    expect(KOPF_SVG_FARBEN.hell).toEqual({
      marke: p('creme'),
      flaeche: p('navy'),
      schnitt: p('navy-2'),
      schraffur: p('navy-rand'),
      vorlauf: p('rot-hell'),
      ruecklauf: p('blau-hell'),
    });
    expect(KOPF_SVG_FARBEN.dunkel).toEqual({ ...KOPF_SVG_FARBEN.hell, flaeche: p('band-d'), schnitt: p('band-d-2') });
    expect(KOPF_SVG_FARBEN.druck).toEqual({
      marke: p('navy'),
      flaeche: p('weiss'),
      schnitt: p('wand'),
      schraffur: p('rand'),
      vorlauf: p('rot'),
      ruecklauf: p('blau'),
    });
    // Die Rollen im Inverse-Band, aus denen die Farben stammen
    const inverse = theme.slice(theme.indexOf('[data-tone="inverse"] {'));
    for (const [rolle, primitiv] of [
      ['surface', 'navy'],
      ['surface-2', 'navy-2'],
      ['brand', 'creme'],
      ['line-strong', 'navy-rand'],
      ['vorlauf', 'rot-hell'],
      ['ruecklauf', 'blau-hell'],
    ]) {
      expect(inverse, rolle).toContain(`--${rolle}: var(--p-${primitiv});`);
    }
    for (const svg of [anlagenschemaSvg(), hausschnittSvg()]) {
      expect(svg).toContain('@media screen and (prefers-color-scheme:dark)');
      expect(svg).toContain('@media print');
      expect(svg).not.toMatch(/href=|url\(|<image|<script|<foreignObject|@font-face|<text/);
      // Linienarten: non-scaling-stroke, stumpfe Enden, nie rund
      expect(svg).toContain('vector-effect:non-scaling-stroke');
      expect(svg).not.toMatch(/stroke-linecap:round/);
    }
  });

  it('Fließpfeile wachsen je Breite des Bilds wie `.anlagenBild` in technik.module.css', () => {
    const css = quelle('components/zeichnung/technik/technik.module.css');
    const stufe = (block: string) => block.match(/\.anlagenBild \{[^}]*--pfeil: ([\d.]+);/)![1];
    const oben = css.slice(0, css.indexOf('@container (max-width: 40rem)'));
    const mittel = css.slice(css.indexOf('@container (max-width: 40rem)'), css.indexOf('@container (max-width: 26rem)'));
    const unten = css.slice(css.indexOf('@container (max-width: 26rem)'));
    const svg = anlagenschemaSvg();
    expect(svg).toContain(`svg{--pfeil:${stufe(oben)}}`);
    expect(svg).toContain(`@media (max-width:40rem){svg{--pfeil:${stufe(mittel)}}}`);
    expect(svg).toContain(`@media (max-width:26rem){svg{--pfeil:${stufe(unten)}}}`);
    expect(Number(stufe(unten))).toBe(ANLAGENSCHEMA_PFEIL_MAX);
  });

  it('Dateiname mit Hash des Inhalts (ein Jahr gecacht); der Route-Handler liefert genau diese Dateien statisch', async () => {
    const dateien = kopfSvgDateien();
    expect(dateien.map((x) => x.art)).toEqual(['anlagenschema', 'hausschnitt']);
    for (const { datei, art, svg } of dateien) {
      expect(datei).toMatch(new RegExp(`^${art}-[0-9a-f]{10}\\.svg$`));
      expect(kopfSvgPfad(art)).toBe(`/zeichnung/${datei}`);
      const antwort = await GET(new Request(`http://localhost/zeichnung/${datei}`), { params: Promise.resolve({ datei }) });
      expect(antwort.status).toBe(200);
      expect(antwort.headers.get('Content-Type')).toBe('image/svg+xml; charset=utf-8');
      expect(await antwort.text()).toBe(svg);
    }
    expect(generateStaticParams()).toEqual(dateien.map(({ datei }) => ({ datei })));
    const fehlt = await GET(new Request('http://localhost/zeichnung/anlagenschema-0000000000.svg'), {
      params: Promise.resolve({ datei: 'anlagenschema-0000000000.svg' }),
    });
    expect(fehlt.status).toBe(404);
    // Statisch beim Build, ohne unbekannte Pfade; SVG-Dateien gehen am Proxy vorbei und bekommen den langen Cache
    const route = quelle('app/zeichnung/[datei]/route.ts');
    expect(route).toContain("export const dynamic = 'force-static';");
    expect(route).toContain('export const dynamicParams = false;');
    expect(quelle('proxy.ts')).toContain('.*\\\\.(?:svg|');
    expect(quelle('next.config.ts')).toMatch(/source: '\/\(\.\*\)\\\\\.\(png\|jpg\|jpeg\|gif\|webp\|avif\|svg\|/);
  });
});
