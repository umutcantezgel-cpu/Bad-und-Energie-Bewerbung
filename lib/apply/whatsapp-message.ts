import type { ApplicationAnswers, ContactChannel } from '@/lib/applications/schema';
import { describeAnswers, type QuestionSetId } from './questions';

/**
 * Vorausgefüllte WhatsApp-Texte des Flows (ROADMAP §6): die Abkürzung „Lieber direkt per WhatsApp?“
 * auf jedem Schritt und die komplette Bewerbung als Rückfallweg, wenn das Absenden scheitert.
 * Leere Angaben fallen weg; es steht nie „undefined“ oder „null“ im Text.
 */

/** Anrede wie im bisherigen WhatsApp-Text (lib/utils/whatsapp-utils.ts). */
export const WHATSAPP_GREETING = 'Guten Tag Herr Demir,';

export const CONTACT_CHANNEL_LABEL: Readonly<Record<ContactChannel, string>> = Object.freeze({
  whatsapp: 'WhatsApp',
  phone: 'Anruf',
  email: 'E-Mail',
});

export interface WhatsAppMessageInput {
  /** Anzeigename der gewählten Stelle, z. B. „Anlagenmechaniker SHK“ oder „Initiativbewerbung“. */
  jobLabel?: string | null;
  questionSet?: QuestionSetId | null;
  answers?: ApplicationAnswers | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  contactChannel?: ContactChannel | null;
  /** Bewerbungsnummer, falls schon vergeben (Danke-Seite). */
  reference?: string | null;
}

function clean(value: string | null | undefined): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function line(label: string, value: string | null | undefined): string | null {
  const text = clean(value);
  return text ? `${label}: ${text}` : null;
}

function answerLines(input: WhatsAppMessageInput): string[] {
  if (!input.answers) return [];
  return describeAnswers(input.questionSet ?? 'fachkraft', input.answers).map(({ label, value }) => `${label}: ${value}`);
}

function compact(lines: (string | null)[]): string {
  return lines.filter((entry): entry is string => Boolean(entry)).join('\n');
}

/** Abkürzung auf jedem Schritt: Stelle, bisherige Antworten und (falls getippt) der Name. */
export function buildShortcutMessage(input: WhatsAppMessageInput = {}): string {
  return compact([
    `${WHATSAPP_GREETING} ich möchte mich bei Bad und Energie bewerben.`,
    line('Stelle', input.jobLabel),
    ...answerLines(input),
    line('Name', input.name),
  ]);
}

/** Komplette Bewerbung als Text, wenn das Absenden nicht geklappt hat. */
export function buildApplicationMessage(input: WhatsAppMessageInput): string {
  const channel = input.contactChannel ? CONTACT_CHANNEL_LABEL[input.contactChannel] : null;
  return compact([
    `${WHATSAPP_GREETING} hier ist meine Bewerbung bei Bad und Energie.`,
    line('Stelle', input.jobLabel),
    ...answerLines(input),
    line('Name', input.name),
    line('Telefon', input.phone),
    line('E-Mail', input.email),
    line('Am liebsten per', channel),
  ]);
}

export interface FollowUpMessageInput {
  reference?: string | null;
  /** `documents`: Unterlagen nachreichen. `extras`: Ergänzungen, wenn das Formular nicht durchging. */
  kind?: 'documents' | 'extras';
  startDate?: string | null;
  postalCode?: string | null;
  message?: string | null;
}

/** Danke-Seite: Unterlagen oder Ergänzungen zu einer Bewerbungsnummer schicken. */
export function buildFollowUpMessage(input: FollowUpMessageInput): string {
  const reference = clean(input.reference);
  const subject = input.kind === 'extras' ? 'Ergänzungen' : 'Unterlagen';
  const about = reference ? `zur Bewerbung ${reference}` : 'zu meiner Bewerbung';
  return compact([
    `${WHATSAPP_GREETING} hier sind meine ${subject} ${about}.`,
    line('Frühester Start', input.startDate),
    line('PLZ', input.postalCode),
    clean(input.message) || null,
  ]);
}

export interface MappeShareMessageInput {
  /** Bewerbungsnummer, falls in diesem Tab schon eine Bewerbung abgeschickt wurde (be:application:v1). */
  reference?: string | null;
  /** Gewählte Stelle in der Mappe, z. B. „Anlagenmechaniker SHK (m/w/d)“ oder „Initiativbewerbung“. */
  jobLabel?: string | null;
  /** Name aus der Mappe, falls schon eingetragen. */
  name?: string | null;
}

/** Schlusszeile der geteilten Mappe: WhatsApp nimmt keinen Anhang über den Link, das PDF kommt von Hand dazu. */
export const MAPPE_SHARE_PDF_LINE = 'Die Mappe als PDF hänge ich hier im Chat an.';

/**
 * Mappe per WhatsApp teilen (E-BEW-020): ehrlich benannt, nur mit echten Eingaben (Nummer, Stelle, Name),
 * ohne Standardwerte und ohne Behauptung eines „Dossiers“. Das PDF hängt der Bewerber im Chat selbst an.
 */
export function buildMappeShareMessage(input: MappeShareMessageInput = {}): string {
  const reference = clean(input.reference);
  const about = reference ? `zur Bewerbung ${reference}` : 'für Bad und Energie';
  return compact([
    `${WHATSAPP_GREETING} hier ist meine Bewerbungsmappe (Anschreiben und Lebenslauf) ${about}.`,
    line('Stelle', input.jobLabel),
    line('Name', input.name),
    MAPPE_SHARE_PDF_LINE,
  ]);
}
