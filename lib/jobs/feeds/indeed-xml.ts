import { EMPLOYER } from '../employer';
import { jobUrl, toHtmlDescription } from '../format';
import { getChannelJobs } from '../registry';
import type { Job } from '../schema';
import { withUtm } from './tracking';
import { XML_DECLARATION, datePart, element, escapeXml, feedJobType, salaryText, toRfc822 } from './xml';

export interface IndeedFeedOptions {
  publisher?: string;
  publisherUrl?: string;
  /** Erstellzeitpunkt; zugleich Stichtag, ab dem abgelaufene Stellen herausfallen. */
  lastBuildDate?: Date;
}

/** Indeed-XML (<source>/<job>) mit allen veröffentlichten Stellen, die `channels.indeedFeed` gesetzt haben. */
export function buildIndeedXml(jobs: readonly Job[], options: IndeedFeedOptions = {}): string {
  const {
    publisher = EMPLOYER.legalName,
    publisherUrl = EMPLOYER.careerBaseUrl,
    lastBuildDate = new Date(),
  } = options;

  const items = getChannelJobs(jobs, 'indeedFeed', lastBuildDate).map((job) => {
    const salary = salaryText(job);
    const fields = [
      element('title', job.title),
      element('date', toRfc822(new Date(`${job.datePosted}T00:00:00Z`))),
      element('referencenumber', job.referenceCode),
      element('url', withUtm(jobUrl(job), { source: 'indeed', campaign: job.id })),
      element('company', EMPLOYER.legalName),
      element('city', job.location.city),
      element('state', job.location.region),
      element('country', job.location.country),
      element('postalcode', job.location.postalCode),
      element('streetaddress', job.location.street),
      element('description', toHtmlDescription(job)),
      ...(salary ? [element('salary', salary)] : []),
      element('jobtype', feedJobType(job)),
      ...(job.validThrough ? [element('expirationdate', datePart(job.validThrough))] : []),
    ];
    return `<job>${fields.join('')}</job>`;
  });

  return [
    XML_DECLARATION,
    '<source>',
    `<publisher>${escapeXml(publisher)}</publisher>`,
    `<publisherurl>${escapeXml(publisherUrl)}</publisherurl>`,
    `<lastBuildDate>${escapeXml(toRfc822(lastBuildDate))}</lastBuildDate>`,
    ...items,
    '</source>',
  ].join('\n');
}
