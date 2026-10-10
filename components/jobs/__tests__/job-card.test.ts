import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobAbgaenge, JobCard, salaryUnitLabel } from '@/components/jobs/JobCard';
import { employmentLabel, formatSalaryAmount, jobPath } from '@/lib/jobs/format';
import { getActiveJobs, getJobById, isJobLive } from '@/lib/jobs/registry';

const SHY = '\u00AD';
const am = getJobById('anlagenmechaniker-shk')!;
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
const source = readFileSync(path.resolve(__dirname, '../JobCard.tsx'), 'utf8');
const render = (props: Parameters<typeof JobCard>[0]) => renderToStaticMarkup(createElement(JobCard, props));

describe('JobCard (R3-HOME-02)', () => {
  it('stays a Server Component and uses the own icon family instead of lucide', () => {
    expect(source).not.toMatch(/['"]use client['"]/);
    expect(source).not.toMatch(/\buse(State|Effect|Ref|Context)\b/);
    expect(source).not.toMatch(/lucide-react/);
    expect(source).toMatch(/@\/components\/icons/);
  });

  it('default variant keeps its contract for /jobs and „Weitere Stellen“ (one link, heading, summary, salary)', () => {
    const html = render({ job: am, headingLevel: 'h2' });
    expect(html).toMatch(/^<article/);
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toMatch(/<h2[^>]*><a [^>]*>Anlagenmechaniker SHK<\/a>/);
    expect(html).toContain(am.summary);
    expect(html).toContain('Vollzeit');
    expect(html).toContain(formatSalaryAmount(am)!);
    expect(render({ job: azubi })).toMatch(/<h3/);
    expect(render({ job: am, className: 'bg-surface-raised' })).toContain('bg-surface-raised');
  });

  it('abgang variant: one link to the job page, salary as a measure with its unit, employment, no summary', () => {
    const html = render({ job: am, variant: 'abgang' }).replaceAll(SHY, '');
    expect(html).toMatch(/^<article/);
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain(`href="${jobPath(am)}"`);
    expect(html).toMatch(/<h3[^>]*><a [^>]*>Anlagenmechaniker SHK<\/a>/);
    expect(html).toContain('(m/w/d)');
    expect(html).toMatch(new RegExp(`class="[^"]*font-mass[^"]*">${formatSalaryAmount(am)}<`));
    expect(html).toContain('Gehalt / Monat');
    expect(html).toContain(employmentLabel(am));
    expect(html).not.toContain(am.summary);
    expect(render({ job: azubi, variant: 'abgang' })).toContain('Vergütung / Monat');
  });

  it('abgang variant: employment right under the title, salary and unit together after it; focus ring inside', () => {
    const html = render({ job: am, variant: 'abgang' });
    expect(html.indexOf(employmentLabel(am))).toBeLessThan(html.indexOf(formatSalaryAmount(am)!));
    expect(html.indexOf(formatSalaryAmount(am)!)).toBeLessThan(html.indexOf('Gehalt / Monat'));
    expect(html).toContain('focus-visible:after:-outline-offset-3');
    expect(html).not.toContain('outline-offset-0');
  });

  it('abgang variant: supply and return stubs are decorative, motion only through register ids', () => {
    const html = render({ job: am, variant: 'abgang' });
    expect(html).toMatch(/<span aria-hidden="true" class="[^"]*bg-vorlauf/);
    expect(html).toMatch(/<span aria-hidden="true" class="[^"]*bg-ruecklauf/);
    expect([...html.matchAll(/data-motion="([^"]+)"/g)].map((m) => m[1]).sort()).toEqual(['druck', 'flaeche']);
  });

  it('salaryUnitLabel names pay or apprenticeship pay per unit', () => {
    expect(salaryUnitLabel(am)).toBe('Gehalt / Monat');
    expect(salaryUnitLabel(azubi)).toBe('Vergütung / Monat');
    expect(salaryUnitLabel({ ...am, salary: undefined })).toBeNull();
  });
});

describe('JobAbgaenge (E-START-023 on the home page)', () => {
  const live = getActiveJobs().filter((job) => isJobLive(job, new Date('2026-10-09T12:00:00Z')));
  const html = renderToStaticMarkup(createElement(JobAbgaenge, { jobs: live, 'aria-label': `${live.length} offene Stellen` }));

  it('draws the manifold lines on the list itself (no stray elements inside <ul>)', () => {
    expect(html).toMatch(/^<ul aria-label="4 offene Stellen" class="[^"]*before:bg-vorlauf[^"]*after:bg-ruecklauf/);
    expect(html.match(/<ul[^>]*>(<li>[\s\S]*?<\/li>)*<\/ul>$/)).not.toBeNull();
  });

  it('shows four rows, each linking to its job page with exactly the salary of job.salary', () => {
    expect(live).toHaveLength(4);
    expect(html.match(/<li>/g)).toHaveLength(4);
    for (const job of live) {
      expect(html).toContain(`href="${jobPath(job)}"`);
      expect(html).toContain(`>${formatSalaryAmount(job)}<`);
    }
    expect(html.match(/<h3/g)).toHaveLength(4);
  });

  it('long titles carry the soft hyphens of titleShy and keep „/“ at the line end (320 px)', () => {
    expect(html).toContain(`Kunden${SHY}dienst${SHY}techniker`);
    expect(html).toContain(`Ober${SHY}monteur\u00A0/ Projekt${SHY}leiter`);
    expect(html.replaceAll(SHY, '').replaceAll('\u00A0', ' ')).toContain('>Obermonteur / Projektleiter</a>');
  });
});
