import type { IconName } from '@/components/icons';
import { bindSeparators, withSoftHyphens } from '@/components/jobs/text';
import { FACTS, isFactActive, type FactId } from '@/lib/content/facts';
import { applyPath, jobPath } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import type { PaketRolle, PaketZeile, WunschId, WunschOption } from './paket';

/**
 * Texte und Daten des Abschnitts #vorteile (R3-HOME-02): Konfigurator (E-START-024, -016),
 * Zusagen (E-START-025) und Werkzeug & Fuhrpark (E-START-026). Jede Aussage kommt aus den
 * Stellendaten (`packageExtras`) oder aus lib/content/facts.ts; eigene Wörter hier sind nur
 * Beschriftungen (Etiketten, Legenden, Knöpfe), keine Arbeitgeber-Aussagen.
 */

// ── Konfigurator ──────────────────────────────────────────────────────────────────────────

export const KONFIGURATOR = {
  /** Wesenskern E-START-024. */
  titel: 'Dein persönliches Mitarbeiter-Paket',
  lead: 'Wähle deine Stelle und sieh, was speziell zu ihr gehört.',
  rolleLegende: 'Deine Stelle',
  /** Wesenskern E-START-016, in der du-Form der Plattform. */
  wunschLegende: 'Was ist dir an deinem neuen Arbeitgeber besonders wichtig?',
  wunschHinweis: 'Wähle die Punkte, die für dich den Ausschlag geben. Sie werden in deinem Paket markiert.',
  paketEtikett: 'Dein Paket',
  passtHinweis: 'passt zu deiner Auswahl',
  stelleLink: 'Alles zur Stelle',
} as const;

/** Bewerben-Knopf je Rolle (E-START-023 Freiraum „Als … bewerben“). */
export const bewerbenLabel = (titel: string) => `Als ${titel} bewerben`;

/** Wunsch-Beschriftungen; jede ist durch die Fakten in WUNSCH_FAKTEN gedeckt. */
export const WUNSCH_OPTIONEN: readonly WunschOption[] = [
  { id: 'feierabend', label: 'Pünktlich Feierabend' },
  { id: 'verguetung', label: 'Bezahlung über Tarif' },
  { id: 'ausstattung', label: 'Werkzeug und Fahrzeug' },
  { id: 'naehe', label: 'Baustellen in der Nähe' },
];

/**
 * Fakten, die einen Wunsch im Paket beantworten. Eine Stelle zeigt nur die Fakten aus ihren eigenen
 * `benefitFactIds` (Registry-Test: pending nur bei `onlyForJobIds`), und nur auf Wunsch. Faktenverteilung E-023:
 * Was schon an anderer Stelle der Seite steht (13:30 und Wochenende in der Woche, Tarif und Überstunden in
 * den Zusagen, Hilti und Fahrzeug in Werkzeug & Fuhrpark, 35 km und Fernmontage im Einsatzgebiet), kommt
 * nicht ein drittes Mal ins Paket; dafür zeigt eine Verweiszeile dorthin (WUNSCH_VERWEISE).
 * `payFirstWorkday` steht bewusst nirgends (fakten-abgleich A3).
 */
export const WUNSCH_FAKTEN: Readonly<Record<WunschId, readonly FactId[]>> = {
  feierabend: [],
  verguetung: [],
  ausstattung: ['privateCarOnePercent', 'fuelCard'],
  naehe: [],
};

export interface WunschVerweis {
  /** Planbeschriftung der Zeile. */
  etikett: string;
  /** Sprungziel auf der Startseite. */
  href: string;
  /** Linktext: sagt, wohin es geht. */
  label: string;
  /** Die Stelle bekommt den Verweis nur, wenn einer dieser Fakten zu ihr gehört (keine Verallgemeinerung). */
  fakten: readonly FactId[];
  /** Das Ziel liegt über (Arbeitswoche) oder unter dem Paket. */
  richtung: 'hoch' | 'runter';
}

/** Sprungziel des Unterblocks „Werkzeug & Fuhrpark“ (E-START-026: /#ausstattung springt hierher). */
export const AUSSTATTUNG_ID = 'ausstattung';

/** Verweise statt Wiederholung (E-023); Ziele sind Abschnitte bzw. Blöcke der Startseite. */
export const WUNSCH_VERWEISE: Readonly<Record<WunschId, WunschVerweis>> = {
  feierabend: {
    etikett: 'Arbeitszeit',
    href: '#woche',
    label: 'Arbeitswoche ansehen',
    fakten: ['friday1330', 'noWeekendOnCall', 'noUnpaidOvertime'],
    richtung: 'hoch',
  },
  verguetung: { etikett: 'Vergütung', href: '#vorteile-zusagen', label: 'Zusagen ansehen', fakten: ['aboveTariff'], richtung: 'runter' },
  ausstattung: {
    etikett: 'Ausstattung',
    href: `#${AUSSTATTUNG_ID}`,
    label: 'Werkzeug & Fuhrpark ansehen',
    fakten: ['hilti', 'vehicle', 'measurementTools', 'ipadSmartphone'],
    richtung: 'runter',
  },
  naehe: {
    etikett: 'Baustellen',
    href: '#einsatzgebiet',
    label: 'Einsatzgebiet ansehen',
    fakten: ['noFarAssembly', 'radius35'],
    richtung: 'runter',
  },
};

/** Paketzeilen (`packageExtras.label`), die einen Wunsch erfüllen. */
const EXTRA_WUENSCHE: Readonly<Record<string, readonly WunschId[]>> = {
  Vergütung: ['verguetung'],
  Fahrzeug: ['ausstattung'],
  Werkzeug: ['ausstattung'],
};

/**
 * Paketzeilen, deren Inhalt „Werkzeug & Fuhrpark“ trägt (E-023: Hilti und Fahrzeug an genau einem Ort in
 * #vorteile). Sie stehen im Paket als eine Verweiszeile; der Wortlaut der Stelle steht auf ihrer Seite.
 */
const AUSSTATTUNG_EXTRAS: ReadonlySet<string> = new Set(['Werkzeug', 'Fahrzeug']);

/** Planbeschriftung der Fakt-Zeilen. */
const FAKT_ETIKETT: Partial<Record<FactId, string>> = {
  privateCarOnePercent: 'Fahrzeug',
  fuelCard: 'Tankkarte',
};

/** Fakt darf auf dieser Stelle stehen: aktiv und, falls pending, freigegeben für genau sie. */
function faktErlaubt(id: FactId, job: Pick<Job, 'id'>, now: Date): boolean {
  const fact = FACTS[id];
  if (!isFactActive(id, now)) return false;
  return !fact.pending || fact.pending.onlyForJobIds.includes(job.id);
}

function verweisZeile(wunsch: WunschId, nurAufWunsch: boolean): PaketZeile {
  const v = WUNSCH_VERWEISE[wunsch];
  return { key: `verweis-${wunsch}`, etikett: v.etikett, text: v.label, href: v.href, richtung: v.richtung, wuensche: [wunsch], nurAufWunsch };
}

/**
 * Zeilen einer Stelle:
 * 1. ihre Paketzeilen in Reihenfolge; Werkzeug und Fahrzeug als eine Verweiszeile auf „Werkzeug & Fuhrpark“;
 * 2. je Wunsch, den noch keine Zeile beantwortet: ihre erlaubten Fakten aus WUNSCH_FAKTEN, sonst ein Verweis
 *    auf den Block, der die Antwort trägt (nur wenn ein passender Fakt zu ihr gehört).
 */
export function paketZeilen(job: Pick<Job, 'id' | 'packageExtras' | 'benefitFactIds'>, now: Date = new Date()): PaketZeile[] {
  const extras: PaketZeile[] = [];
  for (const extra of job.packageExtras) {
    if (AUSSTATTUNG_EXTRAS.has(extra.label)) {
      if (!extras.some((zeile) => zeile.key === 'verweis-ausstattung')) extras.push(verweisZeile('ausstattung', false));
      continue;
    }
    extras.push({
      key: `extra-${extra.label}`,
      etikett: extra.label,
      text: extra.text,
      wuensche: EXTRA_WUENSCHE[extra.label] ?? [],
      nurAufWunsch: false,
    });
  }
  const aufWunsch: PaketZeile[] = [];
  for (const { id: wunsch } of WUNSCH_OPTIONEN) {
    if (extras.some((zeile) => zeile.wuensche.includes(wunsch))) continue;
    for (const id of WUNSCH_FAKTEN[wunsch]) {
      if (!job.benefitFactIds.includes(id) || !faktErlaubt(id, job, now)) continue;
      aufWunsch.push({ key: `fakt-${id}`, etikett: FAKT_ETIKETT[id] ?? FACTS[id].short, text: FACTS[id].short, wuensche: [wunsch], nurAufWunsch: true });
    }
    if (WUNSCH_VERWEISE[wunsch].fakten.some((id) => job.benefitFactIds.includes(id))) aufWunsch.push(verweisZeile(wunsch, true));
  }
  return [...extras, ...aufWunsch];
}

/**
 * Rollen des Konfigurators: die Fachkraft-Stellen, die gerade live sind (Anlagenmechaniker,
 * Kundendienst, Obermonteur). Die Ausbildung bleibt ein Verweis (befristet, ohne iPad; B9),
 * die Quereinstiegsstelle hat keine eigene Seite (funnel_only).
 */
export function paketRollen(jobs: readonly Job[], now: Date = new Date()): PaketRolle[] {
  return jobs
    .filter((job) => job.category !== 'ausbildung' && job.category !== 'helfer' && job.packageExtras.length > 0)
    .map((job) => ({
      id: job.id,
      titel: job.shortTitle,
      anzeige: bindSeparators(withSoftHyphens(job.shortTitle, job.titleShy)),
      stelleHref: jobPath(job),
      bewerbenHref: applyPath(job),
      zeilen: paketZeilen(job, now),
    }));
}

// ── Zusagen (E-START-025) ─────────────────────────────────────────────────────────────────

/** Neutral: die Zusagen sind betriebsweite Fakten, nicht für jede Stelle einzeln belegt (kein „für alle“). */
export const ZUSAGEN_TITEL = 'Unsere Zusagen';

/** Sprungziel der Zusagen (Verweis aus dem Paket). */
export const ZUSAGEN_ID = 'vorteile-zusagen';

export interface Zusage {
  id: FactId;
  icon: IconName;
  titel: string;
  text: string;
  /** Maß unter dem Text (font-mass), z. B. die festen Arbeitszeiten. */
  mass?: string;
}

/** „Mo–Do 07:00–16:45 Uhr“: die Arbeitszeit ohne den Freitag (13:30 tragen Einstieg und Woche, E-023). */
const ARBEITSZEIT_MO_DO = FACTS.workingHours.short.split(/,\s*/)[0];

/**
 * Sechs Zusagen. Werkzeug, Fahrzeug und iPad stehen gesammelt in „Werkzeug & Fuhrpark“, darum
 * nicht noch einmal hier (BENEFIT_FACT_IDS ohne hilti, vehicle, ipadSmartphone). Neu ist die
 * Arbeitszeit-Zusage: „Keine unbezahlten Überstunden“ mit der festen Zeit Mo–Do als kurzes Maß (Abnahme
 * E-START-025: „07:00“ und „unbezahlten Überstunden“ in #vorteile). Den Freitag mit 13:30 trägt die
 * Arbeitswoche darüber (Faktenverteilung E-023: 13:30 nicht in den Vorteilen).
 */
export const ZUSAGEN: readonly Zusage[] = [
  { id: 'aboveTariff', icon: 'banknote', titel: FACTS.aboveTariff.short, text: FACTS.aboveTariff.long },
  {
    id: 'noUnpaidOvertime',
    icon: 'uhr',
    titel: FACTS.noUnpaidOvertime.short,
    text: FACTS.noUnpaidOvertime.long,
    mass: ARBEITSZEIT_MO_DO,
  },
  { id: 'noWeekendOnCall', icon: 'calendar-off', titel: FACTS.noWeekendOnCall.short, text: FACTS.noWeekendOnCall.long },
  { id: 'permanentContract', icon: 'file-check', titel: FACTS.permanentContract.short, text: FACTS.permanentContract.long },
  { id: 'paidCertifications', icon: 'graduation-cap', titel: FACTS.paidCertifications.short, text: FACTS.paidCertifications.long },
  { id: 'familyTeam', icon: 'users', titel: FACTS.familyTeam.short, text: FACTS.familyTeam.long },
];

// ── Werkzeug & Fuhrpark (E-START-026) ─────────────────────────────────────────────────────

export const AUSSTATTUNG_TITEL = 'Werkzeug & Fuhrpark';


export interface Geraet {
  id: FactId;
  icon: IconName;
  etikett: string;
  titel: string;
  text: string;
}

/** Vier Gerätezeilen; die Arbeitskleidung steht als Schlusszeile darunter. */
export const GERAETE: readonly Geraet[] = [
  { id: 'hilti', icon: 'werkzeug', etikett: 'Werkzeug', titel: FACTS.hilti.short, text: FACTS.hilti.long },
  { id: 'vehicle', icon: 'servicefahrzeug', etikett: 'Fahrzeug', titel: FACTS.vehicle.short, text: FACTS.vehicle.long },
  { id: 'measurementTools', icon: 'waermepumpe', etikett: 'Messtechnik', titel: FACTS.measurementTools.short, text: FACTS.measurementTools.long },
  { id: 'ipadSmartphone', icon: 'tablet-smartphone', etikett: 'Digital', titel: FACTS.ipadSmartphone.short, text: FACTS.ipadSmartphone.long },
];

export const AUSSTATTUNG_SCHLUSS = FACTS.workwear.long;
