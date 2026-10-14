import { EMPLOYER } from '../employer';
import { jobUrl, toHtmlDescription } from '../format';
import { getChannelJobs } from '../registry';
import type { Job } from '../schema';
import { withUtm } from './tracking';
import { XML_DECLARATION, datePart, element, escapeXml, feedJobType } from './xml';

export interface GenericFeedOptions {
  publisher?: string;
  publisherUrl?: string;
  /** Erstellzeitpunkt; zugleich Stichtag, ab dem abgelaufene Stellen herausfallen. */
  lastBuildDate?: Date;
  /** utm_source der Stellen-URLs, z. B. 'jooble' für einen partnerspezifischen Abruf. */
  source?: string;
}

/**
 * Aggregator-Feed (Jooble, Talent.com, Adzuna, Careerjet, Kimeta): <jobs>/<job> mit ISO-Daten, ohne Gehaltsfelder
 * (E-030: Lohn auf Anfrage). Enthält Stellen mit `channels.genericFeed`.
 */
export function buildGenericXml(jobs: readonly Job[], options: GenericFeedOptions = {}): string {
  const {
    publisher = EMPLOYER.legalName,
    publisherUrl = EMPLOYER.careerBaseUrl,
    lastBuildDate = new Date(),
    source = 'jobs-xml',
  } = options;

  const items = getChannelJobs(jobs, 'genericFeed', lastBuildDate).map((job) => {
    const fields = [
      element('title', job.title),
      element('url', withUtm(jobUrl(job), { source, campaign: job.id })),
      element('referencenumber', job.referenceCode),
      element('company', EMPLOYER.legalName),
      element('streetaddress', job.location.street),
      element('city', job.location.city),
      element('region', job.location.region),
      element('postalcode', job.location.postalCode),
      element('country', job.location.country),
      ...(job.location.radiusKm ? [element('radiuskm', job.location.radiusKm, 'text')] : []),
      element('description', toHtmlDescription(job)),
      element('jobtype', feedJobType(job)),
      element('date', job.datePosted, 'text'),
      element('updated', job.updatedAt, 'text'),
      ...(job.validThrough ? [element('expirationdate', datePart(job.validThrough), 'text')] : []),
    ];
    return `<job id="${escapeXml(job.id)}">${fields.join('')}</job>`;
  });

  return [
    XML_DECLARATION,
    '<jobs>',
    `<publisher>${escapeXml(publisher)}</publisher>`,
    `<publisherurl>${escapeXml(publisherUrl)}</publisherurl>`,
    `<lastbuilddate>${escapeXml(lastBuildDate.toISOString())}</lastbuilddate>`,
    ...items,
    '</jobs>',
  ].join('\n');
}
