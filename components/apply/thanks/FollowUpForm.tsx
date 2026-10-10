'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { describeFailure } from '@/lib/apply/failure';
import { submitFollowUp, type SubmitFailure } from '@/lib/apply/submit';
import { buildFollowUpMessage } from '@/lib/apply/whatsapp-message';
import { SKILL_OPTIONS } from '@/lib/mappe/options';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { SubmitErrorPanel } from '../SubmitErrorPanel';
import { ERGAENZEN_TEXT, ergaenzungPruefen, rueckfallNachricht, type ErgaenzungWerte } from './danke-text';
import styles from './danke.module.css';

export interface FollowUpFormProps {
  reference: string;
  followUpToken: string;
  phoneHref: string;
  /**
   * Kenntnis-Chips zeigen (E-START-015). Nicht bei der Ausbildung: Wer noch zur Schule geht, hat diese
   * Praxis meist noch nicht; die Felder bleiben.
   */
  kenntnisse?: boolean;
}

const EMPTY: ErgaenzungWerte = { startDate: '', postalCode: '', message: '' };
const POSTAL_CODE = /^\d{5}$/;

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; failure: SubmitFailure };

/**
 * Freiwillige Ergänzungen nach dem Absenden (C8: POST /api/bewerbung/ergaenzung mit Nummer und Token):
 * Kenntnis-Chips (E-START-015, als `mappe.skills`), Starttermin, Postleitzahl und Nachricht mit dem Hinweis auf
 * Wunschkonditionen (E-BEW-015). Erfolg erst nach Serverbestätigung (lib/apply/submit.ts), sonst das Fehlerpanel
 * mit Anruf und WhatsApp.
 */
export function FollowUpForm({ reference, followUpToken, phoneHref, kenntnisse = true }: FollowUpFormProps) {
  const [values, setValues] = useState<ErgaenzungWerte>(EMPTY);
  const [skills, setSkills] = useState<readonly string[]>([]);
  const [errors, setErrors] = useState<{ postalCode?: string; form?: string }>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const postalRef = useRef<HTMLInputElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const submitAreaRef = useRef<HTMLDivElement>(null);
  const kenntnisseId = useId();

  const update = (key: keyof ErgaenzungWerte) => (event: { target: { value: string } }) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
    if (key === 'postalCode' && errors.postalCode && (value === '' || POSTAL_CODE.test(value))) {
      setErrors((current) => ({ ...current, postalCode: undefined }));
    }
  };

  const toggle = (skill: string) => {
    setSkills((current) => (current.includes(skill) ? current.filter((entry) => entry !== skill) : [...current, skill]));
    if (errors.form) setErrors((current) => ({ ...current, form: undefined }));
  };

  const send = async () => {
    if (status.kind === 'sending') return;
    const check = ergaenzungPruefen(values, kenntnisse ? skills : [], { reference, token: followUpToken });
    if (!check.ok) {
      if (check.fehler === 'plz') {
        setErrors({ postalCode: ERGAENZEN_TEXT.plzFehler });
        postalRef.current?.focus();
      } else {
        setErrors({ form: kenntnisse ? ERGAENZEN_TEXT.leer : ERGAENZEN_TEXT.leerOhneKenntnisse });
        if (kenntnisse) chipsRef.current?.querySelector('button')?.focus();
        else firstRef.current?.focus();
      }
      return;
    }
    setErrors({});

    // Längen begrenzen die Eingabefelder (maxLength); der Server prüft mit applicationFollowUpSchema.
    setStatus({ kind: 'sending' });
    const result = await submitFollowUp(check.payload);
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
      <p ref={successRef} tabIndex={-1} role="status" className="flex items-center gap-3 text-body font-bold text-ink outline-none">
        <Icon name="circle-check" size="lg" className="shrink-0 text-success" />
        {ERGAENZEN_TEXT.gesendet}
      </p>
    );
  }

  const sending = status.kind === 'sending';
  // Ein einziger Weg zum erneuten Senden: der Button heißt dann „Erneut senden“, wenn es helfen kann.
  const canRetry = status.kind === 'error' && describeFailure(status.failure).action === 'retry';
  const whatsappHref = buildWhatsAppUrl(
    buildFollowUpMessage({
      reference,
      kind: 'extras',
      startDate: values.startDate,
      postalCode: values.postalCode,
      message: rueckfallNachricht(values.message, kenntnisse ? skills : []),
    }),
  );

  return (
    <form noValidate onSubmit={onSubmit} className={styles.form} data-danke="ergaenzung">
      {kenntnisse ? (
        <fieldset className={styles.kenntnisse} aria-describedby={`${kenntnisseId}-hinweis`}>
          <legend className="text-callout font-bold text-ink">{ERGAENZEN_TEXT.kenntnisseFrage}</legend>
          <p id={`${kenntnisseId}-hinweis`} className="text-footnote text-ink-2">
            {ERGAENZEN_TEXT.kenntnisseHinweis}
          </p>
          <div ref={chipsRef} className={styles.chips}>
            {SKILL_OPTIONS.map((skill) => (
              <Chip
                key={skill}
                pressed={skills.includes(skill)}
                onClick={() => toggle(skill)}
                // Lange Einträge brechen um: Radius 12 statt Pille; am Handy nimmt jeder Chip die volle Breite.
                className="max-w-full shrink rounded-2 py-2 text-left max-sm:w-full"
              >
                {skill}
              </Chip>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className={styles.felder}>
        <Field label={ERGAENZEN_TEXT.start}>
          <Input ref={firstRef} type="date" maxLength={100} value={values.startDate} onChange={update('startDate')} />
        </Field>
        <Field label={ERGAENZEN_TEXT.plz} error={errors.postalCode}>
          <Input
            ref={postalRef}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={values.postalCode}
            onChange={update('postalCode')}
          />
        </Field>
      </div>
      <Field label={ERGAENZEN_TEXT.nachricht} hint={ERGAENZEN_TEXT.nachrichtHinweis}>
        <Textarea rows={4} maxLength={3000} value={values.message} onChange={update('message')} />
      </Field>

      {/* Fehlerpanel unter dem Button, damit der Button beim Fehler nicht verrutscht (wie im Flow). */}
      <div ref={submitAreaRef} className={styles.senden}>
        {errors.form && (
          <p role="alert" className="flex items-center gap-2 text-callout font-bold text-danger">
            <Icon name="circle-alert" size="md" className="shrink-0" />
            {errors.form}
          </p>
        )}
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          aria-busy={sending || undefined}
          onClick={sending ? (event) => event.preventDefault() : undefined}
        >
          {sending && (
            <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          )}
          {sending ? ERGAENZEN_TEXT.sendet : canRetry ? ERGAENZEN_TEXT.erneut : ERGAENZEN_TEXT.senden}
        </Button>
        {status.kind === 'error' && (
          <SubmitErrorPanel failure={status.failure} phoneHref={phoneHref} whatsappHref={whatsappHref} />
        )}
      </div>
    </form>
  );
}
