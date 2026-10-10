import { bindSeparators } from '@/components/jobs/text';
import { FACTS } from '@/lib/content/facts';
import { getProcessSteps } from '@/lib/content/process';
import { REGION } from '@/lib/content/region';
import { formatSalaryRange, jobCategoryLabels, jobPath } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';

/**
 * Ausbau der Stellenliste `/jobs` (V6-G1): Stellenvergleich, Arbeitsalltag im Einsatzgebiet und die Ausnahmen im
 * Ablauf. Jeder Satz stammt aus einer belegten Quelle (Stellendaten, FACTS, REGION, lib/content/process); eigene
 * Wörter sind nur Überschriften, Etiketten und Beschriftungen, ohne Zahl und ohne Zusage. Geprüft in
 * components/jobs/__tests__/inhalt.test.ts.
 *
 * Faktenverteilung (E-023: ein Fakt in höchstens zwei Abschnitten; die Bestandsabschnitte zählen mit):
 * - 35 km steht als Maß im Kopf und in REGION.headline: Der Vergleich lässt Aufgaben mit dem Radius weg.
 * - 13:30 steht im Heizkreis des Kopfs und hier in der Arbeitswoche (workingHours), sonst nirgends.
 * - Hilti, Servicefahrzeug und „unbefristet“ stehen im Ablauf (Schritt 3) und je einmal in Kopf oder Liste.
 * - „Kein Lebenslauf“ steht im Mikrotext des Kopfs und im Initiativband, darum in keinem neuen Abschnitt.
 */

const NBSP = ' ';

/** „16:45 Uhr“ und „15 km“ brechen nicht zwischen Zahl und Einheit (K-012). */
function zusammen(text: string): string {
  return text.replace(/(\d) (?=Uhr|km|Min\.)/g, `$1${NBSP}`);
}

/** „A, B, C oder D“. */
function aufzaehlung(teile: readonly string[], wort: 'und' | 'oder'): string {
  if (teile.length < 2) return teile.join('');
  return `${teile.slice(0, -1).join(', ')} ${wort} ${teile.at(-1)}`;
}

/** Aufgaben, die den Einsatzradius nennen („im 35-km-Radius“), stehen nicht im Vergleich (E-023, siehe oben). */
function nenntRadius(aufgabe: string): boolean {
  return aufgabe.includes(`${REGION.radiusKm}-km`);
}

// ─── Stellenvergleich ────────────────────────────────────────────────────────────────────────────────────────

export const VERGLEICH = Object.freeze({
  anker: 'vergleich',
  etikett: 'Stellenvergleich',
  /** Die Wörter des Seitentitels „… alle offenen Jobs“ stehen so sichtbar auf der Seite. */
  titel: 'Alle offenen Jobs im Vergleich',
  aufgaben: 'Aufgaben',
  voraussetzung: 'Voraussetzung',
  gehalt: 'Gehaltsspanne',
  verguetung: 'Ausbildungsvergütung',
});

/** Einleitung aus den Stellenarten der Liste: „Anlagenmechaniker, Kundendienst, Obermonteur oder Ausbildung: …“. */
export function vergleichEinleitung(jobs: readonly Pick<Job, 'category'>[]): string {
  return `${aufzaehlung(jobCategoryLabels(jobs), 'oder')}: Die Stellen unterscheiden sich in Aufgaben, Voraussetzungen und Gehalt. Alle Angaben stammen aus der jeweiligen Stellenanzeige.`;
}

export interface Stellenprofil {
  id: string;
  /** Voller Titel mit weichen Trennstellen (titleShy), Schrägstrich bleibt am Zeilenende. */
  titel: string;
  aufgaben: readonly string[];
  /** Ausbildung und Erfahrung: die ersten zwei Anforderungen der Stellenanzeige. */
  voraussetzungen: readonly string[];
  gehalt: { label: string; wert: string } | null;
  link: { href: string; label: string };
}

/** Die harten Voraussetzungen einer Stelle (Abschluss, Erfahrung), auch für die Wegweiser auf /bewerbung. */
export function voraussetzungen(job: Pick<Job, 'requirements'>): readonly string[] {
  return job.requirements.slice(0, 2);
}

/** Linktext zur Stellenseite: je Ziel ein eigener, beschreibender Text. */
export function stellenanzeigeLabel(job: Pick<Job, 'shortTitle'>): string {
  return bindSeparators(`Zur Stellenanzeige ${job.shortTitle}`);
}

export function stellenprofil(job: Job): Stellenprofil {
  const wert = formatSalaryRange(job);
  return {
    id: job.id,
    titel: bindSeparators(job.titleShy),
    aufgaben: job.tasks.filter((aufgabe) => !nenntRadius(aufgabe)),
    voraussetzungen: voraussetzungen(job),
    gehalt: wert ? { label: job.employment.kind === 'ausbildung' ? VERGLEICH.verguetung : VERGLEICH.gehalt, wert } : null,
    link: { href: jobPath(job), label: stellenanzeigeLabel(job) },
  };
}

// ─── Arbeitsalltag im Einsatzgebiet ──────────────────────────────────────────────────────────────────────────

export interface Ort {
  name: string;
  /** „15 km“ */
  entfernung: string;
  /** „ca. 16 Min.“ */
  fahrzeit: string;
}

/**
 * Abschnitt Einsatzgebiet (Bestand: REGION.headline als h2, REGION.summary als Einleitung, Weg zur Karte), dazu
 * die Arbeitswoche (Fakten workingHours, noWeekendOnCall), Betrieb und Team (REGION.milestone mit employees15)
 * und die Orte mit Entfernung und Fahrzeit bis Wetzlar (REGION.locations aus lib/data/locations.ts).
 */
export const ALLTAG = Object.freeze({
  etikett: 'Arbeitsalltag und Einsatzgebiet',
  woche: Object.freeze({
    titel: 'Arbeitswoche',
    text: zusammen(`${FACTS.workingHours.long} ${FACTS.noWeekendOnCall.long}`),
  }),
  betrieb: Object.freeze({
    titel: 'Betrieb und Team',
    text: zusammen(REGION.milestone.text),
  }),
  orte: Object.freeze({
    titel: 'Orte und Fahrzeiten',
    einleitung: `Entfernung und Fahrzeit bis ${REGION.center.name}:`,
    liste: Object.freeze(
      REGION.locations.map(
        (ort): Ort => ({
          name: ort.name,
          entfernung: zusammen(`${ort.distanceKm} km`),
          fahrzeit: zusammen(`ca. ${ort.commuteMinutes} Min.`),
        }),
      ),
    ),
  }),
});

// ─── Ablauf: was bei Ausbildung und Quereinstieg anders ist ─────────────────────────────────────────────────

const AUSBILDUNG = getProcessSteps('ausbildung');
const QUEREINSTIEG = getProcessSteps('quereinstieg');

/**
 * Unter dem Ablauf für Fachkräfte (JobProcess, Fragenset fachkraft): Schritt 2 und 3 der Ausbildung und
 * Schritt 3 des Quereinstiegs im Wortlaut von lib/content/process.
 */
export const ABLAUF_VARIANTEN = Object.freeze({
  titel: 'Ablauf bei Ausbildung und Quereinstieg',
  eintraege: Object.freeze([
    { name: 'Ausbildung', text: `${AUSBILDUNG[1].text} ${AUSBILDUNG[2].text}` },
    { name: 'Quereinstieg', text: QUEREINSTIEG[2].text },
  ]),
});
