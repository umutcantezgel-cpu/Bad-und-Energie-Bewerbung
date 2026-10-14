/**
 * Stellen-IDs ohne weitere Importe, damit der Bewerbungsvertrag (lib/applications/schema.ts)
 * im Browser nicht die Fakten- und Teamdaten aus lib/jobs/schema.ts mitlädt.
 * Neue Stelle: ID hier ergänzen, Datei in lib/jobs/data/ anlegen, in registry.ts eintragen und die CHECK-Liste
 * `job_id` per neuer Migration erweitern (supabase/migrations, Test lib/supabase/__tests__/db-contract.test.ts).
 */
export const JOB_IDS = [
  'anlagenmechaniker-shk',
  'kundendiensttechniker-shk',
  'obermonteur-projektleiter-shk',
  'ausbildung-anlagenmechaniker-shk',
  'ausbildung-anlagenmechaniker-shk-2027',
  'quereinsteiger-montagehelfer',
  'buerofachkraft',
  'schuelerpraktikum-shk',
] as const;
export type JobId = (typeof JOB_IDS)[number];
