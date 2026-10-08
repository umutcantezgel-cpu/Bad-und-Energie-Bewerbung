import { FACTS } from '@/lib/content/facts';
import { SITE_CONFIG } from '@/lib/seo/site-config';
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

export function buildBreadcrumbJsonLd(job: Job): BreadcrumbJsonLd {
  const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
  const url = jobUrl(job);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: base },
      { '@type': 'ListItem', position: 2, name: 'Stellen', item: `${base}/jobs` },
      { '@type': 'ListItem', position: 3, name: job.shortTitle, item: url },
    ],
  };
}

/** JSON für <script type="application/ld+json">, mit escaptem „<“ gegen </script>-Ausbruch. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
