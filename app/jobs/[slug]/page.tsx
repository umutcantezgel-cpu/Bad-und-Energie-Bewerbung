import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ApplyFlow } from '@/components/apply';
import {
  ApplyAnchorButton,
  JobFaq,
  JobHeader,
  JobProcess,
  JobQuote,
  JobSections,
  MoreJobs,
  SalaryCard,
  pageTitle,
} from '@/components/jobs';
import { Container } from '@/components/layout';
import { ContactOptions } from '@/components/site';
import { Breadcrumbs, Button, TextLink } from '@/components/ui';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { COMPANY, getTeamQuote } from '@/lib/content';
import { applyPath, getJobSections, jobPath } from '@/lib/jobs/format';
import { buildBreadcrumbJsonLd, buildJobPostingJsonLd, serializeJsonLd } from '@/lib/jobs/jsonld';
import { ALL_JOBS, getJobByLegacySlug, getJobBySlug, getJobPageSlugs, isJobLive, type Job } from '@/lib/jobs/registry';
import { generatePageMetadata } from '@/lib/seo/metadata';

type Params = Promise<{ slug: string }>;

/** Only known slugs render; everything else is a 404 without a server round trip. */
export const dynamicParams = false;

/** Re-rendered hourly, so a job past its validThrough drops out (noindex, no JobPosting) without a deploy. */
export const revalidate = 3600;

/** Job pages (published and archived) plus every legacy slug, which redirects with 308. */
export function generateStaticParams(): { slug: string }[] {
  const slugs = new Set([...getJobPageSlugs(), ...ALL_JOBS.flatMap((job) => job.redirectFrom)]);
  return [...slugs].map((slug) => ({ slug }));
}

function hasPage(job: Job): boolean {
  return job.status === 'published' || job.status === 'archived';
}

/** Published and within validThrough at render time; anything else shows the „besetzt“ page. */
function isOpen(job: Job): boolean {
  return isJobLive(job, new Date());
}

function resolveJob(slug: string): Job {
  const job = getJobBySlug(slug);
  if (job && hasPage(job)) return job;
  if (!job) {
    const moved = getJobByLegacySlug(slug);
    if (moved) permanentRedirect(hasPage(moved) ? jobPath(moved) : '/jobs');
  }
  notFound();
}

function whatsappMessage(job: Job): string {
  return `Guten Tag Herr Demir, ich interessiere mich für die Stelle als ${job.shortTitle}.`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job || !hasPage(job)) return {};

  if (!isOpen(job)) {
    const title = `${job.shortTitle}: Stelle besetzt`;
    return {
      ...generatePageMetadata({
        title,
        description: `Die Stelle ${job.title} bei ${COMPANY.shortName} in ${job.location.city} ist besetzt. Hier findest du die offenen Stellen.`,
        path: jobPath(job),
        noindex: true,
      }),
      title: pageTitle(title),
    };
  }

  return {
    ...generatePageMetadata({
      title: job.seo.metaTitle,
      description: job.seo.metaDescription,
      path: jobPath(job),
      keywords: [job.seo.primaryKeyword, ...job.seo.secondaryKeywords],
    }),
    title: pageTitle(job.seo.metaTitle),
  };
}

export default async function JobPage({ params }: { params: Params }) {
  const { slug } = await params;
  const job = resolveJob(slug);
  return isOpen(job) ? <OpenJob job={job} /> : <ClosedJob job={job} />;
}

function OpenJob({ job }: { job: Job }) {
  const jsonLd = [buildJobPostingJsonLd(job), buildBreadcrumbJsonLd(job)].filter((node) => node !== null);
  const quote = job.teamQuoteId ? getTeamQuote(job.teamQuoteId) : undefined;
  const applyText = getJobSections(job).find((section) => section.id === 'bewerben')?.text;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <Container className="pt-8 pb-section lg:pt-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="flex min-w-0 flex-col gap-16 lg:col-span-8">
            <JobHeader job={job} />
            <JobSections job={job} />
            {quote && <JobQuote quote={quote} />}
            <JobProcess audience={job.apply.questionSet} />

            <section id="bewerben" aria-labelledby="bewerben-titel" className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 id="bewerben-titel" className="text-title-2 text-ink">
                  In 60 Sekunden bewerben
                </h2>
                {applyText && <p className="max-w-prose text-body text-ink-muted">{applyText}</p>}
              </div>
              <Suspense fallback={<ApplyFallback job={job} />}>
                <ApplyFlow initialJobId={job.id} variant="embedded" funnel="job_page" />
              </Suspense>
            </section>

            <section aria-labelledby="ansprechpartner" className="flex flex-col gap-4 lg:hidden">
              <div className="flex flex-col gap-1">
                <h2 id="ansprechpartner" className="text-title-3 text-ink">
                  Lieber direkt sprechen?
                </h2>
                <p className="text-body text-ink-muted">
                  {COMPANY.managingDirector.name}, {COMPANY.managingDirector.title}
                </p>
              </div>
              <ContactOptions variant="inline" whatsappMessage={whatsappMessage(job)} />
            </section>

            <JobFaq job={job} />
          </div>

          <aside aria-label="Gehalt und Kontakt" className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 flex flex-col gap-4">
              <SalaryCard
                job={job}
                size="compact"
                action={<ApplyAnchorButton>Jetzt bewerben</ApplyAnchorButton>}
              />
              <ContactOptions variant="card" whatsappMessage={whatsappMessage(job)} />
            </div>
          </aside>
        </div>
      </Container>

      <MoreJobs currentJob={job} />
    </>
  );
}

/** Server-rendered stand-in while the flow loads (and the no-JS path): the flow as its own page. */
function ApplyFallback({ job }: { job: Job }) {
  return (
    <p className="text-body text-ink-muted">
      <TextLink href={applyPath(job)}>Bewerbung als {job.shortTitle} öffnen</TextLink>
    </p>
  );
}

/** Archived or expired: noindex, no JobPosting, links to similar jobs and an initiative application. */
function ClosedJob({ job }: { job: Job }) {
  return (
    <>
      <Container className="flex flex-col gap-6 pt-8 pb-section-sm lg:pt-12">
        <Breadcrumbs
          items={[{ label: 'Start', href: '/' }, { label: 'Stellen', href: '/jobs' }, { label: job.shortTitle }]}
        />
        <h1 className="text-title-1 text-ink">Diese Stelle ist besetzt</h1>
        <p className="max-w-prose text-lead text-ink-muted">
          Die Stelle {job.title} ist nicht mehr ausgeschrieben. Schau dir die offenen Stellen an oder bewirb dich
          initiativ.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button asChild size="lg">
            <Link href={INITIATIVE_APPLY_PATH} data-primary-cta="">
              Initiativ bewerben
            </Link>
          </Button>
          <TextLink href="/jobs" standalone>
            Alle offenen Stellen
          </TextLink>
        </div>
      </Container>
      <MoreJobs currentJob={job} title="Ähnliche Stellen" />
    </>
  );
}
