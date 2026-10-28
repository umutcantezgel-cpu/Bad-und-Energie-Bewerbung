/**
 * Auswahlmöglichkeiten der Bewerbungsmappe (ROADMAP §6). Übernommen aus dem bisherigen
 * Profilfragebogen (components/views/QuizView.tsx@393df01: skillOptions, styleOptions); die
 * Formulierungen beschreiben den Bewerber, nicht den Betrieb, und sind deshalb keine Fakten.
 * Client-sicher: importiert nur die zod-freien Grenzen aus lib/applications/constants.ts.
 */
import { CONTACT_LIMITS, MAPPE_SCHEMA_LIMITS as SCHEMA_LIMITS } from '@/lib/applications/constants';
import type { JobCategory } from '@/lib/jobs/schema';

/** Praktische Schwerpunkte zum Antippen (Wortlaut wie im bisherigen Fragebogen). */
export const SKILL_OPTIONS = [
  'Wärmepumpen Luft/Wasser (Buderus, Bosch, NIBE, Alpha Innotec, Viessmann)',
  'Badsanierung und Vorwandinstallation',
  'Gasbrennwert und Heizungsmodernisierung',
  'Trinkwasserhygiene und Filtertechnik CONEL',
  'Störungssuche und elektrische Verdrahtung',
  'Führerschein Klasse B PKW',
] as const;

/**
 * Büro (E-031, Wahrheitsfehler S5): Schwerpunkte der Bürofachkraft sind ihre vier Aufgaben im Wortlaut der
 * Stellenanzeige (lib/jobs/data/buerofachkraft.ts; Test hält beide gleich), keine Baustellen-Kenntnisse.
 */
export const BUERO_SKILL_OPTIONS = [
  'Telefon und Terminplanung für Monteure und Kundendienst',
  'Angebote, Auftragsbestätigungen und Rechnungen schreiben',
  'Material beim Großhandel bestellen und Lieferungen prüfen',
  'Allgemeine Verwaltung: Ablage, Post, Zuarbeit für die Geschäftsführung',
] as const;

/**
 * Dieselben vier Aufgaben als Kurzform für den Fließtext des Anschreibens (Prüfung E-031, D1-4): Der Wortlaut der
 * Anzeige enthält selbst Kommas und einen Doppelpunkt; im Brief stehen die Kurzformen mit Semikolon getrennt. Die
 * Chips behalten den Wortlaut der Anzeige.
 */
export const BUERO_SKILL_BRIEF: Readonly<Record<string, string>> = Object.freeze({
  [BUERO_SKILL_OPTIONS[0]]: 'Telefon und Terminplanung für Monteure und Kundendienst',
  [BUERO_SKILL_OPTIONS[1]]: 'Angebote, Auftragsbestätigungen und Rechnungen',
  [BUERO_SKILL_OPTIONS[2]]: 'Materialbestellung beim Großhandel und Prüfung der Lieferungen',
  [BUERO_SKILL_OPTIONS[3]]: 'allgemeine Verwaltung (Ablage, Post, Zuarbeit für die Geschäftsführung)',
});

/** Schwerpunkte zum Antippen je Stellenart: das Büro mit seinen Aufgaben, sonst die Praxis der Baustelle. */
export function skillOptionen(category: JobCategory | null | undefined): readonly string[] {
  return category === 'buero' ? BUERO_SKILL_OPTIONS : SKILL_OPTIONS;
}

/**
 * Beim Wechsel der Stelle (Prüfung E-031, D1-7): vorgegebene Schwerpunkte der anderen Stellenart fallen weg, damit
 * keine Baustellen-Kenntnis im Büro-Anschreiben steht und keine Büro-Aufgabe unter den Fachschwerpunkten. Selbst
 * eingetragene Schwerpunkte bleiben.
 */
export function skillsFuerStelle(skills: readonly string[], category: JobCategory | null | undefined): string[] {
  const passend = skillOptionen(category);
  const vorgaben = [...SKILL_OPTIONS, ...BUERO_SKILL_OPTIONS] as readonly string[];
  return skills.filter((skill) => passend.includes(skill) || !vorgaben.includes(skill));
}

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
  /** Frühere Wortlaute von `value`: gespeicherte Entwürfe finden so ihre Auswahl wieder. */
  legacyValues?: readonly string[];
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
    // Ohne „pünktlicher Feierabend“: Die Seite verspricht keine festen Endzeiten (fakten-abgleich B28).
    value: 'Teamgeist und Verlässlichkeit: Feste Absprachen, kollegiales Miteinander und Arbeit ohne Chaos.',
    legacyValues: [
      'Teamgeist und Verlässlichkeit: Feste Absprachen, kollegiales Miteinander und pünktlicher Feierabend ohne Chaos.',
    ],
  },
]);

/**
 * Arbeitsstil im Büro (E-031): dieselben drei Plätze, Wortlaut ohne Baustelle, Montage und Werkzeug. Beschreibt die
 * Bewerberin oder den Bewerber, nicht den Betrieb, und ist deshalb keine Tatsachenbehauptung.
 */
export const BUERO_WORK_STYLES: readonly WorkStyle[] = Object.freeze([
  {
    id: 'qualitaet',
    title: 'Sorgfalt und Ordnung',
    description: 'Ich arbeite genau: vollständige Unterlagen, saubere Ablage und Rechnungen ohne Fehler.',
    value: 'Sorgfältig und ordentlich: vollständige Unterlagen, saubere Ablage und genaue Rechnungen.',
  },
  {
    id: 'technik',
    title: 'Organisation und Überblick',
    description: 'Ich behalte Termine, Bestellungen und Lieferungen im Blick, auch wenn vieles gleichzeitig kommt.',
    value: 'Organisiert und mit Überblick: Termine, Bestellungen und Lieferungen behalte ich im Blick.',
  },
  {
    id: 'team',
    title: 'Freundlich und verbindlich',
    description: 'Am Telefon freundlich, mit klaren Absprachen mit Kunden, Monteuren und Geschäftsführung.',
    value: 'Freundlich und verbindlich: klare Absprachen mit Kunden, Monteuren und der Geschäftsführung.',
  },
]);

/** Arbeitsstile je Stellenart: das Büro mit eigenem Wortlaut, sonst der der Baustelle. */
export function workStylesFuer(category: JobCategory | null | undefined): readonly WorkStyle[] {
  return category === 'buero' ? BUERO_WORK_STYLES : WORK_STYLES;
}

export function getWorkStyle(id: WorkStyleId | null | undefined, category?: JobCategory | null): WorkStyle | undefined {
  return id ? workStylesFuer(category).find((style) => style.id === id) : undefined;
}

/** Arbeitsstil-Satz aus einer gespeicherten Mappe zurück auf die Auswahl abbilden (Baustelle und Büro). */
export function workStyleIdFromValue(value: string | undefined): WorkStyleId | null {
  if (!value) return null;
  const text = value.trim();
  return [...WORK_STYLES, ...BUERO_WORK_STYLES].find((style) => style.value === text || style.legacyValues?.includes(text))?.id ?? null;
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
  subject: SCHEMA_LIMITS.subject,
  profile: SCHEMA_LIMITS.profile,
  languages: SCHEMA_LIMITS.languages,
  language: SCHEMA_LIMITS.language,
  languageLevel: SCHEMA_LIMITS.languageLevel,
  drivingLicenses: SCHEMA_LIMITS.drivingLicenses,
  interests: SCHEMA_LIMITS.interests,
  customText: SCHEMA_LIMITS.customText,
  sectionTitle: SCHEMA_LIMITS.sectionTitle,
  // nur lokal (Vorschau und Druck)
  name: CONTACT_LIMITS.name,
  phone: CONTACT_LIMITS.phone,
  email: CONTACT_LIMITS.email,
});

/**
 * Führerscheinklassen zum Antippen (L5): die fürs Handwerk (Pkw, Anhänger, 7,5 t, Lkw) und für Azubis AM und A1. Höchstens
 * so viele, wie der Vertrag erlaubt (`drivingLicenses`).
 */
export const FUEHRERSCHEIN_KLASSEN = ['AM', 'A1', 'B', 'BE', 'C1', 'C1E', 'C', 'CE'] as const;
export type FuehrerscheinKlasse = (typeof FUEHRERSCHEIN_KLASSEN)[number];
