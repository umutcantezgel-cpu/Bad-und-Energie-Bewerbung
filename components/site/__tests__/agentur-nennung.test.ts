import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isClientModule, valueImports } from '../../../scripts/qa/check-client-imports.mjs';
import { FussSchmal, FussVoll, NEUER_TAB } from '../fuss';
import { AGENTUR, AGENTUR_HINWEIS_ID, agenturRel, istQuellseite } from '../fuss/agentur';
import { buildSiteNodes } from '../site-jsonld';

/**
 * Agenturnennung im Fuß (_werkstatt/nennung, Entscheidungen N-04 bis N-07): rel-Regel des Linkmodells „Startseite“,
 * Wortlaut, Ziel und Strukturdaten. Der Pfad kommt wie in FooterSwitch aus usePathname; hier gesetzt per Mock.
 */
const pfad = vi.hoisted(() => ({ wert: '/' as string | null }));
vi.mock('next/navigation', () => ({ usePathname: () => pfad.wert }));
vi.mock('@/components/brand/Logo', () => ({
  Logo: () => createElement('img', { alt: 'Bad und Energie GmbH Lahn Dill', 'data-logo': '' }),
}));

const ROOT = path.resolve(__dirname, '../../..');
const STICHTAG = new Date('2026-10-16T12:00:00+02:00');
const unescape = (html: string) => html.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const plain = (html: string) => unescape(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

function fuesse(wert: string | null): [string, string][] {
  pfad.wert = wert;
  return [
    ['voll', renderToStaticMarkup(createElement(FussVoll, { year: 2026, now: STICHTAG }))],
    ['schmal', renderToStaticMarkup(createElement(FussSchmal, { year: 2026 }))],
  ];
}

/** Alle Links auf codayweb.de im Markup, mit den Attributen des a-Elements und seinem Inhalt. */
function codayLinks(html: string): { tag: string; inhalt: string }[] {
  return [...html.matchAll(/(<a\b[^>]*href="https?:\/\/(?:www\.)?codayweb\.de[^"]*"[^>]*>)([\s\S]*?)<\/a>/g)].map((m) => ({ tag: m[1], inhalt: m[2] }));
}
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? null;

afterEach(() => {
  pfad.wert = '/';
});

describe('rel-Regel (Linkmodell Startseite, N-04/N-05)', () => {
  it('Quellseite ist nur die Startseite', () => {
    expect(istQuellseite('/')).toBe(true);
    for (const andere of ['/jobs', '/jobs/', '/bewerbung', '/bewerbung/danke', '/arbeiten-bei-uns/gehalt', '/einsatzgebiet/herborn', '/impressum', '/datenschutz', '/gibt-es-nicht', '', null]) {
      expect(istQuellseite(andere), String(andere)).toBe(false);
    }
  });

  it('gefolgt nur auf der Startseite, sonst nofollow; immer noopener, nie noreferrer, sponsored oder ugc', () => {
    expect(agenturRel('/')).toBe('noopener');
    // ISR-Neuberechnung der Startseite auf Vercel: Server-Pfad „/index“, der Link bleibt gefolgt.
    expect(agenturRel('/index')).toBe('noopener');
    expect(agenturRel('/index/')).toBe('noopener');
    expect(agenturRel('/jobs')).toBe('nofollow noopener');
    expect(agenturRel(null)).toBe('nofollow noopener');
    for (const wert of ['/', '/jobs', null]) expect(agenturRel(wert)).not.toMatch(/noreferrer|sponsored|ugc/);
  });
});

describe('Nennung in beiden Füßen (N-06)', () => {
  it('auf der Startseite genau ein gefolgter Link je Fuß: Text exakt „Coday Web“, Ziel exakt das Linkziel, neuer Tab', () => {
    for (const [name, html] of fuesse('/')) {
      const links = codayLinks(html);
      expect(links, name).toHaveLength(1);
      const [{ tag, inhalt }] = links;
      expect(attr(tag, 'href'), name).toBe('https://www.codayweb.de/de');
      expect(attr(tag, 'target'), name).toBe('_blank');
      expect(attr(tag, 'rel'), name).toBe('noopener');
      // Linktext genau die Marke (S1), ohne weiteren Text im a-Element, auch keinen verborgenen
      expect(inhalt, name).toBe('Coday Web');
      expect(AGENTUR.marke).toBe('Coday Web');
      // Der Hinweis auf den neuen Tab steht direkt hinter dem Link und ist ihm per aria-describedby zugeordnet
      expect(attr(tag, 'aria-describedby'), name).toBe(AGENTUR_HINWEIS_ID);
      expect(html, name).toContain(`</a><span id="${AGENTUR_HINWEIS_ID}" class="sr-only">${NEUER_TAB}</span>`);
      expect(html.split(`id="${AGENTUR_HINWEIS_ID}"`), name).toHaveLength(2);
    }
  });

  it('auf jeder anderen Seite derselbe Link mit rel="nofollow noopener"', () => {
    for (const wert of ['/jobs', '/bewerbung', '/arbeiten-bei-uns/waermepumpen', '/einsatzgebiet', '/impressum']) {
      for (const [name, html] of fuesse(wert)) {
        const links = codayLinks(html);
        expect(links, `${name} ${wert}`).toHaveLength(1);
        expect(attr(links[0].tag, 'rel'), `${name} ${wert}`).toBe('nofollow noopener');
        expect(attr(links[0].tag, 'href'), `${name} ${wert}`).toBe('https://www.codayweb.de/de');
      }
    }
  });

  it('Wortlaut „Webdesign & Entwicklung: Coday Web“ als letzte Zeile unter der OSM-Nennung', () => {
    for (const [name, html] of fuesse('/')) {
      const zeile = /<span class="[^"]*" data-agentur-nennung="">([\s\S]*?<\/a>)<span id="[^"]*" class="sr-only">[^<]*<\/span><\/span>/.exec(html);
      expect(zeile, name).not.toBeNull();
      expect(plain(zeile![1]), name).toBe('Webdesign & Entwicklung: Coday Web');
      expect(html.indexOf('data-osm-nennung'), name).toBeLessThan(html.indexOf('data-agentur-nennung'));
      // Keine Zahl, kein Superlativ, kein weiterer Link auf codayweb.de
      expect(plain(zeile![1]), name).not.toMatch(/\d|beste|führend|Award|Preis/i);
    }
  });

  it('nur Text: kein Bild, kein Skript, kein iframe und keine Ressource vom Agenturserver (S6)', () => {
    for (const [name, html] of fuesse('/')) {
      expect(html, name).not.toMatch(/<(img|script|iframe|link)\b[^>]*codayweb/i);
      expect(html.match(/codayweb\.de/g), name).toHaveLength(1);
    }
  });

  it('die Gestalt kommt aus der OSM-Nennung; die Trefferfläche wächst nur über Innenabstand am Inline-Link', () => {
    const css = readFileSync(path.join(ROOT, 'components/site/fuss/fuss.module.css'), 'utf8');
    expect(css).toMatch(/\.osm,\s*\.nennung\s*\{\s*display: block;\s*margin-top: var\(--a-1\);\s*\}/);
    expect(css).toMatch(/\.osmLink,\s*\.nennungLink\s*\{\s*color: inherit;/);
    expect(css).toMatch(/\.osmLink:focus-visible,\s*\.nennungLink:focus-visible\s*\{\s*outline: 3px solid var\(--focus\);/);
    const eigen = /\.nennungLink\s*\{([^}]*)\}/.exec(css.replace(/\.osmLink,\s*\.nennungLink\s*\{[^}]*\}/, ''))?.[1] ?? '';
    expect(eigen.trim()).toBe('padding-block: var(--a-1);');
    // Keine eigene Farbe, Größe, Deckkraft oder Lage: nichts, was die Nennung blasser, kleiner oder versteckt macht (S3)
    expect(css).not.toMatch(/\.nennung[^{]*\{[^}]*(opacity|font-size|position|visibility|clip|transform)/);
  });
});

describe('Client-Insel (N-05)', () => {
  it('AgenturLink ist ein Client-Modul und lädt nur next/navigation und die importfreie agentur.ts', () => {
    const insel = readFileSync(path.join(ROOT, 'components/site/fuss/AgenturLink.tsx'), 'utf8');
    expect(isClientModule(insel)).toBe(true);
    expect(valueImports(insel)).toEqual(['next/navigation', './agentur']);
    expect(valueImports(readFileSync(path.join(ROOT, 'components/site/fuss/agentur.ts'), 'utf8'))).toEqual([]);
  });

  it('die Entscheidung hängt nur am Pfad: keine Weiche nach Nutzeragent, Herkunft oder Gerät (S7)', () => {
    for (const datei of ['components/site/fuss/AgenturLink.tsx', 'components/site/fuss/agentur.ts', 'components/site/fuss/AgenturNennung.tsx']) {
      expect(readFileSync(path.join(ROOT, datei), 'utf8'), datei).not.toMatch(/\buserAgent\b|\bnavigator\b|\bheaders\(|\breferrer\b|\bmatchMedia\b|\binnerWidth\b|\bcookies\(/);
    }
  });
});

describe('Strukturdaten (N-07)', () => {
  it('WebSite trägt creator: Organization „Coday Web“ mit dem Linkziel', () => {
    const website = buildSiteNodes().find((node) => node['@type'] === 'WebSite')!;
    expect(website.creator).toEqual({ '@type': 'Organization', name: 'Coday Web', url: 'https://www.codayweb.de/de' });
  });
});
