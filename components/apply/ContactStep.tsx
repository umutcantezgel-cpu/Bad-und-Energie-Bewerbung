'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { useController, useFormState, useWatch, type SubmitErrorHandler, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { SegmentedControl, type SegmentedOption } from '@/components/ui/SegmentedControl';
import { TextLink } from '@/components/ui/TextLink';
import { HONEYPOT_FIELD, type ContactChannel } from '@/lib/applications/constants';
import type { ApplicationAnswers } from '@/lib/applications/schema';
import { CONTACT_MAX_LENGTH, type ContactFormInput, type ContactFormValues } from '@/lib/apply/contact-schema';
import { suggestEmail } from '@/lib/apply/email-suggest';
import { describeFailure, type FailureOverrides } from '@/lib/apply/failure';
import type { QuestionSetId } from '@/lib/apply/questions';
import type { SubmitFailure } from '@/lib/apply/submit';
import { buildApplicationMessage } from '@/lib/apply/whatsapp-message';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { SubmitErrorPanel } from './SubmitErrorPanel';
import { Zusagenblock } from './strang/Zusage';

const CHANNEL_OPTIONS: readonly SegmentedOption<ContactChannel>[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Anruf' },
  { value: 'email', label: 'E-Mail' },
];

export type ContactForm = UseFormReturn<ContactFormInput, unknown, ContactFormValues>;

/** Im Flow ist meist die Bewerbungsmappe der Grund für eine zu große Anfrage. */
const FAILURE_OVERRIDES: FailureOverrides = {
  PAYLOAD_TOO_LARGE:
    'Deine Bewerbung ist zu lang, meist wegen der Bewerbungsmappe. Entferne die Mappe oder schick uns die Bewerbung per WhatsApp.',
};

export interface ContactStepProps {
  form: ContactForm;
  heading: ReactNode;
  headingId: string;
  intro?: string;
  submitting: boolean;
  /** Fehler aus dem letzten Absendeversuch; null blendet das Panel aus. */
  failure: SubmitFailure | null;
  onValid: SubmitHandler<ContactFormValues>;
  onInvalid?: SubmitErrorHandler<ContactFormInput>;
  /**
   * Diskretionszusage über dem Absenden-Knopf (E-BEW-004, Wortlaut DISCRETION_PROMISE); null bei der
   * Ausbildung (getDiscretionPromise).
   */
  discretion?: string | null;
  /** Honeypot-Feld (nicht Teil des Formularzustands); der Flow liest es beim Absenden. */
  honeypotRef: Ref<HTMLInputElement>;
  phoneHref: string;
  /** Für den WhatsApp-Rückfallweg mit der kompletten Bewerbung. */
  application: { jobLabel: string | null; questionSet: QuestionSetId; answers: ApplicationAnswers };
  /** Bewerbungsmappe aus dem Mappe-Werkzeug: vorhanden und mitgeschickt? */
  mappe: { present: boolean; included: boolean; onToggle: () => void };
}

/**
 * Letzter Schritt: Name, Telefon, Kontaktweg, optional E-Mail, dann der Zusagenblock (Diskretion und
 * Datenschutzhinweis) und der rote Knopf, in den Vorlauf und Rücklauf aus dem Block münden (K-001: der rote
 * Vorlauf endet in deiner Bewerbung).
 */
export function ContactStep({
  form,
  heading,
  headingId,
  intro,
  submitting,
  failure,
  onValid,
  onInvalid,
  discretion = null,
  honeypotRef,
  phoneHref,
  application,
  mappe,
}: ContactStepProps) {
  const id = useId();
  const { control, register, setFocus, setValue, trigger } = form;
  const { errors, touchedFields, isSubmitted } = useFormState({ control });
  const values = useWatch({ control });
  const { field: channelField } = useController({ control, name: 'contactChannel' });
  // Einmal sichtbar, bleibt das E-Mail-Feld stehen (auch wenn es geleert wird). Entwurf mit E-Mail: sofort sichtbar.
  const [emailRevealed, setEmailRevealed] = useState(() => Boolean(form.getValues('email')));

  const channel: ContactChannel = channelField.value ?? 'whatsapp';
  const email = values.email ?? '';
  const emailRequired = channel === 'email';
  const emailVisible = emailRevealed || emailRequired;
  const emailSuggestion = touchedFields.email && !errors.email ? suggestEmail(email) : null;

  const whatsappHref = buildWhatsAppUrl(
    buildApplicationMessage({
      ...application,
      name: values.name,
      phone: values.phone,
      email,
      contactChannel: channel,
    }),
  );

  // Ein einziger Weg zum erneuten Senden: der Absenden-Button heißt dann „Erneut senden“.
  const canRetry = failure !== null && describeFailure(failure, FAILURE_OVERRIDES).action === 'retry';

  // Das Fehlerpanel steht unter dem Absenden-Button, damit der Button (mit Fokus) beim Fehler nicht
  // unter dem Finger wegrutscht; Button und Panel werden zusammen in den sichtbaren Bereich geholt.
  const submitAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!failure) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    submitAreaRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [failure]);

  const nameField = register('name');
  const phoneField = register('phone');
  const emailField = register('email');

  const focusOnEnter = (next: 'phone' | 'email') => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    setFocus(next);
  };

  const revealEmail = () => {
    setEmailRevealed(true);
    requestAnimationFrame(() => setFocus('email'));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {heading}
        {intro && <p className="text-body text-ink-muted">{intro}</p>}
      </div>

      <form noValidate aria-labelledby={headingId} onSubmit={form.handleSubmit(onValid, onInvalid)} className="flex flex-col gap-6">
        <Field label="Name" error={errors.name?.message} required>
          <Input
            {...nameField}
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            maxLength={CONTACT_MAX_LENGTH.name}
            onKeyDown={focusOnEnter('phone')}
          />
        </Field>

        <Field label="Telefonnummer" hint="Für WhatsApp oder Rückruf" error={errors.phone?.message} required>
          <Input
            {...phoneField}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint={emailVisible ? 'next' : 'send'}
            maxLength={CONTACT_MAX_LENGTH.phone}
            onKeyDown={emailVisible ? focusOnEnter('email') : undefined}
          />
        </Field>

        <SegmentedControl<ContactChannel>
          legend="Wie sollen wir uns melden?"
          name={channelField.name}
          options={CHANNEL_OPTIONS}
          value={channel}
          onValueChange={(value) => {
            channelField.onChange(value);
            if (value === 'email') setEmailRevealed(true);
            if (isSubmitted || touchedFields.email) void trigger('email');
          }}
        />

        {emailVisible ? (
          <div className="flex flex-col gap-2">
            <Field label="E-Mail" optional={!emailRequired} required={emailRequired} error={errors.email?.message}>
              <Input
                {...emailField}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                maxLength={CONTACT_MAX_LENGTH.email}
              />
            </Field>
            <div aria-live="polite">
              {emailSuggestion && (
                <p className="text-footnote text-ink-muted">
                  Meintest du{' '}
                  <button
                    type="button"
                    className="rounded-xs font-medium text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
                    onClick={() => setValue('email', emailSuggestion, { shouldValidate: true, shouldDirty: true })}
                  >
                    {emailSuggestion}
                  </button>
                  ?
                </p>
              )}
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={revealEmail} className="-ml-3 gap-2 self-start px-3">
            <Icon name="plus" size="sm" className="text-brand" />
            E-Mail hinzufügen
          </Button>
        )}

        {mappe.present && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2 border-2 border-line-strong py-2 pl-4 pr-2">
            <p className="flex items-center gap-2 text-callout text-ink">
              <Icon name="file-text" size="md" className="text-brand" />
              {mappe.included ? 'Deine Bewerbungsmappe wird mitgeschickt.' : 'Deine Bewerbungsmappe wird nicht mitgeschickt.'}
            </p>
            <Button variant="link" size="sm" onClick={mappe.onToggle} className="px-2">
              {mappe.included ? 'Entfernen' : 'Doch mitschicken'}
            </Button>
          </div>
        )}

        {/*
          Honeypot: für Menschen unsichtbar und nicht erreichbar, Bots füllen ihn aus. Name und Label
          kennt kein Autofill-Profil; autocomplete="off" plus die Ignore-Attribute der gängigen
          Passwortmanager. Ein Treffer wird nicht verworfen, sondern als Spamverdacht zugestellt.
        */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor={`${id}-${HONEYPOT_FIELD}`}>Hinweis zur Rückrufzeit</label>
          <input
            ref={honeypotRef}
            id={`${id}-${HONEYPOT_FIELD}`}
            name="contact_time_hint"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            data-1p-ignore=""
            data-lpignore="true"
            data-bwignore="true"
            data-form-type="other"
            defaultValue=""
          />
        </div>

        <div ref={submitAreaRef} className="flex scroll-mb-4 flex-col">
          {/*
            Diskretion (nicht bei Ausbildung) und Hinweis statt Checkbox mit Rechtsgrundlage (ROADMAP §6;
            DSB-Bestätigung steht aus), direkt über dem Knopf: Wer den Knopf sieht, sieht auch die Zusage.
          */}
          <Zusagenblock zusage={discretion}>
            <p className="text-footnote text-ink-2">
              Wir verarbeiten deine Angaben für deine Bewerbung (Art. 6 Abs. 1 lit. b DSGVO). Mehr dazu in den{' '}
              <TextLink href="/datenschutz#bewerberdaten">Datenschutzhinweisen</TextLink>.
            </p>
          </Zusagenblock>
          {/* Vorlauf und Rücklauf fallen aus der Linie des Blocks in den Knopf (Button leitung="oben", 32 px). */}
          <Button type="submit" size="lg" fullWidth leitung="oben" loading={submitting} className="mt-8">
            {canRetry ? 'Erneut senden' : 'Bewerbung absenden'}
            <Icon name="arrow-right" size="md" />
          </Button>
          <p role="status" className="sr-only">
            {submitting ? 'Wird gesendet…' : ''}
          </p>
          {failure && (
            <SubmitErrorPanel
              failure={failure}
              phoneHref={phoneHref}
              whatsappHref={whatsappHref}
              overrides={FAILURE_OVERRIDES}
              className="mt-4"
            />
          )}
        </div>
      </form>
    </div>
  );
}
