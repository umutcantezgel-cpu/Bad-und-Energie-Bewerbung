import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WebVitalsReporter } from '@/components/analytics/WebVitalsReporter';
import { LayoutClientWidgets } from '@/components/layout/LayoutClientWidgets';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  adjustFontFallback: true,
  preload: true,
});

const appUrl = process.env.APP_URL || 'https://karriere.bad-energie.de';
const logoUrl = `${appUrl}/images/bad-energie-lahn-dill-logo.webp`;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Jobs Wetzlar | Heizungsbauer & Monteure | Bad & Energie',
  description:
    'SHK Handwerker Jobs in Wetzlar: Top Vergütung, 30 Tage Urlaub, freitags ab 13:30 Uhr frei & Firmenwagen. Jetzt in 60 Sek. bewerben bei Bad & Energie!',
  keywords: [
    'Jobs Wetzlar',
    'Heizungsbauer Jobs Wetzlar',
    'SHK Jobs Wetzlar',
    'Monteur Jobs Wetzlar',
    'Handwerker Jobs Wetzlar',
    'Ausbildung Wetzlar 2026',
    'Bad und Energie Wetzlar',
    'Kundendiensttechniker Wetzlar',
  ],
  authors: [{ name: 'Bad und Energie GmbH Lahn Dill' }],
  creator: 'Diplomingenieur Sabri Demir',
  publisher: 'Bad und Energie GmbH Lahn Dill',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    title: 'Jobs Wetzlar | Heizungsbauer & Monteure | Bad & Energie',
    description:
      'SHK Handwerker Jobs in Wetzlar: Top Vergütung, 30 Tage Urlaub, freitags ab 13:30 Uhr frei & Firmenwagen. Jetzt in 60 Sek. bewerben bei Bad & Energie!',
    url: appUrl,
    siteName: 'Bad und Energie GmbH Lahn Dill',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: logoUrl,
        width: 1200,
        height: 630,
        alt: 'Bad und Energie GmbH Lahn Dill • Meisterbetrieb für SHK und Wärmepumpen Wetzlar',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs Wetzlar | Heizungsbauer & Monteure | Bad & Energie',
    description:
      'SHK Handwerker Jobs in Wetzlar: Top Vergütung, 30 Tage Urlaub, freitags ab 13:30 Uhr frei & Firmenwagen. Jetzt in 60 Sek. bewerben bei Bad & Energie!',
    images: [logoUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'DE-HE',
    'geo.placename': 'Wetzlar',
    'geo.position': '50.56499;8.49842',
    'ICBM': '50.56499, 8.49842',
  },
};

// Rich Structured Data (JSON-LD) for LocalBusiness, Brand & JobPostings (Google Jobs & GEO Local SEO)
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://bad-energie.de/#organization',
      name: 'Bad und Energie GmbH Lahn Dill',
      legalName: 'Bad und Energie GmbH Lahn Dill',
      url: 'https://bad-energie.de',
      logo: logoUrl,
      sameAs: ['https://bad-energie.de'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Siegmund-Hiepe-Str. 20',
        addressLocality: 'Wetzlar',
        postalCode: '35578',
        addressRegion: 'Hessen',
        addressCountry: 'DE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 50.56499,
        longitude: 8.49842,
      },
      founder: {
        '@id': 'https://karriere.bad-energie.de/#founder',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+49-6441-42956',
        contactType: 'recruiting',
        areaServed: 'DE',
        availableLanguage: ['German'],
      },
    },
    {
      '@type': 'Person',
      '@id': 'https://karriere.bad-energie.de/#founder',
      name: 'Diplomingenieur Sabri Demir',
      jobTitle: 'Geschäftsführer und Diplomingenieur',
      worksFor: {
        '@id': 'https://bad-energie.de/#organization',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://karriere.bad-energie.de/#website',
      url: appUrl,
      name: 'Bad und Energie GmbH Lahn Dill Karriere',
      description:
        'Offizielles Karriereportal der Bad und Energie GmbH Lahn Dill in Wetzlar.',
      publisher: {
        '@id': 'https://bad-energie.de/#organization',
      },
      isPartOf: {
        '@type': 'WebSite',
        url: 'https://bad-energie.de',
        name: 'Bad und Energie GmbH Lahn Dill',
      },
      inLanguage: 'de-DE',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${appUrl}/#stellen?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://karriere.bad-energie.de/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Karriereportal',
          item: appUrl,
        },
      ],
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://bad-energie.de/#localbusiness',
      name: 'Bad und Energie GmbH Lahn Dill',
      alternateName: ['Bad und Energie', 'Bad und Energie Wetzlar', 'Bad und Energie GmbH'],
      legalName: 'Bad und Energie GmbH Lahn Dill',
      parentOrganization: {
        '@id': 'https://bad-energie.de/#organization',
      },
      description:
        'Zertifizierter Fachbetrieb und Innungsmeisterbetrieb seit 1926 für Heiztechnik, regenerative Wärmepumpen, moderne Bäder und Haustechnik im Lahn Dill Kreis.',
      telephone: '+49-6441-42956',
      email: 'info@bad-energie.de',
      url: 'https://bad-energie.de',
      logo: logoUrl,
      image: logoUrl,
      hasMap: 'https://maps.google.com/?q=Bad+und+Energie+GmbH+Lahn+Dill+Wetzlar',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Siegmund-Hiepe-Str. 20',
        addressLocality: 'Wetzlar',
        postalCode: '35578',
        addressRegion: 'Hessen',
        addressCountry: 'DE',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 50.56499,
        longitude: 8.49842,
      },
      areaServed: [
        {
          '@type': 'GeoCircle',
          name: 'Einsatzgebiet Wetzlar (Firmensitz und Kernzone)',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 50.5583,
            longitude: 8.5011,
          },
          geoRadius: 15000,
          description:
            'Kern Einsatzgebiet für Sanitär Heizung und Klimatechnik sowie Badsanierungen in Wetzlar und den Stadtteilen Hermannstein, Nauborn, Garbenheim, Steindorf, Dutenhofen und Münchholzhausen.',
        },
        {
          '@type': 'GeoCircle',
          name: 'Einsatzgebiet Gießen und Umland',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 50.5872,
            longitude: 8.6755,
          },
          geoRadius: 20000,
          description:
            'Regionales Servicegebiet für Wärmepumpen Installationen, Haustechnik und Kundendienst im Raum Gießen, Wettenberg, Heuchelheim, Linden, Pohlheim und Biebertal.',
        },
        {
          '@type': 'GeoCircle',
          name: 'Servicegebiet Lahn Dill Kreis',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 50.6500,
            longitude: 8.4000,
          },
          geoRadius: 35000,
          description:
            'Meisterbetrieb Kundendienst und Anlagenbau im gesamten Lahn Dill Kreis: Aßlar, Solms, Braunfels, Ehringshausen, Hüttenberg, Lahnau, Herborn, Dillenburg und Schöffengrund. Maximal 35 km Einsatzradius, keine Montage Fernreisen.',
        },
      ],
      founder: {
        '@type': 'Person',
        name: 'Diplomingenieur Sabri Demir',
      },
      foundingDate: '1926',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          opens: '07:00',
          closes: '16:45',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Friday',
          opens: '07:00',
          closes: '13:30',
        },
      ],
    },
    {
      '@type': 'Brand',
      '@id': 'https://bad-energie.de/#brand',
      name: 'Bad und Energie GmbH Lahn Dill',
      logo: logoUrl,
      url: 'https://bad-energie.de',
      slogan: '100 Jahre Meisterbetrieb (1926–2026) für SHK, Wärmepumpen und moderne Badarchitektur in Wetzlar',
    },
    {
      '@type': 'JobPosting',
      '@id': 'https://karriere.bad-energie.de/#job-anlagenmechaniker',
      title: 'Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d)',
      description:
        'Als Anlagenmechaniker SHK bei der Bad & Energie GmbH montierst und modernisierst Du regenerative Wärmepumpensysteme (Buderus, Bosch, NIBE, Alpha Innotec, Viessmann) und exklusive Bäder in Wetzlar und Umgebung. Profitiere von 30 Tagen Urlaub, freitags ab 13:30 Uhr Wochenende, eigenem Hilti Werkzeug und überdurchschnittlicher Vergütung ohne Bereitschaftszwang.',
      identifier: {
        '@type': 'PropertyValue',
        name: 'Bad & Energie GmbH',
        value: 'SHK-WP-2026-01',
      },
      datePosted: '2026-03-01',
      validThrough: '2027-10-06T00:00:00',
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Bad & Energie GmbH',
        sameAs: ['https://bad-energie.de'],
        logo: logoUrl,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Siegmund-Hiepe-Str. 20',
          addressLocality: 'Wetzlar',
          postalCode: '35578',
          addressRegion: 'Hessen',
          addressCountry: 'DE',
        },
      },
    },
    {
      '@type': 'JobPosting',
      '@id': 'https://karriere.bad-energie.de/#job-kundendienst',
      title: 'Kundendiensttechniker SHK / Servicemonteur (m/w/d)',
      description:
        'Wartung, Inbetriebnahme und Diagnose modernster Wärmepumpensysteme (Buderus, Bosch, NIBE, Viessmann) und Instandhaltung von Liegenschaften des Lahn-Dill-Kreises. Voll ausgestattetes Servicefahrzeug, iPad und Smartphone auch zur privaten Nutzung.',
      identifier: {
        '@type': 'PropertyValue',
        name: 'Bad & Energie GmbH',
        value: 'SHK-KD-2026-02',
      },
      datePosted: '2026-03-01',
      validThrough: '2027-10-06T00:00:00',
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Bad & Energie GmbH',
        sameAs: ['https://bad-energie.de'],
        logo: logoUrl,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Siegmund-Hiepe-Str. 20',
          addressLocality: 'Wetzlar',
          postalCode: '35578',
          addressRegion: 'Hessen',
          addressCountry: 'DE',
        },
      },
    },
    {
      '@type': 'JobPosting',
      '@id': 'https://karriere.bad-energie.de/#job-obermonteur',
      title: 'Obermonteur / Projektleiter SHK & Badsanierung (m/w/d)',
      description:
        'Projektleitung anspruchsvoller Badsanierungen und Heizungsmodernisierungen im 35 km Radius. Eigenverantwortliche Baustellenabwicklung, kollegiale Führung, modernstes Werkzeug und übertarifliche Spitzenvergütung.',
      identifier: {
        '@type': 'PropertyValue',
        name: 'Bad & Energie GmbH',
        value: 'SHK-PL-2026-03',
      },
      datePosted: '2026-03-01',
      validThrough: '2027-10-06T00:00:00',
      employmentType: 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Bad & Energie GmbH',
        sameAs: ['https://bad-energie.de'],
        logo: logoUrl,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Siegmund-Hiepe-Str. 20',
          addressLocality: 'Wetzlar',
          postalCode: '35578',
          addressRegion: 'Hessen',
          addressCountry: 'DE',
        },
      },
    },
    {
      '@type': 'JobPosting',
      '@id': 'https://karriere.bad-energie.de/#job-azubi',
      title: 'Auszubildender zum Anlagenmechaniker SHK 2026 (m/w/d)',
      description:
        'Starte Deine handwerkliche Zukunft mit 100 Jahren Ausbildungstradition bei Bad & Energie GmbH in Wetzlar ab August 2026. Eigenes Hilti Azubi-Werkzeugset, Fahrtkostenzuschuss und Meisterbegleitung durch Dipl.-Ing. Sabri Demir mit garantierter Übernahme.',
      identifier: {
        '@type': 'PropertyValue',
        name: 'Bad & Energie GmbH',
        value: 'SHK-AZ-2026-04',
      },
      datePosted: '2026-03-01',
      validThrough: '2027-10-06T00:00:00',
      employmentType: 'FULL_TIME',
      educationRequirements: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Hauptschulabschluss oder Realschulabschluss',
      },
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Bad & Energie GmbH',
        sameAs: ['https://bad-energie.de'],
        logo: logoUrl,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Siegmund-Hiepe-Str. 20',
          addressLocality: 'Wetzlar',
          postalCode: '35578',
          addressRegion: 'Hessen',
          addressCountry: 'DE',
        },
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://karriere.bad-energie.de/#faq-schema',
      name: 'Häufige Fragen zum Bewerbungsprozess bei Bad und Energie GmbH Lahn Dill',
      description:
        'Antworten auf die wichtigsten Fragen von Anlagenmechanikern, Kundendienstmonteuren und Auszubildenden zu Diskretion, Bewerbungsprozess, Werkzeug und Arbeitszeiten.',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Wie läuft der diskrete Wechsel ab, wenn ich noch bei einem anderen Betrieb angestellt bin?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolute Diskretion ist für uns selbstverständlich. Wir kontaktieren unter keinen Umständen Deinen derzeitigen Arbeitgeber. Ein unverbindliches Kennenlernen findet diskret nach Feierabend oder am Wochenende statt. Auch bei Kündigungsfristen unterstützen wir Dich transparent.',
          },
        },
        {
          '@type': 'Question',
          name: 'Brauche ich ein Anschreiben oder einen Lebenslauf für den ersten Kontakt?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nein! Für den ersten Schritt reicht unser Express Fragebogen in zwei Minuten völlig aus. Wir benötigen vorab keine Anschreiben oder formalen Mappen. Ein kurzes Telefonat auf Augenhöhe und ein Kaffee in Wetzlar sind uns lieber als Papierkram.',
          },
        },
        {
          '@type': 'Question',
          name: 'Welche Heizsysteme und Sanitäranlagen montieren wir hauptsächlich?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Unser Schwerpunkt liegt auf modernen Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann sowie schlüsselfertigen Badsanierungen in enger Partnerschaft mit ELEMENTS, VIGOUR, Kermi und Geberit.',
          },
        },
        {
          '@type': 'Question',
          name: 'Darf das Firmenfahrzeug mit nach Hause genommen werden?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ja. Je nach Aufgabenbereich und Absprache kann Dein persönliches, modern ausgestattetes Servicefahrzeug für die direkte Anfahrt von Deinem Wohnort zur Baustelle genutzt werden. Auch Smartphone und Tablet sind für die private Nutzung freigeschaltet.',
          },
        },
        {
          '@type': 'Question',
          name: 'Gibt es bei Bad und Energie Fernmontagen oder Wochenendarbeit?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nein. Unsere Baustellen liegen ausnahmslos in Wetzlar, Gießen und dem Lahn Dill Kreis. Du bist jeden Nachmittag pünktlich zu Hause. Wochenendarbeit ist ausgeschlossen. Freitags ist ab 13:30 Uhr Wochenende.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body suppressHydrationWarning className={`min-h-screen flex flex-col font-sans ${plusJakartaSans.variable}`}>
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <LayoutClientWidgets />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
