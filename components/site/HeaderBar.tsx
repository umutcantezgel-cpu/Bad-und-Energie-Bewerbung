'use client';

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icons';
import styles from './kopf/kopf.module.css';
import {
  zeigeMarkeImKopf,
  type KopfMarke,
  type KopfUntermenue,
  type KopfVertraulich,
  type OffeneStellen,
} from './kopf/typen';
import { MobileNav } from './MobileNav';
import { APPLY_PATH, NAV_ITEMS, focusModeExitLabel, isFocusMode, navCurrent, subNavCurrent } from './nav';

export interface HeaderBarProps {
  logo: ReactNode;
  /** Logo im Menü (ohne Vorrang beim Laden); ohne Angabe das Kopf-Logo. */
  menuLogo?: ReactNode;
  phone: { display: string; href: string };
  /** WhatsApp-Link mit dem allgemeinen Text, auf dem Server gebaut (SITE_CONFIG bleibt aus dem Client). */
  whatsappHref: string;
  /** WhatsApp-Link im Bewerbungsflow (Frage zu den Bewerbungsschritten); ohne Angabe whatsappHref. */
  whatsappFlowHref?: string;
  /** E-SHELL-002: Zähler am Eintrag „Stellen“; null ohne live Stelle. */
  offeneStellen?: OffeneStellen | null;
  /** E-SHELL-001: Jubiläumsmarke; null ab 2027. */
  marke?: KopfMarke | null;
  /** E-SHELL-004: Vertraulichkeitszusage im Menü. */
  vertraulich?: KopfVertraulich | null;
  /** E-028: Untermenüs „Arbeiten bei uns“ (Themen) und „Einsatzgebiet“ (Kreis-Hubs, Verzeichnis A–Z). */
  untermenues?: readonly KopfUntermenue[];
}

/** True, sobald die Seite gescrollt ist; ein 1-px-Wächter am Dokumentanfang statt Scroll-Ereignissen. */
function useScrolled() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, scrolled };
}

function Telefon({ phone }: { phone: HeaderBarProps['phone'] }) {
  return (
    <a href={phone.href} className={styles.tel} data-motion="unterstrich">
      <Icon name="phone" size="lg" className={styles.ikon} />
      <span className={`${styles.nummer} ziffer`}>{phone.display}</span>
      <span className="sr-only"> anrufen</span>
    </a>
  );
}

/**
 * Untermenü am Desktop (E-028): Karte unter dem Eintrag, das Leitungspaar läuft vom Eintrag nach unten, die Wege zweigen
 * ab und das Paar fällt in den Abschluss (wie das Menü am Handy in „Jetzt bewerben“). Sichtbar per CSS (:hover) oder
 * über data-offen am Eintrag (Tastatur, useUntermenue).
 */
function Untermenue({ unter, pathname }: { unter: KopfUntermenue; pathname: string | null }) {
  return (
    <div id={`kopf-unter-${unter.id}`} className={styles.unter} data-unter="" data-motion="menue-oeffnen">
      <div className={styles.unterKarte}>
        <div className={styles.unterLeitung}>
          <p className={`${styles.unterEtikett} text-etikett`}>{unter.etikett}</p>
          <ul className={styles.unterListe}>
            {unter.wege.map((weg) => (
              <li key={weg.href}>
                <Link
                  href={weg.href}
                  aria-current={subNavCurrent(weg.href, pathname)}
                  className={`${styles.unterWeg} font-display`}
                  data-motion="unterstrich"
                >
                  <span className={styles.unterName}>{weg.label}</span>
                  {weg.mass ? (
                    <>
                      {' '}
                      <span className={`${styles.unterMass} text-etikett`}>{weg.mass}</span>
                    </>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href={unter.alle.href} className={`${styles.unterAlle} font-display`} data-motion="druck">
          <span className={styles.unterAlleText}>{unter.alle.label}</span>
          <Icon name="arrow-right" size="sm" />
        </Link>
      </div>
    </div>
  );
}

function WhatsApp({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.whatsapp} data-motion="unterstrich">
      <Icon name="message-circle" size="lg" className={styles.ikon} />
      <span className={styles.waText}>WhatsApp</span>
      <span className="sr-only"> (öffnet in neuem Tab)</span>
    </a>
  );
}

/**
 * Untermenüs am Desktop (E-028). Mit feinem Zeiger öffnen sie per CSS (:hover). Für die Tastatur hält der Kopf, welches
 * Untermenü offen ist: Fokus per Tastatur auf dem Eintrag oder im Untermenü öffnet es, Fokus anderswo schließt es.
 * Bewusst nicht :focus-within: Chrome prüft beim Tab-Wechsel erst nach dem Blur des Eintrags, ob das Ziel im Untermenü
 * fokussierbar ist; ein reines CSS-Untermenü wäre da schon zu, und der Fokus fiele auf body.
 * „Ruhe“ (Escape, Klick) schließt auch das Hover-Untermenü, bis der Zeiger die Navigation verlässt oder der Fokus
 * weiterzieht (WCAG 1.4.13: schließbar, ohne Zeiger oder Fokus zu bewegen). Escape gilt im ganzen Dokument: Wer nur
 * mit der Maus überfährt, hat den Fokus nicht in der Navigation (Fokus auf body oder im Inhalt).
 */
function useUntermenue() {
  /** href des Eintrags, dessen Untermenü per Tastatur offen ist. */
  const [offen, setOffen] = useState<string | null>(null);
  const [ruhe, setRuhe] = useState(false);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOffen(null);
      setRuhe(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const navProps = {
    'data-ruhe': ruhe || undefined,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      setRuhe(false);
      const ziel = event.target as HTMLElement;
      const gruppe = ziel.closest<HTMLElement>('[data-gruppe]');
      setOffen(gruppe && ziel.matches(':focus-visible') ? (gruppe.dataset.gruppe ?? null) : null);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOffen(null);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== 'Escape') return;
      // Aus dem Untermenü zurück auf den Eintrag (wie bei einer Aufklappliste); danach zu und Ruhe, denn der
      // Fokuswechsel öffnet es sonst gleich wieder. Zu und Ruhe setzt auch der Dokument-Listener oben.
      const unter = (event.target as HTMLElement).closest('[data-unter]');
      unter?.parentElement?.querySelector<HTMLAnchorElement>(':scope > a')?.focus();
      setOffen(null);
      setRuhe(true);
    },
    // Ruhe endet, sobald der Zeiger die Navigation verlässt oder (nach Escape oder Enter per Tastatur) neu betritt
    onPointerLeave: () => setRuhe(false),
    onPointerEnter: () => setRuhe(false),
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (!(event.target as HTMLElement).closest('a')) return;
      setOffen(null);
      setRuhe(true);
    },
  };

  return { offen, navProps };
}

/**
 * Seitenkopf (R4-SHELL-01) im Design des Einstiegs: Papier, Logo links, Navigation in Bricolage Navy,
 * rechts Telefon mit Hörer, WhatsApp und „Bewerben“ in Navy-Kontur (Rot bleibt der einen Hauptaktion
 * der Seite). Mobil Logo, Hörer und Menüknopf; „Jetzt bewerben“ in Rot trägt dort die StickyApplyBar,
 * sobald keine andere rote Hauptaktion im Bild steht. Im Bewerbungsflow nur Logo, Telefon und Ausgang.
 */
export function HeaderBar({
  logo,
  menuLogo,
  phone,
  whatsappHref,
  whatsappFlowHref,
  offeneStellen,
  marke,
  vertraulich,
  untermenues = [],
}: HeaderBarProps) {
  const pathname = usePathname();
  const focusMode = isFocusMode(pathname);
  const { sentinelRef, scrolled } = useScrolled();
  const markeSichtbar = marke && zeigeMarkeImKopf(pathname);
  const { offen, navProps } = useUntermenue();
  const unterZu = (href: string) => untermenues.find((unter) => unter.href === href);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className={styles.waechter} />
      <header data-scrolled={scrolled || undefined} data-fokus={focusMode || undefined} className={`${styles.kopf} print-hidden`}>
        <div className={styles.zeile}>
          <div className={styles.links}>
            <Link
              href="/"
              aria-label="Bad und Energie GmbH Lahn Dill, zur Startseite"
              className={styles.logo}
              data-motion="unterstrich"
            >
              {logo}
            </Link>
            {markeSichtbar ? (
              <p className={styles.marke}>
                <span className={`${styles.markeZahl} text-etikett`} aria-hidden="true">
                  {marke.zahl}
                </span>
                <span className={`${styles.markeSpanne} text-etikett`} aria-hidden="true">
                  {marke.spanne}
                </span>
                <span className="sr-only">{marke.lang}</span>
              </p>
            ) : null}
          </div>

          {focusMode ? (
            <div className={styles.direkt}>
              <Telefon phone={phone} />
              <WhatsApp href={whatsappFlowHref ?? whatsappHref} />
              <Link href="/" className={`${styles.ausgang} font-display`} data-motion="unterstrich">
                {focusModeExitLabel(pathname)}
              </Link>
            </div>
          ) : (
            <>
              <nav aria-label="Hauptnavigation" className={styles.nav} {...navProps}>
                <ul className={styles.navListe}>
                  {NAV_ITEMS.map((item) => {
                    const zaehler = item.href === '/jobs' ? offeneStellen : null;
                    const unter = unterZu(item.href);
                    return (
                      <li
                        key={item.href}
                        className={unter ? styles.gruppe : undefined}
                        data-gruppe={unter ? item.href : undefined}
                        data-offen={(unter && offen === item.href) || undefined}
                      >
                        <Link
                          href={item.href}
                          aria-current={navCurrent(item, pathname)}
                          className={`${styles.navLink} font-display`}
                          data-motion="unterstrich"
                        >
                          {item.label}
                          {zaehler ? (
                            <>
                              <span className={`${styles.zaehler} font-mass`} aria-hidden="true">
                                {zaehler.anzahl}
                              </span>
                              <span className="sr-only"> ({zaehler.text})</span>
                            </>
                          ) : null}
                          {unter ? (
                            <Icon name="chevron-down" size="sm" className={styles.winkel} data-motion="menue-oeffnen" />
                          ) : null}
                        </Link>
                        {unter ? <Untermenue unter={unter} pathname={pathname} /> : null}
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className={styles.direkt}>
                <Telefon phone={phone} />
                <WhatsApp href={whatsappHref} />
                <Link href={APPLY_PATH} className={`${styles.bewerben} font-display`} data-motion="flaeche">
                  Bewerben
                </Link>
                <MobileNav
                  phone={phone}
                  whatsappHref={whatsappHref}
                  logo={menuLogo ?? logo}
                  offeneStellen={offeneStellen}
                  marke={marke}
                  vertraulich={vertraulich}
                  untermenues={untermenues}
                  className={styles.menueBereich}
                />
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
