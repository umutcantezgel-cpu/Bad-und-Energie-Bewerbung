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

/**
 * Fakten ohne eigenen Satz (der lange Text ist nur die Kurzform mit Punkt) tragen den Satz eines belegten
 * Begleitfakts, wie die Zusage „Flexible Arbeitszeiten“ auf der Startseite (components/home/vorteile/vorteile-text.ts
 * ZUSAGEN): „Keine unbezahlten Überstunden.“ Keine neue Aussage, nur die Paarung der Startseite.
 */
export const FAKT_BEGLEITER: Readonly<Partial<Record<FactId, FactId>>> = Object.freeze({ flexibleHours: 'noUnpaidOvertime' });

/** Satz unter dem Kästchen: der eigene lange Text, sonst der des Begleitfakts; null, wenn keiner belegt ist. */
export function faktSatz(factId: FactId): string | null {
  const eigen = FACTS[factId].long;
  if (eigen !== `${FACTS[factId].short}.`) return eigen;
  const begleiter = FAKT_BEGLEITER[factId];
  return begleiter ? FACTS[begleiter].long : null;
}

/**
 * Band „Was überall gilt“ (Inverse): je Fakt das Etiketten-Kästchen mit Kurzform und der Satz darunter, in einem
 * Raster mit Unterzeilen (subgrid): Kästchen auf einer Höhe, Sätze auf einer Höhe. Fehlt einem Fakt der Satz, steht
 * das Band nur mit Kästchen, damit kein Platz leer bleibt.
 */
export function Faktenband({ section, factIds }: { section: TextSection; factIds: readonly FactId[] }) {
  const id = titelId(section.id);
  const saetze = factIds.map(faktSatz);
  const mitSatz = saetze.every((satz) => satz !== null);
  return (
    <Section tone="band" aria-labelledby={id}>
      <Container className="flex flex-col gap-section-sm">
        <Abschnittskopf id={id} eyebrow={ETIKETT.band} title={section.heading} />
        <ul className={cn(styles.fakten, factIds.length >= 4 ? styles.faktenVier : styles.faktenDrei, !mitSatz && styles.faktenKurz)}>
          {factIds.map((factId, i) => (
            <li key={factId} className={styles.fakt}>
              <Etikettkasten icon={vorteilIcon(factId)} className="whitespace-normal">
                {FACTS[factId].short}
              </Etikettkasten>
              {mitSatz ? <p className={styles.faktText}>{saetze[i]}</p> : null}
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
  /** Werte in Martian Mono, z. B. „4,5 km von Lahnau“, „27 km · 26 min zum Firmensitz“. */
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
                <span key={wert}>{wert}</span>
              ))}
            </span>
            <Icon name="arrow-right" size="md" className={styles.ortsKartePfeil} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Abstand einer Ortskarte vom aktuellen Ort (Luftlinie). */
export interface KartenAbstand {
  km: number;
  /** Der aktuelle Ort: „5,8 km von Bad Endbach“. */
  von: string;
}

/**
 * Werte einer Ortskarte, jeder mit seinem Bezugspunkt (Kritik 2, P2-2: „5,8 km Luftlinie“ galt ab dem Ort, „31 km ·
 * 34 min“ bis zum Firmensitz, ohne dass die Karte es sagte): optional der Abstand vom aktuellen Ort, dann Strecke und
 * Fahrzeit zum Firmensitz.
 */
export function kartenWerte(distanceKm: number, minutes: number, abstand?: KartenAbstand): string[] {
  const weg = `${formatKm(distanceKm)} · ${formatMin(minutes)} zum Firmensitz`;
  return abstand === undefined ? [weg] : [`${formatAirKm(abstand.km)} von ${abstand.von}`, weg];
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
                  <span className={styles.kmWert}>{zeile.km}</span>
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
