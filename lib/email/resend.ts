import { Resend } from 'resend';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import {
  ContactLeadData,
  renderContactLeadNotificationEmail,
  ContactUserConfirmationData,
  renderContactUserConfirmationEmail,
  ApplicationLeadData,
  renderApplicationLeadNotificationEmail,
  ApplicationUserConfirmationData,
  renderApplicationUserConfirmationEmail,
} from './templates';

export interface EmailDispatchResult {
  success: boolean;
  id?: string;
  simulated?: boolean;
  error?: string;
}

export interface DualDispatchResult {
  success: boolean;
  teamNotification: EmailDispatchResult;
  userConfirmation: EmailDispatchResult;
  simulated: boolean;
}

/**
 * Resend Client Configuration Helper
 */
export function getResendClient(): {
  client: Resend | null;
  fromEmail: string;
  toEmail: string;
  isConfigured: boolean;
} {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const isConfigured = Boolean(
    apiKey &&
      apiKey !== 'MY_RESEND_API_KEY' &&
      !apiKey.startsWith('re_placeholder') &&
      apiKey.length > 5
  );

  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>';

  const toEmail =
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim() ||
    process.env.RESEND_TO_EMAIL?.trim() ||
    SITE_CONFIG.contact.email ||
    'info@bad-energie.de';

  const client = isConfigured && apiKey ? new Resend(apiKey) : null;

  return {
    client,
    fromEmail,
    toEmail,
    isConfigured,
  };
}

/**
 * Send a single transactional email via Resend with Graceful Simulation Fallback
 */
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  from,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
}): Promise<EmailDispatchResult> {
  const config = getResendClient();
  const sender = from || config.fromEmail;
  const recipients = Array.isArray(to) ? to : [to];

  if (!config.isConfigured || !config.client) {
    console.info(
      `[Resend Simulation Mode] E Mail an ${recipients.join(', ')} | Betreff: "${subject}"`
    );
    return {
      success: true,
      id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      simulated: true,
    };
  }

  try {
    const { data, error } = await config.client.emails.send({
      from: sender,
      to: recipients,
      subject,
      html,
      replyTo: replyTo || undefined,
    });

    if (error) {
      console.error('[Resend API Error]', error);
      return {
        success: false,
        error: error.message || 'Resend API returned an error',
        simulated: false,
      };
    }

    console.info(`[Resend Live Dispatch] Erfolgreich gesendet (${data?.id}) von "${sender}" an "${recipients.join(', ')}"`);

    return {
      success: true,
      id: data?.id,
      simulated: false,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown Resend dispatch error';
    console.error('[Resend Network Exception]', errorMessage);
    return {
      success: false,
      error: errorMessage,
      simulated: false,
    };
  }
}

/**
 * Dispatches both internal lead notification and user receipt confirmation for contact inquiries
 */
export async function dispatchContactRequest(
  data: ContactLeadData
): Promise<DualDispatchResult> {
  const config = getResendClient();

  const leadMail = renderContactLeadNotificationEmail(data);
  const confirmationMail = renderContactUserConfirmationEmail({
    name: data.name,
    email: data.email,
    subject: data.subject,
  });

  const [teamRes, userRes] = await Promise.allSettled([
    // 1. Team Notification to Meister Demir
    sendEmail({
      to: config.toEmail,
      subject: leadMail.subject,
      html: leadMail.html,
      replyTo: data.email,
    }),
    // 2. Receipt confirmation to the inquirer
    sendEmail({
      to: data.email,
      subject: confirmationMail.subject,
      html: confirmationMail.html,
      replyTo: config.toEmail,
    }),
  ]);

  const teamNotification: EmailDispatchResult =
    teamRes.status === 'fulfilled'
      ? teamRes.value
      : { success: false, error: String(teamRes.reason) };

  const userConfirmation: EmailDispatchResult =
    userRes.status === 'fulfilled'
      ? userRes.value
      : { success: false, error: String(userRes.reason) };

  const overallSuccess = teamNotification.success;

  return {
    success: overallSuccess,
    teamNotification,
    userConfirmation,
    simulated: Boolean(teamNotification.simulated || userConfirmation.simulated),
  };
}

/**
 * Dispatches both internal dossier notification and candidate receipt confirmation for applications
 */
export async function dispatchApplicationRequest(
  data: ApplicationLeadData
): Promise<DualDispatchResult> {
  const config = getResendClient();

  const appMail = renderApplicationLeadNotificationEmail(data);
  const userConfMail = renderApplicationUserConfirmationEmail({
    fullName: data.fullName,
    email: data.email,
    position: data.position,
  });

  const [teamRes, userRes] = await Promise.allSettled([
    // 1. Detailed candidate dossier to Meister Demir
    sendEmail({
      to: config.toEmail,
      subject: appMail.subject,
      html: appMail.html,
      replyTo: data.email,
    }),
    // 2. Step-by-step roadmap confirmation to the applicant
    sendEmail({
      to: data.email,
      subject: userConfMail.subject,
      html: userConfMail.html,
      replyTo: config.toEmail,
    }),
  ]);

  const teamNotification: EmailDispatchResult =
    teamRes.status === 'fulfilled'
      ? teamRes.value
      : { success: false, error: String(teamRes.reason) };

  const userConfirmation: EmailDispatchResult =
    userRes.status === 'fulfilled'
      ? userRes.value
      : { success: false, error: String(userRes.reason) };

  return {
    success: teamNotification.success,
    teamNotification,
    userConfirmation,
    simulated: Boolean(teamNotification.simulated || userConfirmation.simulated),
  };
}
