import { emailLayout } from './layout';
import { SITE_CONFIG } from '@/lib/seo/site-config';

export interface ApplicationUserConfirmationData {
  fullName: string;
  email: string;
  position: string;
}

export function renderApplicationUserConfirmationEmail(data: ApplicationUserConfirmationData): {
  subject: string;
  html: string;
} {
  const emailSubject = `Bewerbungseingang bestätigt: Willkommen bei Bad und Energie GmbH Lahn Dill`;
  const preheader = `Ihre Bewerbung als ${data.position} ist erfolgreich eingegangen. Wir melden uns binnen 24 Stunden.`;

  const contentHtml = `
    <!-- Top Confirmation Pill -->
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: #ecfdf5; color: #059669; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #a7f3d0;">
        Bewerbung erfolgreich eingegangen
      </span>
    </div>

    <h2 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 800; color: #0A1E3A; letter-spacing: -0.02em;">
      Hallo ${data.fullName},
    </h2>

    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.65;">
      wir freuen uns sehr über Ihr Interesse an einer handwerklichen Zukunft bei der <strong>Bad und Energie GmbH Lahn Dill</strong> als <strong>${data.position}</strong>.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 15px; color: #334155; line-height: 1.65;">
      Ihr digitales Bewerbungsdossier ist sicher in unserem Meisterbüro in Wetzlar eingegangen. Bei uns gibt es keine langwierigen Personalabteilungen: Geschäftsführer Diplomingenieur Sabri Demir prüft Ihre Angaben persönlich.
    </p>

    <!-- Transparent 3-Step Process Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 28px;">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 16px;">
        Wie geht es jetzt weiter? Unser fairer 3 Schritte Prozess
      </div>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="vertical-align: top; width: 36px; padding-bottom: 18px;">
            <div style="width: 26px; height: 26px; border-radius: 8px; background-color: #0A1E3A; color: #ffffff; text-align: center; line-height: 26px; font-size: 12px; font-weight: 800;">
              1
            </div>
          </td>
          <td style="vertical-align: top; padding-bottom: 18px;">
            <div style="font-weight: 700; font-size: 14px; color: #0A1E3A; margin-bottom: 2px;">
              Persönliche Sichtung binnen 24 Stunden
            </div>
            <div style="font-size: 13px; color: #475569; line-height: 1.5;">
              Meister Demir sichtet Ihre Eckdaten. Wir melden uns verlässlich telefonisch oder per WhatsApp.
            </div>
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; width: 36px; padding-bottom: 18px;">
            <div style="width: 26px; height: 26px; border-radius: 8px; background-color: #0284C7; color: #ffffff; text-align: center; line-height: 26px; font-size: 12px; font-weight: 800;">
              2
            </div>
          </td>
          <td style="vertical-align: top; padding-bottom: 18px;">
            <div style="font-weight: 700; font-size: 14px; color: #0A1E3A; margin-bottom: 2px;">
              10 Minuten Telefonat auf Augenhöhe
            </div>
            <div style="font-size: 13px; color: #475569; line-height: 1.5;">
              Ein kurzer lockerer Austausch zu Rahmenbedingungen, Einsatzgebieten im Lahn Dill Kreis und Ihren Wünschen.
            </div>
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; width: 36px;">
            <div style="width: 26px; height: 26px; border-radius: 8px; background-color: #059669; color: #ffffff; text-align: center; line-height: 26px; font-size: 12px; font-weight: 800;">
              3
            </div>
          </td>
          <td style="vertical-align: top;">
            <div style="font-weight: 700; font-size: 14px; color: #0A1E3A; margin-bottom: 2px;">
              Werkstattkaffee & Kennenlernen in Wetzlar
            </div>
            <div style="font-size: 13px; color: #475569; line-height: 1.5;">
              Besuchen Sie unsere Werkstatt in der Siegmund Hiepe Straße. Lernen Sie die Kollegen, Fahrzeuge und Werkzeuge kennen.
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Benefits Highlight Box -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px; margin-bottom: 28px;">
      <div style="font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 6px;">
        Das erwartet Sie bei uns:
      </div>
      <p style="margin: 0; font-size: 13px; color: #14532d; line-height: 1.6;">
        Keine Fernmontagen (maximal 35 km Radius um Wetzlar), freitags ab 13:30 Uhr pünktlich ins Wochenende, vollausgestattete Premium Servicefahrzeuge und echtes Teamdenken seit 1926.
      </p>
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
      badge: 'Bewerbungseingang · Wetzlar',
      contentHtml,
    }),
  };
}
