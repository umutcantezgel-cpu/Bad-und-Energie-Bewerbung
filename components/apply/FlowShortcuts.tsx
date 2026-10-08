'use client';

import { useWatch, type Control } from 'react-hook-form';
import { FileText, MessageCircle } from 'lucide-react';
import { TextLink } from '@/components/ui/TextLink';
import type { ApplicationAnswers } from '@/lib/applications/schema';
import type { ContactFormInput, ContactFormValues } from '@/lib/apply/contact-schema';
import { MAPPE_PATH } from '@/lib/apply/params';
import type { QuestionSetId } from '@/lib/apply/questions';
import { buildShortcutMessage } from '@/lib/apply/whatsapp-message';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

export interface FlowShortcutsProps {
  control: Control<ContactFormInput, unknown, ContactFormValues>;
  jobLabel: string | null;
  questionSet: QuestionSetId;
  answers: ApplicationAnswers;
  /** Nur im page-Variant: Link zum Mappe-Werkzeug. */
  showMappeLink: boolean;
}

/** Alternative Wege auf jedem Schritt: WhatsApp mit den bisherigen Antworten, optional die Mappe. */
export function FlowShortcuts({ control, jobLabel, questionSet, answers, showMappeLink }: FlowShortcutsProps) {
  // Eigener Abonnent, damit nur dieser Link beim Tippen des Namens neu rendert.
  const name = useWatch({ control, name: 'name' });
  const href = buildWhatsAppUrl(buildShortcutMessage({ jobLabel, questionSet, answers, name }));

  return (
    <div className="flex flex-col items-start border-t border-line pt-3">
      <TextLink href={href} target="_blank" rel="noopener noreferrer" tone="muted" standalone>
        <MessageCircle aria-hidden="true" strokeWidth={1.75} className="size-5" />
        Lieber direkt per WhatsApp?
        <span className="sr-only"> (öffnet WhatsApp)</span>
      </TextLink>
      {showMappeLink && (
        <TextLink href={MAPPE_PATH} tone="muted" standalone>
          <FileText aria-hidden="true" strokeWidth={1.75} className="size-5" />
          Lieber mit kompletter Bewerbungsmappe?
        </TextLink>
      )}
    </div>
  );
}
