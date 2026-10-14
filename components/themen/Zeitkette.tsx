import { HausKlein } from '@/components/zeichnung/HausKlein';
import type { BetriebPageText } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import styles from './themen.module.css';

/**
 * Zeitkette (Signatur der Seite „Der Betrieb“, Navy-Panel im Kopf): der kleine Hausschnitt aus dem Einstieg (seit E-029
 * ohne Zirkel, HausKlein zeichnet lib/zeichnung/szenen/hausschnitt.ts), darunter eine Maßkette nach DIN 406 über die
 * ganze Breite wie die Maße am Einstieg (KERN K-003 „eingemessen statt behauptet“):
 * links das Gründungsjahr, rechts das Jahr des neuen Firmensitzes, über der Mitte das Maß dazwischen, unter den
 * Endstrichen die Namen. Nur die zwei belegten Jahre (COMPANY.foundingYear, REGION.milestone), keine erfundenen
 * Zwischenstationen. Echter Text in Lesereihenfolge: „1926 Gegründet in Wetzlar · 100 Jahre · 2026 Neuer Firmensitz“.
 */
export function Zeitkette({ kette }: { kette: BetriebPageText['zeitkette'] }) {
  return (
    <div className={styles.zeitbild} data-zeichnung="zeitkette">
      <HausKlein className={styles.zeitHaus} />
      <p className={styles.zeitkette}>
        <span className={cn(styles.zeitVon, 'font-mass text-brand')}>{kette.von}</span>{' '}
        <span className={cn(styles.zeitVonName, 'text-etikett text-ink-2')}>{kette.vonName}</span>{' '}
        <span className={cn(styles.zeitSpanne, 'font-mass text-brand')}>{kette.spanne}</span>{' '}
        <span aria-hidden="true" className={styles.zeitLinie}>
          <span className={styles.zeitStrich} />
          <span className={styles.zeitStrich} />
        </span>
        <span className={cn(styles.zeitBis, 'font-mass text-brand')}>{kette.bis}</span>{' '}
        <span className={cn(styles.zeitBisName, 'text-etikett text-ink-2')}>{kette.bisName}</span>
      </p>
    </div>
  );
}
