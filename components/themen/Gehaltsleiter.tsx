import type { CSSProperties } from 'react';
import { formatNumber } from '@/lib/jobs/format';
import type { Gehaltsleiter as Leiter } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import styles from './themen.module.css';

/** Ab diesem Anteil der Skala steht der Betrag links vor der Spanne statt rechts dahinter (Platz im Panel). */
export const BETRAG_LINKS_AB = 0.6;

export interface LeiterLage {
  /** Anfang und Ende der Spanne auf der Skala (0–1). */
  von: number;
  bis: number;
  /** Der Betrag steht links vor der Spanne. */
  links: boolean;
}

/** Lage einer Spanne auf der gemeinsamen Euro-Skala der Leiter. */
export function leiterLage(min: number, max: number, skala: Pick<Leiter, 'von' | 'bis'>): LeiterLage {
  const breite = skala.bis - skala.von;
  const von = (min - skala.von) / breite;
  const bis = (max - skala.von) / breite;
  return { von, bis, links: bis > BETRAG_LINKS_AB };
}

/**
 * Gehaltsleiter (Signatur der Gehaltsseite, Navy-Panel im Kopf): jede live Stelle als Leitungspaar auf derselben
 * Euro-Skala, Vorlauf oben und Rücklauf unten, Flansche an Anfang und Ende der Spanne; der Betrag in Martian Mono an
 * der Leitung, darunter die Maßlinie mit vollen Tausendern (unter 30em nur jeder zweite). Echter Text (Liste), kein Bild: Der Screenreader liest
 * je Stelle Name und Spanne. Die Beträge kommen nur aus `job.salary` (lib/themen/text.ts, gehaltsleiter).
 */
export function Gehaltsleiter({ leiter }: { leiter: Leiter }) {
  return (
    <div
      className={styles.leiter}
      data-zeichnung="gehaltsleiter"
      style={{ '--teile': String(leiter.schritte.length - 1) } as CSSProperties}
    >
      <p className={cn(styles.leiterKopf, 'text-etikett text-ink-2')} aria-hidden="true">
        Euro pro Monat · je Stelle
      </p>
      <ul className={styles.leiterListe} aria-label="Gehalt und Vergütung je Stelle, pro Monat">
        {leiter.zeilen.map((zeile) => {
          const lage = leiterLage(zeile.min, zeile.max, leiter);
          return (
            <li
              key={zeile.jobId}
              className={styles.leiterZeile}
              style={{ '--von': lage.von.toFixed(4), '--bis': lage.bis.toFixed(4) } as CSSProperties}
            >
              <span className="text-etikett text-ink-2">{zeile.name}</span>{' '}
              <span className={styles.leiterSpur}>
                <span aria-hidden="true" className={styles.leiterPaar} />
                <span className={cn(styles.leiterBetrag, lage.links && styles.leiterBetragLinks, 'font-mass text-brand')}>
                  {zeile.betrag}
                  <span className="sr-only"> {zeile.einheit}</span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className={styles.leiterSkala} aria-hidden="true">
        <span className={styles.leiterMass} />
        {leiter.schritte.map((schritt, i) => (
          <span
            key={schritt}
            // Schmale Bildschirme: nur jede zweite Marke, von der letzten aus gezählt (2.000, 4.000, 6.000), sonst stoßen
            // „1.000“ und „2.000“ aneinander (Kritik 2, P1-4)
            className={cn(styles.leiterMarke, (leiter.schritte.length - 1 - i) % 2 === 1 && styles.leiterMarkeBreit, 'font-mass text-ink-2')}
            style={{ '--lage': ((schritt - leiter.von) / (leiter.bis - leiter.von)).toFixed(4) } as CSSProperties}
          >
            {formatNumber(schritt)}
          </span>
        ))}
      </div>
    </div>
  );
}
