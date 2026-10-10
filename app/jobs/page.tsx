import type { Metadata } from 'next';
// Direct module imports: the barrels re-export client components this page does not use.
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Ablauf } from '@/components/jobs/liste/Ablauf';
import { Einsatzgebiet } from '@/components/jobs/liste/Einsatzgebiet';
import { Initiativband } from '@/components/jobs/liste/Initiativband';
import { StellenKopf } from '@/components/jobs/liste/StellenKopf';
import { Stellenvergleich } from '@/components/jobs/liste/Stellenvergleich';
import { Stellenverteiler } from '@/components/jobs/liste/Stellenverteiler';
import { pageTitle } from '@/components/jobs/text';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildJobsBreadcrumbJsonLd } from '@/lib/jobs/jsonld';
import { getActiveJobs, getFunnelOptions, getJobById, isJobLive, type Job } from '@/lib/jobs/registry';
import { jobsHubDescription } from '@/lib/seo/descriptions';
import { buildPageGraph } from '@/lib/seo/graph';
import { generatePageMetadata } from '@/lib/seo/metadata';

/** Hourly, like the feeds: expired jobs leave the list without a deploy. */
export const revalidate = 3600;

const TITLE = 'Stellenangebote SHK Wetzlar & Gießen – alle offenen Jobs';

/** h1 im Wortlaut der bisherigen Seite. */
const H1 = 'Offene Stellen in Wetzlar und Umgebung';

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

/**
 * Hub for all open positions. No JobPosting markup here: Google allows it on the job pages only. The page's
 * one graph (V6-B) carries WebPage and the BreadcrumbList of the visible trail (Startseite › Stellen).
 */
export default function JobsPage() {
  const jobs = liveJobs(new Date());
  const funnelOnly = getFunnelOptions()
    .filter((option) => option.status === 'funnel_only')
    .map((option) => getJobById(option.id))
    .filter((job) => job !== undefined);

  return (
    <>
      <JsonLd data={buildPageGraph({ metadata: generateMetadata(), breadcrumb: buildJobsBreadcrumbJsonLd() })} />

      <StellenKopf jobs={jobs} titel={H1} />

      {/* Tonfolge (E-023): Kopf Papier/Navy · Stellen Papier mit Leitungstrenner · Vergleich Wand · Arbeitsalltag
          und Einsatzgebiet Papier · Ablauf Wand · Initiativ Navy */}
      <Section id="stellen" tone="papier" trenner aria-label="Stellen">
        <Container>
          <Stellenverteiler jobs={jobs} headingLevel="h2" />
        </Container>
      </Section>

      <Stellenvergleich jobs={jobs} />

      <Einsatzgebiet />

      <Ablauf />

      <Initiativband auchMoeglich={funnelOnly} />
    </>
  );
}
