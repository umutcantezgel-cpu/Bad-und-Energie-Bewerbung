import { HausKlein } from '@/components/zeichnung/HausKlein';
import { Waermebild } from '@/components/zeichnung/Waermebild';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { SalaryCard } from '../SalaryCard';
import { zeigtWaermebild } from './stelle-text';
import styles from './stelle.module.css';

export interface KopfbildProps {
  job: Job;
}

/**
 * Zeichnung im Navy-Panel des Stellenkopfs (Variante 2 + 1): die Gehaltsspanne in Bildgröße im Heizkreis,
 * ab 64em mit dem Haus aus dem Einstieg darauf (Variante 2: „Haus oben an der Schleife“; dekorativ).
 * Auf der Wärmepumpen-Stelle im Kundendienst steht statt des Hauses das Wärmebild aus Variante 3 (statisch,
 * ohne WebGL, role="img" mit Titel) unter dem Heizkreis, der dann eine Stufe kleiner ist.
 */
export function Kopfbild({ job }: KopfbildProps) {
  const waerme = zeigtWaermebild(job);
  return (
    <div className={cn(styles.kopfbild, waerme && styles.kopfbildWaerme)} data-stelle-kopfbild="">
      {waerme ? null : <HausKlein className={styles.haus} />}
      <SalaryCard job={job} size={waerme ? 'mittel' : 'gross'} />
      {waerme ? <Waermebild /> : null}
    </div>
  );
}
