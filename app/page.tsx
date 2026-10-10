import type { Metadata } from 'next';
import {
  AboutSection,
  BenefitGrid,
  CtaBand,
  FaqSection,
  HOME_KEYWORDS,
  HOME_TITLE,
  Hero,
  JobList,
  ProcessTimeline,
  RegionSection,
  WeekSection,
  homeDescription,
} from '@/components/home';
import { AnchorAliases } from '@/components/home/AnchorAliases';
import { buildFaqPageJsonLd } from '@/components/home/content';
import { JsonLd } from '@/components/seo/JsonLd';
import { getFaqItems } from '@/lib/content/faq';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { buildPageGraph } from '@/lib/seo/graph';
import { generatePageMetadata } from '@/lib/seo/metadata';

/** Hourly, like the feeds: expired jobs leave the job list without a deploy. */
export const revalidate = 3600;

/** Per request: the description names the job types that are live right now. */
export function generateMetadata(): Metadata {
  const liveJobs = getActiveJobs().filter((job) => isJobLive(job, new Date()));
  return generatePageMetadata({
    title: HOME_TITLE,
    absoluteTitle: true,
    description: homeDescription(liveJobs),
    path: '/',
    type: 'money',
    keywords: HOME_KEYWORDS,
  });
}

/**
 * Home (ROADMAP §5): calm sections alternating surface-2 / surface, one primary action
 * („Jetzt bewerben“) per viewport. Job cards, map and reviews sit on plain surface sections
 * because their cards use surface-2.
 */
/**
 * Anchors of the previous career page (E-START-052, E-SEO-021), kept as alias targets right
 * before the section that took over their task. Plain spans work without JavaScript; the scroll
 * offset for the sticky header comes from the global scroll-padding.
 */
function Alias({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} id={id} aria-hidden="true" className="block" />
      ))}
    </>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Der eine Graph der Seite (V6-B), mit der einzigen FAQPage der Website: dieselben Fragen wie FaqSection. */}
      <JsonLd data={buildPageGraph({ metadata: generateMetadata(), faq: buildFaqPageJsonLd(getFaqItems()) })} />
      <AnchorAliases />
      <Alias ids={['express-funnel']} />
      <Hero />
      <WeekSection />
      <Alias ids={['karriere-paket', 'gehalt']} />
      <JobList />
      <Alias ids={['benefits']} />
      <BenefitGrid />
      <RegionSection />
      <Alias ids={['wechsel-prozess']} />
      <ProcessTimeline />
      <Alias ids={['bewertungen']} />
      <AboutSection />
      <FaqSection />
      <Alias ids={['kontakt']} />
      <CtaBand />
    </>
  );
}
