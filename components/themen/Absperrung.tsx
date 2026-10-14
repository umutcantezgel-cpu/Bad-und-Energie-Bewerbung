import { cn } from '@/lib/utils/cn';
import styles from './stil';

export interface AbsperrungProps {
  /** Beschriftungen: Anfang des Wegs (du), wohin nichts geht (derzeitiger Arbeitgeber), Ziel (Firmensitz). */
  etiketten: { du: string; arbeitgeber: string; ziel: string };
  className?: string;
}

/** Zeilenköpfe des Laufzettels (Mikrotext, K-012). */
export const LAUFZETTEL = Object.freeze({ von: 'Von', an: 'An', nichtAn: 'Nicht an' });

/**
 * Signatur der Seite „Diskret wechseln“ (E-028), seit E-029 als Typografie statt Absperrung und Blindflansch (Rohr nur,
 * wo Wasser fließt): ein Laufzettel in drei Zeilen, „Von: Du“, „An: Wetzlar“, „Nicht an: Dein Arbeitgeber“. Er sagt
 * dasselbe wie die Zusage FACTS.discretion („Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber.“,
 * im Kopf direkt daneben), ohne neue Aussage. Zeilenköpfe in Martian Mono (Etikett), Werte in Bricolage, feine Linien
 * zwischen den Zeilen; die letzte Zeile leiser. Echter Text (Beschreibungsliste), steht immer auf Navy.
 */
export function Absperrung({ etiketten, className }: AbsperrungProps) {
  const zeilen = [
    { kopf: LAUFZETTEL.von, wert: etiketten.du },
    { kopf: LAUFZETTEL.an, wert: etiketten.ziel },
    { kopf: LAUFZETTEL.nichtAn, wert: etiketten.arbeitgeber, leise: true },
  ];
  return (
    <div className={cn(styles.absperrung, className)} data-zeichnung="laufzettel">
      <dl className={styles.laufzettel}>
        {zeilen.map((z) => (
          <div key={z.kopf} className={cn(styles.laufzeile, z.leise && styles.laufzeileLeise)}>
            <dt className="text-etikett text-ink-2">{z.kopf}</dt>
            <dd className={cn(styles.laufwert, 'font-display')}>{z.wert}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
