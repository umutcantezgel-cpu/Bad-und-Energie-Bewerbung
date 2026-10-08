import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { SALARY_UNIT_LABEL, formatSalaryAmount } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';

export interface SalaryCardProps {
  job: Job;
  /** `compact` for the desktop aside: the range uses title-2 so it fits one line in the narrow column. */
  size?: 'default' | 'compact';
  /** Rendered right below the figure and brings its own top spacing, e.g. the apply button in the aside. */
  action?: ReactNode;
  className?: string;
}

/**
 * Visible salary range. Google requires the JobPosting baseSalary to match what the page
 * shows, so this card renders exactly `job.salary` and nothing else. No footnote: the
 * „über Tarif“ fact already stands in „Das bekommst du“ (each USP at most twice per page).
 */
export function SalaryCard({ job, size = 'default', action, className }: SalaryCardProps) {
  const amount = formatSalaryAmount(job);
  if (!amount || !job.salary) return null;
  const label = `${job.employment.kind === 'ausbildung' ? 'Vergütung' : 'Gehalt'} pro ${SALARY_UNIT_LABEL[job.salary.unit]}`;

  return (
    <Card padding="md" className={cn('flex flex-col', className)}>
      <StatTile
        value={size === 'compact' ? <span className="text-title-2">{amount}</span> : amount}
        label={label}
      />
      {action}
    </Card>
  );
}
