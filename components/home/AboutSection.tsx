import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ReviewCarousel, ReviewSummary } from '@/components/reviews';
import { StatTile } from '@/components/ui/StatTile';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { TEAM_QUOTES } from '@/lib/content/team';
import { SectionHeader } from './SectionHeader';

/**
 * #ueber-uns: company facts, the managing director's quote and the review carousel.
 * Title as in ROADMAP §5.6. The team size and the founding year stand in the title, so there is
 * no extra „15“ tile and the lead adds only the direct line to Sabri Demir.
 */
export function AboutSection() {
  const quote = TEAM_QUOTES.demir;
  const partners = FACTS.partners5.list ?? [];

  return (
    <Section id="ueber-uns" aria-labelledby="ueber-uns-title">
      <Container>
        <SectionHeader
          id="ueber-uns-title"
          // Non-breaking spaces keep each short sentence on one line („Ein“ never ends a line).
          title={`${FACTS.employees15.value}\u00A0Leute. Ein\u00A0Meisterbetrieb. Seit\u00A0${COMPANY.foundingYear}.`}
          lead={FACTS.directLine.long}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <figure className="flex flex-col gap-6 lg:col-span-7">
            <blockquote className="text-title-2 font-medium text-ink">
              <p>„{quote.quote}“</p>
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-2 text-callout font-semibold text-ink"
              >
                {quote.initials}
              </span>
              <span className="flex flex-col text-callout">
                <span className="font-semibold text-ink">{quote.name}</span>
                <span className="text-ink-muted">{quote.role}</span>
              </span>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-8 lg:col-span-5">
            <StatTile value={FACTS.partners5.value} label={FACTS.partners5.label} />
            <div>
              {/* The „5 Partner-Säulen“ tile above already names the list; the heading is for screen readers. */}
              <h3 className="sr-only">{FACTS.partners5.label}</h3>
              <ul className="divide-y divide-line border-t border-line">
                {partners.map((partner) => (
                  <li key={partner} className="py-3 text-callout text-ink-muted">
                    {partner}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-12 lg:mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="text-title-2 text-ink">Stimmen von Kunden und Team</h3>
            <ReviewSummary />
          </div>
          <div className="mt-8">
            <ReviewCarousel initialFilter="alle" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
