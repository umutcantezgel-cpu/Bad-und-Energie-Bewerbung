import type { ApplicationJobId } from '@/lib/applications/schema';
import type { JobCategory, JobId } from '@/lib/jobs/schema';

/** Stelle zur Auswahl in der Mappe; vom Server aus getFunnelOptions() gebaut (lib/mappe/context.ts). */
export interface MappeJobOption {
  id: JobId;
  slug: string;
  /** Voller Titel mit „(m/w/d)“, z. B. für die Betreffzeile. */
  title: string;
  category: JobCategory;
  /** Nur veröffentlichte Stellen haben eine Seite und werden als `?stelle=` an den Flow übergeben. */
  published: boolean;
}

/** Empfänger des Anschreibens; vom Server aus COMPANY gebaut (lib/mappe/context.ts). */
export interface MappeRecipient {
  companyName: string;
  /** Ansprechpartner ohne Titel, z. B. „Sabri Demir“. */
  contactName: string;
  /** Anrede-Zeile, z. B. „Sehr geehrter Herr Demir,“. */
  salutation: string;
  /** Adresszeile im Empfängerfeld, z. B. „Herrn Sabri Demir“. */
  attention: string;
  street: string;
  postalCode: string;
  city: string;
}

export type MappeJobSelection = ApplicationJobId | '';
