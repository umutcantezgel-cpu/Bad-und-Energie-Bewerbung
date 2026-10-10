import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
// Direct module imports instead of the barrels: a barrel would register every client component it
// re-exports (Sheet, Field, MobileNav …) for this page. Für den Flow heißt das: ApplyFlowLazy statt
// ApplyFlow, sonst stünde ApplyFlowClient samt react-hook-form wieder im Start-Bundle der Seite.
import { ApplyFlowLazy } from '@/components/apply/ApplyFlowLazy';
import { flowClientProps } from '@/components/apply/flow-props';
import { JobFaq } from '@/components/jobs/JobFaq';
import { JobHeader } from '@/components/jobs/JobHeader';
import { JobProcess } from '@/components/jobs/JobProcess';
import { JobQuote } from '@/components/jobs/JobQuote';
import { JobSections } from '@/components/jobs/JobSections';
import { MoreJobs } from '@/components/jobs/MoreJobs';
import { Pfad } from '@/components/jobs/stelle/Pfad';
import { ANSPRECHPARTNER, STELLE_ANKER } from '@/components/jobs/stelle/stelle-text';
import { pageTitle } from '@/components/jobs/text';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Seitenkopf } from '@/components/seitenkopf';
import { ContactOptions } from '@/components/site/ContactOptions';
import { TextLink } from '@/components/ui/TextLink';
import { HausKlein } from '@/components/zeichnung/HausKlein';
import { INITIATIVE_APPLY_PATH } from '@/lib/apply/params';
import { WHATSAPP_GREETING } from '@/lib/apply/whatsapp-message';
import { COMPANY, FACTS, getTeamQuote } from '@/lib/content';
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

/**
 * Offene Stelle (R5-JOBS-02, E-023), Erzählseite im Design des Einstiegs der Startseite. Tonfolge:
 * Kopf Papier/Navy · Aufgaben Wand · Vorteile Papier · Stimme Navy · Ablauf und Bewerbung Papier ·
 * Fragen Wand · Weitere Stellen Papier · Fuß Navy. Genau ein JobPosting (E-SEO-010) und die BreadcrumbList.
 */
function OpenJob({ job }: { job: Job }) {
  const jsonLd = [buildJobPostingJsonLd(job), buildBreadcrumbJsonLd(job)].filter((node) => node !== null);
  const quote = job.teamQuoteId ? getTeamQuote(job.teamQuoteId) : undefined;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <JobHeader job={job} />
      <JobSections job={job} />
      {quote && <JobQuote quote={quote} />}

      <Section tone="papier" trenner>
        <Container className="flex flex-col gap-section-sm">
          <JobProcess audience={job.apply.questionSet} />

          {/*
            „60 Sekunden“ steht im Mikrotext des Kopfs und als Titel von Schritt 1 darüber, „Kein Lebenslauf“ im
            Mikrotext des Kopfs (und in der FAQ der Ausbildung): hier darum keins von beiden ein weiteres Mal.
          */}
          <section
            id={STELLE_ANKER.bewerben}
            aria-labelledby="bewerben-titel"
            className="grid gap-12 lg:grid-cols-12 lg:gap-x-12"
          >
            <div className="flex min-w-0 flex-col gap-8 lg:col-span-7">
              <div className="flex flex-col gap-4">
                <p className="text-etikett text-ink-muted">Bewerbung</p>
                <h2 id="bewerben-titel" className="text-title-1 text-brand">
                  Jetzt bewerben
                </h2>
                <p className="max-w-prose text-lead text-ink-muted">{FACTS.quickResponse.long}</p>
              </div>
              <Suspense fallback={<ApplyFallback job={job} />}>
                <ApplyFlowLazy {...flowClientProps({ initialJobId: job.id, variant: 'embedded', funnel: 'job_page' })} />
              </Suspense>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-5 lg:pt-24">
              <div className="flex flex-col gap-4 lg:sticky lg:top-24">
                <h3 className="text-title-3 text-brand">Lieber direkt sprechen?</h3>
                <ContactOptions variant="card" person={ANSPRECHPARTNER} whatsappMessage={whatsappMessage(job)} />
              </div>
            </div>
          </section>
        </Container>
      </Section>

      <Section tone="wand" trenner="62%">
        <Container>
          <JobFaq job={job} />
        </Container>
      </Section>

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
      <Pfad job={job} />
      <Seitenkopf
        variante="arbeit"
        etikett={`${job.shortTitle} · ${COMPANY.address.city}`}
        titel="Diese Stelle ist besetzt"
        einleitung={
          <p>
            {isAusbildung(job) ? `Die ${job.title}` : `Die Stelle ${job.title}`} ist nicht mehr ausgeschrieben. Schau
            dir die offenen Stellen an oder bewirb dich initiativ.
          </p>
        }
        aktion={{ href: INITIATIVE_APPLY_PATH, label: 'Initiativ bewerben' }}
        zweitweg={{ href: '/jobs', label: 'Alle offenen Stellen' }}
        panel={<HausKlein />}
      />
      <MoreJobs currentJob={job} title="Ähnliche Stellen" />
    </>
  );
}
