import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { JsonLd } from '@/components/seo/JsonLd';
import { Disclosure } from '@/components/ui/Disclosure';
import { getFaqItems } from '@/lib/content/faq';
import { buildFaqPageJsonLd } from './content';
import { SectionHeader } from './SectionHeader';

/** #faq: the five existing questions as an exclusive native accordion, plus the site's only FAQPage. */
export function FaqSection() {
  const items = getFaqItems();

  return (
    <Section id="faq" tone="subtle" aria-labelledby="faq-title">
      <Container>
        <SectionHeader id="faq-title" title="Häufige Fragen" />
        <div className="mt-8 max-w-3xl border-t border-line">
          {items.map((item) => (
            <Disclosure key={item.id} name="faq" summary={item.question}>
              <p className="max-w-prose">{item.answer}</p>
            </Disclosure>
          ))}
        </div>
        <JsonLd data={buildFaqPageJsonLd(items)} />
      </Container>
    </Section>
  );
}
