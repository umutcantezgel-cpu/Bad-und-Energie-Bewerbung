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
              className="max-w-full shrink py-2 text-left"
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
              autoComplete="off"
              maxLength={MAPPE_LIMITS.skill}
              value={custom}
              onChange={(event) => {
                setCustom(event.target.value);
                if (error) setError(null);
              }}
            />
            <Button type="submit" variant="secondary" size="lg" disabled={full}>
              <Plus aria-hidden="true" strokeWidth={1.75} className="size-5" />
              Hinzufügen
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
