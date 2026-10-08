import { describe, expect, it } from 'vitest';

import { applicationInputSchema, applicationJobIdSchema } from '../schema';

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
  });

  it('accepts every registry job plus the initiative option', () => {
    expect(applicationJobIdSchema.options).toContain('initiativ');
    expect(applicationJobIdSchema.options).toContain('quereinsteiger-montagehelfer');
    expect(applicationInputSchema.safeParse({ ...base, jobId: 'unbekannt' }).success).toBe(false);
  });

  it('rejects unknown answer keys and phone numbers without digits', () => {
    expect(applicationInputSchema.safeParse({ ...base, answers: { foo: 'bar' } }).success).toBe(false);
    expect(applicationInputSchema.safeParse({ ...base, phone: 'abc' }).success).toBe(false);
  });
});
