import type { ReactNode } from 'react';
import styles from './recht.module.css';

export interface RechtAbschnittProps {
  /** Anker-Id; das Inhaltsverzeichnis springt hierher. */
  id: string;
  titel: string;
  /** Laufende Nummer wie im Verzeichnis („01“); dekorativ, der Name der Überschrift bleibt der Titel. */
  nummer?: string;
  children: ReactNode;
}

/**
 * Ein Kapitel der Rechtsseiten: benannter Bereich mit h2 im SectionHeader-Muster der Startseite – die Nummer in
 * Martian Mono als Etikett über der Überschrift in Bricolage und Marken-Navy. Steht in der Prose von
 * RechtDokument; der Abstand zwischen den Kapiteln kommt von hier.
 */
export function RechtAbschnitt({ id, titel, nummer, children }: RechtAbschnittProps) {
  const titelId = `${id}-titel`;
  return (
    <section id={id} aria-labelledby={titelId} className={styles.abschnitt}>
      <h2 id={titelId}>
        {nummer ? (
          <span aria-hidden="true" className={`${styles.abschnittNummer} font-mass`}>
            {nummer}
          </span>
        ) : null}
        {titel}
      </h2>
      {children}
    </section>
  );
}
