import { JobAbgaenge } from '@/components/jobs/JobCard';
import { listenName } from '@/components/jobs/liste/liste-text';
import type { Job } from '@/lib/jobs/registry';
import { arbeitenPfad } from '@/lib/themen/jsonld';
import type { ArbeitenPageText } from '@/lib/themen/text';
import { Abschnitt, Kaestenband, Kontakt, ThemenAbgaenge } from './Bausteine';
import { ThemaKopf } from './ThemaKopf';
import { Verteiler } from './Verteiler';

export interface ArbeitenSeiteProps {
  text: ArbeitenPageText;
  /** Die Stellen, die gerade live sind (dieselben, aus denen `text` gebaut ist). */
  jobs: readonly Job[];
}

/**
 * Themen-Hub /arbeiten-bei-uns (E-028), Erzählseite. Tonfolge: Pfad und Kopf Papier/Navy (Verteiler mit einem Abgang je
 * Thema) · Themen Papier (Leitungsabgänge, je Thema ein belegter Satz und ein Kennwert) · Zusagen Navy · Stellen Wand
 * (mit Gehalt) · Kontakt Papier · Fuß Navy. Jeder Satz kommt aus lib/themen/text.ts.
 */
export function ArbeitenSeite({ text, jobs }: ArbeitenSeiteProps) {
  return (
    <>
      <ThemaKopf text={text} pfad={arbeitenPfad()} panel={<Verteiler karten={text.themen.karten} />} bildBreit />

      <Abschnitt kopf={text.themen.kopf} trenner klammer>
        <ThemenAbgaenge karten={text.themen.karten} label={text.themen.kopf.heading} />
      </Abschnitt>

      <Kaestenband kopf={text.zusagen.kopf} kaesten={text.zusagen.kaesten} />

      {text.stellen && jobs.length > 0 ? (
        <Abschnitt kopf={text.stellen.kopf} tone="wand" trenner="62%">
          <JobAbgaenge jobs={jobs} headingLevel="h3" aria-label={listenName(jobs.length)} />
        </Abschnitt>
      ) : null}

      <Kontakt kontakt={text.kontakt} whatsapp={text.whatsapp} />
    </>
  );
}
