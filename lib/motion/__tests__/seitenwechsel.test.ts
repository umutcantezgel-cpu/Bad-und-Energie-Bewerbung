import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARBEITEN_PATH, getThemen, themaPath } from '@/lib/themen/registry';
import { DAUER_MS, KLICK_ENDE_MS, MOTION_REGISTER, TAKT_MS, WECHSEL } from '../register';
import * as seitenwechsel from '../seitenwechsel';
import { AUFTAKT_KLASSE } from '../head-script';
import {
  AUFTAKT,
  BEDIENELEMENT,
  WAERMEFRONT_AN,
  ZEITPLAN,
  frontDurchmesser,
  frontSeite,
  frontZiel,
  imBewerbungsweg,
  klickPunkt,
  klickZiel,
  linkPfad,
  type FrontKlick,
  type FrontLink,
  type FrontOrt,
  type KlickElement,
} from '../seitenwechsel';

const ROOT = path.resolve(__dirname, '../../..');
const QUELLE = 'lib/motion/seitenwechsel.ts';

/** Ein einfacher Klick mit der linken Taste. */
const KLICK: FrontKlick = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };

/** Ein Link mit Attributen; `bereich` sind die Attribute der Vorfahren (für closest('[data-kein-front]')). */
function link(attribute: Record<string, string>, bereich: Record<string, string> = {}): FrontLink {
  return {
    getAttribute: (name) => attribute[name] ?? null,
    hasAttribute: (name) => name in attribute,
    closest: (selektor) => {
      const name = selektor.match(/^\[([\w-]+)\]$/)?.[1];
      if (!name) throw new Error(`unerwarteter Selektor ${selektor}`);
      return name in attribute || name in bereich ? {} : null;
    },
  };
}

const ort = (pfad: string, origin = 'https://karriere.example'): FrontOrt => ({ href: `${origin}${pfad}`, origin, pathname: pfad });

/** Öffnende JSX-Tags einer Komponente samt Props (Klammern und Zeichenketten in Props, auch `=>`, beenden ihn nicht). */
function jsxTags(src: string, name: string): string[] {
  const tags: string[] = [];
  for (const m of src.matchAll(new RegExp(`<${name}\\b`, 'g'))) {
    let tiefe = 0;
    let zeichen: string | null = null;
    for (let i = m.index + name.length + 1; i < src.length; i += 1) {
      const c = src[i];
      if (zeichen) {
        if (c === zeichen && src[i - 1] !== '\\') zeichen = null;
      } else if (c === '"' || c === "'" || c === '`') zeichen = c;
      else if (c === '{') tiefe += 1;
      else if (c === '}') tiefe -= 1;
      else if (c === '>' && tiefe === 0) {
        tags.push(src.slice(m.index, i + 1));
        break;
      }
    }
  }
  return tags;
}

/** Die Seitenmuster unter app/ (page.tsx), [segment] als Platzhalter. */
function seitenmuster(): string[] {
  const out: string[] = [];
  const lauf = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = path.join(dir, name);
      if (statSync(p).isDirectory()) {
        if (!name.startsWith('_') && name !== '__tests__') lauf(p);
      } else if (name === 'page.tsx') {
        const rel = path.relative(path.join(ROOT, 'app'), dir).split(path.sep).join('/');
        out.push(rel ? `/${rel}` : '/');
      }
    }
  };
  lauf(path.join(ROOT, 'app'));
  return out.sort();
}

/**
 * Erzählseiten nach KERN K-011 (1.3): Ziele der Wärmefront. Jede Seite unter app/ muss hier eingeordnet sein; eine
 * neue Seite lässt diese Prüfung scheitern, bis sie entschieden ist.
 */
const EINORDNUNG: Readonly<Record<string, boolean>> = {
  '/': true,
  '/arbeiten-bei-uns': true,
  '/arbeiten-bei-uns/[thema]': true,
  '/einsatzgebiet': true,
  '/einsatzgebiet/[slug]': true,
  '/jobs/[slug]': true,
  '/jobs': false,
  '/bewerbung': false,
  '/bewerbung/danke': false,
  '/bewerbung/mappe': false,
  '/datenschutz': false,
  '/impressum': false,
};

describe('Wärmefront: Zeitplan und Notschalter (E-031)', () => {
  it('der Zeitplan spiegelt das Register (WECHSEL, KLICK_ENDE_MS); die Netze greifen einen Takt nach dem Ende', () => {
    expect(ZEITPLAN.abdecken).toBe(WECHSEL.abdeckenMs);
    expect(ZEITPLAN.halten).toBe(WECHSEL.haltenMs);
    expect(ZEITPLAN.aufdecken).toBe(WECHSEL.aufdeckenMs);
    expect(ZEITPLAN.klick).toBe(KLICK_ENDE_MS);
    expect(ZEITPLAN.abdeckenNetz).toBe(ZEITPLAN.abdecken + TAKT_MS);
    expect(ZEITPLAN.aufdeckenNetz).toBe(ZEITPLAN.aufdecken + TAKT_MS);
    // Abdecken = letztes Band (Verzögerung) + d-2; Halten deckt Abdecken, Netz und Aufdecken
    const w = MOTION_REGISTER.seitenwechsel;
    expect(Math.max(...w.verzoegerungTakte) * TAKT_MS + DAUER_MS['d-2']).toBe(ZEITPLAN.abdecken);
    expect(ZEITPLAN.halten).toBeGreaterThan(ZEITPLAN.abdeckenNetz - ZEITPLAN.abdecken + ZEITPLAN.aufdeckenNetz);
    expect(Object.isFrozen(ZEITPLAN)).toBe(true);
    expect(Object.keys(ZEITPLAN).sort()).toEqual(['abdecken', 'abdeckenNetz', 'aufdecken', 'aufdeckenNetz', 'halten', 'klick']);
  });

  it('die Logik hängt an nichts (das Register bliebe sonst im Browser-Bündel der Insel)', () => {
    const src = readFileSync(path.join(ROOT, QUELLE), 'utf8');
    expect([...src.matchAll(/^\s*import\b|from\s+['"]/gm)]).toEqual([]);
    expect(src).toMatch(/^export const WAERMEFRONT_AN: boolean = (?:true|false);$/m);
    expect(typeof WAERMEFRONT_AN).toBe('boolean');
  });

  it('Notschalter: aus lässt jeden Link ohne Front wechseln, die Klick-Wärme bleibt; an läuft die Front', async () => {
    const { build } = await import('rolldown');
    const bauen = async (an: boolean) => {
      const ergebnis = await build({
        input: path.join(ROOT, QUELLE),
        write: false,
        output: { format: 'cjs' },
        plugins: [
          {
            name: 'notschalter',
            load(id: string) {
              if (!id.endsWith(QUELLE)) return null;
              const src = readFileSync(id, 'utf8');
              const neu = src.replace(/^export const WAERMEFRONT_AN: boolean = (?:true|false);$/m, `export const WAERMEFRONT_AN: boolean = ${an};`);
              if (neu === src && !src.includes(`WAERMEFRONT_AN: boolean = ${an};`)) throw new Error('Notschalter nicht gefunden');
              return { code: neu, moduleType: 'ts' };
            },
          },
        ],
      });
      const modul = { exports: {} as typeof seitenwechsel };
      new Function('module', 'exports', ergebnis.output[0].code)(modul, modul.exports);
      return modul.exports;
    };
    const knopf: KlickElement = { closest: (s) => (s === BEDIENELEMENT ? knopf : null), getAttribute: () => null };
    for (const an of [true, false]) {
      const m = await bauen(an);
      expect(m.WAERMEFRONT_AN).toBe(an);
      expect(m.frontZiel(KLICK, link({ href: '/arbeiten-bei-uns' }), ort('/')), `an = ${an}`).toBe(an ? '/arbeiten-bei-uns' : null);
      expect(m.klickZiel(knopf, '/'), `an = ${an}`).toBe(knopf);
      expect(m.frontSeite('/'), `an = ${an}`).toBe(true);
    }
  }, 30_000);
});

describe('Wärmefront: Ziele nur Erzählseiten (KERN K-011)', () => {
  it('jede Seite unter app/ ist eingeordnet; die Front führt genau zu den Erzählseiten', () => {
    expect(seitenmuster()).toEqual(Object.keys(EINORDNUNG).sort());
    for (const [muster, erzaehl] of Object.entries(EINORDNUNG)) {
      const pfad = muster.replace(/\[[^\]]+\]/g, 'beispiel-seite');
      expect(frontSeite(pfad), muster).toBe(erzaehl);
    }
  });

  it('ausgenommen: Schnittstellen, Feeds, Zeichnungen, Next-Dateien, Dateiendungen, Bewerbungsweg, tiefe Stellenpfade', () => {
    for (const pfad of [
      '/api/status',
      '/api',
      '/feeds/indeed.xml',
      '/feeds/generic',
      '/zeichnung/hausschnitt-0123456789.svg',
      '/_next/static/chunks/x.js',
      '/sitemap.xml',
      '/llms.txt',
      '/einsatzgebiet/karte.pdf',
      '/arbeiten-bei-uns/gehalt.png',
      '/jobs/anlagenmechaniker-shk-wetzlar/opengraph-image',
      '/jobs/',
      '/bewerbung',
      '/bewerbungstipps',
      '/impressum',
      '/einsatzgebietx',
      '//fremd.example/jobs/x',
    ]) {
      expect(frontSeite(pfad), pfad).toBe(false);
    }
    expect(imBewerbungsweg('/bewerbung/mappe')).toBe(true);
    expect(imBewerbungsweg('/jobs')).toBe(false);
  });

  it('jede Themenseite aus der Registry ist Ziel, auch „Büro und Verwaltung“ (E-031): vom Hub und von Thema zu Thema', () => {
    const themen = getThemen();
    expect(themen.map((thema) => thema.id)).toContain('buero-und-verwaltung');
    for (const thema of themen) {
      const pfad = themaPath(thema);
      expect(frontSeite(pfad), pfad).toBe(true);
      expect(frontZiel(KLICK, link({ href: pfad }), ort(ARBEITEN_PATH)), pfad).toBe(pfad);
      for (const anderes of themen.filter((x) => x.id !== thema.id)) {
        expect(frontZiel(KLICK, link({ href: pfad }), ort(themaPath(anderes))), `${themaPath(anderes)} → ${pfad}`).toBe(pfad);
      }
    }
  });
});

describe('Wärmefront: Linkfilter (E-031)', () => {
  it('ein einfacher Klick auf einen Link zu einer Erzählseite: Ziel mit Suche und Anker', () => {
    expect(frontZiel(KLICK, link({ href: '/arbeiten-bei-uns/waermepumpen' }), ort('/'))).toBe('/arbeiten-bei-uns/waermepumpen');
    expect(frontZiel(KLICK, link({ href: '/jobs/anlagenmechaniker-shk-wetzlar?quelle=x#gehalt' }), ort('/jobs'))).toBe(
      '/jobs/anlagenmechaniker-shk-wetzlar?quelle=x#gehalt',
    );
    expect(frontZiel(KLICK, link({ href: '/' }), ort('/impressum'))).toBe('/');
    expect(frontZiel(KLICK, link({ href: '/#bewerben' }), ort('/jobs/anlagenmechaniker-shk-wetzlar'))).toBe('/#bewerben');
    // relativ und absolut auf derselben Herkunft
    expect(frontZiel(KLICK, link({ href: 'waermepumpen' }), ort('/arbeiten-bei-uns/gehalt'))).toBe('/arbeiten-bei-uns/waermepumpen');
    expect(frontZiel(KLICK, link({ href: 'https://karriere.example/einsatzgebiet' }), ort('/'))).toBe('/einsatzgebiet');
    expect(frontZiel(KLICK, link({ href: '/einsatzgebiet', target: '_self' }), ort('/'))).toBe('/einsatzgebiet');
    expect(frontZiel(KLICK, link({ href: '/einsatzgebiet', target: '' }), ort('/'))).toBe('/einsatzgebiet');
  });

  it('nur linke Taste ohne Zusatztaste und nur, wenn niemand den Klick abgefangen hat', () => {
    const a = link({ href: '/einsatzgebiet' });
    for (const anders of [
      { button: 1 },
      { button: 2 },
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { defaultPrevented: true },
    ]) {
      expect(frontZiel({ ...KLICK, ...anders }, a, ort('/')), JSON.stringify(anders)).toBeNull();
    }
  });

  it('nicht bei anderem Fenster, download, data-kein-front (Links mit replace oder scroll={false}), ohne href', () => {
    expect(frontZiel(KLICK, link({ href: '/einsatzgebiet', target: '_blank' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '/einsatzgebiet', target: 'karte' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '/einsatzgebiet', download: '' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '/einsatzgebiet', 'data-kein-front': '' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '/einsatzgebiet' }, { 'data-kein-front': '' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({}), ort('/'))).toBeNull();
  });

  it('nicht nach außen, nicht nur Anker oder Suche, nicht zu Arbeitsseiten, nicht aus dem Bewerbungsweg', () => {
    expect(frontZiel(KLICK, link({ href: 'https://fremd.example/jobs/x' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '//fremd.example/' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: 'mailto:info@example.org' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: 'tel:+4964411234' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: 'javascript:void(0)' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: 'http://karriere.example/einsatzgebiet' }), ort('/'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '#main' }), ort('/einsatzgebiet'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '/einsatzgebiet#karte' }), ort('/einsatzgebiet'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '/einsatzgebiet?kreis=x' }), ort('/einsatzgebiet'))).toBeNull();
    for (const ziel of ['/jobs', '/bewerbung', '/bewerbung/mappe', '/impressum', '/datenschutz', '/feeds/indeed.xml', '/zeichnung/x.svg']) {
      expect(frontZiel(KLICK, link({ href: ziel }), ort('/')), ziel).toBeNull();
    }
    expect(frontZiel(KLICK, link({ href: '/' }), ort('/bewerbung'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '/jobs/anlagenmechaniker-shk-wetzlar' }), ort('/bewerbung/danke'))).toBeNull();
    expect(frontZiel(KLICK, link({ href: '/' }), { href: 'nicht eine Adresse', origin: 'null', pathname: '/' })).toBeNull();
  });

  it('der Prüfer findet Link-Tags samt Props, auch mit Pfeilfunktionen', () => {
    const tags = jsxTags('<Link href="/a" onClick={() => x > 1} replace>a</Link> <Linkliste /> <Link\n  scroll={false}\n  href={`/b`}>', 'Link');
    expect(tags).toEqual(['<Link href="/a" onClick={() => x > 1} replace>', '<Link\n  scroll={false}\n  href={`/b`}>']);
  });

  it('kein Link der Seite nutzt replace, scroll={false} oder onNavigate ohne data-kein-front (die Front änderte sonst ihr Verhalten)', () => {
    const treffer: string[] = [];
    const lauf = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (name === 'node_modules' || name === '__tests__' || name.startsWith('.')) continue;
        if (statSync(p).isDirectory()) lauf(p);
        else if (name.endsWith('.tsx')) {
          const src = readFileSync(p, 'utf8');
          for (const tag of jsxTags(src, 'Link')) {
            if (/\sreplace(?:[\s/>=])|\sscroll=\{\s*false\s*\}|\sonNavigate=/.test(tag) && !/data-kein-front/.test(tag)) {
              treffer.push(`${path.relative(ROOT, p)}: ${tag}`);
            }
          }
        }
      }
    };
    for (const dir of ['app', 'components']) lauf(path.join(ROOT, dir));
    expect(treffer).toEqual([]);
  });
});

describe('Klick-Wärme: Ziel und Punkt (E-031)', () => {
  /** Ein Element mit Vorfahren: `art` ist sein Bedienelement-Typ oder null, `inForm` und `aria` steuern closest/getAttribute. */
  function element(art: 'bedien' | null, { inForm = false, aria = null as string | null } = {}): KlickElement {
    const el: KlickElement = {
      closest: (s) => {
        if (s === BEDIENELEMENT) return art ? el : null;
        if (s === 'form') return inForm ? el : null;
        throw new Error(`unerwarteter Selektor ${s}`);
      },
      getAttribute: (name) => (name === 'aria-disabled' ? aria : null),
    };
    return el;
  }

  it('nur an Bedienelementen, nicht in Formularen, nicht deaktiviert, nicht im Bewerbungsweg', () => {
    expect(BEDIENELEMENT).toBe('a[href],button,summary,[role="button"]');
    const knopf = element('bedien');
    expect(klickZiel(knopf, '/')).toBe(knopf);
    expect(klickZiel(knopf, '/jobs')).toBe(knopf);
    expect(klickZiel(element(null), '/')).toBeNull();
    expect(klickZiel(null, '/')).toBeNull();
    expect(klickZiel(element('bedien', { inForm: true }), '/')).toBeNull();
    expect(klickZiel(element('bedien', { aria: 'true' }), '/')).toBeNull();
    expect(klickZiel(element('bedien', { aria: 'false' }), '/')).not.toBeNull();
    for (const pfad of ['/bewerbung', '/bewerbung/danke', '/bewerbung/mappe']) expect(klickZiel(knopf, pfad), pfad).toBeNull();
  });

  it('nicht auf dem Weg in den Bewerbungsweg: Links nach /bewerbung* zeigen keine Klick-Wärme (Prüfrunde 1 C1-3)', () => {
    const knopf = element('bedien');
    for (const ziel of ['/bewerbung', '/bewerbung/mappe', '/bewerbungsweg']) expect(klickZiel(knopf, '/', ziel), ziel).toBeNull();
    for (const ziel of ['/', '/jobs', '/arbeiten-bei-uns/buero-und-verwaltung', null]) expect(klickZiel(knopf, '/jobs', ziel), String(ziel)).toBe(knopf);
    // Der Pfad des Links: nur auf derselben Herkunft, relativ aufgelöst, ohne Suche und Anker
    const hier = ort('/jobs/anlagenmechaniker-shk-wetzlar');
    expect(linkPfad(link({ href: '/bewerbung?stelle=anlagenmechaniker-shk#start' }), hier)).toBe('/bewerbung');
    expect(linkPfad(link({ href: '../bewerbung' }), hier)).toBe('/bewerbung');
    expect(linkPfad(link({ href: '#faq' }), hier)).toBe('/jobs/anlagenmechaniker-shk-wetzlar');
    expect(linkPfad(link({ href: 'https://wa.me/49123' }), hier)).toBeNull();
    expect(linkPfad(link({ href: 'http://[' }), hier)).toBeNull();
    expect(linkPfad(link({}), hier)).toBeNull();
  });

  it('die Klasse des Auftakts ist die des Kopfskripts (die Insel nimmt sie beim Seitenwechsel weg, Prüfrunde 1 C1-2)', () => {
    expect(AUFTAKT).toBe(AUFTAKT_KLASSE);
    const insel = readFileSync(path.join(ROOT, 'components/site/waermefront/Waermefront.tsx'), 'utf8');
    // vor dem Malen der neuen Seite (useLayoutEffect, nicht beim Hydrieren) und unter der deckenden Front vor router.push
    expect(insel).toMatch(/useLayoutEffect\(\(\) => \{\s*if \(vorher\.current === pfad\) return;\s*vorher\.current = pfad;\s*document\.documentElement\.classList\.remove\(AUFTAKT\);/);
    expect(insel).toMatch(/document\.documentElement\.classList\.remove\(AUFTAKT\);\s*router\.push\(ziel\);/);
  });

  it('am Zeiger; mit der Tastatur (detail 0) in der Mitte des Elements', () => {
    const box = { left: 100, top: 40, width: 120, height: 44 };
    expect(klickPunkt({ detail: 1, clientX: 130, clientY: 60 }, box)).toEqual([130, 60]);
    expect(klickPunkt({ detail: 2, clientX: 5, clientY: 6 }, box)).toEqual([5, 6]);
    expect(klickPunkt({ detail: 0, clientX: 0, clientY: 0 }, box)).toEqual([160, 62]);
  });
});

describe('Wärmefront: Durchmesser bis zur fernsten Ecke', () => {
  it('der Kreis deckt das ganze Fenster, mit höchstens 2 px Zugabe', () => {
    expect(frontDurchmesser(0, 0, 100, 50)).toBe(2 * Math.ceil(Math.hypot(100, 50)) + 2);
    expect(frontDurchmesser(50, 25, 100, 50)).toBe(2 * Math.ceil(Math.hypot(50, 25)) + 2);
    const fenster: [number, number][] = [
      [390, 844],
      [1440, 900],
      [1920, 1080],
    ];
    for (const [b, h] of fenster) {
      for (const [x, y] of [
        [0, 0],
        [b, h],
        [b / 3, h / 5],
        [b - 1, 1],
        [12.5, h - 7.25],
      ]) {
        const r = frontDurchmesser(x, y, b, h) / 2;
        const ecken = [Math.hypot(x, y), Math.hypot(b - x, y), Math.hypot(x, h - y), Math.hypot(b - x, h - y)];
        expect(r, `${b}×${h} @ ${x},${y}`).toBeGreaterThanOrEqual(Math.max(...ecken));
        expect(r - Math.max(...ecken)).toBeLessThanOrEqual(2);
        expect(Number.isInteger(2 * r)).toBe(true);
      }
    }
  });
});
