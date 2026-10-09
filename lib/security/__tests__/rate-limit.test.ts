import { describe, expect, it } from 'vitest';
import {
  MemoryRateLimiter,
  RATE_LIMITS,
  checkRateLimits,
  type RateLimitRule,
} from '@/lib/security/rate-limit';

function clock(start = 1_700_000_000_000) {
  let now = start;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

const RULE: RateLimitRule = { limit: 3, windowMs: 60_000 };

describe('MemoryRateLimiter', () => {
  it('erlaubt bis zum Limit und sperrt danach mit Retry-After', async () => {
    const time = clock();
    const limiter = new MemoryRateLimiter({ now: time.now });

    const results = [];
    for (let i = 0; i < 4; i += 1) results.push(await limiter.hit('ip-a', RULE));

    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results.map((r) => r.remaining)).toEqual([2, 1, 0, 0]);
    expect(results[2].retryAfterSec).toBe(0);
    expect(results[3].retryAfterSec).toBe(60);

    time.advance(45_500);
    expect((await limiter.hit('ip-a', RULE)).retryAfterSec).toBe(15);
  });

  it('öffnet nach Ablauf des Fensters ein neues', async () => {
    const time = clock();
    const limiter = new MemoryRateLimiter({ now: time.now });
    for (let i = 0; i < 4; i += 1) await limiter.hit('ip-a', RULE);

    time.advance(60_000);
    expect(await limiter.hit('ip-a', RULE)).toEqual({ allowed: true, remaining: 2, retryAfterSec: 0 });
  });

  it('zählt Schlüssel und Regeln getrennt', async () => {
    const limiter = new MemoryRateLimiter({ now: clock().now });
    for (let i = 0; i < 3; i += 1) await limiter.hit('ip-a', RULE);

    expect((await limiter.hit('ip-a', RULE)).allowed).toBe(false);
    expect((await limiter.hit('ip-b', RULE)).allowed).toBe(true);
    expect((await limiter.hit('ip-a', { limit: 3, windowMs: 120_000 })).allowed).toBe(true);
  });

  it('räumt abgelaufene Fenster auf und begrenzt die Anzahl der Schlüssel', async () => {
    const time = clock();
    const limiter = new MemoryRateLimiter({ now: time.now, maxKeys: 5, sweepEvery: 1 });

    for (let i = 0; i < 20; i += 1) await limiter.hit(`ip-${i}`, RULE);
    expect(limiter.size).toBeLessThanOrEqual(5);

    time.advance(60_000);
    await limiter.hit('ip-new', RULE);
    expect(limiter.size).toBe(1);
  });
});

describe('checkRateLimits', () => {
  it('liefert das strengste Ergebnis über mehrere Regeln', async () => {
    const time = clock();
    const limiter = new MemoryRateLimiter({ now: time.now });
    const rules = [
      { limit: 2, windowMs: 60_000 },
      { limit: 3, windowMs: 3_600_000 },
    ];

    expect(await checkRateLimits('ip', rules, limiter)).toEqual({ allowed: true, remaining: 1, retryAfterSec: 0 });
    expect(await checkRateLimits('ip', rules, limiter)).toEqual({ allowed: true, remaining: 0, retryAfterSec: 0 });
    expect(await checkRateLimits('ip', rules, limiter)).toEqual({ allowed: false, remaining: 0, retryAfterSec: 60 });

    // Kurzes Fenster ist wieder frei, das Stundenlimit (3) greift jetzt.
    time.advance(60_000);
    const result = await checkRateLimits('ip', rules, limiter);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSec).toBe(3_540);
  });

  it('setzt die vereinbarten Bewerbungs-Limits um (5 pro 10 min, 20 pro Tag)', async () => {
    const time = clock();
    const limiter = new MemoryRateLimiter({ now: time.now });
    const submit = () => checkRateLimits('hash', RATE_LIMITS.applicationSubmit, limiter);

    for (let i = 0; i < 5; i += 1) expect((await submit()).allowed).toBe(true);
    const blocked = await submit();
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(600);

    expect(RATE_LIMITS.applicationSubmit).toEqual([
      { limit: 5, windowMs: 600_000 },
      { limit: 20, windowMs: 86_400_000 },
    ]);
    expect(RATE_LIMITS.applicationFollowUp).toEqual([{ limit: 10, windowMs: 3_600_000 }]);
  });
});
