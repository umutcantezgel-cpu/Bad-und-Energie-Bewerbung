import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Tag } from '@/components/ui/Tag';
import { BREADCRUMB_HOME, BREADCRUMB_JOBS } from '@/lib/content/breadcrumbs';
import { jobMetaTags } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { SalaryCard } from './SalaryCard';
import { bindSeparators, withSoftHyphens } from './text';

export interface JobHeaderProps {
  job: Job;
  className?: string;
}

/**
 * Head of a job page: Breadcrumbs → h1 → meta tags → salary range (below lg; the desktop
 * aside shows it there) → intro. The h1 is seo.h1 with the soft hyphens from titleShy; a spaced
 * „/“ or „–“ stays at the end of its line (bindSeparators).
 */
export function JobHeader({ job, className }: JobHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-6', className)}>
      <Breadcrumbs
        items={[BREADCRUMB_HOME, BREADCRUMB_JOBS, { label: job.shortTitle }]}
      />
      <div className="flex flex-col gap-5">
        <h1 className="text-title-1 text-balance text-ink">{bindSeparators(withSoftHyphens(job.seo.h1, job.titleShy))}</h1>
        <ul aria-label="Eckdaten" className="flex flex-wrap gap-2">
          {jobMetaTags(job).map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>
      </div>
      <SalaryCard job={job} className="lg:hidden" />
      <p className="max-w-prose text-lead text-ink">{job.intro}</p>
    </header>
  );
}
