import { germanIssueMessage, apiError, apiSuccess, guardFailureResponse, validationFailedResponse } from '@/lib/applications/http';
import { normalizeApplication } from '@/lib/applications/normalize';
import { applicationInputSchema, type ApplicationSubmitResponse } from '@/lib/applications/schema';
import { getApplicationSink } from '@/lib/applications/sink';
import { assertFollowUpTokenSecret, createFollowUpToken } from '@/lib/applications/token';
import { EnvError } from '@/lib/env';
import { guardJsonPost, RATE_LIMITS } from '@/lib/security';

/**
 * POST /api/bewerbung (Vertrag C8). Reihenfolge:
 * Eingangskontrolle (CSRF, Rate-Limit, Content-Type, Body-Cap) → Schema → Normalisierung
 * (Stelle aus dem Registry, Antworten aus deren Fragenset, Telefon E.164, Kanal, Spamverdacht)
 * → Sink (E-Mail) → Token. Erfolg nur, wenn die Team-Mail angenommen wurde.
 *
 * Honeypot und Mindestdauer lehnen nichts ab (ein Autofill könnte den Honeypot füllen): Die
 * Bewerbung geht als „[Spamverdacht]“ ans Team, aber ohne Eingangsbestätigung an die
 * ungeprüfte Adresse. Logs enthalten keine personenbezogenen Daten.
 */

type SuccessBody = Extract<ApplicationSubmitResponse, { ok: true }>;

export async function POST(request: Request) {
  try {
    const guard = await guardJsonPost(request, { scope: 'application', rateLimit: RATE_LIMITS.applicationSubmit });
    if (!guard.ok) return guardFailureResponse(guard);

    const now = new Date();
    const parsed = applicationInputSchema.safeParse(guard.data, { error: germanIssueMessage });
    if (!parsed.success) return validationFailedResponse(parsed.error);

    // Ohne Token-Geheimnis gäbe es nach dem Versand kein Ergänzungs-Token: vorher ehrlich 503.
    assertFollowUpTokenSecret();

    const application = normalizeApplication(parsed.data, { now });
    const result = await getApplicationSink().submit(application);
    if (!result.ok) {
      console.error(`[bewerbung] nicht zugestellt (${result.reason})`);
      return apiError(result.reason === 'not_configured' ? 'SERVICE_UNAVAILABLE' : 'INTERNAL');
    }

    const flags = [
      application.suspectedSpam && `Spamverdacht: ${application.spamSignals.join('+')}`,
      result.duplicate && 'Wiederholung',
    ].filter(Boolean);
    console.info(
      `[bewerbung] eingegangen ${result.reference} (${application.job.id}, ${application.channel}${flags.length ? `, ${flags.join(', ')}` : ''})`,
    );

    return apiSuccess<SuccessBody>({
      ok: true,
      reference: result.reference,
      followUpToken: createFollowUpToken(result.reference, now),
      firstName: application.firstName,
    });
  } catch (err: unknown) {
    if (err instanceof EnvError) {
      console.error(`[bewerbung] nicht konfiguriert: ${err.variable}`);
      return apiError('SERVICE_UNAVAILABLE');
    }
    console.error(`[bewerbung] Fehler: ${err instanceof Error ? err.name : 'unknown'}`);
    return apiError('INTERNAL');
  }
}
