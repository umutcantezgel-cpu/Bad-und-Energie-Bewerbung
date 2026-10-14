/**
 * Texte der Bewerbungsseite /bewerbung (R5-BEW-01, E-023): Seitenkopf, „Lieber direkt sprechen?“ und das
 * Regionalband (E-BEW-008). Nur aus FACTS, COMPANY und REGION; Mikrotexte direkt (K-012), keine neuen Zusagen.
 */
import { COMPANY } from '@/lib/content/company';
import { FACTS, JE_NACH_STELLE, offenBei } from '@/lib/content/facts';
import { REGION } from '@/lib/content/region';
import type { Job } from '@/lib/jobs/schema';

/** Geschütztes Leerzeichen zwischen Zahl und Einheit (K-012: 35 km, 60 s). */
const NBSP = ' ';
const geschuetzt = (text: string) => text.replace(/ /g, NBSP);
/** Wert eines Fakts, der hier gebraucht wird; fehlt er, fällt es beim Laden auf statt als „undefined“ im Text. */
function wertVon(id: 'apply60s' | 'radius35'): string {
  const wert = FACTS[id].value;
  if (!wert) throw new Error(`Fakt ${id} hat keinen Wert`);
  return wert;
}

export interface SeitenMass {
  wert: string;
  name: string;
}

export interface BewerbungKopf {
  etikett: string;
  titel: string;
  unterzeile: string;
  masse: readonly SeitenMass[];
  /** Nur für alte Tresor-Links (`?tab=vault`, `?direct=true`): Hinweis über dem Zweitweg. */
  mikrotext?: string;
  zweitweg: { href: string; label: string };
}

/**
 * Zweitweg zur Zeile über Unterlagen (UnterlagenZeile). Sagt, was dort passiert (K-012: WhatsApp oder E-Mail), statt
 * wie bisher „Lieber mit Unterlagen bewerben“ einen Upload zu versprechen, den es nicht gibt (Plan §D, P0).
 */
export const UNTERLAGEN_ZWEITWEG = 'Unterlagen per WhatsApp oder E-Mail schicken';

/**
 * Kopf der Bewerbungsseite (Seitenkopf, Variante `arbeit`). `diskret`: Die Zusage gilt nicht für die
 * Ausbildung (kein Arbeitgeber, getDiscretionPromise). `unterlagenWunsch`: Der Besucher kam über einen alten
 * Link des Dokumenten-Tresors (E-BEW-027) und erfährt gleich oben, wo Unterlagen hingehören.
 */
export function bewerbungKopf({ diskret, unterlagenWunsch, unterlagenAnker }: { diskret: boolean; unterlagenWunsch: boolean; unterlagenAnker: string }): BewerbungKopf {
  return {
    etikett: `Bewerbung · ${COMPANY.address.city}`,
    titel: 'Jetzt bewerben.',
    // Fakten noCvNeeded und discretion (bzw. unverbindlich bei der Ausbildung)
    unterzeile: diskret ? 'Ohne Lebenslauf. Diskret.' : 'Ohne Lebenslauf. Unverbindlich.',
    // Fakt apply60s: „ca. 60 Sekunden“
    masse: [{ wert: `${wertVon('apply60s')}${NBSP}s`, name: 'Ungefähre Dauer' }],
    mikrotext: unterlagenWunsch ? 'Du möchtest Unterlagen schicken? So geht es:' : undefined,
    zweitweg: { href: `#${unterlagenAnker}`, label: UNTERLAGEN_ZWEITWEG },
  };
}

export const DIREKT_TEXT = Object.freeze({
  /** Fakt directLine. */
  etikett: 'Direkter Draht',
  titel: 'Lieber direkt sprechen?',
});

export interface RegionalMass extends SeitenMass {
  /** Zeile unter dem Maß (Martian Mono nur im Wert, hier Atkinson). */
  detail?: string;
}

/** Stelle, für die das Regionalband spricht: Kategorie (Fakt offenFuer) und Arbeitsort (Einsatzgebiet ja oder nein). */
export type RegionalStelle = Pick<Job, 'category' | 'location'>;

export interface RegionalbandText {
  etikett: string;
  titel: string;
  /** REGION.summary; null, wenn keine der Stellen auf Baustellen im Umkreis arbeitet (Büro am Firmensitz). */
  einleitung: string | null;
  masse: readonly RegionalMass[];
  standort: { name: string; zeilen: readonly string[] };
  arbeitszeit: string;
  fahrzeiten: { name: string; orte: readonly string[] };
  link: { href: string; label: string };
}

const STANDORT = Object.freeze({
  name: 'Firmensitz',
  zeilen: Object.freeze([COMPANY.address.street, `${COMPANY.address.postalCode} ${COMPANY.address.city}`]),
});

/** V6-G1: Fahrzeit bis zum Firmensitz für die Orte außerhalb der Kernzone (REGION.locations). */
const FAHRZEITEN = Object.freeze({
  name: `Fahrzeit bis ${REGION.center.name}`,
  orte: Object.freeze(REGION.locations.filter((ort) => !ort.isCoreZone).map((ort) => `${ort.name} ca.${NBSP}${ort.commuteMinutes}${NBSP}Min.`)),
});

/**
 * Regionalband (E-BEW-008): Einsatzgebiet, Arbeitszeit, Standort und „Keine Fernmontage“, Link auf die Karte, für die
 * Stellen, um die es geht: die vorgewählte Stelle, ohne Vorauswahl alle offenen (Sammelfläche, Prüfung E-029, Runde 2).
 * - Die Arbeitszeit hat kein Maß: Sie ist flexibel (Fakt flexibleHours, fakten-abgleich B28), feste Uhrzeiten nennt die
 *   Seite nicht. Ist der Fakt für eine der Stellen offen (Büro, S5), steht „Je nach Stelle …“; gilt er für keine, fehlt er.
 * - Arbeiten alle Stellen am Firmensitz (Ort ohne `radiusKm`, Bürofachkraft), entfallen Einsatzgebiet, 35 km und
 *   „Keine Fernmontage“: Arbeitsort ist der Firmensitz.
 */
export function regionalband(stellen: readonly RegionalStelle[]): RegionalbandText {
  const amFirmensitz = stellen.length > 0 && stellen.every((stelle) => stelle.location.radiusKm === undefined);
  const offen = offenBei('flexibleHours', stellen);
  const flexibel =
    offen.length === 0
      ? `${FACTS.flexibleHours.long} `
      : offen.length < stellen.length
        ? `${JE_NACH_STELLE.charAt(0).toUpperCase()}${JE_NACH_STELLE.slice(1)} ${FACTS.flexibleHours.long.charAt(0).toLowerCase()}${FACTS.flexibleHours.long.slice(1)} `
        : '';
  return {
    etikett: 'Arbeitsort und Arbeitszeit',
    /** Fakt noFarAssembly; am Firmensitz der Arbeitsort aus COMPANY. */
    titel: amFirmensitz ? `Arbeitsort: ${STANDORT.name} in ${COMPANY.address.city}.` : `${FACTS.noFarAssembly.short}.`,
    /** REGION.summary: Wetzlar, Gießen, Lahn-Dill-Kreis und Nachbarkreise, jeden Abend zu Hause (Bestand der Startseite). */
    einleitung: amFirmensitz ? null : REGION.summary,
    // Fakt radius35
    masse: amFirmensitz ? [] : [{ wert: geschuetzt(wertVon('radius35')), name: 'Einsatzradius' }],
    standort: STANDORT,
    /** Arbeitszeit: Fakten flexibleHours (siehe oben) und noWeekendOnCall (V6-G1: sonst nirgends auf /bewerbung). */
    arbeitszeit: `${flexibel}${FACTS.noWeekendOnCall.long}`,
    fahrzeiten: FAHRZEITEN,
    link: { href: '/#einsatzgebiet', label: 'Einsatzgebiet ansehen' },
  };
}
