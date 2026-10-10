import { describe, expect, it } from 'vitest';
import { FOUNDER_ID, ORGANIZATION_ID, WEBSITE_ID, buildSiteNodes } from '../site-jsonld';
import { COMPANY, REGION } from '@/lib/content';
import { getActiveJobs } from '@/lib/jobs/registry';
import { buildJobPostingJsonLd } from '@/lib/jobs/jsonld';

type Node = Record<string, unknown>;

describe('buildSiteNodes', () => {
  // V6-B: die globalen Knoten als Liste; jede Seite setzt sie in ihren einen @graph (lib/seo/graph.ts).
  const graph: readonly Node[] = buildSiteNodes();
  const types = graph.map((node) => node['@type']);

  it('contains only Organization, Person (founder), WebSite and LocalBusiness, without @context', () => {
    expect(types).toEqual(['Organization', 'Person', 'WebSite', 'LocalBusiness']);
    for (const node of graph) expect(node['@context']).toBeUndefined();
  });

  it('keeps the organization @id that JobPostings reference', () => {
    expect(ORGANIZATION_ID).toBe('https://bad-energie.de/#organization');
    for (const job of getActiveJobs()) {
      const posting = buildJobPostingJsonLd(job);
      if (posting) expect(posting.hiringOrganization['@id']).toBe(ORGANIZATION_ID);
    }
  });

  it('resolves every internal @id reference', () => {
    const ids = new Set(graph.map((node) => node['@id']));
    const refs = JSON.stringify(graph).match(/\{"@id":"[^"]+"\}/g) ?? [];
    expect(refs.length).toBeGreaterThanOrEqual(3);
    for (const ref of refs) expect(ids).toContain(JSON.parse(ref)['@id']);
  });

  it('has no page, job, FAQ or breadcrumb nodes', () => {
    const json = JSON.stringify(graph);
    for (const type of ['WebPage', 'JobPosting', 'FAQPage', 'BreadcrumbList', 'Brand', 'SearchAction']) {
      expect(json).not.toContain(`"${type}"`);
    }
  });

  const node = (type: string) => graph.find((n) => n['@type'] === type) as Node;

  // V6-B (ersetzt E-SEO-006 „eingebettet, ohne @id“): eigener Personenknoten, die Organisation verweist darauf.
  it('describes the founder as a Person node with its own @id, referenced by Organization.founder', () => {
    expect(FOUNDER_ID).toBe('https://bad-energie.de/#founder');
    expect(node('Person')).toEqual({
      '@type': 'Person',
      '@id': FOUNDER_ID,
      name: COMPANY.managingDirector.name,
      jobTitle: COMPANY.managingDirector.title,
    });
    expect(node('Organization').founder).toEqual({ '@id': FOUNDER_ID });
  });

  it('marks the career site as part of the customer website', () => {
    expect(node('WebSite')['@id']).toBe(WEBSITE_ID);
    expect(node('WebSite').publisher).toEqual({ '@id': ORGANIZATION_ID });
    const isPartOf = node('WebSite').isPartOf as Node;
    expect(isPartOf['@type']).toBe('WebSite');
    expect(isPartOf.url).toBe('https://bad-energie.de');
    expect(isPartOf.name).toBe(COMPANY.legalName);
  });

  // E-SEO-009
  it('serves three named circles from the region data, 35 000 m around the head office', () => {
    const circles = node('LocalBusiness').areaServed as Node[];
    expect(circles).toHaveLength(3);
    expect(circles.map((c) => c.name)).toEqual(REGION.areas.map((area) => area.name));
    expect(circles.map((c) => c.geoRadius)).toEqual(REGION.areas.map((area) => area.radiusKm * 1000));
    REGION.areas.forEach((area, index) => {
      for (const city of area.cities) expect(circles[index].description).toContain(city);
    });

    const outer = circles.find((c) => c.geoRadius === 35_000) as Node;
    expect(outer.geoMidpoint).toMatchObject({ latitude: COMPANY.geo.latitude, longitude: COMPANY.geo.longitude });

    const giessen = REGION.locations.find((l) => l.name === 'Gießen');
    expect(circles[1].geoMidpoint).toMatchObject({ latitude: giessen?.latitude, longitude: giessen?.longitude });
    expect(JSON.stringify(circles)).not.toContain('Hohenahr');
  });

  it('parses as JSON', () => {
    expect(() => JSON.parse(JSON.stringify(buildSiteNodes()))).not.toThrow();
  });
});
