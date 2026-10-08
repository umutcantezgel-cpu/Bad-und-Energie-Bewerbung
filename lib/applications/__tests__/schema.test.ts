import { describe, expect, it } from 'vitest';

import { z } from 'zod';

import { getQuestion } from '@/lib/apply/questions';
import * as constants from '../constants';
import { applicationInputSchema, applicationJobIdSchema, CONTACT_MESSAGES, EMAIL_PATTERN, STORAGE_KEYS } from '../schema';

const base = {
  jobId: 'anlagenmechaniker-shk',
  name: 'Max Muster',
  phone: '0170 1234567',
  privacyNoticeVersion: '2026-10',
  idempotencyKey: '7b4c1a52-3f0e-4d8e-9a43-1c2b3d4e5f60',
};

describe('applicationInputSchema', () => {
  it('accepts the minimal application (2 answers + name + phone)', () => {
    const parsed = applicationInputSchema.parse({ ...base, answers: { qualification: 'geselle-2-5', start: 'sofort' } });
    expect(parsed.contactChannel).toBe('whatsapp');
    expect(parsed.attribution).toEqual({});
  });

  it('requires an e-mail address only when e-mail is the contact channel', () => {
    expect(applicationInputSchema.safeParse({ ...base, contactChannel: 'email' }).success).toBe(false);
    expect(applicationInputSchema.safeParse({ ...base, contactChannel: 'email', email: 'max@example.de' }).success).toBe(true);
    expect(applicationInputSchema.safeParse({ ...base, email: '' }).success).toBe(true);
    const padded = applicationInputSchema.safeParse({ ...base, contactChannel: 'email', email: ' max@example.de ' });
    expect(padded.success && padded.data.email).toBe('max@example.de');
    expect(applicationInputSchema.safeParse({ ...base, email: 'kein-at' }).success).toBe(false);
  });

  it('accepts every registry job plus the initiative option', () => {
    expect(applicationJobIdSchema.options).toContain('initiativ');
    expect(applicationJobIdSchema.options).toContain('quereinsteiger-montagehelfer');
    expect(applicationInputSchema.safeParse({ ...base, jobId: 'unbekannt' }).success).toBe(false);
  });

  it('accepts only known privacy notice versions, the current one last', () => {
    expect(constants.PRIVACY_NOTICE_VERSIONS.at(-1)).toBe(constants.PRIVACY_NOTICE_VERSION);
    expect(applicationInputSchema.safeParse({ ...base, privacyNoticeVersion: constants.PRIVACY_NOTICE_VERSION }).success).toBe(true);
    expect(applicationInputSchema.safeParse({ ...base, privacyNoticeVersion: '' }).success).toBe(false);
    expect(applicationInputSchema.safeParse({ ...base, privacyNoticeVersion: '1999-01' }).success).toBe(false);
  });

  it('rejects unknown answer keys and phone numbers without digits', () => {
    expect(applicationInputSchema.safeParse({ ...base, answers: { foo: 'bar' } }).success).toBe(false);
    expect(applicationInputSchema.safeParse({ ...base, phone: 'abc' }).success).toBe(false);
  });

  it('needs at least 6 digits in the phone number, not just 6 allowed characters', () => {
    const phoneError = (phone: string) => {
      const result = applicationInputSchema.safeParse({ ...base, phone });
      return result.success ? null : result.error.issues.find((issue) => issue.path[0] === 'phone')?.message;
    };
    expect(phoneError('------')).toBe(CONTACT_MESSAGES.phone);
    expect(phoneError('(+) / -')).toBe(CONTACT_MESSAGES.phone);
    expect(phoneError('12345')).toBe(CONTACT_MESSAGES.phone);
    expect(phoneError('0151 2345678')).toBeNull();
    expect(phoneError('0151.234.5678')).toBeNull();
    expect(phoneError('+49 (0) 6441 42956')).toBeNull();
  });

  it('accepts only option ids from lib/apply/questions.ts as answers', () => {
    const answers = (value: Record<string, string>) => applicationInputSchema.safeParse({ ...base, answers: value });
    expect(answers({ qualification: 'frei erfundener Text' }).success).toBe(false);
    expect(answers({ start: 'morgen' }).success).toBe(false);
    expect(answers({ background: 'etwas-anderes', licenseB: 'no', start: 'spaeter' }).success).toBe(true);
    for (const key of ['qualification', 'schoolStatus', 'background', 'licenseB', 'start'] as const) {
      for (const option of getQuestion(key)!.options) expect(answers({ [key]: option.id }).success).toBe(true);
    }
    const invalid = answers({ qualification: 'x' });
    expect(invalid.success || invalid.error.issues[0]).toMatchObject({ path: ['answers', 'qualification'], message: 'Diese Angabe ist ungültig.' });
  });

  it('uses the same e-mail pattern as z.email()', () => {
    expect(EMAIL_PATTERN.source).toBe(z.regexes.email.source);
  });

  it('ignores the old honeypot and startedAt fields', () => {
    const parsed = applicationInputSchema.parse({ ...base, website: 'x', startedAt: 1 });
    expect(parsed).not.toHaveProperty('website');
    expect(parsed).not.toHaveProperty('startedAt');
    expect(parsed.contactTimeHint).toBeUndefined();
  });
});

describe('constants', () => {
  it('re-exports the zod-free constants from the schema module', () => {
    expect(STORAGE_KEYS).toBe(constants.STORAGE_KEYS);
    expect(applicationJobIdSchema.options).toEqual([...constants.APPLICATION_JOB_IDS]);
    expect(constants.isApplicationJobId('initiativ')).toBe(true);
    expect(constants.isApplicationJobId('chefarzt')).toBe(false);
    expect(constants.isApiErrorCode('INVALID_TOKEN')).toBe(true);
    expect(constants.isApiErrorCode('NOPE')).toBe(false);
    expect(constants.HONEYPOT_FIELD).not.toMatch(/web|url|site|homepage/i);
  });
});
