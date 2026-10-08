import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ReviewCarousel, ReviewSummary } from '@/components/reviews';
import { StatTile } from '@/components/ui/StatTile';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { TEAM_QUOTES } from '@/lib/content/team';
import { SectionHeader } from './SectionHeader';

const ABOUT_STATS = [FACTS.employees15, FACTS.partners5] as const;

/** #ueber-uns: company facts, the managing director's quote and the review carousel. */
export function AboutSection() {
  const quote = TEAM_QUOTES.demir;
  const partners = FACTS.partners5.list ?? [];

  return (
    <Section id="ueber-uns" aria-labelledby="ueber-uns-title">
      <Container>
        <SectionHeader
          id="ueber-uns-title"
          title={`Seit ${COMPANY.foundingYear}. Ein Meisterbetrieb.`}
          lead={`${FACTS.founded1926.long} ${FACTS.directLine.long}`}
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
            <ul className="grid grid-cols-2 gap-6">
              {ABOUT_STATS.map((fact) => (
                <li key={fact.id}>
                  <StatTile value={fact.value} label={fact.label} />
                </li>
              ))}
            </ul>
            <div>
              <h3 className="text-body font-semibold text-ink">{FACTS.partners5.label}</h3>
              <ul className="mt-3 divide-y divide-line border-t border-line">
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
