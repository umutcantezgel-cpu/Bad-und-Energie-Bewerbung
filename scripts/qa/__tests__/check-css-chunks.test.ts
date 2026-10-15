import { describe, expect, it } from 'vitest';
import { anlagenschemaSvg, hausschnittSvg } from '@/lib/zeichnung/kopf-svg';
import { BUERO_MARKE } from '../check-design-tokens.mjs';
import {
  BUERO_BUDGET,
  FRONT_BUDGET,
  FRONT_CSS,
  KOPF_ARTEN,
  MERKMAL_LAENGE,
  TECHNIK_BUDGET,
  WAERME_BUDGET,
  WAERME_CSS,
  WAERME_SEITEN,
  bueroBytes,
  modulBytes,
  pruefeBueroBlock,
  pruefeKopfzeichnungen,
  pruefeSeiten,
  quellenStand,
  routeVon,
  stylesheetsOf,
} from '../check-css-chunks.mjs';

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

  it('findet die Seiten in beiden Ablagen von next build, mit und ohne Deployment-Adapter (Vercel)', () => {
    const hash = 'f484ef78197dc75478738aa9f80c0f9c5bb20fd79fee4c396b364eb3e8000e27';
    expect(routeVon('app/index.html', '.html')).toBe('/');
    expect(routeVon('app/jobs/anlagenmechaniker-shk-wetzlar.html', '.html')).toBe('/jobs/anlagenmechaniker-shk-wetzlar');
    expect(routeVon(`route-cache/APP_PAGE/${hash}/$/index.html`, '.html')).toBe('/');
    expect(routeVon(`route-cache/APP_PAGE/${hash}/$/jobs/anlagenmechaniker-shk-wetzlar.html`, '.html')).toBe('/jobs/anlagenmechaniker-shk-wetzlar');
    expect(routeVon('app/zeichnung/anlagenschema-a998c27bff.svg.body', '.body')).toBe('/zeichnung/anlagenschema-a998c27bff.svg');
    expect(routeVon(`route-cache/APP_ROUTE/${hash}/$/zeichnung/anlagenschema-a998c27bff.svg.body`, '.body')).toBe('/zeichnung/anlagenschema-a998c27bff.svg');
    // Andere Endung, fremde Ablage oder unvollständiger Schlüssel: keine Seite
    expect(routeVon('app/jobs.rsc', '.html')).toBeNull();
    expect(routeVon('pages/404.html', '.html')).toBeNull();
    expect(routeVon('route-cache/APP_PAGE/jobs.html', '.html')).toBeNull();
  });

  it('fällt durch, wenn sie keine Seite findet, statt leer zu bestehen', () => {
    expect(pruefeSeiten([], lies)).toEqual(['keine vorab gerenderte Seite mit Stylesheet gefunden, die Prüfung liefe ins Leere']);
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
      // (Seit E-031 meldet die Prüfung zusätzlich jede gebaute Kopfdatei, die keine Stelle als Kopfbild nutzt.)
      expect(pruefeKopfzeichnungen([{ route: '/jobs/ausbildung-anlagenmechaniker-shk-wetzlar', html: kopf('anlagenschema', dateien[0].datei, inline) }], dateien)).toEqual([
        '/jobs/ausbildung-anlagenmechaniker-shk-wetzlar: die Zeichnung aus anlagenschema-0123456789.svg steht inline im Dokument (HTML oder RSC)',
        'hausschnitt-abcdef0123.svg: Kopfbild keiner Stellenseite',
      ]);
      expect(pruefeKopfzeichnungen([{ route: '/jobs/obermonteur-projektleiter-shk-wetzlar', html: '<div data-stelle-kopfbild="hausschnitt"></div>' }], dateien)).toEqual([
        '/jobs/obermonteur-projektleiter-shk-wetzlar: verweist nicht auf /zeichnung/hausschnitt-abcdef0123.svg',
        'anlagenschema-0123456789.svg: Kopfbild keiner Stellenseite',
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

  describe('Kopfbild buero (E-031): Datei wie Anlagenschema und Hausschnitt, jede gebaute Kopfdatei wird verwendet', () => {
    const lang = 'M0 0' + 'L10 10'.repeat(30);
    const dateien = [
      { datei: 'anlagenschema-0123456789.svg', svg: anlagenschemaSvg() },
      { datei: 'hausschnitt-abcdef0123.svg', svg: hausschnittSvg() },
      { datei: 'buero-fedcba9876.svg', svg: `<svg><path d="${lang}"/></svg>` },
    ];
    const kopf = (art: string, datei: string, extra = '') => `<div data-stelle-kopfbild="${art}"><img src="/zeichnung/${datei}" alt=""/></div>${extra}`;
    const alle = [
      { route: '/jobs/anlagenmechaniker-shk-wetzlar', html: kopf('anlagenschema', dateien[0].datei) },
      { route: '/jobs/obermonteur-projektleiter-shk-wetzlar', html: kopf('hausschnitt', dateien[1].datei) },
      { route: '/jobs/buerofachkraft-wetzlar', html: kopf('buero', dateien[2].datei) },
    ];

    it('kennt die drei Arten und besteht, wenn jede Stelle auf ihre Datei verweist', () => {
      expect([...KOPF_ARTEN]).toEqual(['anlagenschema', 'hausschnitt', 'buero']);
      expect(lang.length).toBeGreaterThanOrEqual(MERKMAL_LAENGE);
      expect(pruefeKopfzeichnungen(alle, dateien)).toEqual([]);
    });

    it('fällt durch: Büro-Zeichnung inline, Datei fehlt, gebaute Kopfdatei ohne Stelle', () => {
      expect(pruefeKopfzeichnungen([alle[0], alle[1], { route: alle[2].route, html: kopf('buero', dateien[2].datei, `<svg><path d="${lang}"/></svg>`) }], dateien)).toEqual([
        '/jobs/buerofachkraft-wetzlar: die Zeichnung aus buero-fedcba9876.svg steht inline im Dokument (HTML oder RSC)',
      ]);
      expect(pruefeKopfzeichnungen(alle, dateien.slice(0, 2))).toEqual(['/jobs/buerofachkraft-wetzlar: keine gebaute Datei für buero']);
      expect(pruefeKopfzeichnungen(alle.slice(0, 2), dateien)).toEqual(['buero-fedcba9876.svg: Kopfbild keiner Stellenseite']);
      expect(pruefeKopfzeichnungen(alle.slice(1), dateien)).toEqual(['anlagenschema-0123456789.svg: Kopfbild keiner Stellenseite']);
    });
  });
});

describe('check-css-chunks: Teilbudgets E-031 (Wärme, Wärmefront, Büro-Block)', () => {
  const WAERME = `.waerme-module__WrMe12__band{transform-origin:0 0}@keyframes waerme-module__WrMe12__wachsen{from{scale:.6}to{scale:1}}`;
  const FRONT = '.waermefront-module__Fr0nt1__front{position:fixed;inset:0}';
  const BUERO = '.themen-module__ZSQdQq__bueroPlan{display:grid}@keyframes themen-module__ZSQdQq__bueroGleiten{from{opacity:0}}';
  const BLAETTER: Record<string, string> = { '/g.css': GLOBAL, '/s.css': GEMEINSAM + WAERME + FRONT, '/t.css': THEMEN + BUERO, '/x.css': TECHNIK };
  const lesen = (href: string) => BLAETTER[href] ?? lies(href);
  const alle = { waerme: true, front: true, buero: true };
  const bau = [
    seite('/', ['/g.css', '/s.css', '/x.css']),
    seite('/jobs', ['/g.css', '/s.css']),
    seite('/arbeiten-bei-uns/buero-und-verwaltung', ['/g.css', '/s.css', '/t.css']),
  ];

  it('Budgets und Quellen', () => {
    expect([WAERME_BUDGET, FRONT_BUDGET, BUERO_BUDGET]).toEqual([1400, 1200, 2500]);
    expect(WAERME_CSS).toBe('components/zeichnung/waerme/waerme.module.css');
    expect(FRONT_CSS).toBe('components/site/waermefront/waermefront.module.css');
    expect([...WAERME_SEITEN]).toEqual(['/']);
    expect(modulBytes(WAERME, ['waerme'])).toBe(WAERME.length);
    // waermefront ist ein eigenes Modul, kein Teil von waerme
    expect(modulBytes(FRONT, ['waerme'])).toBe(0);
    expect(bueroBytes(THEMEN + BUERO)).toBe(BUERO.length);
    expect(bueroBytes(THEMEN)).toBe(0);
  });

  it('besteht mit allen Quellen im richtigen Zuschnitt', () => {
    expect(pruefeSeiten(bau, lesen, alle)).toEqual([]);
  });

  it('greift erst, wenn die Quelle existiert; ohne Quelle darf nichts davon im Build stehen', () => {
    // Heute (keine Quelle): der bisherige Zuschnitt besteht
    expect(pruefeSeiten([seite('/', ['/g.css', '/x.css']), seite('/jobs', ['/g.css'])], lies, {})).toEqual([]);
    const ohne = pruefeSeiten(bau, lesen, {});
    expect(ohne).toContain(`/: Regeln aus waerme.module.css ohne die Quelle ${WAERME_CSS}`);
    expect(ohne).toContain(`/jobs: Regeln aus waermefront.module.css ohne die Quelle ${FRONT_CSS}`);
    expect(ohne).toContain('/arbeiten-bei-uns/buero-und-verwaltung: Regeln des Büro-Blocks ohne den Block in components/themen/themen.module.css');
  });

  it('Wärme: über dem Budget oder auf der Startseite fehlend fällt durch', () => {
    const gross = `.waerme-module__WrMe12__a{${'x:y;'.repeat(WAERME_BUDGET / 4)}}`;
    expect(pruefeSeiten([seite('/jobs', ['/w.css'])], (h: string) => (h === '/w.css' ? gross : lesen(h)), { waerme: true })).toEqual([
      `/jobs: ${gross.length} B aus waerme.module.css, höchstens ${WAERME_BUDGET} B`,
    ]);
    expect(pruefeSeiten([seite('/', ['/g.css', '/x.css'])], lesen, { waerme: true })).toEqual(['/: ohne die Regeln aus waerme.module.css']);
  });

  it('Front: auf jeder Seite, im Budget und in einem Stylesheet, das alle Seiten laden', () => {
    const gross = `.waermefront-module__Fr0nt1__a{${'x:y;'.repeat(FRONT_BUDGET / 4)}}`;
    expect(pruefeSeiten([seite('/jobs', ['/f.css'])], (h: string) => (h === '/f.css' ? gross : lesen(h)), { front: true })).toEqual([
      `/jobs: ${gross.length} B aus waermefront.module.css, höchstens ${FRONT_BUDGET} B`,
    ]);
    expect(pruefeSeiten([seite('/jobs', ['/g.css'])], lesen, { front: true })).toEqual([
      '/jobs: ohne die Regeln aus waermefront.module.css (die Überlagerung gehört auf jede Seite)',
    ]);
    // je Seite ein anderes Stylesheet: nicht der globale Chunk
    const getrennt: Record<string, string> = { '/a.css': FRONT, '/b.css': FRONT };
    expect(pruefeSeiten([seite('/jobs', ['/a.css']), seite('/impressum', ['/b.css'])], (h: string) => getrennt[h], { front: true })).toEqual([
      'die Regeln aus waermefront.module.css stehen in keinem Stylesheet, das alle Seiten laden (globaler Chunk)',
    ]);
  });

  it('Büro-Block: nur auf Themenseiten, im Budget, und auf mindestens einer wirklich', () => {
    const fremd = pruefeSeiten([...bau, seite('/jobs/buerofachkraft-wetzlar', ['/g.css', '/t.css'])], lesen, alle);
    expect(fremd).toContain(`/jobs/buerofachkraft-wetzlar: ${BUERO.length} B aus dem Büro-Block, gehören nur auf die Themenseiten`);
    const gross = `.themen-module__ZSQdQq__bueroA{${'x:y;'.repeat(BUERO_BUDGET / 4)}}`;
    expect(pruefeSeiten([seite('/arbeiten-bei-uns/buero-und-verwaltung', ['/b.css'])], (h: string) => (h === '/b.css' ? THEMEN + gross : lesen(h)), { buero: true })).toEqual([
      `/arbeiten-bei-uns/buero-und-verwaltung: ${gross.length} B aus dem Büro-Block, höchstens ${BUERO_BUDGET} B`,
    ]);
    expect(pruefeSeiten([seite('/arbeiten-bei-uns', ['/g.css', '/t.css'])], lies, { buero: true })).toEqual(['der Büro-Block steht auf keiner Themenseite']);
  });

  it('Quelle des Büro-Blocks: Klassen und Keyframes ab der Marke beginnen mit buero, davor keine', () => {
    const gut = `.kasten { gap: 0.5rem; background: url(a.svg); }\n${BUERO_MARKE}: Leitstelle ═══ */\n.bueroPlan { scale: 1.25; }\n:global(.auftakt) .bueroBlatt {}\n@keyframes bueroGleiten { from { opacity: 0; } }\n`;
    expect(pruefeBueroBlock(gut)).toEqual([]);
    expect(pruefeBueroBlock(`${gut}.plan {}\n`)).toEqual(['components/themen/themen.module.css:6: plan im Büro-Block beginnt nicht mit buero']);
    expect(pruefeBueroBlock(`.bueroAlt {}\n${gut}`)).toEqual(['components/themen/themen.module.css:1: bueroAlt steht vor dem Büro-Block']);
    expect(pruefeBueroBlock(gut.replace('@keyframes bueroGleiten', '@keyframes gleiten'))).toEqual([
      'components/themen/themen.module.css:5: gleiten im Büro-Block beginnt nicht mit buero',
    ]);
  });

  it('der Stand der Quellen im Repo wird gelesen; themen.module.css hält die Regel', () => {
    const stand = quellenStand();
    expect(Object.keys(stand.vorhanden).sort()).toEqual(['buero', 'front', 'waerme']);
    expect(stand.fehler).toEqual([]);
  });
});
