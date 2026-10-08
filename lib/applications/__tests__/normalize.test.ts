import { describe, expect, it } from 'vitest';

import {
  compactMappe,
  firstNameOf,
  normalizeApplication,
  normalizeFollowUp,
  normalizePhone,
  resolveJobInfo,
} from '@/lib/applications/normalize';
import { applicationInputSchema, type ApplicationInput } from '@/lib/applications/schema';

const NOW = new Date('2026-10-08T10:00:00Z');

function input(overrides: Partial<ApplicationInput> = {}): ApplicationInput {
  return applicationInputSchema.parse({
    jobId: 'anlagenmechaniker-shk',
    answers: { qualification: 'geselle-2-5', start: 'sofort' },
    name: '  Max   Mustermann ',
    phone: '0151 23456789',
    privacyNoticeVersion: '2026-10',
    idempotencyKey: '7f9c1b9e-3c0f-4d5e-9a51-1c2b3d4e5f60',
    ...overrides,
  });
}

describe('normalizePhone', () => {
  it.each([
    ['0151 23456789', '+4915123456789', '01512 3456789'],
    ['0151/23456789', '+4915123456789', '01512 3456789'],
    ['0049 151 23456789', '+4915123456789', '01512 3456789'],
    ['+49 151 23456789', '+4915123456789', '01512 3456789'],
    ['(06441) 42956', '+49644142956', '06441 42956'],
    ['+43 664 1234567', '+436641234567', '+43 664 1234567'],
  ])('%s → %s', (raw, e164, display) => {
    const phone = normalizePhone(raw);
    expect(phone.e164).toBe(e164);
    expect(phone.display).toBe(display);
    expect(phone.raw).toBe(raw);
    expect(phone.valid).toBe(true);
  });

  it('keeps the raw input when the number cannot be parsed', () => {
    expect(normalizePhone('123')).toEqual({ raw: '123', display: '123', valid: false });
    expect(normalizePhone('  000 000  ')).toEqual({ raw: '000 000', display: '000 000', valid: false });
    expect(normalizePhone('+999 12345678')).toEqual({ raw: '+999 12345678', display: '+999 12345678', valid: false });
  });
});

describe('resolveJobInfo', () => {
  it('derives title and reference code from the registry', () => {
    expect(resolveJobInfo('kundendiensttechniker-shk')).toMatchObject({
      id: 'kundendiensttechniker-shk',
      title: 'Kundendiensttechniker SHK / Servicemonteur (m/w/d)',
      shortTitle: 'Kundendiensttechniker',
      referenceCode: 'SHK-KD-2026-02',
      questionSet: 'fachkraft',
    });
  });

  it('maps the initiative application', () => {
    expect(resolveJobInfo('initiativ')).toEqual({
      id: 'initiativ',
      title: 'Initiativbewerbung',
      shortTitle: 'Initiativbewerbung',
      questionSet: 'fachkraft',
    });
  });
});

describe('normalizeApplication', () => {
  it('normalizes name, phone, email, job and channel', () => {
    const app = normalizeApplication(
      input({ email: 'Max@Example.ORG', attribution: { utmSource: 'Indeed', utmMedium: 'jobboard' } }),
      { now: NOW },
    );
    expect(app.name).toBe('Max Mustermann');
    expect(app.firstName).toBe('Max');
    expect(app.email).toBe('max@example.org');
    expect(app.phone.e164).toBe('+4915123456789');
    expect(app.job.title).toBe('Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)');
    expect(app.attribution).toEqual({ utmSource: 'indeed', utmMedium: 'jobboard' });
    expect(app.channel).toBe('indeed');
    expect(app.submittedAt).toBe(NOW);
    expect(app.suspectedSpam).toBe(false);
    expect(app).not.toHaveProperty('mappe');
  });

  it('flags forms filled in under 3 seconds (client-measured duration) as suspected spam', () => {
    expect(normalizeApplication(input({ fillDurationMs: 1500 }), { now: NOW })).toMatchObject({
      suspectedSpam: true,
      spamSignals: ['fast'],
      fillDurationMs: 1500,
    });
    expect(normalizeApplication(input({ fillDurationMs: 45_000 }), { now: NOW })).toMatchObject({
      suspectedSpam: false,
      spamSignals: [],
      fillDurationMs: 45_000,
    });
  });

  it('does not flag without a duration and drops invalid durations instead of rejecting', () => {
    const none = normalizeApplication(input(), { now: NOW });
    expect(none.suspectedSpam).toBe(false);
    expect(none).not.toHaveProperty('fillDurationMs');

    const parsed = applicationInputSchema.parse({ ...input(), fillDurationMs: -5 });
    expect(parsed.fillDurationMs).toBeUndefined();
    expect(applicationInputSchema.parse({ ...input(), fillDurationMs: 'schnell' }).fillDurationMs).toBeUndefined();
    expect(normalizeApplication(input({ fillDurationMs: 2999.6 })).fillDurationMs).toBe(3000);
  });

  it('marks a filled honeypot as suspected spam instead of dropping the application', () => {
    const app = normalizeApplication(input({ contactTimeHint: 'https://spam.example', fillDurationMs: 60_000 }), { now: NOW });
    expect(app).toMatchObject({ suspectedSpam: true, spamSignals: ['honeypot'] });
    expect(normalizeApplication(input({ contactTimeHint: '   ' })).suspectedSpam).toBe(false);
    // Kein String (Bot): als Treffer gewertet, nicht abgelehnt.
    expect(normalizeApplication(applicationInputSchema.parse({ ...input(), contactTimeHint: 42 })).spamSignals).toEqual(['honeypot']);
  });

  it("keeps only answers of the job's question set", () => {
    const app = normalizeApplication(
      input({ answers: { qualification: 'geselle-2-5', start: 'sofort', schoolStatus: 'schule-laeuft', licenseB: 'yes' } }),
    );
    expect(app.answers).toEqual({ qualification: 'geselle-2-5', start: 'sofort' });
  });

  it('drops an empty email and an empty Mappe', () => {
    const app = normalizeApplication(input({ email: '', mappe: { coverLetter: ' ', skills: [''], careerStations: [], educationStations: [] } }));
    expect(app).not.toHaveProperty('email');
    expect(app).not.toHaveProperty('mappe');
  });

  it('strips control characters and line breaks from the name', () => {
    expect(normalizeApplication(input({ name: 'Max\nBcc: x\u0000y' })).name).toBe('Max Bcc: x y');
  });
});

describe('compactMappe', () => {
  it('keeps content and removes empty entries', () => {
    expect(
      compactMappe({
        coverLetter: 'Hallo',
        skills: ['Löten', ' '],
        careerStations: [
          { period: '', role: '', company: '', tasks: [] },
          { period: '2020', role: 'Geselle', company: 'X', tasks: ['A', ''] },
        ],
        educationStations: [{ period: '', degree: '', institution: '' }],
      }),
    ).toEqual({
      coverLetter: 'Hallo',
      skills: ['Löten'],
      careerStations: [{ period: '2020', role: 'Geselle', company: 'X', tasks: ['A'] }],
      educationStations: [],
    });
  });
});

describe('normalizeFollowUp', () => {
  it('returns null without content', () => {
    expect(normalizeFollowUp({ reference: 'BE-26-K7M4QX', token: 't', message: '  ' }, 'BE-26-K7M4QX')).toBeNull();
  });

  it('hashes the content into a stable idempotency key', () => {
    const a = normalizeFollowUp({ reference: 'x', token: 'a', postalCode: '35578' }, 'BE-26-K7M4QX', NOW);
    const b = normalizeFollowUp({ reference: 'x', token: 'b', postalCode: '35578' }, 'BE-26-K7M4QX', new Date());
    const c = normalizeFollowUp({ reference: 'x', token: 'a', postalCode: '35579' }, 'BE-26-K7M4QX', NOW);
    expect(a?.idempotencyKey).toMatch(/^[0-9a-f]{32}$/);
    expect(a?.idempotencyKey).toBe(b?.idempotencyKey);
    expect(c?.idempotencyKey).not.toBe(a?.idempotencyKey);
  });
});

describe('firstNameOf', () => {
  it('returns the first word', () => {
    expect(firstNameOf('  Anna-Lena  Schmidt ')).toBe('Anna-Lena');
  });
});
