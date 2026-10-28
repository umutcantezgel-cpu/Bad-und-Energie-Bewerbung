import { hatZusatzinhalt } from '@/lib/applications/mappe-data';
import type { ApplicationAnswers, Mappe } from '@/lib/applications/schema';
import type { NormalizedPhone } from '@/lib/applications/types';
import { getQuestion, getQuestions, isAnswerKey, type AnswerKey, type QuestionSetId } from '@/lib/apply/questions';
import { lebenslaufAbschnitte, type MappeAbschnitt } from '@/lib/mappe/blatt/dokument';
import type { EmailBlockInput, EmailLink, EmailRow } from './layout';

/** Bausteine, die Team-Mail und Ergänzungs-Mail teilen. Labels kommen aus lib/apply/questions.ts. */

/** `tel:`-Link: E.164, sonst die getippten Ziffern (mit führendem „+“, falls vorhanden). */
export function telHref(phone: NormalizedPhone): string | undefined {
  if (phone.e164) return `tel:${phone.e164}`;
  const digits = phone.raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return digits.replace(/\D/g, '').length >= 6 ? `tel:${digits}` : undefined;
}

/** WhatsApp-Chat mit der Nummer; nur mit erkannter Nummer (E.164). */
export function whatsAppHref(phone: NormalizedPhone): string | undefined {
  return phone.e164 ? `https://wa.me/${phone.e164.replace(/\D/g, '')}` : undefined;
}

export function phoneRow(phone: NormalizedPhone, label = 'Telefon'): EmailRow {
  const links: EmailLink[] = [];
  const whatsapp = whatsAppHref(phone);
  if (whatsapp) links.push({ href: whatsapp, label: 'WhatsApp-Chat öffnen' });
  const notRecognized = !phone.e164 ? ' (nicht automatisch erkannt, bitte prüfen)' : '';
  return { label, value: `${phone.display}${notRecognized}`, href: telHref(phone), links };
}

/**
 * Antworten als lesbare Zeilen: erst in der Reihenfolge des Fragensets, danach übrige Felder.
 * Unbekannte Options-IDs erscheinen unverändert (escaped), damit nichts verloren geht.
 */
export function answerRows(questionSet: QuestionSetId, answers: ApplicationAnswers): EmailRow[] {
  const ordered: AnswerKey[] = getQuestions(questionSet).map((question) => question.key);
  const rest = (Object.keys(answers) as string[]).filter(
    (key): key is AnswerKey => isAnswerKey(key) && !ordered.includes(key),
  );
  return [...ordered, ...rest]
    .map((key) => {
      const value = answers[key];
      if (!value) return null;
      const question = getQuestion(key);
      const label = question?.options.find((option) => option.id === value)?.label ?? value;
      return { label: question?.summaryLabel ?? key, value: label } satisfies EmailRow;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

function joinParts(parts: Array<string | undefined>, separator: string): string {
  return parts.filter((part): part is string => Boolean(part?.trim())).join(separator);
}

/**
 * Nur angetippte Praxiserfahrung (Chips der Danke-Seite, reisen als `mappe.skills`, components/apply/thanks/danke-text.ts):
 * die Liste, sonst null. Solche Angaben gehören in den Kasten „Ergänzung“, nicht unter eine fast leere „Bewerbungsmappe“.
 */
export function nurPraxiserfahrung(mappe: Mappe | undefined): string[] | null {
  if (!mappe) return null;
  const skills = mappe.skills.filter((skill) => skill.trim());
  const sonstEtwas =
    Boolean(mappe.coverLetter.trim()) ||
    Boolean(mappe.workStyle?.trim()) ||
    mappe.careerStations.length > 0 ||
    mappe.educationStations.length > 0 ||
    hatZusatzinhalt(mappe);
  return skills.length > 0 && !sonstEtwas ? skills : null;
}

/** PDF der Mappe im Anhang der Mail (lib/mappe/pdf/anhang.ts): Dateiname und Seitenzahl für die Zeile über der Mappe. */
export interface MappePdfHinweis {
  dateiname: string;
  seiten: number;
}

/** „Als PDF im Anhang: Bewerbungsmappe_BE-26-K7M4QX_Mueller.pdf (2 Seiten)“ */
export function mappePdfZeile(pdf: MappePdfHinweis): string {
  return `Als PDF im Anhang: ${pdf.dateiname} (${pdf.seiten} ${pdf.seiten === 1 ? 'Seite' : 'Seiten'})`;
}

/** Inhalt eines Lebenslauf-Abschnitts (L5) als Mail-Block: Stationen und Punkte als Liste, Text als Absatz. */
function abschnittBlock(abschnitt: MappeAbschnitt): EmailBlockInput {
  switch (abschnitt.art) {
    case 'beruf':
      return {
        type: 'list',
        items: abschnitt.stationen.map((station) =>
          [joinParts([station.zeit, station.titel, station.ort], ' · '), ...station.aufgaben.map((aufgabe) => `– ${aufgabe}`)]
            .filter(Boolean)
            .join('\n'),
        ),
      };
    case 'ausbildung':
      return { type: 'list', items: abschnitt.stationen.map((station) => joinParts([station.zeit, station.titel, station.ort], ' · ')) };
    case 'punkte':
      return { type: 'list', items: [...abschnitt.punkte] };
    case 'text':
      return { type: 'paragraph', text: abschnitt.text };
  }
}

/**
 * Bewerbungsmappe als Blöcke: Betreff (nur wenn mitgeschickt, L5), Anschreiben, Arbeitsstil, dann der Lebenslauf wie
 * auf dem Blatt (lebenslaufAbschnitte: Reihenfolge und Überschriften der Mappe, Kurzprofil, Stationen, Schwerpunkte,
 * Sprachen, Führerschein, Interessen, eigener Abschnitt). Liegt die Mappe auch als PDF bei, sagt das die erste Zeile; der
 * Text darunter bleibt (Vorschau im Postfach, Rückfall ohne PDF).
 */
export function mappeBlocks(mappe: Mappe | undefined, pdf?: MappePdfHinweis | null): EmailBlockInput[] {
  if (!mappe) return [];
  const subject = mappe.subject?.trim();

  return [
    { type: 'heading', text: 'Bewerbungsmappe' },
    pdf ? { type: 'paragraph', text: mappePdfZeile(pdf) } : null,
    subject ? { type: 'rows', rows: [{ label: 'Betreff', value: subject }] } : null,
    mappe.coverLetter.trim() ? { type: 'paragraph', text: 'Anschreiben', muted: true } : null,
    mappe.coverLetter.trim() ? { type: 'quote', text: mappe.coverLetter.trim() } : null,
    { type: 'rows', rows: [{ label: 'Arbeitsstil', value: mappe.workStyle }] },
    ...lebenslaufAbschnitte(mappe).flatMap((abschnitt): EmailBlockInput[] => [
      { type: 'paragraph', text: abschnitt.titel, muted: true },
      abschnittBlock(abschnitt),
    ]),
  ];
}
