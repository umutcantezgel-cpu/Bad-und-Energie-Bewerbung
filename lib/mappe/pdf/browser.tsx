import { pdf } from '@react-pdf/renderer';
import type { Fotoform } from '@/lib/mappe/blatt/design';
import { mappeDokument, type MappeDokumentEingaben } from '@/lib/mappe/blatt/dokument';
import { fehlendeZeichen, fuerPdf, fuerSchrift, texte } from '@/lib/mappe/blatt/zeichen';
import { downloadDateiname } from './dateiname';
import { fotoFuerPdf } from './foto';
import { MappePdf, schriftenRegistrieren, seitenZaehlen, type MappePdfPersoenlich } from './satz';

/**
 * „PDF herunterladen“ (L4): die Mappe als A4-PDF im Browser, mit demselben Satz wie die Team-PDF (./satz.tsx), dazu
 * Kontaktzeile und Foto. Nichts davon verlässt das Gerät. MappeTool lädt dieses Modul erst bei Absicht (Zeiger, Fokus,
 * Berührung des Knopfs) per import(); react-pdf (rund 450 KB gzip) steht so nie im Erstladen der Seite.
 *
 * Schriften als URL: Turbopack legt die Dateien aus lib/mappe/schriften über `new URL(…, import.meta.url)` mit
 * Inhalts-Hash unter /_next/static/media ab (dieselben Dateien wie auf dem Server, keine Kopie in public/).
 * Yoga (Layout) kompiliert WebAssembly: Die CSP braucht dafür 'wasm-unsafe-eval' (next.config.ts).
 */

const SCHRIFTEN = {
  normal: new URL('../schriften/atkinson-hyperlegible-next-400.ttf', import.meta.url).href,
  fett: new URL('../schriften/atkinson-hyperlegible-next-700.ttf', import.meta.url).href,
  titel: new URL('../schriften/bricolage-grotesque-700.ttf', import.meta.url).href,
};

export interface BewerberPdfEingaben extends MappeDokumentEingaben {
  /** Wohnort · Telefon · E-Mail, wie im Kopf der Vorschau; leer ohne Angaben. */
  kontakt: string;
  /** Das gewählte Foto (Datei aus dem Formular) und seine Form; null ohne Foto. */
  foto: { datei: Blob; form: Fotoform } | null;
}

export type BewerberPdf =
  | { ok: true; blob: Blob; seiten: number; dateiname: string }
  /** Weder Anschreiben noch Lebenslauf haben Inhalt. */
  | { ok: false; grund: 'leer' }
  /** Zeichen, die die Schrift nicht hat (je einmal); dann keine PDF statt Kästchen. */
  | { ok: false; grund: 'zeichen'; zeichen: string[] };

/** Fehlende Zeichen aller Texte (wie fuerPdf sie sieht) und der Kontaktzeile, je einmal in Reihenfolge. */
function fehlendIn(alleTexte: readonly string[]): string[] {
  return [...new Set(alleTexte.flatMap((text) => fehlendeZeichen(fuerSchrift(text))))];
}

/** Die PDF des Bewerbers: Dokument wie für den Server (mappeDokument, fuerPdf), Kontaktzeile und Foto dazu. */
export async function bewerberPdf(eingaben: BewerberPdfEingaben, erstellt: Date): Promise<BewerberPdf> {
  const dokument = mappeDokument(eingaben);
  if (!dokument) return { ok: false, grund: 'leer' };
  const kontakt = fuerSchrift(eingaben.kontakt).replace(/\s*\n\s*/g, ' ').trim();
  const fuerSatz = fuerPdf(dokument);
  if (!fuerSatz || fehlendeZeichen(kontakt).length > 0) {
    return { ok: false, grund: 'zeichen', zeichen: fehlendIn([...texte(dokument), eingaben.kontakt]) };
  }
  if (!fuerSatz.anschreiben && !fuerSatz.lebenslauf) return { ok: false, grund: 'leer' };

  const persoenlich: MappePdfPersoenlich = {
    kontakt: kontakt || null,
    foto: eingaben.foto ? { src: await fotoFuerPdf(eingaben.foto.datei, eingaben.foto.form), form: eingaben.foto.form } : null,
  };
  schriftenRegistrieren(SCHRIFTEN);
  let blob: Blob;
  try {
    blob = await pdf(<MappePdf dokument={fuerSatz} erstellt={erstellt} seitenzahlen {...persoenlich} />).toBlob();
  } catch {
    // Wie auf dem Server: Ein Fehler beim Setzen der Seitenzahlen soll die Mappe nicht kosten
    blob = await pdf(<MappePdf dokument={fuerSatz} erstellt={erstellt} seitenzahlen={false} {...persoenlich} />).toBlob();
  }
  const seiten = seitenZaehlen(new TextDecoder('latin1').decode(await blob.arrayBuffer()));
  return { ok: true, blob, seiten, dateiname: downloadDateiname(fuerSatz.name ?? undefined) };
}
