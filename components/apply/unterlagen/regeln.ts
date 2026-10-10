/**
 * Regeln für eingereichte Unterlagen (E-BEW-012, R5-UPLOAD-01), rein und ohne Laufzeit-Importe.
 *
 * Formate und Grenzen folgen der Architektur von Phase 2 (ROADMAP §8.1, Tabelle `application_files`):
 * PDF, JPEG, PNG, HEIC/HEIF und WebP, je Datei höchstens 10 MiB, höchstens fünf Dateien. Die endgültige
 * Prüfung (Magic Bytes, SHA-256) macht der Server (`lib/uploads/**`, nicht diese Schicht); hier wird nur
 * vorab gefiltert, damit niemand eine Datei überträgt, die sicher abgelehnt wird.
 */

export interface UnterlagenFormat {
  /** Name in Hinweis und Fehlertext. */
  name: string;
  mime: string;
  endungen: readonly string[];
}

export const UNTERLAGEN_FORMATE: readonly UnterlagenFormat[] = Object.freeze([
  { name: 'PDF', mime: 'application/pdf', endungen: ['pdf'] },
  { name: 'JPG', mime: 'image/jpeg', endungen: ['jpg', 'jpeg'] },
  { name: 'PNG', mime: 'image/png', endungen: ['png'] },
  { name: 'HEIC', mime: 'image/heic', endungen: ['heic'] },
  { name: 'HEIF', mime: 'image/heif', endungen: ['heif'] },
  { name: 'WebP', mime: 'image/webp', endungen: ['webp'] },
]);

const MIB = 1024 * 1024;

export const UNTERLAGEN_GRENZEN = Object.freeze({
  /** Höchstgröße je Datei in Byte (10 MiB wie `application_files`). */
  maxBytes: 10 * MIB,
  /** Höchstzahl der Dateien je Einreichung. */
  maxDateien: 5,
});

/** Formate für Menschen: „PDF, JPG, PNG, HEIC oder WebP“ (HEIF ist die Familie von HEIC und wird nicht eigens genannt). */
export const FORMATE_TEXT = 'PDF, JPG, PNG, HEIC oder WebP';

/** `accept` des Dateifelds: Endungen und MIME-Typen, damit auch Handys mit HEIC-Fotos die Auswahl anbieten. */
export const UNTERLAGEN_ACCEPT = [
  ...UNTERLAGEN_FORMATE.flatMap((format) => format.endungen.map((endung) => `.${endung}`)),
  ...UNTERLAGEN_FORMATE.map((format) => format.mime),
].join(',');

/** Was die Prüfung von einer Datei braucht (File erfüllt das). */
export interface DateiAngaben {
  name: string;
  size: number;
  type: string;
}

export type Pruefergebnis =
  | { ok: true; mime: string }
  | { ok: false; grund: 'typ' | 'groesse' | 'leer'; text: string };

const ZAHL = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
/** Geschütztes Leerzeichen zwischen Zahl und Einheit (KERN K-012). */
const NBSP = ' ';

/** Dateigröße für Menschen: „850 KB“, „2,4 MB“ (Basis 1024, wie die Grenze). */
export function groesseText(bytes: number): string {
  if (bytes < MIB) return `${Math.max(1, Math.round(bytes / 1024))}${NBSP}KB`;
  return `${ZAHL.format(Math.round((bytes / MIB) * 10) / 10)}${NBSP}MB`;
}

const GRENZE_TEXT = `${UNTERLAGEN_GRENZEN.maxBytes / MIB}${NBSP}MB`;

function endungVon(name: string): string {
  const punkt = name.lastIndexOf('.');
  return punkt > 0 ? name.slice(punkt + 1).toLowerCase() : '';
}

/** MIME-Typ der Datei: der gemeldete Typ, wenn er erlaubt ist; ohne Typ (oft bei HEIC) nach der Endung. */
function erlaubterTyp(datei: DateiAngaben): string | null {
  const typ = datei.type.trim().toLowerCase();
  const nachTyp = UNTERLAGEN_FORMATE.find((format) => format.mime === typ);
  if (nachTyp) return nachTyp.mime;
  if (typ !== '' && typ !== 'application/octet-stream') return null;
  const endung = endungVon(datei.name);
  return UNTERLAGEN_FORMATE.find((format) => format.endungen.includes(endung))?.mime ?? null;
}

export const UNTERLAGEN_FEHLER = Object.freeze({
  typ: (name: string) => `„${name}“ geht nicht: Bitte nur ${FORMATE_TEXT}.`,
  groesse: (name: string, bytes: number) =>
    `„${name}“ ist zu groß (${groesseText(bytes)}). Höchstens ${GRENZE_TEXT} je Datei.`,
  leer: (name: string) => `„${name}“ ist leer. Bitte wähl die Datei noch einmal aus.`,
  anzahl: (name: string) => `Höchstens ${UNTERLAGEN_GRENZEN.maxDateien} Dateien: „${name}“ ist nicht dabei.`,
});

/** Vorprüfung einer gewählten Datei: Typ, Leere und Größe, in dieser Reihenfolge. */
export function pruefeDatei(datei: DateiAngaben): Pruefergebnis {
  const mime = erlaubterTyp(datei);
  if (!mime) return { ok: false, grund: 'typ', text: UNTERLAGEN_FEHLER.typ(datei.name) };
  if (datei.size <= 0) return { ok: false, grund: 'leer', text: UNTERLAGEN_FEHLER.leer(datei.name) };
  if (datei.size > UNTERLAGEN_GRENZEN.maxBytes) {
    return { ok: false, grund: 'groesse', text: UNTERLAGEN_FEHLER.groesse(datei.name, datei.size) };
  }
  return { ok: true, mime };
}
