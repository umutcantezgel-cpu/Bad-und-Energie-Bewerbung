import 'server-only';
import path from 'node:path';
import { renderToBuffer } from '@react-pdf/renderer';
import type { MappeDokument } from '@/lib/mappe/blatt/dokument';
import { MappePdf, schriftenRegistrieren, seitenZaehlen } from './satz';

export { geschaetzteZeilen } from './satz';

/**
 * Mappe-PDF für die Team-Mail (Schritt 4a/4b): Satz aus ./satz.tsx (mit dem Browser geteilt, L4), Schriften über den
 * Pfad aus lib/mappe/schriften (next.config.ts nimmt sie in die Funktionen der Bewerbungs-Routen auf).
 * @react-pdf/renderer steht in Nexts Liste der Server-Pakete ohne Bündelung. Ohne Kontaktzeile und ohne Foto: Die
 * bleiben im Browser des Bewerbers. Gleiche Eingaben und gleiches Datum ergeben dieselben Bytes (feste Erstellungszeit).
 */

const SCHRIFTEN = path.join(process.cwd(), 'lib/mappe/schriften');

export interface MappePdfErgebnis {
  pdf: Buffer;
  seiten: number;
}

/** PDF der Mappe; `erstellt` steht als Erstellungszeit in der Datei (gleiche Eingaben, gleiche Bytes). */
export async function mappePdf(dokument: MappeDokument, erstellt: Date): Promise<MappePdfErgebnis> {
  schriftenRegistrieren({
    normal: path.join(SCHRIFTEN, 'atkinson-hyperlegible-next-400.ttf'),
    fett: path.join(SCHRIFTEN, 'atkinson-hyperlegible-next-700.ttf'),
    titel: path.join(SCHRIFTEN, 'bricolage-grotesque-700.ttf'),
  });
  let pdf: Buffer;
  try {
    pdf = await renderToBuffer(<MappePdf dokument={dokument} erstellt={erstellt} seitenzahlen />);
  } catch {
    // Rückfall ohne Seitenzahlen: Ein Fehler beim Setzen der Seitenzahlen (fixed mit render) soll die Mappe nicht kosten
    pdf = await renderToBuffer(<MappePdf dokument={dokument} erstellt={erstellt} seitenzahlen={false} />);
  }
  return { pdf, seiten: seitenZaehlen(pdf.toString('latin1')) };
}
