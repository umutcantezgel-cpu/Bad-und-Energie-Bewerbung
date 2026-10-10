import { getFlowJobOptions } from '@/components/apply/options';
import { LEER_KOPF } from '@/components/apply/thanks/danke-text';
import { ThankYouView } from '@/components/apply/thanks/ThankYouView';
import type { ThankYouCompany, ThankYouJobs } from '@/components/apply/thanks/types';
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

/**
 * Bestätigung nach dem Absenden (noindex), im Design des Einstiegs (E-023): Seitenkopf `arbeit` mit dem
 * Erfolgsmoment „Der Kreis schließt sich“, darunter Ablauf, kurze Wege und die freiwillige Ergänzung.
 * Die persönlichen Angaben liest ThankYouView im Browser; der Kopf ist Teil der Ansicht, weil er vom Zustand
 * abhängt (Erfolg oder keine Bewerbung in diesem Fenster).
 */
export default function DankePage() {
  return (
    <ThankYouView
      jobs={jobs}
      processSteps={processSteps}
      company={company}
      quickResponse={FACTS.quickResponse.long}
      noCvNeeded={FACTS.noCvNeeded.long}
      bewerbenMikrotext={LEER_KOPF.mikrotext(FACTS.apply60s.value, FACTS.noCvNeeded.short)}
      contactOptions={<ContactOptions variant="card" />}
    />
  );
}
