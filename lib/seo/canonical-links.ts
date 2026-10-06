import { SITE_CONFIG } from './site-config';

export const BASE_URL = SITE_CONFIG.baseUrl;

export function getCleanCanonicalUrl(path: string): string {
  const cleanPath = path.replace(/\/$/, '') || '';
  return `${BASE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
}
