/**
 * Stellen-IDs ohne weitere Importe, damit der Bewerbungsvertrag (lib/applications/schema.ts)
 * im Browser nicht die Fakten- und Teamdaten aus lib/jobs/schema.ts mitlädt.
 * Neue Stelle: ID hier ergänzen, Datei in lib/jobs/data/ anlegen, in registry.ts eintragen.
 */
export const JOB_IDS = [
  'anlagenmechaniker-shk',
  'kundendiensttechniker-shk',
  'obermonteur-projektleiter-shk',
  'ausbildung-anlagenmechaniker-shk',
  'quereinsteiger-montagehelfer',
] as const;
export type JobId = (typeof JOB_IDS)[number];
