import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface RohrklammerProps {
  /** Lage und Höhe setzt der Aufrufer (z. B. `absolute inset-y-1 left-0`); die Breite ist --a-5. */
  className?: string;
}

/**
 * Rohrklammer (B Runde 1, Variante 1 `.klammer`): fasst zwei Textzeilen wie eine Rohrschelle. Oben der
 * Vorlauf, unten der Rücklauf, Bögen mit --r-2 (12 px). Dekorativ (`aria-hidden`).
 *
 * Die Höhe folgt dem Text: die senkrechten Teile sind Linien mit Prozentangaben, die Bögen hängen oben am
 * Rand und unten an einem inneren SVG bei y = 100 %. So bleibt der Strich bei jeder Höhe 3 px und der Bogen
 * rund, ohne Verzerrung durch ein gestrecktes viewBox. Zeichnungswerte: 1,5 = --m-strich/2, 12 = --r-2,
 * 22,5 = --a-5 − --m-strich/2 (runde Enden enden an der Kante).
 */
export function Rohrklammer({ className }: RohrklammerProps) {
  const vl = cn(styles.strich, styles.vorlauf);
  const rl = cn(styles.strich, styles.ruecklauf);
  return (
    <svg className={cn(styles.klammer, className)} aria-hidden="true" focusable="false" data-zeichnung="rohrklammer">
      <path className={vl} d="M22.5 1.5H13.5A12 12 0 0 0 1.5 13.5" />
      <line className={vl} x1="1.5" y1="13.5" x2="1.5" y2="50%" />
      <svg y="100%" overflow="visible">
        <line className={rl} x1="1.5" y1="-50%" x2="1.5" y2="-13.5" />
        <path className={rl} d="M1.5 -13.5A12 12 0 0 0 13.5 -1.5H22.5" />
      </svg>
    </svg>
  );
}
