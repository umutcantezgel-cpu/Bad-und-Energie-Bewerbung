import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARBEITEN_PATH, getThemen, themaPath } from '@/lib/themen/registry';
import { DAUER_MS, KLICK_ENDE_MS, MOTION_REGISTER, TAKT_MS, WECHSEL } from '../register';
import * as seitenwechsel from '../seitenwechsel';
import { AUFTAKT_KLASSE } from '../head-script';
import {
  AUFDECKEN_NETZ_MS,
  AUFTAKT,
  BEDIENELEMENT,
  FRONT_SCHICHTEN,
  FRONT_START,
  RING_START,
  HALTEN_MS,
  KLICK_ZU_MS,
  RUHE_MS,
  WAERMEFRONT_AN,
  WECHSEL_NETZ_MS,
  ZEITPLAN,
  FRONT_GRUND,
  RUHE_BILDER,
  FRONT_SELEKTOR,
  nachDerFront,
  frontDurchmesser,
  frontMass,
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
  it('der Zeitplan spiegelt das Register (WECHSEL, KLICK_ENDE_MS); die Netze greifen nach dem Ende', () => {
    expect(ZEITPLAN.vorlauf).toBe(WECHSEL.vorlaufMs);
    expect(ZEITPLAN.wechsel).toBe(WECHSEL.wechselMs);
    expect(ZEITPLAN.abdecken).toBe(WECHSEL.abdeckenMs);
    expect(ZEITPLAN.halten).toBe(WECHSEL.haltenMs);
    expect(ZEITPLAN.ruhe).toBe(WECHSEL.ruheMs);
    expect(ZEITPLAN.aufdecken).toBe(WECHSEL.aufdeckenMs);
    expect(ZEITPLAN.klick).toBe(KLICK_ENDE_MS);
    // Das Netz des Wechsels zwei Takte nach der Deckung: Die Abläufe beginnen erst nach dem Rastern der Ebenen (gemessen
    // bis 100 ms nach dem Klick); früher griffe es, bevor die Seitenfarbe das Fenster deckt
    expect(ZEITPLAN.wechselNetz).toBe(ZEITPLAN.wechsel + 2 * TAKT_MS);
    expect(ZEITPLAN.wechselNetz - ZEITPLAN.wechsel).toBeGreaterThanOrEqual(100);
    expect(ZEITPLAN.aufdeckenNetz).toBe(ZEITPLAN.aufdecken + TAKT_MS);
    expect(ZEITPLAN.klickNetz).toBe(ZEITPLAN.klick + TAKT_MS);
    // Owner-Feedback 16.10.2026 (sanfter Wärmeschleier statt Blitz): abdecken 650–750 ms, aufdecken 450–550 ms,
    // zusammen ohne Warten 1,1–1,3 s
    expect(ZEITPLAN.abdecken).toBeGreaterThanOrEqual(650);
    expect(ZEITPLAN.abdecken).toBeLessThanOrEqual(750);
    expect(ZEITPLAN.aufdecken).toBeGreaterThanOrEqual(450);
    expect(ZEITPLAN.aufdecken).toBeLessThanOrEqual(550);
    expect(ZEITPLAN.abdecken + ZEITPLAN.aufdecken).toBeGreaterThanOrEqual(1100);
    expect(ZEITPLAN.abdecken + ZEITPLAN.aufdecken).toBeLessThanOrEqual(1300);
    // Die Seite wechselt erst, wenn die Seitenfarbe deckt: nie unter einem durchscheinenden Schleier
    expect(ZEITPLAN.wechsel).toBe(ZEITPLAN.abdecken);
    // Vorlauf ein Takt (die Schichten blenden in der Startgröße ein), dann d-4 Wachsen; zugleich endet das Einblenden der
    // Seitenfarbe (späteste Verzögerung + d-2): Das Ende der letzten Schicht ist die Deckung
    const w = MOTION_REGISTER.seitenwechsel;
    expect(ZEITPLAN.vorlauf).toBe(TAKT_MS);
    expect(ZEITPLAN.vorlauf).toBeGreaterThan(2 * (1000 / 60));
    expect(ZEITPLAN.vorlauf + DAUER_MS['d-4']).toBe(ZEITPLAN.abdecken);
    expect(Math.max(...w.verzoegerungTakte) * TAKT_MS + DAUER_MS['d-2']).toBe(ZEITPLAN.abdecken);
    // Aufdecken: ein Takt + d-3 (Verblassen der Front und Steigen des Hauptinhalts); Klick-Wärme: d-2 + ein Takt + d-3
    expect(TAKT_MS + DAUER_MS['d-3']).toBe(ZEITPLAN.aufdecken);
    expect(DAUER_MS['d-2'] + TAKT_MS + DAUER_MS['d-3']).toBe(ZEITPLAN.klick);
    // Prüfrunde 5 C5-2: Nach dem neuen Pfad wartet die Front höchstens vier Takte auf die Ruhe der Seite; Halten (ab dem
    // Wechsel, ohne neuen Pfad) deckt Ruhe und Aufdecken mit Netz
    expect(ZEITPLAN.ruhe).toBeLessThanOrEqual(4 * TAKT_MS);
    expect(ZEITPLAN.halten).toBeGreaterThan(ZEITPLAN.ruhe + ZEITPLAN.aufdeckenNetz);
    expect(Object.isFrozen(ZEITPLAN)).toBe(true);
    expect(Object.keys(ZEITPLAN).sort()).toEqual(['abdecken', 'aufdecken', 'aufdeckenNetz', 'halten', 'klick', 'klickNetz', 'ruhe', 'vorlauf', 'wechsel', 'wechselNetz']);
    // Die Insel nimmt die Einzelwerte (das Objekt bliebe sonst ganz im Bündel)
    expect([WECHSEL_NETZ_MS, HALTEN_MS, RUHE_MS, AUFDECKEN_NETZ_MS, KLICK_ZU_MS]).toEqual([
      ZEITPLAN.wechselNetz,
      ZEITPLAN.halten,
      ZEITPLAN.ruhe,
      ZEITPLAN.aufdeckenNetz,
      ZEITPLAN.klickNetz,
    ]);
    const insel = readFileSync(path.join(ROOT, 'components/site/waermefront/Waermefront.tsx'), 'utf8');
    expect(insel).not.toMatch(/ZEITPLAN/);
  });

  it('Startgröße (Owner-Feedback 16.10.2026): kein winziger Punkt; Schleier und Seitenfarbe beginnen bei 12–18 % der Fensterdiagonale (@keyframes w ab --z), die Ringe bei mindestens der Hälfte (@keyframes r ab RING_START)', () => {
    expect(FRONT_START).toBeGreaterThanOrEqual(0.12);
    expect(FRONT_START).toBeLessThanOrEqual(0.18);
    // Von unten nach oben: der Schleier (1,12 · 1,08) bis über die Ecke, die Ringe (0,855 · 0,66 · 0,43) im Fenster, nach
    // innen enger, zuletzt die Seitenfarbe genau bis zur Ecke (Owner-Feedback 16.10.2026 (2), Art Director: der satte
    // innerste kleiner)
    expect([...FRONT_SCHICHTEN]).toEqual([1.12, 1.08, 0.855, 0.66, 0.43, 1]);
    expect(Object.isFrozen(FRONT_SCHICHTEN)).toBe(true);
    const ZUM_START = [0, 1, 5];
    const RINGE = [2, 3, 4];
    expect(RING_START).toBeGreaterThan(0);
    expect(RING_START).toBeLessThan(0.25);
    for (const [b, h] of [
      [390, 844],
      [1440, 900],
      [1920, 1080],
      [2560, 1440],
    ] as const) {
      const diagonale = Math.hypot(b, h);
      for (const [x, y] of [
        [0, 0],
        [b / 2, h / 2],
        [b, h],
        [b * 0.3, 40],
        [b - 10, h - 10],
      ]) {
        const [grund, faktor, start] = frontMass(x, y, b, h);
        const wo = `${b}×${h} @ ${x},${y}`;
        for (const i of ZUM_START) {
          const anteil = (grund * start * FRONT_SCHICHTEN[i]) / diagonale;
          expect(anteil, wo).toBeGreaterThanOrEqual(0.12);
          expect(anteil, wo).toBeLessThanOrEqual(0.18);
        }
        // Ringe: Start RING_START ihrer Endgröße (Faktor bis zur Ecke); nie ein Punkt, nie größer als FRONT_START × 2
        for (const i of RINGE) {
          const anteil = (grund * faktor * RING_START * FRONT_SCHICHTEN[i]) / diagonale;
          expect(anteil, wo).toBeGreaterThanOrEqual(FRONT_START / 2);
          expect(anteil, wo).toBeLessThanOrEqual(2 * FRONT_START);
          expect(grund * faktor * RING_START * FRONT_SCHICHTEN[i], wo).toBeGreaterThan(50);
        }
        // Sie wächst (Start kleiner als der Faktor bis zur Ecke) und hat von Anfang an Fläche (Prüfrunde 4 A4-3)
        expect(start, wo).toBeGreaterThan(0);
        expect(start, wo).toBeLessThan(faktor);
        expect(grund * start, wo).toBeGreaterThan(50);
      }
    }
    const css = readFileSync(path.join(ROOT, 'components/site/waermefront/waermefront.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/@keyframes w \{\s*from \{\s*scale: var\(--z\);\s*\}\s*\}/);
    expect(css).toMatch(new RegExp(`@keyframes r \\{\\s*from \\{\\s*scale: ${RING_START};`));
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

describe('Wärmefront: immer ein Kreis, kleine Ebenen (Prüfrunde 2 A2-1, C2-2, C2-3)', () => {
  const css = readFileSync(path.join(ROOT, 'components/site/waermefront/waermefront.module.css'), 'utf8');
  const theme = readFileSync(path.join(ROOT, 'app/styles/theme.css'), 'utf8');
  const radiusVoll = Number(theme.match(/--radius-voll: (\d+)px;/)![1]);

  it('Klick in jede Ecke bei 1440 × 900 (und anderen Fenstern): Grundgröße höchstens 2 × --radius-voll, der Radius ist mindestens die halbe Breite; Grundgröße × Faktor erreicht die fernste Ecke', () => {
    expect(css).toMatch(/border-radius: var\(--radius-voll\);/);
    expect(FRONT_GRUND).toBeLessThanOrEqual(2 * radiusVoll);
    for (const [b, h] of [
      [1440, 900],
      [1920, 1080],
      [2560, 1440],
      [390, 844],
    ] as const) {
      for (const [x, y] of [
        [0, 0],
        [b, 0],
        [0, h],
        [b, h],
        [b / 2, h / 2],
        [410, 490],
      ] as const) {
        const [grund, faktor] = frontMass(x, y, b, h);
        const wo = `${b}×${h} @ ${x},${y}`;
        // Gezeichneter Radius (--radius-voll, auf die halbe Breite begrenzt) ist die halbe Breite: ein Kreis
        expect(Math.min(radiusVoll, grund / 2), wo).toBeGreaterThanOrEqual(grund / 2);
        expect(grund, wo).toBeLessThanOrEqual(FRONT_GRUND);
        expect(faktor, wo).toBeGreaterThanOrEqual(1);
        expect(grund * faktor, wo).toBeCloseTo(frontDurchmesser(x, y, b, h), 6);
        const ecke = Math.max(Math.hypot(x, y), Math.hypot(b - x, y), Math.hypot(x, h - y), Math.hypot(b - x, h - y));
        expect((grund * faktor) / 2, wo).toBeGreaterThanOrEqual(ecke);
      }
    }
    // Die Ebene einer Scheibe misst höchstens FRONT_GRUND² statt bis zu 3.400² px (1440 × 900, Klick in die Ecke)
    expect(frontDurchmesser(0, 0, 1440, 900)).toBeGreaterThan(2 * radiusVoll);
    expect(frontMass(0, 0, 1440, 900)[0]).toBe(FRONT_GRUND);
    // Auch die größte, äußere Schicht (1,12 × Grundgröße) ist gezeichnet noch ein Kreis
    expect(Math.max(...FRONT_SCHICHTEN)).toBe(FRONT_SCHICHTEN[0]);
    expect(FRONT_SCHICHTEN[0] * FRONT_GRUND).toBeLessThanOrEqual(2 * radiusVoll);
  });

  it('die Insel setzt Mittelpunkt, Grundgröße (--s), Faktor (--m, scale je Schicht) und Startmaßstab (--z) der Front; der Klick-Wärme die Box des Elements', () => {
    const insel = readFileSync(path.join(ROOT, 'components/site/waermefront/Waermefront.tsx'), 'utf8');
    expect(insel).toContain('const [grund, faktor, start] = frontMass(x, y, innerWidth, innerHeight);');
    expect(insel).toContain('zeige(front, `--x:${x}px;--y:${y}px;--s:${grund}px;--m:${faktor};--z:${start}`);');
    // Klick-Wärme (Prüfrunde 5 A5-4): um die Box des Elements, nicht am Zeiger
    expect(insel).toContain('zeige(klick, `--x:${box.left + box.width / 2}px;--y:${box.top + box.height / 2}px;--w:${box.width}px;--h:${box.height}px`);');
    expect(insel.match(/cssText/g)).toHaveLength(1);
  });
});

describe('Wärmefront: Aufdecken (Prüfrunde 3 A3-2, C3-1; Prüfrunde 5 C5-2; Owner-Feedback 16.10.2026)', () => {
  const insel = readFileSync(path.join(ROOT, 'components/site/waermefront/Waermefront.tsx'), 'utf8');

  it('die Front verblasst als Ganzes (data-auf), <main> steigt an seinen Platz (.a); unter der Deckung wird <main> eine Ebene (.h)', () => {
    expect(insel).toMatch(/front\.dataset\.auf = '';\s*haupt\.add\(styles\.a\);/);
    expect(insel).toMatch(/if \(phase !== WARTEN\) return;\s*haupt\.add\(styles\.h\);/);
    // Zu, sobald die Front verblasst ist (der einzige Übergang der Front), sonst nach dem Netz; dabei gibt <main> seine
    // Ebene wieder ab
    expect(insel).toContain("front.addEventListener('transitionend', aus);");
    expect(insel).toContain('uhr = setTimeout(aus, AUFDECKEN_NETZ_MS);');
    expect(insel).toMatch(/haupt\.remove\(styles\.h, styles\.a\);\s*zu\(front\);/);
    // Gewechselt wird am Ende der letzten Schicht (die Seitenfarbe deckt), nicht vorher
    expect(insel).toContain('if (event.target === front.lastElementChild) wechseln();');
    expect(insel).toContain('uhr = setTimeout(wechseln, WECHSEL_NETZ_MS);');
  });

  it('aufgedeckt wird in Ruhe: RUHE_BILDER Bilder ohne Änderung, ladendes Bild und endlichen Ablauf, höchstens `ruhe` nach dem neuen Pfad; nachladende Bereiche wartet sie nicht ab (C5-2)', () => {
    expect(RUHE_BILDER).toBeGreaterThanOrEqual(3);
    // Die Ruhe darf das Warten nicht ausreizen: bei 60 Bildern je Sekunde bleibt Zeit für die neue Seite
    expect((RUHE_BILDER * 1000) / 60).toBeLessThan(ZEITPLAN.ruhe / 4);
    // Beobachtet wird die Seite (body): Titel und Meta-Angaben im head malen nichts (Prüfrunde 4 A4-2)
    expect(insel).toContain('beob.observe(document.body, { subtree: true, childList: true, attributes: true });');
    expect(insel).toContain("[...document.images].some((i) => !i.complete && i.loading !== 'lazy') ||");
    // Es zählen die endlichen Abläufe im Hauptinhalt: nicht die der Front selbst, nicht der Ortsstrich im Kopf. Die Insel
    // steht außerhalb von <main>.
    expect(insel).toContain(
      "document.getAnimations().some((a) => a.playState === 'running' && a.effect!.getTiming().iterations! < Infinity && (a.effect as KeyframeEffect).target!.closest('main'))",
    );
    const layout = readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf8');
    expect(layout.indexOf('<Waermefront />')).toBeGreaterThan(layout.indexOf('</main>'));
    expect(layout.match(/<main\b/g)).toHaveLength(1);
    expect(insel).toContain('if (still >= RUHE_BILDER) aufdecken();');
    // Ab dem neuen Pfad höchstens `ruhe`, ohne neuen Pfad höchstens `halten` nach dem Wechsel
    expect(insel).toMatch(/haupt\.add\(styles\.h\);\s*clearTimeout\(uhr\);\s*uhr = setTimeout\(aufdecken, RUHE_MS\);/);
    expect(insel).toContain('uhr = setTimeout(aufdecken, HALTEN_MS);');
    // Prüfrunde 5 C5-2: kein Warten auf nachladende Bereiche; der Platzhalter der Bewerbung trägt keine Marke mehr
    expect(insel).not.toMatch(/laedt|LAEDT/i);
    expect(readFileSync(path.join(ROOT, 'app/jobs/[slug]/page.tsx'), 'utf8')).not.toMatch(/data-laedt/);
    // nicht mehr: aufdecken zwei Bilder nach dem neuen Pfad, mitten im Malen der neuen Seite (Prüfrunde 3 C3-1)
    expect(insel).not.toMatch(/requestAnimationFrame\(\(\) => \(bild = requestAnimationFrame\(aufdecken\)\)\)/);
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

describe('Nachladende Bereiche warten auf die Front (Prüfrunde 5 C5-2; KERN K-013 Malzeit)', () => {
  /** Ein Dokument mit einer Überlagerung der Front (offen oder zu), das Umschalten löst toggle aus. */
  function dokument(offen: boolean | null) {
    const hoerer = new Set<(e: Event) => void>();
    const front = {
      showPopover: () => {},
      matches: (s: string) => (s === ':popover-open' ? offen === true : false),
      addEventListener: (_: string, f: (e: Event) => void) => hoerer.add(f),
      removeEventListener: (_: string, f: (e: Event) => void) => hoerer.delete(f),
    };
    return {
      dok: { querySelector: (s: string) => (s === FRONT_SELEKTOR && offen !== null ? front : null) } as unknown as Pick<Document, 'querySelector'>,
      umschalten: (zustand: 'open' | 'closed') => {
        offen = zustand === 'open';
        for (const f of [...hoerer]) f({ newState: zustand } as unknown as Event);
      },
      hoerer,
    };
  }
  const steht = async (p: Promise<void>) => Promise.race([p.then(() => true), new Promise<boolean>((r) => setTimeout(() => r(false), 20))]);

  it('ohne offene Front (erstes Laden, reduzierte Bewegung, Server) geht das Versprechen sofort auf', async () => {
    expect(FRONT_SELEKTOR).toBe('[data-motion="seitenwechsel"]');
    expect(await steht(nachDerFront(undefined))).toBe(true);
    expect(await steht(nachDerFront(dokument(null).dok))).toBe(true);
    expect(await steht(nachDerFront(dokument(false).dok))).toBe(true);
  });

  it('mit offener Front erst, wenn sie zu ist; dann hört es auf zu lauschen', async () => {
    const d = dokument(true);
    const p = nachDerFront(d.dok);
    expect(await steht(p)).toBe(false);
    d.umschalten('open');
    expect(await steht(p)).toBe(false);
    d.umschalten('closed');
    expect(await steht(p)).toBe(true);
    expect(d.hoerer.size).toBe(0);
  });

  it('die Bewerbung auf der Stellenseite setzt erst nach der Front ein; die Insel wartet auf keinen nachladenden Bereich', () => {
    const lazy = readFileSync(path.join(ROOT, 'components/apply/ApplyFlowLazy.tsx'), 'utf8');
    expect(lazy).toContain("import { nachDerFront } from '@/lib/motion/seitenwechsel';");
    expect(lazy).toMatch(/lazy\(\(\) => Promise\.all\(\[ladeFlow\(\), nachDerFront\(\)\]\)\.then\(\(\[mod\]\) => \(\{ default: mod\.ApplyFlowClient \}\)\)\)/);
    // Das Vorladen im Leerlauf (HydrateNear) bleibt ohne Warten
    expect(lazy).toContain('<HydrateNear laden={ladeFlow}>');
    const insel = readFileSync(path.join(ROOT, 'components/site/waermefront/Waermefront.tsx'), 'utf8');
    expect(insel).not.toMatch(/laedt|nachDerFront\(/i);
  });
});
