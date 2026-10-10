import { Einstieg } from './einstieg/Einstieg';
import { Vertrauenszeile } from './einstieg/Vertrauenszeile';
import styles from './einstieg/einstieg.module.css';

export interface HeroProps {
  /** Stichtag (Jubiläum bis 31.12.2026, E-START-002); Standard: jetzt. Für Tests setzbar. */
  now?: Date;
}

/**
 * Einstieg der Startseite (R3-HOME-01, Variante 1 mit Teilen aus B Runde 1): Haus mit Wärmepumpe, der
 * Kreislauf läuft einmal an, die Uhr rastet auf 13:30 ein, der rote Vorlauf endet in „Jetzt bewerben“.
 * Darunter der Erklärsatz mit „Kreislauf zeigen“ und die Vertrauenszeile. Genau eine h1 auf der Seite.
 * Der Abschnitt endet bündig; den Leitungstrenner zum nächsten Abschnitt setzt die Seite.
 */
export function Hero({ now = new Date() }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className={styles.held} data-kreislauf="ruhe" data-seitenart="erzaehlseite">
      <Einstieg now={now} titleId="hero-title" />
      <Vertrauenszeile />
    </section>
  );
}
