import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import type { TeamQuote } from '@/lib/content';
import { cn } from '@/lib/utils/cn';

export interface JobQuoteProps {
  quote: TeamQuote;
  className?: string;
}

/**
 * Stimme aus dem Team als Navy-Band (Inverse-Band, Tonfolge der Stellenseite): das Zitat groß in Bricolage,
 * davor ein Vorlauf-Strich als Marke, darunter Monogramm im Markenrand, Name und Rolle. Typografisch, ohne Foto.
 */
export function JobQuote({ quote, className }: JobQuoteProps) {
  const titleId = `zitat-${quote.id}`;
  return (
    <Section tone="band" aria-labelledby={titleId} className={className}>
      <Container className="flex flex-col gap-8">
        <h2 id={titleId} className="text-etikett text-ink-2">
          Aus dem Team
        </h2>
        <figure className="flex flex-col gap-8">
          <blockquote className={cn('relative max-w-4xl pl-6 sm:pl-8')}>
            {/* Vorlauf als senkrechte Leitung am Zitat (dekorativ) */}
            <span aria-hidden="true" className="absolute top-[0.2em] bottom-[0.2em] left-0 w-(--m-strich) rounded-voll bg-vorlauf" />
            <p className="text-title-2 text-balance text-brand">„{quote.quote}“</p>
          </blockquote>
          <figcaption className="flex items-center gap-4 pl-6 sm:pl-8">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-voll border-(length:--m-strich) border-brand font-mass text-callout font-semibold text-brand"
            >
              {quote.initials}
            </span>
            <span className="flex flex-col">
              <span className="text-body font-bold text-ink">{quote.name}</span>
              <span className="text-callout text-ink-2">
                {quote.role}
                {quote.experience ? ` · ${quote.experience}` : ''}
              </span>
            </span>
          </figcaption>
        </figure>
      </Container>
    </Section>
  );
}
