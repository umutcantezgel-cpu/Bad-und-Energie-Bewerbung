'use client';

import { useRef, useState, type FormEvent } from 'react';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { applicationFollowUpSchema, type ApplicationFollowUp } from '@/lib/applications/schema';
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

    const payload: ApplicationFollowUp = { reference, token: followUpToken };
    if (startDate) payload.startDate = startDate;
    if (postalCode) payload.postalCode = postalCode;
    if (message) payload.message = message;
    const checked = applicationFollowUpSchema.safeParse(payload);
    if (!checked.success) {
      setErrors({ form: 'Bitte prüfe deine Angaben.' });
      return;
    }

    setStatus({ kind: 'sending' });
    const result = await submitFollowUp(checked.data);
    if (result.ok) {
      setStatus({ kind: 'sent' });
      requestAnimationFrame(() => successRef.current?.focus());
    } else {
      setStatus({ kind: 'error', failure: result });
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
  const whatsappHref = buildWhatsAppUrl(buildFollowUpMessage({ reference, kind: 'extras', ...values }));

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Frühester Starttermin">
        <Input ref={startRef} type="date" value={values.startDate} onChange={update('startDate')} />
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
      {status.kind === 'error' && (
        <SubmitErrorPanel failure={status.failure} onRetry={() => void send()} phoneHref={phoneHref} whatsappHref={whatsappHref} />
      )}

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
        {sending ? 'Wird gesendet…' : 'Ergänzung senden'}
      </Button>
    </form>
  );
}
