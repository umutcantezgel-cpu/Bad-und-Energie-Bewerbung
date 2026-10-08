import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Section } from '@/components/layout';
import { JobCard, pageTitle } from '@/components/jobs';
import { lowerFirst } from '@/components/jobs/text';
import { ContactOptions } from '@/components/site';
import { Breadcrumbs, Button, PageHeader, TextLink } from '@/components/ui';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { FACTS, REGION } from '@/lib/content';
import { applyPath } from '@/lib/jobs/format';
import { serializeJsonLd } from '@/lib/jobs/jsonld';
import { getActiveJobs, getFunnelOptions, getJobById, isJobLive } from '@/lib/jobs/registry';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/** Hourly, like the feeds: expired jobs leave the list without a deploy. */
export const revalidate = 3600;

const TITLE = 'Stellenangebote SHK Wetzlar & Gießen – alle offenen Jobs';
// ≤ 155 Zeichen; nennt die veröffentlichten Stellen. Beim Schließen einer Stelle mitpflegen.
const DESCRIPTION =
  'Offene SHK-Jobs in Wetzlar & Gießen: Anlagenmechaniker, Kundendienst, Obermonteur, Ausbildung. 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben.';

export const metadata: Metadata = {
  ...generatePageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: '/jobs',
    keywords: [
      'Stellenangebote SHK Wetzlar',
      'SHK Jobs Wetzlar',
      'SHK Jobs Gießen',
      'Heizungsbauer Jobs Wetzlar',
      ...getActiveJobs().map((job) => job.seo.primaryKeyword),
    ],
  }),
  title: pageTitle(TITLE),
};

const LEAD = `${FACTS.founded1926.short} in Wetzlar: ${FACTS.vacation30.short}, ${lowerFirst(FACTS.friday1330.short)} und ${lowerFirst(FACTS.noFarAssembly.short)}.`;

function breadcrumbJsonLd() {
  const base = SITE_CONFIG.baseUrl.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${base}/jobs#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: base },
      { '@type': 'ListItem', position: 2, name: 'Stellen', item: `${base}/jobs` },
    ],
  };
}

/** Hub for all open positions. No JobPosting markup here: Google allows it on the job pages only. */
export default function JobsPage() {
  const now = new Date();
  const jobs = getActiveJobs().filter((job) => isJobLive(job, now));
  const funnelOnly = getFunnelOptions()
    .filter((option) => option.status === 'funnel_only')
    .map((option) => getJobById(option.id))
    .filter((job) => job !== undefined);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd()) }} />

      <Container className="flex flex-col gap-10 pt-8 pb-section-sm lg:pt-12">
        <PageHeader
          before={<Breadcrumbs items={[{ label: 'Start', href: '/' }, { label: 'Stellen' }]} />}
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
