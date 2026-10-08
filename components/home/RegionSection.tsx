import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { RegionMap } from '@/components/maps';
import { REGION } from '@/lib/content/region';
import { SectionHeader } from './SectionHeader';

/** #einsatzgebiet: 35 km radius graphic with commute list (Google Maps only after 2-click consent). */
export function RegionSection() {
  return (
    <Section id="einsatzgebiet" aria-labelledby="einsatzgebiet-title">
      <Container>
        <SectionHeader id="einsatzgebiet-title" title={REGION.headline} lead={REGION.summary} />
        <RegionMap className="mt-10" />
        <p className="mt-8 max-w-prose text-callout text-ink-muted">{REGION.milestone.text}</p>
      </Container>
    </Section>
  );
}
