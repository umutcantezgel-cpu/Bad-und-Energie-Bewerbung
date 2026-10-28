'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui';
import type { BewerberPdfEingaben } from '@/lib/mappe/pdf/browser';
import { cn } from '@/lib/utils/cn';
import { IN_APP_BROWSER, herunterladen, inAppBrowser, kannTeilen, pdfDatei, type InAppBrowser } from './pdf-download';
import styles from './stil';

/** Was MappeTool beim Klick aus dem Editor baut; ohne gültige Mappe die Meldung dazu. */
export type PdfVorbereitung = { ok: true; eingaben: BewerberPdfEingaben } | { ok: false; meldung: string };

export interface PdfHerunterladenProps {
  vorbereiten: () => PdfVorbereitung;
  /** Stand des Editors und Foto: Ändert sich eins, gilt ein fertiges PDF nicht mehr (kein veraltetes „Nochmal“). */
  entwurf: unknown;
  foto: string | null;
  /** Wie der Hauptknopf heißt: „Mit dieser Mappe bewerben“ oder nach dem Absenden „Mappe nachreichen“. */
  modus: 'apply' | 'followUp';
  /** Der Zeichen-Hinweis im Pult nennt schon Zeichen, mit denen kein PDF entsteht: dann nur darauf verweisen. */
  zeichenImHinweis?: boolean;
  className?: string;
}

type Stand =
  | { art: 'bereit' }
  | { art: 'laeuft' }
  | { art: 'fertig'; dateiname: string; seiten: number; teilen: boolean; teilenFehler: boolean }
  | { art: 'fehler'; text: string };

type Link = { art: 'offen' } | { art: 'kopiert' } | { art: 'zeigen'; url: string };

export const PDF_TEXT = Object.freeze({
  knopf: 'PDF herunterladen',
  hinweis: 'Fertiges A4-PDF. Es entsteht auf deinem Gerät.',
  laeuft: 'PDF wird erstellt …',
  nochmal: 'Nochmal herunterladen',
  teilen: 'PDF teilen',
  speichern: 'PDF speichern',
  leer: 'Deine Mappe ist noch leer. Wähl zum Beispiel deine Schwerpunkte oder trag Berufserfahrung ein.',
  fehler: 'Das PDF ließ sich nicht erstellen. Versuch es noch einmal oder nimm „Drucken“ und speichere dort als PDF.',
  foto: 'Dein Foto lässt sich nicht lesen. Wähl ein anderes oder entferne es.',
  teilenFehler: 'Teilen hat nicht geklappt. Nimm „PDF speichern“.',
  linkKopieren: 'Link kopieren',
  linkKopiert: 'Link kopiert. Füge ihn in Safari oder Chrome ein.',
  linkNichtKopiert: 'Kopieren ging nicht. Halte den Finger auf die Adresse und kopiere sie.',
  adresse: 'Adresse dieser Seite',
});

const seitenText = (seiten: number) => `${seiten} ${seiten === 1 ? 'Seite' : 'Seiten'}`;

/** Grobe Zeigereingabe (Finger): Handy und Tablet. */
const beruehrung = () => typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;

/**
 * Fehlende Zeichen lesbar aufzählen (höchstens zehn). Steht der Zeichen-Hinweis schon im Pult, nur auf ihn verweisen
 * (Prüfrunde L5: sonst dieselben Zeichen zweimal).
 */
export function zeichenText(zeichen: readonly string[], imHinweis = false): string {
  if (imHinweis) return 'Mit einigen Zeichen deiner Mappe entsteht kein PDF. Welche das sind, steht im Hinweis unter „Per WhatsApp schicken“.';
  const liste = zeichen.slice(0, 10).join(' ') + (zeichen.length > 10 ? ' …' : '.');
  return `Deine Mappe enthält Zeichen, die unsere Schrift nicht hat: ${liste} Nimm „Drucken“ (dort auch als PDF speichern) oder ersetze sie.`;
}

/** Hinweis im App-Browser; nennt den Hauptknopf so, wie er gerade heißt. */
export function inAppText(app: InAppBrowser, modus: 'apply' | 'followUp' = 'apply'): string {
  const trotzdem =
    modus === 'followUp'
      ? 'Nachreichen geht trotzdem: „Mappe nachreichen“ hängt deine Mappe an deine Bewerbung.'
      : 'Bewerben geht trotzdem: „Mit dieser Mappe bewerben“ nimmt deine Mappe mit.';
  return (
    `Du bist im ${IN_APP_BROWSER[app]}-Browser. Dort klappt Herunterladen oft nicht. ${trotzdem} ` +
    'Für ein eigenes PDF öffne die Seite in Safari oder Chrome; deine Angaben trägst du dort neu ein.'
  );
}

/** Dateiname mit Umbruchstellen nach „_“ (bei 320 px bricht er dort statt mitten im Wort). */
function mitUmbruch(dateiname: string): ReactNode {
  return dateiname.split('_').map((teil, i) => (
    <Fragment key={i}>
      {i > 0 ? (
        <>
          _<wbr />
        </>
      ) : null}
      {teil}
    </Fragment>
  ));
}

/**
 * „PDF herunterladen“ im Pult (L4): Das PDF entsteht im Browser (lib/mappe/pdf/browser.tsx, react-pdf), geladen erst
 * bei Absicht (Zeiger oder Fokus; am Handy erst beim Tippen, damit Scrollen über den Knopf nichts lädt). Am Computer
 * startet der Download sofort; am Touch-Gerät mit Teilen-Menü folgen „PDF teilen“ und „PDF speichern“, je mit eigenem
 * Tippen (navigator.share braucht ein frisches). In den In-App-Browsern von Instagram, Facebook und TikTok ein Hinweis
 * mit „Link kopieren“; der Download bleibt.
 */
export function PdfHerunterladen({ vorbereiten, entwurf, foto, modus, zeichenImHinweis = false, className }: PdfHerunterladenProps) {
  const [stand, setStand] = useState<Stand>({ art: 'bereit' });
  const [gesehen, setGesehen] = useState({ entwurf, foto });
  const [inApp, setInApp] = useState<InAppBrowser | null>(null);
  const [link, setLink] = useState<Link>({ art: 'offen' });
  const ergebnisRef = useRef<{ blob: Blob; dateiname: string } | null>(null);
  const modulRef = useRef<Promise<typeof import('@/lib/mappe/pdf/browser')> | null>(null);
  const adresseRef = useRef<HTMLInputElement>(null);
  /** Aktueller Stand der Mappe für den Vergleich nach dem Erstellen (Änderung währenddessen). */
  const aktuellRef = useRef({ entwurf, foto });

  // Nach jeder Änderung an der Mappe: fertiges PDF und Fehler weg (während des Erstellens bleibt der Stand)
  if (gesehen.entwurf !== entwurf || gesehen.foto !== foto) {
    setGesehen({ entwurf, foto });
    if (stand.art === 'fertig' || stand.art === 'fehler') setStand({ art: 'bereit' });
  }

  useEffect(() => {
    aktuellRef.current = { entwurf, foto };
  }, [entwurf, foto]);

  // Nur im Browser bekannt; nach der Hydrierung, damit das statische HTML gleich bleibt
  useEffect(() => {
    setInApp(inAppBrowser(navigator.userAgent)); // eslint-disable-line react-hooks/set-state-in-effect -- einmal nach der Hydrierung
  }, []);

  // Kopieren verweigert: Adresse ins Feld, Fokus dorthin (markiert sich selbst)
  useEffect(() => {
    if (link.art === 'zeigen') adresseRef.current?.focus();
  }, [link]);

  function laden() {
    // Ein fehlgeschlagener Import (Netz, CSP) wird beim nächsten Versuch neu geladen
    modulRef.current ??= import('@/lib/mappe/pdf/browser').catch((fehler: unknown) => {
      modulRef.current = null;
      throw fehler;
    });
    return modulRef.current;
  }

  function vorladen() {
    laden().catch(() => {});
  }

  async function erstellen() {
    if (stand.art === 'laeuft') return;
    const vorbereitet = vorbereiten();
    if (!vorbereitet.ok) {
      setStand({ art: 'fehler', text: vorbereitet.meldung });
      return;
    }
    const start = aktuellRef.current;
    setStand({ art: 'laeuft' });
    try {
      const { bewerberPdf } = await laden();
      const ergebnis = await bewerberPdf(vorbereitet.eingaben, new Date());
      if (!ergebnis.ok) {
        const text = ergebnis.grund === 'zeichen' ? zeichenText(ergebnis.zeichen, zeichenImHinweis) : ergebnis.grund === 'foto' ? PDF_TEXT.foto : PDF_TEXT.leer;
        setStand({ art: 'fehler', text });
        return;
      }
      ergebnisRef.current = { blob: ergebnis.blob, dateiname: ergebnis.dateiname };
      // Teilen-Menü nur am Touch-Gerät; am Computer (auch mit Teilen-Menü, etwa Windows oder macOS) gleich speichern
      const teilen = beruehrung() && kannTeilen(pdfDatei(ergebnis.blob, ergebnis.dateiname));
      if (!teilen) herunterladen(ergebnis.blob, ergebnis.dateiname);
      // Während des Erstellens geändert: Das PDF ist schon veraltet, also kein „Fertig“, kein „Nochmal“, kein Teilen
      const geaendert = start.entwurf !== aktuellRef.current.entwurf || start.foto !== aktuellRef.current.foto;
      setStand(
        geaendert
          ? { art: 'bereit' }
          : { art: 'fertig', dateiname: ergebnis.dateiname, seiten: ergebnis.seiten, teilen, teilenFehler: false },
      );
    } catch {
      setStand({ art: 'fehler', text: PDF_TEXT.fehler });
    }
  }

  function speichern() {
    const ergebnis = ergebnisRef.current;
    if (ergebnis) herunterladen(ergebnis.blob, ergebnis.dateiname);
  }

  async function teilen() {
    const ergebnis = ergebnisRef.current;
    if (!ergebnis) return;
    try {
      await navigator.share({ files: [pdfDatei(ergebnis.blob, ergebnis.dateiname)], title: ergebnis.dateiname });
    } catch (fehler) {
      // Abgebrochen (Teilen-Menü geschlossen) oder ein zweites Tippen, während das Menü offen ist: nichts zu sagen
      if (fehler instanceof DOMException && (fehler.name === 'AbortError' || fehler.name === 'InvalidStateError')) return;
      // Sonst bleiben „PDF teilen“ und „PDF speichern“ stehen, dazu der Hinweis
      setStand((alt) => (alt.art === 'fertig' ? { ...alt, teilenFehler: true } : alt));
    }
  }

  async function linkKopieren() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setLink({ art: 'kopiert' });
    } catch {
      // Zwischenablage verweigert (in App-Browsern häufig): Adresse sichtbar, markiert und angesagt
      setLink({ art: 'zeigen', url });
    }
  }

  const status: ReactNode =
    stand.art === 'laeuft' ? (
      PDF_TEXT.laeuft
    ) : stand.art === 'fertig' ? (
      stand.teilen ? (
        `Dein PDF ist fertig (${seitenText(stand.seiten)}). Teilen oder speichern?`
      ) : (
        <>
          Fertig: {mitUmbruch(stand.dateiname)} ({seitenText(stand.seiten)})
        </>
      )
    ) : (
      ''
    );

  return (
    <div className={cn(styles.pultWeg, styles.pultWegVoll, className)} data-mappe-pdf="">
      <Button
        variant="secondary"
        wrap
        fullWidth
        loading={stand.art === 'laeuft'}
        onClick={erstellen}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') vorladen();
        }}
        onFocus={vorladen}
        className={styles.pultWegKnopf}
      >
        <Icon name="download" size="md" />
        {PDF_TEXT.knopf}
      </Button>
      <p className="text-footnote text-ink-2">{PDF_TEXT.hinweis}</p>

      <p role="status" className="text-callout text-ink">
        {status}
      </p>
      {stand.art === 'fertig' &&
        (stand.teilen ? (
          <>
            <div className={styles.pdfAktionen}>
              <Button variant="secondary" wrap onClick={teilen}>
                {PDF_TEXT.teilen}
              </Button>
              <Button variant="outline" wrap onClick={speichern}>
                <Icon name="download" size="md" />
                {PDF_TEXT.speichern}
              </Button>
            </div>
            {stand.teilenFehler && (
              <p role="alert" className="flex items-start gap-2 text-callout font-bold text-ink">
                <Icon name="circle-alert" size="md" className="mt-0.5 shrink-0 text-danger" />
                <span>{PDF_TEXT.teilenFehler}</span>
              </p>
            )}
          </>
        ) : (
          <Button variant="link" wrap onClick={speichern} className="self-start">
            {PDF_TEXT.nochmal}
          </Button>
        ))}
      {stand.art === 'fehler' && (
        <p role="alert" className="flex items-start gap-2 text-callout font-bold text-ink">
          <Icon name="circle-alert" size="md" className="mt-0.5 shrink-0 text-danger" />
          <span>{stand.text}</span>
        </p>
      )}

      {inApp && (
        <div className={cn(styles.pdfInApp, 'rounded-2 bg-surface')} data-mappe-in-app={inApp}>
          <p className="text-callout text-ink">{inAppText(inApp, modus)}</p>
          <Button variant="outline" wrap onClick={linkKopieren} className="self-start">
            {PDF_TEXT.linkKopieren}
          </Button>
          <p role="status" className="text-footnote text-ink-2">
            {link.art === 'kopiert' ? PDF_TEXT.linkKopiert : link.art === 'zeigen' ? PDF_TEXT.linkNichtKopiert : ''}
          </p>
          {link.art === 'zeigen' && (
            <label className="flex flex-col gap-1 text-footnote text-ink-2">
              {PDF_TEXT.adresse}
              <input
                ref={adresseRef}
                readOnly
                value={link.url}
                onFocus={(event) => event.currentTarget.select()}
                className={cn(styles.pdfAdresse, 'rounded-1 bg-surface text-body text-ink')}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
