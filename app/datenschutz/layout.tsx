import type { Metadata } from 'next';

const appUrl = process.env.APP_URL || 'https://karriere.bad-energie.de';
const logoUrl = `${appUrl}/images/bad-energie-lahn-dill-logo.webp`;

export const metadata: Metadata = {
  title: 'Datenschutzerklärung und Bewerberdaten | Bad und Energie Wetzlar',
  description:
    'Datenschutzerklärung nach DSGVO und Paragraph 26 BDSG für Bewerber und Besucher bei Bad und Energie GmbH Lahn Dill in Wetzlar.',
  alternates: {
    canonical: `${appUrl}/datenschutz`,
  },
  openGraph: {
    title: 'Datenschutzerklärung und Bewerberdaten | Bad und Energie Wetzlar',
    description:
      'Datenschutzerklärung nach DSGVO und Paragraph 26 BDSG für Bewerber und Besucher bei Bad und Energie GmbH Lahn Dill in Wetzlar.',
    url: `${appUrl}/datenschutz`,
    siteName: 'Bad und Energie GmbH Lahn Dill',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: logoUrl,
        width: 1200,
        height: 630,
        alt: 'Datenschutzerklärung der Bad und Energie GmbH Lahn Dill in Wetzlar',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Datenschutzerklärung und Bewerberdaten | Bad und Energie Wetzlar',
    description: 'Datenschutzerklärung nach DSGVO und Paragraph 26 BDSG für Bewerber.',
    images: [logoUrl],
  },
};

const datenschutzSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${appUrl}/datenschutz/#webpage`,
      url: `${appUrl}/datenschutz`,
      name: 'Datenschutzerklärung und Bewerberdaten | Bad und Energie Wetzlar',
      description:
        'Rechtliche Aufklärung über Art Umfang und Zweck der Erhebung und Verwendung personenbezogener Daten sowie Bewerberdaten nach Paragraph 26 BDSG.',
      isPartOf: {
        '@id': `${appUrl}/#website`,
      },
      breadcrumb: {
        '@id': `${appUrl}/datenschutz/#breadcrumb`,
      },
      inLanguage: 'de-DE',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${appUrl}/datenschutz/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Karriereportal',
          item: appUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Datenschutz',
          item: `${appUrl}/datenschutz`,
        },
      ],
    },
  ],
};

export default function DatenschutzLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datenschutzSchema) }}
      />
      {children}
    </>
  );
}
