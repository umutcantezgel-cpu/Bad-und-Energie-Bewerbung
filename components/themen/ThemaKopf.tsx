import type { CSSProperties, ReactNode } from 'react';
import { breitestesStueckEm } from '@/components/einsatzgebiet/titel';
import { LISTEN_MIKROTEXT } from '@/components/jobs/liste/liste-text';
import { Seitenkopf } from '@/components/seitenkopf';
import { Pfad } from '@/components/seitenkopf/Pfad';
import { APPLY_PATH, SHORT_APPLY_LABEL } from '@/components/site/nav';
import type { SeitenPfad } from '@/lib/themen/jsonld';
import { pfadItems } from '@/lib/themen/jsonld';
import type { SeitenBasis } from '@/lib/themen/text';
import { Saetze } from './Bausteine';
import styles from './stil';

export interface ThemaKopfProps {
  text: SeitenBasis;
  pfad: SeitenPfad;
  /** Zeichnung der Seite auf der Navy-Fläche (Signatur). */
  panel: ReactNode;
  /** Die Zeichnung braucht die ganze Breite des Panels (am Tablet über den Maßen). */
  bildBreit?: boolean;
}

/**
 * Kopf der Themenseiten (E-028, Erzählseite wie Stellen- und Ortsseiten): Pfad, dann der Seitenkopf `erzaehl` mit
 * Etikett, h1 in Bildgröße (nach dem breitesten Wort auf die Spalte gesetzt, bricht bei 320 px nie im Wort),
 * Unterzeile (seit E-029 ohne Rohrklammer), Einleitung, „Jetzt bewerben“ (/bewerbung) und Zweitweg zum ersten Abschnitt; rechts
 * bzw. oben die Zeichnung der Seite auf Navy mit den Maßen. Das Leitungspaar läuft beim Laden in den Knopf
 * (Register `erdleitung`).
 */
export function ThemaKopf({ text, pfad, panel, bildBreit = false }: ThemaKopfProps) {
  return (
    <>
      <Pfad items={pfadItems(pfad)} />
      <div className={styles.kopf} data-motion="erdleitung">
        <Seitenkopf
          variante="erzaehl"
          bildBreit={bildBreit}
          etikett={text.etikett}
          titel={
            <span className={styles.titel} style={{ '--stueck': breitestesStueckEm(text.meta.h1).toFixed(3) } as CSSProperties}>
              {text.meta.h1}
            </span>
          }
          unterzeile={
            text.unterzeile.length > 1 ? (
              <>
                {text.unterzeile.map((zeile, i) => (
                  <span key={zeile} className="block">
                    {zeile}
                    {i < text.unterzeile.length - 1 ? ' ' : null}
                  </span>
                ))}
              </>
            ) : (
              text.unterzeile[0]
            )
          }
          einleitung={<Saetze saetze={text.einleitung} />}
          aktion={{ href: APPLY_PATH, label: SHORT_APPLY_LABEL }}
          mikrotext={LISTEN_MIKROTEXT}
          zweitweg={text.zweitweg}
          // Am Handy ohne Maße: Jedes Maß steht auch im Text, in der Zeichnung oder in einem Abschnitt der Seite, und der
          // Knopf bleibt nah am Kopf (Review Phase 2, Punkt 29).
          masse={text.masse.map((mass) => ({ ...mass, nurBreit: true }))}
          panel={panel}
        />
      </div>
    </>
  );
}
