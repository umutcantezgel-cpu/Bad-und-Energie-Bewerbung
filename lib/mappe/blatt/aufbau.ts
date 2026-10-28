import { MAPPE_SECTION_IDS, type MappeSectionId } from '@/lib/applications/constants';
import type { MappeSection } from '@/lib/applications/mappe-data';

/**
 * Aufbau des Lebenslaufs (L5): Standardtitel, Spalten im Design „Zweispaltig“ und die Reihenfolge aus `mappe.sections`.
 * Vorschau, PDF und Team-Mail lesen dieselben Regeln. Alte Mappen haben die neuen Abschnitte nicht und behalten so genau
 * ihre Reihenfolge (Berufserfahrung, Schule und Ausbildung, Schwerpunkte). Client-sicher.
 */

export const STANDARD_TITEL: Readonly<Record<MappeSectionId, string>> = Object.freeze({
  profile: 'Kurzprofil',
  career: 'Berufserfahrung',
  education: 'Schule und Ausbildung',
  skills: 'Schwerpunkte',
  languages: 'Sprachen',
  drivingLicenses: 'Führerschein',
  interests: 'Interessen',
  custom: 'Weiteres',
});

/** Name im Editor (Aufbau, Zeichen-Hinweis): wie der Standardtitel, nur der eigene Abschnitt heißt anders. */
export const ABSCHNITT_NAME: Readonly<Record<MappeSectionId, string>> = Object.freeze({ ...STANDARD_TITEL, custom: 'Eigener Abschnitt' });

/** Grundabschnitte: In der Vorschau steht leer ein Platzhalter (nur am Bildschirm), die übrigen erscheinen erst mit Inhalt. */
export const GRUNDABSCHNITTE: ReadonlySet<MappeSectionId> = new Set<MappeSectionId>(['career', 'education', 'skills']);

/** Zweispaltig: kurze Abschnitte in der getönten Seitenspalte, die übrigen in der Hauptspalte. */
export const SEITENSPALTE: ReadonlySet<MappeSectionId> = new Set<MappeSectionId>(['skills', 'languages', 'drivingLicenses', 'interests']);

export interface AufbauPlatz {
  id: MappeSectionId;
  titel: string;
}

/** Gelistete zuerst (in ihrer Reihenfolge, mit eigenem Titel), alle übrigen in Standardreihenfolge dahinter. */
export function aufbauFolge(sections?: readonly MappeSection[]): AufbauPlatz[] {
  const folge: AufbauPlatz[] = [];
  const gesehen = new Set<MappeSectionId>();
  for (const { id, title } of sections ?? []) {
    if (gesehen.has(id)) continue;
    gesehen.add(id);
    folge.push({ id, titel: title?.trim() || STANDARD_TITEL[id] });
  }
  for (const id of MAPPE_SECTION_IDS) if (!gesehen.has(id)) folge.push({ id, titel: STANDARD_TITEL[id] });
  return folge;
}
