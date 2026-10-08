/** Empty values and the .env.example placeholders count as "no key" (same rule as /api/maps/config). */
export function isUsableMapsApiKey(key: string | null | undefined): key is string {
  const value = key?.trim() ?? '';
  return value !== '' && value !== 'MY_GOOGLE_MAPS_API_KEY' && !value.startsWith('AIzaSy_placeholder');
}

/**
 * Server-side check whether a Maps key is configured (build-time for static pages). Without one the
 * RegionMap shows only the radius graphic and offers no "Interaktive Karte laden" button.
 */
export function isGoogleMapsConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return isUsableMapsApiKey(env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) || isUsableMapsApiKey(env.GOOGLE_MAPS_API_KEY);
}
