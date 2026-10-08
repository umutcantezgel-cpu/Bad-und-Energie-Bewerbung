'use client';

import type { ComponentPropsWithRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Field, controlClasses, controlStyle, useFieldControl } from '@/components/ui';
import { INITIATIVE_JOB_ID, applicationJobIdSchema, type ApplicationJobId } from '@/lib/applications/schema';
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
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}

export interface JobSectionProps {
  step: number;
  jobs: readonly MappeJobOption[];
  value: ApplicationJobId | '';
  onChange: (jobId: ApplicationJobId | '') => void;
}

export function JobSection({ step, jobs, value, onChange }: JobSectionProps) {
  return (
    <EditorSection id="mappe-stelle" step={step} title="Stelle" description="Bestimmt Betreff und Einleitung des Anschreibens.">
      <Field label="Worauf bewirbst du dich?">
        <Select
          name="stelle"
          value={value}
          onChange={(event) => {
            const parsed = applicationJobIdSchema.safeParse(event.target.value);
            onChange(parsed.success ? parsed.data : '');
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
