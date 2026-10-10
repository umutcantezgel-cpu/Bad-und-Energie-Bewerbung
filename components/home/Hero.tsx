import { Einstieg } from './einstieg/Einstieg';
import { Vertrauenszeile } from './einstieg/Vertrauenszeile';
import styles from './einstieg/einstieg.module.css';

export interface HeroProps {
  /** Stichtag (Jubiläum bis 31.12.2026, E-START-002); Standard: jetzt. Für Tests setzbar. */
  now?: Date;
}

/**
 * Einstieg der Startseite nach den Bildern des Auftraggebers (R3-EINSTIEG-V3, Variante 3 „Wärmebild“, statisch):
 * Papier links mit h1 und dem roten Knopf, die Navy-Fläche rechts mit dem Haus im Wärmebild und den Maßen; am
 * Handy ein Navy-Block oben, Knopf auf Papier darunter. Der rote Vorlauf läuft aus dem Knopf ins Haus, die Uhr
 * rastet auf 13:30 ein; „Kreislauf zeigen“ spielt das erneut ab. Darunter die Vertrauenszeile. Genau eine h1
 * auf der Seite. Der Abschnitt endet bündig; den Leitungstrenner zum nächsten Abschnitt setzt die Seite.
 */
export function Hero({ now = new Date() }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className={styles.held} data-kreislauf="ruhe" data-seitenart="erzaehlseite">
      <Einstieg now={now} titleId="hero-title" />
      <Vertrauenszeile />
    </section>
  );
}
