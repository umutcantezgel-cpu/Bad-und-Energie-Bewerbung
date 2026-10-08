import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface LegalFact {
  label: string;
  value: ReactNode;
}

export interface LegalFactsProps {
  items: readonly LegalFact[];
  className?: string;
}

/**
 * Label/value pairs (address, register, contact) as a definition list: stacked on phones,
 * two columns from sm. Opts out of prose styling, so links inside use TextLink.
 */
export function LegalFacts({ items, className }: LegalFactsProps) {
  return (
    <dl
      className={cn(
        'not-prose my-6 grid gap-y-1 tabular-nums sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-baseline sm:gap-x-6 sm:gap-y-2',
        className,
      )}
    >
      {items.map((item) => (
        <Fragment key={item.label}>
          <dt className="text-callout text-ink-muted">{item.label}</dt>
          <dd className="mb-3 text-body text-ink last:mb-0 sm:mb-0">{item.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
