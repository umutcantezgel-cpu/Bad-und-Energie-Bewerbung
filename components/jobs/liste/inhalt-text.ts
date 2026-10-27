import { bindSeparators } from '@/components/jobs/text';
import { FACTS, JE_NACH_STELLE, offenBei } from '@/lib/content/facts';
import { REGION } from '@/lib/content/region';
import { jobCategoryLabels, jobPath, payLabel } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { BUERO_AM_FIRMENSITZ } from './liste-text';

/**
 * Ausbau der Stellenliste `/jobs` (V6-G1): Stellenvergleich, Arbeitsalltag im Einsatzgebiet und die Ausnahmen im
 * Ablauf. Jeder Satz stammt aus einer belegten Quelle (Stellendaten, FACTS, REGION, lib/content/process); eigene
 * Wörter sind nur Überschriften, Etiketten und Beschriftungen, ohne Zahl und ohne Zusage. Geprüft in
 * components/jobs/__tests__/inhalt.test.ts.
 *
 * Faktenverteilung (E-023: ein Fakt in höchstens zwei Abschnitten; die Bestandsabschnitte zählen mit):
 * - 35 km steht als Maß im Kopf und in REGION.headline: Der Vergleich lässt Aufgaben mit dem Radius weg.
 * - „Flexible Arbeitszeiten“ steht in der Unterzeile des Kopfs und hier in der Arbeitszeit, sonst nirgends; feste
 *   Uhrzeiten nennt die Seite nicht (fakten-abgleich B28).
 * - Werkzeugset, Servicefahrzeug und „unbefristet“ stehen im Ablauf (Schritt 3, „Für Fachkräfte“) und je einmal in Kopf oder
 *   Liste; was bei den anderen Stellen anders läuft, steht darunter (lib/content/process.ts sammelAblauf).
 * - „Kein Lebenslauf“ steht im Mikrotext des Kopfs und im Initiativband, darum in keinem neuen Abschnitt.
 */

const NBSP = ' ';

/** „15 km“ und „16 Min.“ brechen nicht zwischen Zahl und Einheit (K-012). */
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
  bezahlung: 'Bezahlung',
});

/** Einleitung aus den Stellenarten der Liste: „Anlagenmechaniker, Kundendienst, Obermonteur oder Ausbildung: …“. */
export function vergleichEinleitung(jobs: readonly Pick<Job, 'category'>[]): string {
  return `${aufzaehlung(jobCategoryLabels(jobs), 'oder')}: Die Stellen unterscheiden sich in Aufgaben und Voraussetzungen. Alle Angaben stammen aus der jeweiligen Stellenanzeige.`;
}

export interface Stellenprofil {
  id: string;
  /** Voller Titel mit weichen Trennstellen (titleShy), Schrägstrich bleibt am Zeilenende. */
  titel: string;
  aufgaben: readonly string[];
  /** Ausbildung und Erfahrung: die ersten zwei Anforderungen der Stellenanzeige (leer, solange sie offen sind). */
  voraussetzungen: readonly string[];
  /** „Lohn auf Anfrage“ (E-030); null beim Schülerpraktikum, das nichts zu Geld sagt. */
  lohn: string | null;
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
  return {
    id: job.id,
    titel: bindSeparators(job.titleShy),
    aufgaben: job.tasks.filter((aufgabe) => !nenntRadius(aufgabe)),
    voraussetzungen: voraussetzungen(job),
    lohn: payLabel(job),
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
 * Arbeitszeit für die Stellen der Liste (Fakten flexibleHours, noUnpaidOvertime, noWeekendOnCall): „Je nach Stelle
 * flexible Arbeitszeiten.“, solange die Arbeitszeit für eine davon offen ist (Büro S5, Schülerpraktikum S4;
 * Sammelfläche, Prüfung E-029, Runde 3); für keine belegt, ohne den Satz.
 */
export function alltagWoche(jobs: readonly Pick<Job, 'category'>[]): { titel: string; text: string } {
  const offen = offenBei('flexibleHours', jobs).length;
  const flexibel =
    offen === 0
      ? `${FACTS.flexibleHours.long} `
      : offen < jobs.length
        ? `${JE_NACH_STELLE.charAt(0).toUpperCase()}${JE_NACH_STELLE.slice(1)} ${FACTS.flexibleHours.long.charAt(0).toLowerCase()}${FACTS.flexibleHours.long.slice(1)} `
        : '';
  return { titel: 'Arbeitszeit', text: zusammen(`${flexibel}${FACTS.noUnpaidOvertime.long} ${FACTS.noWeekendOnCall.long}`) };
}

/**
 * Einleitung des Einsatzgebiets (E-031, Prüfrunde 3 D3-1): REGION.summary („Du arbeitest in Wetzlar, Gießen, …“) gilt
 * für die Stellen auf Baustellen und im Kundendienst im Umkreis (Stellendaten: Arbeitsort mit Radius, „Baustellen im
 * Umkreis von 35 km“; Kundendienst mit Fakt radius35). Steht eine Stelle am Firmensitz in der Liste (Bürofachkraft:
 * Arbeitsort ohne Radius), nennt der Satz, für wen er gilt, und danach steht BUERO_AM_FIRMENSITZ wie in der Einleitung
 * der Liste; sonst der Satz im Bestandswortlaut und kein Zusatz.
 */
export function gebietEinleitung(jobs: readonly Pick<Job, 'location'>[]): { satz: string; buero: string | null } {
  if (!jobs.some((job) => !job.location.radiusKm)) return { satz: REGION.summary, buero: null };
  if (!REGION.summary.startsWith('Du arbeitest ')) throw new Error('inhalt-text: REGION.summary beginnt nicht mehr mit „Du arbeitest“');
  return { satz: `Auf den Baustellen und im Kundendienst arbeitest du ${REGION.summary.slice('Du arbeitest '.length)}`, buero: BUERO_AM_FIRMENSITZ };
}

/**
 * Die Einleitung des Einsatzgebiets als ein Text (Prüfrunde 4 D4-1): gebietEinleitung, Satz und Hinweis aufs Büro
 * hintereinander. Dieselbe Einschränkung gilt überall, wo der Gebietssatz neben den live Stellen steht: /jobs, die
 * Startseite (#einsatzgebiet, components/home/RegionSection.tsx), llms-full.txt und das Regionalband auf /bewerbung
 * (components/apply/seite/seite-text.ts, Prüfrunde 5 D5-1).
 */
export function gebietText(jobs: readonly Pick<Job, 'location'>[]): string {
  const { satz, buero } = gebietEinleitung(jobs);
  return buero ? `${satz} ${buero}` : satz;
}

/**
 * Abschnitt Einsatzgebiet (Bestand: REGION.headline als h2, REGION.summary als Einleitung, Weg zur Karte), dazu
 * die Arbeitszeit (alltagWoche), Betrieb und Team (REGION.milestone mit employees15)
 * und die Orte mit Entfernung und Fahrzeit bis Wetzlar (REGION.locations aus lib/data/locations.ts).
 */
export const ALLTAG = Object.freeze({
  etikett: 'Arbeitsalltag und Einsatzgebiet',
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
