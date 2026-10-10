import type { ReactNode } from 'react';
import { Seitenkopf } from '@/components/seitenkopf';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Prose } from '@/components/ui/Prose';
import { Leitungstrenner } from '@/components/zeichnung/Leitungstrenner';
import { BREADCRUMB_HOME } from '@/lib/content/breadcrumbs';
import { DruckKnopf } from './DruckKnopf';
import { RechtInhalt, type RechtInhaltEintrag } from './RechtInhalt';
import styles from './recht.module.css';

export interface RechtDokumentProps {
  /** h1 der Seite (lange Wörter mit weicher Trennstelle, z. B. „Datenschutz­erklärung“). */
  titel: ReactNode;
  /** Aktuelle Stufe im Pfad, z. B. „Datenschutz“. */
  pfad: string;
  /** Unterzeile mit Rohrklammer, z. B. „Stand: Oktober 2026“. Ohne sie fasst die Klammer die h1. */
  stand?: ReactNode;
  /** Einleitung im Fließtext unter dem Kopf. */
  einleitung?: ReactNode;
  /** Abschnitte in der Reihenfolge der Seite; Verzeichnis und Nummern der Kapitel kommen von hier. */
  inhalt: readonly RechtInhaltEintrag[];
  /** <RechtAbschnitt>-Kapitel in derselben Reihenfolge wie `inhalt`. */
  children: ReactNode;
}

/**
 * Rahmen für Datenschutz und Impressum (R5-RECHT-01, E-023): Pfad, der gemeinsame Seitenkopf in der Variante
 * `ruhig` (nur Papier: Etikett „Rechtliches“, h1 in Bricolage und Marken-Navy, Rohrklammer an der Stand-Zeile),
 * darunter Einleitung und Druckknopf, der Leitungstrenner als Übergang wie zwischen den Abschnitten der Startseite, dann
 * Verzeichnis und Text. Text in Prose (66 ch); ab 64em steht das Verzeichnis als mitlaufende Spalte links.
 *
 * Druck (E-RECHT-013): eigene benannte Druckseite `recht` mit Seitenrand (app/globals.css setzt `margin: 0`
 * für alle Seiten, das braucht nur die Bewerbungsmappe); Kopf und Fuß der Website, Pfad, Verzeichnis, Trenner
 * und Druckknopf fallen weg, es bleibt der Text mit Etikett, h1 und Stand.
 */
export function RechtDokument({ titel, pfad, stand, einleitung, inhalt, children }: RechtDokumentProps) {
  return (
    <div className={styles.dokument} data-recht="">
      <div className={styles.kopfzone}>
        <div className={`${styles.pfad} print-hidden`}>
          <Breadcrumbs items={[BREADCRUMB_HOME, { label: pfad }]} />
        </div>
        <Seitenkopf
          variante="ruhig"
          titelId="recht-titel"
          etikett="Rechtliches"
          titel={titel}
          unterzeile={stand}
          className={styles.kopf}
        />
        {/* Einleitung und Druckknopf unter dem Kopf, auf jeder Breite in dieser Reihenfolge */}
        <div className={styles.vorspann}>
          {einleitung ? <div className={`${styles.einleitung} text-ink-2`}>{einleitung}</div> : null}
          {/* Platz für den Knopf ist reserviert: er erscheint erst im Browser, ohne dass sich etwas verschiebt */}
          <div className={`${styles.druckzeile} print-hidden`}>
            <DruckKnopf />
          </div>
        </div>
      </div>

      <Leitungstrenner knick="62%" className={`${styles.trenner} print-hidden`} />

      <div className={styles.koerper}>
        <div className={styles.inhaltSpalte}>
          <RechtInhalt eintraege={inhalt} />
        </div>
        <Prose className={styles.text}>{children}</Prose>
      </div>
    </div>
  );
}
