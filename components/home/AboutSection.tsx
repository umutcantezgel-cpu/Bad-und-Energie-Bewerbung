import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ReviewCarousel, ReviewSummary } from '@/components/reviews';
import { ChefZitat } from './betrieb/ChefZitat';
import { Meilenstein } from './betrieb/Meilenstein';
import { PartnerSaeulen } from './betrieb/PartnerSaeulen';
import { STIMMEN_TITEL, UEBER_UNS_EINLEITUNG, UEBER_UNS_ETIKETT, ueberUnsTitel } from './betrieb/betrieb-text';
import { SectionHeader } from './SectionHeader';

/**
 * #ueber-uns (R3-HOME-04, ROADMAP §5.6): der Betrieb und die Stimmen.
 * - Kopf „15 Leute. Ein Meisterbetrieb. Seit 1926.“ mit dem direkten Draht zu Sabri Demir (Fakt directLine).
 * - Zitat von Sabri Demir in der Rohrklammer, darunter der Meilenstein 2026 als Maß (E-START-031);
 *   daneben die fünf Partner-Säulen mit ihren belegten Zusätzen.
 * - Stimmen: Google-Bewertungen mit Inhaber-Antwort (E-START-043) und die freigegebenen Teamstimmen in einer
 *   Reihe zum Wischen und Ziehen (E-START-046), dazu die Google-Bewertungszeile, sobald sie datiert ist.
 * Mobil: alles in einer Spalte, Zitat zuerst. Ab lg: Zitat und Meilenstein links (7), Partner rechts (5).
 */
export function AboutSection() {
  return (
    <Section id="ueber-uns" aria-labelledby="ueber-uns-title">
      <Container>
        <SectionHeader
          id="ueber-uns-title"
          eyebrow={UEBER_UNS_ETIKETT}
          title={ueberUnsTitel()}
          lead={UEBER_UNS_EINLEITUNG}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-x-16">
          <div className="flex flex-col gap-12 lg:col-span-7">
            <ChefZitat />
            <Meilenstein />
          </div>
          <PartnerSaeulen className="lg:col-span-5" />
        </div>

        <div className="mt-16 lg:mt-24 lg:border-t lg:border-line lg:pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="text-title-2 text-brand">{STIMMEN_TITEL}</h3>
            <ReviewSummary />
          </div>
          <ReviewCarousel initialFilter="alle" className="mt-6" />
        </div>
      </Container>
    </Section>
  );
}
