import { FACTS, isFactActive } from '@/lib/content/facts';
import { DISCRETION_PROMISE } from '@/lib/content/process';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive, type Job } from '@/lib/jobs/registry';
import { EINSATZGEBIET_PATH, getHubKreise, getPublishedPlaces, kreisPath, type Kreis } from '@/lib/places/registry';
import { ORTE_ANKER } from '@/lib/places/text';
import { THEMEN_UEBERSICHT_LINK, getThemen, themaPath } from '@/lib/themen/registry';
import { ARBEITEN_HUB_PATH, EINSATZGEBIET_HUB_PATH } from '../nav';
import type { KopfMarke, KopfUntermenue, KopfVertraulich, OffeneStellen } from './typen';

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

/** Geschütztes Leerzeichen zwischen Zahl und Wort („26 Orte“, DIN 5008). */
const NBSP = '\u00a0';

/** Maß am Kreis im Untermenü: „26 Orte“ (1: „1 Ort“). */
export function orteMass(anzahl: number): string {
  return `${anzahl}${NBSP}${anzahl === 1 ? 'Ort' : 'Orte'}`;
}

/** Weg zum Verzeichnis A–Z der Gebietsseite (Anker ORTE_ANKER); die Zahl folgt den veröffentlichten Orten. */
export function orteVerzeichnisWeg(anzahl = getPublishedPlaces().length) {
  return { href: `${EINSATZGEBIET_PATH}#${ORTE_ANKER}`, label: `Alle ${anzahl}${NBSP}Orte von A bis Z` };
}

/**
 * Untermenüs der Hauptnavigation (E-028): unter „Arbeiten bei uns“ die Themen aus lib/themen, unter „Einsatzgebiet“
 * die Kreise mit eigener Seite (mit Zahl der Orte) und das Verzeichnis aller Orte. Alles aus den Registries, keine
 * feste Zahl. Kopf (Desktop, aufklappend) und Menü (Handy, als kompakte Liste) bekommen dieselben Daten.
 */
export function kopfUntermenues(
  kreise: readonly Kreis[] = getHubKreise(),
  anzahlOrte: number = getPublishedPlaces().length,
): KopfUntermenue[] {
  return [
    {
      href: ARBEITEN_HUB_PATH,
      id: 'arbeiten',
      etikett: 'Themen',
      wege: getThemen().map((thema) => ({ href: themaPath(thema), label: thema.name })),
      alle: { ...THEMEN_UEBERSICHT_LINK },
    },
    {
      href: EINSATZGEBIET_HUB_PATH,
      id: 'einsatzgebiet',
      etikett: 'Kreise',
      wege: kreise.map((kreis) => ({ href: kreisPath(kreis), label: kreis.shortName, mass: orteMass(kreis.placeCount) })),
      alle: orteVerzeichnisWeg(anzahlOrte),
    },
  ];
}
