import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { APPLICATION_JOB_IDS, CONTACT_CHANNELS } from '@/lib/applications/constants';
import { REFERENCE_ALPHABET } from '@/lib/applications/reference';
import { ACQUISITION_CHANNELS } from '@/lib/attribution/channel';
import { QuestionSetSchema } from '@/lib/jobs/schema';

/**
 * Vertrag TS ↔ Datenbank: Die CHECK-Constraints in public.applications spiegeln die Wertelisten
 * aus dem Bewerbungsvertrag. Eine neue Stelle oder ein neuer Kanal nur in TS würde jede
 * Bewerbung darauf in rpc_submit_application mit validation_failed scheitern lassen.
 * Läuft ohne Datenbank (liest die Migrationen), damit er in jeder CI greift. Spätere Migrationen ersetzen eine
 * Liste mit `drop constraint` und `add constraint applications_<spalte>_check` (z. B. …_neue_stellen.sql); es gilt
 * die jüngste Liste je Spalte, und sie darf nur ergänzen (kein Wert fällt weg).
 */

const MIGRATIONS = path.resolve(__dirname, '../../../supabase/migrations');
const files = readdirSync(MIGRATIONS)
  .filter((file) => file.endsWith('.sql'))
  .sort();
const sql = (file: string) => readFileSync(path.join(MIGRATIONS, file), 'utf8');
const atsCore = sql(files.find((file) => file.endsWith('_ats_core.sql')) ?? '');

/** Alle Listen einer Spalte in Migrationsreihenfolge: die Spaltendefinition und jede spätere `add constraint`. */
function checkLists(column: string): string[][] {
  const patterns = [
    new RegExp(`${column} text not null check \\(${column} in \\(([^)]*)\\)\\)`, 'g'),
    new RegExp(`add constraint applications_${column}_check\\s+check \\(${column} in \\(([^)]*)\\)\\)`, 'g'),
  ];
  return files.flatMap((file) => {
    const text = sql(file);
    return patterns
      .flatMap((pattern) => [...text.matchAll(pattern)])
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((match) => [...match[1].matchAll(/'([^']+)'/g)].map((value) => value[1]).sort());
  });
}

function checkValues(column: string): string[] {
  const lists = checkLists(column);
  if (lists.length === 0) throw new Error(`CHECK für ${column} nicht gefunden`);
  return lists[lists.length - 1];
}

const sorted = (values: readonly string[]) => [...values].sort();

describe('Wertelisten in public.applications', () => {
  it('job_id entspricht APPLICATION_JOB_IDS', () => {
    expect(checkValues('job_id')).toEqual(sorted(APPLICATION_JOB_IDS));
  });

  it('contact_channel entspricht CONTACT_CHANNELS', () => {
    expect(checkValues('contact_channel')).toEqual(sorted(CONTACT_CHANNELS));
  });

  it('acquisition_channel entspricht ACQUISITION_CHANNELS', () => {
    expect(checkValues('acquisition_channel')).toEqual(sorted(ACQUISITION_CHANNELS));
  });

  it('question_set entspricht QuestionSetSchema', () => {
    expect(checkValues('question_set')).toEqual(sorted(QuestionSetSchema.options));
  });

  it('spätere Migrationen ergänzen die Listen nur (E-012: kein Wert fällt weg)', () => {
    for (const column of ['job_id', 'question_set', 'contact_channel', 'acquisition_channel']) {
      const lists = checkLists(column);
      lists.slice(1).forEach((list, i) => {
        for (const value of lists[i]) expect(list, `${column}: ${value} fehlt in einer späteren Migration`).toContain(value);
      });
    }
  });

  it('jede ersetzte Liste wird unter demselben Namen gelöscht und neu angelegt', () => {
    for (const file of files) {
      const text = sql(file);
      const dropped = [...text.matchAll(/drop constraint (applications_\w+_check)/g)].map((m) => m[1]);
      const added = [...text.matchAll(/add constraint (applications_\w+_check)/g)].map((m) => m[1]);
      expect(added, file).toEqual(dropped);
    }
    expect(checkLists('job_id').length).toBeGreaterThan(1);
  });

  it('Bewerbungsnummer nutzt dasselbe Alphabet wie REFERENCE_PATTERN', () => {
    const match = atsCore.match(/reference ~ '\^BE-\[0-9\]\{2\}-\[([^\]]+)\]\{4,6\}\$'/);
    expect(match?.[1]).toBe(REFERENCE_ALPHABET);
  });
});
