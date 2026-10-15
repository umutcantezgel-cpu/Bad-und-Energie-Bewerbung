import { JobProcess } from '@/components/jobs/JobProcess';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import type { Job } from '@/lib/jobs/registry';

/**
 * Ablauf der Bewerbung auf der Stellenliste (V6-G1, Ton Wand): der Ablauf der Stellenseiten für Fachkräfte
 * (JobProcess, mit Schritt 1 „Bewerben in 60 Sekunden“ und der Diskretionszusage). Die Liste ist eine Sammelfläche:
 * Schritt 3 trägt „Für Fachkräfte“, darunter steht, was bei den anderen Stellen der Liste anders läuft (Ausbildung,
 * Quereinstieg, Büro, Schülerpraktikum; Prüfung E-029, Runde 3). Die Initiativbewerbung folgt im Navy-Band darunter.
 */
export function Ablauf({ jobs }: { jobs: readonly Job[] }) {
  return (
    <Section tone="wand" trenner>
      <Container className="flex flex-col gap-section-sm">
        <JobProcess audience="fachkraft" stellen={jobs} />
      </Container>
    </Section>
  );
}
