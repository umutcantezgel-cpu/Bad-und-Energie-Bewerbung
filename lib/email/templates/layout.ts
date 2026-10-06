import { SITE_CONFIG } from '@/lib/seo/site-config';

export interface EmailLayoutOptions {
  title: string;
  preheader: string;
  badge?: string;
  contentHtml: string;
}

/**
 * High-End Apple-Design Email Layout
 * Fully responsive, table-based, maximum client compatibility (Gmail, Apple Mail, Outlook).
 * 100% Zero-Hyphen Standard in visible copy.
 */
export function emailLayout({
  title,
  preheader,
  badge = 'Innungsmeisterbetrieb seit 1926 · Wetzlar',
  contentHtml,
}: EmailLayoutOptions): string {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f8fafc !important;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      border-collapse: collapse !important;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .email-container {
      max-width: 600px !important;
      width: 100% !important;
      margin: 0 auto !important;
    }
    .content-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(10, 30, 58, 0.04);
    }
    .badge-pill {
      display: inline-block;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border-radius: 9999px;
      background-color: rgba(255, 255, 255, 0.14);
      color: #93c5fd;
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    .btn-primary {
      display: inline-block;
      padding: 13px 26px;
      background-color: #0A1E3A;
      color: #ffffff !important;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: -0.01em;
    }
    .btn-accent {
      display: inline-block;
      padding: 13px 26px;
      background-color: #0284C7;
      color: #ffffff !important;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    .btn-emerald {
      display: inline-block;
      padding: 13px 26px;
      background-color: #059669;
      color: #ffffff !important;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 10px !important;
      }
      .content-padding {
        padding: 24px 20px !important;
      }
      .header-padding {
        padding: 26px 20px !important;
      }
      .footer-padding {
        padding: 24px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc;">
  <!-- Preheader preview text for email clients -->
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 12px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 600px; width: 100%;">
          <tr>
            <td>
              <div class="content-card">
                <!-- Brand Header -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td class="header-padding" style="background-color: #0A1E3A; padding: 32px 36px; text-align: left;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td>
                            <div class="badge-pill" style="margin-bottom: 12px;">
                              ${badge}
                            </div>
                            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.2;">
                              Bad und Energie
                            </h1>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: -0.01em;">
                              GmbH Lahn Dill · Wetzlar
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Main Email Content -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td class="content-padding" style="padding: 36px 36px; background-color: #ffffff; color: #0f172a; font-size: 15px; line-height: 1.65;">
                      ${contentHtml}
                    </td>
                  </tr>
                </table>

                <!-- Footer with Imprint & Regulatory Details -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td class="footer-padding" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 28px 36px; text-align: left; font-size: 12px; line-height: 1.6; color: #64748b;">
                      <p style="margin: 0 0 10px 0; font-weight: 700; color: #334155; font-size: 13px;">
                        ${SITE_CONFIG.companyName}
                      </p>
                      <p style="margin: 0 0 8px 0;">
                        ${SITE_CONFIG.headquarters.streetAddress} · ${SITE_CONFIG.headquarters.postalCode} ${SITE_CONFIG.headquarters.addressLocality}
                      </p>
                      <p style="margin: 0 0 8px 0;">
                        Geschäftsführer: ${SITE_CONFIG.founder.name} · ${SITE_CONFIG.handelsregister}
                      </p>
                      <p style="margin: 0 0 12px 0;">
                        Telefon: <a href="tel:${SITE_CONFIG.contact.telephoneLink}" style="color: #0284C7; text-decoration: none; font-weight: 600;">${SITE_CONFIG.contact.telephone}</a> · 
                        E Mail: <a href="mailto:${SITE_CONFIG.contact.email}" style="color: #0284C7; text-decoration: none; font-weight: 600;">${SITE_CONFIG.contact.email}</a> · 
                        Web: <a href="${SITE_CONFIG.baseUrl}" style="color: #0284C7; text-decoration: none; font-weight: 600;">karriere.bad-energie.de</a>
                      </p>
                      <div style="padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                        ${SITE_CONFIG.innung} · ${SITE_CONFIG.hwk} · USt IdNr. ${SITE_CONFIG.vatID}<br>
                        © ${currentYear} Bad und Energie GmbH Lahn Dill. Alle Rechte vorbehalten.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
