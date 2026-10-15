import { RohrAkzent } from '@/components/zeichnung/RohrAkzent';
import { FACTS } from '@/lib/content/facts';
import { payLabel } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';

export interface SalaryCardProps {
  job: Job;
  /** `gross` für den Kopf der Stellenseite, `mittel` neben einer zweiten Zeichnung (Wärmebild). */
  size?: 'gross' | 'mittel';
  className?: string;
}

/**
 * Was die Stelle zur Bezahlung sagt, ohne Betrag (E-030): der belegte Fakt aboveTariff, sonst die Paketzeile
 * „Vergütung“ der Stelle (Ausbildung, Quereinstieg). Leer, wenn die Stelle nichts dazu belegt (Bürofachkraft, S5).
 */
export function lohnZusatz(job: Pick<Job, 'pay' | 'benefitFactIds' | 'packageExtras'>): string | null {
  if (job.pay !== 'auf-anfrage') return null;
  if (job.benefitFactIds.includes('aboveTariff')) return FACTS.aboveTariff.short;
  return job.packageExtras.find((extra) => extra.label === 'Vergütung')?.text ?? null;
}

/**
 * „Lohn auf Anfrage“ im Navy-Panel des Stellenkopfs (E-030, Plan §A: ein ruhiger Block statt des Heizkreises um die
 * Gehaltsspanne): Etikett, „Lohn auf Anfrage“ in Bricolage und darunter, was die Stelle belegt („Über Tarif plus
 * Urlaubs- und Weihnachtsgeld“). Kein Betrag, kein Maß in Martian Mono. Das Schülerpraktikum sagt nichts zu Geld:
 * dann rendert der Block nichts.
 */
export function SalaryCard({ job, size = 'gross', className }: SalaryCardProps) {
  const label = payLabel(job);
  if (!label) return null;
  const zusatz = lohnZusatz(job);
  return (
    <div
      className={cn('relative flex max-w-sm flex-col gap-2 pt-4', className)}
      data-stelle-lohn=""
    >
      <RohrAkzent />
      <p className="text-etikett text-ink-2">Bezahlung</p>
      <p className={cn('text-brand', size === 'gross' ? 'text-title-1' : 'text-title-2')}>{label}</p>
      {zusatz ? <p className="text-body text-ink">{zusatz}</p> : null}
    </div>
  );
}
