/**
 * Ablauf in drei Schritten (aus components/trust/ProcessSteps.tsx),
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
  text: 'Ein paar kurze Fragen beantworten oder Sabri Demir direkt per WhatsApp schreiben. Kein Anschreiben, kein Lebenslauf.',
  highlight: 'Ohne Papierkram',
};

const MEET_STEP: ProcessStep = {
  id: 'kennenlernen',
  number: 2,
  title: 'Kennenlernen in der Werkstatt',
  text: 'Wir treffen uns diskret nach deinem Feierabend oder am Wochenende in der Werkstatt in Wetzlar und sprechen offen über Lohn, Touren und deine Wünsche.',
  highlight: '100 % Diskretion',
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

export const PROCESS_INTRO = Object.freeze({
  title: 'In 3 Schritten zu deinem neuen Job',
  text: 'Wir respektieren deine Zeit und deine aktuelle Anstellung.',
});

export const DISCRETION_PROMISE =
  'Dein Wechsel bleibt vertraulich: Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber.';

export function getProcessSteps(audience: ProcessAudience = 'fachkraft'): readonly ProcessStep[] {
  return [APPLY_STEP, MEET_STEP, START_STEPS[audience]];
}
