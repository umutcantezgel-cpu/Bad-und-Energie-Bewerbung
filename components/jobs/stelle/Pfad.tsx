import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BREADCRUMB_HOME, BREADCRUMB_JOBS } from '@/lib/content/breadcrumbs';
import type { Job } from '@/lib/jobs/registry';
import styles from './stelle.module.css';

/**
 * Pfad über dem Stellenkopf: Startseite › Stellen › Stelle, dieselben Namen wie die BreadcrumbList im
 * JSON-LD. Bis 64em auf Navy (geht nahtlos in den Navy-Block des Kopfs über), ab 64em auf Papier.
 */
export function Pfad({ job }: { job: Pick<Job, 'shortTitle'> }) {
  return (
    <div className={styles.pfad} data-tone="inverse">
      <Breadcrumbs items={[BREADCRUMB_HOME, BREADCRUMB_JOBS, { label: job.shortTitle }]} />
    </div>
  );
}
