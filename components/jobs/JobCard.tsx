import { ArrowRight } from 'lucide-react';
import { Card, CardLink } from '@/components/ui/Card';
import { formatSalaryRange, jobMetaTags, jobPath, locationLabel } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';

export interface JobCardProps {
  job: Job;
  /** h2 on /jobs, h3 below a section heading (home, „Weitere Stellen“). */
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/** Whole card links to the job page. Server Component, no client JS. */
export function JobCard({ job, headingLevel = 'h3', className }: JobCardProps) {
  const Heading = headingLevel;
  const [kind] = jobMetaTags(job);
  const salary = formatSalaryRange(job);

  return (
    <Card as="article" interactive className={cn('flex h-full flex-col gap-3', className)}>
      <Heading className="text-title-3 text-ink">
        <CardLink href={jobPath(job)}>{job.shortTitle}</CardLink>{' '}
        <span className="font-normal text-ink-muted">(m/w/d)</span>
      </Heading>
      <p className="max-w-prose text-body text-ink-muted">{job.summary}</p>
      {/* „Zur Stelle“ has its own row, so every card ends the same way, whatever the meta width. */}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        <p className="flex flex-col text-callout">
          <span className="text-ink-muted">
            {kind} · {locationLabel(job)}
          </span>
          {salary && <span className="font-medium tabular-nums text-ink">{salary}</span>}
        </p>
        <span aria-hidden="true" className="inline-flex items-center gap-1 self-start text-callout font-medium text-ink">
          Zur Stelle
          <ArrowRight strokeWidth={1.75} className="size-4" />
        </span>
      </div>
    </Card>
  );
}
