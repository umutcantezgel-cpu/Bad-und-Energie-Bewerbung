import { Einstieg } from './einstieg/Einstieg';
import { Vertrauenszeile } from './einstieg/Vertrauenszeile';
import styles from './einstieg/einstieg.module.css';

export interface HeroProps {
  /** Stichtag (Jubiläum bis 31.12.2026, E-START-002); Standard: jetzt. Für Tests setzbar. */
  now?: Date;
}

/**
 * Einstieg der Startseite (Technische Zeichnung 2.0, E-029): Papier links mit h1 und dem roten Knopf, die Navy-Fläche
 * rechts mit dem Hausschnitt, den Maßen und der Einzelheit „X“ (Außeneinheit von vorn, der Rotor dreht mit Knopf
 * „Anhalten“); am Handy ein Navy-Block oben, Knopf auf Papier darunter. Der rote Vorlauf läuft aus der Anlage in den
 * Knopf, zuletzt blendet das Maß „35 km“ im Giebel ein (E-027). Darunter die Vertrauenszeile. Genau eine h1 auf der
 * Seite. Der Abschnitt endet bündig.
 */
export function Hero({ now = new Date() }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className={styles.held} data-seitenart="erzaehlseite">
      <Einstieg now={now} titleId="hero-title" />
      <Vertrauenszeile />
    </section>
  );
}
