export interface UtmParams {
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
}

/** Hängt UTM-Parameter an; vorhandene Query-Parameter bleiben erhalten. */
export function withUtm(url: string, { source, medium = 'jobboard', campaign, content }: UtmParams): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', source);
  u.searchParams.set('utm_medium', medium);
  if (campaign) u.searchParams.set('utm_campaign', campaign);
  if (content) u.searchParams.set('utm_content', content);
  return u.toString();
}
