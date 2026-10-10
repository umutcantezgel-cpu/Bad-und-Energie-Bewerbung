import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { applicationContentHash } from '@/lib/applications/fingerprint';
import { normalizeApplication, normalizeFollowUp } from '@/lib/applications/normalize';
import { applicationFollowUpSchema, applicationInputSchema } from '@/lib/applications/schema';
import type { ReferencedApplication } from '@/lib/applications/types';
import { ATTRIBUTION_COLUMNS, toFollowUpPayload, toSubmitApplicationPayload } from '@/lib/supabase/payload';

/**
 * Vertrag TS ↔ Intake-RPC: rpc_submit_application und rpc_submit_follow_up lehnen jeden
 * unbekannten Schlüssel ab. Die erlaubten Schlüssel stehen in der Migration; der Test liest sie
 * dort, damit eine Änderung auf einer Seite sofort auffällt (ohne Datenbank, in jeder CI).
 */

const MIGRATIONS = path.resolve(__dirname, '../../../supabase/migrations');
const intakeSql = readFileSync(
  path.join(MIGRATIONS, readdirSync(MIGRATIONS).find((file) => file.endsWith('_intake_rpc.sql')) ?? ''),
  'utf8',
);
const [submitSql, followUpSql] = intakeSql.split('create function public.rpc_submit_follow_up');

/** Erlaubte Schlüssel je Quelle, z. B. `payload` oder `payload -> 'job'`. */
function allowedKeys(sql: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const match of sql.matchAll(/jsonb_object_keys\(([\s\S]*?)\) k\s+where k <> all \(array\[([\s\S]*?)\]\)/g)) {
    const source = match[1].replace(/\s+/g, ' ').trim();
    result.set(source, [...match[2].matchAll(/'([^']+)'/g)].map((value) => value[1]));
  }
  return result;
}

const submitKeys = allowedKeys(submitSql);
const followUpKeys = allowedKeys(followUpSql);

function application(overrides: Record<string, unknown> = {}): ReferencedApplication {
  const app = normalizeApplication(
    applicationInputSchema.parse({
      jobId: 'anlagenmechaniker-shk',
      answers: { qualification: 'geselle-2-5', start: 'sofort' },
      name: 'Erika Beispiel',
      phone: '0151 23456789',
      email: 'erika@example.org',
      contactChannel: 'email',
      attribution: { utmSource: 'indeed', utmMedium: 'jobboard', referrerHost: 'de.indeed.com', landingPath: '/jobs/x' },
      privacyNoticeVersion: '2026-10',
      idempotencyKey: '7f9c1b9e-3c0f-4d5e-9a51-1c2b3d4e5f60',
      fillDurationMs: 42_000,
      mappe: { coverLetter: 'Hallo', skills: ['Löten'], careerStations: [], educationStations: [] },
      ...overrides,
    }),
    { now: new Date('2026-10-10T12:00:00Z') },
  );
  return { ...app, reference: 'BE-26-K7M4QX' };
}

describe('toSubmitApplicationPayload', () => {
  it('maps a full application to the snake_case payload of rpc_submit_application', () => {
    const app = application();
    const hash = applicationContentHash(app);
    expect(toSubmitApplicationPayload(app, hash)).toEqual({
      reference: 'BE-26-K7M4QX',
      idempotency_key: '7f9c1b9e-3c0f-4d5e-9a51-1c2b3d4e5f60',
      content_hash: hash,
      submitted_at: '2026-10-10T12:00:00.000Z',
      job: {
        id: 'anlagenmechaniker-shk',
        title: app.job.title,
        reference_code: app.job.referenceCode,
        question_set: 'fachkraft',
      },
      answers: { qualification: 'geselle-2-5', start: 'sofort' },
      mappe: app.mappe,
      name: 'Erika Beispiel',
      phone: { raw: '0151 23456789', e164: '+4915123456789' },
      email: 'erika@example.org',
      contact_channel: 'email',
      acquisition_channel: app.channel,
      attribution: { utm_source: 'indeed', utm_medium: 'jobboard', referrer_host: 'de.indeed.com', landing_path: '/jobs/x' },
      privacy_notice_version: '2026-10',
      suspected_spam: false,
      spam_signals: [],
      fill_duration_ms: 42_000,
    });
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });

  it('omits optional fields instead of sending undefined or empty values', () => {
    const app = application({ jobId: 'initiativ', answers: {}, email: undefined, contactChannel: 'whatsapp', mappe: undefined, attribution: {}, fillDurationMs: undefined, phone: '+999 123' });
    const payload = toSubmitApplicationPayload(app, applicationContentHash(app));
    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('fill_duration_ms');
    expect(payload.job).not.toHaveProperty('reference_code');
    expect(payload.phone).toEqual({ raw: '+999 123' });
    expect(payload.mappe).toBeNull();
    expect(payload.attribution).toEqual({});
  });

  it('only uses keys the RPC accepts (read from the migration)', () => {
    const app = application();
    const payload = toSubmitApplicationPayload(app, applicationContentHash(app));
    expect(submitKeys.get('payload')).toEqual(expect.arrayContaining(Object.keys(payload)));
    expect(submitKeys.get("payload -> 'job'")).toEqual(expect.arrayContaining(Object.keys(payload.job)));
    expect(submitKeys.get("payload -> 'phone'")).toEqual(expect.arrayContaining(Object.keys(payload.phone)));
    expect(submitKeys.get("coalesce(payload -> 'attribution', '{}'::jsonb)")).toEqual(
      expect.arrayContaining(Object.values(ATTRIBUTION_COLUMNS)),
    );
  });

  it('never leaks TS-only fields into the payload', () => {
    const app = application();
    const json = JSON.stringify(toSubmitApplicationPayload(app, applicationContentHash(app)));
    for (const field of ['firstName', 'shortTitle', '"status"', 'display', '"valid"', '"country"', 'idempotencyKey', 'utmSource']) {
      expect(json).not.toContain(field);
    }
  });
});

describe('toFollowUpPayload', () => {
  it('maps a follow-up to rpc_submit_follow_up with only accepted keys', () => {
    const now = new Date('2026-10-10T13:00:00Z');
    const followUp = normalizeFollowUp(
      applicationFollowUpSchema.parse({ reference: 'BE-26-K7M4QX', token: 't', startDate: '01.12.2026', postalCode: '35578', message: 'Hallo' }),
      'BE-26-K7M4QX',
      now,
    );
    expect(followUp).not.toBeNull();
    const payload = toFollowUpPayload(followUp!);
    expect(payload).toEqual({
      reference: 'BE-26-K7M4QX',
      idempotency_key: followUp!.idempotencyKey,
      received_at: '2026-10-10T13:00:00.000Z',
      start_date: '01.12.2026',
      postal_code: '35578',
      message: 'Hallo',
    });
    expect(followUpKeys.get('payload')).toEqual(expect.arrayContaining(Object.keys(payload)));
  });
});
