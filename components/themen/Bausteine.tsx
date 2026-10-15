import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/home/SectionHeader';
import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section, type SectionTone } from '@/components/layout/Section';
import { ContactOptions } from '@/components/site/ContactOptions';
import { CardLink } from '@/components/ui/Card';
import { TextLink } from '@/components/ui/TextLink';
import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import { RohrAkzent } from '@/components/zeichnung/RohrAkzent';
import { breitestesStueckEm } from '@/components/einsatzgebiet/titel';
import { ANSPRECHPARTNER } from '@/components/jobs/stelle/stelle-text';
import { geschuetzt, type Kasten, type Kopfzeile, type Satz, type SeitenBasis, type ThemaKarte } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import styles from './stil';

/** Id der h2 eines Abschnitts (aria-labelledby). */
export const titelId = (id: string) => `${id}-titel`;

/**
 * Abschnittskopf der Themenseiten: SectionHeader der Startseite (Etikett, h2 in Bricolage, Lead), die h2 nach ihrem
 * breitesten Wort auf die Spalte gesetzt („Kündigungsfrist,“ bricht bei 320 px nicht im Wort), wie auf den Ortsseiten.
 * Mit `klammer` fasst die Rohrklammer die h2 (E-031, K-003.2: zurück an den Abschnittsköpfen).
 */
export function Kopf({ kopf, klammer = false, className }: { kopf: Kopfzeile; klammer?: boolean; className?: string }) {
  return (
    <SectionHeader
      id={titelId(kopf.id)}
      eyebrow={kopf.etikett}
      klammer={klammer}
      className={cn(styles.abschnittskopf, className)}
      title={
        <span className={styles.passend} style={{ '--stueck': breitestesStueckEm(kopf.heading).toFixed(3) } as CSSProperties}>
          {kopf.heading}
        </span>
      }
      lead={kopf.lead?.text}
    />
  );
}

/** Sätze als Absätze; der erste optional etwas größer (Lead). */
export function Saetze({ saetze, lead = false }: { saetze: readonly Satz[]; lead?: boolean }) {
  return (
    <>
      {saetze.map((satz, i) => (
        <p key={satz.text} className={cn(styles.absatz, lead && i === 0 && styles.absatzErst)}>
          {geschuetzt(satz.text)}
        </p>
      ))}
    </>
  );
}

/**
 * Abschnitt mit Kopf und Inhalt. Abschnitte trennt der Flächenwechsel (Papier, Wand, Navy); folgen zwei Abschnitte im
 * selben Ton, setzt `trenner` eine feine Linie an die Oberkante (seit E-029 statt des Leitungstrenners; die Lage des
 * Knicks, z. B. "62%", gibt es nicht mehr und wird übergangen).
 */
export function Abschnitt({
  kopf,
  tone = 'papier',
  trenner,
  klammer = false,
  children,
  className,
}: {
  kopf: Kopfzeile;
  tone?: SectionTone;
  trenner?: boolean | string;
  /** Rohrklammer an der h2 (E-031). */
  klammer?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Section id={kopf.id} tone={tone} className={trenner ? styles.linie : undefined} aria-labelledby={titelId(kopf.id)}>
      <Container className={cn('flex flex-col gap-section-sm', className)}>
        <Kopf kopf={kopf} klammer={klammer} />
        {children}
      </Container>
    </Section>
  );
}

/**
 * Band auf Navy (Inverse): je Eintrag das Etiketten-Kästchen mit Icon und Titel, der Satz darunter. Raster mit
 * Unterzeilen (subgrid): Kästchen auf einer Höhe, Sätze auf einer Höhe (Review Phase 2, Punkt 8). Satz und „Gehört zu“
 * teilen sich die zweite Zeile in einem gemeinsamen Element: Das Subgrid hat genau zwei Zeilen, ein drittes Kind
 * läge sonst über dem Satz (Prüfung E-029, Runde 2, Befund 13).
 */
export function Kaestenband({ kopf, kaesten }: { kopf: Kopfzeile; kaesten: readonly Kasten[] }) {
  const mitSatz = kaesten.every((kasten) => kasten.text !== null);
  return (
    <Section id={kopf.id} tone="band" aria-labelledby={titelId(kopf.id)}>
      <Container className="flex flex-col gap-section-sm">
        <Kopf kopf={kopf} />
        <ul className={cn(styles.kaesten, kaesten.length === 3 ? styles.kaestenDrei : styles.kaestenVier, !mitSatz && styles.kaestenKurz)}>
          {kaesten.map((kasten) => (
            <li key={kasten.titel} className={styles.kasten}>
              <RohrAkzent />
              <Etikettkasten icon={kasten.icon} className="whitespace-normal">
                {kasten.titel}
              </Etikettkasten>
              {(mitSatz && kasten.text) || kasten.giltFuer ? (
                <div className={styles.kastenFuss}>
                  {mitSatz && kasten.text ? <p className={styles.kastenText}>{geschuetzt(kasten.text)}</p> : null}
                  {kasten.giltFuer ? (
                    <p className={cn(styles.giltFuer, 'text-etikett text-ink-muted')}>
                      Gehört zu: <span className={styles.giltFuerStellen}>{kasten.giltFuer.join(' · ')}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/**
 * Themen als Leitungsabgänge (Variante 1 „Stellen als Leitungsabgänge“, wie die Stellenliste): links läuft der Vorlauf,
 * rechts der Rücklauf, jedes Thema ist ein Kreis dazwischen. Die ganze Zeile ist der Link zum Thema (CardLink).
 */
export function ThemenAbgaenge({ karten, label }: { karten: readonly ThemaKarte[]; label: string }) {
  return (
    <ul className={styles.abgaenge} aria-label={label}>
      {karten.map((karte) => (
        <li key={karte.id} className={styles.abgang}>
          <span aria-hidden="true" className={styles.stummelVor} />
          <span aria-hidden="true" className={styles.stummelRueck} />
          <div className={styles.abgangZeile} data-motion="druck">
            <span aria-hidden="true" className={styles.abgangFlaeche} data-motion="flaeche" />
            <span className={styles.abgangIkon} aria-hidden="true">
              <Icon name={karte.icon} size="lg" />
            </span>
            <div className={styles.abgangText}>
              <h3 className="text-title-3 text-brand">
                <CardLink href={karte.href} className="after:rounded-none focus-visible:after:outline-3 focus-visible:after:-outline-offset-3">
                  {karte.name}
                </CardLink>
              </h3>
              <p className={styles.abgangSatz}>{geschuetzt(karte.satz.text)}</p>
            </div>
            {karte.wert ? (
              <p className={styles.abgangWert}>
                <span className="font-mass text-lead font-medium text-brand">{karte.wert}</span>
                {karte.wertName ? <span className="text-etikett text-ink-muted">{karte.wertName}</span> : null}
              </p>
            ) : null}
            <Icon name="arrow-right" size="lg" className="shrink-0 text-brand" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** „Weitere Themen“ am Ende jeder Themenseite: Karten der übrigen Themen und der Weg zum Hub. */
export function WeitereThemen({ weitere }: { weitere: SeitenBasis['weitere'] }) {
  return (
    <Abschnitt kopf={weitere.kopf} tone="wand" trenner>
      <ul className={styles.karten} aria-label={weitere.kopf.heading}>
        {weitere.karten.map((karte) => (
          <li key={karte.id}>
            <Link href={karte.href} className={styles.karte} data-motion="druck">
              <span className={styles.karteIkon} aria-hidden="true">
                <Icon name={karte.icon} size="md" />
              </span>
              <span className={styles.karteName}>{karte.name}</span>
              {karte.kurz ? <span className={styles.karteWert}>{karte.kurz}</span> : null}
              <Icon name="arrow-right" size="md" className={styles.kartePfeil} />
            </Link>
          </li>
        ))}
      </ul>
      {weitere.hub ? (
        <TextLink href={weitere.hub.href} standalone className="self-start">
          {weitere.hub.label}
          <Icon name="arrow-right" size="sm" className="shrink-0" />
        </TextLink>
      ) : null}
    </Abschnitt>
  );
}

/** Kontakt mit vorbereiteter WhatsApp-Nachricht zum Thema (an COMPANY.whatsapp). */
export function Kontakt({ kontakt, whatsapp }: { kontakt: SeitenBasis['kontakt']; whatsapp: string }) {
  const id = titelId(kontakt.kopf.id);
  return (
    <Section id={kontakt.kopf.id} tone="papier" aria-labelledby={id}>
      <Container className={styles.kontakt}>
        <SectionHeader id={id} eyebrow={kontakt.kopf.etikett} title={kontakt.kopf.heading} lead={kontakt.text} />
        <ContactOptions variant="card" person={ANSPRECHPARTNER} whatsappMessage={whatsapp} />
      </Container>
    </Section>
  );
}
