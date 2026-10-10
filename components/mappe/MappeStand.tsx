'use client';

import type { MouseEvent } from 'react';
import { Icon } from '@/components/icons';
import { motionAllowed } from '@/lib/motion/prefers';
import { cn } from '@/lib/utils/cn';
import styles from './mappe.module.css';
import { STAND_TEXT, springeZuAbschnitt, type MappeAbschnittId, type MappeStandWerte } from './stand';

/** Sprung mit Fokus aufs erste Feld (E-BEW-006); ohne JS trägt der Anker allein. */
export function sprungKlick(id: MappeAbschnittId) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (springeZuAbschnitt(id, { sanft: motionAllowed() })) event.preventDefault();
  };
}

export interface MappeStandProps {
  stand: MappeStandWerte;
  className?: string;
}

/**
 * Checkliste der Mappe (E-BEW-006): „0 von 5 erledigt“ und je Abschnitt ein Sprung mit Haken oder „offen“.
 * Der Stand kommt nur aus echten Eingaben (stand.ts); Haken erscheinen ohne Neuladen. Der Ring zum selben Stand
 * steht am Pult neben der Hauptaktion (MappeActions), damit es auf jeder Breite genau einen Ring gibt.
 */
export function MappeStand({ stand, className }: MappeStandProps) {
  return (
    <section aria-labelledby="mappe-stand-titel" className={cn(styles.stand, 'rounded-2 bg-surface-2 print-hidden', className)} data-mappe-stand="">
      <header className={styles.standKopf}>
        <h2 id="mappe-stand-titel" className="text-etikett text-ink-2">
          {STAND_TEXT.titel}
        </h2>
        <p className="text-title-3 text-brand" data-mappe-stand-zahl="">
          <span className="font-mass">
            {stand.erledigt}&nbsp;von&nbsp;{stand.gesamt}
          </span>{' '}
          {STAND_TEXT.erledigt}
        </p>
      </header>
      <ol className={styles.standListe} aria-label={STAND_TEXT.listeName}>
        {stand.abschnitte.map((abschnitt) => (
          <li key={abschnitt.id}>
            <a
              href={`#${abschnitt.id}`}
              onClick={sprungKlick(abschnitt.id)}
              className={cn(styles.standEintrag, 'rounded-1')}
              data-erledigt={abschnitt.erledigt ? '' : undefined}
            >
              <span className={styles.standMarke} aria-hidden="true">
                {abschnitt.erledigt ? <Icon name="check" size="sm" /> : null}
              </span>
              <span className={cn(styles.standNummer, 'font-mass')} aria-hidden="true">
                {abschnitt.nummer}
              </span>
              <span className={styles.standTitel}>{abschnitt.titel}</span>
              <span className={cn(styles.standZustand, 'text-etikett')}>
                <span className="sr-only">: </span>
                {abschnitt.erledigt ? STAND_TEXT.erledigt : STAND_TEXT.offen}
              </span>
              <Icon name="arrow-down" size="sm" className={styles.standPfeil} />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
