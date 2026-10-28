'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { MappeSectionId } from '@/lib/applications/constants';
import { SEITENSPALTE } from '@/lib/mappe/blatt/aufbau';
import { AKZENT_FARBEN, type Fotoform, type MappeDesign } from '@/lib/mappe/blatt/design';
import type { MappeAbschnitt } from '@/lib/mappe/blatt/dokument';
import { fuerSchrift, titelschriftDecktAlle } from '@/lib/mappe/blatt/zeichen';
import type { MappePerson, VorschauAbschnitt } from '@/lib/mappe/editor';
import { dateLine } from '@/lib/mappe/format';
import type { MappeRecipient } from '@/lib/mappe/types';
import { cn } from '@/lib/utils/cn';
import styles from './stil';

/** 210 mm at 96 dpi. */
const A4_WIDTH_PX = (210 / 25.4) * 96;

export interface MappePreviewProps {
  person: MappePerson;
  subject: string;
  letter: string;
  recipient: MappeRecipient;
  /** Lebenslauf in der Reihenfolge des Aufbaus (vorschauAbschnitte): dieselben Abschnitte wie PDF und Mail (L5). */
  abschnitte: readonly VorschauAbschnitt[];
  photoUrl: string | null;
  /** Formatted date of today; empty until mounted (the page is static). */
  today: string;
  /** Design, Farbe und Schrift (L3); dieselben Werte setzt die PDF (lib/mappe/pdf/blatt.tsx). */
  design: MappeDesign;
  /** Form des Fotos; nur mit Foto sichtbar. */
  fotoform: Fotoform;
  className?: string;
}

/**
 * Two A4 pages (Anschreiben, Lebenslauf). On screen zoomed to the column, in print at real size. Das Design steht als
 * Attribute und Variablen am Rahmen (data-vorlage, data-schrift, data-fotoform, --blatt-akzent): Die Blattregeln in
 * mappe.module.css lesen nur diese, Vorschau und Druck folgen ihnen gleich.
 */
export function MappePreview({ className, design, fotoform, ...props }: MappePreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  // Zoom factor from the column width; written to the DOM directly, no re-render per resize.
  useEffect(() => {
    const node = frameRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const width = node.clientWidth;
      if (width > 0) node.style.setProperty('--mappe-scale', String(Math.min(1, width / A4_WIDTH_PX)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const akzent = AKZENT_FARBEN[design.akzent];
  const farben = { '--blatt-akzent': akzent.farbe, '--blatt-akzent-toenung': akzent.toenung } as CSSProperties;
  // Wie die PDF (fuerPdf): Markant nur, wenn die Titelschrift jedes Zeichen des Namens und der Überschriften hat, sonst
  // Sachlich statt Mischschrift
  const titel = [props.person.name, ...props.abschnitte.map((eintrag) => eintrag.titel)].map(fuerSchrift);
  const schrift = design.schrift === 'markant' && !titelschriftDecktAlle(titel) ? 'sachlich' : design.schrift;
  return (
    <div
      ref={frameRef}
      className={cn(styles.frame, className)}
      data-vorlage={design.vorlage}
      data-schrift={schrift}
      data-fotoform={fotoform}
      style={farben}
    >
      <div className={styles.stack}>
        <CoverLetterPage {...props} />
        <CvPage {...props} zweispaltig={design.vorlage === 'zweispaltig'} />
      </div>
    </div>
  );
}

type PageProps = Omit<MappePreviewProps, 'className' | 'design' | 'fotoform'>;

function Filled({ value, placeholder }: { value: string; placeholder: string }) {
  return value.trim() ? <>{value.trim()}</> : <span className={styles.placeholder}>{placeholder}</span>;
}

function contactLine(person: MappePerson): string {
  return [person.location, person.phone, person.email]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' · ');
}

function Letterhead({ person, children }: { person: MappePerson; children?: ReactNode }) {
  const contact = contactLine(person);
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {children}
      <p className={styles.name}>
        <Filled value={person.name} placeholder="Dein Name" />
      </p>
      <p className={cn(styles.small, 'text-ink-muted tabular-nums')}>
        {contact || <span className={styles.placeholder}>Wohnort · Telefon · E-Mail</span>}
      </p>
    </div>
  );
}

function CoverLetterPage({ person, subject, letter, recipient, today }: PageProps) {
  return (
    <article aria-labelledby="mappe-seite-anschreiben" className={cn(styles.page, styles.paper)}>
      <h3 id="mappe-seite-anschreiben" className="sr-only">
        Anschreiben
      </h3>
      <header className="border-b border-line pb-5">
        <Letterhead person={person} />
      </header>

      <address className="mt-10 not-italic">
        {recipient.companyName}
        <br />
        {recipient.attention}
        <br />
        {recipient.street}
        <br />
        {recipient.postalCode} {recipient.city}
      </address>

      <p className="mt-8 text-right tabular-nums">{dateLine(person.location, today)}</p>
      <p className="mt-6 font-bold">{subject}</p>
      <div className={cn(styles.letter, 'mt-6')}>{letter}</div>
    </article>
  );
}

function CvSection({
  title,
  isEmpty,
  emptyText,
  children,
}: {
  title: string;
  isEmpty: boolean;
  emptyText: string;
  children?: ReactNode;
}) {
  // Empty sections are only a hint on screen and are left out of the printout.
  return (
    <section className={cn('mt-8 flex flex-col gap-4', isEmpty && 'print:hidden')}>
      <h4 className={cn(styles.heading, 'border-b border-line pb-1.5')}>{title}</h4>
      {isEmpty ? <p className="text-ink-muted">{emptyText}</p> : children}
    </section>
  );
}

/** Platzhalter leerer Grundabschnitte (nur am Bildschirm); neue Abschnitte erscheinen erst mit Inhalt. */
const LEERTEXT: Partial<Record<MappeSectionId, string>> = {
  career: 'Noch keine Berufserfahrung eingetragen.',
  education: 'Noch kein Abschluss eingetragen.',
  skills: 'Noch keine Schwerpunkte gewählt.',
};

/** Inhalt eines Abschnitts wie in der PDF: Stationen in Zeilen, Punkte als Liste, Text als Absatz (L5). */
function AbschnittInhalt({ abschnitt }: { abschnitt: MappeAbschnitt }) {
  switch (abschnitt.art) {
    case 'beruf':
    case 'ausbildung':
      return abschnitt.stationen.map((station, index) => (
        <div key={index} className={styles.row}>
          <p className="tabular-nums text-ink-muted">{station.zeit}</p>
          <div className="flex min-w-0 flex-col">
            {station.titel && <p className="font-bold">{station.titel}</p>}
            {station.ort && <p className="text-ink-muted">{station.ort}</p>}
            {'aufgaben' in station && station.aufgaben.length > 0 && (
              <ul className="mt-1.5 list-disc pl-5">
                {station.aufgaben.map((aufgabe, i) => (
                  <li key={i}>{aufgabe}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ));
    case 'punkte':
      return (
        <ul className="list-disc pl-5">
          {abschnitt.punkte.map((punkt, i) => (
            <li key={i}>{punkt}</li>
          ))}
        </ul>
      );
    case 'text':
      return <p className={styles.letter}>{abschnitt.text}</p>;
  }
}

function CvPage({ person, subject, abschnitte, photoUrl, today, zweispaltig }: PageProps & { zweispaltig: boolean }) {
  const date = dateLine(person.location, today);
  const setze = (liste: readonly VorschauAbschnitt[]) =>
    liste.map((eintrag) => (
      <CvSection key={eintrag.id} title={eintrag.titel} isEmpty={eintrag.abschnitt === null} emptyText={LEERTEXT[eintrag.id] ?? ''}>
        {eintrag.abschnitt && <AbschnittInhalt abschnitt={eintrag.abschnitt} />}
      </CvSection>
    ));
  // Zweispaltig wie die PDF: kurze Abschnitte in der getönten Seitenspalte, nur wenn beide Spalten Inhalt haben
  // (Platzhalter zählen nicht); sonst eine Spalte wie Schlicht
  const seite = abschnitte.filter((eintrag) => SEITENSPALTE.has(eintrag.id));
  const haupt = abschnitte.filter((eintrag) => !SEITENSPALTE.has(eintrag.id));
  const spalten = zweispaltig && seite.some((eintrag) => eintrag.abschnitt) && haupt.some((eintrag) => eintrag.abschnitt);

  return (
    <article aria-labelledby="mappe-seite-lebenslauf" className={cn(styles.page, styles.paper)}>
      <header className="flex items-start justify-between gap-8 border-b border-line pb-5">
        <Letterhead person={person}>
          <h3 id="mappe-seite-lebenslauf" className={cn(styles.heading, 'text-ink-muted')}>
            Lebenslauf
          </h3>
        </Letterhead>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL, never uploaded
          <img src={photoUrl} alt="Bewerbungsfoto" className={styles.photo} />
        )}
      </header>

      <p className="mt-6 font-bold">{subject}</p>

      {spalten ? (
        // Zweispaltig: Seitenspalte getönt, daneben die Hauptspalte (Zeitraum über dem Titel)
        <div className={styles.spalten}>
          <div className={styles.seitenspalte}>{setze(seite)}</div>
          <div className={styles.hauptspalte}>{setze(haupt)}</div>
        </div>
      ) : (
        setze(abschnitte)
      )}

      <footer className="mt-auto flex items-end justify-between gap-8 pt-16">
        <p className="tabular-nums">{date}</p>
        <p className={cn(styles.small, 'min-w-48 border-t border-line-strong pt-1.5 text-ink-muted')}>
          <Filled value={person.name} placeholder="Dein Name" />
        </p>
      </footer>
    </article>
  );
}
