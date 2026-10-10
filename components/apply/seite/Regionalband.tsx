import { SectionHeader } from '@/components/home/SectionHeader';
import { Icon } from '@/components/icons';
import { Container, Section } from '@/components/layout';
import { TextLink } from '@/components/ui/TextLink';
import { Masskette } from '@/components/zeichnung';
import { REGIONALBAND } from './seite-text';
import styles from './seite.module.css';

/**
 * Regionalband unter dem Flow (E-BEW-008): Vor der Entscheidung zeigt die Seite, wo und wann gearbeitet wird.
 * Keine Fernmontage, Einsatzradius und Freitags-Feierabend als Maße in Martian Mono mit Maßlinie, der Firmensitz
 * im Etikett-Kästchen, das freie Wochenende und die Fahrzeiten der Orte außerhalb der Kernzone (V6-G1), dazu der
 * Weg zur Karte auf der Startseite (/#einsatzgebiet). Alles aus FACTS, COMPANY und REGION (seite-text.ts). Ton
 * Wand mit Leitungstrenner, wie die Abschnitte der Startseite.
 */
export function Regionalband({ titelId = 'bewerbung-region' }: { titelId?: string }) {
  const { etikett, titel, einleitung, masse, standort, wochenende, fahrzeiten, link } = REGIONALBAND;
  return (
    <Section tone="wand" trenner aria-labelledby={titelId} data-regionalband="">
      <Container className={styles.region}>
        <SectionHeader id={titelId} eyebrow={etikett} title={titel} lead={einleitung} />
        <ul className={styles.regionMasse}>
          {masse.map((mass) => (
            <li key={mass.name} className={styles.regionMass}>
              <Masskette wert={mass.wert} name={mass.name} groesse="gross" />
              {'detail' in mass && mass.detail ? <p className="text-callout text-ink-muted">{mass.detail}</p> : null}
            </li>
          ))}
          <li className={styles.standort}>
            <span className={styles.kasten}>
              <Icon name="standort" size="lg" />
            </span>
            <p className="flex flex-col gap-1">
              <span className="text-etikett text-ink-2">{standort.name}</span>
              {standort.zeilen.map((zeile) => (
                <span key={zeile} className="text-callout text-ink">
                  {zeile}
                </span>
              ))}
            </p>
          </li>
        </ul>
        <div className="flex max-w-prose flex-col gap-3">
          <p className="text-body text-ink">{wochenende}</p>
          <p className="text-callout text-ink-muted">
            <span className="text-etikett text-ink-2">{fahrzeiten.name}</span> {fahrzeiten.orte.join(' · ')}
          </p>
        </div>
        <TextLink href={link.href} standalone className="self-start">
          {link.label}
          <Icon name="arrow-right" size="md" />
        </TextLink>
      </Container>
    </Section>
  );
}
