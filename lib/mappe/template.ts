import type { JobCategory } from '@/lib/jobs/schema';
import type { MappeRecipient } from './types';

/**
 * Anschreiben-Vorlage. Wortlaut aus der bisherigen Arbeitsstil-Logik
 * (components/views/QuizView.tsx@393df01, handleStyleChange); geändert wurde nur, was dort
 * falsch oder erfunden war: kein Platzhaltername, keine leeren Aufzählungen,
 * passende Formulierung für Ausbildung und Initiativbewerbung.
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

const GENDER_SUFFIX = /\s*\(m\/w\/d\)\s*$/;

/** Titel für den Fließtext: ohne „(m/w/d)“. */
export function roleForText(title: string): string {
  return title.replace(GENDER_SUFFIX, '').trim();
}

/** Betreffzeile des Anschreibens und Zeile unter dem Namen im Lebenslauf. */
export function buildSubject(job: LetterJob | null, initiative = false): string {
  if (initiative) return 'Initiativbewerbung';
  if (!job) return 'Bewerbung';
  return job.category === 'ausbildung' ? `Bewerbung um die ${job.title}` : `Bewerbung als ${job.title}`;
}

function intent(job: LetterJob | null, initiative: boolean): string {
  if (initiative) return 'bewerbe ich mich initiativ';
  if (!job) return 'bewerbe ich mich';
  const role = roleForText(job.title);
  return job.category === 'ausbildung' ? `bewerbe ich mich um die ${role}` : `bewerbe ich mich als ${role}`;
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

export function buildCoverLetter(input: CoverLetterInput): string {
  const { job, initiative = false, recipient } = input;
  const skills = clean(input.skills);
  const workStyle = input.workStyle?.trim();
  const name = input.fullName?.trim();
  const isApprenticeship = !initiative && job?.category === 'ausbildung';
  const isOffice = !initiative && job?.category === 'buero';

  const profile = [
    workStyle ? `${isOffice ? 'Mein Arbeitsstil' : 'Mein handwerklicher Arbeitsstil'}: ${sentence(workStyle)}` : null,
    skills.length > 0 ? `${isOffice ? 'Meine Schwerpunkte im Büro' : 'Meine praktischen Fachschwerpunkte'}: ${sentence(skills.join(', '))}` : null,
  ].filter((line): line is string => line !== null);

  const values = isOffice
    ? BUERO_WERTE
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
