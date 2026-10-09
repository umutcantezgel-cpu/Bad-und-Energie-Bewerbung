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

export function getResendClient(): {
  client: Resend | null;
  fromEmail?: string;
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

  try {
    const { data, error } = await config.client.emails.send(
      {
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(text ? { text } : {}),
        replyTo: replyTo || undefined,
        tags: tags?.length ? tags : undefined,
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    if (error) {
      // Gleicher Key, anderer Inhalt: Bei unseren Keys (Hash der Angaben) unterscheidet sich nur
      // z. B. die Eingangszeit. Die Mail wurde also schon zugestellt.
      if (idempotencyKey && error.name === 'invalid_idempotent_request') {
        console.info('[email] bereits versendet (Idempotency-Key bekannt)');
        return { success: true, duplicate: true, simulated: false };
      }
      console.error(`[email] Resend-Fehler: ${error.name} (HTTP ${error.statusCode ?? '–'})`);
      return { success: false, error: error.name || 'send_failed', simulated: false };
    }

    console.info(`[email] gesendet (${data?.id})`);
    return { success: true, id: data?.id, simulated: false };
  } catch (err: unknown) {
    console.error(`[email] Versand fehlgeschlagen: ${err instanceof Error ? err.name : 'unknown'}`);
    return { success: false, error: 'send_failed', simulated: false };
  }
}

function settle(result: PromiseSettledResult<EmailDispatchResult>): EmailDispatchResult {
  return result.status === 'fulfilled' ? result.value : { success: false, error: 'send_failed' };
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

/** Resend-Tag-Wert: nur [A-Za-z0-9_-], höchstens 256 Zeichen. */
function tagValue(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 256) || 'none';
}

/**
 * Bewerbung: Benachrichtigung ans Team (Reply-To = Bewerber-E-Mail, falls vorhanden) plus
 * Eingangsbestätigung, aber nur wenn eine E-Mail angegeben wurde und kein Spamverdacht besteht
 * (die Adresse ist ungeprüft). Erfolg = Team-Mail angenommen.
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

  const [teamRes, userRes] = await Promise.allSettled([
    sendEmail({
      ...teamMail,
      replyTo: app.email || undefined,
      tags: [
        { name: 'category', value: 'application_team' },
        ...tags,
        ...(app.suspectedSpam ? [{ name: 'spam', value: 'suspected' }] : []),
      ],
      idempotencyKey: stableIdempotencyKey(options, 'team', [teamMail.to, fingerprint]),
    }),
    confirmationMail
      ? sendEmail({
          ...confirmationMail,
          replyTo: config.toEmail,
          tags: [{ name: 'category', value: 'application_confirmation' }, ...tags],
          idempotencyKey: stableIdempotencyKey(options, 'user', [confirmationMail.to, fingerprint]),
        })
      : Promise.resolve(app.email && app.suspectedSpam ? { ...SKIPPED_SPAM } : { ...NO_RECIPIENT }),
  ]);

  const teamNotification = settle(teamRes);
  const userConfirmation = settle(userRes);

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
