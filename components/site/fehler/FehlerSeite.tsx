import Link from 'next/link';
import { Icon } from '@/components/icons';
import { SectionHeader } from '@/components/home/SectionHeader';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Seitenkopf } from '@/components/seitenkopf';
import { ContactOptions } from '@/components/site/ContactOptions';
import { OffeneLeitung } from '@/components/zeichnung/OffeneLeitung';
import { RohrAkzent } from '@/components/zeichnung/RohrAkzent';
import { cn } from '@/lib/utils/cn';
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

/** Id der h1; der Seitenkopf zeigt per aria-labelledby darauf. */
export const FEHLER_TITEL_ID = 'fehler-titel';
/** Id der h2 im Direktkontakt. */
export const DIREKT_TITEL_ID = 'direktkontakt-titel';

/*
 * Ohne eigenes CSS-Modul, nur mit Utilities (Prüfung E-029, Runde 2, Befund 8): Die 404-Seite ist die not-found-Grenze
 * jeder Seite. Ihr CSS-Modul wurde darum auf jeder Seite als eigener Chunk vorab geladen (`rel=preload as=style`) und
 * kostete beim FCP eine Runde (~150 ms bei Slow 4G). Geprüft im Build: scripts/qa/check-css-chunks.mjs.
 */

/**
 * Zeichnung der 404-Seite auf der Navy-Fläche (KERN K-010, B Runde 1): Vorlauf und Rücklauf kommen von links und
 * enden offen an einem Flansch, der Wegweiser zeigt ins Leere. Strich 3 px, `role="img"` mit Titel, ohne Bewegung.
 * Am Handy volle Breite und an die Unterzeile gerückt (die obere Fünftelhöhe ist Luft über dem Wegweiser), ab 37.5em
 * mittig im Panel.
 */
export function FehlerZeichnung() {
  return (
    <div className="-mt-6 w-full max-w-120 min-[37.5em]:mt-0">
      <OffeneLeitung />
    </div>
  );
}

/** Wegweiser-Schild wie die Etiketten-Kästchen der Zeichnung: Rahmen 3 px in Navy, Fläche Papier. */
const SCHILD = cn(
  'group/schild inline-flex min-h-11 items-center gap-3 rounded-1 border-(length:--m-strich) border-brand bg-surface px-4 py-2 text-etikett text-brand no-underline',
  'transition-colors duration-d1 ease-ein pointer-fine:hover:border-ruecklauf pointer-fine:hover:duration-d2 pointer-fine:hover:ease-aus motion-reduce:transition-none',
);
const SCHILD_PFEIL =
  'transition-transform duration-d1 ease-ein pointer-fine:group-hover/schild:translate-x-1 pointer-fine:group-hover/schild:duration-d2 pointer-fine:group-hover/schild:ease-aus motion-reduce:transition-none';

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
      />

      <Section tone="wand" trenner="62%" aria-labelledby={DIREKT_TITEL_ID}>
        {/* Handy: Kopf, Ansprechpartner mit Telefon und WhatsApp, Wege. Desktop: links Kopf und Wege, rechts der Kontakt. */}
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-y-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-20">
          <SectionHeader
            id={DIREKT_TITEL_ID}
            eyebrow={DIREKT_ETIKETT}
            title={DIREKT_TITEL}
            lead={DIREKT_EINLEITUNG}
            className="lg:col-start-1 lg:row-start-1"
          />

          <div className="relative grid min-w-0 content-start gap-y-3 pt-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l-(length:--m-strich) lg:border-brand lg:pt-0 lg:pl-12">
            {/* Handy: Rohrakzent auf der Oberkante (E-031); ab lg trennt die senkrechte Kante links */}
            <RohrAkzent className="lg:hidden" />
            <p className="text-etikett text-ink-2">Dein Ansprechpartner</p>
            <p className="mb-2 flex flex-col gap-1">
              <span className="text-title-3 text-brand">{FEHLER_ANSPRECHPARTNER.name}</span>
              <span className="text-callout text-ink-2">{FEHLER_ANSPRECHPARTNER.role}</span>
            </p>
            <ContactOptions variant="list" whatsappMessage={FEHLER_WHATSAPP} />
          </div>

          <nav aria-labelledby="fehler-wege-titel" className="grid gap-y-3 lg:col-start-1 lg:row-start-2">
            <h3 id="fehler-wege-titel" className="text-etikett text-ink-2">
              Weitere Wege
            </h3>
            <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
              {FEHLER_WEGE.map((weg) => (
                <li key={weg.href}>
                  <Link href={weg.href} className={SCHILD} data-motion="druck">
                    <span>{weg.label}</span>
                    <Icon name="arrow-right" size="sm" className={SCHILD_PFEIL} />
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
