import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { REGION } from '@/lib/content/region';
import { cn } from '@/lib/utils/cn';
import { GEBIET_LINK } from './liste-text';
import styles from './liste.module.css';

/** „35 km um Wetzlar. Keine Fernmontage.“ → je Satz ein Span (Umbruch nur zwischen den Sätzen). */
function saetze(text: string): string[] {
  return text.split(/(?<=\.)\s+/);
}

/**
 * Einsatzgebiet auf der Stellenliste (Ton Wand): REGION.headline und REGION.summary im Bestandswortlaut, dazu der
 * Weg zur Karte mit Pendelrechner auf der Startseite. Überschrift im Muster des SectionHeader (Etikett, h2 in
 * Bricolage und Navy), Satz und Weg rechts daneben.
 */
export function Einsatzgebiet() {
  return (
    <Section tone="wand" trenner="62%" aria-labelledby="einsatzgebiet">
      <Container className={styles.gebiet}>
        <p className={cn(styles.gebietEtikett, 'text-etikett text-ink-muted')}>Einsatzgebiet</p>
        <h2 id="einsatzgebiet" className="-mt-2 text-title-1 text-brand lg:mt-0">
          {saetze(REGION.headline).map((satz, i) => (
            <span key={satz} className="block">
              {i > 0 ? ' ' : null}
              {satz}
            </span>
          ))}
        </h2>
        <div className="flex flex-col items-start gap-3">
          <p className="max-w-prose text-lead text-ink-muted">{REGION.summary}</p>
          <TextLink href={GEBIET_LINK.href} standalone>
            {GEBIET_LINK.label}
            <Icon name="arrow-right" size="sm" />
          </TextLink>
        </div>
      </Container>
    </Section>
  );
}
