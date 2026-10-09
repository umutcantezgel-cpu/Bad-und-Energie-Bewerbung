import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SectionHeaderProps {
  /** Id of the <h2>; the surrounding <Section> points its aria-labelledby here. */
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}

/** Section heading (h2) with an optional lead paragraph. */
export function SectionHeader({ id, title, lead, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex max-w-3xl flex-col gap-4', className)}>
      <h2 id={id} className="text-title-1 text-ink">
        {title}
      </h2>
      {lead && <p className="max-w-prose text-lead text-ink-muted">{lead}</p>}
    </div>
  );
}
