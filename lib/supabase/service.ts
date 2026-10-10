import 'server-only';
import { createHash } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getApplicationSinkMode, resolveIntakeTarget, type SupabaseServiceConfig } from '@/lib/env';
import type { Database } from './database.types';
import { createIntakeRpc, type IntakeRpc } from './rpc';

/**
 * Server-Client mit dem Secret Key (nur für die Intake-RPCs). Ohne Sitzung, ohne Cookies und ohne
 * next/headers, damit er in Route-Handlern und im Start-Check gleich funktioniert.
 */
export function createServiceClient(config: SupabaseServiceConfig): SupabaseClient<Database> {
  return createClient<Database>(config.url, config.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    db: { schema: 'public' },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}

export interface CircuitBreakerOptions {
  /** Aufeinanderfolgende Ausfälle, nach denen die Datenbank kurz übersprungen wird. */
  threshold?: number;
  cooldownMs?: number;
  now?: () => number;
}

/**
 * Überspringt die Datenbank nach wiederholten Ausfällen für kurze Zeit (je Server-Instanz), damit
 * nicht jede Bewerbung erst 5 s auf das Zeitlimit wartet, bevor die Not-E-Mail rausgeht.
 */
export class CircuitBreaker {
  private failures = 0;
  private openUntil = 0;
  private readonly threshold: number;
  private readonly cooldownMs: number;
  private readonly now: () => number;

  constructor({ threshold = 2, cooldownMs = 30_000, now = Date.now }: CircuitBreakerOptions = {}) {
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
    this.now = now;
  }

  isOpen(): boolean {
    return this.now() < this.openUntil;
  }

  recordSuccess(): void {
    this.failures = 0;
  }

  recordFailure(): void {
    this.failures += 1;
    if (this.failures >= this.threshold) {
      this.openUntil = this.now() + this.cooldownMs;
      this.failures = 0;
    }
  }
}

export interface SupabaseIntake {
  /** URL plus Hash des Keys: ein neuer Key (nach Rotation) bekommt einen neuen Client. */
  signature: string;
  config: SupabaseServiceConfig;
  rpc: IntakeRpc;
  breaker: CircuitBreaker;
}

let current: SupabaseIntake | null = null;
let warnedMissing = false;

/** Verbindung für Bewerbungen; null bei APPLICATION_SINK=email, ohne Konfiguration oder außerhalb von Production (auto). */
export function getSupabaseIntake(): SupabaseIntake | null {
  const target = resolveIntakeTarget();
  if (target.kind === 'email') {
    if (target.reason === 'not_configured' && getApplicationSinkMode() === 'supabase' && !warnedMissing) {
      warnedMissing = true;
      console.error('[bewerbung] APPLICATION_SINK=supabase, aber Supabase ist nicht vollständig konfiguriert – nur E-Mail');
    }
    return null;
  }

  const { config } = target;
  const signature = `${config.url}|${createHash('sha256').update(config.secretKey).digest('hex').slice(0, 12)}`;
  if (current?.signature !== signature) {
    current = { signature, config, rpc: createIntakeRpc(createServiceClient(config)), breaker: new CircuitBreaker() };
  }
  return current;
}

/** Nur für Tests: eigene Verbindung setzen oder (mit `null`) zurücksetzen. */
export function setSupabaseIntakeForTests(next: SupabaseIntake | null): void {
  current = next;
  warnedMissing = false;
}
