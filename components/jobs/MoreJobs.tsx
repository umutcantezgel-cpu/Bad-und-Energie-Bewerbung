import { Container, Section } from '@/components/layout';
import { TextLink } from '@/components/ui';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import { JobCard } from './JobCard';

export interface MoreJobsProps {
  /** The job of the current page; it is left out and similar jobs come first. */
  currentJob?: Job;
  title?: string;
  /** Reference date for expired jobs; defaults to now (build time on static pages). */
  now?: Date;
  className?: string;
}

/** Other live jobs, similar ones first (same question set, then registry order). */
export function getMoreJobs(currentJob: Job | undefined, now: Date = new Date()): Job[] {
  const others = getActiveJobs().filter((job) => job.id !== currentJob?.id && isJobLive(job, now));
  if (!currentJob) return others;
  const rank = (job: Job) => (job.apply.questionSet === currentJob.apply.questionSet ? 0 : 1);
  return others.map((job, i) => ({ job, i })).sort((a, b) => rank(a.job) - rank(b.job) || a.i - b.i).map(({ job }) => job);
}

/** Band with the other open positions (h2 + JobCards with h3) and a link to /jobs. */
export function MoreJobs({ currentJob, title = 'Weitere Stellen', now, className }: MoreJobsProps) {
  const jobs = getMoreJobs(currentJob, now);
  return (
    <Section tone="subtle" aria-labelledby="weitere-stellen" className={className}>
      <Container className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 id="weitere-stellen" className="text-title-2 text-ink">
            {title}
          </h2>
          <TextLink href="/jobs" standalone tone="muted">
            Alle offenen Stellen
          </TextLink>
        </div>
        {jobs.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} headingLevel="h3" className="bg-surface" />
              </li>
            ))}
          </ul>
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
