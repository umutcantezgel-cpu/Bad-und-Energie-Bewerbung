import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { RegionMap } from '@/components/maps';
import { REGION } from '@/lib/content/region';
import { GEBIET_ETIKETT } from './gebiet/gebiet-text';
import { WeitereOrte } from './gebiet/WeitereOrte';
import { Werkstatt } from './gebiet/Werkstatt';
import { SectionHeader } from './SectionHeader';

/**
 * #einsatzgebiet (B Runde 1 „.gebiet“, E-START-029…-040): Radius 15/25/35 km als Plan mit Lahn,
 * Dill, A45 und B49, Ortswahl mit Entfernung und Fahrzeit (Pendlerrechner), weitere Orte, Werkstatt
 * mit Routenlink. Google Maps nur nach Zwei-Klick-Einwilligung (unverändert). Der Meilenstein 2026
 * steht bei „Über uns“ (E-START-031, R3-HOME-04).
 */
export function RegionSection() {
  return (
    <Section id="einsatzgebiet" aria-labelledby="einsatzgebiet-title">
      <Container>
        <RegionMap
          header={
            <SectionHeader
              id="einsatzgebiet-title"
              eyebrow={GEBIET_ETIKETT}
              klammer
              title={REGION.headline}
              lead={REGION.summary}
            />
          }
        />
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-x-16">
          <WeitereOrte />
          <Werkstatt />
        </div>
      </Container>
    </Section>
  );
}
