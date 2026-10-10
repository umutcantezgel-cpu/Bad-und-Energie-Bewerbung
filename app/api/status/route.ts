import { NextResponse } from 'next/server';

import { getStatusReport } from '@/lib/status';

export const dynamic = 'force-dynamic';

/**
 * GET /api/status: Betriebsstatus ohne Werte (lib/status.ts). Zum Prüfen nach einem Deploy oder
 * nach einer Änderung der Umgebungsvariablen, ohne eine Testbewerbung abzuschicken.
 * HTTP 200, wenn Bewerbungen angenommen werden können, sonst 503.
 */
export async function GET() {
  try {
    const report = await getStatusReport();
    return NextResponse.json(report, {
      status: report.ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
    });
  } catch (err: unknown) {
    console.error(`[status] Fehler: ${err instanceof Error ? err.name : 'unknown'}`);
    return NextResponse.json({ ok: false }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
