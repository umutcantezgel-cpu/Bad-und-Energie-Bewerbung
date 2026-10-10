'use client';

import { useId } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import type { ApplicationAnswers } from '@/lib/applications/schema';
import type { ContactFormInput, ContactFormValues } from '@/lib/apply/contact-schema';
import { MAPPE_PATH } from '@/lib/apply/params';
import type { QuestionSetId } from '@/lib/apply/questions';
import { buildShortcutMessage } from '@/lib/apply/whatsapp-message';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { Weg } from './strang/Weg';
import { WEGE_TITEL, WEG_TEXT } from './strang/strang-text';

export interface FlowShortcutsProps {
  control: Control<ContactFormInput, unknown, ContactFormValues>;
  jobLabel: string | null;
  questionSet: QuestionSetId;
  answers: ApplicationAnswers;
  /** Nur im page-Variant: Link zum Mappe-Werkzeug. */
  showMappeLink: boolean;
  /** Ebene der Überschrift „Andere Wege“: wie die Fragen (h2 auf /bewerbung, h3 eingebettet). */
  headingAs?: 'h2' | 'h3';
}

/**
 * Andere Wege (E-BEW-001, Vier-Wege-Hub verschmolzen): Der Flow ist der erste Weg, darunter auf jedem
 * Schritt an derselben Stelle (WCAG 3.2.6) die gleichrangigen Abkürzungen als echte Links mit einer
 * erklärenden Zeile: WhatsApp mit den bisherigen Angaben und, auf /bewerbung, die Bewerbungsmappe.
 */
export function FlowShortcuts({ control, jobLabel, questionSet, answers, showMappeLink, headingAs: Heading = 'h2' }: FlowShortcutsProps) {
  const titelId = `${useId()}-wege`;
  // Eigener Abonnent, damit nur dieser Link beim Tippen des Namens neu rendert.
  const name = useWatch({ control, name: 'name' });
  const href = buildWhatsAppUrl(buildShortcutMessage({ jobLabel, questionSet, answers, name }));
  const mitAngaben = Boolean(jobLabel || name?.trim() || Object.keys(answers).length > 0);

  return (
    <nav aria-labelledby={titelId} className="flex flex-col gap-4 border-t-3 border-line pt-6">
      <Heading id={titelId} className="text-etikett text-ink-2">
        {WEGE_TITEL}
      </Heading>
      <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <li>
          <Weg
            href={href}
            icon="message-circle"
            titel={WEG_TEXT.whatsapp.titel}
            text={mitAngaben ? WEG_TEXT.whatsapp.mitAngaben : WEG_TEXT.whatsapp.leer}
            neuerTab={{ hinweis: 'öffnet WhatsApp' }}
          />
        </li>
        {showMappeLink && (
          <li>
            <Weg href={MAPPE_PATH} icon="file-text" titel={WEG_TEXT.mappe.titel} text={WEG_TEXT.mappe.text} />
          </li>
        )}
        {/* Unterlagen einreichen (E-BEW-012) steht auf /bewerbung in der Spalte der Wege (components/apply/unterlagen). */}
      </ul>
    </nav>
  );
}
