import { emailLayout } from './layout';
import { SITE_CONFIG } from '@/lib/seo/site-config';

export interface ContactLeadData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  sourceTag?: string;
  submittedAt?: string;
}

export function renderContactLeadNotificationEmail(lead: ContactLeadData): {
  subject: string;
  html: string;
} {
  const timestamp =
    lead.submittedAt ||
    new Date().toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const subjectTopic = lead.subject || 'Allgemeine Anfrage oder Schnellbewerbung';
  const emailSubject = `Neue Kontaktanfrage eingegangen: ${lead.name} (${subjectTopic})`;
  const preheader = `Neue Anfrage von ${lead.name} (${lead.email}) über das Karriereportal Wetzlar.`;

  const phoneClean = lead.phone ? lead.phone.replace(/[^0-9+]/g, '') : '';
  const whatsappUrl = phoneClean
    ? `https://wa.me/${phoneClean.startsWith('0') ? '49' + phoneClean.slice(1) : phoneClean.replace('+', '')}`
    : '';

  const contentHtml = `
    <!-- Status Badge -->
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #eff6ff; color: #0284c7; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; border: 1px solid #bfdbfe;">
        Posteingang Karriereportal Wetzlar
      </span>
    </div>

    <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #0A1E3A; letter-spacing: -0.02em;">
      Neue Kontaktanfrage erhalten
    </h2>
    <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px;">
      Über das Webformular auf <strong style="color: #0A1E3A;">${SITE_CONFIG.baseUrl}</strong> ist eine neue Nachricht eingegangen.
    </p>

    <!-- Structured Data Table -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background-color: #f8fafc; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; width: 140px; font-weight: 700; font-size: 13px; color: #64748b; letter-spacing: 0.03em;">
          Name
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 15px; color: #0A1E3A;">
          ${lead.name}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; letter-spacing: 0.03em;">
          E Mail
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
          <a href="mailto:${lead.email}" style="color: #0284C7; font-weight: 600; text-decoration: none;">
            ${lead.email}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; letter-spacing: 0.03em;">
          Telefon
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
          ${
            lead.phone
              ? `<a href="tel:${phoneClean}" style="color: #0284C7; font-weight: 600; text-decoration: none;">${lead.phone}</a>`
              : '<span style="color: #94a3b8; font-style: italic;">Nicht angegeben</span>'
          }
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; letter-spacing: 0.03em;">
          Betreff
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 600;">
          ${subjectTopic}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; font-weight: 700; font-size: 13px; color: #64748b; letter-spacing: 0.03em;">
          Eingangszeit
        </td>
        <td style="padding: 14px 18px; font-size: 13px; color: #64748b;">
          ${timestamp} Uhr · Quelle: <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #334155;">${lead.sourceTag || 'kontakt formular'}</code>
        </td>
      </tr>
    </table>

    <!-- Message Content Box -->
    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 28px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 0.04em; margin-bottom: 8px;">
        Nachricht oder Qualifikation
      </div>
      <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #0f172a;">
        ${lead.message || 'Keine zusätzliche Nachricht hinterlegt.'}
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="left">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right: 12px; padding-bottom: 10px;">
                <a href="mailto:${lead.email}?subject=Ihre Anfrage bei Bad und Energie GmbH Lahn Dill" class="btn-accent" style="display: inline-block; padding: 13px 22px; background-color: #0284C7; color: #ffffff !important; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Direkt per E Mail antworten
                </a>
              </td>
              ${
                lead.phone
                  ? `<td style="padding-right: 12px; padding-bottom: 10px;">
                      <a href="tel:${phoneClean}" class="btn-primary" style="display: inline-block; padding: 13px 22px; background-color: #0A1E3A; color: #ffffff !important; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
                        Anrufen
                      </a>
                    </td>`
                  : ''
              }
              ${
                whatsappUrl
                  ? `<td style="padding-bottom: 10px;">
                      <a href="${whatsappUrl}" class="btn-emerald" style="display: inline-block; padding: 13px 22px; background-color: #059669; color: #ffffff !important; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
                        WhatsApp öffnen
                      </a>
                    </td>`
                  : ''
              }
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: emailSubject,
    html: emailLayout({
      title: emailSubject,
      preheader,
      badge: 'Team Benachrichtigung · Wetzlar',
      contentHtml,
    }),
  };
}
