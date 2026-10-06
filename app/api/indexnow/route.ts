import { NextResponse, type NextRequest } from 'next/server';
import { submitToIndexNow, getIndexNowPayload, INDEXNOW_KEY, getAllPortalUrls } from '@/lib/seo/indexnow';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  const payload = getIndexNowPayload();

  if (action === 'submit') {
    const result = await submitToIndexNow();
    return NextResponse.json({
      message: 'IndexNow Einreichung an Bing und teilnehmende Suchmaschinen ausgeführt',
      ...result,
    }, { status: result.success ? 200 : 502 });
  }

  return NextResponse.json({
    service: 'IndexNow Protocol (Bing, Yandex, Seznam)',
    key: INDEXNOW_KEY,
    keyLocation: payload.keyLocation,
    host: payload.host,
    registeredUrls: getAllPortalUrls(),
    documentation: 'https://www.bing.com/indexnow/getstarted',
    usage: 'Sende GET ?action=submit oder POST mit { urls: [...] } um Änderungen sofort zu indexieren.',
  });
}

export async function POST(request: NextRequest) {
  try {
    let urls: string[] | undefined;

    try {
      const body = await request.json();
      if (body && Array.isArray(body.urls) && body.urls.length > 0) {
        urls = body.urls;
      }
    } catch {
      // Leerer Body bedeutet alle Portal-URLs einreichen
    }

    const result = await submitToIndexNow(urls);
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ungültige Anfrage' },
      { status: 400 }
    );
  }
}

