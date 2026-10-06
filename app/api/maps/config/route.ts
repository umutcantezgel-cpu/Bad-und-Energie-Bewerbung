import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const referer = request.headers.get('referer') || '';
  const isAllowedReferer = referer.includes('bad-energie.de') || process.env.NODE_ENV !== 'production';

  if (!isAllowedReferer) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
  }

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    '';

  const mapId =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() ||
    process.env.GOOGLE_MAPS_MAP_ID?.trim() ||
    '';

  // Sanitize placeholder values
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
