import { JobAbgaenge } from '@/components/jobs/JobCard';
import { JobProcess } from '@/components/jobs/JobProcess';
import { listenName } from '@/components/jobs/liste/liste-text';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Disclosure } from '@/components/ui/Disclosure';
import { RohrAkzent } from '@/components/zeichnung/RohrAkzent';
import type { Job } from '@/lib/jobs/registry';
import { themaPfad } from '@/lib/themen/jsonld';
import { getThema } from '@/lib/themen/registry';
import { geschuetzt, type BueroPageText } from '@/lib/themen/text';
import { Abschnitt, Kaestenband, Kontakt, WeitereThemen } from './Bausteine';
import { BueroSzene } from './buero/BueroSzene';
import { Leitstelle } from './buero/Leitstelle';
import { ThemaKopf } from './ThemaKopf';
import styles from './stil';

/**
 * Themenseite Büro und Verwaltung (E-031, Paket W3). Tonfolge: Kopf Papier/Navy (Leitstelle: der Schreibtisch von oben
 * mit Bezugslinien zu Monteuren, Kundendienst, Kunden, Großhandel und Lager; still) · Aufgaben Papier (die vier
 * Szenen, je einmal beim Sichtbarwerden; der einzige Abschnitt mit Sicht-Auftritt, K-011) · Betrieb Navy (Lohn auf
 * Anfrage, direkter Draht, Team, Meisterbetrieb) · Stellen Wand · Ablauf Papier (Fragenset `buero`) · Fragen Wand ·
 * Weitere Themen Wand · Kontakt Papier (mit den Bürozeiten, „Büro erreichbar“). Jeder Satz aus lib/themen/text.ts.
 */
export function BueroSeite({ text, jobs }: { text: BueroPageText; jobs: readonly Job[] }) {
  const bueroJobs = jobs.filter((job) => job.category === 'buero');
  return (
    <>
      <ThemaKopf
        text={text}
        pfad={themaPfad(getThema('buero-und-verwaltung'))}
        bildBreit
        panel={<Leitstelle titel={text.leitstelle.titel} ziele={text.leitstelle.ziele} />}
      />

      <Abschnitt kopf={text.aufgaben.kopf} trenner>
        <ul className={styles.bueroSzenen} aria-label={text.aufgaben.kopf.heading}>
          {text.aufgaben.szenen.map((szene) => (
            <li key={szene.id}>
              <BueroSzene szene={szene} />
            </li>
          ))}
        </ul>
      </Abschnitt>

      <Kaestenband kopf={text.betrieb.kopf} kaesten={text.betrieb.kaesten} />

      {text.stellen && bueroJobs.length > 0 ? (
        <Abschnitt kopf={text.stellen.kopf} tone="wand">
          <JobAbgaenge jobs={bueroJobs} headingLevel="h3" aria-label={listenName(bueroJobs.length)} />
        </Abschnitt>
      ) : null}

      {text.ablauf ? (
        <Section id="ablauf" tone="papier">
          <Container>
            <JobProcess audience={text.ablauf.audience} />
          </Container>
        </Section>
      ) : null}

      <Abschnitt kopf={text.fragen.kopf} tone="wand">
        <div className="relative">
          <RohrAkzent />
          {text.fragen.fragen.map((frage) => (
            <Disclosure key={frage.id} name="faq-buero" summary={frage.frage}>
              <p className="max-w-prose">{geschuetzt(frage.antwort.text)}</p>
            </Disclosure>
          ))}
        </div>
      </Abschnitt>

      <WeitereThemen weitere={text.weitere} />
      <Kontakt kontakt={text.kontakt} whatsapp={text.whatsapp} />
    </>
  );
}
