import { isApiErrorCode, type ApiErrorCode } from '@/lib/applications/constants';
import { formatRetryAfter, type SubmitFailure } from './submit';

/**
 * Was die Oberfläche nach einem gescheiterten Absenden zeigt (Flow, Ergänzungen, Mappe).
 * Texte kommen nach Fehlercode: bevorzugt die deutsche Meldung des Servers (API_MESSAGES in
 * lib/applications/http.ts), sonst ein eigener Text. `action` sagt, ob ein erneutes Senden
 * helfen kann; sonst bietet die Oberfläche nur Anrufen und WhatsApp (bzw. Neuladen) an.
 */

export type FailureAction =
  /** Erneut senden kann klappen (Netz, Zeitüberschreitung, Server kurz nicht erreichbar). */
  | 'retry'
  /** Erst nach einem Neuladen der Seite (CSRF, kaputte Anfrage); der Entwurf bleibt erhalten. */
  | 'reload'
  /** Unverändert erneut senden hilft nicht (Link abgelaufen, Angaben zu lang oder ungültig). */
  | 'none';

export interface FailurePresentation {
  detail: string;
  action: FailureAction;
}

/** Eigene Texte je Code, z. B. „Die Mappe ist zu groß …“ im Mappe-Werkzeug. */
export type FailureOverrides = Partial<Record<ApiErrorCode, string>>;

// Imperativ in der Kurzform wie die Servertexte (lib/applications/http.ts): „prüf“, „versuch“, „schick“.
const GENERIC = 'Unser Server antwortet gerade nicht. Sende deine Angaben gleich noch einmal oder melde dich direkt bei uns.';
const RELOAD = 'Die Anfrage war ungültig. Bitte lade die Seite neu und versuch es noch einmal. Deine Angaben bleiben erhalten.';

/** Texte, falls der Server keine Meldung mitschickt (z. B. Antwort eines Proxys). */
const FALLBACK: Readonly<Record<ApiErrorCode, string>> = {
  VALIDATION_FAILED: 'Bitte prüf deine Angaben.',
  CSRF_FAILED: RELOAD,
  RATE_LIMITED: 'Zu viele Versuche in kurzer Zeit. Bitte versuch es gleich noch einmal oder melde dich direkt.',
  PAYLOAD_TOO_LARGE: 'Deine Angaben sind zu lang. Bitte kürze sie oder schick sie uns per WhatsApp.',
  UNSUPPORTED_MEDIA_TYPE: RELOAD,
  INVALID_JSON: RELOAD,
  INVALID_TOKEN: 'Wir konnten deine Angaben keiner Bewerbung zuordnen. Schick sie uns bitte per WhatsApp oder E-Mail.',
  FOLLOW_UP_LIMIT: 'Zu dieser Bewerbung sind schon viele Ergänzungen eingegangen. Schick weitere bitte per WhatsApp oder E-Mail.',
  SERVICE_UNAVAILABLE: 'Das Senden klappt gerade nicht. Bitte ruf uns an oder schreib uns per WhatsApp.',
  INTERNAL: 'Da ist etwas schiefgelaufen. Bitte versuch es noch einmal oder melde dich direkt bei uns.',
};

const ACTION: Readonly<Record<ApiErrorCode, FailureAction>> = {
  VALIDATION_FAILED: 'none',
  CSRF_FAILED: 'reload',
  RATE_LIMITED: 'retry',
  PAYLOAD_TOO_LARGE: 'none',
  UNSUPPORTED_MEDIA_TYPE: 'reload',
  INVALID_JSON: 'reload',
  INVALID_TOKEN: 'none',
  FOLLOW_UP_LIMIT: 'none',
  SERVICE_UNAVAILABLE: 'retry',
  INTERNAL: 'retry',
};

export function describeFailure(failure: SubmitFailure, overrides: FailureOverrides = {}): FailurePresentation {
  switch (failure.kind) {
    case 'offline':
      return { detail: 'Du bist gerade offline. Sobald du wieder Netz hast, kannst du erneut senden.', action: 'retry' };
    case 'timeout':
    case 'network':
      return { detail: 'Die Verbindung ist abgebrochen. Sende deine Angaben noch einmal oder melde dich direkt bei uns.', action: 'retry' };
    case 'rate_limited': {
      const wait = formatRetryAfter(failure.retryAfterSec);
      return {
        detail: wait
          ? `Zu viele Versuche in kurzer Zeit. Bitte versuch es in ${wait} noch einmal oder melde dich direkt.`
          : FALLBACK.RATE_LIMITED,
        action: 'retry',
      };
    }
    default: {
      const code = isApiErrorCode(failure.code) ? failure.code : failure.kind === 'validation' ? 'VALIDATION_FAILED' : undefined;
      // 5xx ohne Code (z. B. Gateway-Fehler): allgemeiner Text, erneut senden kann helfen.
      if (!code) return { detail: GENERIC, action: 'retry' };
      return { detail: overrides[code] ?? failure.message ?? FALLBACK[code], action: ACTION[code] };
    }
  }
}
