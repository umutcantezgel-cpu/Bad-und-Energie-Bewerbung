import { Seitenkopf } from '@/components/seitenkopf';
import type { Job } from '@/lib/jobs/registry';
import { Kopfbild } from './stelle/Kopfbild';
import { Pfad } from './stelle/Pfad';
import {
  KOPF_AKTION,
  KOPF_MIKROTEXT,
  KOPF_ZWEITWEG,
  kopfEtikett,
  kopfMasse,
  kopfTitel,
  kopfUnterzeile,
} from './stelle/stelle-text';
import styles from './stelle/stelle.module.css';
import { Wortfugen } from './stelle/Wortfugen';
import { bindSeparators } from './text';

export interface JobHeaderProps {
  job: Job;
  className?: string;
}

/**
 * Kopf der Stellenseite (R5-JOBS-02, E-023) im Design des Einstiegs der Startseite: der gemeinsame Seitenkopf
 * in der Variante `erzaehl`.
 * - Pfad (Brotkrumen, gleiche Namen wie die BreadcrumbList) über dem Kopf.
 * - Etikett (Anstellung), h1 = seo.h1 mit <wbr> an den Wortfugen aus titleShy (kein U+00AD im HTML, V6-G2): Berufsname in Bildgröße,
 *   „(m/w/d) …“ kleiner darunter; Unterzeile mit Rohrklammer = Kurzbeschreibung der Stelle
 *   ohne Sätze, die nur die h1 wiederholen. Die Einleitung
 *   (intro) steht als Lead im ersten Band, damit der Knopf wie im Einstieg über dem Falz bleibt.
 * - Roter Knopf „Jetzt bewerben“ springt zum eingebetteten Flow; Vorlauf und Rücklauf laufen aus der
 *   Navy-Fläche in seinen Flansch und zeichnen sich beim Laden einmal dorthin (Register `erdleitung`).
 * - Navy-Fläche: Gehalt im Heizkreis mit dem Haus darauf (Kundendienst: Wärmebild), Maße 13:30 und 35 km.
 */
export function JobHeader({ job, className }: JobHeaderProps) {
  const { haupt, zusatz } = kopfTitel(job.seo.h1);
  const mitTrennstellen = (text: string) => <Wortfugen text={bindSeparators(text)} titleShy={job.titleShy} />;

  return (
    <>
      <Pfad job={job} />
      <div className={styles.kopf} data-motion="erdleitung">
        <Seitenkopf
          variante="erzaehl"
          className={className}
          etikett={kopfEtikett(job)}
          titel={
            <>
              <span className={styles.titelHaupt}>{mitTrennstellen(haupt)}</span>
              {zusatz ? (
                <>
                  {' '}
                  <span className={styles.titelZusatz}>{mitTrennstellen(zusatz)}</span>
                </>
              ) : null}
            </>
          }
          unterzeile={kopfUnterzeile(job)}
          aktion={KOPF_AKTION}
          mikrotext={KOPF_MIKROTEXT}
          zweitweg={KOPF_ZWEITWEG}
          masse={kopfMasse(job)}
          panel={<Kopfbild job={job} />}
        />
      </div>
    </>
  );
}
