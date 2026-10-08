import type { ApplicationAnswers, Mappe } from '@/lib/applications/schema';
import type { NormalizedPhone } from '@/lib/applications/types';
import { getQuestion, getQuestions, isAnswerKey, type AnswerKey, type QuestionSetId } from '@/lib/apply/questions';
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

/** Bewerbungsmappe als Blöcke: Anschreiben, Arbeitsstil, Fähigkeiten, Stationen. */
export function mappeBlocks(mappe: Mappe | undefined): EmailBlockInput[] {
  if (!mappe) return [];

  const career = mappe.careerStations.map((station) => {
    const head = joinParts([station.period, station.role, joinParts([station.company, station.location], ', ')], ' · ');
    const tasks = station.tasks.filter((task) => task.trim()).map((task) => `– ${task}`);
    return [head, ...tasks].filter(Boolean).join('\n');
  });
  const education = mappe.educationStations.map((station) =>
    joinParts([station.period, station.degree, joinParts([station.institution, station.location], ', ')], ' · '),
  );
  const skills = mappe.skills.filter((skill) => skill.trim());

  return [
    { type: 'heading', text: 'Bewerbungsmappe' },
    mappe.coverLetter.trim() ? { type: 'paragraph', text: 'Anschreiben', muted: true } : null,
    mappe.coverLetter.trim() ? { type: 'quote', text: mappe.coverLetter.trim() } : null,
    {
      type: 'rows',
      rows: [
        { label: 'Arbeitsstil', value: mappe.workStyle },
        { label: 'Fähigkeiten', value: skills.join(', ') },
      ],
    },
    career.length > 0 ? { type: 'paragraph', text: 'Berufliche Stationen', muted: true } : null,
    career.length > 0 ? { type: 'list', items: career } : null,
    education.length > 0 ? { type: 'paragraph', text: 'Schule und Ausbildung', muted: true } : null,
    education.length > 0 ? { type: 'list', items: education } : null,
  ];
}
