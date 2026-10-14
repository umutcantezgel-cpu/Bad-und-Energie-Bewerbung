import { cn } from '@/lib/utils/cn';
import { HausschnittKlein } from './technik/Hausschnitt';
import styles from './zeichnung.module.css';

export interface HausKleinProps {
  /** Bedeutungstragend: Titel als zugänglicher Name (role="img"). Ohne Titel dekorativ (aria-hidden). */
  titel?: string;
  className?: string;
}

/**
 * Kleines Haus für schmale Köpfe (Navy-Band): seit E-029 der kleine Hausschnitt aus dem Einstieg
 * (lib/zeichnung/szenen/hausschnitt.ts, 1 Einheit = 10 mm) mit Außeneinheit maßstäblich, Erdleitung durch die
 * Wanddurchführung, Inneneinheit als Symbol und Flachheizkörper 600 × 1.000 mm, Leitungen in Fließrichtung. Das Haus
 * davor (Zirkel im Giebel, Lüfter als Windrad, Heizkörper zu groß, Wärmefläche) ist entfallen. Schraffur mit doppeltem
 * Abstand, weil die Zeichnung hier nur 11–15rem breit ist; Breite setzt der Aufrufer (Standard 15rem). Ohne Bewegung.
 */
export function HausKlein({ titel, className }: HausKleinProps) {
  return <HausschnittKlein titel={titel} grob className={cn(styles.hausKlein, className)} />;
}
