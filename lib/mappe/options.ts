/**
 * Auswahlmöglichkeiten der Bewerbungsmappe (ROADMAP §6). Übernommen aus dem bisherigen
 * Profilfragebogen (components/views/QuizView.tsx@393df01: skillOptions, styleOptions); die
 * Formulierungen beschreiben den Bewerber, nicht den Betrieb, und sind deshalb keine Fakten.
 * Client-sicher: importiert nur die zod-freien Grenzen aus lib/applications/constants.ts.
 */
import { CONTACT_LIMITS, MAPPE_SCHEMA_LIMITS as SCHEMA_LIMITS } from '@/lib/applications/constants';

/** Praktische Schwerpunkte zum Antippen (Wortlaut wie im bisherigen Fragebogen). */
export const SKILL_OPTIONS = [
  'Wärmepumpen Luft/Wasser (Buderus, Bosch, NIBE, Alpha Innotec, Viessmann)',
  'Badsanierung und Vorwandinstallation',
  'Gasbrennwert und Heizungsmodernisierung',
  'Trinkwasserhygiene und Filtertechnik CONEL',
  'Störungssuche und elektrische Verdrahtung',
  'Führerschein Klasse B PKW',
] as const;

export const WORK_STYLE_IDS = ['qualitaet', 'technik', 'team'] as const;
export type WorkStyleId = (typeof WORK_STYLE_IDS)[number];

export interface WorkStyle {
  id: WorkStyleId;
  /** Titel der Auswahlkarte. */
  title: string;
  /** Erklärung unter dem Titel. */
  description: string;
  /** Satz, der ins Anschreiben übernommen und als `mappe.workStyle` gesendet wird. */
  value: string;
}

export const WORK_STYLES: readonly WorkStyle[] = Object.freeze([
  {
    id: 'qualitaet',
    title: 'Ausführungsqualität und Sauberkeit',
    description: 'Ich lege Wert auf saubere Trassen, akkurate Isolierung und respektvollen Kundenkontakt.',
    value:
      'Qualitätsorientiert und sauber: Baustellen verlassen wie vorgefunden, exakte Rohrisolierung, zufriedene Kunden.',
  },
  {
    id: 'technik',
    title: 'Technologie und Energiewende',
    description: 'Ich brenne für regenerative Systeme, Hydraulikabgleich und digitale Heizungssteuerungen.',
    value:
      'Technikbegeistert und lösungsorientiert: Selbstständige Inbetriebnahme modernster Wärmepumpen und Digitalsteuerung.',
  },
  {
    id: 'team',
    title: 'Teamgeist und Zuverlässigkeit',
    description: 'Gute Stimmung auf Montage, klare Kommunikation mit dem Meister und verlässliche Absprachen.',
    value:
      'Teamgeist und Verlässlichkeit: Feste Absprachen, kollegiales Miteinander und pünktlicher Feierabend ohne Chaos.',
  },
]);

export function getWorkStyle(id: WorkStyleId | null | undefined): WorkStyle | undefined {
  return id ? WORK_STYLES.find((style) => style.id === id) : undefined;
}

/** Arbeitsstil-Satz aus einer gespeicherten Mappe zurück auf die Auswahl abbilden. */
export function workStyleIdFromValue(value: string | undefined): WorkStyleId | null {
  if (!value) return null;
  return WORK_STYLES.find((style) => style.value === value.trim())?.id ?? null;
}

/**
 * Obergrenzen. Spiegeln mappeSchema (lib/applications/schema.ts); __tests__/serialize.test.ts
 * prüft, dass beide übereinstimmen. Persönliche Angaben gehören nicht zur gesendeten Mappe.
 */
export const MAPPE_LIMITS = Object.freeze({
  coverLetter: SCHEMA_LIMITS.coverLetter,
  skills: SCHEMA_LIMITS.skills,
  skill: SCHEMA_LIMITS.skill,
  workStyle: SCHEMA_LIMITS.workStyle,
  careerStations: SCHEMA_LIMITS.careerStations,
  educationStations: SCHEMA_LIMITS.educationStations,
  tasksPerStation: SCHEMA_LIMITS.tasks,
  task: SCHEMA_LIMITS.task,
  period: SCHEMA_LIMITS.period,
  role: SCHEMA_LIMITS.role,
  company: SCHEMA_LIMITS.company,
  degree: SCHEMA_LIMITS.degree,
  institution: SCHEMA_LIMITS.institution,
  location: SCHEMA_LIMITS.location,
  // nur lokal (Vorschau und Druck)
  name: CONTACT_LIMITS.name,
  phone: CONTACT_LIMITS.phone,
  email: CONTACT_LIMITS.email,
});
