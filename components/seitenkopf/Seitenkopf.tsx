/**
 * Seitenkopf (SEITENKOPF-01, E-023): der Kopf aller Unterseiten im Design des Einstiegs der Startseite.
 * Aus `components/home/einstieg` abgeleitet, nicht kopiert: Etikett in Versalien, h1 in Bricolage 800,
 * Unterzeile mit Rohrklammer, roter Knopf „Jetzt bewerben“, in den Vorlauf und Rücklauf münden, Maße in
 * Martian Mono mit Maßlinie, und eine Navy-Fläche (Inverse-Band) mit der Strichzeichnung der Seite.
 * Server-Komponente ohne Zustand und ohne Bewegung (nur `druck` am Knopf, Register lib/motion/register.ts).
 *
 * Aufbau
 * - Desktop (ab 64em): Papier links (Etikett, h1, Unterzeile, Einleitung, Knopf, Mikrotext, Zweitweg),
 *   Navy-Fläche rechts (Zeichnung, darunter die Maße). Das Leitungspaar läuft auf Knopfhöhe aus der
 *   Fläche in den Flansch des Knopfs.
 * - Handy: Navy-Block oben (Etikett, h1 weiß, Unterzeile, Zeichnung, Maße), darunter auf Papier der Knopf;
 *   Vorlauf und Rücklauf fallen aus dem Block senkrecht in den Knopf.
 * - Reihenfolge im DOM (Lesen, Tab): Etikett, h1, Unterzeile, Einleitung, Knopf, Mikrotext, Zweitweg,
 *   Zeichnung, Maße. Die Lage regelt das Raster in seitenkopf.module.css.
 *
 * Varianten
 * - `erzaehl`: wie der Einstieg, große Navy-Fläche, h1 in Bildgröße (text-display, an die Spalte gekoppelt).
 *   Für Stellenliste, Stellenseiten und 404.
 * - `arbeit`: schmale Navy-Fläche, h1 kleiner (text-title-1); am Handy ein knappes Navy-Band ohne
 *   Zeichnung (die Zeichnung erst ab 37.5em). Für Bewerbung, Danke und Mappe.
 * - `ruhig`: nur Papier mit Etikett, h1 und Rohrklammer (an der Unterzeile, sonst an der h1); `panel`,
 *   `masse` und das Leitungspaar entfallen. Für Datenschutz und Impressum.
 *
 * Einsatz
 * ```tsx
 * // erzaehl: Stellenseite mit Gehalt im Heizkreis
 * <Seitenkopf
 *   variante="erzaehl"
 *   etikett="Vollzeit · Wetzlar"
 *   titel={job.titleShy}
 *   unterzeile="Wärmepumpen, Heizung, Bad."
 *   einleitung={job.teaser}
 *   aktion={{ href: `/bewerbung?stelle=${job.slug}`, label: 'Jetzt bewerben' }}
 *   mikrotext="Dauert ca. 60 Sekunden. Kein Lebenslauf nötig."
 *   zweitweg={{ href: '#aufgaben', label: 'Aufgaben ansehen' }}
 *   masse={[{ wert: '13:30', name: 'Freitags Feierabend' }, { wert: '30', name: 'Tage Urlaub' }]}
 *   panel={<Heizkreis wert="3.600–4.600 €" name="Brutto im Monat" groesse="gross" />}
 * />
 *
 * // arbeit: Bewerbung, Danke, Mappe (ohne Knopf, wenn die Seite selbst das Formular ist)
 * <Seitenkopf
 *   variante="arbeit"
 *   etikett="Bewerbung · 60 Sekunden"
 *   titel="Jetzt bewerben."
 *   unterzeile="Ohne Lebenslauf. Diskret."
 *   panel={<HausKlein />}
 * />
 *
 * // ruhig: Recht
 * <Seitenkopf variante="ruhig" etikett="Rechtliches" titel="Datenschutz" unterzeile="Stand: Oktober 2026" />
 * ```
 *
 * Die h1 trägt `titelId` (Standard `seitenkopf-titel`); der Kopf zeigt mit aria-labelledby darauf. Eine h1
 * je Seite: Die Seite selbst setzt keine weitere.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { Masskette } from '@/components/zeichnung/Masskette';
import { Rohrklammer } from '@/components/zeichnung/Rohrklammer';
import { cn } from '@/lib/utils/cn';
import styles from './seitenkopf.module.css';

export type SeitenkopfVariante = 'erzaehl' | 'arbeit' | 'ruhig';

export interface SeitenkopfLink {
  href: string;
  label: string;
}

export interface SeitenkopfMass {
  /** Wert in Martian Mono, z. B. „13:30“, „35 km“, „3.600–4.600 €“ (geschützte Leerzeichen setzt der Aufrufer). */
  wert: string;
  /** Name in Versalien (text-etikett), z. B. „Freitags Feierabend“. */
  name: string;
}

export interface SeitenkopfProps {
  variante: SeitenkopfVariante;
  /** Etikett über der h1 (Versalien, Martian Mono), z. B. „Seit 1926 · Wetzlar“. */
  etikett: ReactNode;
  /** h1, eine bis zwei Zeilen; lange Berufsnamen mit weichen Trennstellen (titleShy). */
  titel: ReactNode;
  /** Id der h1 (Standard `seitenkopf-titel`). */
  titelId?: string;
  /** Unterzeile in Bricolage mit Rohrklammer (Vorlauf oben, Rücklauf unten). */
  unterzeile?: ReactNode;
  /** Einleitung im Fließtext (Atkinson). */
  einleitung?: ReactNode;
  /** Hauptaktion: die eine rote Fläche der Seite; Vorlauf und Rücklauf münden in ihren Flansch. */
  aktion?: SeitenkopfLink;
  /** Mikrotext unter dem Knopf. */
  mikrotext?: ReactNode;
  /** Zweitweg als unterstrichener Textlink mit Pfeil (Anker `#…`: Pfeil nach unten, sonst nach rechts). */
  zweitweg?: SeitenkopfLink;
  /** Maße an der Zeichnung (Martian Mono mit Maßlinie), höchstens vier. */
  masse?: readonly SeitenkopfMass[];
  /** Zeichnung der Seite auf der Navy-Fläche (components/zeichnung). Entfällt in `ruhig`. */
  panel?: ReactNode;
  /** Weitere Inhalte unter der Aktion auf Papier (z. B. Sprungmarken); selten nötig. */
  children?: ReactNode;
  className?: string;
}

/** Interne Ziele über next/link, Anker, Telefon, Mail und fremde Ziele als einfacher Link. */
function istIntern(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

function Ziel({ href, className, children, ...rest }: { href: string; className: string; children: ReactNode; 'data-motion'?: string }) {
  return istIntern(href) ? (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

const TITEL_STUFE: Record<SeitenkopfVariante, string> = {
  erzaehl: 'text-display',
  arbeit: 'text-title-1',
  ruhig: 'text-title-1',
};

export function Seitenkopf({
  variante,
  etikett,
  titel,
  titelId = 'seitenkopf-titel',
  unterzeile,
  einleitung,
  aktion,
  mikrotext,
  zweitweg,
  masse,
  panel,
  children,
  className,
}: SeitenkopfProps) {
  const navy = variante !== 'ruhig';
  const mitMassen = navy && masse !== undefined && masse.length > 0;
  const mitPanel = navy && panel !== undefined && panel !== null;
  // Ohne Unterzeile fasst die Rohrklammer in `ruhig` die h1 selbst
  const klammerAmTitel = variante === 'ruhig' && !unterzeile;
  // Das letzte Wort und der Pfeil bleiben zusammen (kein Pfeil allein auf einer Zeile)
  const zweitwegTrenn = zweitweg ? zweitweg.label.lastIndexOf(' ') : -1;

  return (
    <header
      className={cn(styles.kopf, styles[variante], aktion && navy && styles.mitAktion, className)}
      data-seitenkopf={variante}
      aria-labelledby={titelId}
    >
      {navy ? <div className={styles.flaeche} data-tone="inverse" aria-hidden="true" /> : null}

      <div className={styles.titelblock} data-tone={navy ? 'inverse' : undefined}>
        <p className={cn(styles.etikett, 'text-etikett text-ink-2')}>{etikett}</p>
        <h1 id={titelId} className={cn(styles.titel, TITEL_STUFE[variante], 'text-brand', klammerAmTitel && styles.mitKlammer)}>
          {klammerAmTitel ? (
            <span className={styles.klammer}>
              <Rohrklammer />
            </span>
          ) : null}
          {titel}
        </h1>
        {unterzeile ? (
          <p className={cn(styles.unterzeile, styles.mitKlammer, 'text-title-3 text-ink-2')}>
            <span className={styles.klammer}>
              <Rohrklammer />
            </span>
            {unterzeile}
          </p>
        ) : null}
      </div>

      {einleitung ? <div className={cn(styles.einleitung, 'text-ink')}>{einleitung}</div> : null}

      {aktion || mikrotext || zweitweg || children ? (
        <div className={styles.aktionsblock} data-primary-cta={aktion ? '' : undefined}>
          {aktion ? (
            <Ziel href={aktion.href} className={cn(styles.aktion, 'rounded-1')} data-motion="druck">
              <span>{aktion.label}</span>
              <Icon name="arrow-right" size="md" />
            </Ziel>
          ) : null}
          {mikrotext ? <p className={cn(styles.mikro, 'text-ink-2')}>{mikrotext}</p> : null}
          {zweitweg ? (
            <Ziel href={zweitweg.href} className={cn(styles.zweitweg, 'rounded-1')} data-motion="druck">
              {zweitwegTrenn > 0 ? `${zweitweg.label.slice(0, zweitwegTrenn)} ` : null}
              <span className={styles.zusammen}>
                {zweitweg.label.slice(zweitwegTrenn + 1)}
                <Icon name={zweitweg.href.startsWith('#') ? 'arrow-down' : 'arrow-right'} size={18} className={styles.zweitwegIkon} />
              </span>
            </Ziel>
          ) : null}
          {children}
        </div>
      ) : null}

      {/* Leitungspaar: am Handy fällt es aus der Navy-Fläche in den Knopf, am Desktop läuft es auf Knopfhöhe
          aus der Fläche in den Flansch. Zwei Teile, damit der Abschnitt auf Navy die Inverse-Farben trägt. */}
      {aktion && navy ? (
        <div className={styles.leitung} aria-hidden="true" data-zeichnung="seitenkopf-leitung">
          <span className={styles.leitungPapier} />
          <span className={styles.leitungNavy} data-tone="inverse" />
        </div>
      ) : null}

      {mitPanel || mitMassen ? (
        <div className={styles.panel} data-tone="inverse">
          {mitPanel ? <div className={styles.bild}>{panel}</div> : null}
          {mitMassen ? (
            <ul className={styles.masse}>
              {masse.slice(0, 4).map((mass) => (
                <li key={`${mass.wert}-${mass.name}`} className={styles.mass}>
                  <Masskette wert={mass.wert} name={mass.name} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
