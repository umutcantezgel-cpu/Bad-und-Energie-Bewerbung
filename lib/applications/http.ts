import 'server-only';
import { NextResponse } from 'next/server';
import type { z } from 'zod';

import { COMPANY } from '@/lib/content/company';
import type { GuardFailure } from '@/lib/security';
import type { ApiErrorCode, ApplicationSubmitResponse } from './schema';
import type { SinkFailureReason } from './sink';

/**
 * Antworten der Bewerbungs-APIs im Vertrag C8: `{ ok: true, … }` oder
 * `{ ok: false, code, message, fieldErrors?, retryAfterSec? }`, nie gecacht.
 */

type ApiFailureBody = Extract<ApplicationSubmitResponse, { ok: false }>;

const PHONE = COMPANY.phone.display;

export const API_MESSAGES: Readonly<Record<ApiErrorCode, string>> = Object.freeze({
  VALIDATION_FAILED: 'Bitte prüf deine Angaben.',
  CSRF_FAILED: 'Die Anfrage kam nicht von unserer Seite. Bitte lade die Seite neu und versuch es noch einmal.',
  RATE_LIMITED: `Zu viele Versuche in kurzer Zeit. Bitte warte ein paar Minuten oder ruf uns an: ${PHONE}.`,
  PAYLOAD_TOO_LARGE: 'Deine Angaben sind zu lang. Bitte kürze deine Nachricht.',
  UNSUPPORTED_MEDIA_TYPE: 'Die Anfrage war ungültig. Bitte lade die Seite neu und versuch es noch einmal.',
  INVALID_JSON: 'Die Anfrage war ungültig. Bitte lade die Seite neu und versuch es noch einmal.',
  INVALID_TOKEN:
    'Wir konnten deine Angaben keiner Bewerbung zuordnen. Schick sie uns bitte per WhatsApp oder E-Mail und nenn deine Bewerbungsnummer.',
  FOLLOW_UP_LIMIT:
    'Zu dieser Bewerbung sind schon viele Ergänzungen eingegangen. Schick weitere bitte per WhatsApp oder E-Mail und nenn deine Bewerbungsnummer.',
  SERVICE_UNAVAILABLE: `Das Senden klappt gerade nicht. Bitte ruf uns an (${PHONE}) oder schreib uns per WhatsApp.`,
  INTERNAL: `Da ist etwas schiefgelaufen. Bitte versuch es noch einmal oder ruf uns an: ${PHONE}.`,
});

const STATUS: Readonly<Record<ApiErrorCode, number>> = Object.freeze({
  VALIDATION_FAILED: 400,
  CSRF_FAILED: 403,
  RATE_LIMITED: 429,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  INVALID_JSON: 400,
  INVALID_TOKEN: 403,
  FOLLOW_UP_LIMIT: 429,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL: 500,
});

function noStore(extra?: Record<string, string>): Headers {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  for (const [name, value] of Object.entries(extra ?? {})) headers.set(name, value);
  return headers;
}

export function apiSuccess<T extends { ok: true }>(body: T): NextResponse<T> {
  return NextResponse.json(body, { status: 200, headers: noStore() });
}

export interface ApiErrorOptions {
  message?: string;
  fieldErrors?: Record<string, string[]>;
  retryAfterSec?: number;
}

export function apiError(code: ApiErrorCode, { message, fieldErrors, retryAfterSec }: ApiErrorOptions = {}): NextResponse<ApiFailureBody> {
  const body: ApiFailureBody = { ok: false, code, message: message ?? API_MESSAGES[code] };
  if (fieldErrors && Object.keys(fieldErrors).length > 0) body.fieldErrors = fieldErrors;
  if (retryAfterSec !== undefined) body.retryAfterSec = retryAfterSec;
  const headers = noStore(retryAfterSec !== undefined ? { 'Retry-After': String(retryAfterSec) } : undefined);
  return NextResponse.json(body, { status: STATUS[code], headers });
}

/** Ergebnis von guardJsonPost (lib/security) im Vertrag C8. */
export function guardFailureResponse(failure: GuardFailure): NextResponse<ApiFailureBody> {
  switch (failure.code) {
    case 'FORBIDDEN':
      return apiError('CSRF_FAILED');
    case 'RATE_LIMITED':
      return apiError('RATE_LIMITED', { retryAfterSec: failure.retryAfterSec });
    case 'NOT_CONFIGURED':
      return apiError('SERVICE_UNAVAILABLE');
    case 'PAYLOAD_TOO_LARGE':
      return apiError('PAYLOAD_TOO_LARGE');
    case 'UNSUPPORTED_MEDIA_TYPE':
      return apiError('UNSUPPORTED_MEDIA_TYPE');
    case 'INVALID_JSON':
      return apiError('INVALID_JSON');
  }
}

/** Ergebnis eines Sinks (lib/applications/sink.ts) im Vertrag C8. */
export function sinkFailureResponse(reason: SinkFailureReason, options?: ApiErrorOptions): NextResponse<ApiFailureBody> {
  switch (reason) {
    case 'not_configured':
    case 'unavailable':
      return apiError('SERVICE_UNAVAILABLE', options);
    case 'limited':
      return apiError('FOLLOW_UP_LIMIT', options);
    case 'failed':
      return apiError('INTERNAL', options);
  }
}

/**
 * Deutsche Standardtexte für zod-Fehler ohne eigene Meldung (eigene Meldungen im Schema haben
 * Vorrang). Als `error` an safeParse übergeben.
 */
export const germanIssueMessage: z.core.$ZodErrorMap = (issue) => {
  switch (issue.code) {
    case 'too_big':
      return typeof issue.maximum === 'number' || typeof issue.maximum === 'bigint'
        ? issue.origin === 'string'
          ? `Bitte kürze diese Angabe auf höchstens ${issue.maximum} Zeichen.`
          : `Höchstens ${issue.maximum} Einträge.`
        : 'Diese Angabe ist zu lang.';
    case 'too_small':
      return issue.origin === 'string' ? 'Diese Angabe ist zu kurz.' : 'Diese Angabe ist zu klein.';
    case 'invalid_type':
      return issue.input === undefined ? 'Diese Angabe fehlt.' : 'Diese Angabe ist ungültig.';
    case 'unrecognized_keys':
      return 'Unbekanntes Feld.';
    default:
      return 'Diese Angabe ist ungültig.';
  }
};

/** Feldfehler je Pfad („email“, „answers.start“, „mappe.careerStations.0.role“); Wurzel unter „_form“. */
export function flattenFieldErrors(error: z.ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join('.') : '_form';
    const messages = (result[key] ??= []);
    if (!messages.includes(issue.message)) messages.push(issue.message);
  }
  return result;
}

export function validationFailedResponse(error: z.ZodError): NextResponse<ApiFailureBody> {
  return apiError('VALIDATION_FAILED', { fieldErrors: flattenFieldErrors(error) });
}
