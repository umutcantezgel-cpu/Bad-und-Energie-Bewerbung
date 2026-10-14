import { describe, expect, it } from 'vitest';
import { TECHNIK_BUDGET, modulBytes, pruefeSeiten, stylesheetsOf } from '../check-css-chunks.mjs';

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
});
