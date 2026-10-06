import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
