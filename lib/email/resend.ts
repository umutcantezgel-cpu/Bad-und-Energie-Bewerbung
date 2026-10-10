import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { Resend } from 'resend';

import { applicationContent } from '@/lib/applications/fingerprint';
import type { NormalizedFollowUp, ReferencedApplication } from '@/lib/applications/types';
import { emailSimulationAllowed, getEmailConfig } from '@/lib/env';
import {
  renderApplicationConfirmationEmail,
  renderApplicationFollowUpEmail,
  renderApplicationTeamEmail,
} from './templates';

export interface EmailDispatchResult {
  success: boolean;
  id?: string;
  simulated?: boolean;
  /** Resend kannte den Idempotency-Key schon: Die Mail ging bereits mit einer früheren Anfrage raus. */
  duplicate?: boolean;
  /** Fehlercode, z. B. 'not_configured', 'no_recipient' oder ein Resend-Code wie 'validation_error'. */
  error?: string;
}

export interface DualDispatchResult {
  success: boolean;
  teamNotification: EmailDispatchResult;
  userConfirmation: EmailDispatchResult;
  simulated: boolean;
}

/** Resend-Tags: Name und Wert nur ASCII-Buchstaben, Ziffern, `_` und `-`. */
export interface EmailTag {
  name: string;
  value: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  /** Textfassung (multipart/alternative). */
  text?: string;
  replyTo?: string;
  from?: string;
  tags?: EmailTag[];
  /** Wird als `Idempotency-Key` an Resend durchgereicht (sichere Wiederholungen). */
  idempotencyKey?: string;
}

export interface DispatchOptions {
  /**
   * Basis-Schlüssel, z. B. `bewerbung:<uuid>`. Je Mail wird `:<art>:<Inhalts-Hash>` angehängt:
   * Gleicher Inhalt wird von Resend 24 h lang nur einmal versendet, geänderter Inhalt
   * (z. B. korrigierte Telefonnummer nach einem Fehler) bekommt einen eigenen Schlüssel.
   * Bei Bewerbungen zählen nur die Angaben, nicht Eingangszeit oder Ausfülldauer
   * (applicationFingerprint), damit Wiederholungen auf einer anderen Instanz denselben Key haben.
   */
  idempotencyKey?: string;
}

/** Zeitlimit je Resend-Aufruf: Der Browser gibt nach 25 s auf (lib/apply/submit.ts). */
export const RESEND_TIMEOUT_MS = 10_000;
/** Wartezeit vor dem einen erneuten Versuch bei vorübergehenden Fehlern. */
const RETRY_DELAY_MS = 800;

/**
 * Fehler, die an der Konfiguration liegen (Key, Absender-Domain, Kontingent): Eine Wiederholung
 * hilft nicht, die API antwortet mit 503 und die Seite bietet Anruf und WhatsApp an.
 * `validation_error` mit HTTP 403 heißt bei Resend „Domain nicht verifiziert“ bzw. „Testmodus“.
 */
const CONFIG_ERRORS = new Set([
  'missing_api_key',
  'invalid_api_key',
  'restricted_api_key',
  'suspended_api_key',
  'invalid_from_address',
  'monthly_quota_exceeded',
  'daily_quota_exceeded',
]);
/** Vorübergehende Fehler: einmal mit demselben Idempotency-Key wiederholen (sicher, kein Doppelversand). */
const TRANSIENT_ERRORS = new Set(['concurrent_idempotent_requests', 'rate_limit_exceeded', 'internal_server_error', 'service_unavailable']);

/** Resend-Fehlertext ohne Adressen (Domains bleiben, sie erklären z. B. „domain is not verified“). */
function redactErrorMessage(message: unknown): string {
  return String(message ?? '')
    .replace(/[^\s@<>()"',;:]+@[^\s@<>()"',;:]+/g, '[adresse]')
    .replace(/\s+/g, ' ')
    .slice(0, 200);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getResendClient(): {
  client: Resend | null;
  fromEmail: string;
  toEmail: string;
  isConfigured: boolean;
  forceSimulation: boolean;
} {
  const config = getEmailConfig();
  const isConfigured = config.missing.length === 0;

  return {
    client: config.apiKey ? new Resend(config.apiKey) : null,
    fromEmail: config.from,
    toEmail: config.notificationTo,
    isConfigured,
    forceSimulation: config.forceSimulation,
  };
}

/**
 * Sendet eine Mail über Resend. Erfolg wird nur gemeldet, wenn Resend die Mail angenommen hat
 * oder Simulation ausdrücklich erlaubt ist (lokal/E2E, nie auf Vercel Production).
 * Logs enthalten nur IDs und Fehlercodes, keine Adressen oder Inhalte.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  from,
  tags,
  idempotencyKey,
}: SendEmailOptions): Promise<EmailDispatchResult> {
  const config = getResendClient();
  const sender = from || config.fromEmail;

  if (config.forceSimulation || !config.client || !sender) {
    if (emailSimulationAllowed()) {
      const id = `sim_${randomUUID()}`;
      console.info(`[email] simuliert (${id})`);
      return { success: true, id, simulated: true };
    }

    console.error('[email] nicht versendet: Versand nicht konfiguriert');
    return { success: false, error: 'not_configured', simulated: false };
  }

  const payload = {
    from: sender,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    ...(text ? { text } : {}),
    replyTo: replyTo || undefined,
    tags: tags?.length ? tags : undefined,
  };

  try {
    for (let attempt = 1; ; attempt++) {
      // Das SDK wirft nicht: Netzfehler und Zeitüberschreitung kommen als application_error zurück.
      const { data, error } = await config.client.emails.send(payload, {
        signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
        ...(idempotencyKey ? { idempotencyKey } : {}),
      });

      if (!error) {
        console.info(`[email] gesendet (${data?.id})`);
        return { success: true, id: data?.id, simulated: false };
      }

      // Gleicher Key, anderer Inhalt: Bei unseren Keys (Hash der Angaben) unterscheidet sich nur
      // z. B. die Eingangszeit. Die Mail wurde also schon zugestellt.
      if (idempotencyKey && error.name === 'invalid_idempotent_request') {
        console.info('[email] bereits versendet (Idempotency-Key bekannt)');
        return { success: true, duplicate: true, simulated: false };
      }

      if (attempt === 1 && idempotencyKey && TRANSIENT_ERRORS.has(error.name)) {
        console.warn(`[email] Resend-Fehler: ${error.name} (HTTP ${error.statusCode ?? '–'}), neuer Versuch`);
        await wait(RETRY_DELAY_MS);
        continue;
      }

      const isConfigError = CONFIG_ERRORS.has(error.name) || (error.name === 'validation_error' && error.statusCode === 403);
      console.error(
        `[email] Resend-Fehler: ${error.name} (HTTP ${error.statusCode ?? '–'})${isConfigError ? ' – Konfiguration prüfen' : ''}: ${redactErrorMessage(error.message)}`
      );
      return { success: false, error: isConfigError ? 'not_configured' : error.name || 'send_failed', simulated: false };
    }
  } catch (err: unknown) {
    console.error(`[email] Versand fehlgeschlagen: ${err instanceof Error ? err.name : 'unknown'}`);
    return { success: false, error: 'send_failed', simulated: false };
  }
}

/** sendEmail fängt Resend-Fehler selbst ab; das hier fängt auch unerwartete Würfe (z. B. beim Rendern). */
async function settle(mail: () => Promise<EmailDispatchResult>): Promise<EmailDispatchResult> {
  try {
    return await mail();
  } catch {
    return { success: false, error: 'send_failed' };
  }
}

/** Resend erlaubt Schlüssel bis 256 Zeichen; der Hash bindet den Schlüssel an Empfänger und Inhalt. */
export function idempotencyFor(
  options: DispatchOptions | undefined,
  kind: string,
  mail: { to: string | string[]; subject: string; html: string; text?: string }
): string | undefined {
  if (!options?.idempotencyKey) return undefined;
  const digest = createHash('sha256')
    .update(JSON.stringify([mail.to, mail.subject, mail.html, mail.text ?? '']))
    .digest('hex')
    .slice(0, 16);
  return `${options.idempotencyKey.slice(0, 200)}:${kind}:${digest}`;
}

/** Schlüssel aus einem eigenen, stabilen Fingerabdruck statt aus dem gerenderten Mail-Inhalt. */
export function stableIdempotencyKey(
  options: DispatchOptions | undefined,
  kind: string,
  fingerprint: unknown
): string | undefined {
  if (!options?.idempotencyKey) return undefined;
  const digest = createHash('sha256').update(JSON.stringify(fingerprint)).digest('hex').slice(0, 16);
  return `${options.idempotencyKey.slice(0, 200)}:${kind}:${digest}`;
}

/**
 * Nummer plus alle Angaben einer Bewerbung (applicationContent), ohne Eingangszeit, Ausfülldauer
 * und Spam-Markierung: Diese ändern sich bei jeder Wiederholung, die Bewerbung selbst nicht.
 */
export function applicationFingerprint(app: ReferencedApplication): unknown {
  return [app.reference, ...applicationContent(app)];
}

const NO_RECIPIENT: EmailDispatchResult = { success: false, error: 'no_recipient' };
/** Keine Eingangsbestätigung bei Spamverdacht: Die Adresse ist ungeprüft und könnte fremd sein. */
const SKIPPED_SPAM: EmailDispatchResult = { success: false, error: 'skipped_suspected_spam' };
/** Keine Eingangsbestätigung, solange das Team die Bewerbung nicht hat (sonst „angekommen“, obwohl nicht). */
const SKIPPED_TEAM_FAILED: EmailDispatchResult = { success: false, error: 'skipped_team_failed' };

/** Resend-Tag-Wert: nur [A-Za-z0-9_-], höchstens 256 Zeichen. */
function tagValue(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 256) || 'none';
}

/**
 * Bewerbung: Benachrichtigung ans Team (Reply-To = Bewerber-E-Mail, falls vorhanden), danach die
 * Eingangsbestätigung, aber nur wenn die Team-Mail angenommen wurde, eine E-Mail angegeben ist und
 * kein Spamverdacht besteht (die Adresse ist ungeprüft). Erfolg = Team-Mail angenommen.
 */
export async function dispatchApplicationEmails(
  app: ReferencedApplication,
  options?: DispatchOptions
): Promise<DualDispatchResult> {
  const config = getResendClient();
  const team = renderApplicationTeamEmail(app);
  const teamMail = { to: config.toEmail, ...team };
  const tags: EmailTag[] = [
    { name: 'job', value: tagValue(app.job.id) },
    { name: 'channel', value: tagValue(app.channel) },
  ];

  const confirmation = app.email && !app.suspectedSpam ? renderApplicationConfirmationEmail(app) : null;
  const confirmationMail = confirmation && app.email ? { to: app.email, ...confirmation } : null;
  const fingerprint = applicationFingerprint(app);

  const teamNotification = await settle(() =>
    sendEmail({
      ...teamMail,
      replyTo: app.email || undefined,
      tags: [
        { name: 'category', value: 'application_team' },
        ...tags,
        ...(app.suspectedSpam ? [{ name: 'spam', value: 'suspected' }] : []),
      ],
      idempotencyKey: stableIdempotencyKey(options, 'team', [teamMail.to, fingerprint]),
    })
  );

  let userConfirmation: EmailDispatchResult;
  if (!confirmationMail) {
    userConfirmation = app.email && app.suspectedSpam ? { ...SKIPPED_SPAM } : { ...NO_RECIPIENT };
  } else if (!teamNotification.success) {
    userConfirmation = { ...SKIPPED_TEAM_FAILED };
  } else {
    userConfirmation = await settle(() =>
      sendEmail({
        ...confirmationMail,
        replyTo: config.toEmail,
        tags: [{ name: 'category', value: 'application_confirmation' }, ...tags],
        idempotencyKey: stableIdempotencyKey(options, 'user', [confirmationMail.to, fingerprint]),
      })
    );
  }

  return {
    success: teamNotification.success,
    teamNotification,
    userConfirmation,
    simulated: Boolean(teamNotification.simulated || userConfirmation.simulated),
  };
}

/** Ergänzung zu einer Bewerbung: eine Mail ans Team mit der Bewerbungsnummer im Betreff. */
export async function dispatchApplicationFollowUpEmail(
  followUp: NormalizedFollowUp,
  options?: DispatchOptions
): Promise<EmailDispatchResult> {
  const config = getResendClient();
  const mail = { to: config.toEmail, ...renderApplicationFollowUpEmail(followUp) };
  try {
    return await sendEmail({
      ...mail,
      tags: [{ name: 'category', value: 'application_follow_up' }],
      idempotencyKey: idempotencyFor(options, 'follow-up', mail),
    });
  } catch {
    return { success: false, error: 'send_failed' };
  }
}
