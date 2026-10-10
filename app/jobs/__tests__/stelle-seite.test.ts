import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import JobPage from '@/app/jobs/[slug]/page';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { getActiveJobs, getJobById } from '@/lib/jobs/registry';

const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
const am = getJobById('anlagenmechaniker-shk')!;

async function render(slug: string): Promise<string> {
  return renderToStaticMarkup(await JobPage({ params: Promise.resolve({ slug }) }));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('/jobs/[slug]: offene Stelle', () => {
  it('genau ein JobPosting, eine h1, Flow unter #bewerben, Tonfolge mit Navy-Stimme', async () => {
    const html = await render(am.slug);
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    expect(ld).toHaveLength(1);
    const knoten = [ld[0]].flat();
    expect(knoten.filter((k) => k['@type'] === 'JobPosting')).toHaveLength(1);
    expect(knoten.filter((k) => k['@type'] === 'BreadcrumbList')).toHaveLength(1);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<section[^>]*id="bewerben"/);
    expect(html).toContain('data-tone="inverse"');
  });
});

/** Sichtbare Wörter der Seite (ohne Skripte, SVG und Tags), wie die Wortzählung im Paket V6-G2. */
function woerter(html: string): string[] {
  const text = html
    .replace(/<script\b[\s\S]*?<\/script>/g, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&amp;', '&')
    .replace(/­/g, '');
  return text.match(/[\p{L}\p{N}][\p{L}\p{N}.\-–]*/gu) ?? [];
}

describe('/jobs/[slug]: SEO im sichtbaren Text (V6-G2)', () => {
  const offen = getActiveJobs().filter((job) => job.status === 'published');

  it.each(offen.map((job) => [job.id, job] as const))('%s: Fokus-Keyword in den ersten 100 Wörtern, alle Wörter des Titels sichtbar', async (_id, job) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'));
    const alle = woerter(await render(job.slug));
    const klein = (w: string) => w.toLocaleLowerCase('de-DE').replace(/[.–-]+$/, '');
    const erste = new Set(alle.slice(0, 100).map(klein));
    for (const wort of job.seo.primaryKeyword.split(/\s+/)) expect(erste.has(klein(wort)), `${job.id}: ${wort}`).toBe(true);
    const sichtbar = new Set(alle.map(klein));
    const titel = job.seo.metaTitle.match(/[\p{L}\p{N}]{2,}/gu) ?? [];
    for (const wort of titel.filter((w) => !/^(m|w|d)$/.test(w))) expect(sichtbar.has(klein(wort)), `${job.id}: ${wort}`).toBe(true);
    expect(alle.length, job.id).toBeGreaterThanOrEqual(650);
  });
});

describe('/jobs/[slug]: besetzte Stelle', () => {
  it('Kopf „Diese Stelle ist besetzt“ mit Initiativbewerbung, ohne JobPosting', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(new Date(azubi.validThrough!).getTime() + 24 * 60 * 60 * 1000));
    const html = await render(azubi.slug);
    expect(html).not.toContain('JobPosting');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Diese Stelle ist besetzt<\/h1>/);
    expect(html).toContain('data-seitenkopf="arbeit"');
    expect(html).toContain(`href="${INITIATIVE_APPLY_PATH.replace(/&/g, '&amp;')}"`);
    expect(html).toContain('href="/jobs"');
    expect(html).toContain('Brotkrümelnavigation');
  });
});
