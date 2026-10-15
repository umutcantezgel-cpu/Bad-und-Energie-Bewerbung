import { JobAbgaenge } from '@/components/jobs/JobCard';
import { JobProcess } from '@/components/jobs/JobProcess';
import { listenName } from '@/components/jobs/liste/liste-text';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { themaPfad } from '@/lib/themen/jsonld';
import type { Job } from '@/lib/jobs/registry';
import { getThema } from '@/lib/themen/registry';
import type { DiskretPageText } from '@/lib/themen/text';
import { Absperrung } from './Absperrung';
import { Abschnitt, Kaestenband, Kontakt, Saetze, WeitereThemen } from './Bausteine';
import { ThemaKopf } from './ThemaKopf';
import styles from './stil';

/**
 * Themenseite Diskret wechseln (E-028). Tonfolge: Kopf Papier/Navy (Laufzettel seit E-029: „Von: Du“, „An: Wetzlar“,
 * „Nicht an: Dein Arbeitgeber“) · Ablauf Papier (die drei Schritte wie auf den Stellenseiten, ohne die Zusage, die
 * schon im Kopf steht; Schritt 3 „Für Fachkräfte“, darunter die Abläufe der anderen Stellen, die die Seite unter
 * „Wohin du wechseln kannst“ zeigt) · Was du brauchst Navy · Stellen Wand (mit Gehalt) · Kündigungsfrist und Daten Papier · Weitere Themen Wand · Kontakt
 * Papier.
 */
export function DiskretSeite({ text, jobs }: { text: DiskretPageText; jobs: readonly Job[] }) {
  return (
    <>
      <ThemaKopf
        text={text}
        pfad={themaPfad(getThema('diskret-wechseln'))}
        bildBreit
        panel={<Absperrung etiketten={text.zeichnung.etiketten} />}
      />

      {/* Ohne eigenen Namen: JobProcess ist selbst die benannte Region („stelle-ablauf“), sonst zwei gleiche Landmarken */}
      <Section id={text.ablauf.kopf.id} tone="papier" trenner>
        <Container>
          <JobProcess audience="fachkraft" zusage={false} stellen={jobs} />
        </Container>
      </Section>

      <Kaestenband kopf={text.brauchst.kopf} kaesten={text.brauchst.kaesten} />

      {text.stellen && jobs.length > 0 ? (
        <Abschnitt kopf={text.stellen.kopf} tone="wand" trenner="62%">
          <JobAbgaenge jobs={jobs} headingLevel="h3" aria-label={listenName(jobs.length)} />
        </Abschnitt>
      ) : null}

      <Abschnitt kopf={text.fragen.kopf} trenner klammer>
        <div className={styles.text}>
          <Saetze saetze={text.fragen.saetze} lead />
          <p className={styles.absatz}>
            {text.fragen.datenschutz.vor}{' '}
            <TextLink href={text.fragen.datenschutz.link.href}>{text.fragen.datenschutz.link.label}</TextLink>.
          </p>
        </div>
      </Abschnitt>

      <WeitereThemen weitere={text.weitere} />
      <Kontakt kontakt={text.kontakt} whatsapp={text.whatsapp} />
    </>
  );
}
