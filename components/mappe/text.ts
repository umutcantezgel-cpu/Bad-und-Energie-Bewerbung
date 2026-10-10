/**
 * Texte des Seitenkopfs von /bewerbung/mappe (R5-MAPPE-01, E-023, Variante `arbeit`). Nur auf dem Server:
 * COMPANY und FACTS bleiben aus dem Client-Bundle (die Mikrotexte des Werkzeugs stehen in stand.ts).
 * Nur Belegtes; Mikrotexte direkt (K-012), keine neuen Zusagen.
 */
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { MAPPE_ABSCHNITTE } from './stand';

/** Der Bewerbungsflow; die Mappe ist ein freiwilliges Werkzeug daneben (ROADMAP §6). */
export const APPLY_PATH = '/bewerbung';

export interface MappeKopfText {
  etikett: string;
  titel: string;
  unterzeile: string;
  einleitung: string;
  zweitweg: { href: string; label: string };
  masse: readonly { wert: string; name: string }[];
}

/** Kopf: die Mappe ist freiwillig (Fakt noCvNeeded); der Zweitweg führt ohne Mappe in den Flow. */
export const MAPPE_KOPF: Readonly<MappeKopfText> = Object.freeze({
  etikett: `Bewerbung · ${COMPANY.address.city}`,
  titel: 'Bewerbungsmappe erstellen.',
  unterzeile: 'Anschreiben und Lebenslauf auf A4.',
  einleitung: `Zum Drucken oder als PDF. Die Mappe ist freiwillig: ${FACTS.noCvNeeded.long}`,
  zweitweg: Object.freeze({ href: APPLY_PATH, label: 'Ohne Mappe bewerben' }),
  masse: Object.freeze([
    Object.freeze({ wert: String(MAPPE_ABSCHNITTE.length), name: 'Abschnitte' }),
    Object.freeze({ wert: '2', name: 'Seiten A4' }),
  ]),
});
