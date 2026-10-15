import type { CSSProperties } from 'react';
import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import { cn } from '@/lib/utils/cn';
import { LEITSTELLE } from '@/lib/zeichnung/buero/leitstelle';
import styles from '../stil';
import { BueroZeichnung, beschriftungsLage } from './BueroZeichnung';

export interface LeitstelleProps {
  /** Zugänglicher Name aus lib/themen/text.ts (`leitstelle.titel`); er beschreibt genau diese Zeichnung. */
  titel: string;
  /** Wörter an den vier Zielen (lib/themen/text.ts `leitstelle.ziele`). */
  ziele: Readonly<Record<'monteure' | 'kundendienst' | 'kunden' | 'lager', string>>;
  className?: string;
}

/**
 * Leitstelle (Signatur der Seite „Büro und Verwaltung“, E-031, Paket W3): der Schreibtisch von oben, maßstäblich, mit
 * Bezugslinien zu Monteuren, Kundendienst, Kunden sowie Großhandel und Lager (lib/zeichnung/buero/leitstelle.ts). Still
 * im Kopf auf Navy; dieselbe Zeichnung ist als Datei das Kopfbild der Bürofachkraft. Die Ziele stehen als
 * Etiketten-Kästchen am Handy als Reihe unter dem Bild, ab 30rem Bildbreite an ihren Stellen (wie Servicefahrzeug).
 */
export function Leitstelle({ titel, ziele, className }: LeitstelleProps) {
  return (
    <div className={cn(styles.bueroLeitstelle, className)} role="img" aria-label={titel} data-zeichnung="leitstelle">
      <BueroZeichnung szene={LEITSTELLE} />
      <span className={styles.bueroZiele} aria-hidden="true">
        {LEITSTELLE.beschriftungen.map((b) => {
          const lage = beschriftungsLage(LEITSTELLE, b);
          const stil = { '--lx': lage.left, '--ly': lage.top, '--tx': String(lage.translate).split(' ')[0] } as CSSProperties;
          return (
            <span key={b.id} className={styles.bueroZiel} style={stil}>
              <Etikettkasten className="whitespace-nowrap">{ziele[b.id as keyof LeitstelleProps['ziele']]}</Etikettkasten>
            </span>
          );
        })}
      </span>
    </div>
  );
}
