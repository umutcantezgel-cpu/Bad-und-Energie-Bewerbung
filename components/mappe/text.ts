/**
 * Texte der Mappe-Seite /bewerbung/mappe (R5-MAPPE-01, E-023): Seitenkopf (Variante `arbeit`) und die Mikrotexte
 * von Stand und Aktionen. Nur aus FACTS und COMPANY; Mikrotexte direkt (K-012), keine neuen Zusagen.
 */
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { MAPPE_PATH } from '@/lib/apply/params';
import { MAPPE_ABSCHNITTE } from './stand';

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
  zweitweg: Object.freeze({ href: MAPPE_PATH.replace(/\/mappe$/, ''), label: 'Ohne Mappe bewerben' }),
  masse: Object.freeze([
    Object.freeze({ wert: String(MAPPE_ABSCHNITTE.length), name: 'Abschnitte' }),
    Object.freeze({ wert: '2', name: 'Seiten A4' }),
  ]),
});

export const STAND_TEXT = Object.freeze({
  titel: 'Stand deiner Mappe',
  /** Zugänglicher Name des Rings (role="meter"). */
  ring: 'Stand deiner Mappe',
  listeName: 'Abschnitte der Mappe',
  erledigt: 'erledigt',
  offen: 'offen',
  naechster: 'Als Nächstes',
  fertig: 'Alle fünf Abschnitte ausgefüllt.',
});
