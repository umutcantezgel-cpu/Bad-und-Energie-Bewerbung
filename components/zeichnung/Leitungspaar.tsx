import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface LeitungspaarProps {
  /** Namen der Schritte in Reihenfolge, z. B. ['Stelle', 'Kenntnisse', 'Konditionen', 'Kontakt']. */
  schritte: readonly string[];
  /** Aktueller Schritt, ab 1 (wird auf 1 … Anzahl begrenzt). */
  aktuell: number;
  /** Zugänglicher Name der Anzeige (Standard „Fortschritt der Bewerbung“). */
  label?: string;
  /** Sichtbarer Zähler „Schritt n von m · Name“ über dem Strang (Standard an). */
  zaehler?: boolean;
  className?: string;
}

/** Stand eines Schritts relativ zum aktuellen. */
export type Schrittstand = 'erledigt' | 'aktuell' | 'offen';

/** Anteil des gefüllten Strangs: jeder Schritt endet an seinem Knoten (1 von 4 = 25 %, 4 von 4 = 100 %). */
export function fortschrittsAnteil(aktuell: number, anzahl: number): number {
  if (anzahl <= 0) return 0;
  const schritt = Math.min(Math.max(Math.round(aktuell), 1), anzahl);
  return schritt / anzahl;
}

export function schrittstand(index: number, aktuell: number): Schrittstand {
  const nummer = index + 1;
  return nummer < aktuell ? 'erledigt' : nummer === aktuell ? 'aktuell' : 'offen';
}

/**
 * Fortschrittsstrang (Register `fortschritt`, R5 Bewerbungsflow): das Leitungspaar statt eines Balkens.
 * Vorlauf oben, Rücklauf unten wachsen mit jedem Schritt bis zum Knoten des aktuellen Schritts; erledigte
 * Knoten sind gefüllt, der aktuelle hat einen Ring. `role="progressbar"` mit Zähler und Schrittname in
 * `aria-valuetext`; Bewegung nur transform (d-2, k-aus), bei reduzierter Bewegung sofort.
 */
export function Leitungspaar({ schritte, aktuell, label = 'Fortschritt der Bewerbung', zaehler = true, className }: LeitungspaarProps) {
  const anzahl = schritte.length;
  const anteil = fortschrittsAnteil(aktuell, anzahl);
  const nummer = Math.min(Math.max(Math.round(aktuell), 1), Math.max(anzahl, 1));
  const name = schritte[nummer - 1] ?? '';
  const text = `Schritt ${nummer} von ${anzahl}${name ? `: ${name}` : ''}`;
  const fuellung = { '--anteil': String(anteil) } as CSSProperties;

  return (
    <div
      className={cn(styles.leitungspaar, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={anzahl}
      aria-valuenow={nummer}
      aria-valuetext={text}
      data-zeichnung="leitungspaar"
    >
      {zaehler ? (
        <p className={cn(styles.lpZaehler, 'text-etikett text-ink-2')} aria-hidden="true">
          Schritt <span className="font-mass">{nummer}</span> von <span className="font-mass">{anzahl}</span>
          {name ? <span className="text-brand"> · {name}</span> : null}
        </p>
      ) : null}
      <span className={styles.lpSpur} style={fuellung} aria-hidden="true">
        <span className={cn(styles.lpFuellung, styles.lpVorlauf)} data-motion="fortschritt" />
        <span className={cn(styles.lpFuellung, styles.lpRuecklauf)} data-motion="fortschritt" />
        {schritte.map((schritt, i) => (
          <span
            key={schritt}
            className={styles.lpKnoten}
            data-stand={schrittstand(i, nummer)}
            style={{ '--lage': String((i + 1) / anzahl) } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
}
