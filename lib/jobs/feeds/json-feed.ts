import { toJobPostingNode, type JobPostingJsonLd } from '../jsonld';
import { getChannelJobs } from '../registry';
import type { Job } from '../schema';
import { withUtm } from './tracking';

export interface JsonFeedOptions {
  /** Stichtag, ab dem abgelaufene Stellen herausfallen. */
  now?: Date;
  /** Optional: utm_source für `url` (z. B. für das Widget auf bad-energie.de). `@id` bleibt kanonisch. */
  utmSource?: string;
}

/** Array von JobPosting-JSON-LD-Objekten für Stellen mit `channels.genericFeed`. */
export function buildJsonFeed(jobs: readonly Job[], options: JsonFeedOptions = {}): JobPostingJsonLd[] {
  const { now = new Date(), utmSource } = options;
  return getChannelJobs(jobs, 'genericFeed', now).flatMap((job) => {
    const node = toJobPostingNode(job);
    if (!node) return [];
    return utmSource ? [{ ...node, url: withUtm(node.url, { source: utmSource, campaign: job.id }) }] : [node];
  });
}
