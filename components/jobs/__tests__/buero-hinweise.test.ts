import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as llmsFull } from '@/app/llms-full.txt/route';
import { JobList } from '@/components/home/JobList';
import { RegionSection } from '@/components/home/RegionSection';
import { bueroTeaser } from '@/components/home/stellen-text';
import { Einsatzgebiet } from '@/components/jobs/liste/Einsatzgebiet';
import { StellenKopf } from '@/components/jobs/liste/StellenKopf';
import { gebietEinleitung, gebietText } from '@/components/jobs/liste/inhalt-text';
import { BUERO_AM_FIRMENSITZ, LISTEN_EINLEITUNG, listenEinleitung } from '@/components/jobs/liste/liste-text';
import { REGION } from '@/lib/content/region';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';

// Die Karte der Startseite lädt nach (Suspense); geprüft wird nur ihr Kopf mit der Einleitung
vi.mock('@/components/maps', () => ({ RegionMap: ({ header }: { header: unknown }) => header }));

/**
 * Unstimmigkeiten rund ums Büro (E-031, Paket W3): /jobs sagt, dass das Büro am Firmensitz ist (Baustellen und
 * Kundendienst im Umkreis, REGION), und die Startseite zeigt den Weg zur Seite „Büro und Verwaltung“ nur, solange eine
 * Bürostelle live ist. Wortlaut aus den Stellendaten.
 */

const NOW = new Date('2026-10-15T10:00:00Z');
const JOBS = getActiveJobs().filter((job) => isJobLive(job, NOW));
const OHNE_BUERO = JOBS.filter((job) => job.category !== 'buero');
const BUERO = JOBS.find((job) => job.category === 'buero')!;
const normal = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/[\s ]+/g, ' ');
/** Kein uneingeschränkter Gebietssatz: „Du arbeitest in …“ am Anfang eines Textes, Satzes oder einer Zeile. */
const UNEINGESCHRAENKT = /(?:^|[.!?] )Du arbeitest in /m;

describe('/jobs: das Büro ist am Firmensitz', () => {
  it('Einleitung: nach den Baustellen der Hinweis aufs Büro, nur mit Stelle am Firmensitz', () => {
    expect(BUERO.location.radiusKm).toBeUndefined();
    expect(listenEinleitung(JOBS)).toBe(`${LISTEN_EINLEITUNG} ${BUERO_AM_FIRMENSITZ}`);
    expect(listenEinleitung(OHNE_BUERO)).toBe(LISTEN_EINLEITUNG);
    expect(BUERO.intro).toContain('Büro am Firmensitz');
    const html = renderToStaticMarkup(createElement(StellenKopf, { jobs: JOBS, titel: 'Offene Stellen in Wetzlar und Umgebung' }));
    expect(normal(html)).toContain(BUERO_AM_FIRMENSITZ);
  });

  it('Einsatzgebiet (Prüfrunde 3 D3-1): mit Bürostelle gilt der Satz zum Gebiet nur für Baustellen und Kundendienst, dann „Das Büro ist am Firmensitz.“; kein uneingeschränktes „Du arbeitest in …“ neben der Bürostelle', () => {
    const mit = gebietEinleitung(JOBS);
    expect(mit.satz).toBe(`Auf den Baustellen und im Kundendienst arbeitest du ${REGION.summary.replace(/^Du arbeitest /, '')}`);
    expect(mit.satz).toMatch(/^Auf den Baustellen und im Kundendienst arbeitest du in Wetzlar, Gießen, /);
    expect(mit.buero).toBe(BUERO_AM_FIRMENSITZ);
    expect(gebietEinleitung(OHNE_BUERO)).toEqual({ satz: REGION.summary, buero: null });
    const html = normal(renderToStaticMarkup(createElement(Einsatzgebiet, { jobs: JOBS })));
    expect(html).toContain(`${mit.satz} ${BUERO_AM_FIRMENSITZ}`);
    expect(html).not.toMatch(/(?:^|[.!?] )Du arbeitest in /);
    // Kein sachfremder Satz aus der Stelle (Voll- oder Teilzeit) im Gebiet
    expect(html).not.toContain('Bürofachkraft arbeitest');
    expect(html).not.toContain('Teilzeit');
    const ohne = normal(renderToStaticMarkup(createElement(Einsatzgebiet, { jobs: OHNE_BUERO })));
    expect(ohne).toContain(REGION.summary);
    expect(ohne).not.toContain(BUERO_AM_FIRMENSITZ);
  });
});

describe('Startseite: Weg zur Seite „Büro und Verwaltung“ nur mit live Bürostelle', () => {
  it('Teaser mit dem Namen des Themas als Linktext; ohne Bürostelle keiner', () => {
    expect(bueroTeaser(JOBS)).toEqual({ frage: 'Lieber im Büro?', href: '/arbeiten-bei-uns/buero-und-verwaltung', label: 'Büro und Verwaltung' });
    expect(bueroTeaser(OHNE_BUERO)).toBeNull();
    const html = renderToStaticMarkup(createElement(JobList, { now: NOW }));
    expect(html).toContain('href="/arbeiten-bei-uns/buero-und-verwaltung"');
    expect(normal(html)).toContain('Lieber im Büro? Büro und Verwaltung');
    // Nach Ablauf aller Stellen (2031) gibt es keine Bürostelle und keinen Teaser
    expect(renderToStaticMarkup(createElement(JobList, { now: new Date('2031-01-01T00:00:00Z') }))).not.toContain('buero-und-verwaltung');
  });
});

describe('Gebietssatz neben der Bürostelle überall eingeschränkt (Prüfrunde 4 D4-1)', () => {
  afterEach(() => vi.useRealTimers());

  it('gebietText: Satz und Hinweis aufs Büro hintereinander, ohne Bürostelle der Bestandswortlaut', () => {
    expect(gebietText(JOBS)).toBe(`${gebietEinleitung(JOBS).satz} ${BUERO_AM_FIRMENSITZ}`);
    expect(gebietText(OHNE_BUERO)).toBe(REGION.summary);
  });

  it('Startseite #einsatzgebiet: mit live Bürostelle wie auf /jobs, ohne sie der Bestandswortlaut', () => {
    const mit = normal(renderToStaticMarkup(createElement(RegionSection, { now: NOW })));
    expect(mit).toContain(gebietText(JOBS));
    expect(mit).toContain(BUERO_AM_FIRMENSITZ);
    expect(mit).not.toMatch(UNEINGESCHRAENKT);
    // Nach Ablauf aller Stellen (2031) gibt es keine Bürostelle: dann gilt der Satz für alle
    const ohne = normal(renderToStaticMarkup(createElement(RegionSection, { now: new Date('2031-01-01T00:00:00Z') })));
    expect(ohne).toContain(REGION.summary);
    expect(ohne).not.toContain(BUERO_AM_FIRMENSITZ);
  });

  it('llms-full.txt: Abschnitt Einsatzgebiet wie auf /jobs, solange die Bürostelle live ist', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    const text = await llmsFull().text();
    const gebiet = text.slice(text.indexOf('## 5. Einsatzgebiet'), text.indexOf('## 6. '));
    expect(gebiet).toContain(`${REGION.headline} ${gebietText(JOBS)}`);
    expect(gebiet).not.toMatch(UNEINGESCHRAENKT);
    expect(text).not.toMatch(UNEINGESCHRAENKT);
    expect(text).toContain(BUERO.title);
  });
});
