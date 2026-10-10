import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { Children, createElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HomePage, { generateMetadata as homeMetadata } from '@/app/page';
import JobsPage, { generateMetadata as jobsMetadata } from '@/app/jobs/page';
import JobPage, { generateMetadata as jobMetadata } from '@/app/jobs/[slug]/page';
import DankePage, { metadata as dankeMetadata } from '@/app/bewerbung/danke/page';
import MappePage, { metadata as mappeMetadata } from '@/app/bewerbung/mappe/page';
import { metadata as bewerbungMetadata } from '@/app/bewerbung/page';
import DatenschutzPage, { metadata as datenschutzMetadata } from '@/app/datenschutz/page';
import ImpressumPage, { metadata as impressumMetadata } from '@/app/impressum/page';
import NotFound, { metadata as notFoundMetadata } from '@/app/not-found';
import { buildFaqPageJsonLd } from '@/components/home/content';
import { JsonLd, serializeJsonLdScript } from '@/components/seo/JsonLd';
import { FOUNDER_ID, LOCAL_BUSINESS_ID, ORGANIZATION_ID, WEBSITE_ID } from '@/components/site/site-jsonld';
import { getFaqItems } from '@/lib/content/faq';
import { jobPath, jobUrl } from '@/lib/jobs/format';
import { buildBreadcrumbJsonLd, buildJobPostingJsonLd, buildJobsBreadcrumbJsonLd } from '@/lib/jobs/jsonld';
import { getActiveJobs, getJobById, isJobLive, type Job } from '@/lib/jobs/registry';
import { getCleanCanonicalUrl } from '../canonical-links';
import { buildPageGraph, fragmentId, type PageGraph } from '../graph';
import { TITLE_TEMPLATE, documentTitle, generatePageMetadata } from '../metadata';

const ROOT = path.resolve(__dirname, '../../..');
const quelle = (datei: string) => readFileSync(path.join(ROOT, datei), 'utf8');

type Node = Record<string, unknown>;
const liveJobs = () => getActiveJobs().filter((job) => isJobLive(job, new Date()));
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;

afterEach(() => {
  vi.useRealTimers();
});

/** Die Graphen, die die Seite selbst rendert: jedes <JsonLd> unter den direkten Kindern ihres Elements. */
function graphsOf(element: ReactNode): PageGraph[] {
  if (!isValidElement<{ children?: ReactNode }>(element)) return [];
  return Children.toArray(element.props.children)
    .filter((child): child is ReactElement<{ data: PageGraph }> => isValidElement(child) && child.type === JsonLd)
    .map((child) => child.props.data);
}

function onlyGraph(element: ReactNode): PageGraph {
  const graphs = graphsOf(element);
  expect(graphs).toHaveLength(1);
  return graphs[0];
}

const nodes = (graph: PageGraph) => graph['@graph'] as readonly Node[];
const ofType = (graph: PageGraph, type: string) => nodes(graph).filter((node) => node['@type'] === type);
const webPage = (graph: PageGraph) => {
  const pages = ofType(graph, 'WebPage');
  expect(pages).toHaveLength(1);
  return pages[0];
};

/** Jedes Objekt mit @id unterhalb der Knoten (Verweise und eingebettete Knoten wie hiringOrganization). */
function nestedIds(value: unknown, top = true): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => nestedIds(item, false));
  if (!value || typeof value !== 'object') return [];
  const own = !top && typeof (value as Node)['@id'] === 'string' ? [(value as Node)['@id'] as string] : [];
  return [...own, ...Object.values(value).flatMap((child) => nestedIds(child, false))];
}

/** Gemeinsame Regeln jedes Graphen (wie scripts/qa/check-graph.mjs im Build). */
function expectSoundGraph(graph: PageGraph) {
  expect(graph['@context']).toBe('https://schema.org');
  const ids = nodes(graph).map((node) => node['@id']);
  expect(new Set(ids).size).toBe(ids.length);
  for (const node of nodes(graph)) {
    expect(node['@context']).toBeUndefined();
    for (const ref of nestedIds(node, true)) expect(ids).toContain(ref);
  }
  expect(ofType(graph, 'Organization').map((n) => n['@id'])).toEqual([ORGANIZATION_ID]);
  expect(ofType(graph, 'Person').map((n) => n['@id'])).toEqual([FOUNDER_ID]);
  expect(ofType(graph, 'WebSite').map((n) => n['@id'])).toEqual([WEBSITE_ID]);
  expect(ofType(graph, 'LocalBusiness').map((n) => n['@id'])).toEqual([LOCAL_BUSINESS_ID]);
  expect(ofType(graph, 'Organization')[0].founder).toEqual({ '@id': FOUNDER_ID });
}

/** WebPage: url = Canonical, name = Title-Tag, description = Meta-Beschreibung, alles aus den Metadaten der Seite. */
function expectWebPage(graph: PageGraph, metadata: Metadata) {
  const page = webPage(graph);
  const canonical = metadata.alternates?.canonical;
  expect(typeof canonical).toBe('string');
  expect(page).toMatchObject({
    '@id': fragmentId(String(canonical), 'webpage'),
    url: canonical,
    name: documentTitle(metadata.title),
    description: metadata.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    inLanguage: 'de-DE',
  });
  expect(page.name).toBeTruthy();
  expect(page.description).toBeTruthy();
  return page;
}

const RICH = ['BreadcrumbList', 'JobPosting', 'FAQPage'];

describe('Hilfen', () => {
  it('Canonical der Startseite ohne Schrägstrich, wie Next ihn rendert; sonst ohne Schrägstrich am Ende', () => {
    const origin = new URL(getCleanCanonicalUrl('/jobs')).origin;
    expect(getCleanCanonicalUrl('/')).toBe(origin);
    expect(getCleanCanonicalUrl('')).toBe(origin);
    expect(getCleanCanonicalUrl('/jobs/')).toBe(`${origin}/jobs`);
    expect(getCleanCanonicalUrl('bewerbung')).toBe(`${origin}/bewerbung`);
  });

  it('fragmentId hängt das Fragment in URL-Normalform an', () => {
    expect(fragmentId('https://karriere.bad-energie.de', 'webpage')).toBe('https://karriere.bad-energie.de/#webpage');
    expect(fragmentId('https://karriere.bad-energie.de/jobs', 'webpage')).toBe('https://karriere.bad-energie.de/jobs#webpage');
  });

  it('documentTitle rendert wie das Root-Layout: absolute bleibt, sonst im Template', () => {
    expect(documentTitle('Impressum')).toBe(TITLE_TEMPLATE.replace('%s', 'Impressum'));
    expect(documentTitle('Impressum')).toBe('Impressum | Bad & Energie Karriere');
    expect(documentTitle({ absolute: 'Eigener Titel' })).toBe('Eigener Titel');
    expect(documentTitle({ default: 'Standard', template: '%s | X' })).toBe('Standard | Bad & Energie Karriere');
    expect(documentTitle('Preis $& Co')).toBe('Preis $& Co | Bad & Energie Karriere');
    expect(documentTitle(null)).toBeUndefined();
  });

  it('serializeJsonLdScript escapt „<“ und Zeilentrenner und bleibt gültiges JSON (vorher serializeJsonLd)', () => {
    const trenner = String.fromCharCode(0x2028, 0x2029);
    const out = serializeJsonLdScript({ a: '</script><b>', b: trenner });
    expect(out).not.toContain('<');
    expect(out).not.toContain(String.fromCharCode(0x2028));
    expect(out).not.toContain(String.fromCharCode(0x2029));
    expect(JSON.parse(out)).toEqual({ a: '</script><b>', b: trenner });
  });
});

describe('buildPageGraph', () => {
  const metadata = generatePageMetadata({ title: 'Titel der Seite', description: 'Beschreibung der Seite', path: '/probe' });

  it('eine Wurzel mit @context und @graph: globale Knoten, dann WebPage', () => {
    const graph = buildPageGraph({ metadata });
    expectSoundGraph(graph);
    expect(nodes(graph).map((n) => n['@type'])).toEqual(['Organization', 'Person', 'WebSite', 'LocalBusiness', 'WebPage']);
    const page = expectWebPage(graph, metadata);
    expect(page.name).toBe('Titel der Seite | Bad & Energie Karriere');
    expect(page.breadcrumb).toBeUndefined();
  });

  it('ohne Canonical (404) nur die globalen Knoten', () => {
    const graph = buildPageGraph({ metadata: { title: 'Seite nicht gefunden', robots: null } });
    expectSoundGraph(graph);
    expect(ofType(graph, 'WebPage')).toHaveLength(0);
  });

  it('noindex: nichts, was ein Rich Result auslöst, auch wenn es übergeben wird', () => {
    const job = liveJobs()[0];
    const graph = buildPageGraph({
      metadata: generatePageMetadata({ title: 'Besetzt', description: 'Besetzt', path: jobPath(job), noindex: true }),
      jobPosting: buildJobPostingJsonLd(job),
      breadcrumb: buildBreadcrumbJsonLd(job),
      faq: buildFaqPageJsonLd(getFaqItems()),
    });
    expectSoundGraph(graph);
    for (const type of RICH) expect(ofType(graph, type)).toHaveLength(0);
    expect(webPage(graph).breadcrumb).toBeUndefined();
  });

  it('legal (noindex über type) ebenso', () => {
    const graph = buildPageGraph({
      metadata: generatePageMetadata({ title: 'Recht', description: 'Recht', path: '/jobs', type: 'legal' }),
      breadcrumb: buildJobsBreadcrumbJsonLd(),
    });
    expect(ofType(graph, 'BreadcrumbList')).toHaveLength(0);
  });

  it('ein JobPosting ohne Kanal (null) fällt weg', () => {
    const job = liveJobs()[0];
    const graph = buildPageGraph({ metadata: generatePageMetadata({ title: 'T', description: 'D', path: jobPath(job) }), jobPosting: null });
    expect(ofType(graph, 'JobPosting')).toHaveLength(0);
  });
});

describe('Graph je Seite (V6-B)', () => {
  it('/ trägt WebPage und die einzige FAQPage (@id /#faq) mit dem sichtbaren Wortlaut', () => {
    const metadata = homeMetadata();
    const graph = onlyGraph(HomePage());
    expectSoundGraph(graph);
    const page = expectWebPage(graph, metadata);
    expect(page.url).toBe(getCleanCanonicalUrl('/'));
    expect(page['@id']).toBe(`${getCleanCanonicalUrl('/')}/#webpage`);
    expect(page.breadcrumb).toBeUndefined();
    const [faq] = ofType(graph, 'FAQPage');
    const { '@context': _context, ...expected } = buildFaqPageJsonLd(getFaqItems());
    expect(faq).toEqual({ ...expected, isPartOf: { '@id': page['@id'] } });
    expect(faq['@id']).toBe(fragmentId(getCleanCanonicalUrl('/'), 'faq'));
    expect(ofType(graph, 'FAQPage')).toHaveLength(1);
    expect(ofType(graph, 'JobPosting')).toHaveLength(0);
    expect(ofType(graph, 'BreadcrumbList')).toHaveLength(0);
  });

  it('/jobs trägt WebPage mit Verweis auf die BreadcrumbList des sichtbaren Pfads, kein JobPosting', () => {
    const metadata = jobsMetadata();
    const graph = onlyGraph(JobsPage());
    expectSoundGraph(graph);
    const page = expectWebPage(graph, metadata);
    const [crumbs] = ofType(graph, 'BreadcrumbList');
    const { '@context': _context, ...expected } = buildJobsBreadcrumbJsonLd();
    expect(crumbs).toEqual(expected);
    expect(crumbs['@id']).toBe(fragmentId(getCleanCanonicalUrl('/jobs'), 'breadcrumb'));
    expect(page.breadcrumb).toEqual({ '@id': crumbs['@id'] });
    expect(ofType(graph, 'JobPosting')).toHaveLength(0);
    expect(ofType(graph, 'FAQPage')).toHaveLength(0);
  });

  const jobGraph = async (job: Job) => {
    const params = Promise.resolve({ slug: job.slug });
    return { graph: onlyGraph(await JobPage({ params })), metadata: await jobMetadata({ params }) };
  };

  it.each(liveJobs().map((job) => [job.id, job] as const))('%s: JobPosting mit mainEntityOfPage = WebPage', async (_id, job) => {
    const { graph, metadata } = await jobGraph(job);
    expectSoundGraph(graph);
    const page = expectWebPage(graph, metadata);
    expect(page.url).toBe(jobUrl(job));
    const postings = ofType(graph, 'JobPosting');
    expect(postings).toHaveLength(1);
    const { '@context': _context, ...expected } = buildJobPostingJsonLd(job)!;
    expect(postings[0]).toEqual({ ...expected, mainEntityOfPage: { '@id': page['@id'] } });
    expect(postings[0].url).toBe(page.url);
    expect((postings[0].hiringOrganization as Node)['@id']).toBe(ORGANIZATION_ID);
    const [crumbs] = ofType(graph, 'BreadcrumbList');
    expect(crumbs['@id']).toBe(fragmentId(jobUrl(job), 'breadcrumb'));
    expect(page.breadcrumb).toEqual({ '@id': crumbs['@id'] });
    expect(ofType(graph, 'FAQPage')).toHaveLength(0);
  });

  it('besetzte Stelle (noindex): nur WebPage, kein JobPosting, keine BreadcrumbList', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(new Date(azubi.validThrough!).getTime() + 24 * 60 * 60 * 1000));
    const { graph, metadata } = await jobGraph(azubi);
    expect(metadata.robots).toMatchObject({ index: false });
    expectSoundGraph(graph);
    expectWebPage(graph, metadata);
    for (const type of RICH) expect(ofType(graph, type)).toHaveLength(0);
  });

  it.each([
    ['/bewerbung/mappe', () => MappePage(), mappeMetadata],
    ['/bewerbung/danke', () => DankePage(), dankeMetadata],
    ['/datenschutz', () => DatenschutzPage(), datenschutzMetadata],
    ['/impressum', () => ImpressumPage(), impressumMetadata],
  ] as const)('%s (noindex): WebPage ohne Rich-Result-Knoten', (pfad, render, metadata) => {
    const graph = onlyGraph(render());
    expectSoundGraph(graph);
    expect(webPage(graph).url).toBe(getCleanCanonicalUrl(pfad));
    expectWebPage(graph, metadata);
    for (const type of RICH) expect(ofType(graph, type)).toHaveLength(0);
  });

  it('/bewerbung: WebPage aus den Metadaten der Seite (Rendern: components/apply/seite/__tests__)', () => {
    const graph = buildPageGraph({ metadata: bewerbungMetadata });
    expectSoundGraph(graph);
    expect(expectWebPage(graph, bewerbungMetadata).url).toBe(getCleanCanonicalUrl('/bewerbung'));
  });

  it('404: der eine Graph mit den globalen Knoten, ohne WebPage (keine Canonical-URL)', () => {
    const graph = onlyGraph(NotFound());
    expect(notFoundMetadata.alternates).toBeUndefined();
    expectSoundGraph(graph);
    expect(ofType(graph, 'WebPage')).toHaveLength(0);
  });

  it('gerendert genau ein JSON-LD-Block mit @graph (Rechtsseiten, 404, /jobs)', () => {
    for (const element of [createElement(DatenschutzPage), createElement(ImpressumPage), createElement(NotFound), createElement(JobsPage)]) {
      const html = renderToStaticMarkup(element);
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      expect(blocks).toHaveLength(1);
      expect(Array.isArray(JSON.parse(blocks[0][1])['@graph'])).toBe(true);
    }
  });
});

describe('Quellen: je Seite ein Aufruf, das Layout ohne JSON-LD', () => {
  const SEITEN = [
    'app/page.tsx',
    'app/jobs/page.tsx',
    'app/jobs/[slug]/page.tsx',
    'app/bewerbung/page.tsx',
    'app/bewerbung/mappe/page.tsx',
    'app/bewerbung/danke/page.tsx',
    'app/datenschutz/page.tsx',
    'app/impressum/page.tsx',
    'app/not-found.tsx',
  ];

  it.each(SEITEN)('%s: genau ein buildPageGraph und ein <JsonLd>', (datei) => {
    const text = quelle(datei);
    expect(text.match(/buildPageGraph\(/g)).toHaveLength(1);
    expect(text.match(/<JsonLd\b/g)).toHaveLength(1);
    expect(text).not.toMatch(/application\/ld\+json/);
  });

  it('Root-Layout und FAQ-Abschnitt rendern kein JSON-LD mehr', () => {
    for (const datei of ['app/layout.tsx', 'app/bewerbung/layout.tsx', 'components/home/FaqSection.tsx']) {
      expect(quelle(datei)).not.toMatch(/<JsonLd\b|application\/ld\+json|buildSiteNodes|buildFaqPageJsonLd\(/);
    }
  });

  it('nur der Graph baut den WebPage-Knoten (keine zweite Quelle in den Seiten)', () => {
    for (const datei of SEITEN) expect(quelle(datei)).not.toMatch(/'@type':\s*'WebPage'|#webpage/);
    expect(quelle('lib/seo/graph.ts')).toMatch(/'@type': 'WebPage'/);
  });
});
