import { Container } from '@/components/layout/Container';
import { Section, type SectionTone } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { COMPANY } from '@/lib/content/company';
import { getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import { JobAbgaenge } from './JobCard';

export interface MoreJobsProps {
  /** The job of the current page; it is left out and similar jobs come first. */
  currentJob?: Job;
  title?: string;
  /** Reference date for expired jobs; defaults to now (build time on static pages). */
  now?: Date;
  /** Ton des Bands (Tonfolge der Seite); Standard Papier, auf dem die Abgänge ihre Hover-Fläche (Wand) zeigen. */
  tone?: SectionTone;
  className?: string;
}

/** Other live jobs, similar ones first (same question set, then registry order). */
export function getMoreJobs(currentJob: Job | undefined, now: Date = new Date()): Job[] {
  const others = getActiveJobs().filter((job) => job.id !== currentJob?.id && isJobLive(job, now));
  if (!currentJob) return others;
  const rank = (job: Job) => (job.apply.questionSet === currentJob.apply.questionSet ? 0 : 1);
  return others.map((job, i) => ({ job, i })).sort((a, b) => rank(a.job) - rank(b.job) || a.i - b.i).map(({ job }) => job);
}

/**
 * Band mit den übrigen offenen Stellen als Leitungsabgänge wie #stellen der Startseite (Vorlauf links,
 * Rücklauf rechts, Gehalt als Maß), mit Leitungstrenner, h2 und Link auf /jobs.
 */
export function MoreJobs({ currentJob, title = 'Weitere Stellen', now, tone = 'papier', className }: MoreJobsProps) {
  const jobs = getMoreJobs(currentJob, now);
  return (
    <Section tone={tone} trenner aria-labelledby="weitere-stellen" className={className}>
      <Container className="flex flex-col gap-12">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex flex-col gap-4">
            <p className="text-etikett text-ink-muted">
              {jobs.length} {jobs.length === 1 ? 'Stelle' : 'Stellen'} · {COMPANY.address.city}
            </p>
            <h2 id="weitere-stellen" className="text-title-1 text-brand">
              {title}
            </h2>
          </div>
          <TextLink href="/jobs" standalone tone="muted">
            Alle offenen Stellen
          </TextLink>
        </div>
        {jobs.length > 0 ? (
          <JobAbgaenge
            jobs={jobs}
            headingLevel="h3"
            aria-label={`${jobs.length} weitere ${jobs.length === 1 ? 'Stelle' : 'Stellen'}`}
          />
        ) : (
          <p className="max-w-prose text-body text-ink-muted">
            Gerade ist keine weitere Stelle ausgeschrieben.{' '}
            <TextLink href={INITIATIVE_APPLY_PATH}>Bewirb dich initiativ</TextLink>.
          </p>
        )}
      </Container>
    </Section>
  );
}
