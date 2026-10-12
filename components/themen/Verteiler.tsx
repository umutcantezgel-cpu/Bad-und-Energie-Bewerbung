import { Icon } from '@/components/icons';
import type { ThemaKarte } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import styles from './themen.module.css';

/**
 * Verteiler (Signatur des Themen-Hubs, Navy-Panel im Kopf): ein Heizkreisverteiler mit einem Abgang je Thema. Links
 * steigt der Vorlauf, rechts der Rücklauf, dazwischen je Thema ein Kreis: Vorlauf-Stummel, Etiketten-Kästchen mit
 * Icon und Namen, die Maßlinie bis zum Kennwert in Martian Mono, Rücklauf-Stummel. Echter Text (Liste), keine Links:
 * Die Wege zu den Themen stehen im Abschnitt darunter.
 */
export function Verteiler({ karten }: { karten: readonly ThemaKarte[] }) {
  return (
    <div className={styles.verteiler} data-zeichnung="verteiler">
      <p className={cn(styles.verteilerKopf, 'text-etikett text-ink-2')} aria-hidden="true">
        <span>Vorlauf</span>
        <span>Rücklauf</span>
      </p>
      <ul className={styles.verteilerListe} aria-label="Themen">
        {karten.map((karte) => (
          <li key={karte.id} className={styles.verteilerKreis}>
            <span aria-hidden="true" className={styles.verteilerVor} />
            <span className={cn(styles.verteilerKasten, 'text-etikett text-brand rounded-1')}>
              <Icon name={karte.icon} size="md" className="shrink-0" />
              <span>{karte.name}</span>
            </span>
            <span aria-hidden="true" className={styles.verteilerLinie} />
            {karte.kurz ? <span className={cn(styles.verteilerWert, 'font-mass text-brand')}>{karte.kurz}</span> : null}
            <span aria-hidden="true" className={styles.verteilerRueck} />
          </li>
        ))}
      </ul>
    </div>
  );
}
