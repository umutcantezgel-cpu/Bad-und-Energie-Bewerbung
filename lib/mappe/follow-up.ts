import type { ApiErrorCode, ApplicationFollowUp, Mappe } from '@/lib/applications/schema';

/** Nachreichen der Mappe an eine abgeschickte Bewerbung (Vertrag C8). */
export const FOLLOW_UP_ENDPOINT = '/api/bewerbung/ergaenzung';

export type FollowUpResult = { ok: true } | { ok: false; code: ApiErrorCode | 'NETWORK'; message: string };

const FALLBACK_MESSAGES: Record<ApiErrorCode | 'NETWORK', string> = {
  NETWORK: 'Keine Verbindung. Prüf dein Internet und versuch es noch einmal.',
  VALIDATION_FAILED: 'Die Mappe enthält Angaben, die wir nicht annehmen konnten. Bitte prüf deine Einträge.',
  CSRF_FAILED: 'Die Anfrage wurde aus Sicherheitsgründen abgelehnt. Lad die Seite neu und versuch es noch einmal.',
  RATE_LIMITED: 'Zu viele Versuche in kurzer Zeit. Bitte warte einen Moment.',
  PAYLOAD_TOO_LARGE: 'Die Mappe ist zu groß. Bitte kürze das Anschreiben oder die Aufgaben.',
  UNSUPPORTED_MEDIA_TYPE: 'Das Senden hat nicht geklappt. Lad die Seite neu und versuch es noch einmal.',
  INVALID_JSON: 'Das Senden hat nicht geklappt. Lad die Seite neu und versuch es noch einmal.',
  INVALID_TOKEN: 'Wir konnten die Mappe deiner Bewerbung nicht zuordnen. Schick sie uns bitte per WhatsApp oder E-Mail.',
  SERVICE_UNAVAILABLE: 'Das Senden klappt gerade nicht. Deine Angaben bleiben erhalten.',
  INTERNAL: 'Das Senden hat nicht geklappt. Deine Angaben bleiben erhalten.',
};

function isErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && value in FALLBACK_MESSAGES && value !== 'NETWORK';
}

function retryHint(seconds: unknown): string {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return '';
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? ' Versuch es in einer Minute noch einmal.' : ` Versuch es in ${minutes} Minuten noch einmal.`;
}

/** Wartet auf die echte Server-Antwort; Erfolg nur bei `{ ok: true }` mit 2xx. */
export async function sendMappeFollowUp(
  input: { reference: string; token: string; mappe: Mappe },
  fetchImpl: typeof fetch = fetch,
): Promise<FollowUpResult> {
  const body: ApplicationFollowUp = { reference: input.reference, token: input.token, mappe: input.mappe };
  let response: Response;
  try {
    response = await fetchImpl(FOLLOW_UP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, code: 'NETWORK', message: FALLBACK_MESSAGES.NETWORK };
  }

  const data: unknown = await response.json().catch(() => null);
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  if (response.ok && record.ok === true) return { ok: true };

  const code: ApiErrorCode = isErrorCode(record.code)
    ? record.code
    : response.status === 429
      ? 'RATE_LIMITED'
      : response.status === 503
        ? 'SERVICE_UNAVAILABLE'
        : 'INTERNAL';
  const serverMessage = typeof record.message === 'string' && record.message.trim() ? record.message.trim() : '';
  const message = (serverMessage || FALLBACK_MESSAGES[code]) + (code === 'RATE_LIMITED' ? retryHint(record.retryAfterSec) : '');
  return { ok: false, code, message };
}
