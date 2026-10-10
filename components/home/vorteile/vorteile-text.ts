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
 * Fakten, die einen Wunsch beantworten. Eine Stelle zeigt nur die Fakten aus ihren eigenen
 * `benefitFactIds` (Registry-Test: pending nur bei `onlyForJobIds`), und nur auf Wunsch, weil
 * 13:30, 35 km und Tarif schon im Einstieg und in den Zusagen stehen (Fakten höchstens zweimal).
 * `payFirstWorkday` steht bewusst nirgends (fakten-abgleich A3).
 */
export const WUNSCH_FAKTEN: Readonly<Record<WunschId, readonly FactId[]>> = {
  feierabend: ['friday1330', 'noWeekendOnCall', 'noUnpaidOvertime'],
  verguetung: ['aboveTariff'],
  ausstattung: ['hilti', 'vehicle', 'privateCarOnePercent', 'fuelCard', 'ipadSmartphone'],
  naehe: ['noFarAssembly', 'radius35'],
};

/** Paketzeilen (`packageExtras.label`), die einen Wunsch erfüllen. */
const EXTRA_WUENSCHE: Readonly<Record<string, readonly WunschId[]>> = {
  Vergütung: ['verguetung'],
  Fahrzeug: ['ausstattung'],
  Werkzeug: ['ausstattung'],
};

/** Planbeschriftung der Fakt-Zeilen. */
const FAKT_ETIKETT: Partial<Record<FactId, string>> = {
  friday1330: 'Freitag',
  noWeekendOnCall: 'Wochenende',
  noUnpaidOvertime: 'Überstunden',
  aboveTariff: 'Tarif',
  hilti: 'Werkzeug',
  vehicle: 'Fahrzeug',
  privateCarOnePercent: 'Fahrzeug',
  fuelCard: 'Tankkarte',
  ipadSmartphone: 'Digital',
  noFarAssembly: 'Baustellen',
  radius35: 'Umkreis',
};

/** Fakt darf auf dieser Stelle stehen: aktiv und, falls pending, freigegeben für genau sie. */
function faktErlaubt(id: FactId, job: Pick<Job, 'id'>, now: Date): boolean {
  const fact = FACTS[id];
  if (!isFactActive(id, now)) return false;
  return !fact.pending || fact.pending.onlyForJobIds.includes(job.id);
}

/** Zeilen einer Stelle: zuerst ihre Paketzeilen, dann je Wunsch ohne passende Paketzeile ihre Fakten. */
export function paketZeilen(job: Pick<Job, 'id' | 'packageExtras' | 'benefitFactIds'>, now: Date = new Date()): PaketZeile[] {
  const extras: PaketZeile[] = job.packageExtras.map((extra) => ({
    key: `extra-${extra.label}`,
    etikett: extra.label,
    text: extra.text,
    wuensche: EXTRA_WUENSCHE[extra.label] ?? [],
    nurAufWunsch: false,
  }));
  const fakten: PaketZeile[] = [];
  for (const { id: wunsch } of WUNSCH_OPTIONEN) {
    if (extras.some((zeile) => zeile.wuensche.includes(wunsch))) continue;
    for (const id of WUNSCH_FAKTEN[wunsch]) {
      if (!job.benefitFactIds.includes(id) || !faktErlaubt(id, job, now)) continue;
      fakten.push({ key: `fakt-${id}`, etikett: FAKT_ETIKETT[id] ?? FACTS[id].short, text: FACTS[id].short, wuensche: [wunsch], nurAufWunsch: true });
    }
  }
  return [...extras, ...fakten];
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

export const ZUSAGEN_TITEL = 'Das gilt für alle Fachkräfte';

export interface Zusage {
  id: FactId;
  icon: IconName;
  titel: string;
  text: string;
  /** Maß unter dem Text (font-mass), z. B. die festen Arbeitszeiten. */
  mass?: string;
}

/**
 * Sechs Zusagen. Werkzeug, Fahrzeug und iPad stehen gesammelt in „Werkzeug & Fuhrpark“, darum
 * nicht noch einmal hier (BENEFIT_FACT_IDS ohne hilti, vehicle, ipadSmartphone). Neu ist die
 * Arbeitszeit-Zusage: „Keine unbezahlten Überstunden“ mit den festen Zeiten als kurzes Maß (Abnahme
 * E-START-025: „07:00“ und „unbezahlten Überstunden“ in #vorteile). Den ganzen Satz der Arbeitszeiten
 * trägt die Arbeitswoche darüber (R3-HOME-05); hier steht nur die Kurzform, so bleibt es bei zweimal.
 */
export const ZUSAGEN: readonly Zusage[] = [
  { id: 'aboveTariff', icon: 'banknote', titel: FACTS.aboveTariff.short, text: FACTS.aboveTariff.long },
  {
    id: 'noUnpaidOvertime',
    icon: 'uhr',
    titel: FACTS.noUnpaidOvertime.short,
    text: FACTS.noUnpaidOvertime.long,
    mass: FACTS.workingHours.short,
  },
  { id: 'noWeekendOnCall', icon: 'calendar-off', titel: FACTS.noWeekendOnCall.short, text: FACTS.noWeekendOnCall.long },
  { id: 'permanentContract', icon: 'file-check', titel: FACTS.permanentContract.short, text: FACTS.permanentContract.long },
  { id: 'paidCertifications', icon: 'graduation-cap', titel: FACTS.paidCertifications.short, text: FACTS.paidCertifications.long },
  { id: 'familyTeam', icon: 'users', titel: FACTS.familyTeam.short, text: FACTS.familyTeam.long },
];

// ── Werkzeug & Fuhrpark (E-START-026) ─────────────────────────────────────────────────────

export const AUSSTATTUNG_TITEL = 'Werkzeug & Fuhrpark';

/** Sprungziel des Unterblocks; der alte Anker #ausstattung zeigt per Alias davor (page.tsx). */
export const AUSSTATTUNG_ID = 'werkzeug-fuhrpark';

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
