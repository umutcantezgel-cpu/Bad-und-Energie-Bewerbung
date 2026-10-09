import { JobCard } from '@/components/jobs';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { SectionHeader } from './SectionHeader';

/** #stellen: published jobs as cards (on surface, since cards sit on surface-2). */
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

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} headingLevel="h3" />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-body text-ink-muted">
          Nichts dabei? <TextLink href={INITIATIVE_APPLY_PATH}>Initiativ bewerben</TextLink>
        </p>
      </Container>
    </Section>
  );
}
