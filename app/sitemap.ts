import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.baseUrl;
  const releaseDate = '2026-03-01T08:00:00.000Z';
  const updateDate = '2026-03-15T08:00:00.000Z';

  return [
    {
      url: `${baseUrl}`,
      lastModified: updateDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bewerbung`,
      lastModified: updateDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/datenschutz`,
      lastModified: releaseDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: releaseDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
