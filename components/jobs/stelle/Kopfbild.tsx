import { DauerSteuerung } from '@/components/zeichnung/bewegung/DauerSteuerung';
import { Anlagenschema } from '@/components/zeichnung/technik/Anlagenschema';
import { Aussengeraet } from '@/components/zeichnung/technik/Aussengeraet';
import { HausschnittKlein } from '@/components/zeichnung/technik/Hausschnitt';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { SalaryCard } from '../SalaryCard';
import { kopfZeichnung } from './stelle-text';
import styles from './stelle.module.css';

export interface KopfbildProps {
  job: Job;
}

/** Text links neben dem Knopf „Anhalten“ unter der Gerätezeichnung. */
export const KOPFBILD_GERAET_TEXT = 'Außeneinheit · Maße in mm';

/**
 * Zeichnung im Navy-Panel des Stellenkopfs (E-029) über dem Block „Lohn auf Anfrage“ (E-030, ohne Betrag); welche,
 * wählt `kopfZeichnung` nach dem Beruf:
 * - Kundendienst: die Außeneinheit von vorn mit Maßketten, der Rotor dreht im Sichtfeld (DauerSteuerung, Knopf
 *   „Anhalten“); auf jeder Breite, am Handy schmaler. Der Block steht dann eine Stufe kleiner darunter.
 * - Anlagenmechaniker und Ausbildung: das Anlagenschema, statisch, mit Legende; erst ab 64em, wo die Fläche Platz hat.
 * - alle anderen: der kleine Hausschnitt (dekorativ), ebenfalls erst ab 64em. Am Handy bleibt der Knopf im ersten Bild.
 */
export function Kopfbild({ job }: KopfbildProps) {
  const art = kopfZeichnung(job);
  return (
    <div className={cn(styles.kopfbild, art !== 'hausschnitt' && styles.kopfbildBreit)} data-stelle-kopfbild={art}>
      {art === 'aussengeraet' ? (
        <DauerSteuerung className={styles.kopfGeraet} beschriftung={<span className="text-etikett text-ink-2">{KOPFBILD_GERAET_TEXT}</span>}>
          <Aussengeraet ansicht="vorne" massketten="haupt" bewegt schriftfeld={false} massSchrift={64} />
        </DauerSteuerung>
      ) : null}
      {art === 'anlagenschema' ? (
        <div className={styles.kopfSchema}>
          <Anlagenschema />
        </div>
      ) : null}
      {art === 'hausschnitt' ? (
        <div className={styles.haus}>
          <HausschnittKlein />
        </div>
      ) : null}
      <SalaryCard job={job} size={art === 'aussengeraet' ? 'mittel' : 'gross'} />
    </div>
  );
}
