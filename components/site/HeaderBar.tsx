'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icons';
import styles from './kopf/kopf.module.css';
import { zeigeMarkeImKopf, type KopfMarke, type KopfVertraulich, type OffeneStellen } from './kopf/typen';
import { MobileNav } from './MobileNav';
import { APPLY_PATH, NAV_ITEMS, focusModeExitLabel, isCurrentNavItem, isFocusMode } from './nav';

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
}: HeaderBarProps) {
  const pathname = usePathname();
  const focusMode = isFocusMode(pathname);
  const { sentinelRef, scrolled } = useScrolled();
  const markeSichtbar = marke && zeigeMarkeImKopf(pathname);

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
              <nav aria-label="Hauptnavigation" className={styles.nav}>
                <ul className={styles.navListe}>
                  {NAV_ITEMS.map((item) => {
                    const current = isCurrentNavItem(item, pathname);
                    const zaehler = item.href === '/jobs' ? offeneStellen : null;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={current ? 'page' : undefined}
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
                        </Link>
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
