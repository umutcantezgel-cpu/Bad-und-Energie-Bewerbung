import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './anzeige.module.css';

/** Außenmaß in px; Zeichnung ohne Skalierung (viewBox = Pixel), damit der Strich genau --m-strich bleibt. */
const PX = { md: 112, lg: 144 } as const;
/** Halbe Strichbreite (1,5 px) plus 1,5 px Luft für die runden Enden am Rand. */
const RAND = 3;

/**
 * Anteil in ganzen Prozent (0–100), auf den Bereich begrenzt. Ohne gültiges Maximum 0, damit ein
 * leerer Stand nie als erledigt erscheint (E-BEW-007: „100 %“ erst bei vollem Stand).
 */
export function ringAnteil(value: number, max = 100): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  const begrenzt = Math.min(Math.max(value, 0), max);
  // Abrunden: 4 von 5 bleibt 80 %, und 99,6 % wird nicht zu „100 %“, bevor alles erledigt ist.
  return begrenzt === max ? 100 : Math.floor((begrenzt / max) * 100);
}

export interface ProgressRingProps {
  /** Erledigter Stand, z. B. 3 (von 5 Abschnitten). */
  value: number;
  /** Voller Stand; Standard 100 (dann ist `value` ein Prozentwert). */
  max?: number;
  /** Zugänglicher Name, z. B. „Stand deiner Mappe“. */
  label: string;
  /** Wert als Text für Screenreader; Standard „3 von 5 erledigt“ bzw. „60 %“. */
  valueText?: string;
  /** Kleine Beschriftung unter der Zahl (Etikett in Versalien), z. B. „erledigt“. */
  caption?: ReactNode;
  /** md 112 px, lg 144 px. */
  size?: keyof typeof PX;
  className?: string;
}

/**
 * Stand als Ring (E-BEW-007): Die Spur liegt als Planpunkte, der rote Vorlauf zeichnet den Anteil im
 * Uhrzeigersinn ab zwölf Uhr (stroke-dashoffset = 100 − Anteil, Register „fortschritt“). Bei 100 % kommt
 * der blaue Rücklauf unten zurück und schließt den Kreis zum Heizkreis (Register „kreis-schliessen“).
 * `role="meter"` mit Wert als Zahl und Text; die Zeichnung ist dekorativ. Server-Komponente ohne Zustand,
 * auch in Client-Inseln nutzbar.
 */
export function ProgressRing({ value, max = 100, label, valueText, caption, size = 'md', className }: ProgressRingProps) {
  const anteil = ringAnteil(value, max);
  const gueltigMax = Number.isFinite(max) && max > 0 ? max : 0;
  const jetzt = Number.isFinite(value) ? Math.min(Math.max(value, 0), gueltigMax) : 0;
  const text = valueText ?? (max === 100 ? `${anteil} %` : `${jetzt} von ${gueltigMax} erledigt`);
  const geschlossen = anteil === 100;
  const px = PX[size];
  const c = px / 2;
  const r = c - RAND;

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={gueltigMax}
      aria-valuenow={jetzt}
      aria-valuetext={text}
      data-anteil={anteil}
      data-geschlossen={geschlossen ? '' : undefined}
      className={cn('relative inline-grid shrink-0 place-items-center text-center', size === 'lg' ? 'size-36' : 'size-28', className)}
    >
      <svg aria-hidden="true" focusable="false" width={px} height={px} viewBox={`0 0 ${px} ${px}`} className="absolute inset-0">
        <g transform={`rotate(-90 ${c} ${c})`}>
          <circle className={styles.spur} cx={c} cy={c} r={r} />
          <circle
            className={styles.vorlauf}
            data-motion="fortschritt"
            cx={c}
            cy={c}
            r={r}
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={100 - anteil}
            visibility={anteil === 0 ? 'hidden' : undefined}
          />
        </g>
        {geschlossen && (
          <path
            className={styles.ruecklauf}
            data-motion="kreis-schliessen"
            d={`M${c + r} ${c}A${r} ${r} 0 0 1 ${c - r} ${c}`}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={0}
          />
        )}
      </svg>
      <span className="relative flex flex-col items-center gap-1">
        <span className={cn('font-mass font-semibold text-brand', size === 'lg' ? 'text-numeral' : 'text-lead')}>
          {anteil}
          <span className="text-callout">{' '}%</span>
        </span>
        {caption && <span className="text-etikett text-ink-2">{caption}</span>}
      </span>
    </div>
  );
}
