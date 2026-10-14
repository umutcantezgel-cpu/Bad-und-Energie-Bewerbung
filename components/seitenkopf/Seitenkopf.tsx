/**
 * Seitenkopf (SEITENKOPF-01, E-023): der Kopf aller Unterseiten im Design des Einstiegs der Startseite.
 * Aus `components/home/einstieg` abgeleitet, nicht kopiert: Etikett in Versalien, h1 in Bricolage 800,
 * Unterzeile, roter Knopf „Jetzt bewerben“, in den Vorlauf und Rücklauf münden, Maße in Martian Mono mit
 * Maßlinie, und eine Navy-Fläche (Inverse-Band) mit der technischen Zeichnung der Seite. Seit E-029 trägt keine
 * Rohrklammer mehr den Kopf von erzaehl und arbeit: Etikett und h1 reichen (wie im Einstieg).
 * Server-Komponente ohne Zustand und ohne Bewegung (nur `druck` am Knopf, Register lib/motion/register.ts).
 *
 * Aufbau
 * - Desktop (ab 64em): Papier links (Etikett, h1, Unterzeile, Einleitung, Knopf, Mikrotext, Zweitweg),
 *   Navy-Fläche rechts (Zeichnung, darunter die Maße). Das Leitungspaar läuft auf Knopfhöhe aus der
 *   Fläche in den Flansch des Knopfs.
 * - Handy: Navy-Block oben (Etikett, h1 weiß, Unterzeile, Zeichnung, Maße), darunter auf Papier der Knopf;
 *   Vorlauf und Rücklauf fallen aus dem Block senkrecht in den Knopf.
 * - Reihenfolge im DOM (Lesen, Tab): Etikett, h1, Unterzeile, Zeichnung, Maße, Leitungspaar (dekorativ),
 *   Einleitung, Knopf, Mikrotext, Zweitweg. Bis zum Knopf ist das die Folge am Handy; die Einleitung bleibt vor dem
 *   Knopf wie am Desktop. Die Lage regelt das Raster in seitenkopf.module.css (am Desktop das Panel rechts). So
 *   kommt ein Bedienelement im Panel („Anhalten“) vor dem Knopf, wo es am Handy auch steht (Prüfung E-029,
 *   WCAG 2.4.3), und der Knopf rutscht nicht nach, wenn der Kopf in Stücken ankommt.
 *
 * Varianten
 * - `erzaehl`: wie der Einstieg, große Navy-Fläche, h1 in Bildgröße (text-display, an die Spalte gekoppelt).
 *   Für Stellenliste, Stellenseiten und 404.
 * - `arbeit`: schmale Navy-Fläche, h1 kleiner (text-title-1); am Handy ein knappes Navy-Band ohne
 *   Zeichnung (die Zeichnung erst ab 37.5em). Für Bewerbung, Danke und Mappe.
 * - `ruhig`: nur Papier mit Etikett, h1 und Rohrklammer (an der Unterzeile, sonst an der h1); `panel`,
 *   `masse` und das Leitungspaar entfallen. Für Datenschutz und Impressum (die Rechtsseiten stellen erst mit
 *   ihrem eigenen Paket um; bis dahin bleibt die Klammer nur hier).
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
 *
 * Erstes Bild nur mit ganzem Kopf (V6-A3-VITALS, CLS): Bis E-029 standen Zeichnung und Maße im DOM hinter dem Knopf,
 * am Handy aber darüber; malte der Browser ein Teildokument, rutschte der Knopf nach (CLS 0,08 bis 0,12). Seit der
 * Prüfung E-029 steht alles, was am Handy über dem Knopf liegt, auch im DOM davor. `<link rel="expect"
 * blocking="render">` (React hebt es in den <head>) bleibt als Sicherung für die Einleitung unter dem Knopf: Es hält
 * das erste Bild an, bis die Marke am Ende des Kopfs geparst ist; Browser ohne die Funktion übergehen es.
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
  /**
   * Nur ab 37.5em (Tablet, Desktop): am Handy ausgeblendet, damit der Knopf nicht unter den Navy-Block rutscht. Nur für
   * Maße, die die Seite auch im Text oder in der Zeichnung nennt.
   */
  nurBreit?: boolean;
  /** Größe des Werts (Masskette): `gross` in der Zahlenstufe wie die großen Maße des Einstiegs (404-Seite). */
  groesse?: 'normal' | 'gross';
}

export interface SeitenkopfProps {
  variante: SeitenkopfVariante;
  /** Etikett über der h1 (Versalien, Martian Mono), z. B. „Seit 1926 · Wetzlar“. */
  etikett: ReactNode;
  /** h1, eine bis zwei Zeilen; lange Berufsnamen mit weichen Trennstellen (titleShy). */
  titel: ReactNode;
  /** Id der h1 (Standard `seitenkopf-titel`). */
  titelId?: string;
  /** Unterzeile in Bricolage (in `ruhig` mit Rohrklammer, Vorlauf oben, Rücklauf unten). */
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
  /**
   * Maße am Desktop in zwei gleich breiten Spalten, lange Namen brechen um („Weitester Ort: Bad Endbach“). Für vier
   * Maße mit langen Namen (Gebiets- und Kreisseite), die sonst in drei Zeilen unter die Zeichnung laufen.
   */
  masseZweispaltig?: boolean;
  /**
   * Die Zeichnung braucht die ganze Breite des Panels (Pendelweg, Gebietsplan, senkrechte Entfernungsleiste): am Tablet
   * steht sie über den Maßen statt daneben, wo sie sonst auf wenige Pixel schrumpft.
   */
  bildBreit?: boolean;
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
  masseZweispaltig = false,
  bildBreit = false,
  panel,
  children,
  className,
}: SeitenkopfProps) {
  const navy = variante !== 'ruhig';
  const mitMassen = navy && masse !== undefined && masse.length > 0;
  const mitPanel = navy && panel !== undefined && panel !== null;
  // Rohrklammer nur noch in `ruhig` (E-029): an der Unterzeile, ohne Unterzeile an der h1
  const klammerAmTitel = variante === 'ruhig' && !unterzeile;
  const klammerAmUnterzeile = variante === 'ruhig';
  // Das letzte Wort und der Pfeil bleiben zusammen (kein Pfeil allein auf einer Zeile)
  const zweitwegTrenn = zweitweg ? zweitweg.label.lastIndexOf(' ') : -1;
  const endeId = `${titelId}-ende`;

  return (
    <header
      className={cn(styles.kopf, styles[variante], aktion && navy && styles.mitAktion, bildBreit && styles.bildBreit, className)}
      data-seitenkopf={variante}
      aria-labelledby={titelId}
    >
      <link rel="expect" href={`#${endeId}`} blocking="render" />
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
          <p className={cn(styles.unterzeile, klammerAmUnterzeile && styles.mitKlammer, 'text-title-3 text-ink-2')}>
            {klammerAmUnterzeile ? (
              <span className={styles.klammer}>
                <Rohrklammer />
              </span>
            ) : null}
            {unterzeile}
          </p>
        ) : null}
      </div>

      {/* Zeichnung und Maße gleich nach dem Titel, wie am Handy (dort über dem Knopf): Ein Bedienelement im Panel
          („Anhalten“ der Dauerbewegung) kommt so in der Tab-Folge vor dem Knopf, nicht danach (WCAG 2.4.3). Am
          Desktop setzt das Raster das Panel rechts neben den Text. */}
      {mitPanel || mitMassen ? (
        <div className={styles.panel} data-tone="inverse">
          {mitPanel ? <div className={styles.bild}>{panel}</div> : null}
          {mitMassen ? (
            <ul className={cn(styles.masse, masseZweispaltig && styles.masseZweispaltig)}>
              {masse.slice(0, 4).map((mass) => (
                <li key={`${mass.wert}-${mass.name}`} className={cn(styles.mass, mass.nurBreit && styles.massNurBreit)}>
                  <Masskette wert={mass.wert} name={mass.name} groesse={mass.groesse} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Leitungspaar: am Handy fällt es aus der Navy-Fläche in den Knopf, am Desktop läuft es auf Knopfhöhe
          aus der Fläche in den Flansch. Zwei Teile, damit der Abschnitt auf Navy die Inverse-Farben trägt. Im DOM
          vor dem Knopf (Zeile 3 über Zeile 4): Kommt der Kopf in Stücken an, rutscht der Knopf nicht nach. */}
      {aktion && navy ? (
        <div className={styles.leitung} aria-hidden="true" data-zeichnung="seitenkopf-leitung">
          <span className={styles.leitungPapier} />
          <span className={styles.leitungNavy} data-tone="inverse" />
        </div>
      ) : null}

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

      <span id={endeId} hidden />
    </header>
  );
}
