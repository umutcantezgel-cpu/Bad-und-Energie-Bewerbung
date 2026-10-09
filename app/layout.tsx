import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { AttributionCapture } from '@/components/analytics/AttributionCapture';
import { JsonLd } from '@/components/seo/JsonLd';
import { SiteFooter, SiteHeader, StickyApplyBar, buildSiteJsonLd } from '@/components/site';
import { SkipLink } from '@/components/ui/SkipLink';
import { ToastProvider } from '@/components/ui/Toast';
import { HOME_DESCRIPTION, HOME_TITLE } from '@/components/home/content';
import { COMPANY } from '@/lib/content/company';
import { SITE_CONFIG } from '@/lib/seo/site-config';

// Self-hosted at build time by next/font (no request to Google from the browser).
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Footer and sticky apply bar read the job registry (isJobLive): regenerate every page at least
// hourly, so a job past its validThrough disappears from them without a deploy. The lowest
// `revalidate` of layout and page wins (pages with their own 3600 are unaffected).
export const revalidate = 3600;

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F17' },
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: {
    default: HOME_TITLE,
    template: '%s | Bad & Energie Karriere',
  },
  description: HOME_DESCRIPTION,
  applicationName: 'Bad & Energie Karriere',
  authors: [{ name: COMPANY.legalName }],
  publisher: COMPANY.legalName,
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
    apple: '/icon-192.png',
  },
  // Phone numbers are linked explicitly; stop iOS from turning salaries or times into tel: links.
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    siteName: COMPANY.name,
    locale: 'de_DE',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
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
    'geo.placename': COMPANY.address.city,
    'geo.position': `${COMPANY.geo.latitude};${COMPANY.geo.longitude}`,
    ICBM: `${COMPANY.geo.latitude}, ${COMPANY.geo.longitude}`,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="flex min-h-dvh flex-col">
        {/* Context and live regions only; the toast UI loads with the first toast (Mappe undo). */}
        <ToastProvider>
          <SkipLink href="#main" />
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <SiteFooter />
          <StickyApplyBar />
        </ToastProvider>
        {/* Reads UTM/ref from the URL; the boundary keeps static pages static. */}
        <Suspense fallback={null}>
          <AttributionCapture />
        </Suspense>
        <JsonLd data={buildSiteJsonLd()} />
      </body>
    </html>
  );
}
