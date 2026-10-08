/**
 * Begrenzter LRU-Speicher mit Ablaufzeit für Idempotenz (Phase 1, im Arbeitsspeicher).
 * Gilt nur pro Server-Instanz; Wiederholungen, die auf einer anderen Instanz landen, fängt
 * zusätzlich der Idempotency-Key von Resend ab (siehe lib/email/resend.ts). Phase 2 speichert
 * den Schlüssel in der Datenbank (`applications.idempotency_key`).
 */

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
export const IDEMPOTENCY_MAX_ENTRIES = 2000;

interface Entry<V> {
  value: V;
  expiresAt: number;
}

export interface TtlLruOptions {
  maxEntries?: number;
  ttlMs?: number;
  now?: () => number;
}

export class TtlLru<V> {
  private readonly entries = new Map<string, Entry<V>>();
  private readonly maxEntries: number;
  private readonly ttlMs: number;
  private readonly now: () => number;

  constructor({ maxEntries = IDEMPOTENCY_MAX_ENTRIES, ttlMs = IDEMPOTENCY_TTL_MS, now = Date.now }: TtlLruOptions = {}) {
    this.maxEntries = Math.max(1, maxEntries);
    this.ttlMs = ttlMs;
    this.now = now;
  }

  get size(): number {
    return this.entries.size;
  }

  get(key: string): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (this.now() >= entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    // Neu einfügen = zuletzt benutzt (Map behält die Einfügereihenfolge).
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }

  /** Setzt den Wert; die Ablaufzeit bleibt beim Überschreiben erhalten, wenn `keepExpiry` gesetzt ist. */
  set(key: string, value: V, { keepExpiry = false }: { keepExpiry?: boolean } = {}): void {
    const previous = this.entries.get(key);
    const expiresAt = keepExpiry && previous ? previous.expiresAt : this.now() + this.ttlMs;
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt });
    this.evict();
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  private evict(): void {
    if (this.entries.size <= this.maxEntries) return;
    const now = this.now();
    for (const [key, entry] of this.entries) {
      if (now >= entry.expiresAt) this.entries.delete(key);
    }
    for (const key of this.entries.keys()) {
      if (this.entries.size <= this.maxEntries) break;
      this.entries.delete(key);
    }
  }
}
