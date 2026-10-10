import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface LeitungstrennerProps {
  /**
   * Lage des 45°-Versatzes, gemessen von links (Prozent oder Länge). Standard 18 % wie in Variante 1;
   * so steht der Knick nie auf einer Satzkante.
   */
  knick?: string;
  className?: string;
}

/**
 * Leitungstrenner (B Runde 1, Variante 1 `.trenner`): Vorlauf und Rücklauf laufen als Paar quer durch den
 * Behälter und springen einmal um 45° um einen Paarabstand nach unten. Dekorativ (`aria-hidden`), ohne
 * Bewegung. Der Behälter bestimmt die Breite; für eine randlose Linie setzt der Aufrufer die Breite selbst.
 *
 * Zeichnungswerte mit Abhängigkeit (wie Variante 1, S-05): y 1,5 / 13,5 / 25,5 = --m-strich/2 + n · --paar
 * (12 px); der Rücklauf knickt 5 px früher (12 · (√2 − 1)), damit die beiden Schrägen im Abstand --paar
 * parallel laufen. Ändert sich --paar oder --m-strich, sind diese Zahlen nachzuziehen
 * (components/zeichnung/__tests__/zeichnung.test.ts prüft sie gegen lib/tokens).
 */
export function Leitungstrenner({ knick = '18%', className }: LeitungstrennerProps) {
  return (
    <svg className={cn(styles.trenner, className)} aria-hidden="true" focusable="false" data-zeichnung="leitungstrenner">
      <svg x={knick} overflow="visible">
        <path className={cn(styles.strich, styles.vorlauf)} d="M-4000 1.5H0L12 13.5H4000" />
        <path className={cn(styles.strich, styles.ruecklauf)} d="M-4000 13.5H-5L7 25.5H4000" />
      </svg>
    </svg>
  );
}
