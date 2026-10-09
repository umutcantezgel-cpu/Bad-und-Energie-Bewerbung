'use client';

import { useCallback, useEffect, useId, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitErrorHandler } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { StepHeader } from '@/components/ui/StepHeader';
import { Tag } from '@/components/ui/Tag';
import { getAttribution } from '@/lib/attribution/store';
import type { ApplicationJobId } from '@/lib/applications/constants';
import type { Mappe } from '@/lib/applications/schema';
import { contactResolver, EMPTY_CONTACT, type ContactFormInput, type ContactFormValues } from '@/lib/apply/contact-schema';
import { clearDraft, loadDraft, saveDraft } from '@/lib/apply/draft';
import {
  CONTACT_STEP,
  JOB_STEP,
  flowReducer,
  getSteps,
  initFlowState,
  isStepAnswered,
  nextStepOf,
  previousStepOf,
  resolveStep,
  stepFromSlug,
  stepSlug,
  type FlowState,
  type StepId,
} from '@/lib/apply/flow';
import { paramForJob } from '@/lib/apply/params';
import { getQuestion, questionSetFor, type AnswerKey } from '@/lib/apply/questions';
import { clearMappe, readMappe, removeLegacyDossier, writeSubmitted } from '@/lib/apply/storage';
import {
  CONTACT_FIELDS,
  buildApplicationPayload,
  createIdempotencyKey,
  firstNameOf,
  mergeAttribution,
  submitApplication,
  type SubmitFailure,
} from '@/lib/apply/submit';
import { cn } from '@/lib/utils/cn';
import { ContactStep } from './ContactStep';
import { FlowShortcuts } from './FlowShortcuts';
import { InlineSuccess, JobStep, QuestionStep, StepHeading } from './steps';
import type { ApplyFlowProps, FlowContact, FlowJobOption } from './types';

export const THANK_YOU_PATH = '/bewerbung/danke';

/** Kurzes Hervorheben der gewählten Karte vor dem Auto-Weiter (ROADMAP §6). */
const ADVANCE_DELAY_MS = 180;
const DRAFT_SAVE_DELAY_MS = 300;
/** Eigener Schlüssel im history.state; Next ergänzt dort seine internen Felder. */
const HISTORY_DEPTH_KEY = 'applyFlowDepth';

export interface ApplyFlowClientProps extends ApplyFlowProps {
  options: readonly FlowJobOption[];
  contact: FlowContact;
  /** Satz unter der Kontaktfrage (Fakt quickResponse). */
  quickResponse?: string;
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; failure: SubmitFailure }
  | { status: 'done'; reference: string; firstName: string };

interface Session {
  ready: boolean;
  mappe: Mappe | null;
  includeMappe: boolean;
}

const mergeSession = (state: Session, patch: Partial<Session>): Session => ({ ...state, ...patch });

function historyDepthOf(state: unknown): number {
  const depth = (state as Record<string, unknown> | null)?.[HISTORY_DEPTH_KEY];
  return typeof depth === 'number' && depth >= 0 ? depth : 0;
}

/**
 * Client-Teil des Bewerbungsflows: eine Frage pro Screen, Auto-Weiter, Entwurf in
 * sessionStorage, ehrliches Absenden mit Fallbacks. Wird über <ApplyFlow> eingebunden.
 */
export function ApplyFlowClient({
  options,
  contact,
  quickResponse,
  initialJobId,
  variant = 'page',
  funnel,
  className,
}: ApplyFlowClientProps) {
  const router = useRouter();
  const baseId = useId();
  const headingId = `${baseId}-step`;
  const headingAs = variant === 'page' ? 'h2' : 'h3';
  const isPage = variant === 'page';

  const [state, dispatch] = useReducer(
    flowReducer,
    { jobId: initialJobId ?? null, questionSet: questionSetFor(initialJobId, options) },
    initFlowState,
  );
  const [session, patchSession] = useReducer(mergeSession, { ready: false, mappe: null, includeMappe: true });
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' });
  const [advancing, setAdvancing] = useState(false);

  const form = useForm<ContactFormInput, unknown, ContactFormValues>({
    resolver: contactResolver,
    mode: 'onTouched',
    defaultValues: EMPTY_CONTACT,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stateRef = useRef<FlowState>(state);
  const focusPending = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyDepth = useRef(0);
  /** Erste Eingabe (auch aus dem Entwurf): Grundlage der Ausfülldauer für den Spam-Hinweis. */
  const firstInteractionAt = useRef<number | null>(null);
  /** Bleibt über Reloads im Entwurf, damit ein erneutes Senden dieselbe Bewerbung bleibt. */
  const idempotencyKey = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const jobOption = state.jobId ? options.find((option) => option.id === state.jobId) : undefined;

  // ---------------------------------------------------------------------------
  // URL und History (nur page): jeder Schritt ein Eintrag, damit die Zurück-Geste funktioniert.
  // ---------------------------------------------------------------------------

  const writeHistory = useCallback(
    (step: StepId, jobId: ApplicationJobId | null, mode: 'push' | 'replace') => {
      if (!isPage) return;
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('tab');
        url.searchParams.delete('direct');
        url.searchParams.set('schritt', stepSlug(step));
        const jobParam = paramForJob(jobId, options);
        if (jobParam) url.searchParams.set('stelle', jobParam);
        else url.searchParams.delete('stelle');
        const href = `${url.pathname}${url.search}${url.hash}`;
        if (mode === 'push') {
          historyDepth.current += 1;
          window.history.pushState({ [HISTORY_DEPTH_KEY]: historyDepth.current }, '', href);
        } else {
          window.history.replaceState({ [HISTORY_DEPTH_KEY]: historyDepth.current }, '', href);
        }
      } catch {
        // Manche In-App-Browser sperren die History-API: Der Flow läuft dann ohne URL-Einträge.
      }
    },
    [isPage, options],
  );

  const clearAdvance = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    setAdvancing(false);
  }, []);

  /** Zu einem Schritt wechseln; Fokus wandert danach auf dessen Überschrift. */
  const goToStep = useCallback(
    (target: StepId, mode: 'push' | 'replace', jobId: ApplicationJobId | null = stateRef.current.jobId) => {
      focusPending.current = true;
      dispatch({ type: 'goTo', step: target });
      writeHistory(target, jobId, mode);
    },
    [writeHistory],
  );

  // ---------------------------------------------------------------------------
  // Entwurf (sessionStorage, 24 h)
  // ---------------------------------------------------------------------------

  const writeDraft = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    if (finished.current) return;
    const current = stateRef.current;
    const values = form.getValues();
    saveDraft(
      {
        jobId: current.jobId,
        answers: current.answers,
        name: values.name ?? '',
        phone: values.phone ?? '',
        email: values.email ?? '',
        contactChannel: values.contactChannel ?? 'whatsapp',
        firstInteractionAt: firstInteractionAt.current ?? undefined,
        idempotencyKey: idempotencyKey.current ?? undefined,
      },
      Date.now(),
    );
  }, [form]);

  const persistDraft = useCallback(() => {
    if (!stateRef.current.dirty) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = null;
      return;
    }
    writeDraft();
  }, [writeDraft]);

  /** Erste Auswahl oder Eingabe merken; ein wiederhergestellter Entwurf zählt nicht als neuer Start. */
  const markInteraction = useCallback(() => {
    firstInteractionAt.current ??= Date.now();
  }, []);

  const scheduleDraft = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(persistDraft, DRAFT_SAVE_DELAY_MS);
  }, [persistDraft]);

  // Beim Laden: alten localStorage-Eintrag löschen, Entwurf und Mappe lesen, Schritt aus ?schritt=.
  useEffect(() => {
    removeLegacyDossier();

    const draft = loadDraft(Date.now());
    if (draft) {
      // Ältere Entwürfe ohne Zeitpunkt: gespeichert heißt, es wurde spätestens dann schon ausgefüllt.
      firstInteractionAt.current = draft.firstInteractionAt ?? draft.savedAt;
      idempotencyKey.current = draft.idempotencyKey ?? null;
    }
    // Vorauswahl (Prop oder ?stelle=) schlägt den Entwurf; eine inzwischen nicht mehr wählbare Stelle fällt weg.
    const draftJobId = draft?.jobId && options.some((option) => option.id === draft.jobId) ? draft.jobId : null;
    const jobId = initialJobId ?? draftJobId;
    const requested = isPage ? stepFromSlug(new URLSearchParams(window.location.search).get('schritt')) : null;
    const action = {
      type: 'restore',
      jobId,
      questionSet: questionSetFor(jobId, options),
      answers: draft?.answers ?? {},
      step: requested,
    } as const;
    const restored = flowReducer(stateRef.current, action);
    dispatch(action);

    if (draft) {
      form.reset({
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
        contactChannel: draft.contactChannel,
      });
    }
    patchSession({ ready: true, mappe: readMappe() });

    if (isPage) {
      historyDepth.current = historyDepthOf(window.history.state);
      writeHistory(restored.step, restored.jobId, 'replace');
    }
    // Nur beim ersten Rendern; spätere Prop-Wechsel ändern einen laufenden Flow nicht.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Antworten oder Stelle geändert → Entwurf speichern.
  useEffect(() => {
    if (state.dirty) scheduleDraft();
  }, [state.dirty, state.jobId, state.answers, scheduleDraft]);

  // Getippte Kontaktdaten → Entwurf speichern (ohne den ganzen Flow neu zu rendern).
  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ name }) => {
          if (!name) return; // reset() beim Wiederherstellen zählt nicht als Eingabe
          markInteraction();
          dispatch({ type: 'touch' });
          scheduleDraft();
        },
      }),
    [form, scheduleDraft, markInteraction],
  );

  // Ausstehenden Entwurf sichern, wenn die Seite verlassen wird; Timer aufräumen.
  useEffect(() => {
    const flush = () => {
      if (saveTimer.current) persistDraft();
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [persistDraft]);

  // Zurück/Vor im Browser (page): Schritt aus der URL, Deep Links nur bis zum ersten offenen Schritt.
  useEffect(() => {
    if (!isPage) return;
    const onPopState = (event: PopStateEvent) => {
      historyDepth.current = historyDepthOf(event.state);
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
      setAdvancing(false);
      const requested = stepFromSlug(new URLSearchParams(window.location.search).get('schritt'));
      if (!requested) return;
      const current = stateRef.current;
      const target = resolveStep(current, requested);
      focusPending.current = true;
      dispatch({ type: 'goTo', step: target });
      if (target !== requested) writeHistory(target, current.jobId, 'replace');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isPage, writeHistory]);

  // Schrittwechsel: Fokus auf die Frage, Flow in den sichtbaren Bereich holen.
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    headingRef.current?.focus({ preventScroll: true });
    const box = containerRef.current;
    if (!box) return;
    const top = box.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [state.step, submit.status]);

  // Danke-Seite vorladen, sobald der Kontaktschritt erreicht ist.
  useEffect(() => {
    if (state.step === CONTACT_STEP) router.prefetch(THANK_YOU_PATH);
  }, [state.step, router]);

  // ---------------------------------------------------------------------------
  // Auswahl und Navigation
  // ---------------------------------------------------------------------------

  const scheduleAdvance = (target: StepId, jobId: ApplicationJobId | null) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setAdvancing(true);
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      setAdvancing(false);
      goToStep(target, 'push', jobId);
    }, ADVANCE_DELAY_MS);
  };

  const handleSelectJob = (option: FlowJobOption) => {
    markInteraction();
    const action = { type: 'selectJob', jobId: option.id, questionSet: option.questionSet } as const;
    const next = flowReducer(state, action);
    dispatch(action);
    scheduleAdvance(nextStepOf(next, JOB_STEP), option.id);
  };

  const handleAnswer = (key: AnswerKey, value: string) => {
    markInteraction();
    const action = { type: 'answer', key, value } as const;
    const next = flowReducer(state, action);
    dispatch(action);
    scheduleAdvance(nextStepOf(next, key), next.jobId);
  };

  const handleContinue = () => {
    clearAdvance();
    goToStep(nextStepOf(state, state.step), 'push');
  };

  const handleBack = () => {
    clearAdvance();
    const previous = previousStepOf(state, state.step);
    if (!previous) return;
    if (isPage && historyDepth.current > 0) {
      window.history.back();
      return;
    }
    goToStep(previous, 'replace');
  };

  const handleEditJob = () => {
    clearAdvance();
    goToStep(JOB_STEP, 'push');
  };

  // ---------------------------------------------------------------------------
  // Absenden
  // ---------------------------------------------------------------------------

  const focusFieldErrors = (fieldErrors: SubmitFailure['fieldErrors']) => {
    let focused = false;
    for (const field of CONTACT_FIELDS) {
      const message = fieldErrors[field];
      if (!message) continue;
      const focusable = field !== 'contactChannel';
      form.setError(field, { type: 'server', message }, { shouldFocus: focusable && !focused });
      if (focusable) focused = true;
    }
    return focused;
  };

  const onValid = async (values: ContactFormValues) => {
    if (inFlight.current || finished.current) return;
    const current = stateRef.current;
    if (!current.jobId) {
      goToStep(JOB_STEP, 'push');
      return;
    }

    // Kontaktfelder prüft der Resolver; fehlt noch eine Antwort (z. B. nach einem Stellenwechsel), dorthin.
    const open = resolveStep(current, CONTACT_STEP);
    if (open !== CONTACT_STEP) {
      goToStep(open, 'push');
      return;
    }

    if (!idempotencyKey.current) {
      idempotencyKey.current = createIdempotencyKey();
      // Sofort in den Entwurf: Geht die Antwort verloren und lädt die Person neu, bleibt es dieselbe Bewerbung.
      writeDraft();
    }
    const payload = buildApplicationPayload({
      jobId: current.jobId,
      answers: current.answers,
      name: values.name,
      phone: values.phone,
      email: values.email,
      contactChannel: values.contactChannel,
      honeypot: honeypotRef.current?.value ?? '',
      mappe: session.includeMappe ? session.mappe : null,
      attribution: mergeAttribution(getAttribution(), funnel),
      idempotencyKey: idempotencyKey.current,
      firstInteractionAt: firstInteractionAt.current,
    });

    inFlight.current = true;
    setSubmit({ status: 'submitting' });
    const result = await submitApplication(payload);

    if (result.ok) {
      finished.current = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      clearDraft();
      if (payload.mappe) clearMappe();
      const firstName = result.firstName || firstNameOf(values.name);
      const stored = writeSubmitted({
        reference: result.reference,
        followUpToken: result.followUpToken,
        firstName,
        jobId: current.jobId,
        submittedAt: new Date().toISOString(),
      });
      if (stored) {
        // page: replace, damit Zurück nicht in den abgeschickten Flow führt (die Schritte haben eigene
        // Einträge). Eingebettet: push, damit Zurück wieder auf der Stellenseite landet. Ein erneutes
        // Senden ist in beiden Fällen ausgeschlossen (Entwurf gelöscht, finished gesetzt).
        if (isPage) router.replace(THANK_YOU_PATH);
        else router.push(THANK_YOU_PATH);
      } else {
        focusPending.current = true;
        setSubmit({ status: 'done', reference: result.reference, firstName });
      }
      return;
    }

    inFlight.current = false;
    const focusedField = result.kind === 'validation' && focusFieldErrors(result.fieldErrors);
    const onlyFieldErrors = focusedField && Object.keys(result.otherErrors).length === 0;
    setSubmit(onlyFieldErrors ? { status: 'idle' } : { status: 'error', failure: result });
  };

  const onInvalid: SubmitErrorHandler<ContactFormInput> = () => {
    // react-hook-form fokussiert das erste fehlerhafte Feld; ein altes Fehlerpanel passt nicht mehr.
    if (submit.status === 'error') setSubmit({ status: 'idle' });
  };

  // ---------------------------------------------------------------------------
  // Darstellung
  // ---------------------------------------------------------------------------

  const steps = getSteps(state);
  const current = Math.max(0, steps.indexOf(state.step)) + 1;
  const canGoBack = previousStepOf(state, state.step) !== null;
  const answered = isStepAnswered(state, state.step);
  const jobLabel = jobOption?.summaryLabel ?? null;

  const heading = (text: string) => (
    <StepHeading as={headingAs} id={headingId} ref={headingRef}>
      {text}
    </StepHeading>
  );

  let body;
  if (submit.status === 'done') {
    body = (
      <InlineSuccess
        heading={heading(submit.firstName ? `Danke, ${submit.firstName}. Deine Bewerbung ist da.` : 'Danke. Deine Bewerbung ist da.')}
        reference={submit.reference}
        quickResponse={quickResponse}
      />
    );
  } else if (state.step === JOB_STEP) {
    body = (
      <JobStep
        heading={heading('Für welche Stelle interessierst du dich?')}
        headingId={headingId}
        options={options}
        selected={state.jobId}
        onSelect={handleSelectJob}
        onContinue={answered && !advancing ? handleContinue : undefined}
      />
    );
  } else if (state.step === CONTACT_STEP) {
    body = (
      <ContactStep
        form={form}
        heading={heading('Wie erreichen wir dich?')}
        headingId={headingId}
        intro={quickResponse}
        submitting={submit.status === 'submitting'}
        failure={submit.status === 'error' ? submit.failure : null}
        onValid={onValid}
        onInvalid={onInvalid}
        honeypotRef={honeypotRef}
        phoneHref={contact.phoneHref}
        application={{ jobLabel, questionSet: state.questionSet, answers: state.answers }}
        mappe={{
          present: session.mappe !== null,
          included: session.includeMappe,
          onToggle: () => patchSession({ includeMappe: !session.includeMappe }),
        }}
      />
    );
  } else {
    const question = getQuestion(state.step);
    body = question ? (
      <QuestionStep
        heading={heading(question.title)}
        headingId={headingId}
        question={question}
        value={state.answers[question.key]}
        onAnswer={(value) => handleAnswer(question.key, value)}
        onContinue={answered && !advancing ? handleContinue : undefined}
      />
    ) : null;
  }

  const done = submit.status === 'done';

  return (
    <div ref={containerRef} data-apply-flow={variant} className={cn('flex flex-col gap-8', className)}>
      {!done && (
        <div className="flex flex-col gap-4">
          <StepHeader current={current} total={steps.length} onBack={canGoBack ? handleBack : undefined} />
          {jobOption && state.step !== JOB_STEP && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Tag>
                <span className="sr-only">Stelle: </span>
                {jobOption.summaryLabel}
              </Tag>
              <Button variant="link" size="sm" onClick={handleEditJob} className="px-1">
                ändern
                <span className="sr-only"> (Stelle wählen)</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Schrittwechsel: kurzes Einblenden per @starting-style (nicht beim ersten Laden; bei reduzierter Bewegung nur Überblendung). */}
      <div
        key={done ? 'done' : state.step}
        className={cn('transition duration-step ease-standard', session.ready && 'starting:translate-y-2 starting:opacity-0')}
      >
        {body}
      </div>

      {!done && (
        <FlowShortcuts
          control={form.control}
          jobLabel={jobLabel}
          questionSet={state.questionSet}
          answers={state.answers}
          showMappeLink={isPage}
        />
      )}
    </div>
  );
}
