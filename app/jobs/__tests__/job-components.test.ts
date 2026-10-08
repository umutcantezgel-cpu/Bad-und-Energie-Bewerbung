import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobCard } from '@/components/jobs/JobCard';
import { SalaryCard } from '@/components/jobs/SalaryCard';
import { getMoreJobs } from '@/components/jobs/MoreJobs';
import { lowerFirst, pageTitle, splitLabel, withSoftHyphens } from '@/components/jobs/text';
import { formatSalaryAmount, jobPath } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, getJobById } from '@/lib/jobs/registry';

const SHY = '­';
const am = getJobById('anlagenmechaniker-shk')!;
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;

describe('withSoftHyphens', () => {
  it('carries the soft hyphens of titleShy over to seo.h1', () => {
    expect(withSoftHyphens(am.seo.h1, am.titleShy)).toBe(`Anlagen${SHY}mechaniker SHK (m/w/d) in Wetzlar`);
    expect(withSoftHyphens(azubi.seo.h1, azubi.titleShy)).toBe(
      `Ausbildung Anlagen${SHY}mechaniker SHK – Einstieg 2026 noch möglich`,
    );
  });

  it('keeps the visible text of every job h1 unchanged', () => {
    for (const job of ALL_JOBS) {
      expect(withSoftHyphens(job.seo.h1, job.titleShy).split(SHY).join('')).toBe(job.seo.h1);
    }
  });

  it('replaces whole words only', () => {
    expect(withSoftHyphens('Anlagenmechanikerin', `Anlagen${SHY}mechaniker`)).toBe('Anlagenmechanikerin');
    expect(withSoftHyphens('Anlagenmechaniker, SHK', `Anlagen${SHY}mechaniker`)).toBe(`Anlagen${SHY}mechaniker, SHK`);
  });
});

describe('text helpers', () => {
  it('pageTitle adds the brand only within 60 characters', () => {
    expect(pageTitle('Kurzer Titel')).toEqual({ absolute: 'Kurzer Titel | Bad & Energie Karriere' });
    for (const job of ALL_JOBS) {
      const { absolute } = pageTitle(job.seo.metaTitle);
      expect(absolute.length).toBeLessThanOrEqual(60);
      expect(absolute.startsWith(job.seo.metaTitle)).toBe(true);
    }
    expect(pageTitle('Stellenangebote SHK Wetzlar & Gießen – alle offenen Jobs').absolute.length).toBeLessThanOrEqual(60);
  });

  it('splitLabel and lowerFirst', () => {
    expect(splitLabel('Gehalt: 3.600 € / Monat')).toEqual({ label: 'Gehalt', value: '3.600 € / Monat' });
    expect(splitLabel('ohne Label')).toBeNull();
    expect(lowerFirst('Freitags ab 13:30 Uhr Feierabend')).toBe('freitags ab 13:30 Uhr Feierabend');
  });
});

describe('JobCard', () => {
  it('is a Server Component (no client directive, no hooks)', () => {
    const source = readFileSync(path.resolve(__dirname, '../../../components/jobs/JobCard.tsx'), 'utf8');
    expect(source).not.toMatch(/['"]use client['"]/);
    expect(source).not.toMatch(/\buse(State|Effect|Ref|Context)\b/);
  });

  it('renders one link to the job page, the heading level, meta line and salary', () => {
    const html = renderToStaticMarkup(createElement(JobCard, { job: am, headingLevel: 'h2' }));
    expect(html).toMatch(/^<article/);
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain(`href="${jobPath(am)}"`);
    expect(html).toMatch(/<h2[^>]*><a [^>]*>Anlagenmechaniker SHK<\/a>/);
    expect(html).toContain(am.summary);
    expect(html).toContain('Vollzeit');
    expect(html).toContain(formatSalaryAmount(am)!);
  });

  it('defaults to h3', () => {
    const html = renderToStaticMarkup(createElement(JobCard, { job: azubi }));
    expect(html).toMatch(/<h3/);
    expect(html).not.toMatch(/<h2/);
  });
});

describe('SalaryCard', () => {
  it('shows exactly the salary range of the job (parity with JobPosting.baseSalary)', () => {
    const html = renderToStaticMarkup(createElement(SalaryCard, { job: am }));
    expect(html).toContain(formatSalaryAmount(am)!);
    expect(html).toContain('Gehalt pro Monat');
    const azubiHtml = renderToStaticMarkup(createElement(SalaryCard, { job: azubi }));
    expect(azubiHtml).toContain('Vergütung pro Monat');
  });

  it('renders nothing without a salary', () => {
    const helper = getJobById('quereinsteiger-montagehelfer')!;
    expect(renderToStaticMarkup(createElement(SalaryCard, { job: helper }))).toBe('');
  });
});

describe('getMoreJobs', () => {
  it('leaves out the current job and only lists published jobs', () => {
    const more = getMoreJobs(am, new Date('2026-10-08T00:00:00Z'));
    expect(more.map((j) => j.id)).not.toContain(am.id);
    expect(more.every((j) => j.status === 'published')).toBe(true);
    expect(more).toHaveLength(getActiveJobs().length - 1);
    // Same question set first: the other skilled-worker jobs before the apprenticeship.
    expect(more.at(-1)?.id).toBe('ausbildung-anlagenmechaniker-shk');
  });
});
