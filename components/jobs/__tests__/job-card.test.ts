import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JobAbgaenge, JobCard } from '@/components/jobs/JobCard';
import { PAY_ON_REQUEST, employmentLabel, jobPath, payLabel } from '@/lib/jobs/format';
import { getActiveJobs, getJobById, isJobLive } from '@/lib/jobs/registry';
import { findClaims } from '../../../scripts/qa/check-claims.mjs';

const SHY = '\u00AD';
const am = getJobById('anlagenmechaniker-shk')!;
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
const praktikum = getJobById('schuelerpraktikum-shk')!;
/** Kein Betrag zu Lohn oder Gehalt (E-030), dieselbe Liste wie check-claims nach dem Build. */
const betraege = (html: string) => findClaims(html.replace(/<[^>]*>/g, ' ').replaceAll('\u00A0', ' '), { premiumPending: true });
const source = readFileSync(path.resolve(__dirname, '../JobCard.tsx'), 'utf8');
const render = (props: Parameters<typeof JobCard>[0]) => renderToStaticMarkup(createElement(JobCard, props));

describe('JobCard (R3-HOME-02)', () => {
  it('stays a Server Component and uses the own icon family instead of lucide', () => {
    expect(source).not.toMatch(/['"]use client['"]/);
    expect(source).not.toMatch(/\buse(State|Effect|Ref|Context)\b/);
    expect(source).not.toMatch(/lucide-react/);
    expect(source).toMatch(/@\/components\/icons/);
  });

  it('default variant keeps its contract for /jobs and „Weitere Stellen“ (one link, heading, summary, „Lohn auf Anfrage“)', () => {
    const html = render({ job: am, headingLevel: 'h2' });
    expect(html).toMatch(/^<article/);
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toMatch(/<h2[^>]*><a [^>]*>Anlagenmechaniker SHK<\/a>/);
    expect(html).toContain(am.summary);
    expect(html).toContain('Vollzeit');
    expect(html).toContain(PAY_ON_REQUEST);
    expect(betraege(html)).toEqual([]);
    expect(render({ job: azubi })).toMatch(/<h3/);
    expect(render({ job: am, className: 'bg-surface-raised' })).toContain('bg-surface-raised');
  });

  it('abgang variant: one link to the job page, „Lohn auf Anfrage“ in its own column (no measure, E-030), employment, no summary', () => {
    const html = render({ job: am, variant: 'abgang' }).replaceAll(SHY, '');
    expect(html).toMatch(/^<article/);
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain(`href="${jobPath(am)}"`);
    expect(html).toMatch(/<h3[^>]*><a [^>]*>Anlagenmechaniker SHK<\/a>/);
    expect(html).toContain('(m/w/d)');
    expect(html).toMatch(new RegExp(`<p class="[^"]*md:col-start-2[^"]*">${PAY_ON_REQUEST}</p>`));
    // Kein Maß in Martian Mono: Die Bezahlung ist keine Zahl mehr
    expect(html).not.toContain('font-mass');
    expect(html).not.toMatch(/Gehalt \/ Monat|Vergütung \/ Monat/);
    expect(betraege(html)).toEqual([]);
    expect(html).toContain(employmentLabel(am));
    expect(html).not.toContain(am.summary);
    expect(render({ job: azubi, variant: 'abgang' })).toContain(PAY_ON_REQUEST);
  });

  it('abgang variant: employment right under the title, „Lohn auf Anfrage“ after it; focus ring inside', () => {
    const html = render({ job: am, variant: 'abgang' });
    expect(html.indexOf(employmentLabel(am))).toBeGreaterThan(html.indexOf('</h3>'));
    expect(html.indexOf(employmentLabel(am))).toBeLessThan(html.indexOf(PAY_ON_REQUEST));
    expect(html).toContain('focus-visible:after:-outline-offset-3');
    expect(html).not.toContain('outline-offset-0');
  });

  it('abgang variant: supply and return stubs are decorative, motion only through register ids', () => {
    const html = render({ job: am, variant: 'abgang' });
    expect(html).toMatch(/<span aria-hidden="true" class="[^"]*bg-vorlauf/);
    expect(html).toMatch(/<span aria-hidden="true" class="[^"]*bg-ruecklauf/);
    expect([...html.matchAll(/data-motion="([^"]+)"/g)].map((m) => m[1]).sort()).toEqual(['druck', 'flaeche']);
  });

  it('the school internship says nothing about money, in both variants (fakten-abgleich S4)', () => {
    expect(payLabel(praktikum)).toBeNull();
    for (const variant of ['karte', 'abgang'] as const) {
      const html = render({ job: praktikum, variant });
      expect(html, variant).toContain(`href="${jobPath(praktikum)}"`);
      expect(html, variant).not.toMatch(/Lohn|Gehalt|Vergütung|Tarif/);
    }
  });
});

describe('JobAbgaenge (E-START-023 on the home page)', () => {
  const live = getActiveJobs().filter((job) => isJobLive(job, new Date('2026-10-14T12:00:00Z')));
  const html = renderToStaticMarkup(createElement(JobAbgaenge, { jobs: live, 'aria-label': `${live.length} offene Stellen` }));

  it('draws the manifold lines on the list itself (no stray elements inside <ul>)', () => {
    expect(html).toMatch(/^<ul aria-label="8 offene Stellen" class="[^"]*before:bg-vorlauf[^"]*after:bg-ruecklauf/);
    expect(html.match(/<ul[^>]*>(<li>[\s\S]*?<\/li>)*<\/ul>$/)).not.toBeNull();
  });

  it('shows one row per live job (eight since 2026-10-14), each linking to its job page; „Lohn auf Anfrage“ where the job says so', () => {
    expect(live).toHaveLength(8);
    expect(html.match(/<li>/g)).toHaveLength(8);
    for (const job of live) expect(html).toContain(`href="${jobPath(job)}"`);
    expect(html.split(`>${PAY_ON_REQUEST}<`).length - 1).toBe(live.filter((job) => job.pay === 'auf-anfrage').length);
    expect(betraege(html)).toEqual([]);
    expect(html.match(/<h3/g)).toHaveLength(8);
  });

  it('long titles carry the soft hyphens of titleShy and keep „/“ at the line end (320 px)', () => {
    expect(html).toContain(`Kunden${SHY}dienst${SHY}techniker`);
    expect(html).toContain(`Ober${SHY}monteur\u00A0/ Projekt${SHY}leiter`);
    expect(html.replaceAll(SHY, '').replaceAll('\u00A0', ' ')).toContain('>Obermonteur / Projektleiter</a>');
  });
});
