import Link from 'next/link';
import { Fragment } from 'react';
import { Icon } from '@/components/icons';
import { salaryUnitLabel } from '@/components/jobs/JobCard';
import { bindSeparators, withSoftHyphens } from '@/components/jobs/text';
import { Masskette } from '@/components/zeichnung/Masskette';
import { employmentLabel, formatSalaryAmount, jobPath, startLabel } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { LEER_TEXT, listenName } from './liste-text';
import styles from './liste.module.css';

const NBSP = '\u00A0';

export interface StellenverteilerProps {
  /** Die Stellen, die gerade live sind (Registry: getActiveJobs + isJobLive), in Reihenfolge der Registry. */
  jobs: readonly Job[];
  /** Überschriftenstufe der Stellentitel: h2 direkt unter der h1 der Seite. */
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/** Teile der Meta-Zeile einer Stelle: „Vollzeit · Unbefristet · Nach Absprache“ bzw. „Ausbildung · 3,5 Jahre · …“. */
export function stellenMeta(job: Pick<Job, 'employment'>): string[] {
  return [...employmentLabel(job).split(' · '), startLabel(job)];
}

/**
 * Verteiler der Stellenliste (Variante 2 „Stellen als Leitungsabgänge“): links fällt der rote Vorlauf, rechts
 * steigt der blaue Rücklauf, jede Stelle ist ein Heizkreis dazwischen. Je Zeile Titel (Link auf die
 * Stellenseite, die ganze Zeile ist Trefferfläche), Anstellung und Beginn, die Kurzbeschreibung und das
 * Gehalt als Maß in Martian Mono mit Maßlinie (Spanne und Einheit nur aus den Stellendaten).
 * Server-Komponente; Bewegung nur als Rückmeldung (Register `flaeche`, `druck`).
 */
export function Stellenverteiler({ jobs, headingLevel: Heading = 'h2', className }: StellenverteilerProps) {
  if (jobs.length === 0) {
    return <p className={cn(styles.leer, 'text-body text-ink-2', className)}>{LEER_TEXT}</p>;
  }

  return (
    <ul className={cn(styles.verteiler, className)} aria-label={listenName(jobs.length)}>
      {jobs.map((job) => {
        const betrag = formatSalaryAmount(job);
        const einheit = salaryUnitLabel(job);
        return (
          <li key={job.id} className={styles.abgang}>
            <article className={styles.kreis} data-motion="druck">
              <span className={styles.flaeche} data-motion="flaeche" aria-hidden="true" />
              <Heading className={cn(styles.titel, 'text-title-2 text-brand')}>
                <Link href={jobPath(job)} className={styles.ziel}>
                  {bindSeparators(withSoftHyphens(job.shortTitle, job.titleShy))}
                </Link>{' '}
                <span className={cn(styles.mwd, 'text-callout text-ink-2')}>(m/w/d)</span>
              </Heading>
              <p className={cn(styles.meta, 'text-etikett text-ink-2')}>
                {stellenMeta(job).map((teil, i) => (
                  <Fragment key={teil}>
                    {i > 0 ? ' ' : null}
                    <span className={styles.metaTeil}>{i > 0 ? `·${NBSP}${teil}` : teil}</span>
                  </Fragment>
                ))}
              </p>
              <p className={cn(styles.text, 'text-ink')}>{job.summary}</p>
              {betrag ? (
                <p className={styles.gehalt}>
                  <Masskette wert={betrag} name={einheit ?? undefined} />
                </p>
              ) : null}
              <Icon name="arrow-right" size="lg" className={styles.pfeil} />
            </article>
          </li>
        );
      })}
    </ul>
  );
}
