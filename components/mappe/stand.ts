import type { MappeEditorState } from '@/lib/mappe/editor';
import { isCareerStationEmpty, isEducationStationEmpty } from '@/lib/mappe/stations';

/**
 * Stand der Mappe (E-BEW-006/007): fünf Abschnitte, je „erledigt“ oder „offen“, nur aus echten Eingaben
 * (dasselbe Prinzip wie isMappeEmpty in lib/mappe/editor.ts). Die Vorlage des Anschreibens zählt nicht.
 *
 * Festlegung „erledigt“ (Pass E-BEW-006, Abnahme):
 * - Persönliches: Name eingetragen
 * - Stelle: Stelle oder Initiativbewerbung gewählt
 * - Schwerpunkte: mindestens einer
 * - Arbeitsstil und Anschreiben: Arbeitsstil gewählt oder eigener Text
 * - Berufserfahrung und Ausbildung: mindestens eine nicht leere Station
 */

export type MappeAbschnittId =
  | 'mappe-persoenliches'
  | 'mappe-stelle'
  | 'mappe-schwerpunkte'
  | 'mappe-anschreiben'
  | 'mappe-lebenslauf';

export interface MappeAbschnitt {
  /** Anker des Abschnitts (id der section im Editor). */
  id: MappeAbschnittId;
  /** Titel wie die h2 des Abschnitts. */
  titel: string;
  /** Kurzname für knappe Stellen (Checkliste am Handy, „Als Nächstes“). */
  kurz: string;
}

/** Mikrotexte von Stand und Ring (K-012). */
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

/** Reihenfolge = Reihenfolge im Editor (1–5). */
export const MAPPE_ABSCHNITTE: readonly MappeAbschnitt[] = Object.freeze([
  { id: 'mappe-persoenliches', titel: 'Persönliches', kurz: 'Persönliches' },
  { id: 'mappe-stelle', titel: 'Stelle', kurz: 'Stelle' },
  { id: 'mappe-schwerpunkte', titel: 'Schwerpunkte', kurz: 'Schwerpunkte' },
  { id: 'mappe-anschreiben', titel: 'Arbeitsstil und Anschreiben', kurz: 'Anschreiben' },
  { id: 'mappe-lebenslauf', titel: 'Berufserfahrung und Ausbildung', kurz: 'Lebenslauf' },
] as const);

const ERLEDIGT: Record<MappeAbschnittId, (state: MappeEditorState) => boolean> = {
  'mappe-persoenliches': (state) => state.person.name.trim().length > 0,
  'mappe-stelle': (state) => state.jobId !== '',
  'mappe-schwerpunkte': (state) => state.skills.some((skill) => skill.trim().length > 0),
  'mappe-anschreiben': (state) => state.workStyleId !== null || Boolean(state.customLetter?.trim()),
  'mappe-lebenslauf': (state) =>
    state.careerStations.some((station) => !isCareerStationEmpty(station)) ||
    state.educationStations.some((station) => !isEducationStationEmpty(station)),
};

export interface MappeAbschnittStand extends MappeAbschnitt {
  /** Position im Editor, 1-basiert. */
  nummer: number;
  erledigt: boolean;
}

export interface MappeStandWerte {
  abschnitte: MappeAbschnittStand[];
  erledigt: number;
  gesamt: number;
  /** Erster offener Abschnitt (für „Als Nächstes“), sonst null. */
  naechster: MappeAbschnittStand | null;
}

export function mappeStand(state: MappeEditorState): MappeStandWerte {
  const abschnitte = MAPPE_ABSCHNITTE.map((abschnitt, index) => ({
    ...abschnitt,
    nummer: index + 1,
    erledigt: ERLEDIGT[abschnitt.id](state),
  }));
  return {
    abschnitte,
    erledigt: abschnitte.filter((abschnitt) => abschnitt.erledigt).length,
    gesamt: abschnitte.length,
    naechster: abschnitte.find((abschnitt) => !abschnitt.erledigt) ?? null,
  };
}

/** „0 von 5 erledigt“ – derselbe Wortlaut wie der Wert des Rings für Screenreader. */
export function standText(erledigt: number, gesamt: number): string {
  return `${erledigt} von ${gesamt} erledigt`;
}

/** Bedienbares Feld in einem Abschnitt: kein verstecktes, kein abgeschaltetes, keins außerhalb der Tab-Folge. */
export const ERSTES_FELD =
  'input:not([type="hidden"]):not([tabindex="-1"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]):not([tabindex="-1"])';

/** Markiert Bedienleisten (Verschieben, Entfernen), die der Sprung überspringt: Ziel ist ein Feld, kein Werkzeug. */
export const SPRUNG_NEIN = 'data-sprung-nein';

/** Erstes Feld eines Abschnitts in Lesereihenfolge, ohne Bedienleisten. */
export function erstesFeld(section: ParentNode): HTMLElement | null {
  for (const feld of section.querySelectorAll<HTMLElement>(ERSTES_FELD)) {
    if (!feld.closest(`[${SPRUNG_NEIN}]`)) return feld;
  }
  return null;
}

/**
 * Sprung zu einem Abschnitt (E-BEW-006): bringt ihn in Sicht und setzt den Fokus auf sein erstes Feld.
 * Ohne Feld bekommt die Überschrift den Fokus; ohne JS trägt der Anker allein. `sanft`: weiches Scrollen,
 * nur wenn Bewegung erlaubt ist (reduziert springt die Seite).
 */
export function springeZuAbschnitt(id: MappeAbschnittId, { sanft }: { sanft: boolean }, doc: Document = document): boolean {
  const section = doc.getElementById(id);
  if (!section) return false;
  section.scrollIntoView({ block: 'start', behavior: sanft ? 'smooth' : 'auto' });
  const feld = erstesFeld(section) ?? section.querySelector<HTMLElement>('h2');
  if (feld) {
    if (feld.tagName === 'H2' && !feld.hasAttribute('tabindex')) feld.setAttribute('tabindex', '-1');
    feld.focus({ preventScroll: true });
  }
  return true;
}
