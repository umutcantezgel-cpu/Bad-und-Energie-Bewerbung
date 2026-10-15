import type { JobCategory } from '@/lib/jobs/schema';
import { BUERO_SKILL_BRIEF } from './options';
import type { MappeRecipient } from './types';

/**
 * Anschreiben-Vorlage. Wortlaut aus der bisherigen Arbeitsstil-Logik
 * (components/views/QuizView.tsx@393df01, handleStyleChange); geändert wurde nur, was dort
 * falsch oder erfunden war: kein Platzhaltername, keine leeren Aufzählungen,
 * passende Formulierung für Ausbildung, Praktikum, Büro und Initiativbewerbung.
 */

export interface LetterJob {
  title: string;
  category: JobCategory;
}

export interface CoverLetterInput {
  /** Gewählte Stelle; `null` ohne Auswahl oder bei Initiativbewerbung. */
  job: LetterJob | null;
  initiative?: boolean;
  skills: readonly string[];
  /** Arbeitsstil-Satz (WORK_STYLES[].value). */
  workStyle?: string;
  fullName?: string;
  recipient: Pick<MappeRecipient, 'salutation' | 'companyName' | 'city'>;
}

/** „(m/w/d)“ an jeder Stelle des Titels (Büro: „Bürofachkraft (m/w/d) in Voll- oder Teilzeit“, Prüfung E-031 D1-2). */
const GENDER_ZUSATZ = /\s*\(m\/w\/d\)/g;

/** Titel für den Fließtext: ohne „(m/w/d)“, wo es auch steht. */
export function roleForText(title: string): string {
  return title.replace(GENDER_ZUSATZ, '').replace(/\s+/g, ' ').trim();
}

/** Betreffzeile des Anschreibens und Zeile unter dem Namen im Lebenslauf. */
export function buildSubject(job: LetterJob | null, initiative = false): string {
  if (initiative) return 'Initiativbewerbung';
  if (!job) return 'Bewerbung';
  return `Bewerbung ${anliegen(job.category)} ${job.title}`;
}

/** Ausbildung und Praktikum sind keine Rolle: „um die Ausbildung …“, „um ein Schülerpraktikum …“, sonst „als …“. */
function anliegen(category: JobCategory): string {
  if (category === 'ausbildung') return 'um die';
  if (category === 'praktikum') return 'um ein';
  return 'als';
}

function intent(job: LetterJob | null, initiative: boolean): string {
  if (initiative) return 'bewerbe ich mich initiativ';
  if (!job) return 'bewerbe ich mich';
  return `bewerbe ich mich ${anliegen(job.category)} ${roleForText(job.title)}`;
}

function clean(values: readonly string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

/** Satzende ohne doppelten Punkt. */
function sentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/**
 * Büro (E-031, Wahrheitsfehler S5): kein Handwerker, keine Baustelle, kein Werkzeug und keine flexiblen Arbeitszeiten –
 * die sind fürs Büro offen (Fakt flexibleHours, offenFuer). Der Wunsch nennt nur, was der Betrieb belegt: direkter
 * Draht zur Geschäftsführung (Fakt directLine), Meisterbetrieb (Fakt founded1926).
 */
const BUERO_WERTE = 'Ich schätze einen verlässlichen Meisterbetrieb mit direkter Kommunikation und kurzen Wegen.';

/**
 * Schülerpraktikum (Prüfung E-031, D1-3): kein „Handwerker aus der Region“, kein Werkzeug und keine flexiblen
 * Arbeitszeiten – die sind fürs Praktikum offen (Fakt flexibleHours, offenFuer; die Zeiten legen Schule und JArbSchG
 * fest). Der Wunsch nennt nur den Meisterbetrieb (founded1926) und den direkten Draht (directLine).
 */
const PRAKTIKUM_WERTE = 'Für mein Praktikum wünsche ich mir einen verlässlichen Meisterbetrieb mit direkter Kommunikation.';

/** Büro-Schwerpunkte im Brief: die Kurzform je Aufgabe (eigene Einträge bleiben, wie sie getippt wurden). */
function bueroSchwerpunkte(skills: readonly string[]): string {
  return skills.map((skill) => BUERO_SKILL_BRIEF[skill] ?? skill).join('; ');
}

export function buildCoverLetter(input: CoverLetterInput): string {
  const { job, initiative = false, recipient } = input;
  const skills = clean(input.skills);
  const workStyle = input.workStyle?.trim();
  const name = input.fullName?.trim();
  const isApprenticeship = !initiative && job?.category === 'ausbildung';
  const isOffice = !initiative && job?.category === 'buero';
  const isInternship = !initiative && job?.category === 'praktikum';

  const profile = [
    workStyle ? `${isOffice ? 'Mein Arbeitsstil' : 'Mein handwerklicher Arbeitsstil'}: ${sentence(workStyle)}` : null,
    skills.length > 0
      ? isOffice
        ? `Meine Schwerpunkte im Büro: ${sentence(bueroSchwerpunkte(skills))}`
        : `Meine praktischen Fachschwerpunkte: ${sentence(skills.join(', '))}`
      : null,
  ].filter((line): line is string => line !== null);

  const values = isOffice
    ? BUERO_WERTE
    : isInternship
      ? PRAKTIKUM_WERTE
      : isApprenticeship
        ? 'Für meine Ausbildung wünsche ich mir einen verlässlichen Meisterbetrieb mit direkter Kommunikation, modernem Equipment und flexiblen Arbeitszeiten.'
        : 'Als Handwerker aus der Region schätze ich einen verlässlichen Meisterbetrieb mit direkter Kommunikation, modernem Equipment und flexiblen Arbeitszeiten.';

  const paragraphs = [
    recipient.salutation,
    `mit großem Interesse ${intent(job, initiative)} bei der ${recipient.companyName} in ${recipient.city}.`,
    profile.length > 0 ? profile.join('\n') : null,
    `${values} Über ein vertrauliches Kennenlernen in ${recipient.city} freue ich mich.`,
    name ? `Mit freundlichen Grüßen\n${name}` : 'Mit freundlichen Grüßen',
  ].filter((paragraph): paragraph is string => paragraph !== null);

  return paragraphs.join('\n\n');
}
