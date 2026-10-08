import { anlagenmechanikerShk } from './data/anlagenmechaniker-shk';
import { ausbildungAnlagenmechanikerShk } from './data/ausbildung-anlagenmechaniker-shk';
import { kundendiensttechnikerShk } from './data/kundendiensttechniker-shk';
import { obermonteurProjektleiterShk } from './data/obermonteur-projektleiter-shk';
import { quereinsteigerMontagehelfer } from './data/quereinsteiger-montagehelfer';
import {
  JOB_IDS,
  parseJobDate,
  type Job,
  type JobCategory,
  type JobChannel,
  type JobId,
  type QuestionSet,
} from './schema';

export { JOB_IDS };
export type { Job, JobId };

/** Reihenfolge = Anzeigereihenfolge auf Startseite, /jobs und im Flow. */
export const ALL_JOBS: readonly Job[] = Object.freeze([
  anlagenmechanikerShk,
  kundendiensttechnikerShk,
  obermonteurProjektleiterShk,
  ausbildungAnlagenmechanikerShk,
  quereinsteigerMontagehelfer,
]);

function assertRegistry(jobs: readonly Job[]): void {
  const seen = { id: new Set<string>(), slug: new Set<string>(), ref: new Set<string>() };
  for (const job of jobs) {
    if (seen.id.has(job.id)) throw new Error(`Job-ID doppelt: ${job.id}`);
    if (seen.ref.has(job.referenceCode)) throw new Error(`Referenz doppelt: ${job.referenceCode}`);
    for (const s of [job.slug, ...job.redirectFrom]) {
      if (seen.slug.has(s)) throw new Error(`Slug doppelt: ${s}`);
      seen.slug.add(s);
    }
    seen.id.add(job.id);
    seen.ref.add(job.referenceCode);
  }
  const missing = JOB_IDS.filter((id) => !seen.id.has(id));
  if (missing.length > 0) throw new Error(`JOB_IDS ohne Stelle in ALL_JOBS: ${missing.join(', ')}`);
}

assertRegistry(ALL_JOBS);

export interface FunnelOption {
  id: JobId;
  slug: string;
  shortTitle: string;
  title: string;
  category: JobCategory;
  questionSet: QuestionSet;
  status: 'published' | 'funnel_only';
}

/** Veröffentlichte Stellen in fester Reihenfolge. */
export function getActiveJobs(): Job[] {
  return ALL_JOBS.filter((job) => job.status === 'published');
}

/** Sucht nur den aktuellen Slug, unabhängig vom Status. Seiten prüfen `status` selbst. */
export function getJobBySlug(slug: string): Job | undefined {
  return ALL_JOBS.find((job) => job.slug === slug);
}

/** Alter Slug aus `redirectFrom` → Stelle, auf die per 308 weitergeleitet wird. */
export function getJobByLegacySlug(slug: string): Job | undefined {
  return ALL_JOBS.find((job) => job.redirectFrom.includes(slug));
}

export function getJobById(id: string): Job | undefined {
  return ALL_JOBS.find((job) => job.id === id);
}

/** Slugs mit eigener Seite: veröffentlichte und besetzte (archived → „Besetzt“, noindex). */
export function getJobPageSlugs(): string[] {
  return ALL_JOBS.filter((job) => job.status === 'published' || job.status === 'archived').map((job) => job.slug);
}

/** Auswahl im Bewerbungsflow: veröffentlichte Stellen plus funnel_only. */
export function getFunnelOptions(): FunnelOption[] {
  return ALL_JOBS.filter(
    (job): job is Job & { status: FunnelOption['status'] } => job.status === 'published' || job.status === 'funnel_only',
  ).map((job) => ({
    id: job.id,
    slug: job.slug,
    shortTitle: job.shortTitle,
    title: job.title,
    category: job.category,
    questionSet: job.apply.questionSet,
    status: job.status,
  }));
}

/** Veröffentlicht und am Stichtag nicht abgelaufen. */
export function isJobLive(job: Job, now: Date): boolean {
  if (job.status !== 'published') return false;
  return !job.validThrough || parseJobDate(job.validThrough) >= now.getTime();
}

/** Stellen für einen Kanal (Feeds, Google Jobs, BA), nur live und mit gesetztem Kanal-Flag. */
export function getChannelJobs(jobs: readonly Job[], channel: JobChannel, now: Date): Job[] {
  return jobs.filter((job) => job.channels[channel] && isJobLive(job, now));
}

/** Veröffentlichte Stellen, deren validThrough in weniger als `minDays` Tagen erreicht ist. */
export function getJobsExpiringWithin(now: Date, minDays = 14, jobs: readonly Job[] = ALL_JOBS): Job[] {
  const limit = now.getTime() + minDays * 24 * 60 * 60 * 1000;
  return jobs.filter(
    (job) => job.status === 'published' && (!job.validThrough || parseJobDate(job.validThrough) < limit),
  );
}
