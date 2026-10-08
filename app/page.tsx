import type { Metadata } from 'next';
import {
  AboutSection,
  BenefitGrid,
  CtaBand,
  FaqSection,
  HOME_DESCRIPTION,
  HOME_KEYWORDS,
  HOME_TITLE,
  Hero,
  JobList,
  ProcessTimeline,
  RegionSection,
} from '@/components/home';
import { generatePageMetadata } from '@/lib/seo/metadata';

/** Hourly, like the feeds: expired jobs leave the job list without a deploy. */
export const revalidate = 3600;

export const metadata: Metadata = generatePageMetadata({
  title: HOME_TITLE,
  absoluteTitle: true,
  description: HOME_DESCRIPTION,
  path: '/',
  type: 'money',
  keywords: HOME_KEYWORDS,
});

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
