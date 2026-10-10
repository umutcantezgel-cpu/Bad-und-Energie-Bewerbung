import { describe, expect, it } from 'vitest';

import { buildFaqPageJsonLd } from '@/components/home/content';
import { getFaqItems } from '@/lib/content/faq';
import { jobPath } from '@/lib/jobs/format';
import { buildBreadcrumbJsonLd, buildJobPostingJsonLd, buildJobsBreadcrumbJsonLd } from '@/lib/jobs/jsonld';
import { getActiveJobs } from '@/lib/jobs/registry';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import { buildPageGraph, type PageGraph } from '@/lib/seo/graph';
import { documentTitle, generatePageMetadata } from '@/lib/seo/metadata';
import { graphProblems, jobPostingProblems } from '../check-graph.mjs';

type Node = Record<string, unknown>;

/** Kopf einer gebauten Seite mit denselben Werten, die Next aus den Metadaten rendert (Entities wie React). */
function head(path: string, title: string, description: string): string {
  const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<title>${esc(title)}</title><meta name="description" content="${esc(description)}"/><link rel="canonical" href="${getCleanCanonicalUrl(path)}"/>`;
}

function fixture(path: string, extra: Omit<Parameters<typeof buildPageGraph>[0], 'metadata'> = {}) {
  const metadata = generatePageMetadata({ title: 'Stellen & mehr', description: 'Beschreibung "mit" Zeichen', path });
  const graph = buildPageGraph({ metadata, ...extra });
  return { graph, html: head(path, documentTitle(metadata.title)!, 'Beschreibung "mit" Zeichen') };
}

const clone = (graph: PageGraph): { '@context': string; '@graph': Node[] } => JSON.parse(JSON.stringify(graph));
const node = (graph: { '@graph': Node[] }, type: string) => graph['@graph'].find((n) => n['@type'] === type)!;
const problems = (root: unknown, html: string) => graphProblems(root, html).problems;

describe('check-graph: graphProblems (V6-B)', () => {
  const job = getActiveJobs()[0];

  it('der Graph aus lib/seo/graph.ts besteht auf /jobs, einer Stellenseite, der Startseite und einer Seite ohne Canonical', () => {
    const jobs = fixture('/jobs', { breadcrumb: buildJobsBreadcrumbJsonLd() });
    expect(problems(jobs.graph, jobs.html)).toEqual([]);

    const stelle = fixture(jobPath(job), { breadcrumb: buildBreadcrumbJsonLd(job), jobPosting: buildJobPostingJsonLd(job) });
    const result = graphProblems(stelle.graph, stelle.html);
    expect(result.problems).toEqual([]);
    const posting = node(clone(stelle.graph), 'JobPosting');
    expect(jobPostingProblems(posting, getCleanCanonicalUrl(jobPath(job)), result.pageId)).toEqual([]);

    const start = fixture('/', { faq: buildFaqPageJsonLd(getFaqItems()) });
    expect(problems(start.graph, start.html)).toEqual([]);

    const ohne = buildPageGraph({ metadata: { title: '404' } });
    expect(problems(ohne, '<title>404</title>')).toEqual([]);
  });

  it('meldet eine Wurzel ohne @graph oder mit falschem @context', () => {
    const { html } = fixture('/jobs');
    expect(problems([{ '@type': 'WebPage' }], html)).toContain('root is not an object');
    expect(problems({ '@context': 'https://schema.org', '@type': 'WebPage' }, html)).toContain('root has no @graph');
    expect(problems({ '@context': 'http://schema.org', '@graph': [] }, html)).toContain('root @context must be "https://schema.org"');
  });

  it('meldet nicht auflösbare @id-Verweise und doppelte @ids', () => {
    const { graph, html } = fixture('/jobs', { breadcrumb: buildJobsBreadcrumbJsonLd() });
    const ohnePerson = clone(graph);
    ohnePerson['@graph'] = ohnePerson['@graph'].filter((n) => n['@type'] !== 'Person');
    expect(problems(ohnePerson, html).join('\n')).toMatch(/unresolved @id reference ".*#founder"/);

    const doppelt = clone(graph);
    doppelt['@graph'].push({ ...node(doppelt, 'LocalBusiness') });
    expect(problems(doppelt, html).join('\n')).toMatch(/duplicate @id/);
  });

  it('meldet einen zweiten WebPage-Knoten mit url, eine falsche url, @id, name und description', () => {
    const { graph, html } = fixture('/jobs');
    const zwei = clone(graph);
    zwei['@graph'].push({ ...node(zwei, 'WebPage'), '@id': 'https://example.org/#webpage' });
    expect(problems(zwei, html)).toContain('expected exactly 1 WebPage node with url, found 2');

    const falsch = clone(graph);
    Object.assign(node(falsch, 'WebPage'), { url: `${getCleanCanonicalUrl('/jobs')}/`, name: 'Anders', description: 'Anders' });
    const text = problems(falsch, html).join('\n');
    expect(text).toMatch(/WebPage url .* differs from canonical/);
    expect(text).toMatch(/WebPage name "Anders" differs from <title>/);
    expect(text).toMatch(/WebPage description differs/);

    const id = clone(graph);
    node(id, 'WebPage')['@id'] = `${getCleanCanonicalUrl('/jobs')}#seite`;
    expect(problems(id, html).join('\n')).toMatch(/is not canonical#webpage/);
  });

  it('ohne Canonical (404) kein WebPage-Knoten', () => {
    const { graph } = fixture('/jobs');
    expect(problems(graph, '<title>x</title>').join('\n')).toMatch(/no canonical, but 1 WebPage/);
  });

  it('meldet BreadcrumbList ohne Verweis und Verweis ohne BreadcrumbList', () => {
    const { graph, html } = fixture('/jobs', { breadcrumb: buildJobsBreadcrumbJsonLd() });
    const ohneVerweis = clone(graph);
    delete node(ohneVerweis, 'WebPage').breadcrumb;
    expect(problems(ohneVerweis, html)).toContain('WebPage.breadcrumb must reference the BreadcrumbList');

    const ohneListe = clone(graph);
    ohneListe['@graph'] = ohneListe['@graph'].filter((n) => n['@type'] !== 'BreadcrumbList');
    expect(problems(ohneListe, html).join('\n')).toMatch(/unresolved @id reference ".*#breadcrumb"/);
  });

  it('meldet ein eigenes @context im Knoten, eine FAQPage ohne isPartOf und einen falschen Gründer-Verweis', () => {
    const { graph, html } = fixture('/', { faq: buildFaqPageJsonLd(getFaqItems()) });
    const kaputt = clone(graph);
    node(kaputt, 'FAQPage')['@context'] = 'https://schema.org';
    delete node(kaputt, 'FAQPage').isPartOf;
    node(kaputt, 'Organization').founder = { '@id': node(kaputt, 'WebSite')['@id'] };
    const text = problems(kaputt, html).join('\n');
    expect(text).toMatch(/carries its own @context/);
    expect(text).toMatch(/FAQPage must point to the WebPage via isPartOf/);
    expect(text).toMatch(/Organization.founder must reference the Person node/);
  });

  it('globale @ids müssen in allen Dokumenten gleich sein', () => {
    const ids = {};
    const a = fixture('/jobs');
    expect(graphProblems(a.graph, a.html, ids).problems).toEqual([]);
    const b = clone(fixture('/bewerbung').graph);
    const person = node(b, 'Person');
    person['@id'] = 'https://example.org/#founder';
    node(b, 'Organization').founder = { '@id': person['@id'] };
    expect(graphProblems(b, head('/bewerbung', 'Stellen & mehr | Bad & Energie Karriere', 'Beschreibung "mit" Zeichen'), ids).problems.join('\n')).toMatch(
      /Person @id "https:\/\/example.org\/#founder" differs/,
    );
  });

  it('JobPosting: mainEntityOfPage muss auf den WebPage-Knoten zeigen', () => {
    const { graph } = fixture(jobPath(job), { jobPosting: buildJobPostingJsonLd(job) });
    const posting = node(clone(graph), 'JobPosting');
    const canonical = getCleanCanonicalUrl(jobPath(job));
    expect(jobPostingProblems({ ...posting, mainEntityOfPage: undefined }, canonical, `${canonical}#webpage`).join('\n')).toMatch(
      /mainEntityOfPage must reference the WebPage node/,
    );
  });
});
