import 'server-only';

import {
  emailSimulationAllowed,
  getEmailConfig,
  getSecretSource,
  isVercelProduction,
  resolveIntakeTarget,
  type IntakeTarget,
  type SecretSource,
} from '@/lib/env';
import { isGoogleMapsConfigured } from '@/lib/maps/keys';
import { getSupabaseIntake } from '@/lib/supabase/service';
import type { RpcErrorKind } from '@/lib/supabase/rpc';

/**
 * Betriebsstatus für GET /api/status: Ist der Versand eingerichtet, woher kommen die Geheimnisse,
 * wohin gehen Bewerbungen, ist die Datenbank erreichbar, gibt es einen Maps-Key? Nur Zustände,
 * nie Werte oder Adressen (außer der Absender-Domain, die in jeder Mail steht).
 */

export interface StatusReport {
  /** Bewerbungen können angenommen werden (Versand bereit, Geheimnisse vorhanden, Datenbank ok oder nicht genutzt). */
  ok: boolean;
  environment: 'production' | 'preview' | 'development' | 'other';
  email: {
    status: 'ready' | 'simulated' | 'not_configured';
    sender: 'env' | 'default';
    senderDomain: string;
  };
  secrets: { ipHashSalt: SecretSource; applicationTokenSecret: SecretSource };
  applications: {
    target: 'supabase' | 'email';
    reason?: Extract<IntakeTarget, { kind: 'email' }>['reason'];
    /** Ergebnis der Verbindungsprobe (höchstens alle 5 Minuten je Instanz). */
    database?: 'ok' | RpcErrorKind;
  };
  maps: { configured: boolean };
}

/** Verbindungsprobe zwischenspeichern: Der Endpunkt ist öffentlich, die Datenbank soll das nicht spüren. */
export const PROBE_TTL_MS = 5 * 60 * 1000;
let probeCache: { signature: string; at: number; result: 'ok' | RpcErrorKind } | null = null;

async function probeDatabase(now: number): Promise<'ok' | RpcErrorKind | undefined> {
  const intake = getSupabaseIntake();
  if (!intake) return undefined;
  if (probeCache?.signature === intake.signature && now - probeCache.at < PROBE_TTL_MS) return probeCache.result;
  const probe = await intake.rpc.probe();
  const result = probe.ok ? 'ok' : probe.kind;
  probeCache = { signature: intake.signature, at: now, result };
  return result;
}

function environment(): StatusReport['environment'] {
  if (isVercelProduction()) return 'production';
  if (process.env.VERCEL_ENV === 'preview') return 'preview';
  if (process.env.NODE_ENV !== 'production') return 'development';
  return 'other';
}

function domainOf(sender: string): string {
  return /@([^\s@<>]+)>?\s*$/.exec(sender)?.[1]?.toLowerCase() ?? '';
}

export async function getStatusReport(now: number = Date.now()): Promise<StatusReport> {
  const email = getEmailConfig();
  const emailStatus: StatusReport['email']['status'] =
    email.forceSimulation || (!email.apiKey && emailSimulationAllowed()) ? 'simulated' : email.apiKey ? 'ready' : 'not_configured';

  const secrets = {
    ipHashSalt: getSecretSource('IP_HASH_SALT'),
    applicationTokenSecret: getSecretSource('APPLICATION_TOKEN_SECRET'),
  };

  const target = resolveIntakeTarget();
  const database = await probeDatabase(now);
  const applications: StatusReport['applications'] =
    target.kind === 'supabase' ? { target: 'supabase', ...(database ? { database } : {}) } : { target: 'email', reason: target.reason };

  const ok =
    emailStatus !== 'not_configured' &&
    secrets.ipHashSalt !== 'missing' &&
    secrets.applicationTokenSecret !== 'missing' &&
    (applications.target === 'email' || applications.database === 'ok');

  return {
    ok,
    environment: environment(),
    email: { status: emailStatus, sender: email.fromSource, senderDomain: domainOf(email.from) },
    secrets,
    applications,
    maps: { configured: isGoogleMapsConfigured() },
  };
}

/** Nur für Tests. */
export function resetStatusProbeForTests(): void {
  probeCache = null;
}
