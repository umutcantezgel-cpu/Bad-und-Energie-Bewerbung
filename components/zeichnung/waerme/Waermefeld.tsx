import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { WAERMEFELDER, type Rechteck, type Waermeband, type WaermefeldId } from '@/lib/zeichnung/szenen/waermefeld';
import { waermeBandPfad, type WaermeDateiFeld } from '@/lib/zeichnung/waerme/dateien';
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
 * Jedes Band startet nach `--start` Takten (aus den Daten) und wächst senkrecht aus seinem Ursprung (transform-origin:
 * Oberkante des Heizkörpers oder Boden) oder blendet als Deckenschicht an Ort und Stelle ein (`data-bewegung`,
 * Prüfrunde 4 B4-2).
 */
export function WaermefeldEbenen({ id, rahmen, className }: WaermefeldEbenenProps) {
  if (!WAERMEFELD_AN) return null;
  const { innen, baender } = WAERMEFELDER[id];
  return (
    <FeldRahmen id={id} rahmen={rahmen} className={className}>
      {baender.map((b) => (
        <svg
          key={b.stufe}
          className={cn(w.band, KLASSE[b.stufe])}
          viewBox={sicht(innen)}
          aria-hidden="true"
          focusable="false"
          data-band={b.stufe}
          data-bewegung={b.bewegung}
          data-motion="waerme-breitet-sich-aus"
          style={bandStil(innen, b)}
        >
          <path d={b.d} />
        </svg>
      ))}
    </FeldRahmen>
  );
}

/**
 * Wie WaermefeldEbenen, die Bänder aber als Bilder aus eigenen Dateien (lib/zeichnung/waerme/dateien.ts, Prüfrunde 1
 * C1-6): für die Vergleichsräume weit unter dem ersten Bildschirm, damit ihre Pfade nicht im Dokument stehen. Die
 * Bilder laden erst, wenn die Abbildung näherkommt (loading="lazy"; SichtStart lässt sie so, Prüfrunde 3 C3-5), und
 * bewegen sich wie die Ebenen.
 */
export function WaermefeldDateien({ id, rahmen, className }: { id: WaermeDateiFeld; rahmen: Rechteck; className?: string }) {
  if (!WAERMEFELD_AN) return null;
  const { innen, baender } = WAERMEFELDER[id];
  return (
    <FeldRahmen id={id} rahmen={rahmen} className={className}>
      {baender.map((b) => (
        // Dekorative Ebenen eines Bilds (Zeichnung darüber trägt den Namen); next/image ist für SVG-Dateien hier nicht nötig
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={b.stufe}
          className={w.band}
          src={waermeBandPfad(id, b.stufe)}
          alt=""
          loading="lazy"
          decoding="async"
          width={innen.breite}
          height={innen.hoehe}
          data-band={b.stufe}
          data-bewegung={b.bewegung}
          data-motion="waerme-breitet-sich-aus"
          style={bandStil(innen, b)}
        />
      ))}
    </FeldRahmen>
  );
}

/** Lage des Felds im Rahmen der Zeichnung (Prozent), Band 0 als Fläche; `data-wachstum` aus den Daten (senkrecht). */
function FeldRahmen({ id, rahmen, className, children }: { id: WaermefeldId; rahmen: Rechteck; className?: string; children: ReactNode }) {
  const { innen, wachstum } = WAERMEFELDER[id];
  const lage: CSSProperties = {
    left: prozent((innen.x - rahmen.x) / rahmen.breite),
    top: prozent((innen.y - rahmen.y) / rahmen.hoehe),
    width: prozent(innen.breite / rahmen.breite),
    height: prozent(innen.hoehe / rahmen.hoehe),
  };
  return (
    <div className={cn(w.feld, className)} style={lage} data-waermefeld={id} data-wachstum={wachstum} aria-hidden="true">
      <div className={w.grund} aria-hidden="true" data-band="0" />
      {children}
    </div>
  );
}

/** Ursprung des Wachstums (transform-origin) und Startverzögerung eines Bands. */
function bandStil(innen: Rechteck, b: Waermeband): CSSProperties {
  return {
    transformOrigin: `${prozent((b.ursprung.x - innen.x) / innen.breite)} ${prozent((b.ursprung.y - innen.y) / innen.hoehe)}`,
    '--start': b.startTakte,
  } as CSSProperties;
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
