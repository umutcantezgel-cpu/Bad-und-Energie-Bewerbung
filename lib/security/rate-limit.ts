export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Sekunden bis zum Ende des Fensters; 0, solange der Aufruf erlaubt ist. */
  retryAfterSec: number;
}

export interface RateLimiter {
  hit(key: string, rule: RateLimitRule): Promise<RateLimitResult>;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

export interface MemoryRateLimiterOptions {
  /** Obergrenze gespeicherter Schlüssel; darüber werden die ältesten verworfen. */
  maxKeys?: number;
  /** Aufräumen abgelaufener Fenster alle n Aufrufe. */
  sweepEvery?: number;
  now?: () => number;
}

/**
 * Fixed-Window-Zähler im Speicher. Gilt nur pro Server-Instanz (Serverless: pro Lambda);
 * Phase 2 ersetzt ihn durch eine Supabase-Tabelle mit derselben Schnittstelle.
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly entries = new Map<string, WindowEntry>();
  private readonly maxKeys: number;
  private readonly sweepEvery: number;
  private readonly now: () => number;
  private hitsSinceSweep = 0;

  constructor({ maxKeys = 10_000, sweepEvery = 100, now = Date.now }: MemoryRateLimiterOptions = {}) {
    this.maxKeys = maxKeys;
    this.sweepEvery = sweepEvery;
    this.now = now;
  }

  get size(): number {
    return this.entries.size;
  }

  async hit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
    const now = this.now();
    // Jede Regel zählt getrennt, auch wenn derselbe Schlüssel mehrere Fenster hat.
    const id = `${rule.windowMs}:${rule.limit}:${key}`;

    let entry = this.entries.get(id);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + rule.windowMs };
      // Neu einfügen hält die Map grob nach Aktualität sortiert (für die Verdrängung).
      this.entries.delete(id);
      this.entries.set(id, entry);
    }
    if (entry.count <= rule.limit) entry.count += 1;

    this.maybeSweep(now);

    const allowed = entry.count <= rule.limit;
    return {
      allowed,
      remaining: Math.max(0, rule.limit - entry.count),
      retryAfterSec: allowed ? 0 : Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  private maybeSweep(now: number) {
    this.hitsSinceSweep += 1;
    if (this.hitsSinceSweep < this.sweepEvery && this.entries.size <= this.maxKeys) return;
    this.hitsSinceSweep = 0;

    for (const [id, entry] of this.entries) {
      if (now >= entry.resetAt) this.entries.delete(id);
    }
    for (const id of this.entries.keys()) {
      if (this.entries.size <= this.maxKeys) break;
      this.entries.delete(id);
    }
  }
}

export const rateLimiter: RateLimiter = new MemoryRateLimiter();

export const RATE_LIMITS = {
  /** 5 Bewerbungen pro 10 Minuten und 20 pro Tag je IP-Hash. */
  applicationSubmit: [
    { limit: 5, windowMs: 10 * 60 * 1000 },
    { limit: 20, windowMs: 24 * 60 * 60 * 1000 },
  ],
  applicationFollowUp: [{ limit: 10, windowMs: 60 * 60 * 1000 }],
} as const satisfies Record<string, readonly RateLimitRule[]>;

/**
 * Zählt den Aufruf gegen alle Regeln und liefert das strengste Ergebnis: gesperrt, sobald eine
 * Regel sperrt (längste Wartezeit), sonst das kleinste Restkontingent.
 */
export async function checkRateLimits(
  key: string,
  rules: readonly RateLimitRule[],
  limiter: RateLimiter = rateLimiter
): Promise<RateLimitResult> {
  const results = await Promise.all(rules.map((rule) => limiter.hit(key, rule)));
  const denied = results.filter((result) => !result.allowed);

  return {
    allowed: denied.length === 0,
    remaining: results.reduce((min, result) => Math.min(min, result.remaining), Infinity),
    retryAfterSec: denied.reduce((max, result) => Math.max(max, result.retryAfterSec), 0),
  };
}
