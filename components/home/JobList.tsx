import { JobAbgaenge } from '@/components/jobs';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { SectionHeader } from './SectionHeader';

/**
 * #stellen (Variante 1 „Stellen als Leitungsabgänge“, B Runde 1 Stellenzeilen): every live job is a
 * circuit between the red supply line and the blue return, salary as a measure in font-mass.
 * Plain surface; the benefits below sit on the wall surface.
 */
export function JobList() {
  const now = new Date();
  const jobs = getActiveJobs().filter((job) => isJobLive(job, now));

  return (
    <Section id="stellen" aria-labelledby="stellen-title">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeader
            id="stellen-title"
            title="Offene Stellen"
            lead="Jede Stelle mit Gehaltsspanne und allen Eckdaten."
          />
          <TextLink href="/jobs" standalone tone="muted">
            Alle Stellen im Überblick
          </TextLink>
        </div>

        <JobAbgaenge jobs={jobs} headingLevel="h3" className="mt-8 md:mt-12" />

        <p className="mt-8 text-body text-ink-muted">
          Nichts dabei? <TextLink href={INITIATIVE_APPLY_PATH}>Initiativ bewerben</TextLink>
        </p>
      </Container>
    </Section>
  );
}
