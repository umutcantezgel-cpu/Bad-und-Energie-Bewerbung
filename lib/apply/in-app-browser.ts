/**
 * In-App-Browser von Instagram, Facebook (auch Messenger) und TikTok an der Kennung (User-Agent). Dort entscheidet die
 * App, ob Downloads ankommen, oft gar nicht: Die Mappe sagt es bei „PDF herunterladen“ (components/mappe), die
 * Danke-Seite bei „Nummern speichern“. Rein, im Browser nach der Hydrierung aufgerufen.
 */

export const IN_APP_BROWSER = Object.freeze({ instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' });
export type InAppBrowser = keyof typeof IN_APP_BROWSER;

/** Die App, deren Browser die Seite zeigt; null im normalen Browser. */
export function inAppBrowser(userAgent: string): InAppBrowser | null {
  if (/Instagram/i.test(userAgent)) return 'instagram';
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A|MessengerForiOS/i.test(userAgent)) return 'facebook';
  if (/BytedanceWebview|musical_ly|TikTok|trill_/i.test(userAgent)) return 'tiktok';
  return null;
}
