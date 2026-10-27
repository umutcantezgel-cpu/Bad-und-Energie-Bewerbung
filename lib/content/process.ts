/**
 * Ablauf in drei Schritten (aus components/trust/ProcessSteps.tsx@393df01),
 * gekürzt und in Du-Form. Schritt 3 hängt vom Fragenset ab, beim Schülerpraktikum von der Kategorie
 * (processAudienceFor): Es nutzt die Fragen der Ausbildung, aber nicht deren Ablauf.
 */
import type { QuestionSet } from '@/lib/jobs/schema';

export type ProcessAudience = QuestionSet | 'praktikum';

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
  // „Werkstatt“ ist nicht belegt (fakten-abgleich B31): bis zur Antwort des Inhabers „am Firmensitz“.
  title: 'Kennenlernen am Firmensitz',
  text: 'Wir treffen uns diskret nach deinem Feierabend oder am Wochenende am Firmensitz in Wetzlar und sprechen offen über Lohn, Touren und deine Wünsche.',
  highlight: '100 % Diskretion',
};

/** Für Schülerinnen und Schüler: kein Arbeitgeber, also auch keine Diskretionszusage. */
const MEET_STEP_AUSBILDUNG: ProcessStep = {
  id: 'kennenlernen',
  number: 2,
  title: 'Kennenlernen am Firmensitz',
  text: 'Wir lernen uns am Firmensitz in Wetzlar kennen und sprechen offen über die Ausbildung und deine Fragen.',
  highlight: 'Unverbindlich',
};

/**
 * Fürs Schülerpraktikum (fakten-abgleich S4): wie bei der Ausbildung ohne Diskretion; Beginn und Dauer stimmen wir mit
 * der Schule ab. Kein Wort zu Geld, kein Werkzeugset (der Fakt azubiToolkit gilt nur für Azubis).
 */
const MEET_STEP_PRAKTIKUM: ProcessStep = {
  ...MEET_STEP_AUSBILDUNG,
  text: 'Wir lernen uns am Firmensitz in Wetzlar kennen, sprechen über das Praktikum und deine Fragen und stimmen den Zeitraum mit deiner Schule ab.',
};

/** Fürs Büro (Bürofachkraft, fakten-abgleich S5): diskret wie bei den Fachkräften, ohne Touren. */
const MEET_STEP_BUERO: ProcessStep = {
  ...MEET_STEP,
  text: 'Wir treffen uns diskret nach deinem Feierabend oder am Wochenende am Firmensitz in Wetzlar und sprechen offen über Lohn, Aufgaben und deine Wünsche.',
};

const MEET_STEPS: Record<ProcessAudience, ProcessStep> = {
  fachkraft: MEET_STEP,
  ausbildung: MEET_STEP_AUSBILDUNG,
  quereinstieg: MEET_STEP,
  buero: MEET_STEP_BUERO,
  praktikum: MEET_STEP_PRAKTIKUM,
};

const START_STEPS: Record<ProcessAudience, ProcessStep> = {
  fachkraft: {
    id: 'start',
    number: 3,
    title: 'Start mit Werkzeug und Fahrzeug',
    text: 'Du bekommst deinen unbefristeten Arbeitsvertrag. Am ersten Tag stehen dein persönliches Werkzeugset und dein Servicefahrzeug bereit.',
    highlight: 'Sicherer Start',
  },
  ausbildung: {
    id: 'start',
    number: 3,
    title: 'Start mit eigenem Werkzeug',
    text: 'Am ersten Tag bekommst du dein eigenes Azubi-Werkzeugset geschenkt und arbeitest von Anfang an mit.',
    highlight: 'Sicherer Start',
  },
  quereinstieg: {
    id: 'start',
    number: 3,
    title: 'Start mit Ausstattung',
    text: 'Am ersten Tag stehen deine Arbeitskleidung und die Werkzeug-Basisausstattung bereit, dazu eine intensive Einarbeitung.',
    highlight: 'Sicherer Start',
  },
  // Büro: Werkzeug und Fahrzeug gehören nicht dazu; Beginn und Umfang (Voll- oder Teilzeit) sind nach Absprache.
  buero: {
    id: 'start',
    number: 3,
    title: 'Start nach Absprache',
    text: 'Wann du anfängst und ob in Voll- oder Teilzeit, stimmen wir im Gespräch mit dir ab.',
    highlight: 'Nach Absprache',
  },
  // Praktikum: Dauer nach Absprache mit der Schule (Inhaber, S4); ohne Werkzeug, ohne Geschenk, ohne Geld
  praktikum: {
    id: 'start',
    number: 3,
    title: 'Zeitraum nach Absprache mit deiner Schule',
    text: 'Wann dein Praktikum beginnt und wie lange es dauert, stimmen wir mit dir und deiner Schule ab.',
    highlight: 'Nach Absprache',
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
  buero: PROCESS_INTRO,
  praktikum: Object.freeze({ title: 'In 3 Schritten zu deinem Praktikum', text: 'Wir respektieren deine Zeit.' }),
};

export const DISCRETION_PROMISE =
  'Dein Wechsel bleibt vertraulich: Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber.';

/**
 * Ablauf einer Stelle: nach der Kategorie, nicht nach dem Fragenset. Das Schülerpraktikum fragt wie die Ausbildung
 * (Schule), bekommt aber den eigenen Ablauf ohne Azubi-Werkzeugset. Ohne Stelle (Initiativbewerbung) das Fragenset.
 */
export function processAudienceFor(stelle: { category?: string; questionSet: QuestionSet }): ProcessAudience {
  return stelle.category === 'praktikum' ? 'praktikum' : stelle.questionSet;
}

export function getProcessSteps(audience: ProcessAudience = 'fachkraft'): readonly ProcessStep[] {
  return [APPLY_STEP, MEET_STEPS[audience], START_STEPS[audience]];
}

/**
 * Schritt 3 der Fachkräfte für eine Stelle, deren Anzeige kein Werkzeug nennt (Obermonteur, Inhaber 2026-10-27:
 * „Hilti-Werkzeug rausnehmen“): Vertrag und Fahrzeug wie bei den Fachkräften, ohne das Werkzeugset.
 */
const START_STEP_OHNE_WERKZEUG: ProcessStep = {
  ...START_STEPS.fachkraft,
  title: 'Start mit Fahrzeug',
  text: 'Du bekommst deinen unbefristeten Arbeitsvertrag. Am ersten Tag steht dein Servicefahrzeug bereit.',
};

/** Was der Ablauf einer einzelnen Stelle von ihr liest (Job aus lib/jobs/registry). */
export interface AblaufStelle {
  category?: string;
  apply: { questionSet: QuestionSet };
  benefitFactIds: readonly string[];
  packageExtras: readonly { label: string; text: string }[];
}

/**
 * Ablauf einer Stelle, wo er von dem ihrer Stellenart abweicht, sonst null: Eine Fachkraft-Stelle, deren Anzeige kein
 * Werkzeug nennt (Vorteil hilti oder Paketzeile „Werkzeug“), startet ohne das Werkzeugset (Obermonteur, Inhaber 2026-10-27).
 */
export function eigenerAblauf(stelle: AblaufStelle): readonly ProcessStep[] | null {
  const audience = processAudienceFor({ category: stelle.category, questionSet: stelle.apply.questionSet });
  const nenntWerkzeug = stelle.benefitFactIds.includes('hilti') || stelle.packageExtras.some((extra) => extra.label === 'Werkzeug');
  if (audience !== 'fachkraft' || nenntWerkzeug) return null;
  return getProcessSteps(audience).map((step) => (step.id === 'start' ? START_STEP_OHNE_WERKZEUG : step));
}

/** Ablauf einer einzelnen Stelle (Stellenseite, /bewerbung mit Vorauswahl): ihr eigener oder der ihrer Stellenart. */
export function getJobProcessSteps(stelle: AblaufStelle): readonly ProcessStep[] {
  return eigenerAblauf(stelle) ?? getProcessSteps(processAudienceFor({ category: stelle.category, questionSet: stelle.apply.questionSet }));
}

/** Stellenbezug von Schritt 3 der Fachkräfte auf Sammelflächen (sammelAblauf). */
export const FUER_FACHKRAEFTE = 'Für Fachkräfte';

/** Stellenarten mit eigenem Ablauf, in der Reihenfolge der Sammelflächen; Name wie im Etikett der Variante. */
const ANDERE_ABLAEUFE = Object.freeze([
  { audience: 'ausbildung', name: 'Ausbildung' },
  { audience: 'quereinstieg', name: 'Quereinstieg' },
  { audience: 'buero', name: 'Büro' },
  { audience: 'praktikum', name: 'Schülerpraktikum' },
] as const satisfies readonly { audience: Exclude<ProcessAudience, 'fachkraft'>; name: string }[]);

/** Überschrift über den Varianten auf einer Sammelfläche. */
export const ANDERE_ABLAEUFE_TITEL = 'Ablauf bei den anderen Stellen';

export interface AblaufVariante {
  audience: Exclude<ProcessAudience, 'fachkraft'>;
  name: string;
  /** Die Schritte, die vom Ablauf der Fachkräfte abweichen, im Wortlaut (Kennenlernen und Start bzw. nur Start). */
  text: string;
}

export interface SammelAblauf {
  /** Die Schritte der Fachkräfte; Schritt 3 mit „Für Fachkräfte: “, sobald es Varianten gibt. */
  schritte: readonly ProcessStep[];
  varianten: readonly AblaufVariante[];
}

/**
 * Ablauf auf einer Sammelfläche, einer Seite über mehrere Stellen (/, /jobs, /bewerbung ohne Stelle, „Diskret
 * wechseln“, llms-full.txt; Prüfung E-029, Runde 3): die Schritte der Fachkräfte und je Stellenart unter den gezeigten
 * Stellen mit eigenem Ablauf, was anders ist. Gibt es eine solche, trägt Schritt 3 „Für Fachkräfte: …“: Unbefristeter
 * Vertrag, Werkzeugset und Servicefahrzeug stehen so nie ohne Bezug neben dem Büro (Befristung offen, S5), der Ausbildung
 * oder dem Schülerpraktikum.
 */
export function sammelAblauf(stellen: readonly { category?: string; apply: { questionSet: QuestionSet } }[]): SammelAblauf {
  const arten = new Set(stellen.map((stelle) => processAudienceFor({ category: stelle.category, questionSet: stelle.apply.questionSet })));
  const fachkraft = getProcessSteps('fachkraft');
  const varianten = ANDERE_ABLAEUFE.filter(({ audience }) => arten.has(audience)).map(({ audience, name }) => ({
    audience,
    name,
    text: getProcessSteps(audience)
      .filter((step, i) => step !== fachkraft[i])
      .map((step) => step.text)
      .join(' '),
  }));
  if (varianten.length === 0) return { schritte: fachkraft, varianten };
  return {
    schritte: fachkraft.map((step) => (step.id === 'start' ? { ...step, text: `${FUER_FACHKRAEFTE}: ${step.text}` } : step)),
    varianten,
  };
}

export function getProcessIntro(audience: ProcessAudience = 'fachkraft'): ProcessIntro {
  return PROCESS_INTROS[audience];
}

/** Ausbildung und Schülerpraktikum: meist noch Schule, also kein Arbeitgeber (keine Diskretion, keine Kündigungsfrist). */
export function ohneArbeitgeber(audience: ProcessAudience): boolean {
  return audience === 'ausbildung' || audience === 'praktikum';
}

/**
 * Diskretionszusage nur für Menschen, die gerade angestellt sein können (Fachkräfte, Quereinstieg, Büro).
 * Wer sich auf die Ausbildung oder ein Schülerpraktikum bewirbt, geht meist noch zur Schule: kein Arbeitgeber, keine Zusage.
 */
export function getDiscretionPromise(audience: ProcessAudience = 'fachkraft'): string | null {
  return ohneArbeitgeber(audience) ? null : DISCRETION_PROMISE;
}
