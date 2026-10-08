import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ApplyFlow } from '@/components/apply';
// Direct module imports instead of the barrels: a barrel would register every client component it
// re-exports (Sheet, Field, MobileNav …) for this page.
import { ApplyAnchorButton } from '@/components/jobs/ApplyAnchorButton';
import { JobFaq } from '@/components/jobs/JobFaq';
import { JobHeader } from '@/components/jobs/JobHeader';
import { JobProcess } from '@/components/jobs/JobProcess';
import { JobQuote } from '@/components/jobs/JobQuote';
import { JobSections } from '@/components/jobs/JobSections';
import { MoreJobs } from '@/components/jobs/MoreJobs';
import { SalaryCard } from '@/components/jobs/SalaryCard';
import { pageTitle } from '@/components/jobs/text';
import { Container } from '@/components/layout/Container';
import { ContactOptions } from '@/components/site/ContactOptions';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { WHATSAPP_GREETING } from '@/lib/apply/whatsapp-message';
import { BREADCRUMB_HOME, BREADCRUMB_JOBS, COMPANY, FACTS, getTeamQuote } from '@/lib/content';
import { applyPath, jobPath } from '@/lib/jobs/format';
import { buildBreadcrumbJsonLd, buildJobPostingJsonLd, serializeJsonLd } from '@/lib/jobs/jsonld';
import { ALL_JOBS, getJobByLegacySlug, getJobBySlug, getJobPageSlugs, isJobLive, type Job } from '@/lib/jobs/registry';
import { fitDescription } from '@/lib/seo/descriptions';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { jobOgImage } from '@/lib/seo/og-image';

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

const isAusbildung = (job: Job) => job.category === 'ausbildung';

/** „Ausbildung zum Anlagenmechaniker SHK (m/w/d)“ → „Ausbildung zum Anlagenmechaniker SHK“. */
const withoutGenderTag = (title: string) => title.replace(/\s*\(m\/w\/d\)\s*$/, '');

/** „… für die Stelle als Kundendiensttechniker.“ bzw. „… für die Ausbildung zum Anlagenmechaniker SHK.“ */
function whatsappMessage(job: Job): string {
  const subject = isAusbildung(job) ? `die ${withoutGenderTag(job.title)}` : `die Stelle als ${job.shortTitle}`;
  return `${WHATSAPP_GREETING} ich interessiere mich für ${subject}.`;
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
        description: fitDescription(
          `Die Stelle ${job.title} bei ${COMPANY.shortName} in ${job.location.city} ist besetzt. Hier findest du die offenen Stellen.`,
          `Die Stelle ${job.shortTitle} bei ${COMPANY.shortName} ist besetzt. Hier findest du die offenen Stellen.`,
        ),
        path: jobPath(job),
        noindex: true,
        ogImage: jobOgImage(job, false),
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
      ogImage: jobOgImage(job, true),
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
  const contactPerson = { name: COMPANY.managingDirector.name, role: COMPANY.managingDirector.title };

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

            {/*
              „60 Sekunden“ is the title of process step 1 right above, so the heading does not repeat it.
              „Kein Lebenslauf“ stands once, next to the flow (at most twice per page with the FAQ).
            */}
            <section id="bewerben" aria-labelledby="bewerben-titel" className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 id="bewerben-titel" className="text-title-2 text-ink">
                  Jetzt bewerben
                </h2>
                <p className="max-w-prose text-body text-ink-muted">{FACTS.noCvNeeded.long}</p>
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
                  {contactPerson.name}, {contactPerson.role}
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
              <ContactOptions variant="card" person={contactPerson} whatsappMessage={whatsappMessage(job)} />
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
      <TextLink href={applyPath(job)}>
        {isAusbildung(job) ? 'Bewerbung für die Ausbildung öffnen' : `Bewerbung als ${job.shortTitle} öffnen`}
      </TextLink>
    </p>
  );
}

/** Archived or expired: noindex, no JobPosting, links to similar jobs and an initiative application. */
function ClosedJob({ job }: { job: Job }) {
  return (
    <>
      <Container className="flex flex-col gap-6 pt-8 pb-section-sm lg:pt-12">
        <Breadcrumbs
          items={[BREADCRUMB_HOME, BREADCRUMB_JOBS, { label: job.shortTitle }]}
        />
        <h1 className="text-title-1 text-ink">Diese Stelle ist besetzt</h1>
        <p className="max-w-prose text-lead text-ink-muted">
          {isAusbildung(job) ? `Die ${job.title}` : `Die Stelle ${job.title}`} ist nicht mehr ausgeschrieben. Schau dir
          die offenen Stellen an oder bewirb dich initiativ.
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
