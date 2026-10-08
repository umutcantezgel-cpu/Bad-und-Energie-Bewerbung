'use client';

import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button, Chip, Field, Input } from '@/components/ui';
import { canAddSkill } from '@/lib/mappe/editor';
import { MAPPE_LIMITS, SKILL_OPTIONS } from '@/lib/mappe/options';
import { EditorSection } from './EditorSection';

export interface SkillsSectionProps {
  step: number;
  skills: readonly string[];
  onToggle: (skill: string) => void;
  onAdd: (skill: string) => void;
}

const PRESET = new Set<string>(SKILL_OPTIONS);

export function SkillsSection({ step, skills, onToggle, onAdd }: SkillsSectionProps) {
  const [custom, setCustom] = useState('');
  const [error, setError] = useState<string | null>(null);
  const customSkills = skills.filter((skill) => !PRESET.has(skill));
  const full = skills.length >= MAPPE_LIMITS.skills;

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = custom.trim();
    if (!value) {
      setError('Bitte gib einen Schwerpunkt ein.');
      return;
    }
    if (!canAddSkill(skills, value)) {
      setError(full ? `Höchstens ${MAPPE_LIMITS.skills} Schwerpunkte.` : 'Diesen Schwerpunkt hast du schon.');
      return;
    }
    onAdd(value);
    setCustom('');
    setError(null);
  }

  return (
    <EditorSection
      id="mappe-schwerpunkte"
      step={step}
      title="Schwerpunkte"
      description="Tipp alles an, worin du schon selbstständig gearbeitet hast."
    >
      <div role="group" aria-labelledby="mappe-schwerpunkte-title" className="flex flex-wrap gap-2">
        {[...SKILL_OPTIONS, ...customSkills].map((skill) => {
          const pressed = skills.includes(skill);
          return (
            <Chip
              key={skill}
              pressed={pressed}
              disabled={!pressed && full}
              onClick={() => onToggle(skill)}
              // Long skills wrap: rounded-lg instead of a pill keeps two-line chips calm, and on
              // phones every chip takes the full width, so the list reads as one even column.
              className="max-w-full shrink rounded-lg py-2 text-left max-sm:w-full"
            >
              {skill}
            </Chip>
          );
        })}
      </div>

      <form onSubmit={handleAdd} noValidate>
        <Field label="Eigener Schwerpunkt" optional error={error}>
          <div className="flex gap-3">
            <Input
              name="schwerpunkt"
              className="min-w-0 flex-1"
              autoComplete="off"
              maxLength={MAPPE_LIMITS.skill}
              value={custom}
              onChange={(event) => {
                setCustom(event.target.value);
                if (error) setError(null);
              }}
            />
            {/* Icon only on phones, so the text field keeps most of the row; the name stays „Hinzufügen“. */}
            <Button type="submit" variant="secondary" size="lg" disabled={full} className="max-sm:w-13 max-sm:px-0">
              <Plus aria-hidden="true" strokeWidth={1.75} className="size-5" />
              <span className="max-sm:sr-only">Hinzufügen</span>
            </Button>
          </div>
        </Field>
      </form>
      <p className="text-footnote tabular-nums text-ink-muted">
        {skills.length} von {MAPPE_LIMITS.skills} gewählt
      </p>
    </EditorSection>
  );
}
