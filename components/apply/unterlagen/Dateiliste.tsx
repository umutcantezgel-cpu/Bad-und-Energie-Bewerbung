import type { CSSProperties } from 'react';
import { Icon } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils/cn';
import { AUSWAHL_TEXT } from './auswahl-text';
import { groesseText } from './regeln';
import type { UnterlagenEintrag } from './steuerung';
import styles from './unterlagen.module.css';

export interface DateilisteProps {
  eintraege: readonly UnterlagenEintrag[];
  /** Ohne Rückruf keine Entfernen-Knöpfe (z. B. nach dem Abschluss). */
  onEntfernen?: (schluessel: string) => void;
}

const prozent = (anteil: number) => Math.round(Math.min(Math.max(anteil, 0), 1) * 100);

/**
 * Liste der gewählten Unterlagen (E-BEW-012): Name, Größe in Martian Mono, Stand der Übertragung als Leitung,
 * die sich füllt (role="progressbar"), Fehlertext am Eintrag. Ohne Hooks, damit sie auch statisch rendert.
 * Erfolg heißt „übertragen“, nie „verifiziert“ oder „beigefügt“.
 */
export function Dateiliste({ eintraege, onEntfernen }: DateilisteProps) {
  if (eintraege.length === 0) return null;
  return (
    <ul className={styles.liste} aria-label={AUSWAHL_TEXT.liste} data-unterlagen-liste="">
      {eintraege.map((eintrag) => {
        const wert = prozent(eintrag.anteil);
        return (
          <li key={eintrag.schluessel} className={styles.eintrag} data-status={eintrag.status}>
            <Icon
              name={eintrag.status === 'fehler' ? 'circle-alert' : eintrag.status === 'uebertragen' ? 'file-check' : 'file-text'}
              size="lg"
              className={eintrag.status === 'fehler' ? 'text-danger' : 'text-brand'}
            />
            <div className={styles.eintragText}>
              <p className={cn(styles.name, 'text-callout font-bold text-ink')}>{eintrag.name}</p>
              <p className="text-footnote text-ink-muted">
                <span className="font-mass">{groesseText(eintrag.groesse)}</span>
                {eintrag.status === 'laedt' ? (
                  <>
                    {' · '}
                    {AUSWAHL_TEXT.statusLaedt} <span className="font-mass">{wert}&nbsp;%</span>
                  </>
                ) : null}
                {eintrag.status === 'uebertragen' ? ` · ${AUSWAHL_TEXT.statusUebertragen}` : null}
              </p>
              {eintrag.status === 'laedt' ? (
                <span
                  className={styles.balken}
                  role="progressbar"
                  aria-label={`${eintrag.name} ${AUSWAHL_TEXT.statusLaedt}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={wert}
                >
                  <span
                    className={styles.fuellung}
                    style={{ '--anteil': String(eintrag.anteil) } as CSSProperties}
                    data-motion="fortschritt"
                  />
                </span>
              ) : null}
              {eintrag.fehler ? <p className="text-footnote font-bold text-danger">{eintrag.fehler}</p> : null}
            </div>
            {onEntfernen ? (
              <IconButton aria-label={`${eintrag.name}: ${AUSWAHL_TEXT.entfernen}`} onClick={() => onEntfernen(eintrag.schluessel)}>
                <Icon name="x" size="md" />
              </IconButton>
            ) : (
              <span />
            )}
          </li>
        );
      })}
    </ul>
  );
}
