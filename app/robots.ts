import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Not for crawling: APIs and the recruiter area (Phase 2). A crawler obeys only its most specific
 * group, so every allowing group repeats the same list. Feeds, sitemap and llms*.txt stay open.
 * Pages that must stay out of the index (/bewerbung/danke, /bewerbung/mappe, legal pages, closed
 * jobs) carry `noindex` instead and must not be listed here: a crawler blocked by robots.txt never
 * sees the noindex, and a linked URL can still be indexed without content.
 */
const PRIVATE_PATHS = ['/api/', '/admin/'];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: ['Googlebot', 'Bingbot', 'DuckDuckBot'],
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        // AI search and answer engines may read the career pages (incl. llms.txt).
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'Google-Extended',
          'anthropic-ai',
          'ClaudeBot',
          'PerplexityBot',
          'CCBot',
          'Applebot-Extended',
          'Amazonbot',
          'Cohere-ai',
          'YouBot',
        ],
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        // SEO scrapers and data miners. The same list (without Bytespider) is hard-blocked in proxy.ts.
        // Bytespider (ByteDance) stays a polite request only: proxy.ts lets it through, so a TikTok-related
        // fetch can never fail with 403. The career pages gain nothing from it in Phase 1; before the TikTok
        // campaigns in Phase 3 (/lp/), check TikTok's ad review in the Ads Manager and drop it here if needed.
        userAgent: ['SemrushBot', 'PetalBot', 'DotBot', 'MJ12bot', 'BLEXBot', 'DataForSeoBot', 'MegaIndex', 'Bytespider'],
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
