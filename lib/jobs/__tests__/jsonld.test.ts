import { describe, expect, it } from 'vitest';
import { jobUrl } from '../format';
import { buildBreadcrumbJsonLd, buildJobPostingJsonLd } from '../jsonld';
import { ALL_JOBS, getActiveJobs, getJobById } from '../registry';

// Organization-@id aus dem globalen Graphen (components/site/site-jsonld.ts).
const GLOBAL_ORG_ID = 'https://bad-energie.de/#organization';

describe('buildJobPostingJsonLd', () => {
  it.each(getActiveJobs().map((job) => [job.id, job] as const))('%s: Google-Pflicht- und Empfehlungsfelder', (_id, job) => {
    const ld = buildJobPostingJsonLd(job)!;
    expect(ld).not.toBeNull();

    // Pflicht
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('JobPosting');
    expect(ld.title).toBe(job.title);
    expect(ld.description.length).toBeGreaterThan(200);
    expect(ld.description).toMatch(/^<p>/);
    expect(ld.datePosted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ld.hiringOrganization).toMatchObject({
      '@type': 'Organization',
      '@id': GLOBAL_ORG_ID,
      name: 'Bad und Energie GmbH Lahn Dill',
      sameAs: 'https://bad-energie.de',
    });
    expect(ld.hiringOrganization.logo).toMatch(/^https:\/\/.+\.(webp|png|svg)$/);
    expect(ld.jobLocation).toEqual({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Siegmund-Hiepe-Str. 20',
        addressLocality: 'Wetzlar',
        postalCode: '35578',
        addressRegion: 'Hessen',
        addressCountry: 'DE',
      },
    });

    // Empfohlen
    expect(ld.validThrough).toBe(job.validThrough);
    expect(ld.employmentType).toBeDefined();
    expect(ld.identifier).toEqual({ '@type': 'PropertyValue', name: 'Bad und Energie GmbH Lahn Dill', value: job.referenceCode });
    expect(ld.baseSalary).toEqual({
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: { '@type': 'QuantitativeValue', minValue: job.salary!.min, maxValue: job.salary!.max, unitText: 'MONTH' },
    });
    expect(ld.directApply).toBe(true);
    expect(ld.educationRequirements).toMatchObject({ '@type': 'EducationalOccupationalCredential' });
    expect(ld.experienceRequirements).toBeDefined();

    // URL = Canonical
    expect(ld.url).toBe(jobUrl(job));
    expect(ld['@id']).toBe(`${jobUrl(job)}#jobposting`);
  });

  it('Ausbildung: employmentType FULL_TIME + OTHER, keine Berufserfahrung nötig', () => {
    const ld = buildJobPostingJsonLd(getJobById('ausbildung-anlagenmechaniker-shk')!)!;
    expect(ld.employmentType).toEqual(['FULL_TIME', 'OTHER']);
    expect(ld.experienceRequirements).toBe('no requirements');
    expect(ld.educationRequirements).toEqual({ '@type': 'EducationalOccupationalCredential', credentialCategory: 'high school' });
  });

  it('Fachkräfte: FULL_TIME und Monate Berufserfahrung', () => {
    const ld = buildJobPostingJsonLd(getJobById('kundendiensttechniker-shk')!)!;
    expect(ld.employmentType).toBe('FULL_TIME');
    expect(ld.experienceRequirements).toEqual({ '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 24 });
  });

  it('kein JobPosting für funnel_only, archivierte oder für Google abgeschaltete Stellen', () => {
    const am = getJobById('anlagenmechaniker-shk')!;
    expect(buildJobPostingJsonLd(getJobById('quereinsteiger-montagehelfer')!)).toBeNull();
    expect(buildJobPostingJsonLd({ ...am, status: 'archived' })).toBeNull();
    expect(buildJobPostingJsonLd({ ...am, channels: { ...am.channels, googleJobs: false } })).toBeNull();
  });

  it('genau ein JobPosting je veröffentlichter Stelle, eindeutige @id', () => {
    const ids = ALL_JOBS.map(buildJobPostingJsonLd)
      .filter((ld) => ld !== null)
      .map((ld) => ld['@id']);
    expect(ids).toHaveLength(getActiveJobs().length);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('Startseite › Stellen › Stelle', () => {
    const job = getJobById('obermonteur-projektleiter-shk')!;
    const ld = buildBreadcrumbJsonLd(job);
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(ld.itemListElement[1].item).toMatch(/\/jobs$/);
    expect(ld.itemListElement[2]).toMatchObject({ name: job.shortTitle, item: jobUrl(job) });
    expect(ld['@id']).toBe(`${jobUrl(job)}#breadcrumb`);
  });

  // V6-B: die erste Stufe ist der Canonical der Startseite, so wie Next ihn rendert (ohne Schrägstrich).
  it('die Startseite steht mit ihrer Canonical-URL im Pfad', () => {
    const ld = buildBreadcrumbJsonLd(getJobById('obermonteur-projektleiter-shk')!);
    expect(ld.itemListElement[0].item).toBe(new URL(jobUrl(getJobById('obermonteur-projektleiter-shk')!)).origin);
  });
});

// serializeJsonLd ist entfallen (V6-B): Seiten rendern nur noch über components/seo/JsonLd; dessen
// Escape-Prüfung steht in lib/seo/__tests__/graph.test.ts.
