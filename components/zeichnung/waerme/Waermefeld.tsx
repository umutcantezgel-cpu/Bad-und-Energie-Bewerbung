import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import { WAERMEFELDER, type Rechteck, type Waermeband, type WaermefeldId } from '@/lib/zeichnung/szenen/waermefeld';
import { WAERMEFELD_AN } from '@/lib/zeichnung/waerme/schalter';
import w from './waerme.module.css';

/**
 * Wärmefeld 2.0 (E-031, KERN K-010): der einzige Renderer der Wärme. Zeichnet nur die berechneten Bänder aus
 * lib/zeichnung/szenen/waermefeld.ts (WAERMEFELDER), nie eigene Formen; Band 0 ist das Innenrechteck, die Bänder 1–4
 * liegen kühl → heiß darüber. Freigegebene Orte (Prüfung components/zeichnung/waerme/__tests__/waerme.test.ts): Hero,
 * Wärmepumpen-Seite (Raumschnitt), HausschnittKlein, Kopfbild-Datei und Teilen-Bild – nie Gerät oder Lageplan.
 * Mit dem Notschalter WAERMEFELD_AN = false zeichnet keine Variante etwas.
 */

const prozent = (anteil: number) => `${Math.round(anteil * 10000) / 100}%`;
const KLASSE: Record<Waermeband['stufe'], string> = { 1: w.w1, 2: w.w2, 3: w.w3, 4: w.w4 };
const sicht = (r: Rechteck) => `${r.x} ${r.y} ${r.breite} ${r.hoehe}`;

export interface WaermefeldEbenenProps {
  id: WaermefeldId;
  /** viewBox der Zeichnung, die darüber liegt (dieselben Einheiten wie die Daten). */
  rahmen: Rechteck;
  className?: string;
}

/**
 * Bewegte Fassung als Ebenen unter einer Zeichnung (Hero, Raumschnitt): Band 0 als Fläche (div), jedes Band 1–4 als
 * eigenes SVG nur in Größe des Rauminneren, damit der Browser jedes für sich verschieben kann (transform, opacity).
 * Lage in Prozent des `rahmen`; der Aufrufer stellt die Ebenen in einen Behälter mit dem Seitenverhältnis des Rahmens.
 * Jedes Band wächst aus seinem Ursprung (transform-origin) und startet nach `--start` Takten (aus den Daten).
 */
export function WaermefeldEbenen({ id, rahmen, className }: WaermefeldEbenenProps) {
  if (!WAERMEFELD_AN) return null;
  const { innen, baender } = WAERMEFELDER[id];
  const lage: CSSProperties = {
    left: prozent((innen.x - rahmen.x) / rahmen.breite),
    top: prozent((innen.y - rahmen.y) / rahmen.hoehe),
    width: prozent(innen.breite / rahmen.breite),
    height: prozent(innen.hoehe / rahmen.hoehe),
  };
  return (
    <div className={cn(w.feld, className)} style={lage} data-waermefeld={id} aria-hidden="true">
      <div className={w.grund} aria-hidden="true" data-band="0" />
      {baender.map((b) => (
        <svg
          key={b.stufe}
          className={cn(w.band, KLASSE[b.stufe])}
          viewBox={sicht(innen)}
          aria-hidden="true"
          focusable="false"
          data-band={b.stufe}
          data-motion="waerme-breitet-sich-aus"
          style={
            {
              transformOrigin: `${prozent((b.ursprung.x - innen.x) / innen.breite)} ${prozent((b.ursprung.y - innen.y) / innen.hoehe)}`,
              '--start': b.startTakte,
            } as CSSProperties
          }
        >
          <path d={b.d} />
        </svg>
      ))}
    </div>
  );
}

/**
 * Stille Fassung in einer Zeichnung (SVG-Gruppe, Einheiten der Szene): Band 0 als Rechteck und die Bänder 1–4 in einer
 * verschachtelten Zeichnung mit der viewBox des Rauminneren (sie schneidet den Spiegelrand ab). Ohne Bewegung.
 */
export function WaermefeldStill({ id }: { id: WaermefeldId }) {
  if (!WAERMEFELD_AN) return null;
  const { innen, baender } = WAERMEFELDER[id];
  return (
    <svg x={innen.x} y={innen.y} width={innen.breite} height={innen.hoehe} viewBox={sicht(innen)} data-waermefeld={id}>
      <rect x={innen.x} y={innen.y} width={innen.breite} height={innen.hoehe} className={w.w0} />
      {baender.map((b) => (
        <path key={b.stufe} d={b.d} className={KLASSE[b.stufe]} />
      ))}
    </svg>
  );
}
