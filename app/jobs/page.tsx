import type { Metadata } from 'next';
import Link from 'next/link';
// Direct module imports: the barrels re-export client components this page does not use.
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { JobCard } from '@/components/jobs/JobCard';
import { lowerFirst, pageTitle } from '@/components/jobs/text';
import { ContactOptions } from '@/components/site/ContactOptions';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { TextLink } from '@/components/ui/TextLink';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { BREADCRUMB_HOME, BREADCRUMB_JOBS, FACTS, REGION } from '@/lib/content';
import { applyPath } from '@/lib/jobs/format';
import { buildJobsBreadcrumbJsonLd, serializeJsonLd } from '@/lib/jobs/jsonld';
import { getActiveJobs, getFunnelOptions, getJobById, isJobLive, type Job } from '@/lib/jobs/registry';
import { jobsHubDescription } from '@/lib/seo/descriptions';
import { generatePageMetadata } from '@/lib/seo/metadata';

/** Hourly, like the feeds: expired jobs leave the list without a deploy. */
export const revalidate = 3600;

const TITLE = 'Stellenangebote SHK Wetzlar & Gießen – alle offenen Jobs';

/** Live jobs at render time: expired ones leave the list (and the description) with the next revalidation. */
function liveJobs(now: Date): Job[] {
  return getActiveJobs().filter((job) => isJobLive(job, now));
}

/** Per request, not at module level: the description names the jobs that are live right now. */
export function generateMetadata(): Metadata {
  const jobs = liveJobs(new Date());
  return {
    ...generatePageMetadata({
      title: TITLE,
      description: jobsHubDescription(jobs),
      path: '/jobs',
      keywords: [
        'Stellenangebote SHK Wetzlar',
        'SHK Jobs Wetzlar',
        'SHK Jobs Gießen',
        'Heizungsbauer Jobs Wetzlar',
        ...jobs.map((job) => job.seo.primaryKeyword),
      ],
    }),
    title: pageTitle(TITLE),
  };
}

/** „Keine Fernmontage“ steht in der Einsatzgebiet-Überschrift weiter unten, deshalb nicht auch hier. */
const LEAD = `${FACTS.founded1926.short} in Wetzlar: ${FACTS.vacation30.short} und ${lowerFirst(FACTS.friday1330.short)}.`;

/** Hub for all open positions. No JobPosting markup here: Google allows it on the job pages only. */
export default function JobsPage() {
  const jobs = liveJobs(new Date());
  const funnelOnly = getFunnelOptions()
    .filter((option) => option.status === 'funnel_only')
    .map((option) => getJobById(option.id))
    .filter((job) => job !== undefined);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildJobsBreadcrumbJsonLd()) }} />

      <Container className="flex flex-col gap-10 pt-8 pb-section-sm lg:pt-12">
        <PageHeader
          before={<Breadcrumbs items={[BREADCRUMB_HOME, { label: BREADCRUMB_JOBS.label }]} />}
          title="Offene Stellen in Wetzlar und Umgebung"
          lead={LEAD}
        />

        {jobs.length > 0 ? (
          <ul aria-label={`${jobs.length} offene Stellen`} className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard job={job} headingLevel="h2" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-prose text-body text-ink-muted">
            Gerade ist keine Stelle ausgeschrieben. Eine Initiativbewerbung ist trotzdem jederzeit möglich.
          </p>
        )}
      </Container>

      <Section tone="subtle" spacing="compact" aria-labelledby="einsatzgebiet">
        <Container className="flex flex-col gap-3">
          <h2 id="einsatzgebiet" className="text-title-2 text-ink">
            {REGION.headline}
          </h2>
          <p className="max-w-prose text-lead text-ink-muted">{REGION.summary}</p>
        </Container>
      </Section>

      <Section spacing="compact" aria-labelledby="initiativ">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-4">
            <h2 id="initiativ" className="text-title-2 text-ink">
              Initiativ bewerben
            </h2>
            <p className="max-w-prose text-body text-ink-muted">
              Keine passende Stelle dabei? Bewirb dich trotzdem. {FACTS.noCvNeeded.long} {FACTS.quickResponse.long}
            </p>
            {funnelOnly.length > 0 && (
              <p className="max-w-prose text-body text-ink-muted">
                Auch möglich:{' '}
                {funnelOnly.map((job, i) => (
                  <span key={job.id}>
                    {i > 0 && ', '}
                    <TextLink href={applyPath(job)}>{job.shortTitle}</TextLink>
                  </span>
                ))}
                .
              </p>
            )}
            <Button asChild size="lg" className="mt-2">
              <Link href={INITIATIVE_APPLY_PATH} data-primary-cta="">
                Initiativ bewerben
              </Link>
            </Button>
          </div>
          <ContactOptions variant="card" />
        </Container>
      </Section>
    </>
  );
}
