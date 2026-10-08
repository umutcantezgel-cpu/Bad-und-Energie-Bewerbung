'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui';
import { applicationJobIdSchema, type ApplicationJobId } from '@/lib/applications/schema';
import {
  createEmptyEditorState,
  fromMappe,
  isMappeEmpty,
  letterSubject,
  mappeEditorReducer,
  resolveCoverLetter,
  selectedJob,
  serializeMappe,
  type MappeContext,
  type MappeEditorState,
} from '@/lib/mappe/editor';
import { sendMappeFollowUp } from '@/lib/mappe/follow-up';
import { formatLetterDate } from '@/lib/mappe/format';
import {
  getLocalStorage,
  getSessionStorage,
  hasHandoverMappe,
  readDraft,
  readHandoverMappe,
  readSubmitted,
  removeHandoverMappe,
  removeLegacyDossier,
  writeDraft,
  writeHandoverMappe,
  type SubmittedApplication,
} from '@/lib/mappe/storage';
import type { MappeJobOption, MappeRecipient } from '@/lib/mappe/types';
import { cn } from '@/lib/utils/cn';
import { JobSection } from './JobSection';
import { LetterSection } from './LetterSection';
import { MappeActions, type MappeFeedback, type SaveStatus } from './MappeActions';
import { MappePreview } from './MappePreview';
import { PersonalSection } from './PersonalSection';
import { SkillsSection } from './SkillsSection';
import { StationsSection } from './StationsSection';

export interface MappeToolProps {
  /** Built on the server from the job registry (lib/mappe/context.ts). */
  jobs: MappeJobOption[];
  recipient: MappeRecipient;
  /** Server-rendered ContactOptions, shown when sending fails. */
  contact?: ReactNode;
  className?: string;
}

const SAVE_DELAY_MS = 300;
const APPLY_PATH = '/bewerbung';

function toJobId(value: string | null | undefined): ApplicationJobId | undefined {
  const parsed = applicationJobIdSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

/** Initial editor state from this tab: draft → handed-over mappe → empty; job from ?stelle= or the sent application. */
function restoreState(jobs: readonly MappeJobOption[], submitted: SubmittedApplication | null): MappeEditorState {
  const session = getSessionStorage();
  const draft = readDraft(session);
  const handover = draft ? null : readHandoverMappe(session);
  const state = draft ?? (handover ? fromMappe(handover) : createEmptyEditorState());
  if (state.jobId) return state;
  const slug = new URLSearchParams(window.location.search).get('stelle');
  const fromSlug = slug ? jobs.find((job) => job.slug === slug)?.id : undefined;
  return { ...state, jobId: fromSlug ?? toJobId(submitted?.jobId) ?? '' };
}

/**
 * Bewerbungsmappe (roadmap §6): optional tool outside the application path.
 * Editor left, live A4 preview right (stacked on mobile). Personal data and the
 * draft stay in sessionStorage; the photo stays in memory only.
 */
export function MappeTool({ jobs, recipient, contact, className }: MappeToolProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, dispatch] = useReducer(mappeEditorReducer, undefined, () => createEmptyEditorState());
  const [hydrated, setHydrated] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedApplication | null>(null);
  const [today, setToday] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<MappeFeedback>({ kind: 'none' });
  const [announcement, setAnnouncement] = useState({ id: 0, text: '' });
  const feedbackRef = useRef<HTMLDivElement>(null);
  const photoUrlRef = useRef<string | null>(null);
  /** The state as restored on mount; nothing is written until it changes. */
  const restoredRef = useRef<MappeEditorState | null>(null);

  const context: MappeContext = useMemo(() => ({ jobs, recipient }), [jobs, recipient]);
  const letter = resolveCoverLetter(state, context);
  const subject = letterSubject(state, jobs);

  // Restore once per mount: storage is client-only, so the static HTML renders the empty editor.
  useEffect(() => {
    removeLegacyDossier(getLocalStorage());
    const sent = readSubmitted(getSessionStorage());
    const restored = restoreState(jobs, sent);
    restoredRef.current = restored;
    dispatch({ type: 'hydrate', state: restored });
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from browser storage after hydration */
    setSubmitted(sent);
    setToday(formatLetterDate(new Date()));
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [jobs]);

  // Autosave (debounced) after the first edit. A mappe already handed to the flow follows later edits.
  useEffect(() => {
    if (!hydrated || state === restoredRef.current) return;
    const timer = window.setTimeout(() => {
      const session = getSessionStorage();
      setSaveStatus(writeDraft(session, state) ? 'saved' : 'unavailable');
      if (hasHandoverMappe(session)) {
        const result = isMappeEmpty(state) ? null : serializeMappe(state, context);
        if (!result) removeHandoverMappe(session);
        else if (result.ok) writeHandoverMappe(session, result.mappe);
      }
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state, hydrated, context]);

  // Object URLs are released when replaced and on unmount.
  useEffect(() => () => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
  }, []);

  useEffect(() => {
    if (feedback.kind === 'error') feedbackRef.current?.focus();
  }, [feedback]);

  const announce = useCallback((text: string) => {
    setAnnouncement((current) => ({ id: current.id + 1, text }));
  }, []);

  function handlePhoto(file: File | null) {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    const url = file ? URL.createObjectURL(file) : null;
    photoUrlRef.current = url;
    setPhotoUrl(url);
    announce(file ? 'Foto hinzugefügt.' : 'Foto entfernt.');
  }

  function handleResetLetter() {
    const previous = state.customLetter;
    dispatch({ type: 'resetLetter' });
    if (previous === null) return;
    toast({
      title: 'Anschreiben neu erstellt',
      description: 'Dein bearbeiteter Text wurde ersetzt.',
      action: { label: 'Rückgängig', onClick: () => dispatch({ type: 'letter', text: previous }) },
    });
  }

  async function handlePrimary() {
    if (busy) return;
    if (isMappeEmpty(state)) {
      setFeedback({
        kind: 'error',
        message: 'Deine Mappe ist noch leer. Wähl zum Beispiel deine Schwerpunkte oder trag Berufserfahrung ein.',
        showContact: false,
      });
      return;
    }
    const result = serializeMappe(state, context);
    if (!result.ok) {
      setFeedback({ kind: 'error', message: result.message, showContact: false });
      return;
    }

    if (!submitted) {
      if (!writeHandoverMappe(getSessionStorage(), result.mappe)) {
        setFeedback({
          kind: 'error',
          message:
            'Dein Browser lässt das Zwischenspeichern nicht zu. Bewirb dich trotzdem: Die Mappe kannst du danach als PDF per WhatsApp oder E-Mail schicken.',
          showContact: true,
        });
        return;
      }
      setFeedback({ kind: 'none' });
      const job = selectedJob(state, jobs);
      router.push(job?.published ? `${APPLY_PATH}?stelle=${encodeURIComponent(job.slug)}` : APPLY_PATH);
      return;
    }

    setBusy(true);
    setFeedback({ kind: 'none' });
    const response = await sendMappeFollowUp({
      reference: submitted.reference,
      token: submitted.followUpToken,
      mappe: result.mappe,
    });
    setBusy(false);
    setFeedback(
      response.ok
        ? { kind: 'sent', reference: submitted.reference }
        : { kind: 'error', message: response.message, showContact: true },
    );
  }

  return (
    <div className={cn('grid gap-12 lg:grid-cols-2 lg:gap-16 print:block', className)}>
      <div className="flex min-w-0 flex-col gap-10 print-hidden">
        <PersonalSection
          step={1}
          person={state.person}
          onChange={(patch) => dispatch({ type: 'person', patch })}
          photoUrl={photoUrl}
          onPhotoChange={handlePhoto}
        />
        <JobSection step={2} jobs={jobs} value={state.jobId} onChange={(jobId) => dispatch({ type: 'job', jobId })} />
        <SkillsSection
          step={3}
          skills={state.skills}
          onToggle={(skill) => dispatch({ type: 'toggleSkill', skill })}
          onAdd={(skill) => dispatch({ type: 'addSkill', skill })}
        />
        <LetterSection
          step={4}
          workStyleId={state.workStyleId}
          onWorkStyleChange={(id) => dispatch({ type: 'workStyle', id })}
          letter={letter}
          edited={state.customLetter !== null}
          onLetterChange={(text) => dispatch({ type: 'letter', text })}
          onResetLetter={handleResetLetter}
        />
        <StationsSection
          step={5}
          career={state.careerStations}
          education={state.educationStations}
          onCareer={(action) => dispatch({ type: 'career', action })}
          onEducation={(action) => dispatch({ type: 'education', action })}
          announce={announce}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start print:static print:block print:max-h-none">
        <MappeActions
          className="order-last shrink-0 lg:order-first"
          mode={submitted ? 'followUp' : 'apply'}
          reference={submitted?.reference}
          busy={busy}
          onPrimary={handlePrimary}
          onPrint={() => window.print()}
          feedback={feedback}
          feedbackRef={feedbackRef}
          saveStatus={saveStatus}
          contact={contact}
        />
        <section
          aria-labelledby="mappe-vorschau-title"
          tabIndex={0}
          className="flex min-h-0 flex-col gap-4 rounded-lg lg:overflow-y-auto print:overflow-visible"
        >
          <h2 id="mappe-vorschau-title" className="text-title-3 text-ink print-hidden">
            Vorschau
          </h2>
          <div className="rounded-lg bg-surface-2 p-3 sm:p-4 print:rounded-none print:bg-transparent print:p-0">
            <MappePreview
              person={state.person}
              subject={subject}
              letter={letter}
              recipient={recipient}
              skills={state.skills}
              career={state.careerStations}
              education={state.educationStations}
              photoUrl={photoUrl}
              today={today}
            />
          </div>
        </section>
      </div>

      <p aria-live="polite" className="sr-only">
        <span key={announcement.id}>{announcement.text}</span>
      </p>
    </div>
  );
}
