import { FACTS, isFactActive } from '@/lib/content/facts';
import { DISCRETION_PROMISE } from '@/lib/content/process';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import type { KopfMarke, KopfVertraulich, OffeneStellen } from './typen';

/*
 * Daten des Seitenkopfs (R4-SHELL-01). Nur auf dem Server lesen (SiteHeader): Registry und Fakten
 * ziehen zod und die Stellendaten nach sich. Kopf und Menü (Client) bekommen daraus nur Zeichenketten.
 */

/**
 * E-SHELL-002: Zahl der live Stellen (veröffentlicht und am Stichtag nicht abgelaufen). Das Layout
 * rendert stündlich neu (revalidate), so sinkt die Zahl nach Ablauf einer Stelle ohne Deployment.
 */
export function offeneStellen(now: Date, jobs: readonly Job[] = getActiveJobs()): number {
  return jobs.filter((job) => isJobLive(job, now)).length;
}

/** Zugänglicher Zusatz am Eintrag „Stellen“: „aktuell 4 offene Stellen“ (1: „aktuell 1 offene Stelle“). */
export function offeneStellenText(anzahl: number): string {
  return `aktuell ${anzahl} offene ${anzahl === 1 ? 'Stelle' : 'Stellen'}`;
}

/** Zähler für Kopf und Menü; ohne live Stelle kein Zähler (keine „0“ im Rahmen). */
export function stellenZaehler(now: Date, jobs?: readonly Job[]): OffeneStellen | null {
  const anzahl = offeneStellen(now, jobs);
  return anzahl > 0 ? { anzahl, text: offeneStellenText(anzahl) } : null;
}

/**
 * E-SHELL-001: Jubiläumsmarke im Rahmen, nur solange der Fakt gilt (bis 31.12.2026), danach null.
 * Sichtbar im Desktop-Kopf und im Menü; auf der Startseite trägt der Einstieg die Ortsmarke.
 */
export function jubilaeumsMarke(now: Date): KopfMarke | null {
  if (!isFactActive('anniversary100', now)) return null;
  const fakt = FACTS.anniversary100;
  const spanne = /\((\d{4}–\d{4})\)/.exec(fakt.short)?.[1] ?? '';
  return { lang: fakt.short, zahl: `${fakt.value} ${fakt.label?.split(' ')[0] ?? ''}`.trim(), spanne };
}

/**
 * E-SHELL-004: Vertraulichkeitszusage im Menü, Wortlaut gleich DISCRETION_PROMISE (lib/content/process),
 * ohne Garantieformel und ohne Rechtsparagrafen. Ausgenommen sind die Seiten der Ausbildung: Dort gibt es keinen
 * derzeitigen Arbeitgeber (getDiscretionPromise('ausbildung') liefert null).
 */
export function kopfVertraulich(jobs: readonly Job[] = getActiveJobs()): KopfVertraulich {
  return {
    text: DISCRETION_PROMISE,
    ohne: jobs.filter((job) => job.category === 'ausbildung').map(jobPath),
  };
}
