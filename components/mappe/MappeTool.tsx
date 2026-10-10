'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui';
import { Leitungstrenner } from '@/components/zeichnung/Leitungstrenner';
import { INITIATIVE_JOB_ID } from '@/lib/applications/constants';
import { jobIdFromParam, paramForJob } from '@/lib/apply/params';
import { buildMappeShareMessage } from '@/lib/apply/whatsapp-message';
import { readSubmitted, removeLegacyDossier, type SubmittedApplication } from '@/lib/apply/storage';
import {
  createEmptyEditorState,
  fromMappe,
  isMappeEmpty,
  letterSubject,
  mappeEditorReducer,
  resolveCoverLetter,
  serializeMappe,
  type MappeContext,
  type MappeEditorState,
} from '@/lib/mappe/editor';
import { sendMappeFollowUp } from '@/lib/mappe/follow-up';
import { formatLetterDate } from '@/lib/mappe/format';
import {
  getSessionStorage,
  hasHandoverMappe,
  readDraft,
  readHandoverMappe,
  removeHandoverMappe,
  writeDraft,
  writeHandoverMappe,
} from '@/lib/mappe/storage';
import type { MappeJobOption, MappeRecipient } from '@/lib/mappe/types';
import { cn } from '@/lib/utils/cn';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { JobSection } from './JobSection';
import { LetterSection } from './LetterSection';
import { MappeActions, type MappeFeedback, type SaveStatus } from './MappeActions';
import { MappePreview } from './MappePreview';
import { MappeStand } from './MappeStand';
import styles from './mappe.module.css';
import { PersonalSection } from './PersonalSection';
import { SkillsSection } from './SkillsSection';
import { StationsSection } from './StationsSection';
import { mappeStand, standText, type MappeStandWerte } from './stand';

export interface MappeToolProps {
  /** Built on the server from the job registry (lib/mappe/context.ts). */
  jobs: MappeJobOption[];
  recipient: MappeRecipient;
  /** Server-rendered ContactOptions, shown when sending fails. */
  contact?: ReactNode;
  className?: string;
}

const SAVE_DELAY_MS = 300;
/** The flow (components/mappe/text.ts names it for the header; kept here so COMPANY stays out of the client bundle). */
const APPLY_PATH = '/bewerbung';

/** Initial editor state from this tab: draft → handed-over mappe → empty; job from ?stelle= or the sent application. */
function restoreState(jobs: readonly MappeJobOption[], submitted: SubmittedApplication | null): MappeEditorState {
  const session = getSessionStorage();
  const draft = readDraft(session);
  const handover = draft ? null : readHandoverMappe(session);
  const state = draft ?? (handover ? fromMappe(handover) : createEmptyEditorState());
  if (state.jobId) return state;
  const fromParam = jobIdFromParam(new URLSearchParams(window.location.search).get('stelle') ?? undefined, jobs);
  return { ...state, jobId: fromParam ?? submitted?.jobId ?? '' };
}

/** Flow with the job chosen here preselected (slug for published and funnel_only jobs, „initiativ“). */
function applyHref(jobId: MappeEditorState['jobId'], jobs: readonly MappeJobOption[]): string {
  const param = jobId ? paramForJob(jobId, jobs) : null;
  return param ? `${APPLY_PATH}?stelle=${encodeURIComponent(param)}` : APPLY_PATH;
}

/** „Persönliches erledigt. 1 von 5 erledigt.“ for every section whose state changed; empty when none did. */
export function standAnsage(vorher: MappeStandWerte, jetzt: MappeStandWerte): string {
  const wechsel = jetzt.abschnitte.filter((abschnitt, index) => abschnitt.erledigt !== vorher.abschnitte[index]?.erledigt);
  if (wechsel.length === 0) return '';
  const teile = wechsel.map((abschnitt) => `${abschnitt.titel} ${abschnitt.erledigt ? 'erledigt' : 'wieder offen'}.`);
  return `${teile.join(' ')} ${standText(jetzt.erledigt, jetzt.gesamt)}.`;
}

/** Share text for WhatsApp (E-BEW-020): only real entries, the reference of an application sent from this tab. */
function shareHref(state: MappeEditorState, jobs: readonly MappeJobOption[], submitted: SubmittedApplication | null): string {
  const job = jobs.find((option) => option.id === state.jobId);
  const jobLabel = job ? job.title : state.jobId === INITIATIVE_JOB_ID ? 'Initiativbewerbung' : null;
  return buildWhatsAppUrl(buildMappeShareMessage({ reference: submitted?.reference, jobLabel, name: state.person.name }));
}

/**
 * Bewerbungsmappe (roadmap §6): optional tool outside the application path.
 * Mobile: checklist, the five editor steps, the desk (ring, main action, PDF, WhatsApp), the A4 preview.
 * Desktop: checklist and editor left; desk and live preview right in a sticky column. Personal data and
 * the draft stay in sessionStorage; the photo stays in memory only.
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
  // Stand only from real entries (E-BEW-006/007); before hydration the empty editor shows „0 von 5“.
  const stand = useMemo(() => mappeStand(state), [state]);
  const standRef = useRef<MappeStandWerte | null>(null);

  // Restore once per mount: storage is client-only, so the static HTML renders the empty editor.
  useEffect(() => {
    removeLegacyDossier();
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

  // Checks appear without reload; screen readers hear which section changed. Nothing on the restore itself.
  useEffect(() => {
    if (!hydrated) return;
    const vorher = standRef.current;
    standRef.current = stand;
    if (!vorher) return;
    const text = standAnsage(vorher, stand);
    if (text) announce(text);
  }, [stand, hydrated, announce]);

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
      router.push(applyHref(state.jobId, jobs));
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
    <div className={cn(styles.werkbank, className)} data-mappe-werkbank="">
      <div className={cn(styles.editor, 'print-hidden')}>
        <MappeStand stand={stand} />
        <PersonalSection
          step={1}
          done={stand.abschnitte[0].erledigt}
          person={state.person}
          onChange={(patch) => dispatch({ type: 'person', patch })}
          photoUrl={photoUrl}
          onPhotoChange={handlePhoto}
        />
        <JobSection
          step={2}
          done={stand.abschnitte[1].erledigt}
          jobs={jobs}
          value={state.jobId}
          onChange={(jobId) => dispatch({ type: 'job', jobId })}
        />
        <SkillsSection
          step={3}
          done={stand.abschnitte[2].erledigt}
          skills={state.skills}
          onToggle={(skill) => dispatch({ type: 'toggleSkill', skill })}
          onAdd={(skill) => dispatch({ type: 'addSkill', skill })}
        />
        <LetterSection
          step={4}
          done={stand.abschnitte[3].erledigt}
          workStyleId={state.workStyleId}
          onWorkStyleChange={(id) => dispatch({ type: 'workStyle', id })}
          letter={letter}
          edited={state.customLetter !== null}
          onLetterChange={(text) => dispatch({ type: 'letter', text })}
          onResetLetter={handleResetLetter}
        />
        <StationsSection
          step={5}
          done={stand.abschnitte[4].erledigt}
          career={state.careerStations}
          education={state.educationStations}
          onCareer={(action) => dispatch({ type: 'career', action })}
          onEducation={(action) => dispatch({ type: 'education', action })}
          announce={announce}
        />
      </div>

      <Leitungstrenner className={styles.trenner} />

      <div className={styles.seite}>
        <MappeActions
          className="shrink-0"
          mode={submitted ? 'followUp' : 'apply'}
          reference={submitted?.reference}
          busy={busy}
          onPrimary={handlePrimary}
          onPrint={() => window.print()}
          stand={stand}
          whatsappHref={shareHref(state, jobs, submitted)}
          feedback={feedback}
          feedbackRef={feedbackRef}
          saveStatus={saveStatus}
          contact={contact}
        />
        <div className={styles.vorschau}>
          <div className={cn(styles.vorschauKopf, 'print-hidden')}>
            <h2 id="mappe-vorschau-title" className="text-title-3 text-brand">
              Vorschau
            </h2>
            <p className="text-etikett text-ink-2">
              <span className="font-mass">2</span> Seiten A4
            </p>
          </div>
          {/*
            On desktop the framed area itself scrolls inside the sticky column, so the rounded frame and its
            padding stay visible at both ends (a scroller around the frame cut it off flat).
          */}
          <section aria-labelledby="mappe-vorschau-title" tabIndex={0} className={cn(styles.vorschauRahmen, 'rounded-2')}>
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
          </section>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        <span key={announcement.id}>{announcement.text}</span>
      </p>
    </div>
  );
}
