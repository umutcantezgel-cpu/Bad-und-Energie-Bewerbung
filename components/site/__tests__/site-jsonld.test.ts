import { describe, expect, it } from 'vitest';
import { ORGANIZATION_ID, buildSiteJsonLd } from '../site-jsonld';
import { getActiveJobs } from '@/lib/jobs/registry';
import { buildJobPostingJsonLd } from '@/lib/jobs/jsonld';

describe('buildSiteJsonLd', () => {
  const graph = buildSiteJsonLd()['@graph'];
  const types = graph.map((node) => node['@type']);

  it('contains only Organization, WebSite and LocalBusiness', () => {
    expect(types).toEqual(['Organization', 'WebSite', 'LocalBusiness']);
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
    for (const ref of refs) expect(ids).toContain(JSON.parse(ref)['@id']);
  });

  it('has no job, FAQ or breadcrumb nodes', () => {
    const json = JSON.stringify(graph);
    for (const type of ['JobPosting', 'FAQPage', 'BreadcrumbList', 'Brand', 'SearchAction']) {
      expect(json).not.toContain(`"${type}"`);
    }
  });
});
