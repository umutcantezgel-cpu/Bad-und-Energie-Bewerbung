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
function wertVon(id: 'apply60s' | 'radius35' | 'friday1330'): string {
  const wert = FACTS[id].value;
  if (!wert) throw new Error(`Fakt ${id} hat keinen Wert`);
  return wert;
}
/** Zeitspanne „07:00–16:45 Uhr“ bricht nicht am Strich und nicht vor „Uhr“ (Wortverbinder U+2060). */
const zusammenhalten = (text: string) => text.replace(/(\d)–(\d)/g, '$1\u2060–\u2060$2').replace(/ Uhr/g, `${NBSP}Uhr`);

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
    zweitweg: { href: `#${unterlagenAnker}`, label: unterlagenWunsch ? 'Unterlagen einreichen' : 'Lieber mit Unterlagen bewerben' },
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

/** Regionalband (E-BEW-008): Einsatzgebiet, Arbeitszeit, Standort und „Keine Fernmontage“, Link auf die Karte. */
export const REGIONALBAND = Object.freeze({
  etikett: 'Arbeitsort und Arbeitszeit',
  /** Fakt noFarAssembly. */
  titel: `${FACTS.noFarAssembly.short}.`,
  /** REGION.summary: Wetzlar, Gießen und Lahn-Dill-Kreis, jeden Abend zu Hause (Bestand der Startseite). */
  einleitung: REGION.summary,
  masse: Object.freeze([
    // Fakt radius35
    { wert: geschuetzt(wertVon('radius35')), name: 'Einsatzradius' },
    // Fakten friday1330 und workingHours (Mo–Do-Teil; der Freitag steht schon im Wert)
    {
      wert: wertVon('friday1330'),
      name: 'Freitags Feierabend',
      detail: zusammenhalten(FACTS.workingHours.short.split(', ')[0] ?? FACTS.workingHours.short),
    },
  ] satisfies RegionalMass[]),
  standort: Object.freeze({
    name: 'Firmensitz',
    zeilen: Object.freeze([COMPANY.address.street, `${COMPANY.address.postalCode} ${COMPANY.address.city}`]),
  }),
  link: Object.freeze({ href: '/#einsatzgebiet', label: 'Einsatzgebiet ansehen' }),
});
