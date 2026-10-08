import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatTile } from '@/components/ui/StatTile';
import { TextLink } from '@/components/ui/TextLink';
import { HERO, HERO_STATS } from './content';

/** Eyebrow, two-part H1, lead, one primary action and the four key figures. */
export function Hero() {
  return (
    <Section tone="subtle" aria-labelledby="hero-title" className="pt-12 lg:pt-20">
      <Container className="flex flex-col gap-14 lg:gap-20">
        <PageHeader
          size="display"
          titleId="hero-title"
          eyebrow={HERO.eyebrow}
          title={
            <>
              {HERO.title}{' '}
              <span className="block text-ink-muted">{HERO.titleSecondLine}</span>
            </>
          }
          lead={HERO.lead}
        >
          <div data-primary-cta className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Button asChild size="xl">
              <Link href="/bewerbung">Jetzt bewerben</Link>
            </Button>
            <TextLink href="#stellen" standalone>
              Offene Stellen ansehen
              <ArrowDown aria-hidden="true" strokeWidth={1.75} className="size-4" />
            </TextLink>
          </div>
          <p className="basis-full text-footnote text-ink-muted">{HERO.microcopy}</p>
        </PageHeader>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 lg:grid-cols-4">
          {HERO_STATS.map((stat) => (
            <li key={stat.factId}>
              <StatTile value={stat.value} label={stat.label} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
