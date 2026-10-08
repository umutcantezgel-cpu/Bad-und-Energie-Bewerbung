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
  /**
   * Use `title` as is, without the root layout's template ('%s | Bad & Energie Karriere'),
   * e.g. for the home page or titles that already carry the brand.
   */
  absoluteTitle?: boolean;
  description: string;
  path: string;
  type?: 'money' | 'legal' | 'default';
  keywords?: string[];
  /** noindex,follow – e.g. thank-you page, ad landing pages, tools. */
  noindex?: boolean;
  /**
   * Absolute or root-relative image. When omitted, the file-based
   * `opengraph-image` of the route segment (or app/opengraph-image) is used.
   */
  ogImage?: { url: string; width: number; height: number; alt: string };
}): Metadata {
  const canonicalUrl = getCleanCanonicalUrl(opts.path);
  const indexable = opts.type !== 'legal' && !opts.noindex;

  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
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
      ...(opts.ogImage ? { images: [opts.ogImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      ...(opts.ogImage ? { images: [opts.ogImage.url] } : {}),
    },
    robots: {
      index: indexable,
      follow: true,
      googleBot: {
        index: indexable,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
