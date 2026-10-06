import { emailLayout } from './layout';
import { SITE_CONFIG } from '@/lib/seo/site-config';

export interface ApplicationLeadData {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  position: string;
  experience?: string;
  startDate?: string;
  salaryExpectation?: string;
  skills?: string[];
  notes?: string;
  contactPreference?: string;
  discretionGuaranteed?: boolean;
  submittedAt?: string;
}

export function renderApplicationLeadNotificationEmail(app: ApplicationLeadData): {
  subject: string;
  html: string;
} {
  const timestamp =
    app.submittedAt ||
    new Date().toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const emailSubject = `Neue Expressbewerbung: ${app.fullName} für ${app.position}`;
  const preheader = `Bewerbung von ${app.fullName} (${app.position}) für den Standort Wetzlar.`;

  const phoneClean = app.phone.replace(/[^0-9+]/g, '');
  const whatsappUrl = phoneClean
    ? `https://wa.me/${phoneClean.startsWith('0') ? '49' + phoneClean.slice(1) : phoneClean.replace('+', '')}`
    : '';

  const skillsList =
    app.skills && app.skills.length > 0
      ? app.skills
          .map(
            (s) =>
              `<span style="display: inline-block; background-color: #f1f5f9; color: #0A1E3A; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 6px; margin: 3px 4px 3px 0; border: 1px solid #cbd5e1;">${s}</span>`
          )
          .join('')
      : '<span style="color: #94a3b8; font-style: italic;">Keine spezifischen Fähigkeiten ausgewählt</span>';

  const contentHtml = `
    <!-- Top Alert Badge -->
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #fef2f2; color: #C51E1E; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #fecaca;">
        🔥 Neue Bewerbung · Hohe Priorität
      </span>
    </div>

    <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #0A1E3A; letter-spacing: -0.02em;">
      Bewerberdossier eingegangen
    </h2>
    <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px;">
      Ein neuer Fachhandwerker hat sich über das Karriereportal für das Team in Wetzlar beworben:
    </p>

    <!-- Structured Candidate Dossier Table -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background-color: #f8fafc; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; width: 160px; font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
          Kandidat
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 800; font-size: 16px; color: #0A1E3A;">
          ${app.fullName}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
          Angestrebte Stelle
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 14px; color: #0284C7;">
          ${app.position}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
          Telefonnummer
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
          <a href="tel:${phoneClean}" style="color: #0284C7; font-weight: 700; text-decoration: none;">${app.phone}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
          E Mail Adresse
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
          <a href="mailto:${app.email}" style="color: #0284C7; text-decoration: none; font-weight: 600;">${app.email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
          Wohnort
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
          ${app.location || 'Wetzlar und Umgebung'}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
          Berufserfahrung
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 600;">
          ${app.experience || 'Nicht spezifiziert'}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
          Frühester Starttermin
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
          ${app.startDate || 'Flexibel nach Absprache'}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
          Gehaltswunsch
        </td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #059669; font-weight: 700;">
          ${app.salaryExpectation || 'Nach Haustarif / Verhandlung'}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; font-weight: 700; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em;">
          Wunsch Kontaktweg
        </td>
        <td style="padding: 14px 18px; font-size: 13px; color: #1e293b;">
          Bevorzugt: <strong style="color: #0A1E3A;">${app.contactPreference || 'Telefon / WhatsApp'}</strong> · 
          Diskretion: <strong style="color: #059669;">${app.discretionGuaranteed ? 'Streng vertraulich (Ja)' : 'Standard'}</strong>
        </td>
      </tr>
    </table>

    <!-- Skills Box -->
    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px;">
        Erfasste Kompetenzen und Schwerpunkte
      </div>
      <div>
        ${skillsList}
      </div>
    </div>

    ${
      app.notes
        ? `<div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 28px;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px;">
              Zusätzliche Notizen des Bewerbers
            </div>
            <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #0f172a;">
              ${app.notes}
            </div>
          </div>`
        : ''
    }

    <!-- Action Buttons -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="left">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right: 12px; padding-bottom: 10px;">
                <a href="tel:${phoneClean}" class="btn-primary" style="display: inline-block; padding: 13px 22px; background-color: #0A1E3A; color: #ffffff !important; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Bewerber anrufen
                </a>
              </td>
              ${
                whatsappUrl
                  ? `<td style="padding-right: 12px; padding-bottom: 10px;">
                      <a href="${whatsappUrl}" class="btn-emerald" style="display: inline-block; padding: 13px 22px; background-color: #059669; color: #ffffff !important; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
                        Per WhatsApp kontaktieren
                      </a>
                    </td>`
                  : ''
              }
              <td style="padding-bottom: 10px;">
                <a href="mailto:${app.email}?subject=Ihre Bewerbung als ${encodeURIComponent(app.position)} bei Bad und Energie GmbH Lahn Dill" class="btn-accent" style="display: inline-block; padding: 13px 22px; background-color: #0284C7; color: #ffffff !important; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  E Mail schreiben
                </a>
              </td>
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
      badge: 'Recruiting Dossier · Wetzlar',
      contentHtml,
    }),
  };
}
