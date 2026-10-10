import { apiError, apiSuccess, germanIssueMessage, guardFailureResponse, sinkFailureResponse, validationFailedResponse } from '@/lib/applications/http';
import { normalizeFollowUp } from '@/lib/applications/normalize';
import { normalizeReference } from '@/lib/applications/reference';
import { applicationFollowUpSchema } from '@/lib/applications/schema';
import { getApplicationSink } from '@/lib/applications/sink';
import { verifyFollowUpToken } from '@/lib/applications/token';
import { EnvError } from '@/lib/env';
import { guardJsonPost, RATE_LIMITS } from '@/lib/security';

/**
 * POST /api/bewerbung/ergaenzung (Vertrag C8): Ergänzungen von der Danke-Seite oder aus der
 * Mappe. Zugeordnet wird über die Bewerbungsnummer und das HMAC-Token aus der Bewerbungs-Antwort
 * (14 Tage gültig). Gleicher Inhalt wird nur einmal versendet (Hash als Idempotenzschlüssel).
 */

const EXPIRED_MESSAGE =
  'Der Link zum Ergänzen ist abgelaufen. Schick uns deine Angaben bitte per WhatsApp oder E-Mail und nenn deine Bewerbungsnummer.';
const EMPTY_MESSAGE = 'Bitte gib mindestens eine Ergänzung an.';

export async function POST(request: Request) {
  try {
    const guard = await guardJsonPost(request, {
      scope: 'application-follow-up',
      rateLimit: RATE_LIMITS.applicationFollowUp,
    });
    if (!guard.ok) return guardFailureResponse(guard);

    const parsed = applicationFollowUpSchema.safeParse(guard.data, { error: germanIssueMessage });
    if (!parsed.success) return validationFailedResponse(parsed.error);

    const now = new Date();
    const reference = normalizeReference(parsed.data.reference);
    if (!reference) return apiError('INVALID_TOKEN');

    const check = verifyFollowUpToken(reference, parsed.data.token, now);
    if (!check.ok) {
      return apiError('INVALID_TOKEN', check.reason === 'expired' ? { message: EXPIRED_MESSAGE } : undefined);
    }

    const followUp = normalizeFollowUp(parsed.data, reference, now);
    if (!followUp) return apiError('VALIDATION_FAILED', { message: EMPTY_MESSAGE, fieldErrors: { _form: [EMPTY_MESSAGE] } });

    const result = await getApplicationSink().followUp(followUp);
    if (!result.ok) {
      console.error(`[bewerbung/ergaenzung] nicht zugestellt (${result.reason})`);
      return sinkFailureResponse(result.reason);
    }

    console.info(`[bewerbung/ergaenzung] eingegangen ${reference}${result.duplicate ? ' (Wiederholung)' : ''}`);
    return apiSuccess({ ok: true as const });
  } catch (err: unknown) {
    if (err instanceof EnvError) {
      console.error(`[bewerbung/ergaenzung] nicht konfiguriert: ${err.variable}`);
      return apiError('SERVICE_UNAVAILABLE');
    }
    console.error(`[bewerbung/ergaenzung] Fehler: ${err instanceof Error ? err.name : 'unknown'}`);
    return apiError('INTERNAL');
  }
}
