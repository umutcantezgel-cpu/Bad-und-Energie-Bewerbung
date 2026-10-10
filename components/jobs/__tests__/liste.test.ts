import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import JobsPage from '@/app/jobs/page';
import { salaryUnitLabel } from '@/components/jobs/JobCard';
import { Stellenverteiler, stellenMeta } from '@/components/jobs/liste/Stellenverteiler';
import {
  GEWERKE,
  HEIZKREIS,
  INITIATIV,
  LEER_TEXT,
  LISTEN_EINLEITUNG,
  LISTEN_MASSE,
  LISTEN_MIKROTEXT,
  listenEtikett,
  listenName,
  listenUnterzeile,
  listenZweitweg,
} from '@/components/jobs/liste/liste-text';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { FACTS } from '@/lib/content/facts';
import { REGION } from '@/lib/content/region';
import { formatSalaryAmount, jobPath } from '@/lib/jobs/format';
import { getActiveJobs, getJobById, isJobLive } from '@/lib/jobs/registry';
import { MOTION_IDS } from '@/lib/motion/register';

const NBSP = ' ';
const SHY = '­';
const DIR = path.resolve(__dirname, '../liste');
const QUELLEN = readdirSync(DIR)
  .filter((datei) => /\.(tsx?|css)$/.test(datei))
  .map((datei) => ({ datei, text: readFileSync(path.join(DIR, datei), 'utf8') }));
const SEITE = readFileSync(path.resolve(__dirname, '../../../app/jobs/page.tsx'), 'utf8');

/** Sichtbarer Text ohne Tags, mit normalen Leerzeichen und ohne weiche Trennstellen. */
const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replaceAll(SHY, '')
    .replaceAll(NBSP, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const live = (now: Date) => getActiveJobs().filter((job) => isJobLive(job, now));
const renderSeite = () => renderToStaticMarkup(createElement(JobsPage));

afterEach(() => {
  vi.useRealTimers();
});

describe('Texte der Stellenliste (nur aus Fakten und Stellendaten)', () => {
  it('Etikett zählt die Stellen, die live sind; ohne Stelle nennt es die Initiativbewerbung', () => {
    expect(listenEtikett(4)).toBe(`4${NBSP}Stellen · Wetzlar`);
    expect(listenEtikett(1)).toBe(`1${NBSP}Stelle · Wetzlar`);
    expect(listenEtikett(0)).toBe('Initiativbewerbung · Wetzlar');
    expect(listenName(4)).toBe('4 offene Stellen');
    expect(listenName(1)).toBe('1 offene Stelle');
  });

  it('„Jede Stelle mit Gehaltsspanne“ nur, wenn jede Stelle eine Spanne trägt', () => {
    const am = getJobById('anlagenmechaniker-shk')!;
    expect(listenUnterzeile([am])).toEqual(['Jede Stelle mit Gehaltsspanne.', 'Pünktlich Feierabend.']);
    expect(listenUnterzeile([am, { salary: undefined }])).toEqual(['Ehrliches Handwerk.', 'Pünktlich Feierabend.']);
    expect(listenUnterzeile([])[0]).toBe('Ehrliches Handwerk.');
  });

  it('Heizkreis, Maße und Mikrotext kommen aus dem Faktenregister', () => {
    expect(HEIZKREIS).toEqual({ wert: FACTS.friday1330.value, name: FACTS.friday1330.label });
    expect(LISTEN_MASSE.map((mass) => mass.wert.replaceAll(NBSP, ' '))).toEqual([FACTS.vacation30.value, FACTS.radius35.value]);
    expect(LISTEN_MIKROTEXT).toBe(`Dauert ca. 60${NBSP}Sekunden. ${FACTS.noCvNeeded.short}.`);
    expect(INITIATIV.text).toContain(FACTS.noCvNeeded.long);
    expect(INITIATIV.text).toContain(FACTS.quickResponse.long);
  });

  it('Faktenverteilung im Kopf: 13:30 nur im Heizkreis, 30 Tage und 35 km nur als Maß, 1926 nur in der Einleitung', () => {
    const [satz1, satz2] = listenUnterzeile(getActiveJobs());
    const text = [satz1, satz2, LISTEN_EINLEITUNG, LISTEN_MIKROTEXT].join(' ').replaceAll(NBSP, ' ');
    expect(text).not.toContain('13:30');
    expect(text).not.toContain('30 Tage');
    expect(text).not.toContain('35 km');
    expect(text).toContain(FACTS.founded1926.short);
  });

  it('Zweitweg: zur Liste, eine Stelle einzeln, ohne Stelle zur Initiativbewerbung', () => {
    expect(listenZweitweg(4)).toEqual({ href: '#stellen', label: `Alle 4${NBSP}Stellen ansehen` });
    expect(listenZweitweg(1)).toEqual({ href: '#stellen', label: 'Zur offenen Stelle' });
    expect(listenZweitweg(0)).toEqual({ href: INITIATIVE_APPLY_PATH, label: 'Initiativ bewerben' });
  });

  it('Gewerke mit Familien-Icons', () => {
    expect(GEWERKE.map((gewerk) => gewerk.icon)).toEqual(['waermepumpe', 'flamme', 'tropfen']);
  });
});

describe('Stellenverteiler (Variante 2, Leitungsabgänge)', () => {
  const jobs = live(new Date('2026-10-10T12:00:00+02:00'));

  it('je Stelle ein Link auf die Stellenseite, Gehalt und Einheit gleich den Stellendaten', () => {
    const html = renderToStaticMarkup(createElement(Stellenverteiler, { jobs }));
    expect(html.match(/<a /g)).toHaveLength(jobs.length);
    expect(html.match(/<h2/g)).toHaveLength(jobs.length);
    expect(html).toContain(`aria-label="${listenName(jobs.length)}"`);
    for (const job of jobs) {
      expect(html).toContain(`href="${jobPath(job)}"`);
      expect(html).toContain(formatSalaryAmount(job)!);
      expect(html).toContain(salaryUnitLabel(job)!);
      expect(html).toContain(job.summary);
    }
    // Gehalt als Maß in Martian Mono (Maßkette)
    expect(html.match(/data-zeichnung="masskette"/g)).toHaveLength(jobs.length);
  });

  it('Meta-Zeile: Trennpunkt steht am Anfang eines Teils, nie am Zeilenende', () => {
    const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
    expect(stellenMeta(azubi)).toEqual(['Ausbildung', '3,5 Jahre', 'Nach Absprache']);
    const html = renderToStaticMarkup(createElement(Stellenverteiler, { jobs: [azubi] }));
    expect(html).toContain(`>·${NBSP}3,5 Jahre<`);
    expect(html).not.toMatch(/ ·<\/span>/);
  });

  it('Leerzustand erklärt und nennt den nächsten Schritt', () => {
    const html = renderToStaticMarkup(createElement(Stellenverteiler, { jobs: [] }));
    expect(html).not.toContain('<ul');
    expect(plain(html)).toBe(LEER_TEXT);
  });
});

describe('/jobs (R5-JOBS-01)', () => {
  it('eine h1 im bisherigen Wortlaut, Kopf aus components/seitenkopf in der Variante erzaehl', () => {
    const html = renderSeite();
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(plain(/<h1[^>]*>(.*?)<\/h1>/.exec(html)![1])).toBe('Offene Stellen in Wetzlar und Umgebung');
    expect(html).toContain('data-seitenkopf="erzaehl"');
    expect(html).toContain('data-zeichnung="heizkreis"');
    expect(plain(html)).toContain(`${HEIZKREIS.wert} ${HEIZKREIS.name}`);
  });

  // V6-B: der eine Block ist ein @graph; seitenspezifisch darin nur WebPage und die BreadcrumbList.
  it('JSON-LD: nur die BreadcrumbList, kein JobPosting', () => {
    const html = renderSeite();
    const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    expect(ld).toHaveLength(1);
    const typen = (ld[0]['@graph'] as { '@type': string }[]).map((k) => k['@type']);
    expect(typen).toEqual(['Organization', 'Person', 'WebSite', 'LocalBusiness', 'WebPage', 'BreadcrumbList']);
    expect(html).not.toContain('JobPosting');
  });

  it('abgelaufene Stellen verschwinden (Ausbildung 2026 nach dem 31.12.2026)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T12:00:00+02:00'));
    const vorher = renderSeite();
    const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
    expect(vorher).toContain(`href="${jobPath(azubi)}"`);
    expect(vorher).toContain(listenName(live(new Date()).length));

    vi.setSystemTime(new Date('2027-01-15T12:00:00+01:00'));
    const nachher = renderSeite();
    expect(nachher).not.toContain(`href="${jobPath(azubi)}"`);
    expect(nachher).toContain(listenName(live(new Date()).length));
    expect(plain(nachher)).toContain(plain(listenEtikett(live(new Date()).length)));
  });

  it('ohne Stelle: Leerzustand, Zweitweg zur Initiativbewerbung', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2028-01-01T12:00:00+01:00'));
    const html = renderSeite();
    expect(plain(html)).toContain(LEER_TEXT);
    expect(html).not.toContain('href="#stellen"');
    expect(html.match(new RegExp(`href="${INITIATIVE_APPLY_PATH.replace('?', '\\?')}"`, 'g'))?.length).toBeGreaterThanOrEqual(2);
  });

  it('Initiativbewerbung bleibt, mit dem Weg „Auch möglich“ und dem persönlichen Draht', () => {
    const html = renderSeite();
    expect(html).toContain('id="initiativ"');
    expect(html).toContain(`href="${INITIATIVE_APPLY_PATH}"`);
    const quereinstieg = getJobById('quereinsteiger-montagehelfer');
    if (quereinstieg?.status === 'funnel_only') expect(html).toContain(`stelle=${quereinstieg.slug}`);
    expect(plain(html)).toContain('Sprich direkt mit Sabri Demir');
  });

  it('Einsatzgebiet im Bestandswortlaut, mit dem Weg zur Karte', () => {
    const html = renderSeite();
    expect(plain(/<h2 id="einsatzgebiet"[^>]*>(.*?)<\/h2>/.exec(html)![1])).toBe(REGION.headline);
    expect(html).toContain(REGION.summary);
    expect(html).toContain('href="/#einsatzgebiet"');
  });

  it('Rot nur an den Hauptaktionen: Kopf und Initiativband markieren sie mit data-primary-cta', () => {
    const html = renderSeite();
    expect(html.match(/data-primary-cta=""/g)).toHaveLength(2);
  });

  it('Server-Komponenten mit eigener Icon-Familie, Bewegungen nur aus dem Register', () => {
    for (const { datei, text } of [...QUELLEN, { datei: 'page.tsx', text: SEITE }]) {
      expect(text, datei).not.toMatch(/['"]use client['"]/);
      expect(text, datei).not.toMatch(/lucide-react/);
      for (const [, id] of text.matchAll(/data-motion="([^"]+)"/g)) expect(MOTION_IDS, `${datei}: ${id}`).toContain(id);
    }
  });
});
