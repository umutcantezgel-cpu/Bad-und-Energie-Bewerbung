import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { REGION } from '@/lib/content/region';
import { cn } from '@/lib/utils/cn';
import { ALLTAG } from './inhalt-text';
import { GEBIET_LINK } from './liste-text';
import styles from './liste.module.css';

/** „35 km um Wetzlar. Keine Fernmontage.“ → je Satz ein Span (Umbruch nur zwischen den Sätzen). */
function saetze(text: string): string[] {
  return text.split(/(?<=\.)\s+/);
}

/**
 * Arbeitsalltag und Einsatzgebiet auf der Stellenliste (Ton Papier, nach dem Stellenvergleich auf Wand):
 * REGION.headline und REGION.summary im Bestandswortlaut mit dem Weg zur Karte mit Pendelrechner auf der
 * Startseite, darunter Arbeitswoche, Betrieb und Team und die Orte mit Entfernung und Fahrzeit (inhalt-text.ts).
 * Überschrift im Muster des SectionHeader (Etikett, h2 in Bricolage und Navy), Einleitung und Weg rechts daneben.
 */
export function Einsatzgebiet() {
  const { woche, betrieb, orte } = ALLTAG;
  return (
    <Section tone="papier" trenner="62%" aria-labelledby="einsatzgebiet">
      <Container className={styles.gebiet}>
        <p className={cn(styles.gebietEtikett, 'text-etikett text-ink-muted')}>{ALLTAG.etikett}</p>
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
            <Icon name="arrow-right" size="sm" className="shrink-0" />
          </TextLink>
        </div>

        <div className={styles.alltag}>
          <div className={styles.alltagTeil}>
            <h3 className="text-title-3 text-brand">{woche.titel}</h3>
            <p className="max-w-prose text-body text-ink">{woche.text}</p>
          </div>
          <div className={styles.alltagTeil}>
            <h3 className="text-title-3 text-brand">{betrieb.titel}</h3>
            <p className="max-w-prose text-body text-ink">{betrieb.text}</p>
          </div>
          <div className={cn(styles.alltagTeil, styles.orteTeil)}>
            <h3 className="text-title-3 text-brand">{orte.titel}</h3>
            <p className="text-callout text-ink-muted">{orte.einleitung}</p>
            <ul className={styles.orte}>
              {orte.liste.map((ort) => (
                <li key={ort.name} className={styles.ort}>
                  <span className="text-callout text-ink">{ort.name}</span>
                  <span className="font-mass text-footnote text-ink-muted">
                    {ort.entfernung} · {ort.fahrzeit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
