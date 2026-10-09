import { BREADCRUMB_HOME, BREADCRUMB_JOBS } from '@/lib/content/breadcrumbs';
import { FACTS } from '@/lib/content/facts';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
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
    sameAs: string;
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
  baseSalary?: {
    '@type': 'MonetaryAmount';
    currency: string;
    value: { '@type': 'QuantitativeValue'; minValue: number; maxValue: number; unitText: string };
  };
  directApply: boolean;
  educationRequirements?: { '@type': 'EducationalOccupationalCredential'; credentialCategory: string } | NoRequirements;
  experienceRequirements?: { '@type': 'OccupationalExperienceRequirements'; monthsOfExperience: number } | NoRequirements;
  jobBenefits?: string;
  jobStartDate?: string;
}

export interface BreadcrumbJsonLd {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  '@id': string;
  itemListElement: { '@type': 'ListItem'; position: number; name: string; item: string }[];
}

const EMPLOYMENT_TYPE: Record<Job['employment']['kind'], string | string[]> = {
  vollzeit: 'FULL_TIME',
  teilzeit: 'PART_TIME',
  ausbildung: ['FULL_TIME', 'OTHER'],
};

/**
 * JobPosting-Knoten ohne Kanalprüfung (für Feeds). Nur für veröffentlichte Stellen;
 * alles andere ergibt null.
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
  };

  if (job.validThrough) node.validThrough = job.validThrough;
  if (job.salary) {
    node.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salary.currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary.min,
        maxValue: job.salary.max,
        unitText: job.salary.unit,
      },
    };
  }
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

/**
 * BreadcrumbList mit denselben Labels wie die sichtbaren Breadcrumbs und den Canonical-URLs;
 * die letzte Stufe ist die Seite selbst.
 */
function breadcrumbList(trail: readonly { name: string; url: string }[]): BreadcrumbJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${trail[trail.length - 1].url}#breadcrumb`,
    itemListElement: trail.map((step, i) => ({ '@type': 'ListItem', position: i + 1, name: step.name, item: step.url })),
  };
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

/** JSON für <script type="application/ld+json">, mit escaptem „<“ gegen </script>-Ausbruch. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
