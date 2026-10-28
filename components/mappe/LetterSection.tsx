'use client';

import { useRef } from 'react';
import { Icon } from '@/components/icons';
import { Button, ChoiceCard, ChoiceGroup, Field, Textarea } from '@/components/ui';
import { MAPPE_LIMITS, WORK_STYLES, type WorkStyle, type WorkStyleId } from '@/lib/mappe/options';
import { EditorSection } from './EditorSection';

export interface LetterSectionProps {
  step: number;
  /** Mappe-Stand: Arbeitsstil gewählt oder eigener Text. */
  done?: boolean;
  workStyleId: WorkStyleId | null;
  /** Arbeitsstile zur Auswahl (workStylesFuer je Stellenart: Büro mit eigenem Wortlaut); Standard die der Baustelle. */
  workStyles?: readonly WorkStyle[];
  onWorkStyleChange: (id: WorkStyleId) => void;
  /** Vorschlag für den Betreff aus der Stelle (L5, letterSubject); ohne Stelle „Bewerbung“. */
  subjectSuggestion: string;
  /** Eine Stelle (oder „Initiativbewerbung“) ist gewählt: Der Vorschlag nennt sie. */
  hasJob: boolean;
  /** `null`: Der Betreff folgt dem Vorschlag. Text: eigener Betreff (auch leer). */
  customSubject: string | null;
  onSubjectChange: (text: string) => void;
  /** „Vorschlag nehmen“: zurück zum Vorschlag; danach steht der Fokus im Feld „Betreff“. */
  onResetSubject: () => void;
  /** The letter as shown in the preview (template or edited text). */
  letter: string;
  /** True once the applicant has edited the text. */
  edited: boolean;
  onLetterChange: (text: string) => void;
  onResetLetter: () => void;
}

export function LetterSection({
  step,
  done,
  workStyleId,
  workStyles = WORK_STYLES,
  onWorkStyleChange,
  subjectSuggestion,
  hasJob,
  customSubject,
  onSubjectChange,
  onResetSubject,
  letter,
  edited,
  onLetterChange,
  onResetLetter,
}: LetterSectionProps) {
  const subjectRef = useRef<HTMLTextAreaElement>(null);
  const subjectHint =
    customSubject === null
      ? hasJob
        ? 'Vorschlag aus der Stelle. Er passt sich an, bis du ihn selbst änderst.'
        : 'Ohne Stelle steht hier nur „Bewerbung“. Wähl oben eine Stelle oder schreib deinen eigenen Betreff.'
      : customSubject.trim()
        ? 'Dein eigener Betreff. Ein Wechsel der Stelle ändert ihn nicht mehr.'
        : `Ohne eigenen Text steht der Vorschlag in der Mappe: ${subjectSuggestion}`;

  return (
    <EditorSection
      id="mappe-anschreiben"
      step={step}
      done={done}
      title="Arbeitsstil und Anschreiben"
      description="Aus der Stelle entsteht der Betreff, aus Stelle, Schwerpunkten und Arbeitsstil das Anschreiben. Beides kannst du frei ändern."
    >
      <div className="flex flex-col gap-4">
        <h3 id="mappe-arbeitsstil-title" className="text-body font-bold text-ink">
          Was zeichnet deinen Arbeitsstil aus?
        </h3>
        <ChoiceGroup labelledBy="mappe-arbeitsstil-title">
          {workStyles.map((style) => (
            <ChoiceCard
              key={style.id}
              title={style.title}
              description={style.description}
              selected={workStyleId === style.id}
              onClick={() => onWorkStyleChange(style.id)}
            />
          ))}
        </ChoiceGroup>
      </div>

      <div className="flex flex-col gap-3">
        <Field label="Betreff" hint={subjectHint}>
          {/* Mehrzeilig statt einer Zeile: Schon der Vorschlag (bis 77 Zeichen) braucht am Handy drei Zeilen. Die Höhe
              folgt dem Text (field-sizing, sonst drei Zeilen); inhaltlich einzeilig: Enter und Umbrüche werden zu Leerzeichen */}
          <Textarea
            ref={subjectRef}
            name="betreff"
            autoComplete="off"
            rows={3}
            maxLength={MAPPE_LIMITS.subject}
            value={customSubject ?? subjectSuggestion}
            onChange={(event) => onSubjectChange(event.target.value.replace(/\s*[\r\n\u2028\u2029]+\s*/g, ' '))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault();
            }}
            className="min-h-0 resize-none field-sizing-content"
          />
        </Field>
        {customSubject !== null && (
          <Button
            variant="ghost"
            wrap
            onClick={() => {
              onResetSubject();
              subjectRef.current?.focus();
            }}
            className="max-w-full self-start"
          >
            <Icon name="rotate-ccw" size="md" />
            Vorschlag nehmen
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Field
          id="mappe-anschreiben-text"
          label="Anschreiben"
          hint={
            edited
              ? 'Du hast den Text angepasst. Neue Angaben ändern ihn nicht mehr automatisch.'
              : 'Passt sich deinen Angaben an, bis du den Text selbst änderst.'
          }
        >
          <Textarea
            name="anschreiben"
            rows={16}
            maxLength={MAPPE_LIMITS.coverLetter}
            value={letter}
            onChange={(event) => onLetterChange(event.target.value)}
            className="min-h-96"
          />
        </Field>
        {edited && (
          <Button variant="ghost" wrap onClick={onResetLetter} className="max-w-full self-start">
            <Icon name="rotate-ccw" size="md" />
            Text neu aus der Vorlage erstellen
          </Button>
        )}
      </div>
    </EditorSection>
  );
}
