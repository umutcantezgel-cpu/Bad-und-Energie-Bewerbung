import { emailLayout } from './layout';
import { SITE_CONFIG } from '@/lib/seo/site-config';

export interface ContactUserConfirmationData {
  name: string;
  email: string;
  subject?: string;
}

export function renderContactUserConfirmationEmail(data: ContactUserConfirmationData): {
  subject: string;
  html: string;
} {
  const emailSubject = `Vielen Dank für Ihre Nachricht an Bad und Energie GmbH Lahn Dill`;
  const preheader = `Wir haben Ihre Nachricht erhalten und melden uns verlässlich innerhalb von 24 Stunden.`;

  const contentHtml = `
    <!-- Confirmation Banner -->
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #ecfdf5; color: #059669; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; border: 1px solid #a7f3d0;">
        Eingangsbestätigung
      </span>
    </div>

    <h2 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 800; color: #0A1E3A; letter-spacing: -0.02em;">
      Hallo ${data.name},
    </h2>

    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.65;">
      vielen Dank für Ihr Vertrauen und Ihre Nachricht an die <strong>Bad und Energie GmbH Lahn Dill</strong>.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 15px; color: #334155; line-height: 1.65;">
      Ihre Anfrage ist sicher in unserem System eingegangen. Wir prüfen Ihre Angaben sorgfältig und Geschäftsführer Diplomingenieur Sabri Demir oder unser Team melden sich verlässlich innerhalb der nächsten <strong>24 Stunden</strong> persönlich bei Ihnen.
    </p>

    <!-- Discretion & Trust Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; margin-bottom: 28px;">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="font-weight: 700; font-size: 13px; color: #0A1E3A; letter-spacing: 0.03em;">
          Unser Versprechen an Sie
        </span>
      </div>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #475569;">
            <strong style="color: #0A1E3A;">100% Diskretion:</strong> Befinden Sie sich aktuell in ungekündigter Festanstellung? Ihre Kontaktaufnahme behandeln wir mit absolutem Stillschweigen.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #475569;">
            <strong style="color: #0A1E3A;">Keine Bürokratie:</strong> Bei uns sprechen Sie auf Augenhöhe mit Praktikern und Meistern, nicht mit anonymen Vermittlern.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #475569;">
            <strong style="color: #0A1E3A;">Verlässlichkeit:</strong> Wir halten Termine und Zusagen verbindlich ein.
          </td>
        </tr>
      </table>
    </div>

    <!-- Direct Contact Options -->
    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; padding: 20px; margin-bottom: 28px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0369a1; letter-spacing: 0.03em;">
        Dringende Rückfrage oder sofortiges Kennenlernen?
      </p>
      <p style="margin: 0 0 14px 0; font-size: 14px; color: #0c4a6e;">
        Sie erreichen uns montags bis donnerstags ab 07:00 Uhr sowie freitags bis 13:30 Uhr direkt telefonisch oder via WhatsApp:
      </p>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right: 12px;">
            <a href="tel:${SITE_CONFIG.contact.telephoneLink}" style="display: inline-block; padding: 10px 18px; background-color: #0284C7; color: #ffffff !important; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none;">
              Telefon: ${SITE_CONFIG.contact.telephone}
            </a>
          </td>
          <td>
            <a href="https://wa.me/49644142956" style="display: inline-block; padding: 10px 18px; background-color: #059669; color: #ffffff !important; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none;">
              WhatsApp schreiben
            </a>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 4px 0; font-size: 14px; color: #475569;">
      Herzliche Grüße aus Wetzlar,
    </p>
    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0A1E3A;">
      ${SITE_CONFIG.founder.name}
    </p>
    <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">
      Geschäftsführer · ${SITE_CONFIG.companyName}
    </p>
  `;

  return {
    subject: emailSubject,
    html: emailLayout({
      title: emailSubject,
      preheader,
      badge: 'Eingangsbestätigung · Wetzlar',
      contentHtml,
    }),
  };
}
