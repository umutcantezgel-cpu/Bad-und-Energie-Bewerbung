import { JobProcess } from '@/components/jobs/JobProcess';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ABLAUF_VARIANTEN } from './inhalt-text';

/**
 * Ablauf der Bewerbung auf der Stellenliste (V6-G1, Ton Wand): der Ablauf der Stellenseiten für Fachkräfte
 * (JobProcess, mit Schritt 1 „Bewerben in 60 Sekunden“ und der Diskretionszusage), darunter, was bei Ausbildung
 * und Quereinstieg anders ist. Die Initiativbewerbung folgt im Navy-Band darunter.
 */
export function Ablauf() {
  return (
    <Section tone="wand" trenner>
      <Container className="flex flex-col gap-section-sm">
        <JobProcess audience="fachkraft" />
        <div className="flex flex-col gap-4 border-t border-line pt-8">
          <h3 className="text-title-3 text-brand">{ABLAUF_VARIANTEN.titel}</h3>
          <dl className="grid gap-6 md:grid-cols-2 md:gap-x-12">
            {ABLAUF_VARIANTEN.eintraege.map((eintrag) => (
              <div key={eintrag.name} className="flex flex-col gap-2">
                <dt className="text-etikett text-ink-muted">{eintrag.name}</dt>
                <dd className="max-w-prose text-body text-ink">{eintrag.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
