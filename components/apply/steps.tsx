import type { ReactNode, Ref } from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { ChoiceCard, ChoiceGroup } from '@/components/ui/ChoiceCard';
import { KreisGeschlossen } from '@/components/zeichnung/KreisGeschlossen';
import type { ApplicationJobId } from '@/lib/applications/schema';
import type { ApplyQuestion } from '@/lib/apply/questions';
import { cn } from '@/lib/utils/cn';
import type { FlowJobOption } from './types';

export type HeadingTag = 'h2' | 'h3';

export interface StepHeadingProps {
  as: HeadingTag;
  id: string;
  ref?: Ref<HTMLHeadingElement>;
  children: ReactNode;
}

/**
 * Frage eines Schritts in der Stimme der Botschaft (Bricolage, Navy) wie die Überschriften des Einstiegs.
 * tabIndex -1: Der Flow setzt bei jedem Schrittwechsel den Fokus hierher.
 */
export function StepHeading({ as: Tag, id, ref, children }: StepHeadingProps) {
  return (
    <Tag ref={ref} id={id} tabIndex={-1} className={cn('text-brand outline-none', Tag === 'h2' ? 'text-title-2' : 'text-title-3')}>
      {children}
    </Tag>
  );
}

function ContinueButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="secondary" size="lg" onClick={onClick} className="self-start">
      Weiter
      <Icon name="arrow-right" size="md" />
    </Button>
  );
}

export interface JobStepProps {
  heading: ReactNode;
  headingId: string;
  options: readonly FlowJobOption[];
  selected: ApplicationJobId | null;
  onSelect: (option: FlowJobOption) => void;
  /** „Weiter“ für eine schon gewählte Stelle (Rückweg), solange kein Auto-Weiter läuft. */
  onContinue?: () => void;
}

export function JobStep({ heading, headingId, options, selected, onSelect, onContinue }: JobStepProps) {
  return (
    <div className="flex flex-col gap-6">
      {heading}
      <ChoiceGroup labelledBy={headingId}>
        {options.map((option) => (
          <ChoiceCard
            key={option.id}
            title={
              // Weiche Trennstellen erst unter 360 px: darüber bricht der Name an Leerzeichen um
              option.labelShy ? <span className="hyphens-none max-[22.5rem]:hyphens-manual">{option.labelShy}</span> : option.label
            }
            description={option.description}
            icon={option.icon}
            selected={selected === option.id}
            onClick={() => onSelect(option)}
          />
        ))}
      </ChoiceGroup>
      {onContinue && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

export interface QuestionStepProps {
  heading: ReactNode;
  headingId: string;
  question: ApplyQuestion;
  value: string | undefined;
  onAnswer: (value: string) => void;
  onContinue?: () => void;
}

export function QuestionStep({ heading, headingId, question, value, onAnswer, onContinue }: QuestionStepProps) {
  return (
    <div className="flex flex-col gap-6">
      {heading}
      <ChoiceGroup labelledBy={headingId} columns={question.columns ?? 1}>
        {question.options.map((option) => (
          <ChoiceCard key={option.id} title={option.label} selected={value === option.id} onClick={() => onAnswer(option.id)} />
        ))}
      </ChoiceGroup>
      {onContinue && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

export interface InlineSuccessProps {
  heading: ReactNode;
  reference: string;
  quickResponse?: string;
}

/**
 * Erfolg ohne Danke-Seite: nur, wenn der Browser keinen sessionStorage erlaubt und die
 * Danke-Seite die Bewerbungsnummer deshalb nicht lesen könnte. Erscheint nur nach 200 + ok:true.
 * Wie die Danke-Seite: Vorlauf und Rücklauf schließen den Kreis um den Haken (Register `kreis-schliessen`).
 */
export function InlineSuccess({ heading, reference, quickResponse }: InlineSuccessProps) {
  return (
    <div className="flex flex-col items-start gap-4">
      <KreisGeschlossen groesse="klein" />
      {heading}
      <p className="text-body text-ink">
        Deine Bewerbungsnummer: <strong className="font-mass font-semibold text-brand">{reference}</strong>
      </p>
      {quickResponse && <p className="max-w-prose text-body text-ink-muted">{quickResponse}</p>}
    </div>
  );
}
