'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icons';
import { MenueZeichen } from './kopf/MenueZeichen';
import styles from './kopf/kopf.module.css';
import {
  zeigeVertraulich,
  type KopfMarke,
  type KopfUntermenue,
  type KopfVertraulich,
  type OffeneStellen,
} from './kopf/typen';
import { APPLY_PATH, NAV_ITEMS, SHORT_APPLY_LABEL, navCurrent, subNavCurrent } from './nav';

export interface MobileNavProps {
  phone: { display: string; href: string };
  /** WhatsApp-Link mit vorbefülltem Text, auf dem Server gebaut. */
  whatsappHref: string;
  /** Logo im Menükopf (auf der Plakette, da das Menü ein Navy-Band ist). */
  logo?: ReactNode;
  offeneStellen?: OffeneStellen | null;
  marke?: KopfMarke | null;
  vertraulich?: KopfVertraulich | null;
  /** E-028: Unterseiten der Hubs als kompakte Liste unter ihrem Eintrag. */
  untermenues?: readonly KopfUntermenue[];
  className?: string;
}

/** Id des Menüdialogs; es gibt genau einen Seitenkopf. */
export const MENU_ID = 'kopf-menue';
/**
 * Ab hier zeigt der Kopf die Navigation selbst; ein offenes Menü schließt sich. Nur mit feinem Zeiger (wie
 * kopf.module.css): Tablets ab 64em (iPad quer, iPad Pro) haben kein Hover für die Untermenüs und behalten das Menü.
 */
const DESKTOP_QUERY = '(min-width: 64em) and (hover: hover) and (pointer: fine)';

/*
 * Ohne Skript öffnen moderne Browser den Dialog über Invoker Commands (commandfor/command); mit Skript
 * übernimmt onClick (preventDefault) und hält den Zustand in React. React kennt die Attribute nicht und
 * reicht sie klein geschrieben durch.
 */
const oeffnenOhneSkript = { commandfor: MENU_ID, command: 'show-modal' } as Record<string, string>;
const schliessenOhneSkript = { commandfor: MENU_ID, command: 'close' } as Record<string, string>;

/**
 * Menü unter 64em und auf Touch-Geräten jeder Breite (E-SHELL-011…013, E-SHELL-001/002/004/005): natives
 * `<dialog>` mit showModal(), also Fokusfalle und inerter Hintergrund; Escape, Klick auf den Hintergrund und
 * „Schließen“ schließen, der
 * Fokus kehrt zum Menüknopf zurück, die Seite dahinter scrollt nicht (kopf.module.css). Gestaltet als
 * Navy-Band wie die Fläche des Einstiegs: Die Einträge zweigen vom Leitungspaar ab, das Paar fällt in
 * „Jetzt bewerben“. Unter „Arbeiten bei uns“ und „Einsatzgebiet“ verteilt eine Nebenleitung die Unterseiten (E-028):
 * Themen, Kreis-Hubs und das Verzeichnis aller Orte, jede Zeile mindestens 44 px hoch. Ist das Menü höher als der
 * Bildschirm, scrollt der Dialog selbst.
 */
export function MobileNav({
  phone,
  whatsappHref,
  logo,
  offeneStellen,
  marke,
  vertraulich,
  untermenues = [],
  className,
}: MobileNavProps) {
  const pathname = usePathname();
  // Das Menü merkt sich die Seite, auf der es geöffnet wurde: Ein Seitenwechsel (Link, Browser-Zurück)
  // schließt es damit ohne eigenen Effekt.
  const [offenAuf, setOffenAuf] = useState<string | null>(null);
  const open = offenAuf !== null && offenAuf === pathname;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const knopfRef = useRef<HTMLButtonElement>(null);
  const schliessenRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOffenAuf(null), []);

  // Zustand → Dialog: showModal() setzt Fokusfalle und Hintergrund; close() gibt den Fokus zurück.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      schliessenRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Wechsel auf Desktop (Fenster breiter, Maus statt Touch) schließt das Menü; dort zeigt der Kopf die Navigation.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (query.matches) close();
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [close]);

  /** Escape, Schließen-Knopf oder Formular: Dialog ist zu, Fokus zurück auf den Menüknopf. */
  const onDialogClose = () => {
    close();
    knopfRef.current?.focus({ preventScroll: true });
  };

  /**
   * Klick neben das Band (auf den abgedunkelten Hintergrund) schließt: Der Inhalt füllt den Dialog
   * ganz aus, darum trifft ein Klick den Dialog selbst nur über ::backdrop.
   */
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  const vertraulichText = zeigeVertraulich(vertraulich, pathname) ? vertraulich!.text : null;

  return (
    <div className={className}>
      <button
        ref={knopfRef}
        type="button"
        aria-label="Menü"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={MENU_ID}
        className={styles.menueKnopf}
        data-motion="flaeche"
        {...oeffnenOhneSkript}
        onClick={(event) => {
          event.preventDefault();
          setOffenAuf(pathname);
        }}
      >
        <MenueZeichen zustand="zu" />
      </button>

      <dialog
        ref={dialogRef}
        id={MENU_ID}
        aria-label="Menü"
        data-tone="inverse"
        data-motion="menue-oeffnen"
        className={styles.menue}
        onClose={onDialogClose}
        onClick={onDialogClick}
      >
        <div className={styles.innen}>
          <div className={styles.menueKopf}>
            {logo ? (
              <Link href="/" aria-label="Bad und Energie GmbH Lahn Dill, zur Startseite" className={styles.logo} onClick={close}>
                {logo}
              </Link>
            ) : (
              <span />
            )}
            <button
              ref={schliessenRef}
              type="button"
              aria-label="Menü schließen"
              className={styles.menueKnopf}
              data-motion="flaeche"
              {...schliessenOhneSkript}
              onClick={(event) => {
                event.preventDefault();
                close();
              }}
            >
              <MenueZeichen zustand="offen" />
            </button>
          </div>

          <div className={styles.leitung} data-motion="menue-leitung">
            {marke ? <p className={`${styles.menueMarke} text-etikett`}>{marke.lang}</p> : null}

            <nav aria-label="Hauptnavigation">
              <ul className={styles.menueListe}>
                {NAV_ITEMS.map((item, i) => {
                  const zaehler = item.href === '/jobs' ? offeneStellen : null;
                  const unter = untermenues.find((u) => u.href === item.href);
                  // Der Abschluss entfällt, wenn er zum Hub führt: Das tut der Eintrag selbst.
                  const alle = unter && unter.alle.href !== item.href ? unter.alle : null;
                  const unterwege = unter ? [...unter.wege, ...(alle ? [alle] : [])] : [];
                  return (
                    <li key={item.href} data-motion="menue-eintrag" style={{ '--i': i } as CSSProperties}>
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={navCurrent(item, pathname)}
                        className={`${styles.eintrag} text-title-2`}
                      >
                        {item.label}
                        {zaehler ? (
                          <>
                            <span className={`${styles.eintragZahl} text-etikett`} aria-hidden="true">
                              {zaehler.anzahl} offen
                            </span>
                            <span className="sr-only"> ({zaehler.text})</span>
                          </>
                        ) : null}
                      </Link>
                      {unter ? (
                        <ul className={styles.nebenListe} aria-label={`${item.label}: ${unter.etikett}`}>
                          {unterwege.map((weg) => (
                            <li key={weg.href}>
                              <Link
                                href={weg.href}
                                onClick={close}
                                aria-current={subNavCurrent(weg.href, pathname)}
                                className={weg === alle ? `${styles.nebenWeg} ${styles.nebenAlle}` : styles.nebenWeg}
                              >
                                <span className={styles.nebenName}>{weg.label}</span>
                                {weg === alle ? <Icon name="arrow-right" size="md" className={styles.ikon} /> : null}
                                {weg.mass ? (
                                  <>
                                    {' '}
                                    <span className={`${styles.nebenMass} text-etikett`}>{weg.mass}</span>
                                  </>
                                ) : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className={styles.menueKontakt}>
              <a href={phone.href} className={styles.kontakt}>
                <Icon name="phone" size="lg" className={styles.ikon} />
                <span className="ziffer">{phone.display}</span>
                <span className="sr-only"> anrufen</span>
              </a>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.kontakt}>
                <Icon name="message-circle" size="lg" className={styles.ikon} />
                WhatsApp
                <span className="sr-only"> (öffnet in neuem Tab)</span>
              </a>
              {vertraulichText ? (
                <p className={styles.vertraulich}>
                  <Icon name="shield-check" size="md" className={styles.ikon} />
                  <span>{vertraulichText}</span>
                </p>
              ) : null}
            </div>
          </div>

          <Link href={APPLY_PATH} onClick={close} className={styles.aktion} data-motion="druck">
            {SHORT_APPLY_LABEL}
            <Icon name="arrow-right" size="md" />
          </Link>
        </div>
      </dialog>
    </div>
  );
}
