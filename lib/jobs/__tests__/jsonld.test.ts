import { describe, expect, it } from 'vitest';
import { FACTS } from '@/lib/content/facts';
import { ISCO, KLDB } from '../berufe';
import { jobUrl } from '../format';
import { INDUSTRY, buildBreadcrumbJsonLd, buildJobPostingJsonLd, employerOverview } from '../jsonld';
import { ALL_JOBS, getActiveJobs, getJobById } from '../registry';
import { defineJob, type JobInput } from '../schema';

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
      // Plan §C4: sameAs als Liste (Website für Kunden und geprüfte Profile aus lib/content/profile.ts)
      sameAs: expect.arrayContaining(['https://bad-energie.de']),
    });
    expect(Array.isArray(ld.hiringOrganization.sameAs)).toBe(true);
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
    // E-030: kein baseSalary, nirgends eine Zahl zu Lohn oder Gehalt
    expect(ld).not.toHaveProperty('baseSalary');
    expect(ld).not.toHaveProperty('estimatedSalary');
    expect(JSON.stringify(ld)).not.toMatch(/€|"(?:min|max)Value"|MonetaryAmount/);
    expect(ld.directApply).toBe(true);
    if (job.education) expect(ld.educationRequirements).toMatchObject({ '@type': 'EducationalOccupationalCredential' });
    else expect(ld).not.toHaveProperty('educationRequirements');
    if (job.experienceMonths !== undefined) expect(ld.experienceRequirements).toBeDefined();
    else expect(ld).not.toHaveProperty('experienceRequirements');

    // Plan §C2: Beruf, Branche, Aufgaben, Anforderungen und Arbeitgeber, aus Stellendaten und Fakten
    expect(ld.occupationalCategory).toBe(
      job.beruf.isco ? `ISCO-08 ${job.beruf.isco}: ${ISCO[job.beruf.isco]}` : `KldB 2010 ${job.beruf.kldb}: ${KLDB[job.beruf.kldb]}`,
    );
    expect(ld.industry).toBe(INDUSTRY);
    expect(ld.responsibilities).toBe(job.tasks.join('; '));
    if (job.requirements.length > 0) expect(ld.qualifications).toBe(job.requirements.join('; '));
    else expect(ld).not.toHaveProperty('qualifications');
    expect(ld.employerOverview).toBe(employerOverview());
    expect(ld.description).toContain(job.pay === 'auf-anfrage' ? 'Lohn: auf Anfrage' : 'Dauer:');

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

  it('Bürofachkraft: FULL_TIME und PART_TIME, ohne Anforderungen, solange sie offen sind (M-038)', () => {
    const ld = buildJobPostingJsonLd(getJobById('buerofachkraft')!)!;
    expect(ld.employmentType).toEqual(['FULL_TIME', 'PART_TIME']);
    expect(ld).not.toHaveProperty('qualifications');
    expect(ld).not.toHaveProperty('educationRequirements');
    expect(ld).not.toHaveProperty('experienceRequirements');
    expect(ld.occupationalCategory).toBe('ISCO-08 4120: Sekretariatskräfte (allgemein)');
  });

  it('Schülerpraktikum: INTERN, keine Erfahrung nötig, kein Wort zu Geld', () => {
    const ld = buildJobPostingJsonLd(getJobById('schuelerpraktikum-shk')!)!;
    expect(ld.employmentType).toBe('INTERN');
    expect(ld.experienceRequirements).toBe('no requirements');
    expect(ld.description).not.toMatch(/Lohn|Gehalt|Vergütung|Tarif/);
  });

  it('Kundendienst: ohne eindeutigen ISCO-Code steht die KldB-Berufsgattung', () => {
    expect(buildJobPostingJsonLd(getJobById('kundendiensttechniker-shk')!)!.occupationalCategory).toBe(
      'KldB 2010 25132: Technische Servicekräfte in Wartung und Instandhaltung – fachlich ausgerichtete Tätigkeiten',
    );
    expect(buildJobPostingJsonLd(getJobById('anlagenmechaniker-shk')!)!.occupationalCategory).toBe(
      'ISCO-08 7126: Bauspengler und Sanitär- und Heizungsinstallateure',
    );
  });

  it('employerOverview aus belegten Fakten', () => {
    expect(employerOverview()).toBe(
      `Bad und Energie GmbH Lahn Dill: ${FACTS.founded1926.long} ${FACTS.employees15.long} ${FACTS.heatPumpBrands.long}`,
    );
  });

  it('kein JobPosting für funnel_only, archivierte oder für Google abgeschaltete Stellen', () => {
    const am = getJobById('anlagenmechaniker-shk')!;
    const funnelOnly = defineJob({
      ...(getJobById('quereinsteiger-montagehelfer')! as unknown as JobInput),
      status: 'funnel_only',
      channels: { googleJobs: false, indeedFeed: false, genericFeed: false, ba: false },
    });
    expect(buildJobPostingJsonLd(funnelOnly)).toBeNull();
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
