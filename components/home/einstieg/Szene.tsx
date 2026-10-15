import { HausschnittInhalt } from '@/components/zeichnung/technik/Hausschnitt';
import type { MotionId } from '@/lib/motion/register';
import { HAUSSCHNITT_RAHMEN, type Leitung, type Pfeil } from '@/lib/zeichnung/szenen/hausschnitt';
import { cn } from '@/lib/utils/cn';
import styles from './einstieg.module.css';

/** Auftakt je Leitung (Register): Vorlauf aus der Anlage zuerst, der Rücklauf folgt. */
function motion(l: Leitung): MotionId {
  return l.medium === 'vorlauf' ? 'vorlauf-haus' : 'ruecklauf-haus';
}

/** Die Leitungen zur Bewerbung gibt es je nach Lage des Knopfs: mobil senkrecht nach unten, am Desktop nach links. */
function klasse(l: Leitung | Pfeil): string | undefined {
  if (l.nur === 'knopf-mobil') return styles.nurMobil;
  if (l.nur === 'knopf-desktop') return styles.nurDesktop;
  return undefined;
}

/**
 * Hausschnitt im Einstieg (KERN K-001, K-010, E-029): die Anlage im Schnitt durch das Haus, 1 Einheit = 10 mm, aus
 * lib/zeichnung/szenen/hausschnitt.ts (dieselbe Geometrie wie die Teilen-Bilder). Außeneinheit maßstäblich vor dem
 * Haus, Erdleitung im Rohrgraben durch die Wanddurchführung zur Inneneinheit (Symbol), Flachheizkörper 600 × 1.000 mm,
 * Erdreich als 45°-Schraffur. Der Vorlauf beginnt an der Außeneinheit und läuft in die Bewerbung: mobil senkrecht
 * nach unten in den Leitungsschacht, am Desktop links aus der Navy-Fläche zum Knopf.
 *
 * Dekorativ (`aria-hidden`): Maße, Einleitung und der Erklärsatz tragen dieselbe Information als Text. Beim Laden
 * zeichnen sich die Leitungen einmal (Register `vorlauf-haus`, `ruecklauf-haus`), die festen Fließpfeile blenden ein
 * (`pfeile`); ohne Auftakt steht der Endzustand. Das Wärmefeld liegt als eigene Ebenen darunter (Einstieg.tsx,
 * WaermefeldEbenen); Heizkörper, Inneneinheit, Leitungen und Pfeile im Raum stehen im Wärmebereich (E-031).
 */
export function Szene() {
  const { breite, hoehe } = HAUSSCHNITT_RAHMEN;
  return (
    <svg className={styles.szene} viewBox={`0 0 ${breite} ${hoehe}`} aria-hidden="true" focusable="false" data-szene="einstieg">
      <HausschnittInhalt
        knopf
        einzelheit
        waerme="ebenen"
        leitungKlasse={(l) => cn(styles.rohr, klasse(l))}
        leitungMotion={motion}
        pfeilKlasse={klasse}
        fassungKlasse={klasse}
        pfeilMotion="pfeile"
      />
    </svg>
  );
}
