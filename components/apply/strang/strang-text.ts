import type { IconName } from '@/components/icons';
import type { CONTACT_STEP, JOB_STEP, StepId } from '@/lib/apply/flow';
import type { AnswerKey } from '@/lib/apply/questions';
import type { JobCategory } from '@/lib/jobs/schema';

/**
 * Texte und Zuordnungen der Flow-Darstellung (R5-APPLY-01). Rein und ohne Datenimporte, damit sie im
 * Client-Bundle klein bleiben; Zahlen kommen als Argument aus den Fakten (`FACTS.apply60s`).
 */

/** Kurzname je Schritt für Zähler und Screenreader („Schritt 2 von 4: Erfahrung“). */
export const SCHRITTNAMEN: Readonly<Record<typeof JOB_STEP | AnswerKey | typeof CONTACT_STEP, string>> = Object.freeze({
  stelle: 'Stelle',
  qualification: 'Erfahrung',
  start: 'Start',
  schoolStatus: 'Schule',
  background: 'Tätigkeit',
  licenseB: 'Führerschein',
  kontakt: 'Kontakt',
});

export function schrittName(step: StepId): string {
  return SCHRITTNAMEN[step] ?? '';
}

/** Namen der Schritte in Flow-Reihenfolge (für das Leitungspaar). */
export function schrittNamen(steps: readonly StepId[]): string[] {
  return steps.map(schrittName);
}

/**
 * Passungs-Rahmung über dem ersten Flowschritt (E-START-013, TEXTVORSCHLAG): Herausfinden statt Bewerben,
 * Zeitangabe nur aus dem Fakt `apply60s`.
 */
export function passungsSatz(sekunden: string): string {
  return `Finde in ${sekunden}\u00a0Sekunden heraus, ob wir zu dir passen.`;
}

/** Überschrift über den anderen Wegen (E-BEW-001). */
export const WEGE_TITEL = 'Andere Wege';

/** Erklärzeilen der Wege (E-BEW-001): was der Klick tut, nur Belegtes. */
export const WEG_TEXT = Object.freeze({
  whatsapp: {
    titel: 'Direkt per WhatsApp',
    /** Vor der ersten Angabe: Der Text ist nur der Gruß mit „ich möchte mich bewerben“. */
    leer: 'Öffnet WhatsApp mit einer fertigen Nachricht an Sabri Demir.',
    /** Mit Stelle oder Antworten: Sie stehen schon im Text (buildShortcutMessage). */
    mitAngaben: 'Öffnet WhatsApp mit einer fertigen Nachricht an Sabri Demir, deine Angaben stehen schon drin.',
  },
  mappe: {
    titel: 'Mit Bewerbungsmappe',
    text: 'Anschreiben und Lebenslauf auf A4: als PDF speichern oder mit der Bewerbung schicken.',
  },
});

/**
 * Stellenname mit weichen Trennstellen (nur Darstellung): Die Wortfugen kommen aus `titleShy` der Stelle,
 * damit lange Berufsnamen auf 320 px in der Auswahlkarte mit Trennstrich umbrechen statt überzulaufen.
 */
export function mitTrennstellen(label: string, titleShy?: string): string {
  if (!titleShy) return label;
  let text = label;
  for (const wort of titleShy.split(/[\s/&()]+/)) {
    if (!wort.includes('\u00AD')) continue;
    text = text.replaceAll(wort.replaceAll('\u00AD', ''), wort);
  }
  return text;
}

/** Familien-Icon je Stellenart für die Auswahlkarten des ersten Schritts. */
export const STELLEN_ICON: Readonly<Record<JobCategory | 'initiativ', IconName>> = Object.freeze({
  anlagenmechaniker: 'flamme',
  kundendienst: 'waermepumpe',
  projektleitung: 'users',
  ausbildung: 'graduation-cap',
  helfer: 'werkzeug',
  initiativ: 'nachricht',
});
