/**
 * Ablauf in drei Schritten (aus components/trust/ProcessSteps.tsx@393df01),
 * gekürzt und in Du-Form. Schritt 3 hängt vom Fragenset ab.
 */

export type ProcessAudience = 'fachkraft' | 'ausbildung' | 'quereinstieg';

export interface ProcessStep {
  id: 'bewerben' | 'kennenlernen' | 'start';
  number: 1 | 2 | 3;
  title: string;
  text: string;
  highlight: string;
}

const APPLY_STEP: ProcessStep = {
  id: 'bewerben',
  number: 1,
  title: 'Bewerben in 60 Sekunden',
  // „Kein Lebenslauf“ steht schon in Hero, FAQ und Flow (Fakt noCvNeeded); hier nicht ein drittes Mal.
  text: 'Ein paar kurze Fragen beantworten oder Sabri Demir direkt per WhatsApp schreiben.',
  highlight: 'Ohne Papierkram',
};

/** Für Wechselwillige: diskret, nach Feierabend (Fakt discretion). */
const MEET_STEP: ProcessStep = {
  id: 'kennenlernen',
  number: 2,
  title: 'Kennenlernen in der Werkstatt',
  text: 'Wir treffen uns diskret nach deinem Feierabend oder am Wochenende in der Werkstatt in Wetzlar und sprechen offen über Lohn, Touren und deine Wünsche.',
  highlight: '100 % Diskretion',
};

/** Für Schülerinnen und Schüler: kein Arbeitgeber, also auch keine Diskretionszusage. */
const MEET_STEP_AUSBILDUNG: ProcessStep = {
  id: 'kennenlernen',
  number: 2,
  title: 'Kennenlernen in der Werkstatt',
  text: 'Wir lernen uns in der Werkstatt in Wetzlar kennen und sprechen offen über die Ausbildung und deine Fragen.',
  highlight: 'Unverbindlich',
};

const MEET_STEPS: Record<ProcessAudience, ProcessStep> = {
  fachkraft: MEET_STEP,
  ausbildung: MEET_STEP_AUSBILDUNG,
  quereinstieg: MEET_STEP,
};

const START_STEPS: Record<ProcessAudience, ProcessStep> = {
  fachkraft: {
    id: 'start',
    number: 3,
    title: 'Start mit Werkzeug und Fahrzeug',
    text: 'Du bekommst deinen unbefristeten Arbeitsvertrag. Am ersten Tag stehen dein persönliches Hilti-Werkzeugset und dein Servicefahrzeug bereit.',
    highlight: 'Sicherer Start',
  },
  ausbildung: {
    id: 'start',
    number: 3,
    title: 'Start mit eigenem Werkzeug',
    text: 'Am ersten Tag bekommst du dein eigenes Hilti-Azubi-Werkzeugset geschenkt und arbeitest von Anfang an mit.',
    highlight: 'Sicherer Start',
  },
  quereinstieg: {
    id: 'start',
    number: 3,
    title: 'Start mit Ausstattung',
    text: 'Am ersten Tag stehen deine Arbeitskleidung und die Hilti-Basisausstattung bereit, dazu eine intensive Einarbeitung.',
    highlight: 'Sicherer Start',
  },
};

export const PROCESS_STEPS: readonly ProcessStep[] = Object.freeze([APPLY_STEP, MEET_STEP, START_STEPS.fachkraft]);

export interface ProcessIntro {
  title: string;
  text: string;
}

/** Einleitung für Fachkräfte und Quereinstieg (Startseite, llms-full.txt). */
export const PROCESS_INTRO: ProcessIntro = Object.freeze({
  title: 'In 3 Schritten zu deinem neuen Job',
  text: 'Wir respektieren deine Zeit und deine aktuelle Anstellung.',
});

const PROCESS_INTROS: Record<ProcessAudience, ProcessIntro> = {
  fachkraft: PROCESS_INTRO,
  ausbildung: Object.freeze({ title: 'In 3 Schritten zu deiner Ausbildung', text: 'Wir respektieren deine Zeit.' }),
  quereinstieg: PROCESS_INTRO,
};

export const DISCRETION_PROMISE =
  'Dein Wechsel bleibt vertraulich: Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber.';

export function getProcessSteps(audience: ProcessAudience = 'fachkraft'): readonly ProcessStep[] {
  return [APPLY_STEP, MEET_STEPS[audience], START_STEPS[audience]];
}

export function getProcessIntro(audience: ProcessAudience = 'fachkraft'): ProcessIntro {
  return PROCESS_INTROS[audience];
}

/**
 * Diskretionszusage nur für Menschen, die gerade angestellt sein können (Fachkräfte, Quereinstieg).
 * Wer sich auf die Ausbildung bewirbt, geht meist noch zur Schule: kein Arbeitgeber, keine Zusage.
 */
export function getDiscretionPromise(audience: ProcessAudience = 'fachkraft'): string | null {
  return audience === 'ausbildung' ? null : DISCRETION_PROMISE;
}
