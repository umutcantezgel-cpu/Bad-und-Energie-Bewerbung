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
 * Läuft ohne Datenbank (liest die Migration), damit er in jeder CI greift.
 */

const MIGRATIONS = path.resolve(__dirname, '../../../supabase/migrations');
const atsCore = readFileSync(
  path.join(MIGRATIONS, readdirSync(MIGRATIONS).find((file) => file.endsWith('_ats_core.sql')) ?? ''),
  'utf8',
);

function checkValues(column: string): string[] {
  const match = atsCore.match(new RegExp(`${column} text not null check \\(${column} in \\(([^)]*)\\)\\)`));
  if (!match) throw new Error(`CHECK für ${column} nicht gefunden`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((value) => value[1]).sort();
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

  it('Bewerbungsnummer nutzt dasselbe Alphabet wie REFERENCE_PATTERN', () => {
    const match = atsCore.match(/reference ~ '\^BE-\[0-9\]\{2\}-\[([^\]]+)\]\{4,6\}\$'/);
    expect(match?.[1]).toBe(REFERENCE_ALPHABET);
  });
});
