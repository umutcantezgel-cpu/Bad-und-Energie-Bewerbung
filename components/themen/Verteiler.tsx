import { Icon } from '@/components/icons';
import type { ThemaKarte } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import styles from './stil';

/**
 * Themenliste (Signatur des Themen-Hubs, Navy-Panel im Kopf). Bis E-029 ein Heizkreisverteiler mit Vorlauf links und
 * Rücklauf rechts; seit E-029 gilt „Rohr nur, wo Wasser fließt“, darum eine Liste wie ein Stücklistenkopf: je Thema das
 * Etiketten-Kästchen mit Icon und Namen, eine feine Leitlinie und der Kennwert in Martian Mono, zwischen den Zeilen
 * feine Linien. Echter Text (Liste), keine Links: Die Wege zu den Themen stehen im Abschnitt darunter.
 */
export function Verteiler({ karten }: { karten: readonly ThemaKarte[] }) {
  return (
    <div className={styles.verteiler} data-zeichnung="themenliste">
      <ul className={styles.verteilerListe} aria-label="Themen">
        {karten.map((karte) => (
          <li key={karte.id} className={styles.verteilerKreis}>
            <span className={cn(styles.verteilerKasten, 'text-etikett text-brand rounded-1')}>
              <Icon name={karte.icon} size="md" className="shrink-0" />
              <span>{karte.name}</span>
            </span>
            <span aria-hidden="true" className={styles.verteilerLinie} />
            {karte.kurz ? <span className={cn(styles.verteilerWert, 'font-mass text-brand')}>{karte.kurz}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
