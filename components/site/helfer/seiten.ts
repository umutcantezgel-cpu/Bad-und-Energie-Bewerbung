/**
 * Wo der Helfer auftritt. Reine Funktion ohne Datenimporte, damit die Insel klein bleibt.
 *
 * Er fehlt im Bewerbungsweg (/bewerbung und alles darunter): Dort nimmt der Rahmen alles Ablenkende weg
 * (Fokusmodus, KERN K-003.6 „Lassen: Effekte im Bewerbungsflow“). Und er fehlt auf den Rechtsseiten:
 * Impressum und Datenschutz bleiben ruhig.
 */
import { isFocusMode } from '../nav';

/** Seiten ohne Helfer, jeweils samt allem darunter. */
export const OHNE_HELFER: readonly string[] = ['/impressum', '/datenschutz'];

/** Ordner der Bildebenen. Die Versionsnummer wechselt mit jeder neuen Zeichnung (Bilder bleiben ein Jahr im Cache). */
export const HELFER_BILDER = '/helfer/v1/';

export function helferSichtbar(pfad: string | null | undefined): boolean {
  if (isFocusMode(pfad)) return false;
  const p = (pfad ?? '/').split(/[?#]/)[0];
  return !OHNE_HELFER.some((sperre) => p === sperre || p.startsWith(`${sperre}/`));
}
