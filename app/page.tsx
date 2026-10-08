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
  homeDescription,
} from '@/components/home';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
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
export default function HomePage() {
  return (
    <>
      <Hero />
      <JobList />
      <BenefitGrid />
      <RegionSection />
      <ProcessTimeline />
      <AboutSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}
