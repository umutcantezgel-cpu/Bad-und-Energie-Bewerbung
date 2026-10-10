import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { SectionHeader } from './SectionHeader';
import { Ausstattung } from './vorteile/Ausstattung';
import { PaketKonfigurator } from './vorteile/PaketKonfigurator';
import { KONFIGURATOR, WUNSCH_OPTIONEN, bewerbenLabel, paketRollen } from './vorteile/vorteile-text';
import { Zusagen } from './vorteile/Zusagen';

/**
 * The package and the promises describe the skilled jobs: the apprenticeship is fixed-term and comes
 * without iPad (fakten-abgleich.md B9), so the lead says who they are for and links its page.
 */
function BenefitLead({ ausbildungHref }: { ausbildungHref: string | null }) {
  if (!ausbildungHref) return 'Für Fachkräfte.';
  return (
    <>
      Für Fachkräfte. Was du in der Ausbildung bekommst, steht auf der{' '}
      <TextLink href={ausbildungHref}>Seite zur Ausbildung</TextLink>.
    </>
  );
}

/**
 * #vorteile on the wall surface (R3-HOME-02): the package configurator per role (E-START-024 with
 * the wishes of E-START-016, a small client island fed with plain data), the promises for every
 * skilled job (E-START-025) and the equipment list „Werkzeug & Fuhrpark“ (E-START-026).
 */
export function BenefitGrid() {
  const now = new Date();
  const live = getActiveJobs().filter((job) => isJobLive(job, now));
  const ausbildung = live.find((job) => job.category === 'ausbildung');
  const rollen = paketRollen(live, now);

  return (
    <Section id="vorteile" tone="subtle" aria-labelledby="vorteile-title">
      <Container className="flex flex-col gap-16 md:gap-24">
        <SectionHeader
          id="vorteile-title"
          title="Das bekommst du"
          lead={<BenefitLead ausbildungHref={ausbildung ? jobPath(ausbildung) : null} />}
        />

        {rollen.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex max-w-3xl flex-col gap-2">
              <h3 className="text-title-2 text-brand">{KONFIGURATOR.titel}</h3>
              <p className="text-body text-ink-muted">{KONFIGURATOR.lead}</p>
            </div>
            <PaketKonfigurator
              rollen={rollen}
              wuensche={WUNSCH_OPTIONEN}
              texte={{
                rolleLegende: KONFIGURATOR.rolleLegende,
                wunschLegende: KONFIGURATOR.wunschLegende,
                wunschHinweis: KONFIGURATOR.wunschHinweis,
                paketEtikett: KONFIGURATOR.paketEtikett,
                passtHinweis: KONFIGURATOR.passtHinweis,
                stelleLink: KONFIGURATOR.stelleLink,
                bewerben: Object.fromEntries(rollen.map((rolle) => [rolle.id, bewerbenLabel(rolle.titel)])),
              }}
              icons={{
                haken: <Icon name="check" size="sm" />,
                pfeil: <Icon name="arrow-right" size="md" />,
              }}
            />
          </div>
        )}

        <Zusagen />
        <Ausstattung />
      </Container>
    </Section>
  );
}
