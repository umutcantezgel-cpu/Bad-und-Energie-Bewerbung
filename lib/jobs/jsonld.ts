import { BREADCRUMB_HOME, BREADCRUMB_JOBS } from '@/lib/content/breadcrumbs';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { breadcrumbList, type BreadcrumbJsonLd } from '@/lib/seo/breadcrumbs-jsonld';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import { berufKategorie } from './berufe';
import { EMPLOYER } from './employer';
import { jobUrl, toHtmlDescription } from './format';
import type { Job } from './schema';

type NoRequirements = 'no requirements';

export interface JobPostingJsonLd {
  '@context': 'https://schema.org';
  '@type': 'JobPosting';
  '@id': string;
  url: string;
  title: string;
  description: string;
  identifier: { '@type': 'PropertyValue'; name: string; value: string };
  datePosted: string;
  validThrough?: string;
  employmentType: string | string[];
  hiringOrganization: {
    '@type': 'Organization';
    '@id': string;
    name: string;
    sameAs: readonly string[];
    logo: string;
  };
  jobLocation: {
    '@type': 'Place';
    address: {
      '@type': 'PostalAddress';
      streetAddress: string;
      addressLocality: string;
      postalCode: string;
      addressRegion: string;
      addressCountry: string;
    };
  };
  directApply: boolean;
  /** Beruf nach ISCO-08 bzw. KldB 2010 (lib/jobs/berufe.ts). */
  occupationalCategory: string;
  industry: string;
  /** Aufgaben im Wortlaut der Seite („Das erwartet dich“). */
  responsibilities: string;
  /** Anforderungen im Wortlaut der Seite; fehlt, solange sie offen sind (requirementsOpen). */
  qualifications?: string;
  employerOverview: string;
  educationRequirements?: { '@type': 'EducationalOccupationalCredential'; credentialCategory: string } | NoRequirements;
  experienceRequirements?: { '@type': 'OccupationalExperienceRequirements'; monthsOfExperience: number } | NoRequirements;
  jobBenefits?: string;
  jobStartDate?: string;
}

export type { BreadcrumbJsonLd } from '@/lib/seo/breadcrumbs-jsonld';

const EMPLOYMENT_TYPE: Record<Job['employment']['kind'], string | string[]> = {
  vollzeit: 'FULL_TIME',
  teilzeit: 'PART_TIME',
  'voll-oder-teilzeit': ['FULL_TIME', 'PART_TIME'],
  ausbildung: ['FULL_TIME', 'OTHER'],
  praktikum: 'INTERN',
};

/** Branche des Betriebs (Gewerk der Innung; das Büro arbeitet für denselben Betrieb). */
export const INDUSTRY = 'Sanitär-, Heizungs- und Klimatechnik';

/** Wer der Arbeitgeber ist, aus belegten Fakten (founded1926, employees15, heatPumpBrands). */
export function employerOverview(): string {
  return `${COMPANY.legalName}: ${FACTS.founded1926.long} ${FACTS.employees15.long} ${FACTS.heatPumpBrands.long}`;
}

/**
 * JobPosting-Knoten ohne Kanalprüfung (für Feeds). Nur für veröffentlichte Stellen;
 * alles andere ergibt null. E-030: ohne baseSalary, die Beschreibung nennt „Lohn: auf Anfrage“.
 */
export function toJobPostingNode(job: Job): JobPostingJsonLd | null {
  if (job.status !== 'published') return null;
  const url = jobUrl(job);
  const node: JobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `${url}#jobposting`,
    url,
    title: job.title,
    description: toHtmlDescription(job),
    identifier: { '@type': 'PropertyValue', name: EMPLOYER.legalName, value: job.referenceCode },
    datePosted: job.datePosted,
    employmentType: EMPLOYMENT_TYPE[job.employment.kind],
    hiringOrganization: {
      '@type': 'Organization',
      '@id': EMPLOYER.orgId,
      name: EMPLOYER.legalName,
      sameAs: EMPLOYER.sameAs,
      logo: EMPLOYER.logoUrl,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: job.location.street,
        addressLocality: job.location.city,
        postalCode: job.location.postalCode,
        addressRegion: job.location.region,
        addressCountry: job.location.country,
      },
    },
    directApply: true,
    occupationalCategory: berufKategorie(job.beruf),
    industry: INDUSTRY,
    responsibilities: job.tasks.join('; '),
    employerOverview: employerOverview(),
  };

  if (job.validThrough) node.validThrough = job.validThrough;
  if (job.requirements.length > 0) node.qualifications = job.requirements.join('; ');
  if (job.education) {
    node.educationRequirements = {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: job.education.credentialCategory,
    };
  }
  if (job.experienceMonths !== undefined) {
    node.experienceRequirements =
      job.experienceMonths > 0
        ? { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: job.experienceMonths }
        : 'no requirements';
  }
  const benefits = [...job.benefitFactIds.map((id) => FACTS[id].short), ...job.packageExtras.map((e) => e.text)];
  if (benefits.length > 0) node.jobBenefits = benefits.join('; ');
  if (/^\d{4}-\d{2}-\d{2}$/.test(job.employment.start)) node.jobStartDate = job.employment.start;
  return node;
}

/** JobPosting für /jobs/[slug]; null, wenn die Stelle nicht veröffentlicht oder für Google Jobs abgeschaltet ist. */
export function buildJobPostingJsonLd(job: Job): JobPostingJsonLd | null {
  if (!job.channels.googleJobs) return null;
  return toJobPostingNode(job);
}

/** Start › Stellen (für /jobs). */
export function buildJobsBreadcrumbJsonLd(): BreadcrumbJsonLd {
  return breadcrumbList([
    { name: BREADCRUMB_HOME.label, url: getCleanCanonicalUrl(BREADCRUMB_HOME.href) },
    { name: BREADCRUMB_JOBS.label, url: getCleanCanonicalUrl(BREADCRUMB_JOBS.href) },
  ]);
}

/** Start › Stellen › Stelle (für /jobs/[slug]). */
export function buildBreadcrumbJsonLd(job: Job): BreadcrumbJsonLd {
  return breadcrumbList([
    { name: BREADCRUMB_HOME.label, url: getCleanCanonicalUrl(BREADCRUMB_HOME.href) },
    { name: BREADCRUMB_JOBS.label, url: getCleanCanonicalUrl(BREADCRUMB_JOBS.href) },
    { name: job.shortTitle, url: jobUrl(job) },
  ]);
}
