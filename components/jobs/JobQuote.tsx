import { Card } from '@/components/ui';
import type { TeamQuote } from '@/lib/content';
import { cn } from '@/lib/utils/cn';

export interface JobQuoteProps {
  quote: TeamQuote;
  className?: string;
}

/** Typographic team testimonial (no photos): quote, monogram, name and role. */
export function JobQuote({ quote, className }: JobQuoteProps) {
  const titleId = `zitat-${quote.id}`;
  return (
    <Card as="section" padding="lg" aria-labelledby={titleId} className={cn('flex flex-col gap-6', className)}>
      <h2 id={titleId} className="text-callout font-medium text-ink-muted">
        Aus dem Team
      </h2>
      <figure className="flex flex-col gap-6">
        <blockquote>
          <p className="max-w-prose text-title-3 font-medium text-ink">„{quote.quote}“</p>
        </blockquote>
        <figcaption className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-3 text-callout font-semibold text-ink"
          >
            {quote.initials}
          </span>
          <span className="flex flex-col">
            <span className="text-callout font-medium text-ink">{quote.name}</span>
            <span className="text-footnote text-ink-muted">
              {quote.role}
              {quote.experience ? ` · ${quote.experience}` : ''}
            </span>
          </span>
        </figcaption>
      </figure>
    </Card>
  );
}
