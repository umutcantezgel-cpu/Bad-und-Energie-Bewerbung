'use client';

import type { ReactNode } from 'react';
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

/**
 * Icon vor einem Linktext, der auf dem Handy umbricht: Das Icon steht auf Höhe der ersten Zeile
 * statt mittig zwischen den Zeilen; eine Zeile bleibt mittig in der 44-px-Trefferfläche.
 */
function IconLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="grid grid-cols-[auto_1fr] gap-x-1.5">
      {icon}
      <span>{children}</span>
    </span>
  );
}

const ICON_CLASS = 'mt-[calc((1lh_-_1.25rem)/2)] size-5';

/** Alternative Wege auf jedem Schritt: WhatsApp mit den bisherigen Antworten, optional die Mappe. */
export function FlowShortcuts({ control, jobLabel, questionSet, answers, showMappeLink }: FlowShortcutsProps) {
  // Eigener Abonnent, damit nur dieser Link beim Tippen des Namens neu rendert.
  const name = useWatch({ control, name: 'name' });
  const href = buildWhatsAppUrl(buildShortcutMessage({ jobLabel, questionSet, answers, name }));

  return (
    <div className="flex flex-col items-start border-t border-line pt-3">
      <TextLink href={href} target="_blank" rel="noopener noreferrer" tone="muted" standalone>
        <IconLabel icon={<MessageCircle aria-hidden="true" strokeWidth={1.75} className={ICON_CLASS} />}>
          Lieber direkt per WhatsApp?
          <span className="sr-only"> (öffnet WhatsApp)</span>
        </IconLabel>
      </TextLink>
      {showMappeLink && (
        <TextLink href={MAPPE_PATH} tone="muted" standalone>
          <IconLabel icon={<FileText aria-hidden="true" strokeWidth={1.75} className={ICON_CLASS} />}>
            Lieber mit kompletter Bewerbungsmappe?
          </IconLabel>
        </TextLink>
      )}
    </div>
  );
}
