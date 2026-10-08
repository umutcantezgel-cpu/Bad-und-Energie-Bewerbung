'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { MappePerson } from '@/lib/mappe/editor';
import { dateLine } from '@/lib/mappe/format';
import {
  isCareerStationEmpty,
  isEducationStationEmpty,
  splitTasks,
  type CareerStationDraft,
  type EducationStationDraft,
} from '@/lib/mappe/stations';
import { MAPPE_LIMITS } from '@/lib/mappe/options';
import type { MappeRecipient } from '@/lib/mappe/types';
import { cn } from '@/lib/utils/cn';
import styles from './mappe.module.css';

/** 210 mm at 96 dpi. */
const A4_WIDTH_PX = (210 / 25.4) * 96;

export interface MappePreviewProps {
  person: MappePerson;
  subject: string;
  letter: string;
  recipient: MappeRecipient;
  skills: readonly string[];
  career: readonly CareerStationDraft[];
  education: readonly EducationStationDraft[];
  photoUrl: string | null;
  /** Formatted date of today; empty until mounted (the page is static). */
  today: string;
  className?: string;
}

/** Two A4 pages (Anschreiben, Lebenslauf). On screen zoomed to the column, in print at real size. */
export function MappePreview({ className, ...props }: MappePreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  // Zoom factor from the column width; written to the DOM directly, no re-render per resize.
  useEffect(() => {
    const node = frameRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const width = node.clientWidth;
      if (width > 0) node.style.setProperty('--mappe-scale', String(Math.min(1, width / A4_WIDTH_PX)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={cn(styles.frame, className)}>
      <div className={styles.stack}>
        <CoverLetterPage {...props} />
        <CvPage {...props} />
      </div>
    </div>
  );
}

type PageProps = Omit<MappePreviewProps, 'className'>;

function Filled({ value, placeholder }: { value: string; placeholder: string }) {
  return value.trim() ? <>{value.trim()}</> : <span className={styles.placeholder}>{placeholder}</span>;
}

function contactLine(person: MappePerson): string {
  return [person.location, person.phone, person.email]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' · ');
}

function Letterhead({ person, children }: { person: MappePerson; children?: ReactNode }) {
  const contact = contactLine(person);
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {children}
      <p className={styles.name}>
        <Filled value={person.name} placeholder="Dein Name" />
      </p>
      <p className={cn(styles.small, 'text-ink-muted tabular-nums')}>
        {contact || <span className={styles.placeholder}>Wohnort · Telefon · E-Mail</span>}
      </p>
    </div>
  );
}

function CoverLetterPage({ person, subject, letter, recipient, today }: PageProps) {
  return (
    <article aria-labelledby="mappe-seite-anschreiben" className={cn(styles.page, styles.paper)}>
      <h3 id="mappe-seite-anschreiben" className="sr-only">
        Anschreiben
      </h3>
      <header className="border-b border-line pb-5">
        <Letterhead person={person} />
      </header>

      <address className="mt-10 not-italic">
        {recipient.companyName}
        <br />
        {recipient.attention}
        <br />
        {recipient.street}
        <br />
        {recipient.postalCode} {recipient.city}
      </address>

      <p className="mt-8 text-right tabular-nums">{dateLine(person.location, today)}</p>
      <p className="mt-6 font-semibold">{subject}</p>
      <div className={cn(styles.letter, 'mt-6')}>{letter}</div>
    </article>
  );
}

function CvSection({
  title,
  isEmpty,
  emptyText,
  children,
}: {
  title: string;
  isEmpty: boolean;
  emptyText: string;
  children?: ReactNode;
}) {
  // Empty sections are only a hint on screen and are left out of the printout.
  return (
    <section className={cn('mt-8 flex flex-col gap-4', isEmpty && 'print:hidden')}>
      <h4 className={cn(styles.heading, 'border-b border-line pb-1.5')}>{title}</h4>
      {isEmpty ? <p className="text-ink-muted">{emptyText}</p> : children}
    </section>
  );
}

function CvPage({ person, subject, skills, career, education, photoUrl, today }: PageProps) {
  const careerItems = career.filter((station) => !isCareerStationEmpty(station));
  const educationItems = education.filter((station) => !isEducationStationEmpty(station));
  const date = dateLine(person.location, today);

  return (
    <article aria-labelledby="mappe-seite-lebenslauf" className={cn(styles.page, styles.paper)}>
      <header className="flex items-start justify-between gap-8 border-b border-line pb-5">
        <Letterhead person={person}>
          <h3 id="mappe-seite-lebenslauf" className={cn(styles.heading, 'text-ink-muted')}>
            Lebenslauf
          </h3>
        </Letterhead>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL, never uploaded
          <img src={photoUrl} alt="Bewerbungsfoto" className={styles.photo} />
        )}
      </header>

      <p className="mt-6 font-semibold">{subject}</p>

      <CvSection title="Berufserfahrung" isEmpty={careerItems.length === 0} emptyText="Noch keine Berufserfahrung eingetragen.">
        {careerItems.map((station) => {
          const tasks = splitTasks(station.tasks, MAPPE_LIMITS.tasksPerStation);
          const place = [station.company.trim(), station.location.trim()].filter(Boolean).join(', ');
          return (
            <div key={station.id} className={styles.row}>
              <p className="tabular-nums text-ink-muted">{station.period.trim()}</p>
              <div className="flex min-w-0 flex-col">
                {station.role.trim() && <p className="font-semibold">{station.role.trim()}</p>}
                {place && <p className="text-ink-muted">{place}</p>}
                {tasks.length > 0 && (
                  <ul className="mt-1.5 list-disc pl-5">
                    {tasks.map((task, index) => (
                      <li key={index}>{task}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </CvSection>

      <CvSection
        title="Schule und Ausbildung"
        isEmpty={educationItems.length === 0}
        emptyText="Noch kein Abschluss eingetragen."
      >
        {educationItems.map((station) => {
          const place = [station.institution.trim(), station.location.trim()].filter(Boolean).join(', ');
          return (
            <div key={station.id} className={styles.row}>
              <p className="tabular-nums text-ink-muted">{station.period.trim()}</p>
              <div className="flex min-w-0 flex-col">
                {station.degree.trim() && <p className="font-semibold">{station.degree.trim()}</p>}
                {place && <p className="text-ink-muted">{place}</p>}
              </div>
            </div>
          );
        })}
      </CvSection>

      <CvSection title="Schwerpunkte" isEmpty={skills.length === 0} emptyText="Noch keine Schwerpunkte gewählt.">
        <ul className="list-disc pl-5">
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </CvSection>

      <footer className="mt-auto flex items-end justify-between gap-8 pt-16">
        <p className="tabular-nums">{date}</p>
        <p className={cn(styles.small, 'min-w-48 border-t border-line-strong pt-1.5 text-ink-muted')}>
          <Filled value={person.name} placeholder="Dein Name" />
        </p>
      </footer>
    </article>
  );
}
