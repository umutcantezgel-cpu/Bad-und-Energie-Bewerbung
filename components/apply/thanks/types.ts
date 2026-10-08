import type { ReactNode } from 'react';
import type { ProcessStep } from '@/lib/content/process';
import type { QuestionSetId } from '@/lib/apply/questions';
import type { OpeningHoursSpec } from '@/lib/apply/office-hours';

/** Stellen-Anzeige je ID (inklusive Initiativbewerbung). */
export type ThankYouJobs = Readonly<Record<string, { label: string; questionSet: QuestionSetId }>>;

/** Stammdaten für Kontakt, vCard und Bürozeiten (aus COMPANY, auf dem Server zusammengestellt). */
export interface ThankYouCompany {
  shortName: string;
  legalName: string;
  phoneDisplay: string;
  phoneE164: string;
  phoneHref: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
  region: string;
  countryName: string;
  website: string;
  openingHoursShort: string;
  openingHoursSpec: readonly OpeningHoursSpec[];
}

export interface ThankYouViewProps {
  jobs: ThankYouJobs;
  /** Ablauf je Fragenset (getProcessSteps). */
  processSteps: Readonly<Record<QuestionSetId, readonly ProcessStep[]>>;
  company: ThankYouCompany;
  /** Fakt quickResponse. */
  quickResponse: string;
  /** Fakt noCvNeeded. */
  noCvNeeded: string;
  /** Server-gerenderte Kontaktwege (ContactOptions). */
  contactOptions?: ReactNode;
}
