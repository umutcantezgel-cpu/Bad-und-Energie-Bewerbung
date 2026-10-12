import type { FactId } from './facts';

/**
 * Die fünf bestehenden FAQ (app/page.tsx und FAQPage in app/layout.tsx),
 * in Du-Form und leicht gekürzt. Abweichungen: docs/operations/fakten-abgleich.md.
 */

export interface FaqItem {
  id: FaqId;
  question: string;
  answer: string;
  factIds: readonly FactId[];
}

export const FAQ_IDS = ['diskreter-wechsel', 'lebenslauf', 'heizsysteme', 'firmenfahrzeug', 'fernmontage'] as const;
export type FaqId = (typeof FAQ_IDS)[number];

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
 * Je drei passende Fragen für die Stellenseiten, nach Fragenset des Flows. Fachkräfte ohne
 * „lebenslauf“: Die Stellenseite sagt das schon direkt über dem Flow (Fakt noCvNeeded), und
 * Fernmontage ist für Wechselwillige die wichtigere Frage.
 */
export const JOB_FAQ_IDS: Readonly<Record<'fachkraft' | 'ausbildung' | 'quereinstieg', readonly FaqId[]>> = Object.freeze({
  fachkraft: ['diskreter-wechsel', 'firmenfahrzeug', 'fernmontage'],
  ausbildung: ['lebenslauf', 'heizsysteme', 'fernmontage'],
  quereinstieg: ['lebenslauf', 'fernmontage', 'heizsysteme'],
});

export function getFaqItem(id: FaqId): FaqItem {
  const item = FAQ_ITEMS.find((f) => f.id === id);
  if (!item) throw new Error(`Unbekannte FAQ-ID: ${id}`);
  return item;
}

export function getFaqItems(ids: readonly FaqId[] = FAQ_IDS): FaqItem[] {
  return ids.map(getFaqItem);
}
