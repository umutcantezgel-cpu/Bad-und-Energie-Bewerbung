'use client';

import { TASKS_TEXT_MAX } from '@/lib/mappe/editor';
import { MAPPE_LIMITS } from '@/lib/mappe/options';
import {
  emptyCareerStation,
  emptyEducationStation,
  isCareerStationEmpty,
  isEducationStationEmpty,
  splitTasks,
  type CareerStationDraft,
  type EducationStationDraft,
  type ListAction,
} from '@/lib/mappe/stations';
import { EditorSection } from './EditorSection';
import { StationsEditor, type StationField } from './StationsEditor';

const PERIOD_PLACEHOLDER = 'z. B. 08/2021 – heute';

const CAREER_FIELDS: readonly StationField<CareerStationDraft>[] = [
  { key: 'role', label: 'Tätigkeit', maxLength: MAPPE_LIMITS.role },
  { key: 'company', label: 'Betrieb', maxLength: MAPPE_LIMITS.company, half: true },
  { key: 'location', label: 'Ort', optional: true, maxLength: MAPPE_LIMITS.location, half: true },
  { key: 'period', label: 'Zeitraum', placeholder: PERIOD_PLACEHOLDER, maxLength: MAPPE_LIMITS.period, half: true },
  {
    key: 'tasks',
    label: 'Aufgaben',
    optional: true,
    hint: `Eine Aufgabe pro Zeile, höchstens ${MAPPE_LIMITS.tasksPerStation}.`,
    multiline: true,
    maxLength: TASKS_TEXT_MAX,
    check: (value) =>
      splitTasks(value).length > MAPPE_LIMITS.tasksPerStation
        ? `Nur die ersten ${MAPPE_LIMITS.tasksPerStation} Zeilen kommen in die Mappe.`
        : splitTasks(value).some((task) => task.length > MAPPE_LIMITS.task)
          ? `Eine Zeile ist länger als ${MAPPE_LIMITS.task} Zeichen. Bitte kürze sie.`
          : undefined,
  },
];

const EDUCATION_FIELDS: readonly StationField<EducationStationDraft>[] = [
  { key: 'degree', label: 'Abschluss', maxLength: MAPPE_LIMITS.degree },
  { key: 'institution', label: 'Schule oder Betrieb', maxLength: MAPPE_LIMITS.institution, half: true },
  { key: 'location', label: 'Ort', optional: true, maxLength: MAPPE_LIMITS.location, half: true },
  { key: 'period', label: 'Zeitraum', placeholder: PERIOD_PLACEHOLDER, maxLength: MAPPE_LIMITS.period, half: true },
];

export interface StationsSectionProps {
  step: number;
  /** Mappe-Stand: mindestens eine nicht leere Station. */
  done?: boolean;
  career: readonly CareerStationDraft[];
  education: readonly EducationStationDraft[];
  onCareer: (action: ListAction<CareerStationDraft>) => void;
  onEducation: (action: ListAction<EducationStationDraft>) => void;
  announce: (message: string) => void;
}

export function StationsSection({ step, done, career, education, onCareer, onEducation, announce }: StationsSectionProps) {
  return (
    <EditorSection
      id="mappe-lebenslauf"
      step={step}
      done={done}
      title="Berufserfahrung und Ausbildung"
      description="Neueste Station zuerst. Was du leer lässt, erscheint nicht im Lebenslauf."
    >
      <StationsEditor
        titleId="mappe-beruf-title"
        title="Berufserfahrung"
        items={career}
        fields={CAREER_FIELDS}
        max={MAPPE_LIMITS.careerStations}
        createItem={() => emptyCareerStation()}
        isEmpty={isCareerStationEmpty}
        addLabel="Berufserfahrung hinzufügen"
        emptyText="Noch keine Berufserfahrung eingetragen."
        onAction={onCareer}
        announce={announce}
      />
      <StationsEditor
        titleId="mappe-ausbildung-title"
        title="Schule und Ausbildung"
        items={education}
        fields={EDUCATION_FIELDS}
        max={MAPPE_LIMITS.educationStations}
        createItem={() => emptyEducationStation()}
        isEmpty={isEducationStationEmpty}
        addLabel="Abschluss hinzufügen"
        emptyText="Noch kein Abschluss eingetragen."
        onAction={onEducation}
        announce={announce}
      />
    </EditorSection>
  );
}
