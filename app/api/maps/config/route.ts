import { NextResponse } from 'next/server';
import { isTrustedSiteRequest } from '@/lib/security/origin';
import { jsonError } from '@/lib/security/request';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // proxy.ts prüft dasselbe; hier zusätzlich, falls sich der Matcher einmal ändert.
  if (process.env.NODE_ENV === 'production' && !isTrustedSiteRequest(request.headers)) {
    return jsonError(403, 'FORBIDDEN');
  }

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    '';

  const mapId =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() ||
    process.env.GOOGLE_MAPS_MAP_ID?.trim() ||
    '';

  // Platzhalter aus .env.example gelten als nicht gesetzt.
  const sanitizedKey =
    !apiKey || apiKey === 'MY_GOOGLE_MAPS_API_KEY' || apiKey.startsWith('AIzaSy_placeholder')
      ? ''
      : apiKey;

  return NextResponse.json(
    {
      apiKey: sanitizedKey,
      mapId,
      hasKey: Boolean(sanitizedKey),
    },
    {
      headers: {
        'Cache-Control': 'private, no-cache, no-store',
      },
    }
  );
}
