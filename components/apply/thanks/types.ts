import type { ReactNode } from 'react';
import type { ProcessAudience, ProcessStep } from '@/lib/content/process';
import type { QuestionSetId } from '@/lib/apply/questions';
import type { OpeningHoursSpec } from '@/lib/apply/office-hours';

/**
 * Stellen-Anzeige je ID (inklusive Initiativbewerbung). `ablauf` folgt der Kategorie (processAudienceFor), nicht dem
 * Fragenset: Das Schülerpraktikum fragt wie die Ausbildung, hat aber einen eigenen Ablauf.
 */
export type ThankYouJobs = Readonly<Record<string, { label: string; questionSet: QuestionSetId; ablauf: ProcessAudience }>>;

/** Stammdaten für Kontakt, vCard und Bürozeiten (aus COMPANY, auf dem Server zusammengestellt). */
export interface ThankYouCompany {
  shortName: string;
  legalName: string;
  phoneDisplay: string;
  phoneE164: string;
  phoneHref: string;
  /** Eigene Mobilnummer nur für WhatsApp (COMPANY.whatsapp); Anrufe laufen über phone*. */
  whatsappDisplay: string;
  whatsappE164: string;
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
  /** Ablauf je Zielgruppe (getProcessSteps), ausgewählt über `ThankYouJobs[…].ablauf`. */
  processSteps: Readonly<Record<ProcessAudience, readonly ProcessStep[]>>;
  company: ThankYouCompany;
  /** Fakt quickResponse. */
  quickResponse: string;
  /** Fakt noCvNeeded. */
  noCvNeeded: string;
  /** Mikrotext unter „Jetzt bewerben“ im Leerzustand (Fakten apply60s und noCvNeeded). */
  bewerbenMikrotext: string;
  /** Server-gerenderte Kontaktwege (ContactOptions). */
  contactOptions?: ReactNode;
}
