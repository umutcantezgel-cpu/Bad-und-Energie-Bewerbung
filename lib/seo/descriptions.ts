import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { jobCategoryLabels } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/schema';

/** SERP budget for meta descriptions (ROADMAP §10). */
export const META_DESCRIPTION_MAX = 155;

/**
 * First candidate within the budget. If none fits, the last one is cut at a word boundary,
 * so a long fact or a new job can never push a description past the limit.
 */
export function fitDescription(...candidates: [string, ...string[]]): string {
  const fitting = candidates.find((text) => text.length <= META_DESCRIPTION_MAX);
  if (fitting) return fitting;
  const last = candidates[candidates.length - 1];
  const cut = last.slice(0, META_DESCRIPTION_MAX - 1);
  const wordEnd = cut.lastIndexOf(' ');
  return `${(wordEnd > 0 ? cut.slice(0, wordEnd) : cut).replace(/[\s,.:;–-]+$/, '')}…`;
}

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

const AREA = `${COMPANY.address.city} & Gießen`;
const PERKS = `${FACTS.vacation30.short}, freitags ab ${FACTS.friday1330.value} frei`;
const APPLY = `In ${FACTS.apply60s.value} Sek. bewerben.`;

/**
 * Meta description of /jobs, built from the live jobs and the fact registry: names the open job
 * types while they fit into 155 characters, otherwise the same text without the list.
 */
export function jobsHubDescription(liveJobs: readonly Pick<Job, 'category'>[]): string {
  const labels = jobCategoryLabels(liveJobs);
  if (labels.length === 0) {
    return fitDescription(`SHK-Jobs in ${AREA}: Initiativbewerbung jederzeit möglich. ${PERKS}. ${APPLY}`);
  }
  return fitDescription(
    `Offene SHK-Jobs in ${AREA}: ${labels.join(', ')}. ${PERKS}. ${APPLY}`,
    `Offene SHK-Jobs in ${AREA}. ${PERKS}, ${lowerFirst(FACTS.noFarAssembly.short)}. ${APPLY}`,
  );
}
