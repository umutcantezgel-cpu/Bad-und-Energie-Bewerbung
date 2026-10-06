import type { Metadata } from 'next';

const appUrl = process.env.APP_URL || 'https://karriere.bad-energie.de';
const logoUrl = `${appUrl}/images/bad-energie-lahn-dill-logo.webp`;

export const metadata: Metadata = {
  title: 'Bewerbung & Dokumenten-Upload | SHK Karriereportal',
  description:
    'SHK Bewerbungsportal: 4-Schritte-Fragebogen, Express-Upload für Lebenslauf & PDF-Dossier. Schnell, diskret & unkompliziert bei Bad & Energie.',
  alternates: {
    canonical: `${appUrl}/bewerbung`,
  },
  openGraph: {
    title: 'Bewerbung & Dokumenten-Upload | SHK Karriereportal',
    description:
      'SHK Bewerbungsportal: 4-Schritte-Fragebogen, Express-Upload für Lebenslauf & PDF-Dossier. Schnell, diskret & unkompliziert bei Bad & Energie.',
    url: `${appUrl}/bewerbung`,
    siteName: 'Bad und Energie GmbH Lahn Dill',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: logoUrl,
        width: 1200,
        height: 630,
        alt: 'Bewerbung im SHK Karriereportal',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bewerbung & Dokumenten-Upload | SHK Karriereportal',
    description:
      'SHK Bewerbungsportal: 4-Schritte-Fragebogen, Express-Upload für Lebenslauf & PDF-Dossier. Schnell, diskret & unkompliziert bei Bad & Energie.',
    images: [logoUrl],
  },
};

const bewerbungSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${appUrl}/bewerbung/#webpage`,
      url: `${appUrl}/bewerbung`,
      name: 'Bewerbung Handwerk Wetzlar | In 60 Sekunden ohne Lebenslauf bei Bad und Energie',
      description:
        'Bewerbung ohne Lebenslauf in 60 Sekunden bei Bad und Energie GmbH Lahn Dill in Wetzlar für Anlagenmechaniker SHK und Kundendiensttechniker.',
      isPartOf: {
        '@id': `${appUrl}/#website`,
      },
      breadcrumb: {
        '@id': `${appUrl}/bewerbung/#breadcrumb`,
      },
      inLanguage: 'de-DE',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${appUrl}/bewerbung/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Karriereportal Wetzlar',
          item: appUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Bewerbung',
          item: `${appUrl}/bewerbung`,
        },
      ],
    },
  ],
};

export default function BewerbungLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bewerbungSchema) }}
      />
      {children}
    </>
  );
}
