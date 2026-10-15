import { describe, expect, it } from 'vitest';
import { anlagenschemaSvg, hausschnittSvg } from '@/lib/zeichnung/kopf-svg';
import { MERKMAL_LAENGE, TECHNIK_BUDGET, modulBytes, pruefeKopfzeichnungen, pruefeSeiten, stylesheetsOf } from '../check-css-chunks.mjs';

/** Gebautes CSS in der Form, die Turbopack schreibt: `.<modul>-module__<hash>__<klasse>`. */
const GLOBAL = '.flex{display:flex}';
const GEMEINSAM = '.kopf-module__AbCd12__kopf{color:red}.stelle-module__Ef34Gh__bild{display:grid}';
const THEMEN = '.themen-module__ZSQdQq__kasten{gap:1rem}@media (min-width:64em){.themen-module__ZSQdQq__kasten{gap:2rem}}';
const TECHNIK = '.technik-module__uBmuTa__schrift{font-size:20px}';
const DATEIEN: Record<string, string> = { '/g.css': GLOBAL, '/s.css': GEMEINSAM, '/t.css': THEMEN, '/x.css': TECHNIK };
const lies = (href: string) => DATEIEN[href];
const seite = (route: string, stylesheets: string[], preloads: string[] = []) => ({ route, stylesheets, preloads });

describe('check-css-chunks: CSS-Ketten im Build (Prüfung E-029, Runde 2, Befunde 8 und 9)', () => {
  it('liest render-blockierende Stylesheets und CSS-Preloads aus dem HTML', () => {
    const html =
      '<link rel="stylesheet" href="/_next/static/chunks/a.css" data-precedence="next"/>' +
      '<link rel="preload" href="/_next/static/chunks/b.css" as="style"/>' +
      '<link rel="preload" href="/_next/static/media/f.woff2" as="font" type="font/woff2"/>';
    expect(stylesheetsOf(html)).toEqual({ stylesheets: ['/_next/static/chunks/a.css'], preloads: ['/_next/static/chunks/b.css'] });
  });

  it('zählt die Bytes eines Moduls samt seiner at-Regeln', () => {
    expect(modulBytes(THEMEN, ['themen'])).toBe(THEMEN.length);
    expect(modulBytes(GEMEINSAM, ['themen'])).toBe(0);
    expect(modulBytes(GEMEINSAM + TECHNIK, ['technik', 'dauer'])).toBe(TECHNIK.length);
  });

  it('besteht mit dem Zuschnitt nach den Befunden', () => {
    expect(
      pruefeSeiten(
        [
          seite('/', ['/g.css', '/s.css', '/x.css']),
          seite('/jobs', ['/g.css', '/s.css']),
          seite('/jobs/anlagenmechaniker-shk-wetzlar', ['/g.css', '/s.css']),
          seite('/einsatzgebiet/herborn', ['/g.css', '/s.css']),
          seite('/arbeiten-bei-uns/waermepumpen', ['/g.css', '/s.css', '/t.css']),
        ],
        lies,
      ),
    ).toEqual([]);
  });

  it('Befund 8: ein CSS-Preload auf irgendeiner Seite fällt durch, ebenso ein dritter Stylesheet auf einer Stellenseite', () => {
    const fehler = pruefeSeiten(
      [seite('/jobs', ['/g.css', '/s.css'], ['/fehler.css']), seite('/jobs/kundendienst', ['/g.css', '/s.css', '/x.css'])],
      lies,
    );
    expect(fehler).toHaveLength(2);
    expect(fehler[0]).toMatch(/^\/jobs: CSS-Preload \/fehler\.css/);
    expect(fehler[1]).toMatch(/^\/jobs\/kundendienst: 3 render-blockierende Stylesheets, höchstens 2/);
    expect(pruefeSeiten([seite('/', ['/g.css', '/s.css', '/x.css', '/t.css'])], lies)[0]).toMatch(/4 render-blockierende Stylesheets, höchstens 3/);
    // Die Bewerbungsmappe darf ihr Druckblatt dazu laden, mehr nicht
    expect(pruefeSeiten([seite('/bewerbung/mappe', ['/g.css', '/s.css', '/x.css', '/x.css'])], lies)).toEqual([]);
    expect(pruefeSeiten([seite('/bewerbung/mappe', ['/g.css', '/s.css', '/x.css', '/x.css', '/x.css'])], lies)[0]).toMatch(/höchstens 4/);
  });

  it('Befund 9: themen.module.css außerhalb der Themenseiten fällt durch, eine Themenseite ohne sie auch', () => {
    const fehler = pruefeSeiten([seite('/jobs', ['/g.css', '/t.css']), seite('/arbeiten-bei-uns', ['/g.css', '/s.css'])], lies);
    expect(fehler).toEqual([
      `/jobs: ${THEMEN.length} B aus themen.module.css render-blockierend, gehören nur auf die Themenseiten`,
      '/arbeiten-bei-uns: ohne die Regeln aus themen.module.css',
      'keine Themenseite geprüft',
    ]);
  });

  it('technik/dauer: über dem Budget fällt durch', () => {
    const gross = `.technik-module__uBmuTa__a{${'x:y;'.repeat(TECHNIK_BUDGET / 4)}}`;
    const fehler = pruefeSeiten([seite('/jobs', ['/gross.css'])], (href: string) => (href === '/gross.css' ? gross : lies(href)));
    expect(fehler).toEqual([`/jobs: ${gross.length} B aus technik/dauer, höchstens ${TECHNIK_BUDGET} B`]);
  });

  describe('Kopfzeichnungen der Stellen nur als Datei (Prüfung E-029, Runde 3, Leistung)', () => {
    const dateien = [
      { datei: 'anlagenschema-0123456789.svg', svg: anlagenschemaSvg() },
      { datei: 'hausschnitt-abcdef0123.svg', svg: hausschnittSvg() },
    ];
    const lang = (svg: string) => [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]).find((d) => d.length >= MERKMAL_LAENGE)!;
    const kopf = (art: string, datei: string, extra = '') =>
      `<div data-stelle-kopfbild="${art}"><img src="/zeichnung/${datei}" alt=""/></div>${extra}`;

    it('besteht, wenn die Stellen nur auf ihre Datei verweisen', () => {
      expect(
        pruefeKopfzeichnungen(
          [
            { route: '/jobs/anlagenmechaniker-shk-wetzlar', html: kopf('anlagenschema', dateien[0].datei) },
            { route: '/jobs/obermonteur-projektleiter-shk-wetzlar', html: kopf('hausschnitt', dateien[1].datei) },
            // Kundendienst: das Außengerät bleibt inline (am Handy sichtbar)
            { route: '/jobs/kundendiensttechniker-waermepumpe-wetzlar', html: '<div data-stelle-kopfbild="aussengeraet"><svg></svg></div>' },
          ],
          dateien,
        ),
      ).toEqual([]);
    });

    it('fällt durch, wenn die Zeichnung inline steht (Markup oder RSC-Nutzlast) oder die Datei fehlt', () => {
      // Stand Runde 3: Schema inline und in der RSC-Nutzlast (dort als JSON-Zeichenkette)
      const inline = `<svg><path d="${lang(dateien[0].svg)}"/></svg><script>self.__next_f.push([1,"\\"d\\":\\"${lang(dateien[0].svg)}\\""])</script>`;
      expect(pruefeKopfzeichnungen([{ route: '/jobs/ausbildung-anlagenmechaniker-shk-wetzlar', html: kopf('anlagenschema', dateien[0].datei, inline) }], dateien)).toEqual([
        '/jobs/ausbildung-anlagenmechaniker-shk-wetzlar: die Zeichnung aus anlagenschema-0123456789.svg steht inline im Dokument (HTML oder RSC)',
      ]);
      expect(pruefeKopfzeichnungen([{ route: '/jobs/obermonteur-projektleiter-shk-wetzlar', html: '<div data-stelle-kopfbild="hausschnitt"></div>' }], dateien)).toEqual([
        '/jobs/obermonteur-projektleiter-shk-wetzlar: verweist nicht auf /zeichnung/hausschnitt-abcdef0123.svg',
      ]);
      expect(pruefeKopfzeichnungen([{ route: '/jobs/x', html: kopf('hausschnitt', 'x.svg') }], [dateien[0]])).toEqual([
        '/jobs/x: keine gebaute Datei für hausschnitt',
        'keine Stellenseite mit Anlagenschema oder Hausschnitt im Kopf geprüft',
      ]);
      // Ohne lange Pfade fände die Prüfung nichts: Das fällt selbst durch
      expect(pruefeKopfzeichnungen([], [{ datei: 'leer-0000000000.svg', svg: '<svg><path d="M0 0H1"/></svg>' }])[0]).toMatch(/kein Pfad ab/);
      expect(pruefeKopfzeichnungen([], dateien)).toEqual(['keine Stellenseite mit Anlagenschema oder Hausschnitt im Kopf geprüft']);
    });
  });
});
