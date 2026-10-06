import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo/site-config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.baseUrl;

  return {
    rules: [
      {
        userAgent: ['Googlebot', 'Bingbot', 'DuckDuckBot'],
        allow: '/',
        disallow: ['/api/'],
        crawlDelay: 0,
      },
      {
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
        disallow: ['/api/'],
      },
      {
        // Aggressive SEO-Scraper & Data-Miner hart aussperren
        userAgent: [
          'SemrushBot',
          'PetalBot',
          'DotBot',
          'MJ12bot',
          'BLEXBot',
          'DataForSeoBot',
          'MegaIndex',
          'Bytespider',
        ],
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/danke/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
