import { JobAbgaenge } from '@/components/jobs';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { COMPANY } from '@/lib/content/company';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { SectionHeader } from './SectionHeader';

/** Etikett über „Offene Stellen“, gezählt aus den Stellen, die gerade live sind: „4 Stellen · Wetzlar“. */
export function stellenEtikett(anzahl: number): string {
  return `${anzahl} ${anzahl === 1 ? 'Stelle' : 'Stellen'} · ${COMPANY.address.city}`;
}

/**
 * #stellen (Variante 1 „Stellen als Leitungsabgänge“, B Runde 1 Stellenzeilen): every live job is a
 * circuit between the red supply line and the blue return, salary as a measure in font-mass.
 * Tonfolge E-023: paper between the week and the benefits (both on the wall), Leitungstrenner on top.
 */
export interface JobListProps {
  /** Stichtag für „live“ (Tests); Standard: jetzt. */
  now?: Date;
}

export function JobList({ now = new Date() }: JobListProps) {
  const jobs = getActiveJobs().filter((job) => isJobLive(job, now));

  return (
    <Section id="stellen" tone="papier" trenner aria-labelledby="stellen-title">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeader
            id="stellen-title"
            eyebrow={stellenEtikett(jobs.length)}
            title="Offene Stellen"
            lead="Jede Stelle mit Gehaltsspanne und allen Eckdaten."
          />
          <TextLink href="/jobs" standalone tone="muted">
            Alle Stellen im Überblick
          </TextLink>
        </div>

        <JobAbgaenge
          jobs={jobs}
          headingLevel="h3"
          aria-label={`${jobs.length} offene ${jobs.length === 1 ? 'Stelle' : 'Stellen'}`}
          className="mt-8 md:mt-12"
        />

        <p className="mt-8 text-body text-ink-muted">
          Nichts dabei? <TextLink href={INITIATIVE_APPLY_PATH}>Initiativ bewerben</TextLink>
        </p>
      </Container>
    </Section>
  );
}
