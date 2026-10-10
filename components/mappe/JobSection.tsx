'use client';

import type { ComponentPropsWithRef } from 'react';
import { Icon } from '@/components/icons';
import { Field, controlClasses, controlStyle, useFieldControl } from '@/components/ui';
import { INITIATIVE_JOB_ID, isApplicationJobId, type ApplicationJobId } from '@/lib/applications/constants';
import type { MappeJobOption } from '@/lib/mappe/types';
import { cn } from '@/lib/utils/cn';
import { EditorSection } from './EditorSection';

function Select({ className, style, children, ...props }: ComponentPropsWithRef<'select'>) {
  const controlProps = useFieldControl(props);
  return (
    <div className="relative">
      <select
        className={cn(controlClasses, 'h-13 appearance-none pr-12 pl-4 leading-normal', className)}
        style={controlStyle(style)}
        {...controlProps}
      >
        {children}
      </select>
      <Icon name="chevron-down" size="md" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-brand" />
    </div>
  );
}

export interface JobSectionProps {
  step: number;
  /** Mappe-Stand: Stelle gewählt. */
  done?: boolean;
  jobs: readonly MappeJobOption[];
  value: ApplicationJobId | '';
  onChange: (jobId: ApplicationJobId | '') => void;
}

export function JobSection({ step, done, jobs, value, onChange }: JobSectionProps) {
  return (
    <EditorSection id="mappe-stelle" step={step} done={done} title="Stelle" description="Bestimmt Betreff und Einleitung des Anschreibens.">
      <Field label="Worauf bewirbst du dich?">
        <Select
          name="stelle"
          value={value}
          onChange={(event) => {
            const value = event.target.value;
            onChange(isApplicationJobId(value) ? value : '');
          }}
        >
          <option value="">Bitte wählen</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
          <option value={INITIATIVE_JOB_ID}>Initiativbewerbung</option>
        </Select>
      </Field>
    </EditorSection>
  );
}
