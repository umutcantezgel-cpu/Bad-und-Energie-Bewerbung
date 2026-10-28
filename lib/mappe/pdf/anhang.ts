import 'server-only';
import type { Mappe } from '@/lib/applications/schema';
import type { NormalizedFollowUp, ReferencedApplication } from '@/lib/applications/types';
import { nurPraxiserfahrung } from '@/lib/email/templates/application-parts';
import { mappePdfEnabled } from '@/lib/env';
import { getJobById } from '@/lib/jobs/registry';
import { mappeDokument, type MappeDokument, type MappeDokumentEingaben } from '@/lib/mappe/blatt/dokument';
import { fuerPdf, mitInhaltFuerSchrift, texte } from '@/lib/mappe/blatt/zeichen';
import { getMappeRecipient } from '@/lib/mappe/context';
import { buildSubject } from '@/lib/mappe/template';
import { mappePdf } from './blatt';
import { mappeDateiname } from './dateiname';

/**
 * Mappe als PDF im Anhang der Team-Mail (Schritt 4a/4b): bei der Bewerbung mit Name, Stelle und Betreff wie im
 * Editor, beim Nachreichen ohne Namen (mehr als die Bewerbungsnummer kennt der Server dort nicht). Den Betreff sendet der
 * Editor seit L5 mit der Mappe (`mappe.subject`); fehlt er (ältere Tabs, im Editor keine Stelle gewählt), rechnet der
 * Server ihn wie vorher. Gleicher Betreff, gleiche Bytes. Datum in Europe/Berlin aus dem Eingang; der Eingang ist auch
 * die Erstellungszeit in der Datei (gleiche Bewerbung, gleiche Bytes).
 *
 * Die PDF ist eine Zugabe: Ohne Mappe, nur mit angetippter Praxiserfahrung, mit MAPPE_PDF=aus, mit Zeichen, die die
 * Schrift nicht hat, bei einem Fehler oder nach dem Zeitlimit gibt es keine – die Mail geht dann wie bisher mit der
 * Mappe als Text. Logs nur Nummer, Seiten, Dauer und Größe.
 */

/**
 * Zeitlimit für die PDF: deckt das Warten (Laden von react-pdf und Schriften), nicht das Rechnen; den Satz begrenzt
 * fuerPdf mit ZEILEN_HOECHSTENS (unten). Mit Datenbank (5 s), höchstens 3 s für die PDF und Resend (10 s, ein schneller
 * zweiter Versuch) bleibt die Antwort unter den 25 s des Browsers.
 */
export const PDF_ZEITLIMIT_MS = 3_000;

export interface MappeAnhang {
  dateiname: string;
  /** PDF als Base64 (Resend-Anhang). */
  inhalt: string;
  seiten: number;
}

const DATUM = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin' });

/** Ergebnis, wenn keine PDF entsteht; der Grund steht nur im Log. */
type Grund = 'aus' | 'leer' | 'spam' | 'zeichen' | 'umfang' | 'zeitlimit' | 'fehler';

/**
 * Obergrenze für den Satz: geschätzte Zeilen (rund 30 Seiten). Das Zeitlimit oben deckt nur das Warten; den Satz selbst
 * kann es nicht abbrechen (react-pdf rechnet in einem Stück). Nach fuerPdf liegt jede Mappe innerhalb der
 * Schema-Grenzen unter rund 20 Seiten (Fixture `maximal`: 18 Seiten, 1–3 s); die Grenze fängt nur Ausreißer ab.
 */
export const ZEILEN_HOECHSTENS = 1400;

/** Grob geschätzte Zeilen des ganzen Dokuments (80 Zeichen je Zeile, jede Zeile des Briefs mindestens eine). */
export function geschaetzterUmfang(dokument: MappeDokument): number {
  const zeilen = (text: string) => text.split('\n').reduce((summe, zeile) => summe + Math.max(1, Math.ceil(zeile.length / 80)), 0);
  return texte(dokument).reduce((summe, text) => summe + zeilen(text), 0);
}

async function mitZeitlimit<T>(arbeit: Promise<T>, ms: number): Promise<T | 'zeitlimit'> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limit = new Promise<'zeitlimit'>((resolve) => {
    timer = setTimeout(() => resolve('zeitlimit'), ms);
  });
  try {
    return await Promise.race([arbeit, limit]);
  } finally {
    clearTimeout(timer);
  }
}

async function erstellen(
  reference: string,
  mappe: Mappe | undefined,
  eingaben: Omit<MappeDokumentEingaben, 'mappe' | 'empfaenger' | 'datum'>,
  eingang: Date,
): Promise<MappeAnhang | null> {
  const ohne = (grund: Grund) => {
    if (grund !== 'leer' && grund !== 'aus') console.warn(`[mappe-pdf] ${reference}: keine PDF (${grund})`);
    return null;
  };
  if (!mappe || nurPraxiserfahrung(mappe)) return ohne('leer');
  if (!mappePdfEnabled()) return ohne('aus');

  const dokument = mappeDokument({ ...eingaben, mappe, empfaenger: getMappeRecipient(), datum: DATUM.format(eingang) });
  if (!dokument) return ohne('leer');
  const fuerSatz = fuerPdf(dokument);
  if (!fuerSatz) return ohne('zeichen');
  if (!fuerSatz.anschreiben && !fuerSatz.lebenslauf) return ohne('leer');
  if (geschaetzterUmfang(fuerSatz) > ZEILEN_HOECHSTENS) return ohne('umfang');

  const start = Date.now();
  try {
    const ergebnis = await mitZeitlimit(mappePdf(fuerSatz, eingang), PDF_ZEITLIMIT_MS);
    if (ergebnis === 'zeitlimit') return ohne('zeitlimit');
    console.info(
      `[mappe-pdf] ${reference}: ${ergebnis.seiten} Seiten, ${Date.now() - start} ms, ${Math.round(ergebnis.pdf.length / 1024)} KB`,
    );
    return { dateiname: mappeDateiname(reference, fuerSatz.name ?? undefined), inhalt: ergebnis.pdf.toString('base64'), seiten: ergebnis.seiten };
  } catch {
    return ohne('fehler');
  }
}

/**
 * PDF zur Bewerbung: Name, Betreff und Stelle wie in der Mappe des Bewerbers; der Betreff aus der Mappe, sonst aus der
 * Stelle der Bewerbung. Bei Spamverdacht keine PDF (die Mail markiert ihn; kein Satz für Bot-Anfragen).
 */
export async function mappeAnhangFuerBewerbung(app: ReferencedApplication): Promise<MappeAnhang | null> {
  if (app.suspectedSpam) {
    if (app.mappe) console.warn(`[mappe-pdf] ${app.reference}: keine PDF (spam)`);
    return null;
  }
  const job = getJobById(app.job.id);
  const initiative = !job;
  const betreff = mitInhaltFuerSchrift(app.mappe?.subject) ?? buildSubject(job ? { title: job.title, category: job.category } : null, initiative);
  return erstellen(app.reference, app.mappe, { name: app.name, betreff, stelle: app.job.shortTitle }, app.submittedAt);
}

/**
 * PDF zur nachgereichten Mappe: „Bewerbungsmappe“ im Kopf, der Betreff aus der Mappe, sonst die Nummer im Betreff. Die
 * Nummer steht immer im Dateinamen und im Betreff der Mail.
 */
export function mappeAnhangFuerErgaenzung(followUp: NormalizedFollowUp): Promise<MappeAnhang | null> {
  const betreff = mitInhaltFuerSchrift(followUp.mappe?.subject) ?? `Bewerbungsmappe zur Bewerbung ${followUp.reference}`;
  return erstellen(followUp.reference, followUp.mappe, { betreff }, followUp.receivedAt);
}
