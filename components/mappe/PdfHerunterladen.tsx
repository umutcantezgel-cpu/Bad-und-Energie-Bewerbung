'use client';

import { useEffect, useRef, useState } from 'react';
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
  /** Stand des Editors und Foto: Ändert sich eins, gilt eine fertige PDF nicht mehr (kein veraltetes „Nochmal“). */
  entwurf: unknown;
  foto: string | null;
  className?: string;
}

type Stand =
  | { art: 'bereit' }
  | { art: 'laeuft' }
  | { art: 'fertig'; dateiname: string; seiten: number; teilen: boolean }
  | { art: 'fehler'; text: string };

export const PDF_TEXT = Object.freeze({
  knopf: 'PDF herunterladen',
  hinweis: 'Fertige A4-PDF. Sie entsteht auf deinem Gerät.',
  laeuft: 'PDF wird erstellt …',
  nochmal: 'Nochmal herunterladen',
  teilen: 'Teilen',
  herunterladen: 'Herunterladen',
  leer: 'Deine Mappe ist noch leer. Wähl zum Beispiel deine Schwerpunkte oder trag Berufserfahrung ein.',
  fehler: 'Das hat nicht geklappt. Nimm „Drucken“ und wähle dort „Als PDF speichern“.',
  teilenFehler: 'Teilen hat nicht geklappt. Nimm „Herunterladen“.',
  linkKopieren: 'Link kopieren',
  linkKopiert: 'Link kopiert. Füge ihn in Safari oder Chrome ein.',
  adresse: 'Adresse dieser Seite',
});

const seitenText = (seiten: number) => `${seiten} ${seiten === 1 ? 'Seite' : 'Seiten'}`;

/** Grobe Zeigereingabe (Finger): Handy und Tablet. */
const beruehrung = () => typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;

/** Fehlende Zeichen lesbar aufzählen (höchstens zehn). */
export function zeichenText(zeichen: readonly string[]): string {
  const liste = zeichen.slice(0, 10).join(' ') + (zeichen.length > 10 ? ' …' : '');
  return `Deine Mappe enthält Zeichen, die unsere Schrift nicht hat: ${liste}. Nimm „Drucken“ oder ersetze sie.`;
}

export function inAppText(app: InAppBrowser): string {
  return (
    `Du bist im ${IN_APP_BROWSER[app]}-Browser. Dort klappt Herunterladen oft nicht. Bewerben geht trotzdem: ` +
    '„Mit dieser Mappe bewerben“ nimmt deine Mappe mit. Für eine eigene PDF öffne die Seite in Safari oder Chrome; ' +
    'deine Angaben trägst du dort neu ein.'
  );
}

/**
 * „PDF herunterladen“ im Pult (L4): Die PDF entsteht im Browser (lib/mappe/pdf/browser.tsx, react-pdf), geladen erst
 * bei Absicht (Zeiger, Fokus, Berührung). Am Computer startet der Download sofort; am Touch-Gerät mit Teilen-Menü
 * folgen „Teilen“ und „Herunterladen“, je mit eigenem Tippen (navigator.share braucht ein frisches).
 * In den In-App-Browsern von Instagram, Facebook und TikTok ein Hinweis mit „Link kopieren“; der Download bleibt.
 */
export function PdfHerunterladen({ vorbereiten, entwurf, foto, className }: PdfHerunterladenProps) {
  const [stand, setStand] = useState<Stand>({ art: 'bereit' });
  const [gesehen, setGesehen] = useState({ entwurf, foto });
  const [inApp, setInApp] = useState<InAppBrowser | null>(null);
  const [link, setLink] = useState<{ art: 'offen' } | { art: 'kopiert' } | { art: 'zeigen'; url: string }>({ art: 'offen' });
  const ergebnisRef = useRef<{ blob: Blob; dateiname: string } | null>(null);
  const modulRef = useRef<Promise<typeof import('@/lib/mappe/pdf/browser')> | null>(null);

  // Nach jeder Änderung an der Mappe: fertige PDF und Fehler weg (während des Erstellens bleibt der Stand)
  if (gesehen.entwurf !== entwurf || gesehen.foto !== foto) {
    setGesehen({ entwurf, foto });
    if (stand.art === 'fertig' || stand.art === 'fehler') setStand({ art: 'bereit' });
  }

  // Nur im Browser bekannt; nach der Hydrierung, damit das statische HTML gleich bleibt
  useEffect(() => {
    setInApp(inAppBrowser(navigator.userAgent)); // eslint-disable-line react-hooks/set-state-in-effect -- einmal nach der Hydrierung
  }, []);

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
    setStand({ art: 'laeuft' });
    try {
      const { bewerberPdf } = await laden();
      const ergebnis = await bewerberPdf(vorbereitet.eingaben, new Date());
      if (!ergebnis.ok) {
        setStand({ art: 'fehler', text: ergebnis.grund === 'zeichen' ? zeichenText(ergebnis.zeichen) : PDF_TEXT.leer });
        return;
      }
      ergebnisRef.current = { blob: ergebnis.blob, dateiname: ergebnis.dateiname };
      // Teilen-Menü nur am Touch-Gerät; am Computer (auch mit Teilen-Menü, etwa Windows oder macOS) gleich speichern
      const teilen = beruehrung() && kannTeilen(pdfDatei(ergebnis.blob, ergebnis.dateiname));
      if (!teilen) herunterladen(ergebnis.blob, ergebnis.dateiname);
      setStand({ art: 'fertig', dateiname: ergebnis.dateiname, seiten: ergebnis.seiten, teilen });
    } catch {
      setStand({ art: 'fehler', text: PDF_TEXT.fehler });
    }
  }

  function nochmal() {
    const ergebnis = ergebnisRef.current;
    if (ergebnis) herunterladen(ergebnis.blob, ergebnis.dateiname);
  }

  async function teilen() {
    const ergebnis = ergebnisRef.current;
    if (!ergebnis) return;
    try {
      await navigator.share({ files: [pdfDatei(ergebnis.blob, ergebnis.dateiname)], title: ergebnis.dateiname });
    } catch (fehler) {
      // Abgebrochen (Teilen-Menü geschlossen): nichts zu sagen
      if (fehler instanceof DOMException && fehler.name === 'AbortError') return;
      setStand({ art: 'fehler', text: PDF_TEXT.teilenFehler });
    }
  }

  async function linkKopieren() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setLink({ art: 'kopiert' });
    } catch {
      // Zwischenablage verweigert: Adresse sichtbar und markierbar
      setLink({ art: 'zeigen', url });
    }
  }

  const status =
    stand.art === 'laeuft'
      ? PDF_TEXT.laeuft
      : stand.art === 'fertig'
        ? stand.teilen
          ? `Deine PDF ist fertig (${seitenText(stand.seiten)}).`
          : `Fertig: ${stand.dateiname} (${seitenText(stand.seiten)})`
        : '';

  return (
    <div className={cn(styles.pultWeg, styles.pultWegVoll, className)} data-mappe-pdf="">
      <Button
        variant="secondary"
        wrap
        fullWidth
        loading={stand.art === 'laeuft'}
        onClick={erstellen}
        onPointerEnter={vorladen}
        onFocus={vorladen}
        onTouchStart={vorladen}
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
          <div className={styles.pdfAktionen}>
            <Button variant="secondary" wrap onClick={teilen}>
              {PDF_TEXT.teilen}
            </Button>
            <Button variant="outline" wrap onClick={nochmal}>
              <Icon name="download" size="md" />
              {PDF_TEXT.herunterladen}
            </Button>
          </div>
        ) : (
          <Button variant="link" wrap onClick={nochmal} className="self-start">
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
          <p className="text-callout text-ink">{inAppText(inApp)}</p>
          <Button variant="outline" wrap onClick={linkKopieren} className="self-start">
            {PDF_TEXT.linkKopieren}
          </Button>
          <p role="status" className="text-footnote text-ink-2">
            {link.art === 'kopiert' ? PDF_TEXT.linkKopiert : ''}
          </p>
          {link.art === 'zeigen' && (
            <label className="flex flex-col gap-1 text-footnote text-ink-2">
              {PDF_TEXT.adresse}
              <input
                readOnly
                value={link.url}
                onFocus={(event) => event.currentTarget.select()}
                className={cn(styles.pdfAdresse, 'rounded-1 bg-surface text-callout text-ink')}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
