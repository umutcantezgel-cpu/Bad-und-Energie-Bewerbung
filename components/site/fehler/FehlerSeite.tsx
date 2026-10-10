import Link from 'next/link';
import { Icon } from '@/components/icons';
import { SectionHeader } from '@/components/home/SectionHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Seitenkopf } from '@/components/seitenkopf';
import { ContactOptions } from '@/components/site/ContactOptions';
import { OffeneLeitung } from '@/components/zeichnung/OffeneLeitung';
import {
  DIREKT_EINLEITUNG,
  DIREKT_ETIKETT,
  DIREKT_TITEL,
  FEHLER_AKTION,
  FEHLER_ANSPRECHPARTNER,
  FEHLER_EINLEITUNG,
  FEHLER_ETIKETT,
  FEHLER_ETIKETT_SR,
  FEHLER_MASSE,
  FEHLER_MIKROTEXT,
  FEHLER_TITEL,
  FEHLER_UNTERZEILE,
  FEHLER_WEGE,
  FEHLER_WHATSAPP,
  FEHLER_ZWEITWEG,
} from './fehler-text';
import styles from './fehler.module.css';

/** Id der h1; der Seitenkopf zeigt per aria-labelledby darauf. */
export const FEHLER_TITEL_ID = 'fehler-titel';
/** Id der h2 im Direktkontakt. */
export const DIREKT_TITEL_ID = 'direktkontakt-titel';

/**
 * Zeichnung der 404-Seite auf der Navy-Fläche (KERN K-010, B Runde 1): Vorlauf und Rücklauf kommen von links und
 * enden offen an einem Flansch, der Wegweiser zeigt ins Leere. Strich 3 px, `role="img"` mit Titel, ohne Bewegung.
 */
export function FehlerZeichnung() {
  return (
    <div className={styles.zeichnung}>
      <OffeneLeitung />
    </div>
  );
}

/**
 * Die 404-Seite (R4-404 in R5-RUHE, E-023): oben der gemeinsame Seitenkopf in der Variante `erzaehl` wie der
 * Einstieg der Startseite – Papier mit Etikett „Fehler 404“, h1 „Hier hat sich eine Rohrleitung verirrt.“,
 * Rohrklammer-Unterzeile und rotem „Jetzt bewerben“, in das Vorlauf und Rücklauf münden; Navy mit der offenen
 * Leitung. Darunter auf der Wand der schnelle Direktkontakt (E-SHELL-027) und die weiteren Wege (E-SHELL-026).
 * Server-Komponente; Bewegung nur `druck`.
 */
export function FehlerSeite() {
  const [satz1, satz2] = FEHLER_UNTERZEILE;
  return (
    <>
      <Seitenkopf
        variante="erzaehl"
        titelId={FEHLER_TITEL_ID}
        etikett={
          <>
            <span className="sr-only">{FEHLER_ETIKETT_SR}</span>
            {FEHLER_ETIKETT}
          </>
        }
        titel={FEHLER_TITEL}
        unterzeile={
          <>
            <span className="block">{satz1}</span> <span className="block">{satz2}</span>
          </>
        }
        einleitung={<p>{FEHLER_EINLEITUNG}</p>}
        aktion={FEHLER_AKTION}
        mikrotext={FEHLER_MIKROTEXT}
        zweitweg={FEHLER_ZWEITWEG}
        masse={FEHLER_MASSE}
        panel={<FehlerZeichnung />}
        className={styles.kopf}
      />

      <Section tone="wand" trenner="62%" aria-labelledby={DIREKT_TITEL_ID}>
        <Container className={styles.raster}>
          <SectionHeader
            id={DIREKT_TITEL_ID}
            eyebrow={DIREKT_ETIKETT}
            title={DIREKT_TITEL}
            lead={DIREKT_EINLEITUNG}
            className={styles.kopfzeile}
          />

          <div className={styles.kontakt}>
            <p className="text-etikett text-ink-2">Dein Ansprechpartner</p>
            <p className={styles.person}>
              <span className="text-title-3 text-brand">{FEHLER_ANSPRECHPARTNER.name}</span>
              <span className="text-callout text-ink-2">{FEHLER_ANSPRECHPARTNER.role}</span>
            </p>
            <ContactOptions variant="list" whatsappMessage={FEHLER_WHATSAPP} />
          </div>

          <nav aria-labelledby="fehler-wege-titel" className={styles.wege}>
            <h3 id="fehler-wege-titel" className="text-etikett text-ink-2">
              Weitere Wege
            </h3>
            <ul className={styles.wegListe}>
              {FEHLER_WEGE.map((weg) => (
                <li key={weg.href}>
                  <Link href={weg.href} className={`${styles.schild} rounded-1 text-etikett`} data-motion="druck">
                    <span>{weg.label}</span>
                    <Icon name="arrow-right" size="sm" className={styles.schildPfeil} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </Section>
    </>
  );
}
