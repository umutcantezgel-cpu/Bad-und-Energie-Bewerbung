import type { MappeSectionId } from '@/lib/applications/constants';
import type { Mappe } from '@/lib/applications/schema';
import type { MappeRecipient } from '@/lib/mappe/types';
import { aufbauFolge } from './aufbau';
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

interface AbschnittBasis {
  id: MappeSectionId;
  /** Überschrift im Lebenslauf: eigener Titel aus `mappe.sections`, sonst der Standardtitel (./aufbau). */
  titel: string;
}

/**
 * Ein Abschnitt des Lebenslaufs (L5) in der Reihenfolge der Mappe: Stationen (Berufserfahrung, Schule und Ausbildung),
 * Punkte (Schwerpunkte, Sprachen) oder Text (Kurzprofil, Führerschein, Interessen, eigener Abschnitt).
 */
export type MappeAbschnitt =
  | (AbschnittBasis & { art: 'beruf'; stationen: readonly MappeBerufsstation[] })
  | (AbschnittBasis & { art: 'ausbildung'; stationen: readonly MappeStation[] })
  | (AbschnittBasis & { art: 'punkte'; punkte: readonly string[] })
  | (AbschnittBasis & { art: 'text'; text: string });

export interface MappeDokument {
  /** Titel der PDF, z. B. „Bewerbung Max Müller – Anlagenmechaniker SHK“. */
  titel: string;
  /** Name im Kopf und an der Unterschrift; null bei einer nachgereichten Mappe. */
  name: string | null;
  betreff: string;
  /** Datumszeile, z. B. „27. Oktober 2026“. */
  datum: string;
  anschreiben: { empfaenger: readonly string[]; text: string } | null;
  /** Abschnitte mit Inhalt in der Reihenfolge der Mappe; null ohne jeden Eintrag (kein Blatt). */
  lebenslauf: { abschnitte: readonly MappeAbschnitt[] } | null;
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

/** „Deutsch (Muttersprache)“, ohne Niveau nur die Sprache. */
export function spracheText(eintrag: { language: string; level?: string }): string {
  const level = eintrag.level?.trim();
  return level ? `${eintrag.language.trim()} (${level})` : eintrag.language.trim();
}

/** „Klasse B“, „Klassen B und BE“, „Klassen B, BE und C1E“; ohne Klassen leer. */
export function fuehrerscheinText(klassen: readonly string[]): string {
  const liste = sauber(klassen);
  if (liste.length === 0) return '';
  if (liste.length === 1) return `Klasse ${liste[0]}`;
  return `Klassen ${liste.slice(0, -1).join(', ')} und ${liste[liste.length - 1]}`;
}

/**
 * Abschnitte des Lebenslaufs mit Inhalt, in der Reihenfolge aus `mappe.sections` (fehlende in Standardreihenfolge
 * dahinter, ./aufbau). Leere Stationen und leere Texte fallen weg wie bisher.
 */
export function lebenslaufAbschnitte(mappe: Mappe): MappeAbschnitt[] {
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
  const sprachen = (mappe.languages ?? []).map(spracheText).filter(Boolean);
  const fuehrerschein = fuehrerscheinText(mappe.drivingLicenses ?? []);
  const text = (id: MappeSectionId, titel: string, wert: string | undefined): MappeAbschnitt | null =>
    wert?.trim() ? { id, titel, art: 'text', text: wert.trim() } : null;

  return aufbauFolge(mappe.sections)
    .map(({ id, titel }): MappeAbschnitt | null => {
      switch (id) {
        case 'career':
          return beruf.length > 0 ? { id, titel, art: 'beruf', stationen: beruf } : null;
        case 'education':
          return ausbildung.length > 0 ? { id, titel, art: 'ausbildung', stationen: ausbildung } : null;
        case 'skills':
          return schwerpunkte.length > 0 ? { id, titel, art: 'punkte', punkte: schwerpunkte } : null;
        case 'languages':
          return sprachen.length > 0 ? { id, titel, art: 'punkte', punkte: sprachen } : null;
        case 'drivingLicenses':
          return text(id, titel, fuehrerschein);
        case 'profile':
          return text(id, titel, mappe.profile);
        case 'interests':
          return text(id, titel, mappe.interests);
        case 'custom':
          return text(id, titel, mappe.customText);
      }
    })
    .filter((abschnitt): abschnitt is MappeAbschnitt => abschnitt !== null);
}

/** Dokument der Mappe; null, wenn weder Anschreiben noch Lebenslauf etwas zu zeigen haben. */
export function mappeDokument({ name, betreff, stelle, datum, empfaenger, mappe }: MappeDokumentEingaben): MappeDokument | null {
  const text = mappe.coverLetter.trim();
  const abschnitte = lebenslaufAbschnitte(mappe);

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
  const lebenslauf = abschnitte.length > 0 ? { abschnitte } : null;
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
