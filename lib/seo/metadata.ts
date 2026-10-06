import type { Metadata } from 'next';
import { SITE_CONFIG } from './site-config';
import { getCleanCanonicalUrl } from './canonical-links';

export const BASE_URL = SITE_CONFIG.baseUrl;
export const LOGO_URL = `${BASE_URL}/images/bad-energie-lahn-dill-logo-transparent.webp`;

export function validateTitleLength(title: string): boolean {
  return title.length <= 65; // SERP display budget
}

export function generatePageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  type?: 'money' | 'legal' | 'default';
  keywords?: string[];
}): Metadata {
  const canonicalUrl = getCleanCanonicalUrl(opts.path);

  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.companyName,
      locale: 'de_DE',
      type: 'website',
      images: [
        {
          url: LOGO_URL,
          width: 1200,
          height: 630,
          alt: `${SITE_CONFIG.companyName} • Meisterbetrieb Wetzlar`,
          type: 'image/webp',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [LOGO_URL],
    },
    robots: {
      index: opts.type !== 'legal',
      follow: true,
      googleBot: {
        index: opts.type !== 'legal',
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
