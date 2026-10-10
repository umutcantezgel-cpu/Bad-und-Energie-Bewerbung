import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from './SectionHeader';
import { Wochenplan } from './woche/Wochenplan';
import { bindeUhr, mitZiffern } from './woche/satz';
import { WOCHE_TEXT } from './woche/woche-daten';

/**
 * Arbeitswoche (Variante 1 `.woche` „Freitags ab 13:30 Uhr Feierabend“ mit dem Arbeitszeit-Diagramm aus
 * B Runde 1): die Woche als Heizkreisverteiler. Server-Komponente ohne Bewegung und ohne JavaScript.
 * Warmes Papier wie in Variante 1; der Abschnitt schneidet den Zulauf am Seitenrand ab (overflow-x: clip),
 * der Leitungstrenner davor kommt vom Orchestrator.
 */
export function WeekSection() {
  return (
    <Section id="woche" aria-labelledby="woche-title" className="overflow-x-clip">
      <Container>
        <SectionHeader id="woche-title" title={bindeUhr(WOCHE_TEXT.titel)} lead={mitZiffern(WOCHE_TEXT.einleitung)} />
        {/* px-16: Tagesspalte links und Platz für die Endmaße rechts (MASS.spalte / MASS.rechts) */}
        <figure className="mt-12 px-16">
          <Wochenplan />
        </figure>
      </Container>
    </Section>
  );
}
