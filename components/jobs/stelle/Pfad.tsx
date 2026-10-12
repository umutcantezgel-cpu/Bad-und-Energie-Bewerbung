import { Pfad as SeitenkopfPfad } from '@/components/seitenkopf/Pfad';
import { BREADCRUMB_HOME, BREADCRUMB_JOBS } from '@/lib/content/breadcrumbs';
import type { Job } from '@/lib/jobs/registry';

/**
 * Pfad über dem Stellenkopf: Startseite › Stellen › Stelle, dieselben Namen wie die BreadcrumbList im
 * JSON-LD. Bis 64em auf Navy (geht nahtlos in den Navy-Block des Kopfs über), ab 64em auf Papier
 * (gemeinsamer Pfad aus components/seitenkopf/Pfad).
 */
export function Pfad({ job }: { job: Pick<Job, 'shortTitle'> }) {
  return <SeitenkopfPfad items={[BREADCRUMB_HOME, BREADCRUMB_JOBS, { label: job.shortTitle }]} />;
}
