/**
 * Texte der Bewerbungsseite /bewerbung (R5-BEW-01, E-023): Seitenkopf, „Lieber direkt sprechen?“ und das
 * Regionalband (E-BEW-008). Nur aus FACTS, COMPANY und REGION; Mikrotexte direkt (K-012), keine neuen Zusagen.
 */
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { REGION } from '@/lib/content/region';

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

/**
 * Regionalband (E-BEW-008): Einsatzgebiet, Arbeitszeit, Standort und „Keine Fernmontage“, Link auf die Karte.
 * Die Arbeitszeit hat kein Maß: Sie ist flexibel (Fakt flexibleHours, fakten-abgleich B28), feste Uhrzeiten
 * nennt die Seite nicht.
 */
export const REGIONALBAND = Object.freeze({
  etikett: 'Arbeitsort und Arbeitszeit',
  /** Fakt noFarAssembly. */
  titel: `${FACTS.noFarAssembly.short}.`,
  /** REGION.summary: Wetzlar, Gießen, Lahn-Dill-Kreis und Nachbarkreise, jeden Abend zu Hause (Bestand der Startseite). */
  einleitung: REGION.summary,
  masse: Object.freeze([
    // Fakt radius35
    { wert: geschuetzt(wertVon('radius35')), name: 'Einsatzradius' },
  ] as RegionalMass[]),
  standort: Object.freeze({
    name: 'Firmensitz',
    zeilen: Object.freeze([COMPANY.address.street, `${COMPANY.address.postalCode} ${COMPANY.address.city}`]),
  }),
  /** Arbeitszeit: Fakten flexibleHours und noWeekendOnCall (V6-G1: sonst nirgends auf /bewerbung). */
  arbeitszeit: `${FACTS.flexibleHours.long} ${FACTS.noWeekendOnCall.long}`,
  /** V6-G1: Fahrzeit bis zum Firmensitz für die Orte außerhalb der Kernzone (REGION.locations). */
  fahrzeiten: Object.freeze({
    name: `Fahrzeit bis ${REGION.center.name}`,
    orte: Object.freeze(
      REGION.locations.filter((ort) => !ort.isCoreZone).map((ort) => `${ort.name} ca.${NBSP}${ort.commuteMinutes}${NBSP}Min.`),
    ),
  }),
  link: Object.freeze({ href: '/#einsatzgebiet', label: 'Einsatzgebiet ansehen' }),
});
