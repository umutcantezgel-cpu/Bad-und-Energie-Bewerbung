import 'server-only';
import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import { getEmailConfig, emailSimulationAllowed } from '@/lib/env';
import {
  ContactLeadData,
  renderContactLeadNotificationEmail,
  renderContactUserConfirmationEmail,
  ApplicationLeadData,
  renderApplicationLeadNotificationEmail,
  renderApplicationUserConfirmationEmail,
} from './templates';

export interface EmailDispatchResult {
  success: boolean;
  id?: string;
  simulated?: boolean;
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
  replyTo?: string;
  from?: string;
  tags?: EmailTag[];
  /** Wird als `Idempotency-Key` an Resend durchgereicht (sichere Wiederholungen). */
  idempotencyKey?: string;
}

export interface DispatchOptions {
  /** Basis-Schlüssel, z. B. die Bewerbungsnummer; je Mail wird `:team` bzw. `:user` angehängt. */
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
        replyTo: replyTo || undefined,
        tags: tags?.length ? tags : undefined,
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    if (error) {
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

function idempotencyFor(options: DispatchOptions | undefined, suffix: 'team' | 'user') {
  return options?.idempotencyKey ? `${options.idempotencyKey}:${suffix}` : undefined;
}

const NO_RECIPIENT: EmailDispatchResult = { success: false, error: 'no_recipient' };

/** Kontaktanfrage: Benachrichtigung ans Team plus Eingangsbestätigung an den Absender. */
export async function dispatchContactRequest(
  data: ContactLeadData,
  options?: DispatchOptions
): Promise<DualDispatchResult> {
  const config = getResendClient();

  const leadMail = renderContactLeadNotificationEmail(data);
  const confirmationMail = renderContactUserConfirmationEmail({
    name: data.name,
    email: data.email,
    subject: data.subject,
  });

  const [teamRes, userRes] = await Promise.allSettled([
    sendEmail({
      to: config.toEmail,
      subject: leadMail.subject,
      html: leadMail.html,
      replyTo: data.email || undefined,
      tags: [{ name: 'category', value: 'contact_team' }],
      idempotencyKey: idempotencyFor(options, 'team'),
    }),
    data.email
      ? sendEmail({
          to: data.email,
          subject: confirmationMail.subject,
          html: confirmationMail.html,
          replyTo: config.toEmail,
          tags: [{ name: 'category', value: 'contact_confirmation' }],
          idempotencyKey: idempotencyFor(options, 'user'),
        })
      : Promise.resolve({ ...NO_RECIPIENT }),
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

/** Bewerbung: Dossier ans Team plus Eingangsbestätigung an die Bewerberin bzw. den Bewerber. */
export async function dispatchApplicationRequest(
  data: ApplicationLeadData,
  options?: DispatchOptions
): Promise<DualDispatchResult> {
  const config = getResendClient();

  const appMail = renderApplicationLeadNotificationEmail(data);
  const userConfMail = renderApplicationUserConfirmationEmail({
    fullName: data.fullName,
    email: data.email,
    position: data.position,
  });

  const [teamRes, userRes] = await Promise.allSettled([
    sendEmail({
      to: config.toEmail,
      subject: appMail.subject,
      html: appMail.html,
      replyTo: data.email || undefined,
      tags: [{ name: 'category', value: 'application_team' }],
      idempotencyKey: idempotencyFor(options, 'team'),
    }),
    data.email
      ? sendEmail({
          to: data.email,
          subject: userConfMail.subject,
          html: userConfMail.html,
          replyTo: config.toEmail,
          tags: [{ name: 'category', value: 'application_confirmation' }],
          idempotencyKey: idempotencyFor(options, 'user'),
        })
      : Promise.resolve({ ...NO_RECIPIENT }),
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
