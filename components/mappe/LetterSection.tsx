'use client';

import { Icon } from '@/components/icons';
import { Button, ChoiceCard, ChoiceGroup, Field, Textarea } from '@/components/ui';
import { MAPPE_LIMITS, WORK_STYLES, type WorkStyleId } from '@/lib/mappe/options';
import { EditorSection } from './EditorSection';

export interface LetterSectionProps {
  step: number;
  /** Mappe-Stand: Arbeitsstil gewählt oder eigener Text. */
  done?: boolean;
  workStyleId: WorkStyleId | null;
  onWorkStyleChange: (id: WorkStyleId) => void;
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
  onWorkStyleChange,
  letter,
  edited,
  onLetterChange,
  onResetLetter,
}: LetterSectionProps) {
  return (
    <EditorSection
      id="mappe-anschreiben"
      step={step}
      done={done}
      title="Arbeitsstil und Anschreiben"
      description="Aus Stelle, Schwerpunkten und Arbeitsstil entsteht dein Anschreiben. Danach kannst du es frei ändern."
    >
      <div className="flex flex-col gap-4">
        <h3 id="mappe-arbeitsstil-title" className="text-body font-bold text-ink">
          Was zeichnet deinen Arbeitsstil aus?
        </h3>
        <ChoiceGroup labelledBy="mappe-arbeitsstil-title">
          {WORK_STYLES.map((style) => (
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
        <Field
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
          <Button variant="ghost" onClick={onResetLetter} className="self-start">
            <Icon name="rotate-ccw" size="md" />
            Text neu aus der Vorlage erstellen
          </Button>
        )}
      </div>
    </EditorSection>
  );
}
