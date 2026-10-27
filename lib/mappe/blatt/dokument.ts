import type { Mappe } from '@/lib/applications/schema';
import type { MappeRecipient } from '@/lib/mappe/types';
import { designAus, type MappeDesign } from './design';

/**
 * Bewerbungsmappe als Dokument (Schritt 4a): was auf den Blättern steht, getrennt von der Darstellung. Gebaut aus der
 * gesendeten Mappe; die PDF fürs Team (lib/mappe/pdf) setzt es im Design „Schlicht“ (lib/mappe/blatt/schlicht.ts).
 * Wie im Druck der Vorschau (components/mappe/MappePreview.tsx) fallen leere Angaben weg; ein Anschreiben ohne Text und
 * ein Lebenslauf ohne Einträge bekommen kein Blatt. Wohnort, Telefon, E-Mail und Foto reisen nicht mit der Mappe (sie
 * bleiben im Browser): Der Kopf trägt nur den Namen, die Datumszeile nur das Datum. Eine nachgereichte Mappe kennt der
 * Server nur über die Bewerbungsnummer (kein Name, keine Stelle): Dann steht „Bewerbungsmappe“ im Kopf und die Nummer im
 * Betreff. Client-sicher, ohne Abhängigkeiten.
 */

export interface MappeStation {
  zeit: string;
  titel: string;
  /** Betrieb bzw. Schule und Ort, mit Komma verbunden. */
  ort: string;
}

export interface MappeBerufsstation extends MappeStation {
  aufgaben: readonly string[];
}

export interface MappeDokument {
  /** Titel der PDF, z. B. „Bewerbung Max Müller – Anlagenmechaniker SHK“. */
  titel: string;
  /** Name im Kopf und an der Unterschrift; null bei einer nachgereichten Mappe. */
  name: string | null;
  betreff: string;
  /** Datumszeile, z. B. „27. Oktober 2026“. */
  datum: string;
  anschreiben: { empfaenger: readonly string[]; text: string } | null;
  lebenslauf: {
    beruf: readonly MappeBerufsstation[];
    ausbildung: readonly MappeStation[];
    schwerpunkte: readonly string[];
  } | null;
  /** Design, Farbe und Schrift aus der Mappe (L3); ohne Angabe der Standard „Schlicht“, Navy, Sachlich. */
  design: MappeDesign;
}

export interface MappeDokumentEingaben {
  /** Name aus der Bewerbung (Pflichtfeld des Flows); fehlt bei einer nachgereichten Mappe. */
  name?: string;
  /** Betreffzeile wie im Editor (buildSubject in lib/mappe/template.ts), nachgereicht mit der Bewerbungsnummer. */
  betreff: string;
  /** Kurzer Titel der Stelle oder „Initiativbewerbung“, für den Titel der PDF (nur mit Namen). */
  stelle?: string;
  datum: string;
  empfaenger: MappeRecipient;
  mappe: Mappe;
}

const sauber = (werte: readonly (string | undefined)[]) => werte.map((wert) => wert?.trim() ?? '').filter(Boolean);

/** Dokument der Mappe; null, wenn weder Anschreiben noch Lebenslauf etwas zu zeigen haben. */
export function mappeDokument({ name, betreff, stelle, datum, empfaenger, mappe }: MappeDokumentEingaben): MappeDokument | null {
  const text = mappe.coverLetter.trim();
  const beruf = mappe.careerStations
    .map((station) => ({
      zeit: station.period.trim(),
      titel: station.role.trim(),
      ort: sauber([station.company, station.location]).join(', '),
      aufgaben: sauber(station.tasks),
    }))
    .filter((station) => station.zeit || station.titel || station.ort || station.aufgaben.length > 0);
  const ausbildung = mappe.educationStations
    .map((station) => ({
      zeit: station.period.trim(),
      titel: station.degree.trim(),
      ort: sauber([station.institution, station.location]).join(', '),
    }))
    .filter((station) => station.zeit || station.titel || station.ort);
  const schwerpunkte = sauber(mappe.skills);

  const anschreiben = text
    ? {
        empfaenger: sauber([
          empfaenger.companyName,
          empfaenger.attention,
          empfaenger.street,
          `${empfaenger.postalCode} ${empfaenger.city}`,
        ]),
        text,
      }
    : null;
  const lebenslauf = beruf.length + ausbildung.length + schwerpunkte.length > 0 ? { beruf, ausbildung, schwerpunkte } : null;
  if (!anschreiben && !lebenslauf) return null;

  const vollerName = name?.trim() || null;
  return {
    titel: vollerName && stelle ? `Bewerbung ${vollerName} – ${stelle}` : betreff,
    name: vollerName,
    betreff,
    datum,
    anschreiben,
    lebenslauf,
    design: designAus(mappe.design),
  };
}
