import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import JobsPage from '@/app/jobs/page';
import { Stellenverteiler, stellenMeta } from '@/components/jobs/liste/Stellenverteiler';
import {
  GEWERKE,
  INITIATIV,
  LEER_TEXT,
  LISTEN_EINLEITUNG,
  LISTEN_MIKROTEXT,
  listenEtikett,
  listenName,
  listenUnterzeile,
  listenZeichnung,
  listenZweitweg,
} from '@/components/jobs/liste/liste-text';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { FACTS } from '@/lib/content/facts';
import { REGION } from '@/lib/content/region';
import { PAY_ON_REQUEST, jobPath, payLabel } from '@/lib/jobs/format';
import { getActiveJobs, getJobById, isJobLive } from '@/lib/jobs/registry';
import { MOTION_IDS } from '@/lib/motion/register';
import { claimsInHtml } from '../../../scripts/qa/check-claims.mjs';

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

  it('„Lohn auf Anfrage.“, sobald eine Stelle der Liste etwas zur Bezahlung sagt (E-030); sonst die Marke', () => {
    const am = getJobById('anlagenmechaniker-shk')!;
    const praktikum = getJobById('schuelerpraktikum-shk')!;
    const buero = getJobById('buerofachkraft')!;
    expect(listenUnterzeile([am])).toEqual(['Lohn auf Anfrage.', 'Flexible Arbeitszeiten.']);
    expect(listenUnterzeile([praktikum, am])[0]).toBe(`${FACTS.payOnRequest.short}.`);
    // Nur das Schülerpraktikum (kein Wort zu Geld) oder keine Stelle: „Ehrliches Handwerk.“
    expect(listenUnterzeile([])[0]).toBe('Ehrliches Handwerk.');
    expect(listenUnterzeile([am])[1]).toBe(FACTS.flexibleHours.long);
    // Sammelfläche (Runde 3): Arbeitszeit fürs Büro (S5) und das Schülerpraktikum (S4) offen, also mit Stellenbezug;
    // für keine Stelle der Liste belegt, die Zusage, die für den Betrieb gilt
    expect(listenUnterzeile([praktikum, am])[1]).toBe('Je nach Stelle flexible Arbeitszeiten.');
    expect(listenUnterzeile([buero, am])).toEqual(['Lohn auf Anfrage.', 'Je nach Stelle flexible Arbeitszeiten.']);
    expect(listenUnterzeile([praktikum])).toEqual(['Ehrliches Handwerk.', `${FACTS.noFarAssembly.short}.`]);
    expect(listenUnterzeile(getActiveJobs())).toEqual(['Lohn auf Anfrage.', 'Je nach Stelle flexible Arbeitszeiten.']);
  });

  it('Heizkreis: der Einsatzradius statt eines Betrags (E-030, bis 2026-10-12 13:30), Maße aus dem Faktenregister', () => {
    const am = getJobById('anlagenmechaniker-shk')!;
    const { heizkreis, masse } = listenZeichnung([am]);
    expect(heizkreis.wert.replaceAll(NBSP, ' ')).toBe(FACTS.radius35.value);
    expect(heizkreis.name).toBe('Einsatzradius');
    // Der Radius steht nicht doppelt als Maß
    expect(masse.map((mass) => mass.wert.replaceAll(NBSP, ' '))).toEqual([FACTS.vacation30.value]);
    expect(masse.map((mass) => mass.name)).toEqual([FACTS.vacation30.label]);
    // Sammelfläche (Runde 3): 30 Tage Urlaub fürs Büro offen (S5), das Maß mit Stellenbezug wie im Hub; nur Büro: kein Maß
    expect(listenZeichnung(getActiveJobs()).masse.map((mass) => mass.name)).toEqual([`${FACTS.vacation30.label} je nach Stelle`]);
    expect(listenZeichnung([getJobById('buerofachkraft')!]).masse).toEqual([]);
    for (const jobs of [[am], getActiveJobs()]) expect(JSON.stringify(listenZeichnung(jobs))).not.toMatch(/\d:\d|Feierabend|€|Gehalt/);
    // Tarif nur für die Stellen, die ihn belegen: nicht fürs Büro (S5), nichts zu Geld beim Praktikum (S4)
    expect(LISTEN_EINLEITUNG).toContain('Fachkräfte, Azubis und Quereinsteiger bezahlen wir über Tarif');
    expect(LISTEN_EINLEITUNG).not.toMatch(/€|\d\.\d{3}/);
    expect(LISTEN_MIKROTEXT).toBe(`Dauert ca. 60${NBSP}Sekunden. ${FACTS.noCvNeeded.short}.`);
    expect(INITIATIV.text).toContain(FACTS.noCvNeeded.long);
    expect(INITIATIV.text).toContain(FACTS.quickResponse.long);
  });

  it('Faktenverteilung im Kopf: keine Uhrzeit, 30 Tage und 35 km nur als Maß, 1926 nur in der Einleitung', () => {
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
  const jobs = live(new Date('2026-10-14T12:00:00+02:00'));

  it('je Stelle ein Link auf die Stellenseite und „Lohn auf Anfrage“ wie in den Stellendaten, kein Betrag (E-030)', () => {
    const html = renderToStaticMarkup(createElement(Stellenverteiler, { jobs }));
    expect(jobs).toHaveLength(8);
    expect(html.match(/<a /g)).toHaveLength(jobs.length);
    expect(html.match(/<h2/g)).toHaveLength(jobs.length);
    expect(html).toContain(`aria-label="${listenName(jobs.length)}"`);
    for (const job of jobs) {
      expect(html).toContain(`href="${jobPath(job)}"`);
      expect(html).toContain(job.summary);
    }
    // Je Stelle mit Lohnangabe einmal „Lohn auf Anfrage“, ohne Maßkette; das Schülerpraktikum ohne
    expect(html.split(`>${PAY_ON_REQUEST}<`).length - 1).toBe(jobs.filter((job) => payLabel(job) !== null).length);
    expect(jobs.filter((job) => payLabel(job) === null).map((job) => job.id)).toEqual(['schuelerpraktikum-shk']);
    expect(html).not.toContain('data-zeichnung="masskette"');
    expect(claimsInHtml(html)).toEqual([]);
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
    const { heizkreis } = listenZeichnung(getActiveJobs());
    expect(plain(html)).toContain(`${heizkreis.wert.replaceAll(NBSP, ' ')} ${heizkreis.name}`);
    // Keine Arbeitszeit-Aussage im sichtbaren Text (Bürozeiten im Fuß sind markiert, check-claims)
    expect(claimsInHtml(html)).toEqual([]);
  });

  // V6-B: der eine Block ist ein @graph; seitenspezifisch darin nur WebPage und die BreadcrumbList.
  it('JSON-LD: nur die BreadcrumbList, kein JobPosting', () => {
    const html = renderSeite();
    const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    expect(ld).toHaveLength(1);
    const typen = (ld[0]['@graph'] as { '@type': string | string[] }[]).map((k) => k['@type']);
    expect(typen).toEqual(['Organization', 'Person', 'WebSite', ['LocalBusiness', 'HVACBusiness', 'Plumber'], 'WebPage', 'BreadcrumbList']);
    expect(html).not.toContain('JobPosting');
  });

  it('abgelaufene Stellen verschwinden (Ausbildung 2026 nach dem 31.12.2026)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T12:00:00+02:00'));
    const vorher = renderSeite();
    const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
    expect(vorher).toContain(`href="${jobPath(azubi)}"`);
    expect(vorher).toContain(listenName(live(new Date()).length));

    // Nach dem 31.12.2026 und vor dem Ablauf der übrigen Stellen (validThrough 12.01.2027)
    vi.setSystemTime(new Date('2027-01-05T12:00:00+01:00'));
    const nachher = renderSeite();
    expect(live(new Date())).toHaveLength(live(new Date('2026-10-10T12:00:00+02:00')).length - 1);
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
    // Der Quereinstieg ist seit 2026-10-14 eine eigene Stelle (fakten-abgleich S3), nicht mehr nur ein Weg im Flow
    const quereinstieg = getJobById('quereinsteiger-montagehelfer')!;
    expect(quereinstieg.status).toBe('published');
    expect(html).toContain(`href="${jobPath(quereinstieg)}"`);
    expect(plain(html)).toContain('Sprich direkt mit Sabri Demir');
  });

  it('Einsatzgebiet im Bestandswortlaut, mit dem Weg zur Gebietsseite (E-028)', () => {
    const html = renderSeite();
    expect(plain(/<h2 id="einsatzgebiet"[^>]*>(.*?)<\/h2>/.exec(html)![1])).toBe(REGION.headline);
    expect(html).toContain(REGION.summary);
    expect(html).toContain('href="/einsatzgebiet"');
    expect(html).not.toContain('href="/#einsatzgebiet"');
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
