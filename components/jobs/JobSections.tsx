import { Check } from 'lucide-react';
import { getJobSections, type JobSection } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { PackageList, type PackageListItem } from './PackageList';
import { splitLabel } from './text';

export interface JobSectionsProps {
  job: Job;
  className?: string;
}

/** Shown elsewhere on the page: the intro under the h1, the apply text in #bewerben. */
const RENDERED_ELSEWHERE = new Set<JobSection['id']>(['intro', 'bewerben']);

function toRows(items: readonly string[]): PackageListItem[] {
  return items.map((item, i) => {
    const split = splitLabel(item);
    return split ? { label: split.label, text: split.value } : { label: String(i + 1), text: item };
  });
}

function SectionBody({ section, job }: { section: JobSection; job: Job }) {
  const items = section.items ?? [];
  switch (section.id) {
    case 'vorteile':
      return (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-body text-ink">
              <Check aria-hidden="true" strokeWidth={2} className="mt-1 size-5 shrink-0 text-ink" />
              <span className="max-w-prose">{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'paket':
      return <PackageList items={job.packageExtras} />;
    case 'eckdaten':
      return <PackageList items={toRows(items)} />;
    default:
      return (
        <ul className="flex max-w-prose list-disc flex-col gap-2 pl-5 text-body text-ink marker:text-ink-muted">
          {items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      );
  }
}

/**
 * Content sections of a job page in the order of getJobSections(), the same source as the
 * JobPosting description and the feeds, so page, schema and job boards never drift apart.
 */
export function JobSections({ job, className }: JobSectionsProps) {
  const sections = getJobSections(job).filter((s) => !RENDERED_ELSEWHERE.has(s.id) && s.heading);
  return (
    <div className={cn('flex flex-col gap-12', className)}>
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`stelle-${section.id}`} className="flex flex-col gap-5">
          <h2 id={`stelle-${section.id}`} className="text-title-3 text-ink">
            {section.heading}
          </h2>
          <SectionBody section={section} job={job} />
        </section>
      ))}
    </div>
  );
}
