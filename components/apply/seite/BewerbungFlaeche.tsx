import type { ReactNode } from 'react';
import { Leitungstrenner } from '@/components/zeichnung';
import styles from './seite.module.css';

export interface BewerbungFlaecheProps {
  /** Der Flow (ApplyFlow, variant="page"). */
  flow: ReactNode;
  /** Die anderen Wege: Unterlagen einreichen, direkt sprechen. */
  wege: ReactNode;
  /** Ruhiger Erklärteil (Ablauf, Wegweiser, Unterlagen); ab 64em unter dem Flow, am Handy nach den Wegen. */
  erklaerung: ReactNode;
}

/**
 * Arbeitsfläche unter dem Seitenkopf: Formular zuerst, die anderen Wege daneben (Desktop) bzw. darunter (Handy),
 * K-011 „Arbeitsseiten“. Reihenfolge im DOM = Lese- und Tab-Folge: erst der Flow, dann die Wege, dann der
 * Erklärteil. Ab 64em steht der Erklärteil in der Spalte des Flows unter ihm, die Wege bleiben rechts daneben.
 */
export function BewerbungFlaeche({ flow, wege, erklaerung }: BewerbungFlaecheProps) {
  return (
    <div className={styles.flaeche} data-bewerbung-flaeche="">
      <div className={styles.flow}>{flow}</div>
      <Leitungstrenner className={styles.trenner} />
      <div className={styles.wege}>{wege}</div>
      <Leitungstrenner className={styles.trenner} />
      <div className={styles.erklaerung}>{erklaerung}</div>
    </div>
  );
}
