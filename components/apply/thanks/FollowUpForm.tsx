'use client';

import { useRef, useState, type FormEvent } from 'react';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { ApplicationFollowUp } from '@/lib/applications/schema';
import { describeFailure } from '@/lib/apply/failure';
import { submitFollowUp, type SubmitFailure } from '@/lib/apply/submit';
import { buildFollowUpMessage } from '@/lib/apply/whatsapp-message';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { SubmitErrorPanel } from '../SubmitErrorPanel';

export interface FollowUpFormProps {
  reference: string;
  followUpToken: string;
  phoneHref: string;
}

interface Values {
  startDate: string;
  postalCode: string;
  message: string;
}

const EMPTY: Values = { startDate: '', postalCode: '', message: '' };
const POSTAL_CODE = /^\d{5}$/;

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; failure: SubmitFailure };

/** Optionale Ergänzungen nach dem Absenden (C8: POST /api/bewerbung/ergaenzung mit Nummer und Token). */
export function FollowUpForm({ reference, followUpToken, phoneHref }: FollowUpFormProps) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<{ postalCode?: string; form?: string }>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const postalRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const submitAreaRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof Values) => (event: { target: { value: string } }) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
    if (key === 'postalCode' && errors.postalCode && (value === '' || POSTAL_CODE.test(value))) {
      setErrors((current) => ({ ...current, postalCode: undefined }));
    }
  };

  const send = async () => {
    if (status.kind === 'sending') return;
    const startDate = values.startDate.trim();
    const postalCode = values.postalCode.trim();
    const message = values.message.trim();

    if (!startDate && !postalCode && !message) {
      setErrors({ form: 'Füll mindestens ein Feld aus.' });
      startRef.current?.focus();
      return;
    }
    if (postalCode && !POSTAL_CODE.test(postalCode)) {
      setErrors({ postalCode: 'Bitte gib eine fünfstellige Postleitzahl an.' });
      postalRef.current?.focus();
      return;
    }
    setErrors({});

    // Längen begrenzen die Eingabefelder (maxLength); der Server prüft mit applicationFollowUpSchema.
    const payload: ApplicationFollowUp = { reference, token: followUpToken };
    if (startDate) payload.startDate = startDate;
    if (postalCode) payload.postalCode = postalCode;
    if (message) payload.message = message;

    setStatus({ kind: 'sending' });
    const result = await submitFollowUp(payload);
    if (result.ok) {
      setStatus({ kind: 'sent' });
      requestAnimationFrame(() => successRef.current?.focus());
    } else {
      setStatus({ kind: 'error', failure: result });
      requestAnimationFrame(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        submitAreaRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send();
  };

  if (status.kind === 'sent') {
    return (
      <p ref={successRef} tabIndex={-1} role="status" className="flex items-center gap-2 text-body text-ink outline-none">
        <CircleCheck aria-hidden="true" strokeWidth={2} className="size-5 shrink-0 text-success" />
        Danke, deine Ergänzung ist angekommen.
      </p>
    );
  }

  const sending = status.kind === 'sending';
  // Ein einziger Weg zum erneuten Senden: der Button heißt dann „Erneut senden“, wenn es helfen kann.
  const canRetry = status.kind === 'error' && describeFailure(status.failure).action === 'retry';
  const whatsappHref = buildWhatsAppUrl(buildFollowUpMessage({ reference, kind: 'extras', ...values }));

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Frühester Starttermin">
        <Input ref={startRef} type="date" maxLength={100} value={values.startDate} onChange={update('startDate')} />
      </Field>
      <Field label="Postleitzahl" error={errors.postalCode}>
        <Input
          ref={postalRef}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          value={values.postalCode}
          onChange={update('postalCode')}
          className="max-w-40"
        />
      </Field>
      <Field label="Nachricht">
        <Textarea rows={4} maxLength={3000} value={values.message} onChange={update('message')} />
      </Field>

      {errors.form && (
        <p role="alert" className="text-footnote font-medium text-danger">
          {errors.form}
        </p>
      )}
      {/* Fehlerpanel unter dem Button, damit der Button beim Fehler nicht verrutscht (wie im Flow). */}
      <div ref={submitAreaRef} className="flex scroll-mb-4 flex-col gap-4">
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="self-start"
          aria-busy={sending || undefined}
          onClick={sending ? (event) => event.preventDefault() : undefined}
        >
          {sending && (
            <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          )}
          {sending ? 'Wird gesendet…' : canRetry ? 'Erneut senden' : 'Ergänzung senden'}
        </Button>
        {status.kind === 'error' && (
          <SubmitErrorPanel failure={status.failure} phoneHref={phoneHref} whatsappHref={whatsappHref} />
        )}
      </div>
    </form>
  );
}
