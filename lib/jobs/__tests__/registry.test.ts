import { describe, expect, it } from 'vitest';
import { FACTS, getFact } from '@/lib/content/facts';
import { TEAM_QUOTES } from '@/lib/content/team';
import slugLock from '../slugs.lock.json';
import { formatNumber } from '../format';
import {
  ALL_JOBS,
  JOB_IDS,
  getActiveJobs,
  getChannelJobs,
  getFunnelOptions,
  getJobById,
  getJobByLegacySlug,
  getJobBySlug,
  getJobPageSlugs,
  getJobsExpiringWithin,
} from '../registry';
import { JobSchema, defineJob, type JobInput } from '../schema';

/** Fester Stichtag nur für die Ablauf-Logik selbst; Invarianten laufen gegen die echte Uhr. */
const TEST_DATE = new Date('2026-10-08T00:00:00Z');
const published = ALL_JOBS.filter((job) => job.status === 'published');

describe('Job-Registry', () => {
  it.each(ALL_JOBS.map((job) => [job.id, job] as const))('%s erfüllt das Schema', (_id, job) => {
    const result = JobSchema.safeParse(job);
    expect(result.success, result.success ? '' : JSON.stringify(result.error.issues, null, 2)).toBe(true);
  });

  it('JOB_IDS deckt genau ALL_JOBS ab, in derselben Reihenfolge', () => {
    expect(ALL_JOBS.map((job) => job.id)).toEqual([...JOB_IDS]);
  });

  it('IDs, Slugs (inkl. redirectFrom) und Referenzen sind eindeutig', () => {
    const ids = ALL_JOBS.map((j) => j.id);
    const refs = ALL_JOBS.map((j) => j.referenceCode);
    const slugs = ALL_JOBS.flatMap((j) => [j.slug, ...j.redirectFrom]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(refs).size).toBe(refs.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('behält die bestehenden Referenzcodes', () => {
    expect(Object.fromEntries(ALL_JOBS.map((j) => [j.id, j.referenceCode]))).toEqual({
      'anlagenmechaniker-shk': 'SHK-WP-2026-01',
      'kundendiensttechniker-shk': 'SHK-KD-2026-02',
      'obermonteur-projektleiter-shk': 'SHK-PL-2026-03',
      'ausbildung-anlagenmechaniker-shk': 'SHK-AZ-2026-04',
      'quereinsteiger-montagehelfer': 'SHK-QE-2026-05',
    });
  });

  it('Slug-Lock: jede Stellenseite steht im Lock, jeder gesperrte Slug lebt weiter oder leitet um', () => {
    const locked = new Set(slugLock.slugs);
    for (const slug of getJobPageSlugs()) expect(locked, `Slug fehlt in slugs.lock.json: ${slug}`).toContain(slug);

    const current = new Set(ALL_JOBS.map((j) => j.slug));
    for (const slug of locked) {
      const resolvable = current.has(slug) || getJobByLegacySlug(slug) !== undefined;
      expect(resolvable, `Gesperrter Slug ohne Stelle und ohne redirectFrom: ${slug}`).toBe(true);
    }
  });

  it('getActiveJobs liefert die veröffentlichten Stellen in fester Reihenfolge', () => {
    expect(getActiveJobs().map((j) => j.id)).toEqual([
      'anlagenmechaniker-shk',
      'kundendiensttechniker-shk',
      'obermonteur-projektleiter-shk',
      'ausbildung-anlagenmechaniker-shk',
    ]);
  });

  it('getFunnelOptions enthält veröffentlichte und funnel_only-Stellen', () => {
    const options = getFunnelOptions();
    expect(options.map((o) => o.id)).toEqual([...JOB_IDS]);
    expect(options.find((o) => o.id === 'quereinsteiger-montagehelfer')).toMatchObject({
      status: 'funnel_only',
      questionSet: 'quereinstieg',
      category: 'helfer',
    });
    expect(options.find((o) => o.id === 'obermonteur-projektleiter-shk')?.questionSet).toBe('fachkraft');
  });

  it('getFunnelOptions(now) lässt abgelaufene veröffentlichte Stellen weg, funnel_only bleibt', () => {
    const ausbildung = getJobById('ausbildung-anlagenmechaniker-shk')!;
    const afterExpiry = new Date(Date.parse(ausbildung.validThrough!) + 1000);
    const ids = getFunnelOptions(afterExpiry).map((o) => o.id);
    expect(ids).not.toContain('ausbildung-anlagenmechaniker-shk');
    expect(ids).toContain('quereinsteiger-montagehelfer');
    expect(getFunnelOptions(TEST_DATE).map((o) => o.id)).toEqual([...JOB_IDS]);
  });

  it('findet Stellen über Slug und ID', () => {
    expect(getJobBySlug('anlagenmechaniker-shk-wetzlar')?.id).toBe('anlagenmechaniker-shk');
    expect(getJobBySlug('gibt-es-nicht')).toBeUndefined();
    expect(getJobById('kundendiensttechniker-shk')?.slug).toBe('kundendiensttechniker-waermepumpe-wetzlar');
    expect(getJobById('unbekannt')).toBeUndefined();
  });

  it('funnel_only hat keine Stellenseite und keinen Kanal', () => {
    const qe = getJobById('quereinsteiger-montagehelfer')!;
    expect(getJobPageSlugs()).not.toContain(qe.slug);
    expect(Object.values(qe.channels).every((v) => v === false)).toBe(true);
    expect(qe.salary).toBeUndefined();
    for (const channel of ['googleJobs', 'indeedFeed', 'genericFeed', 'ba'] as const) {
      expect(getChannelJobs(ALL_JOBS, channel, TEST_DATE).map((j) => j.id)).not.toContain(qe.id);
    }
  });

  it('veröffentlichte Stellen laufen frühestens in 14 Tagen ab (echte Uhr, warnt vor Ablauf)', () => {
    const expiring = getJobsExpiringWithin(new Date(), 14).map((j) => `${j.id} (${j.validThrough})`);
    expect(expiring, 'validThrough verlängern oder Stelle archivieren, siehe docs/operations/stellen-pflegen.md').toEqual([]);
    for (const job of published) expect(job.validThrough).toBeDefined();
  });

  it('erkennt bald ablaufende Stellen', () => {
    const soon = { ...published[0], validThrough: '2026-10-15' };
    expect(getJobsExpiringWithin(TEST_DATE, 14, [soon])).toHaveLength(1);
  });

  it.each(ALL_JOBS.map((job) => [job.id, job] as const))('%s: Meta-Title ≤ 60, Description ≤ 155', (_id, job) => {
    expect(job.seo.metaTitle.length).toBeLessThanOrEqual(60);
    expect(job.seo.metaDescription.length).toBeLessThanOrEqual(155);
  });

  it.each(published.map((job) => [job.id, job] as const))('%s: Gehalt in der Description passt zum Gehaltsfeld', (_id, job) => {
    const match = job.seo.metaDescription.match(/(\d{1,3}(?:\.\d{3})*)–(\d{1,3}(?:\.\d{3})*)\s?€/);
    if (!match) return;
    expect(match[1]).toBe(formatNumber(job.salary!.min));
    expect(match[2]).toBe(formatNumber(job.salary!.max));
  });

  it('veröffentlichte Stellen zeigen ein Gehalt', () => {
    for (const job of published) expect(job.salary, job.id).toBeDefined();
  });

  it('alle Fakt-IDs lösen auf; offene Owner-Fakten nur bei freigegebenen Stellen', () => {
    for (const job of ALL_JOBS) {
      for (const id of job.benefitFactIds) {
        const fact = getFact(id);
        expect(fact, `${job.id}: ${id}`).toBeDefined();
        if (fact.pending) expect(fact.pending.onlyForJobIds).toContain(job.id);
        expect(fact.validUntil, `${job.id}: befristeter Fakt ${id}`).toBeUndefined();
      }
    }
    expect(FACTS.payFirstWorkday.pending?.onlyForJobIds).toEqual([]);
  });

  it('Teamzitate passen zur Rolle', () => {
    const quotes = Object.fromEntries(ALL_JOBS.map((j) => [j.id, j.teamQuoteId]));
    expect(quotes).toEqual({
      'anlagenmechaniker-shk': 'koch',
      'kundendiensttechniker-shk': 'becker',
      'obermonteur-projektleiter-shk': 'koch',
      'ausbildung-anlagenmechaniker-shk': 'weber',
      'quereinsteiger-montagehelfer': 'demir',
    });
    for (const job of ALL_JOBS) if (job.teamQuoteId) expect(TEAM_QUOTES[job.teamQuoteId]).toBeDefined();
  });

  it('titleShy trennt lange Komposita weich und entspricht sonst title', () => {
    for (const job of ALL_JOBS) {
      expect(job.titleShy.replace(/\u00AD/g, '')).toBe(job.title);
      expect(job.titleShy, job.id).toContain('\u00AD');
    }
    expect(getJobById('anlagenmechaniker-shk')!.titleShy).toContain('Anlagen\u00ADmechaniker');
    expect(getJobById('kundendiensttechniker-shk')!.titleShy).toContain('Kunden\u00ADdienst\u00ADtechniker');
  });

  it('Ausbildung: Einstieg 2026 noch möglich, Start nach Absprache, endet mit dem Jahr 2026', () => {
    const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
    expect(azubi.seo.h1).toContain('Einstieg 2026 noch möglich');
    expect(azubi.seo.metaTitle).toContain('2026');
    expect(azubi.title).toBe('Ausbildung zum Anlagenmechaniker SHK (m/w/d)');
    expect(azubi.employment).toMatchObject({ kind: 'ausbildung', start: 'nach-absprache', durationMonths: 42 });
    expect(azubi.validThrough).toBe('2026-12-31T23:59:59+01:00');
    expect(getChannelJobs([azubi], 'googleJobs', new Date('2027-01-01T00:00:00+01:00'))).toEqual([]);
  });

  it('Ausbildung: Wortlaut der Owner-Entscheidung, Intro wiederholt die h1 nicht', () => {
    const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
    expect(azubi.summary).toMatch(/^Ausbildung 2026: Einstieg noch möglich\. /);
    expect(azubi.intro).not.toMatch(/2026|Einstieg|von Anfang an/);
  });

  it('Texte ohne Dopplungen auf derselben Seite', () => {
    // Obermonteur: die direkte Abstimmung steht im Vorteil directLine, nicht noch einmal mit anderem Titel im Intro.
    const obermonteur = getJobById('obermonteur-projektleiter-shk')!;
    expect(obermonteur.benefitFactIds).toContain('directLine');
    expect(obermonteur.intro).not.toMatch(/Demir|Dipl/);
    // Kundendienst: Markenliste und iPad stehen schon in Intro, Vorteilen und Aufgaben, nicht auch im Paket.
    const kundendienst = getJobById('kundendiensttechniker-shk')!;
    const paket = kundendienst.packageExtras.map((extra) => extra.text).join(' ');
    expect(paket).not.toMatch(/Buderus|iPad/);
    // Typografie: „22-V“ mit Bindestrichen, nie „22V“.
    for (const job of ALL_JOBS) {
      expect(job.packageExtras.map((extra) => extra.text).join(' '), job.id).not.toMatch(/\d+V\b/);
    }
    expect(FACTS.hilti.long).not.toMatch(/\d+V\b/);
  });

  it('kein Stellentitel nennt ein Jahr (Google-Richtlinie, auch für Feeds)', () => {
    for (const job of ALL_JOBS) expect(job.title, job.id).not.toMatch(/\b(?:19|20)\d{2}\b/);
  });

  it('Registry-Objekte sind eingefroren', () => {
    expect(Object.isFrozen(ALL_JOBS[0])).toBe(true);
    expect(Object.isFrozen(ALL_JOBS[0].tasks)).toBe(true);
  });
});

describe('defineJob', () => {
  const base = getJobById('anlagenmechaniker-shk')! as unknown as JobInput;

  it('lehnt zu lange Meta-Titel ab', () => {
    expect(() => defineJob({ ...base, seo: { ...base.seo, metaTitle: 'x'.repeat(61) } })).toThrow(/metaTitle/);
  });

  it('lehnt unbekannte Fakt-IDs ab', () => {
    expect(() => defineJob({ ...base, benefitFactIds: ['erfunden' as never] })).toThrow(/benefitFactIds/);
  });

  it('lehnt offene Owner-Fakten bei nicht freigegebenen Stellen ab', () => {
    expect(() => defineJob({ ...base, benefitFactIds: ['payFirstWorkday'] })).toThrow(/Owner-Bestätigung/);
  });

  it('lehnt funnel_only mit aktivem Kanal ab', () => {
    expect(() => defineJob({ ...base, status: 'funnel_only' })).toThrow(/funnel_only/);
  });

  it('lehnt titleShy ab, das nicht zum Titel passt', () => {
    expect(() => defineJob({ ...base, titleShy: 'Etwas\u00ADanderes (m/w/d)' })).toThrow(/titleShy/);
  });

  it('lehnt Jahreszahlen im Titel ab', () => {
    expect(() =>
      defineJob({ ...base, title: 'Anlagenmechaniker SHK 2026 (m/w/d)', titleShy: 'Anlagen\u00ADmechaniker SHK 2026 (m/w/d)' }),
    ).toThrow(/Titel ohne Jahreszahl/);
  });

  it('lehnt Texte ab, deren Jahr vor dem Ablaufjahr liegt', () => {
    const seo = { ...base.seo, h1: 'Anlagenmechaniker SHK – Start 2026' };
    expect(() => defineJob({ ...base, seo, validThrough: '2027-03-01' })).toThrow(/nennt 2026/);
    expect(() => defineJob({ ...base, seo, validThrough: '2026-12-31' })).not.toThrow();
  });

  it('verlangt validThrough und Gehalt bei veröffentlichten Stellen', () => {
    expect(() => defineJob({ ...base, validThrough: undefined })).toThrow(/validThrough/);
    expect(() => defineJob({ ...base, salary: undefined })).toThrow(/salary/);
  });
});
