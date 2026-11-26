import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Disclosure } from '@/components/ui/Disclosure';
import { RohrAkzent } from '@/components/zeichnung/RohrAkzent';
import { getStartseitenFaq, type FaqItem } from '@/lib/content/faq';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { SectionHeader } from './SectionHeader';
import { FAQ_KOPF } from './woche/abschnitte-text';

/** Die Fragen der Startseite mit den Stellen, die am Stichtag live sind (getStartseitenFaq, Prüfung Sichtbarkeit ki4). */
export function startseitenFaq(now: Date): FaqItem[] {
  return getStartseitenFaq(getActiveJobs().filter((job) => isJobLive(job, now)));
}

export interface FaqSectionProps {
  /** Dieselbe Liste wie die FAQPage im Graphen der Startseite (app/page.tsx); Standard: startseitenFaq(now). */
  items?: readonly FaqItem[];
  /** Stichtag für die Stellen (Tests mit festem Datum); Standard: jetzt. */
  now?: Date;
}

/**
 * #faq (E-START-050): die Fragen der Startseite als exklusives natives Akkordeon (`Disclosure`, name="faq": immer
 * nur eine offen, ohne JavaScript, mit Seitensuche): die fünf bestehenden, dazu Bezahlung und Antwortzeit, Quereinstieg
 * und Ausbildung nur mit live Stelle der Art. Die einzige FAQPage der Website steht im Graphen der Startseite
 * (app/page.tsx, V6-B) und trägt genau diesen Wortlaut (dieselbe Liste aus startseitenFaq).
 * Ab lg: Kopf links, Fragen rechts (eigene Struktur gegenüber den Nachbarabschnitten, S-12). Tonfolge
 * E-023: Wand vor dem Schlussband.
 */
export function FaqSection({ now = new Date(), items = startseitenFaq(now) }: FaqSectionProps) {
  return (
    <Section id="faq" tone="wand" aria-labelledby="faq-title">
      <Container className="grid gap-8 lg:grid-cols-12 lg:gap-x-8">
        <SectionHeader
          id="faq-title"
          eyebrow={FAQ_KOPF.etikett}
          title={FAQ_KOPF.titel}
          lead={FAQ_KOPF.einleitung}
          className="lg:col-span-5"
        />
        <div className="relative lg:col-span-7">
          <RohrAkzent />
          {items.map((item) => (
            <Disclosure key={item.id} name="faq" summary={<span className="text-pretty">{item.question}</span>}>
              <p className="max-w-prose">{item.answer}</p>
            </Disclosure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
