import { Icon } from '@/components/icons';
import { Card, CardLink } from '@/components/ui/Card';
import { SALARY_UNIT_LABEL, employmentLabel, formatSalaryAmount, formatSalaryRange, jobMetaTags, jobPath, locationLabel } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { bindSeparators, withSoftHyphens } from './text';

export interface JobCardProps {
  job: Job;
  /** h2 on /jobs, h3 below a section heading (home, „Weitere Stellen“). */
  headingLevel?: 'h2' | 'h3';
  /**
   * `karte` (default): card on surface-2, used on /jobs and in „Weitere Stellen“.
   * `abgang`: one row of a manifold (Variante 1/2 „Stellen als Leitungsabgänge“): the red supply
   * line enters from the left, the blue return leaves to the right, salary in font-mass. The
   * vertical lines come from <JobAbgaenge>, so use this variant inside it.
   */
  variant?: 'karte' | 'abgang';
  className?: string;
}

/** „Gehalt / Monat“ bzw. „Vergütung / Monat“ (B Runde 1), the unit under the salary figure. */
export function salaryUnitLabel(job: Pick<Job, 'salary' | 'employment'>): string | null {
  if (!job.salary) return null;
  return `${job.employment.kind === 'ausbildung' ? 'Vergütung' : 'Gehalt'} / ${SALARY_UNIT_LABEL[job.salary.unit]}`;
}

/** Whole card links to the job page. Server Component, no client JS. */
export function JobCard({ job, headingLevel = 'h3', variant = 'karte', className }: JobCardProps) {
  if (variant === 'abgang') return <JobAbgang job={job} headingLevel={headingLevel} className={className} />;

  const Heading = headingLevel;
  const [kind] = jobMetaTags(job);
  const salary = formatSalaryRange(job);

  return (
    <Card as="article" interactive className={cn('flex h-full flex-col gap-3', className)}>
      <Heading className="text-title-3 text-brand">
        <CardLink href={jobPath(job)}>{job.shortTitle}</CardLink>{' '}
        <span className="font-sans font-normal text-ink-muted">(m/w/d)</span>
      </Heading>
      <p className="max-w-prose text-body text-ink-muted">{job.summary}</p>
      {/* „Zur Stelle“ has its own row, so every card ends the same way, whatever the meta width. */}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        <p className="flex flex-col text-callout">
          <span className="text-ink-muted">
            {kind} · {locationLabel(job)}
          </span>
          {salary && <span className="font-mass font-medium text-ink">{salary}</span>}
        </p>
        <span aria-hidden="true" className="inline-flex items-center gap-1 self-start text-callout font-medium text-ink">
          Zur Stelle
          <Icon name="arrow-right" size="sm" />
        </span>
      </div>
    </Card>
  );
}

/**
 * One manifold row. Mobile: title, salary, employment; from md the salary gets its own column.
 * The whole row is the link: CardLink's ::after stretches over the inner row (its nearest positioned
 * ancestor, arrow included); the hover surface sits behind the text in the row's own stacking context
 * (isolate, -z-10). Hover shows the wall surface, press moves the row by 1 px („flaeche“, „druck“).
 */
function JobAbgang({ job, headingLevel: Heading = 'h3', className }: Omit<JobCardProps, 'variant'>) {
  const amount = formatSalaryAmount(job);
  const unit = salaryUnitLabel(job);

  return (
    <article className={cn('group/abgang relative px-4 sm:px-6', className)}>
      {/* Vorlauf in, Rücklauf out: 3 px stubs from the manifold lines to the row (decorative). */}
      <span aria-hidden="true" className="absolute top-1/2 left-0 h-[var(--m-strich)] w-4 -translate-y-1/2 rounded-r-voll bg-vorlauf sm:w-6" />
      <span aria-hidden="true" className="absolute top-1/2 right-0 h-[var(--m-strich)] w-4 -translate-y-1/2 rounded-l-voll bg-ruecklauf sm:w-6" />
      <div data-motion="druck" className="relative isolate flex items-center gap-4 border-b border-line py-4 pr-2 pl-4 md:py-6">
        <span
          aria-hidden="true"
          data-motion="flaeche"
          className={cn(
            'absolute inset-0 -z-10 bg-surface-2 opacity-0 transition-opacity duration-d1 ease-ein',
            '[@media(hover:hover)_and_(pointer:fine)]:group-hover/abgang:opacity-100',
            '[@media(hover:hover)_and_(pointer:fine)]:group-hover/abgang:duration-d2',
            '[@media(hover:hover)_and_(pointer:fine)]:group-hover/abgang:ease-aus',
          )}
        />
        <div className="grid min-w-0 flex-1 gap-y-1 md:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] md:gap-x-8">
          <Heading className="text-title-3 text-brand md:col-start-1 md:row-start-1">
            <CardLink
              href={jobPath(job)}
              className="after:rounded-none focus-visible:after:outline-3 focus-visible:after:outline-offset-0"
            >
              {bindSeparators(withSoftHyphens(job.shortTitle, job.titleShy))}
            </CardLink>{' '}
            <span className="font-sans text-callout font-normal text-ink-muted">(m/w/d)</span>
          </Heading>
          {amount && (
            <p className="flex flex-col gap-1 md:col-start-2 md:row-span-2 md:row-start-1 md:self-center">
              <span className="font-mass text-lead font-medium text-brand">{amount}</span>
              {unit && <span className="text-etikett text-ink-muted">{unit}</span>}
            </p>
          )}
          <p className="text-etikett text-ink-muted md:col-start-1 md:row-start-2">{employmentLabel(job)}</p>
        </div>
        <Icon name="arrow-right" size="lg" className="text-brand" />
      </div>
    </article>
  );
}

export interface JobAbgaengeProps {
  jobs: readonly Job[];
  headingLevel?: 'h2' | 'h3';
  /** Accessible name of the list, e.g. „4 offene Stellen“. */
  'aria-label'?: string;
  className?: string;
}

/**
 * Manifold of jobs (Variante 1 „Stellen als Leitungsabgänge“): the red supply line runs down on the
 * left, the blue return on the right, every job is a circuit in between. Server Component.
 */
export function JobAbgaenge({ jobs, headingLevel = 'h3', className, ...rest }: JobAbgaengeProps) {
  return (
    <ul
      aria-label={rest['aria-label']}
      className={cn(
        'relative',
        'before:absolute before:inset-y-0 before:left-0 before:w-[var(--m-strich)] before:rounded-voll before:bg-vorlauf',
        'after:absolute after:inset-y-0 after:right-0 after:w-[var(--m-strich)] after:rounded-voll after:bg-ruecklauf',
        className,
      )}
    >
      {jobs.map((job) => (
        <li key={job.id}>
          <JobCard job={job} headingLevel={headingLevel} variant="abgang" />
        </li>
      ))}
    </ul>
  );
}
