/**
 * Auswahlmöglichkeiten der Bewerbungsmappe (ROADMAP §6). Übernommen aus dem bisherigen
 * Profilfragebogen (components/views/QuizView.tsx: skillOptions, styleOptions); die
 * Formulierungen beschreiben den Bewerber, nicht den Betrieb, und sind deshalb keine Fakten.
 * Client-sicher: keine Imports.
 */

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
  coverLetter: 6000,
  skills: 12,
  skill: 120,
  workStyle: 300,
  careerStations: 12,
  educationStations: 8,
  tasksPerStation: 8,
  task: 200,
  period: 60,
  role: 120,
  company: 120,
  degree: 160,
  institution: 160,
  location: 120,
  // nur lokal (Vorschau und Druck)
  name: 100,
  phone: 40,
  email: 254,
});
