import { bueroSzenenDateien } from '@/lib/zeichnung/buero/svg';
import { kopfSvgDateien } from '@/lib/zeichnung/kopf-svg';
import { raumschnittDateien } from '@/lib/zeichnung/raumschnitt-svg';
import { waermeBandDateien } from '@/lib/zeichnung/waerme/dateien';

/**
 * Zeichnungen als SVG-Dateien (Prüfung E-029, Runde 3; E-031): die Kopfbilder der Stellen (Anlagenschema, kleiner
 * Hausschnitt, Leitstelle der Bürofachkraft), die vier stillen Büro-Szenen des Einblicks, die Bänder und die
 * Zeichnung der Vergleichsräume der Wärmepumpen-Seite (Prüfrunde 1 C1-6), beim Build aus denselben Modulen erzeugt
 * wie die Komponenten (lib/zeichnung/kopf-svg.ts, lib/zeichnung/buero/svg.ts, lib/zeichnung/waerme/dateien.ts,
 * lib/zeichnung/raumschnitt-svg.ts), statisch.
 * Der Dateiname trägt einen Hash des Inhalts; SVG-Dateien werden ein Jahr gecacht (next.config.ts). Der Proxy lässt
 * `*.svg` durch (proxy.ts).
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

/** Alle ausgelieferten Zeichnungen: Kopfbilder, Büro-Szenen, Bänder und Zeichnung der Vergleichsräume. */
function zeichnungDateien(): Array<{ datei: string; svg: string }> {
  return [...kopfSvgDateien(), ...bueroSzenenDateien(), ...waermeBandDateien(), ...raumschnittDateien()];
}

export function generateStaticParams(): { datei: string }[] {
  return zeichnungDateien().map(({ datei }) => ({ datei }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ datei: string }> }): Promise<Response> {
  const { datei } = await params;
  const treffer = zeichnungDateien().find((x) => x.datei === datei);
  if (!treffer) return new Response('Nicht gefunden.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  return new Response(treffer.svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
}
