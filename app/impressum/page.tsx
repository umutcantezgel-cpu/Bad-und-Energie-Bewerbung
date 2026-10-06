import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, Phone, Mail, MapPin, Building2, Shield, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';

const appUrl = process.env.APP_URL || 'https://karriere.bad-energie.de';
const logoUrl = `${appUrl}/images/bad-energie-lahn-dill-logo.webp`;

export const metadata: Metadata = {
  title: 'Impressum & Kontakt | Bad & Energie GmbH Lahn Dill Wetzlar',
  description:
    'Gesetzliche Anbieterkennzeichnung nach § 5 DDG und Handwerksordnung der Bad und Energie GmbH Lahn Dill in Wetzlar. Geschäftsführer Dipl.-Ing. Sabri Demir.',
  alternates: {
    canonical: `${appUrl}/impressum`,
  },
  openGraph: {
    title: 'Impressum & Kontakt | Bad & Energie GmbH Lahn Dill Wetzlar',
    description:
      'Gesetzliche Anbieterkennzeichnung nach § 5 DDG und Handwerksordnung der Bad und Energie GmbH Lahn Dill in Wetzlar. Geschäftsführer Dipl.-Ing. Sabri Demir.',
    url: `${appUrl}/impressum`,
    siteName: 'Bad und Energie GmbH Lahn Dill',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: logoUrl,
        width: 1200,
        height: 630,
        alt: 'Impressum der Bad und Energie GmbH Lahn Dill in Wetzlar',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Impressum & Kontakt | Bad & Energie GmbH Lahn Dill Wetzlar',
    description:
      'Gesetzliche Anbieterkennzeichnung nach § 5 DDG und Handwerksordnung der Bad und Energie GmbH Lahn Dill in Wetzlar. Geschäftsführer Dipl.-Ing. Sabri Demir.',
    images: [logoUrl],
  },
};

const impressumSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${appUrl}/impressum/#webpage`,
      url: `${appUrl}/impressum`,
      name: 'Impressum und Kontakt | Bad und Energie GmbH Lahn Dill in Wetzlar',
      description:
        'Gesetzliche Offenlegung und Anbieterkennzeichnung nach Paragraph 5 DDG und Handwerksordnung.',
      isPartOf: {
        '@id': `${appUrl}/#website`,
      },
      breadcrumb: {
        '@id': `${appUrl}/impressum/#breadcrumb`,
      },
      inLanguage: 'de-DE',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${appUrl}/impressum/#breadcrumb`,
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
          name: 'Impressum',
          item: `${appUrl}/impressum`,
        },
      ],
    },
  ],
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(impressumSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link href="/" className="hover:text-[#0A1E3A] transition-colors">
            Startseite
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Impressum</span>
        </nav>

        {/* Header */}
        <div className="border-l-4 border-[#C51E1E] pl-5 py-1">
          <span className="text-xs font-mono font-bold text-[#C51E1E] uppercase tracking-wider block mb-1">
            Gesetzliche Offenlegung nach Paragraph 5 DDG und Handwerksordnung
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0A1E3A] uppercase tracking-tight">
            Impressum
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Angaben und rechtliche Unternehmensinformationen der Bad und Energie GmbH Lahn Dill.
          </p>
        </div>

        {/* Corporate Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
            <Logo variant="default" framing="card" size="md" withLink={false} />
            <span className="hidden sm:inline-block px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold rounded">
              Meisterbetrieb seit 1926
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Betrieb und Anschrift
              </span>
              <h2 className="text-base font-bold text-[#0A1E3A]">
                Bad und Energie GmbH Lahn Dill
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  Siegmund Hiepe Str. 20<br />
                  35578 Wetzlar<br />
                  Deutschland
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Direktkontakt
              </span>
              <div className="text-xs font-mono space-y-1.5 text-slate-700">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.5} />
                  <span>Telefon: <strong>06441 42956</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                  <span>Telefax: <strong>06441 48781</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.5} />
                  <span>E Mail: <a href="mailto:info@bad-energie.de" className="text-[#C51E1E] hover:underline">info@bad-energie.de</a></span>
                </p>
                <p className="text-slate-500 pt-1">
                  Website: <a href="https://bad-energie.de" target="_blank" rel="noopener noreferrer" className="hover:underline">https://bad-energie.de</a>
                </p>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 text-xs">
            <div className="space-y-2">
              <h2 className="font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Handelsregister
              </h2>
              <p className="text-slate-700 leading-relaxed font-mono">
                Registergericht: Amtsgericht Wetzlar<br />
                Registernummer: <strong>HRB 8459</strong>
              </p>
              <p className="text-slate-500 pt-1">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:<br />
                <strong className="text-slate-900 font-mono">DE 346 648 448</strong>
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Geschäftsführung
              </h2>
              <p className="text-slate-900 font-semibold">
                Diplomingenieur Sabri Demir
              </p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Verantwortlicher für den Inhalt nach § 18 Abs. 2 MStV:<br />
                Sabri Demir, Siegmund Hiepe Str. 20, 35578 Wetzlar
              </p>
            </div>
          </div>

          {/* Kammer & Aufsichtsbehörde */}
          <div className="space-y-3 pb-6 border-b border-slate-100 text-xs">
            <h2 className="font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Zuständige Handwerkskammer und Aufsichtsbehörde
            </h2>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <strong className="text-slate-900 block font-bold">
                  Handwerkskammer Wiesbaden
                </strong>
                <p className="text-slate-600 mt-0.5">
                  Bierstadter Straße 45, 65189 Wiesbaden
                </p>
                <p className="text-slate-500 font-mono text-[11px]">
                  Telefon: 0611 1360 • E Mail: info@hwk-wiesbaden.de
                </p>
              </div>
              <a
                href="https://www.hwk-wiesbaden.de"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#0A1E3A] hover:bg-[#132B50] text-white rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer"
              >
                Kammerportal öffnen
              </a>
            </div>
            <p className="text-slate-500 text-[11px]">
              Berufsbezeichnung: Meisterbetrieb des SHK Handwerks, Installateur und Heizungsbauer, verliehen in der Bundesrepublik Deutschland. Berufsrechtliche Regelungen: Handwerksordnung HwO.
            </p>
          </div>

          {/* Verbraucherschlichtung & Haftung */}
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h2 className="font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Rechtliche Hinweise und Streitbeilegung
            </h2>
            <h3 className="font-bold text-slate-900 text-sm">
              Verbraucherstreitbeilegung und Universalschlichtungsstelle
            </h3>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online Streitbeilegung OS bereit, die Sie unter{' '}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0284C7] underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>{' '}
              finden. Wir sind grundsätzlich bereit, an Streitbeilegungsverfahren vor einer anerkannten Verbraucherschlichtungsstelle teilzunehmen.
            </p>

            <h3 className="font-bold text-slate-900 text-sm pt-2">
              Haftung für Inhalte und Links
            </h3>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </div>
        </div>

        {/* Back navigation */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0A1E3A] hover:text-[#C51E1E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
