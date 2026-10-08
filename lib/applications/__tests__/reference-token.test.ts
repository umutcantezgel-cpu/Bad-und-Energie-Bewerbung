import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createReference,
  isReference,
  normalizeReference,
  REFERENCE_ALPHABET,
  REFERENCE_PATTERN,
  referenceYear,
} from '@/lib/applications/reference';
import {
  createFollowUpToken,
  FOLLOW_UP_TOKEN_TTL_MS,
  verifyFollowUpToken,
} from '@/lib/applications/token';
import { EnvError } from '@/lib/env';

const SECRET = 'test-secret-with-at-least-32-characters!!';
const NOW = new Date('2026-10-08T10:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createReference', () => {
  it('has the form BE-YY-XXXXXX with an unambiguous alphabet', () => {
    const reference = createReference(NOW);
    expect(reference).toMatch(/^BE-26-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
    expect(REFERENCE_PATTERN.test(reference)).toBe(true);
    expect(REFERENCE_ALPHABET).not.toMatch(/[01OIL]/);
  });

  it('uses the year in Europe/Berlin', () => {
    expect(referenceYear(new Date('2026-12-31T22:30:00Z'))).toBe('26');
    expect(referenceYear(new Date('2026-12-31T23:30:00Z'))).toBe('27');
    expect(createReference(new Date('2026-12-31T23:30:00Z'))).toMatch(/^BE-27-/);
  });

  it('is random enough to avoid collisions without a database', () => {
    const references = new Set(Array.from({ length: 2000 }, () => createReference(NOW)));
    expect(references.size).toBe(2000);
  });

  it('normalizes and validates references', () => {
    expect(normalizeReference(' be-26-k7m4qx ')).toBe('BE-26-K7M4QX');
    expect(normalizeReference('BE-26-K7M4')).toBe('BE-26-K7M4');
    expect(normalizeReference('BE-26-K0M4QX')).toBeNull();
    expect(normalizeReference('XX-26-K7M4QX')).toBeNull();
    expect(normalizeReference(42)).toBeNull();
    expect(isReference('BE-26-K7M4QX')).toBe(true);
  });
});

describe('follow-up token', () => {
  const reference = 'BE-26-K7M4QX';

  it('verifies a fresh token', () => {
    const token = createFollowUpToken(reference, NOW, SECRET);
    expect(token).toMatch(/^[0-9a-z]+\.[A-Za-z0-9_-]{43}$/);
    expect(token.length).toBeLessThanOrEqual(128);
    const check = verifyFollowUpToken(reference, token, new Date(NOW.getTime() + DAY), SECRET);
    expect(check).toMatchObject({ ok: true });
    if (check.ok) expect(check.expiresAt.getTime() - check.issuedAt.getTime()).toBe(FOLLOW_UP_TOKEN_TTL_MS);
  });

  it('is valid for 14 days and then expires', () => {
    const token = createFollowUpToken(reference, NOW, SECRET);
    expect(verifyFollowUpToken(reference, token, new Date(NOW.getTime() + 14 * DAY), SECRET).ok).toBe(true);
    expect(verifyFollowUpToken(reference, token, new Date(NOW.getTime() + 14 * DAY + 1000), SECRET)).toEqual({
      ok: false,
      reason: 'expired',
    });
  });

  it('rejects a token for another reference, a tampered MAC, another secret and a malformed token', () => {
    const token = createFollowUpToken(reference, NOW, SECRET);
    const [issued, mac] = token.split('.');
    const flipped = `${issued}.${mac[0] === 'A' ? 'B' : 'A'}${mac.slice(1)}`;

    expect(verifyFollowUpToken('BE-26-K7M4QY', token, NOW, SECRET)).toEqual({ ok: false, reason: 'invalid' });
    expect(verifyFollowUpToken(reference, flipped, NOW, SECRET)).toEqual({ ok: false, reason: 'invalid' });
    expect(verifyFollowUpToken(reference, token, NOW, `${SECRET}x`)).toEqual({ ok: false, reason: 'invalid' });
    expect(verifyFollowUpToken(reference, 'nonsense', NOW, SECRET)).toEqual({ ok: false, reason: 'malformed' });
    expect(verifyFollowUpToken(reference, '', NOW, SECRET)).toEqual({ ok: false, reason: 'malformed' });
  });

  it('rejects a moved issue date (the MAC covers it) and tokens from the future', () => {
    const token = createFollowUpToken(reference, NOW, SECRET);
    const [, mac] = token.split('.');
    const later = Math.floor((NOW.getTime() + 13 * DAY) / 1000).toString(36);
    expect(verifyFollowUpToken(reference, `${later}.${mac}`, new Date(NOW.getTime() + 20 * DAY), SECRET).ok).toBe(false);

    const future = createFollowUpToken(reference, new Date(NOW.getTime() + DAY), SECRET);
    expect(verifyFollowUpToken(reference, future, NOW, SECRET)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('throws EnvError in production without APPLICATION_TOKEN_SECRET', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APPLICATION_TOKEN_SECRET', '');
    expect(() => createFollowUpToken(reference, NOW)).toThrow(EnvError);
  });

  it('uses APPLICATION_TOKEN_SECRET from the environment', () => {
    vi.stubEnv('APPLICATION_TOKEN_SECRET', SECRET);
    const token = createFollowUpToken(reference, NOW);
    expect(verifyFollowUpToken(reference, token, NOW, SECRET).ok).toBe(true);
  });
});
