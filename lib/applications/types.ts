import type { AcquisitionChannel } from '@/lib/attribution/channel';
import type { JobStatus, QuestionSet } from '@/lib/jobs/schema';
import type { ApplicationJobId, ContactChannel } from './constants';
import type { ApplicationAnswers, Attribution, Mappe } from './schema';

/**
 * Serverseitige Form einer Bewerbung nach Prüfung und Normalisierung. Grundlage für
 * E-Mail-Vorlagen (Phase 1) und die Datenbank (Phase 2, gleicher Sink-Vertrag).
 */

export interface NormalizedPhone {
  /** Eingabe wie getippt (getrimmt). Bleibt immer erhalten, auch wenn nichts erkannt wurde. */
  raw: string;
  /** E.164, z. B. „+4915123456789“; fehlt, wenn die Nummer nicht erkannt wurde. */
  e164?: string;
  /** Lesbare Form: national für deutsche Nummern („01512 3456789“), sonst international; sonst raw. */
  display: string;
  /** Laut libphonenumber-Metadaten gültig; nur dann gibt es `e164`. */
  valid: boolean;
  /** ISO-Ländercode, falls bekannt. */
  country?: string;
}

/** Stelle, wie sie der Server aus dem Registry ableitet (nie aus Angaben des Clients). */
export interface ApplicationJobInfo {
  id: ApplicationJobId;
  /** Voller Titel mit „(m/w/d)“ bzw. „Initiativbewerbung“. */
  title: string;
  /** Kurzer Titel für Betreffzeilen. */
  shortTitle: string;
  /** Interne Referenz der Anzeige, z. B. „SHK-WP-2026-01“ (fehlt bei Initiativbewerbungen). */
  referenceCode?: string;
  questionSet: QuestionSet;
  /** Status im Registry; fehlt bei Initiativbewerbungen. */
  status?: JobStatus;
}

/** Warum eine Bewerbung als Spamverdacht markiert ist: Honeypot gefüllt bzw. unter 3 Sekunden ausgefüllt. */
export type SpamSignal = 'honeypot' | 'fast';

export interface NormalizedApplication {
  idempotencyKey: string;
  submittedAt: Date;
  job: ApplicationJobInfo;
  answers: ApplicationAnswers;
  name: string;
  firstName: string;
  phone: NormalizedPhone;
  /** Klein geschrieben; fehlt, wenn keine E-Mail angegeben wurde. */
  email?: string;
  contactChannel: ContactChannel;
  /** Nur mit Inhalt; leere Mappen fallen weg. */
  mappe?: Mappe;
  attribution: Attribution;
  channel: AcquisitionChannel;
  privacyNoticeVersion: string;
  /**
   * Spamverdacht (Honeypot gefüllt oder in weniger als 3 Sekunden ausgefüllt): wird zugestellt,
   * aber markiert, und es geht keine Eingangsbestätigung an die angegebene Adresse.
   */
  suspectedSpam: boolean;
  spamSignals: SpamSignal[];
  /** Ausfülldauer laut Client (ms, erste Eingabe bis Absenden), falls plausibel. */
  fillDurationMs?: number;
}

/** Bewerbung mit vergebener Bewerbungsnummer (für Vorlagen und Sinks). */
export interface ReferencedApplication extends NormalizedApplication {
  reference: string;
}

export interface NormalizedFollowUp {
  reference: string;
  /** Hash über Nummer und Inhalt: gleiche Ergänzung → gleiche Mail, nur einmal versendet. */
  idempotencyKey: string;
  receivedAt: Date;
  startDate?: string;
  postalCode?: string;
  message?: string;
  mappe?: Mappe;
}
