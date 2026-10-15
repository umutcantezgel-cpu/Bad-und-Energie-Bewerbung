import { kopfSvgDateien } from '@/lib/zeichnung/kopf-svg';

/**
 * Zeichnungen des Stellenkopfs als SVG-Dateien (Prüfung E-029, Runde 3): Anlagenschema und kleiner Hausschnitt, beim
 * Build aus denselben Modulen erzeugt wie die Komponenten (lib/zeichnung/kopf-svg.ts), statisch ausgeliefert. Der
 * Dateiname trägt einen Hash des Inhalts; SVG-Dateien werden ein Jahr gecacht (next.config.ts). Der Proxy lässt
 * `*.svg` durch (proxy.ts).
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams(): { datei: string }[] {
  return kopfSvgDateien().map(({ datei }) => ({ datei }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ datei: string }> }): Promise<Response> {
  const { datei } = await params;
  const treffer = kopfSvgDateien().find((x) => x.datei === datei);
  if (!treffer) return new Response('Nicht gefunden.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  return new Response(treffer.svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
}
