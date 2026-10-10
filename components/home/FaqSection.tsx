import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { JsonLd } from '@/components/seo/JsonLd';
import { Disclosure } from '@/components/ui/Disclosure';
import { getFaqItems } from '@/lib/content/faq';
import { buildFaqPageJsonLd } from './content';
import { SectionHeader } from './SectionHeader';
import { FAQ_KOPF } from './woche/abschnitte-text';

/**
 * #faq (E-START-050): die fünf Fragen als exklusives natives Akkordeon (`Disclosure`, name="faq": immer nur
 * eine offen, ohne JavaScript, mit Seitensuche), dazu die einzige FAQPage der Website. Das JSON-LD trägt
 * genau den sichtbaren Wortlaut (buildFaqPageJsonLd). Ab lg: Kopf links, Fragen rechts (eigene Struktur
 * gegenüber den Nachbarabschnitten, S-12).
 */
export function FaqSection() {
  const items = getFaqItems();

  return (
    <Section id="faq" tone="subtle" aria-labelledby="faq-title">
      <Container className="grid gap-8 lg:grid-cols-12 lg:gap-x-8">
        <SectionHeader id="faq-title" title={FAQ_KOPF.titel} lead={FAQ_KOPF.einleitung} className="lg:col-span-5" />
        <div className="border-t-(length:--m-strich) border-brand lg:col-span-7">
          {items.map((item) => (
            <Disclosure key={item.id} name="faq" summary={<span className="text-pretty">{item.question}</span>}>
              <p className="max-w-prose">{item.answer}</p>
            </Disclosure>
          ))}
        </div>
        <JsonLd data={buildFaqPageJsonLd(items)} />
      </Container>
    </Section>
  );
}
