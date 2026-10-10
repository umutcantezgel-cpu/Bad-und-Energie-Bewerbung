import styles from './recht.module.css';

export interface RechtInhaltEintrag {
  /** Anker-Id des Abschnitts (ohne „#“). */
  id: string;
  label: string;
}

export interface RechtInhaltProps {
  eintraege: readonly RechtInhaltEintrag[];
  className?: string;
}

/** Laufende Nummer eines Abschnitts in Martian Mono („01“ … „12“), gleich im Verzeichnis und am Abschnitt. */
export function abschnittsNummer(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/**
 * Inhaltsverzeichnis der Rechtsseiten (E-RECHT-011, Darstellung R5-RUHE): Etikett „Inhalt“, darunter die
 * Abschnitte als nummerierte Sprungliste. Die Nummern stehen in Martian Mono wie die Maße der Startseite und
 * sind dekorativ (die geordnete Liste zählt selbst). Am Handy eine Karte auf der Wand, ab 64em eine ruhige,
 * mitlaufende Spalte an der Leitung. Server-Komponente, im Druck ausgeblendet.
 */
export function RechtInhalt({ eintraege, className }: RechtInhaltProps) {
  return (
    <nav aria-labelledby="recht-inhalt-titel" className={[styles.inhalt, 'print-hidden', className].filter(Boolean).join(' ')}>
      <h2 id="recht-inhalt-titel" className="text-etikett text-ink-2">
        Inhalt
      </h2>
      <ol className={styles.inhaltListe}>
        {eintraege.map((eintrag, index) => (
          <li key={eintrag.id}>
            <a href={`#${eintrag.id}`} className={`${styles.inhaltLink} rounded-1`} data-motion="druck">
              <span aria-hidden="true" className={`${styles.inhaltNummer} font-mass`}>
                {abschnittsNummer(index)}
              </span>
              <span>{eintrag.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
