import type { JobCategory } from '@/lib/jobs/schema';
import { COMPANY } from './company';
import { FACTS, type FactId } from './facts';

/**
 * Die fünf bestehenden FAQ (app/page.tsx und FAQPage in app/layout.tsx),
 * in Du-Form und leicht gekürzt. Abweichungen: docs/operations/fakten-abgleich.md.
 * Dazu die Fragen nur für Stellenseiten (STELLEN_FAQ_ITEMS, Plan §C5), ohne FAQPage-Markup.
 */

export interface FaqItem {
  id: FaqId;
  question: string;
  answer: string;
  factIds: readonly FactId[];
}

export const FAQ_IDS = ['diskreter-wechsel', 'lebenslauf', 'heizsysteme', 'firmenfahrzeug', 'fernmontage'] as const;

/** Fragen nur für die Stellenseiten (nicht auf der Startseite, nicht in der FAQPage). */
export const STELLEN_FAQ_IDS = [
  'lohn',
  'lohn-ausbildung',
  'lohn-quereinstieg',
  'lohn-buero',
  'berufsschule',
  'fuehrerschein-ausbildung',
  'quereinstieg',
  'buero-umfang',
  'praktikum-inhalt',
  'praktikum-dauer',
  'praktikum-ausbildung',
  'praktikum-bewerbung',
  'antwortzeit',
] as const;
export type FaqId = (typeof FAQ_IDS)[number] | (typeof STELLEN_FAQ_IDS)[number];

export const FAQ_ITEMS: readonly FaqItem[] = Object.freeze([
  {
    id: 'diskreter-wechsel',
    question: 'Wie läuft der diskrete Wechsel ab, wenn ich noch bei einem anderen Betrieb angestellt bin?',
    answer:
      'Diskretion ist für uns selbstverständlich. Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber. Das unverbindliche Kennenlernen findet nach Feierabend oder am Wochenende statt. Auch bei Kündigungsfristen unterstützen wir dich transparent.',
    factIds: ['discretion'],
  },
  {
    id: 'lebenslauf',
    question: 'Brauche ich ein Anschreiben oder einen Lebenslauf?',
    answer:
      'Nein. Für den ersten Schritt reichen ein paar kurze Fragen, Anschreiben oder Bewerbungsmappe brauchen wir vorab nicht. Ein kurzes Telefonat auf Augenhöhe und ein Kaffee in Wetzlar sind uns lieber als Papierkram.',
    factIds: ['noCvNeeded'],
  },
  {
    id: 'heizsysteme',
    question: 'Welche Heizsysteme und Sanitäranlagen montiert ihr hauptsächlich?',
    answer:
      'Unser Schwerpunkt liegt auf modernen Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann, Fußbodenheizungen und schlüsselfertigen Badsanierungen in enger Partnerschaft mit ELEMENTS, VIGOUR, Kermi und Geberit.',
    factIds: ['heatPumpBrands'],
  },
  {
    id: 'firmenfahrzeug',
    question: 'Darf ich das Firmenfahrzeug mit nach Hause nehmen?',
    answer:
      'Ja. Je nach Aufgabenbereich und Absprache fährst du mit deinem persönlichen, modern ausgestatteten Servicefahrzeug direkt von deinem Wohnort zur Baustelle. Auch Smartphone und Tablet sind für die private Nutzung freigeschaltet.',
    factIds: ['vehicle', 'ipadSmartphone'],
  },
  {
    id: 'fernmontage',
    question: 'Gibt es Fernmontagen oder Wochenendarbeit?',
    answer:
      // Wie radius35, noFarAssembly und noWeekendOnCall: 35 km rundum, „jeden Abend“ ohne „pünktlich“,
      // „am Wochenende frei“ (fakten-abgleich.md B23, B28, B29).
      'Nein. Unsere Baustellen liegen alle im Umkreis von 35 km um Wetzlar. Du bist jeden Abend zu Hause, und am Wochenende hast du frei.',
    factIds: ['radius35', 'noFarAssembly', 'noWeekendOnCall'],
  },
] satisfies FaqItem[]);

/**
 * Fragen der Stellenseiten (Plan §C5): Bezahlung (auf Anfrage, mit den belegten Fakten der Stelle), Berufsschule,
 * Führerschein, Quereinstieg, Umfang und Antwortzeit. Stunden und Probezeit fehlen, weil sie nicht belegt sind; ebenso
 * der Name der Berufsschule (M-024). Antworten aus Fakten (per ID) oder dem Wortlaut der Stellenanzeigen.
 */
export const STELLEN_FAQ_ITEMS: readonly FaqItem[] = Object.freeze([
  {
    id: 'lohn',
    question: 'Was verdiene ich bei euch?',
    // payOnRequest und aboveTariff (E-030: kein Betrag, die Fakten ohne Zahl bleiben)
    answer: `${FACTS.payOnRequest.long} ${FACTS.aboveTariff.long}`,
    factIds: ['payOnRequest', 'aboveTariff'],
  },
  {
    id: 'lohn-ausbildung',
    question: 'Wie hoch ist die Ausbildungsvergütung?',
    // azubiPay ohne das Adjektiv „Attraktive“ (K-012: Fakt vor Adjektiv), wie die Paketzeile der Stellen
    answer: `${FACTS.payOnRequest.long} Die Ausbildungsvergütung liegt über Tarif, dazu kommen Prämien.`,
    factIds: ['payOnRequest', 'azubiPay'],
  },
  {
    id: 'lohn-quereinstieg',
    question: 'Was verdiene ich im Quereinstieg?',
    // Paketzeile „Vergütung“ der Stelle quereinsteiger-montagehelfer
    answer: `${FACTS.payOnRequest.long} Wir bezahlen fair und über Tarif.`,
    factIds: ['payOnRequest'],
  },
  {
    id: 'lohn-buero',
    question: 'Was verdiene ich im Büro?',
    // Ohne Tarifaussage: Für das Büro ist sie nicht belegt (fakten-abgleich S5)
    answer: `${FACTS.payOnRequest.long} Frag ${COMPANY.managingDirector.name} einfach per Telefon oder WhatsApp.`,
    factIds: ['payOnRequest'],
  },
  {
    id: 'berufsschule',
    question: 'Wie läuft die Berufsschule?',
    // Aufgabe „Berufsschule und Gesellenprüfung, begleitet von deinen Meistern“ und Fakt travelAllowance
    answer: `Du lernst im Betrieb und in der Berufsschule, deine Meister begleiten dich bis zur Gesellenprüfung. ${FACTS.travelAllowance.long}`,
    factIds: ['travelAllowance'],
  },
  {
    id: 'fuehrerschein-ausbildung',
    question: 'Hilft mir der Betrieb beim Führerschein?',
    answer: `Ja. ${FACTS.driversLicenseGrant.long}`,
    factIds: ['driversLicenseGrant'],
  },
  {
    id: 'quereinstieg',
    question: 'Kann ich ohne SHK-Ausbildung bei euch anfangen?',
    // Wortlaut der Stelle quereinsteiger-montagehelfer (Intro und Voraussetzungen)
    answer:
      'Ja, als Quereinsteiger oder Montagehelfer. Du brauchst handwerkliches Geschick und einen Führerschein Klasse B, unsere Meister arbeiten dich intensiv ein.',
    factIds: [],
  },
  {
    id: 'buero-umfang',
    question: 'Gibt es die Stelle auch in Teilzeit?',
    // Inhaber 2026-10-14 (fakten-abgleich S5): Voll- oder Teilzeit; der Stundenrahmen ist offen (M-038)
    answer: 'Ja, die Stelle gibt es in Voll- oder Teilzeit. Sag uns in deiner Bewerbung, was dir lieber ist.',
    factIds: [],
  },
  {
    id: 'praktikum-inhalt',
    question: 'Was erlebe ich im Schülerpraktikum?',
    // Wortlaut der Aufgaben der Stelle schuelerpraktikum-shk
    answer: 'Du bekommst Einblick in die Arbeit an Wärmepumpen, Heizungen und Bädern und lernst die Ausbildung zum Anlagenmechaniker SHK kennen.',
    factIds: [],
  },
  {
    id: 'praktikum-dauer',
    question: 'Wie lange dauert das Schülerpraktikum?',
    // Inhaber 2026-10-14 (fakten-abgleich S4): nach Absprache mit der Schule
    answer: 'Das stimmen wir mit dir und deiner Schule ab.',
    factIds: [],
  },
  {
    id: 'praktikum-ausbildung',
    question: 'Kann ich nach dem Praktikum bei euch eine Ausbildung machen?',
    // Dauer und Ablauf aus den Ausbildungsstellen (42 Monate, Betrieb und Berufsschule, Gesellenprüfung); ohne Zusage
    // eines Platzes: Welche Plätze offen sind, steht bei den Stellen.
    answer:
      'Wir bilden Anlagenmechaniker SHK aus: 3,5 Jahre im Betrieb und in der Berufsschule, bis zur Gesellenprüfung. Welche Ausbildungsplätze gerade offen sind, siehst du bei unseren Stellen.',
    factIds: [],
  },
  {
    id: 'praktikum-bewerbung',
    question: 'Wie bewerbe ich mich für das Schülerpraktikum?',
    // Wege der Stellenseite (Flow, WhatsApp); Zeitraum und Dauer nach Absprache mit der Schule (fakten-abgleich S4)
    answer: `Über das kurze Formular auf dieser Seite oder direkt per WhatsApp an ${COMPANY.managingDirector.name}. Den Zeitraum deines Praktikums besprechen wir danach mit dir und deiner Schule.`,
    factIds: [],
  },
  {
    id: 'antwortzeit',
    question: 'Wann meldet ihr euch nach meiner Bewerbung?',
    answer: FACTS.quickResponse.long,
    factIds: ['quickResponse'],
  },
] satisfies FaqItem[]);

/**
 * Fragen je Stelle, nach Art der Stelle. Fachkräfte ohne „lebenslauf“: Die Stellenseite sagt das schon direkt über dem
 * Flow (Fakt noCvNeeded), und Fernmontage ist für Wechselwillige die wichtigere Frage. Das Schülerpraktikum ohne jede
 * Frage zu Geld (Inhaber 2026-10-14).
 */
const FACHKRAFT_FAQ: readonly FaqId[] = ['lohn', 'diskreter-wechsel', 'firmenfahrzeug', 'fernmontage', 'antwortzeit'];

export const JOB_FAQ_IDS: Readonly<Record<JobCategory, readonly FaqId[]>> = Object.freeze({
  anlagenmechaniker: FACHKRAFT_FAQ,
  kundendienst: FACHKRAFT_FAQ,
  projektleitung: FACHKRAFT_FAQ,
  ausbildung: ['lohn-ausbildung', 'berufsschule', 'fuehrerschein-ausbildung', 'lebenslauf', 'fernmontage'],
  helfer: ['lohn-quereinstieg', 'quereinstieg', 'lebenslauf', 'fernmontage', 'antwortzeit'],
  buero: ['lohn-buero', 'buero-umfang', 'diskreter-wechsel', 'lebenslauf', 'antwortzeit'],
  praktikum: [
    'praktikum-inhalt',
    'praktikum-dauer',
    'praktikum-ausbildung',
    'praktikum-bewerbung',
    'heizsysteme',
    'fernmontage',
    'lebenslauf',
    'antwortzeit',
  ],
});

const ALL_FAQ_ITEMS: readonly FaqItem[] = [...FAQ_ITEMS, ...STELLEN_FAQ_ITEMS];

export function getFaqItem(id: FaqId): FaqItem {
  const item = ALL_FAQ_ITEMS.find((f) => f.id === id);
  if (!item) throw new Error(`Unbekannte FAQ-ID: ${id}`);
  return item;
}

export function getFaqItems(ids: readonly FaqId[] = FAQ_IDS): FaqItem[] {
  return ids.map(getFaqItem);
}
