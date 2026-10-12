import type { CSSProperties } from 'react';
import Link from 'next/link';
import { SectionHeader, type SectionHeaderProps } from '@/components/home/SectionHeader';
import { Icon } from '@/components/icons';
import { vorteilIcon } from '@/components/jobs/stelle/stelle-text';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ContactOptions } from '@/components/site/ContactOptions';
import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import { FACTS, type FactId } from '@/lib/content/facts';
import { formatAirKm, formatKm, formatMin, type TextBlock, type TextSection } from '@/lib/places/text';
import { cn } from '@/lib/utils/cn';
import { ANSPRECHPARTNER, ETIKETT, TABELLE } from './einsatzgebiet-text';
import { breitestesStueckEm } from './titel';
import styles from './einsatzgebiet.module.css';

/** Id der Überschrift eines Abschnitts (aria-labelledby). */
export const titelId = (id: string) => `${id}-titel`;

/**
 * Abschnittskopf der lokalen Seiten: SectionHeader der Startseite, die h2 aber nach ihrem breitesten Wort auf die
 * Spalte gesetzt („Dein Weg aus Münchholzhausen“ bricht bei 320 px nicht im Wort und läuft nicht über), wie die h1
 * (titel.ts).
 */
export function Abschnittskopf({ title, className, ...props }: Omit<SectionHeaderProps, 'title'> & { title: string }) {
  return (
    <SectionHeader
      {...props}
      className={cn(styles.abschnittskopf, className)}
      title={
        <span className={styles.passend} style={{ '--stueck': breitestesStueckEm(title).toFixed(3) } as CSSProperties}>
          {title}
        </span>
      }
    />
  );
}

/** Die Blöcke eines Abschnitts als Absätze; der erste etwas größer (Lead). */
export function Absaetze({ blocks, lead = false }: { blocks: readonly TextBlock[]; lead?: boolean }) {
  return (
    <>
      {blocks.map((block, i) => (
        <p key={block.text} className={cn(styles.absatz, lead && i === 0 && styles.absatzErst)}>
          {block.text}
        </p>
      ))}
    </>
  );
}

/** Hinweis zur Messung (gemeinsamer Block): klein, mit Strich links. */
export function Messhinweis({ text }: { text: string }) {
  return (
    <p className={styles.hinweis}>
      <Icon name="radius" size="md" className="shrink-0 text-brand" />
      <span>{text}</span>
    </p>
  );
}

/** Teilt die Blöcke eines Abschnitts in ortsbezogene und gemeinsame. */
export function bloecke(section: TextSection | undefined): { ort: TextBlock[]; gemeinsam: TextBlock[] } {
  const blocks = section?.blocks ?? [];
  return { ort: blocks.filter((b) => b.kind === 'ort'), gemeinsam: blocks.filter((b) => b.kind === 'gemeinsam') };
}

/** Band „Was überall gilt“ (Inverse): je Fakt das Etiketten-Kästchen mit Kurzform und der ganze Satz darunter. */
export function Faktenband({ section, factIds }: { section: TextSection; factIds: readonly FactId[] }) {
  const id = titelId(section.id);
  return (
    <Section tone="band" aria-labelledby={id}>
      <Container className="flex flex-col gap-section-sm">
        <Abschnittskopf id={id} eyebrow={ETIKETT.band} title={section.heading} />
        <ul className={cn(styles.fakten, factIds.length >= 4 ? styles.faktenVier : styles.faktenDrei)}>
          {factIds.map((factId) => (
            <li key={factId} className={styles.fakt}>
              <Etikettkasten icon={vorteilIcon(factId)} className="whitespace-normal">
                {FACTS[factId].short}
              </Etikettkasten>
              {FACTS[factId].long !== `${FACTS[factId].short}.` ? <p className={styles.faktText}>{FACTS[factId].long}</p> : null}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Kontakt mit vorbereiteter WhatsApp-Nachricht (nennt den Ort bzw. den Kreis). */
export function Kontakt({ section, whatsappMessage }: { section: TextSection; whatsappMessage: string }) {
  const id = titelId(section.id);
  const text = section.blocks.map((block) => block.text).join(' ');
  return (
    <Section tone="papier" trenner aria-labelledby={id}>
      <Container className={styles.kontakt}>
        <Abschnittskopf id={id} eyebrow={ETIKETT.kontakt} title={section.heading} lead={text} klammer />
        <ContactOptions variant="card" person={ANSPRECHPARTNER} whatsappMessage={whatsappMessage} />
      </Container>
    </Section>
  );
}

export interface OrtsKarteDaten {
  id: string;
  name: string;
  href: string;
  /** Werte in Martian Mono, z. B. „4,5 km Luftlinie“, „27 km · 26 min zum Firmensitz“. */
  werte: readonly string[];
}

/** Ortskarten mit Link zur Ortsseite (Nachbarn, Stadtteile, Orte eines kleinen Kreises). */
export function OrtsKarten({ orte, label, breit = false }: { orte: readonly OrtsKarteDaten[]; label: string; breit?: boolean }) {
  return (
    <ul className={cn(styles.ortsKarten, breit && styles.ortsKartenBreit)} aria-label={label}>
      {orte.map((ort) => (
        <li key={ort.id}>
          <Link href={ort.href} className={styles.ortsKarte} data-motion="druck">
            <span className={styles.ortsKarteName}>{ort.name}</span>
            <span className={styles.ortsKarteWerte}>
              {ort.werte.map((wert) => (
                <span key={wert} className="whitespace-nowrap">
                  {wert}
                </span>
              ))}
            </span>
            <Icon name="arrow-right" size="md" className={styles.ortsKartePfeil} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Werte einer Ortskarte: Strecke und Fahrzeit zum Firmensitz, dazu optional die Luftlinie vom aktuellen Ort. */
export function kartenWerte(distanceKm: number, minutes: number, luftlinieKm?: number): string[] {
  const weg = `${formatKm(distanceKm)} · ${formatMin(minutes)}`;
  return luftlinieKm === undefined ? [weg] : [`${formatAirKm(luftlinieKm)} Luftlinie`, weg];
}

export interface TabellenZeile {
  placeId: string;
  name: string;
  href: string;
  postalCode: string;
  km: string;
  min: string;
  distanceKm: number;
}

/** Ende der Skala (Gebietsregel, Fakt radius35). */
const SKALA_KM = 35;

/** Ortstabelle (Kreis-Hub): Ort mit Link, PLZ, Strecke, Fahrzeit; nach Strecke. */
export function Ortstabelle({ zeilen, caption }: { zeilen: readonly TabellenZeile[]; caption: string }) {
  return (
    <div className={styles.tabelleRahmen}>
      <table className={styles.tabelle}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{TABELLE.ort}</th>
            <th scope="col" className={styles.plzSpalte}>
              {TABELLE.plz}
            </th>
            <th scope="col" className={styles.zahl}>
              {TABELLE.km}
            </th>
            <th scope="col" className={styles.zahl}>
              {TABELLE.min}
            </th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((zeile) => (
            <tr key={zeile.placeId}>
              <th scope="row" className="text-left font-normal">
                <Link href={zeile.href} className={styles.tabellenLink}>
                  {zeile.name}
                </Link>
                <span className={styles.plzUnter}>{zeile.postalCode}</span>
              </th>
              <td className={cn(styles.plzSpalte, 'font-mass text-ink-muted')}>{zeile.postalCode}</td>
              <td className={cn(styles.zahl, 'text-ink')}>
                <span className={styles.strecke}>
                  {/* Strecke als Balken auf der 35-km-Skala (ab 48em, dekorativ) */}
                  <span
                    className={styles.balken}
                    style={{ '--anteil': Math.min(zeile.distanceKm, SKALA_KM) / SKALA_KM } as CSSProperties}
                    aria-hidden="true"
                  />
                  {zeile.km}
                </span>
              </td>
              <td className={cn(styles.zahl, 'text-ink')}>{zeile.min}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
