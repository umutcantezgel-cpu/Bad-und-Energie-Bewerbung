import { buildVCard } from '@/lib/apply/vcard';
import { COMPANY } from '@/lib/content/company';

// Statisch: Die Karte ändert sich nur mit den Stammdaten, also mit einem Deploy.
export const dynamic = 'force-static';

/**
 * Kontaktkarte für „Nummern speichern“ auf der Danke-Seite als echte Datei statt data:-Link: iPhone und Android
 * speichern eine Adresse mit Dateinamen zuverlässiger. App-Browser (Instagram & Co.) laden oft gar nichts herunter;
 * dort bleiben die Nummern im Text darüber der Rückfall. Nicht für Suchmaschinen.
 */
export function GET(): Response {
  const vcard = buildVCard({
    formattedName: COMPANY.shortName,
    organization: COMPANY.legalName,
    phone: COMPANY.phone.e164,
    whatsapp: COMPANY.whatsapp.e164,
    email: COMPANY.email,
    street: COMPANY.address.street,
    postalCode: COMPANY.address.postalCode,
    city: COMPANY.address.city,
    region: COMPANY.address.region,
    country: COMPANY.address.countryName,
    url: COMPANY.website,
  });
  return new Response(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bad-und-energie.vcf"',
      'X-Robots-Tag': 'noindex',
    },
  });
}
