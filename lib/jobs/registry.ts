import { anlagenmechanikerShk } from './data/anlagenmechaniker-shk';
import { ausbildungAnlagenmechanikerShk } from './data/ausbildung-anlagenmechaniker-shk';
import { ausbildungAnlagenmechanikerShk2027 } from './data/ausbildung-anlagenmechaniker-shk-2027';
import { buerofachkraft } from './data/buerofachkraft';
import { kundendiensttechnikerShk } from './data/kundendiensttechniker-shk';
import { obermonteurProjektleiterShk } from './data/obermonteur-projektleiter-shk';
import { quereinsteigerMontagehelfer } from './data/quereinsteiger-montagehelfer';
import { schuelerpraktikumShk } from './data/schuelerpraktikum-shk';
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
  ausbildungAnlagenmechanikerShk2027,
  quereinsteigerMontagehelfer,
  buerofachkraft,
  schuelerpraktikumShk,
]);

/** Eindeutige IDs, Slugs und Referenzen, jede JOB_ID belegt, Nachfolger stimmig; wirft beim Laden des Moduls. */
export function assertRegistry(jobs: readonly Job[]): void {
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

  // Abgelöste Stellen („Ausbildung 2026“ → „Ausbildung 2027“): Die Nachfolgerin ist dieselbe Art Stelle, veröffentlicht
  // und läuft länger. Sie selbst hat keinen Nachfolger (keine Ketten), und keine Stelle wird zweimal abgelöst.
  const nachfolger = new Set<string>();
  for (const job of jobs) {
    if (!job.nachfolger) continue;
    const next = jobs.find((other) => other.id === job.nachfolger);
    if (!next) throw new Error(`${job.id}: Nachfolger ${job.nachfolger} fehlt in ALL_JOBS`);
    if (next.category !== job.category) throw new Error(`${job.id}: Nachfolger ${next.id} ist eine andere Art Stelle`);
    if (next.status !== 'published') throw new Error(`${job.id}: Nachfolger ${next.id} ist nicht veröffentlicht`);
    if (next.nachfolger) throw new Error(`${job.id}: Nachfolger ${next.id} hat selbst einen Nachfolger`);
    if (!next.validThrough || parseJobDate(next.validThrough) <= parseJobDate(job.validThrough!)) {
      throw new Error(`${job.id}: Nachfolger ${next.id} muss länger laufen`);
    }
    if (nachfolger.has(next.id)) throw new Error(`${next.id} löst mehr als eine Stelle ab`);
    nachfolger.add(next.id);
  }
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

/**
 * Auswahl im Bewerbungsflow: veröffentlichte Stellen plus funnel_only. Mit `now` fallen
 * veröffentlichte Stellen weg, deren validThrough abgelaufen ist (wie Stellenseite, Sitemap und
 * Startseite, siehe isJobLive); ohne `now` alle, etwa für Beschriftungen bereits gesendeter Bewerbungen.
 */
export function getFunnelOptions(now?: Date): FunnelOption[] {
  return ALL_JOBS.filter(
    (job): job is Job & { status: FunnelOption['status'] } =>
      job.status === 'funnel_only' || (job.status === 'published' && (!now || isJobLive(job, now))),
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

/**
 * Abgelöst: Die Stelle endet geplant, weil ihre Nachfolgerin (`nachfolger`) am Stichtag live ist und selbst nicht vor
 * `limit` abläuft. Ihr Ablauf ist dann kein vergessenes Verlängern; die Nachfolgerin trägt die Frist.
 */
export function isJobSuperseded(job: Job, now: Date, limit: number = now.getTime(), jobs: readonly Job[] = ALL_JOBS): boolean {
  if (!job.nachfolger) return false;
  const next = jobs.find((other) => other.id === job.nachfolger);
  return next !== undefined && isJobLive(next, now) && next.validThrough !== undefined && parseJobDate(next.validThrough) >= limit;
}

/**
 * Veröffentlichte Stellen, deren validThrough in weniger als `minDays` Tagen erreicht ist. Eine abgelöste Stelle zählt
 * nicht (isJobSuperseded); fehlt ihre Nachfolgerin oder läuft die selbst bald ab, zählt sie wieder.
 */
export function getJobsExpiringWithin(now: Date, minDays = 14, jobs: readonly Job[] = ALL_JOBS): Job[] {
  const limit = now.getTime() + minDays * 24 * 60 * 60 * 1000;
  return jobs.filter(
    (job) =>
      job.status === 'published' &&
      (!job.validThrough || parseJobDate(job.validThrough) < limit) &&
      !isJobSuperseded(job, now, limit, jobs),
  );
}

/** Live Nachfolgerin einer Stelle (für „Diese Stelle ist besetzt“: der Weg zur neuen Ausschreibung). */
export function getLiveSuccessor(job: Job, now: Date): Job | undefined {
  const next = job.nachfolger ? getJobById(job.nachfolger) : undefined;
  return next && isJobLive(next, now) ? next : undefined;
}
