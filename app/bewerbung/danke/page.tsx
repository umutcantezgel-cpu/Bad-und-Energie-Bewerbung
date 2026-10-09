import { getFlowJobOptions } from '@/components/apply/options';
import { ThankYouView } from '@/components/apply/thanks/ThankYouView';
import type { ThankYouCompany, ThankYouJobs } from '@/components/apply/thanks/types';
import { Container } from '@/components/layout';
import { ContactOptions } from '@/components/site/ContactOptions';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { getProcessSteps } from '@/lib/content/process';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata({
  title: 'Danke für deine Bewerbung',
  description: 'Bestätigung deiner Bewerbung bei Bad und Energie: Bewerbungsnummer, nächste Schritte und optionale Ergänzungen.',
  path: '/bewerbung/danke',
  noindex: true,
});

const jobs: ThankYouJobs = Object.fromEntries(
  getFlowJobOptions().map((option) => [option.id, { label: option.summaryLabel, questionSet: option.questionSet }]),
);

const processSteps = {
  fachkraft: getProcessSteps('fachkraft'),
  ausbildung: getProcessSteps('ausbildung'),
  quereinstieg: getProcessSteps('quereinstieg'),
};

const company: ThankYouCompany = {
  shortName: COMPANY.shortName,
  legalName: COMPANY.legalName,
  phoneDisplay: COMPANY.phone.display,
  phoneE164: COMPANY.phone.e164,
  phoneHref: COMPANY.phone.href,
  email: COMPANY.email,
  street: COMPANY.address.street,
  postalCode: COMPANY.address.postalCode,
  city: COMPANY.address.city,
  region: COMPANY.address.region,
  countryName: COMPANY.address.countryName,
  website: COMPANY.website,
  openingHoursShort: COMPANY.openingHours.short,
  openingHoursSpec: COMPANY.openingHours.spec.map((entry) => ({ days: [...entry.days], opens: entry.opens, closes: entry.closes })),
};

/** Bestätigung nach dem Absenden (noindex). Die persönlichen Angaben liest ThankYouView im Browser. */
export default function DankePage() {
  return (
    <Container size="prose" className="py-section-sm">
      <ThankYouView
        jobs={jobs}
        processSteps={processSteps}
        company={company}
        quickResponse={FACTS.quickResponse.long}
        noCvNeeded={FACTS.noCvNeeded.long}
        contactOptions={<ContactOptions variant="card" />}
      />
    </Container>
  );
}
