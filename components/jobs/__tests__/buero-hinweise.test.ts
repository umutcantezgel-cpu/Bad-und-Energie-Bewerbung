import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobList } from '@/components/home/JobList';
import { bueroTeaser } from '@/components/home/stellen-text';
import { Einsatzgebiet } from '@/components/jobs/liste/Einsatzgebiet';
import { StellenKopf } from '@/components/jobs/liste/StellenKopf';
import { gebietBuero } from '@/components/jobs/liste/inhalt-text';
import { BUERO_AM_FIRMENSITZ, LISTEN_EINLEITUNG, listenEinleitung } from '@/components/jobs/liste/liste-text';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';

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

describe('/jobs: das Büro ist am Firmensitz', () => {
  it('Einleitung: nach den Baustellen der Hinweis aufs Büro, nur mit Stelle am Firmensitz', () => {
    expect(BUERO.location.radiusKm).toBeUndefined();
    expect(listenEinleitung(JOBS)).toBe(`${LISTEN_EINLEITUNG} ${BUERO_AM_FIRMENSITZ}`);
    expect(listenEinleitung(OHNE_BUERO)).toBe(LISTEN_EINLEITUNG);
    expect(BUERO.intro).toContain('Büro am Firmensitz');
    const html = renderToStaticMarkup(createElement(StellenKopf, { jobs: JOBS, titel: 'Offene Stellen in Wetzlar und Umgebung' }));
    expect(normal(html)).toContain(BUERO_AM_FIRMENSITZ);
  });

  it('Einsatzgebiet: Baustellen und Kundendienst im Umkreis (REGION), das Büro im Wortlaut der Stelle', () => {
    const satz = gebietBuero(JOBS)!;
    expect(BUERO.intro.startsWith(satz)).toBe(true);
    expect(satz).toMatch(/^Als Bürofachkraft arbeitest du in unserem Büro am Firmensitz in Wetzlar/);
    expect(gebietBuero(OHNE_BUERO)).toBeNull();
    expect(normal(renderToStaticMarkup(createElement(Einsatzgebiet, { jobs: JOBS })))).toContain(satz);
    expect(normal(renderToStaticMarkup(createElement(Einsatzgebiet, { jobs: OHNE_BUERO })))).not.toContain('Bürofachkraft arbeitest');
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
