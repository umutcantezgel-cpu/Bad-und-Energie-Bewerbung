import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

import { REFERENCE_PATTERN } from '@/lib/applications/reference';
import type { Database } from './database.types';
import type { SubmitApplicationPayload, SubmitFollowUpPayload } from './payload';

/**
 * Aufrufe der Intake-RPCs mit Zeitlimit und Fehlerklassen. Der Secret Key hat nur EXECUTE auf
 * diese Funktionen (keine Tabellenrechte, siehe *_rls_grants.sql). Fehler der Funktionen kommen
 * als P0001 mit festem Namen (`validation_failed` …) und enthalten keine Zeileninhalte; geloggt
 * werden trotzdem nur Klasse, Code und HTTP-Status, nie `details` (dort stünde z. B. ein Stack).
 */

export type RpcErrorKind =
  | 'reference_conflict'
  | 'validation_failed'
  | 'not_found'
  | 'follow_up_limit'
  /** Netz, Zeitüberschreitung, 5xx, pausiertes Projekt. */
  | 'unavailable'
  /** Falscher Key, fehlende Funktion (Migration nicht eingespielt), fehlende Rechte. */
  | 'misconfigured'
  | 'unexpected';

export type RpcResult<T> = { ok: true; data: T } | { ok: false; kind: RpcErrorKind; status: number; code?: string };

export interface SubmitApplicationResponse {
  application_id: string;
  reference: string;
  duplicate: boolean;
  resubmitted: boolean;
}

export interface SubmitFollowUpResponse {
  ok: true;
  duplicate: boolean;
}

export interface IntakeRpc {
  submitApplication(payload: SubmitApplicationPayload): Promise<RpcResult<SubmitApplicationResponse>>;
  submitFollowUp(payload: SubmitFollowUpPayload): Promise<RpcResult<SubmitFollowUpResponse>>;
  /**
   * Verbindungsprobe ohne Schreibzugriff: rpc_submit_follow_up mit leerer Nutzlast muss mit
   * `validation_failed` antworten. Das belegt Erreichbarkeit, gültigen Key und eingespielte Migration.
   */
  probe(): Promise<RpcResult<'ok'>>;
}

/** Zeitlimit je Aufruf. Danach Not-E-Mail; der Browser gibt erst nach 25 s auf. */
export const RPC_TIMEOUT_MS = 5_000;

const DOMAIN_ERRORS: readonly RpcErrorKind[] = ['reference_conflict', 'validation_failed', 'not_found', 'follow_up_limit'];

export function classifyRpcError(error: { code?: string | null; message?: string | null }, status: number): RpcErrorKind {
  if (error.code === 'P0001' && DOMAIN_ERRORS.includes(error.message as RpcErrorKind)) return error.message as RpcErrorKind;
  if (status === 0 || status === 408 || status === 429 || status >= 500) return 'unavailable';
  if (status === 401 || status === 403 || status === 404 || ['PGRST202', '42501', '42883'].includes(error.code ?? '')) {
    return 'misconfigured';
  }
  return 'unexpected';
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isSubmitResponse(value: unknown): value is SubmitApplicationResponse {
  return (
    isRecord(value) &&
    typeof value.application_id === 'string' &&
    typeof value.reference === 'string' &&
    REFERENCE_PATTERN.test(value.reference) &&
    typeof value.duplicate === 'boolean' &&
    typeof value.resubmitted === 'boolean'
  );
}

function isFollowUpResponse(value: unknown): value is SubmitFollowUpResponse {
  return isRecord(value) && value.ok === true && typeof value.duplicate === 'boolean';
}

interface RawResponse {
  data: unknown;
  error: { code?: string | null; message?: string | null } | null;
  status: number;
}

async function settle<T>(run: () => PromiseLike<RawResponse>, valid: (value: unknown) => value is T): Promise<RpcResult<T>> {
  try {
    const { data, error, status } = await run();
    if (error) {
      return { ok: false, kind: classifyRpcError(error, status), status, ...(error.code ? { code: error.code } : {}) };
    }
    return valid(data) ? { ok: true, data } : { ok: false, kind: 'unexpected', status };
  } catch {
    return { ok: false, kind: 'unavailable', status: 0 };
  }
}

export function createIntakeRpc(client: SupabaseClient<Database>, timeoutMs: number = RPC_TIMEOUT_MS): IntakeRpc {
  const signal = () => AbortSignal.timeout(timeoutMs);
  return {
    submitApplication: (payload) =>
      settle(() => client.rpc('rpc_submit_application', { payload }).abortSignal(signal()), isSubmitResponse),
    submitFollowUp: (payload) =>
      settle(() => client.rpc('rpc_submit_follow_up', { payload }).abortSignal(signal()), isFollowUpResponse),
    probe: async () => {
      const result = await settle(
        () => client.rpc('rpc_submit_follow_up', { payload: {} }).abortSignal(signal()),
        (value): value is never => false,
      );
      if (!result.ok && result.kind === 'validation_failed') return { ok: true, data: 'ok' };
      return result.ok ? { ok: false, kind: 'unexpected', status: 200 } : result;
    },
  };
}
