import { SectionHeader } from '@/components/home/SectionHeader';
import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import { RohrAkzent } from '@/components/zeichnung/RohrAkzent';
import type { Job } from '@/lib/jobs/registry';
import { ARBEITEN_LINK } from '@/lib/themen/registry';
import { VERGLEICH, stellenprofil, vergleichEinleitung } from './inhalt-text';
import styles from './liste.module.css';

export interface StellenvergleichProps {
  /** Die Stellen, die gerade live sind; unter zwei Stellen gibt es nichts zu vergleichen. */
  jobs: readonly Job[];
}

/**
 * „Alle offenen Jobs im Vergleich“ (V6-G1, Ton Wand): je Stelle der volle Titel, die Aufgaben, die harten
 * Voraussetzungen (nur belegte; offene wie bei der Bürofachkraft fehlen) und „Lohn auf Anfrage“ (E-030, ohne Betrag),
 * dazu der Weg zur Stellenanzeige. Karten mit
 * Rohrakzent (E-031) wie „Das bekommst du“ der Stellenseite, Beschriftungen als Etikett (dl > div > dt + dd).
 */
export function Stellenvergleich({ jobs }: StellenvergleichProps) {
  if (jobs.length < 2) return null;
  const titelId = `${VERGLEICH.anker}-titel`;

  return (
    <Section id={VERGLEICH.anker} tone="wand" trenner aria-labelledby={titelId}>
      <Container className="flex flex-col gap-12">
        <SectionHeader id={titelId} eyebrow={VERGLEICH.etikett} title={VERGLEICH.titel} lead={vergleichEinleitung(jobs)} />
        <ul className="grid gap-x-12 gap-y-12 md:grid-cols-2">
          {jobs.map(stellenprofil).map((profil) => (
            <li key={profil.id}>
              <article className="relative flex h-full flex-col gap-6 pt-6">
                <RohrAkzent />
                <h3 className="text-title-3 text-brand">{profil.titel}</h3>
                <dl className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <dt className="text-etikett text-ink-muted">{VERGLEICH.aufgaben}</dt>
                    <dd>
                      <ul className={styles.punkte}>
                        {profil.aufgaben.map((aufgabe) => (
                          <li key={aufgabe}>{aufgabe}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  {profil.voraussetzungen.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <dt className="text-etikett text-ink-muted">{VERGLEICH.voraussetzung}</dt>
                      <dd>
                        <ul className={styles.punkte}>
                          {profil.voraussetzungen.map((punkt) => (
                            <li key={punkt}>{punkt}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}
                  {profil.lohn ? (
                    <div className="flex flex-col gap-1">
                      <dt className="text-etikett text-ink-muted">{VERGLEICH.bezahlung}</dt>
                      <dd className="text-callout text-ink">{profil.lohn}</dd>
                    </div>
                  ) : null}
                </dl>
                <TextLink href={profil.link.href} standalone className="mt-auto self-start">
                  {profil.link.label}
                  <Icon name="arrow-right" size="sm" className="shrink-0" />
                </TextLink>
              </article>
            </li>
          ))}
        </ul>
        {/* Themen-Hub (E-028): Bezahlung und Extras, Fahrzeug und Werkzeug, Wärmepumpen, Betrieb, diskreter Wechsel */}
        <TextLink href={ARBEITEN_LINK.href} standalone className="self-start">
          {ARBEITEN_LINK.label}
          <Icon name="arrow-right" size="sm" className="shrink-0" />
        </TextLink>
      </Container>
    </Section>
  );
}
