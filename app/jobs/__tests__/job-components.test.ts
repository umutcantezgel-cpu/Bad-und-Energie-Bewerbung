import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobCard } from '@/components/jobs/JobCard';
import { SalaryCard, lohnZusatz } from '@/components/jobs/SalaryCard';
import { getMoreJobs } from '@/components/jobs/MoreJobs';
import { bindSeparators, lowerFirst, pageTitle, splitLabel, withSoftHyphens } from '@/components/jobs/text';
import { FACTS } from '@/lib/content/facts';
import { PAY_ON_REQUEST, jobPath } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, getJobById } from '@/lib/jobs/registry';
import { findClaims } from '../../../scripts/qa/check-claims.mjs';

const SHY = '­';
const am = getJobById('anlagenmechaniker-shk')!;
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
const praktikum = getJobById('schuelerpraktikum-shk')!;
const buero = getJobById('buerofachkraft')!;
/** Kein Betrag zu Lohn oder Gehalt (E-030), dieselbe Prüfung wie check-claims nach dem Build. */
const ohneBetrag = (html: string) => findClaims(html.replace(/<[^>]*>/g, ' ').replace(/\u00A0/g, ' '), { premiumPending: false });

describe('bindSeparators', () => {
  it('glues a spaced slash or dash to the word before it', () => {
    expect(bindSeparators('Kundendiensttechniker SHK / Servicemonteur (m/w/d)')).toBe(
      'Kundendiensttechniker SHK\u00A0/ Servicemonteur (m/w/d)',
    );
    expect(bindSeparators('Anlagenmechaniker SHK – Einstieg 2026')).toBe('Anlagenmechaniker SHK\u00A0– Einstieg 2026');
    expect(bindSeparators('3.600–4.600 € (m/w/d)')).toBe('3.600–4.600 € (m/w/d)');
  });
});

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

  it('renders one link to the job page, the heading level, meta line and „Lohn auf Anfrage“ (E-030)', () => {
    const html = renderToStaticMarkup(createElement(JobCard, { job: am, headingLevel: 'h2' }));
    expect(html).toMatch(/^<article/);
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain(`href="${jobPath(am)}"`);
    expect(html).toMatch(/<h2[^>]*><a [^>]*>Anlagenmechaniker SHK<\/a>/);
    expect(html).toContain(am.summary);
    expect(html).toContain('Vollzeit');
    expect(html).toContain(PAY_ON_REQUEST);
    expect(ohneBetrag(html)).toEqual([]);
  });

  it('the school internship card says nothing about money', () => {
    const html = renderToStaticMarkup(createElement(JobCard, { job: praktikum }));
    expect(html).toContain(`href="${jobPath(praktikum)}"`);
    expect(html).not.toMatch(/Lohn|Gehalt|Vergütung|Tarif|€/);
  });

  it('defaults to h3', () => {
    const html = renderToStaticMarkup(createElement(JobCard, { job: azubi }));
    expect(html).toMatch(/<h3/);
    expect(html).not.toMatch(/<h2/);
  });
});

describe('SalaryCard (Block „Lohn auf Anfrage“, E-030)', () => {
  it('shows „Lohn auf Anfrage“ and what the job states about pay, never an amount', () => {
    for (const job of ALL_JOBS.filter((j) => j.pay === 'auf-anfrage')) {
      const html = renderToStaticMarkup(createElement(SalaryCard, { job }));
      expect(html, job.id).toContain('data-stelle-lohn');
      expect(html, job.id).toContain(PAY_ON_REQUEST);
      const zusatz = lohnZusatz(job);
      if (zusatz) expect(html, job.id).toContain(zusatz);
      expect(ohneBetrag(html), job.id).toEqual([]);
      expect(html, job.id).not.toMatch(/pro Monat|Gehaltsspanne|brutto/);
    }
  });

  it('the addition comes from the facts or the job ad: aboveTariff, else the package line „Vergütung“', () => {
    expect(lohnZusatz(am)).toBe(am.benefitFactIds.includes('aboveTariff') ? FACTS.aboveTariff.short : null);
    expect(lohnZusatz(azubi)).toBe(
      azubi.benefitFactIds.includes('aboveTariff')
        ? FACTS.aboveTariff.short
        : azubi.packageExtras.find((extra) => extra.label === 'Vergütung')!.text,
    );
    // Bürofachkraft (S5): nichts belegt außer „Lohn auf Anfrage“
    expect(lohnZusatz(buero)).toBeNull();
    expect(lohnZusatz(praktikum)).toBeNull();
  });

  it('renders nothing for the school internship (no word on money)', () => {
    expect(renderToStaticMarkup(createElement(SalaryCard, { job: praktikum }))).toBe('');
  });
});

describe('getMoreJobs', () => {
  it('leaves out the current job and only lists published jobs', () => {
    const more = getMoreJobs(am, new Date('2026-10-08T00:00:00Z'));
    expect(more.map((j) => j.id)).not.toContain(am.id);
    expect(more.every((j) => j.status === 'published')).toBe(true);
    expect(more).toHaveLength(getActiveJobs().length - 1);
    // Same question set first: the other skilled-worker jobs before all others, then registry order.
    expect(more.slice(0, 2).map((j) => j.id)).toEqual(['kundendiensttechniker-shk', 'obermonteur-projektleiter-shk']);
    expect(more.slice(2).every((j) => j.apply.questionSet !== am.apply.questionSet)).toBe(true);
    expect(more.slice(2).map((j) => j.id)).toEqual(getActiveJobs().filter((j) => j.apply.questionSet !== 'fachkraft').map((j) => j.id));
  });
});
