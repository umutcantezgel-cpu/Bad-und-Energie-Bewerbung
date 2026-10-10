import { Heizkreis } from '@/components/zeichnung/Heizkreis';
import { SALARY_UNIT_LABEL, formatSalaryAmount } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';

export interface SalaryCardProps {
  job: Job;
  /** `gross` für den Kopf der Stellenseite (Gehalt in Bildgröße), `mittel` neben einer zweiten Zeichnung. */
  size?: 'gross' | 'mittel';
  className?: string;
}

/** „Gehalt pro Monat“ bzw. „Vergütung pro Monat“ (Ausbildung); null ohne Gehaltsangabe. */
export function salaryLabel(job: Pick<Job, 'salary' | 'employment'>): string | null {
  if (!job.salary) return null;
  return `${job.employment.kind === 'ausbildung' ? 'Vergütung' : 'Gehalt'} pro ${SALARY_UNIT_LABEL[job.salary.unit]}`;
}

/**
 * Gehalt im Heizkreis (Signatur der Stellenseite, Variante 2, KERN K-009): die Gehaltsspanne in Bildgröße,
 * der Vorlauf läuft oben um die Zahl, der Rücklauf unten zurück. Google verlangt, dass JobPosting.baseSalary
 * dem sichtbaren Gehalt entspricht; darum zeigt der Kreis genau `job.salary` und nichts anderes. Ohne
 * Gehaltsangabe rendert er nichts.
 */
export function SalaryCard({ job, size = 'gross', className }: SalaryCardProps) {
  const amount = formatSalaryAmount(job);
  const label = salaryLabel(job);
  if (!amount || !label) return null;
  return <Heizkreis wert={amount} name={label} groesse={size} className={className} />;
}
