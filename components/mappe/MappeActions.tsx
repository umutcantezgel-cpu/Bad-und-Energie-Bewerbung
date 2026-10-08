'use client';

import type { ReactNode, RefObject } from 'react';
import { CircleAlert, CircleCheck, Printer } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export type MappeFeedback =
  | { kind: 'none' }
  | { kind: 'error'; message: string; showContact: boolean }
  | { kind: 'sent'; reference: string };

export type SaveStatus = 'idle' | 'saved' | 'unavailable';

export interface MappeActionsProps {
  /** `followUp` when this browser tab already sent an application (STORAGE_KEYS.submitted). */
  mode: 'apply' | 'followUp';
  reference?: string;
  busy: boolean;
  onPrimary: () => void;
  onPrint: () => void;
  feedback: MappeFeedback;
  /** Focus target for errors, so keyboard users land on the message. */
  feedbackRef: RefObject<HTMLDivElement | null>;
  saveStatus: SaveStatus;
  /** Phone, WhatsApp and e-mail (server-rendered ContactOptions). */
  contact?: ReactNode;
  className?: string;
}

const SAVE_TEXT: Record<SaveStatus, string> = {
  idle: '',
  saved: 'Deine Angaben bleiben in diesem Browser-Tab gespeichert, bis du ihn schließt.',
  unavailable: 'Speichern im Browser ist nicht möglich. Lass diesen Tab offen, bis du fertig bist.',
};

export function MappeActions({
  mode,
  reference,
  busy,
  onPrimary,
  onPrint,
  feedback,
  feedbackRef,
  saveStatus,
  contact,
  className,
}: MappeActionsProps) {
  const primaryLabel = mode === 'followUp' ? 'Mappe nachreichen' : 'Mit dieser Mappe bewerben';
  const primaryHint =
    mode === 'followUp' ? (
      reference ? (
        <>
          Wird an deine Bewerbung <span className="whitespace-nowrap">{reference}</span> angehängt.
        </>
      ) : (
        'Wird an deine Bewerbung angehängt.'
      )
    ) : (
      'Im nächsten Schritt schickst du deine Bewerbung ab. Die Mappe wird angehängt.'
    );

  return (
    // No flex gap: the live regions below stay in the DOM while empty (so they announce reliably)
    // and must not add space then. Only children with content get the 20px step.
    <div className={cn('flex flex-col rounded-lg bg-surface-2 p-5 *:not-first:not-empty:mt-5 sm:p-6 print-hidden', className)}>
      <div className="flex flex-col gap-2">
        <Button size="lg" loading={busy} onClick={onPrimary} fullWidth className="sm:w-auto sm:self-start">
          {primaryLabel}
        </Button>
        <p className="text-footnote text-ink-muted">{primaryHint}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="outline" size="lg" onClick={onPrint} fullWidth className="sm:w-auto sm:self-start">
          <Printer aria-hidden="true" strokeWidth={1.75} className="size-5" />
          Als PDF speichern / drucken
        </Button>
        <p className="text-footnote text-ink-muted">Für ein PDF wählst du im Druckdialog „Als PDF speichern“.</p>
      </div>

      <div role="status" aria-live="polite">
        {feedback.kind === 'sent' && (
          <p className="flex items-start gap-2 text-callout text-ink">
            <CircleCheck aria-hidden="true" strokeWidth={2} className="mt-0.5 size-5 shrink-0 text-success" />
            <span>
              Deine Mappe ist angekommen und gehört jetzt zu deiner Bewerbung{' '}
              <span className="whitespace-nowrap">{feedback.reference}</span>.
            </span>
          </p>
        )}
      </div>

      {feedback.kind === 'error' && (
        <div ref={feedbackRef} tabIndex={-1} role="alert" className="flex flex-col gap-3 rounded-md bg-danger-subtle p-4 focus:outline-none">
          <p className="flex items-start gap-2 text-callout font-medium text-ink">
            <CircleAlert aria-hidden="true" strokeWidth={2} className="mt-0.5 size-5 shrink-0 text-danger" />
            <span>{feedback.message}</span>
          </p>
          {feedback.showContact && contact && (
            <div className="flex flex-col gap-1">
              <p className="text-callout text-ink">Deine Angaben bleiben erhalten. Du erreichst uns auch direkt:</p>
              {contact}
            </div>
          )}
        </div>
      )}

      <p role="status" className="text-footnote text-ink-muted">
        {SAVE_TEXT[saveStatus]}
      </p>
    </div>
  );
}
