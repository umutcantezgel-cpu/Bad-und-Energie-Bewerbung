import type { Metadata } from 'next';
import { SITE_CONFIG } from './site-config';
import { getCleanCanonicalUrl } from './canonical-links';
import { DEFAULT_OG_IMAGE, type OgImage } from './og-image';

export const BASE_URL = SITE_CONFIG.baseUrl;
export const LOGO_URL = `${BASE_URL}/images/bad-energie-lahn-dill-logo-transparent.webp`;

/** Title template of the root layout (app/layout.tsx); a plain page title is set inside it. */
export const TITLE_TEMPLATE = '%s | Bad & Energie Karriere';

/**
 * The <title> Next renders for a page's metadata title under the root layout: `absolute` as is,
 * a plain string (or a `default`) inside TITLE_TEMPLATE. The JSON-LD WebPage `name` (lib/seo/graph.ts)
 * comes from here, so it never differs from the title tag.
 */
export function documentTitle(title: Metadata['title']): string | undefined {
  if (!title) return undefined;
  const templated = (text: string) => TITLE_TEMPLATE.replace('%s', () => text);
  if (typeof title === 'string') return templated(title);
  if ('absolute' in title) return title.absolute;
  return templated(title.default);
}

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
   * Share image (og:image and twitter:image).
   * - omitted: the root image app/opengraph-image (DEFAULT_OG_IMAGE). Next merges metadata only one
   *   level deep: a page that sets `openGraph` replaces the layout's object, so without an explicit
   *   image it would share none.
   * - 'file': the page's own segment has an opengraph-image file. No images are set here, because
   *   explicit images take precedence over file-based ones. The default for '/', whose segment holds
   *   app/opengraph-image.
   * - an image: used as is, e.g. jobOgImage() for job pages.
   */
  ogImage?: OgImage | 'file';
}): Metadata {
  const canonicalUrl = getCleanCanonicalUrl(opts.path);
  const indexable = opts.type !== 'legal' && !opts.noindex;
  const image = opts.ogImage ?? (opts.path === '/' ? 'file' : DEFAULT_OG_IMAGE);
  // Key left out entirely for 'file': Next checks hasOwnProperty('images') before using the file.
  const images = () => (image === 'file' ? {} : { images: [{ ...image }] });

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
      ...images(),
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      ...images(),
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
