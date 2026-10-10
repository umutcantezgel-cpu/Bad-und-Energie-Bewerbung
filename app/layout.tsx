import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import './globals.css';
import { fontVariables } from './fonts';
import { AttributionCapture } from '@/components/analytics/AttributionCapture';
import { SiteFooter, SiteHeader, StickyApplyBar } from '@/components/site';
import { SkipLink } from '@/components/ui/SkipLink';
import { ToastProvider } from '@/components/ui/Toast';
import { HOME_DESCRIPTION, HOME_TITLE } from '@/components/home/content';
import { COMPANY } from '@/lib/content/company';
import { HEAD_SCRIPT } from '@/lib/motion/head-script';
import { TITLE_TEMPLATE } from '@/lib/seo/metadata';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import { TOKENS } from '@/lib/tokens';

// Footer and sticky apply bar read the job registry (isJobLive): regenerate every page at least
// hourly, so a job past its validThrough disappears from them without a deploy. The lowest
// `revalidate` of layout and page wins (pages with their own 3600 are unaffected).
export const revalidate = 3600;

export const viewport: Viewport = {
  // Papier und Nacht (KERN K-006), gleich dem Dokumenthintergrund in globals.css (Spiegel: lib/tokens).
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: TOKENS.themeColor.light },
    { media: '(prefers-color-scheme: dark)', color: TOKENS.themeColor.dark },
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: {
    default: HOME_TITLE,
    template: TITLE_TEMPLATE,
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
    // suppressHydrationWarning: das Kopfskript setzt vor dem ersten Bild die Klasse „auftakt“ auf <html>.
    <html lang="de" className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Kopfskript (E-013): vor dem ersten Rendern; CSP-Hash in lib/motion/head-script.ts (HEAD_SCRIPT_SHA256). */}
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
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
        {/* Kein JSON-LD hier (V6-B): Jede Seite rendert genau einen @graph (lib/seo/graph.ts) mit den globalen Knoten. */}
      </body>
    </html>
  );
}
