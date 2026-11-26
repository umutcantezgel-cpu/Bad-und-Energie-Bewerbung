'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { OHNE_UEBERLAGERUNG } from '@/lib/motion/prefers';
import { WhatsAppKnopf } from './knopf/WhatsAppKnopf';
import { HELFER_BILDER, helferSichtbar } from './seiten';

interface HelferInselProps {
  /** Fertiger WhatsApp-Link vom Server (buildWhatsAppUrl), damit die Insel keine Kontaktdaten importiert. */
  whatsappHref: string;
}

/**
 * Die Figur gibt es nur am PC (Inhaber, 26.11.2026: „nur auf dem PC, auf dem Handy schonen und weglassen“): breites
 * Fenster und eine Maus oder ein Touchpad als Zeiger. Am Handy und am Tablet bleibt nur der WhatsApp-Knopf
 * (knopf/WhatsAppKnopf.tsx), und das Spiel wird dort gar nicht geladen.
 */
export const MIT_FIGUR = '(min-width: 64em) and (hover: hover) and (pointer: fine)';

/** Höhe der Bewerbenleiste am unteren Rand (unter 64em), solange sie zu sehen ist: Sie ist der Boden für Helfer und Ball. */
function leistenHoehe(): number {
  const leiste = document.querySelector<HTMLElement>('[data-sticky-apply-bar]');
  if (!leiste || leiste.hasAttribute('data-hidden')) return 0;
  const lage = leiste.getBoundingClientRect();
  return lage.height > 0 && lage.bottom >= window.innerHeight - 1 ? lage.height : 0;
}

/**
 * Insel für den Helfer (Inhaberwunsch vom 25.11.2026): eine Figur, die man greifen, werfen, pieksen und wegschicken
 * kann, und der WhatsApp-Link als Ball dazu. Die Insel selbst ist winzig. Das Spiel lädt sie erst im Leerlauf nach
 * dem ersten Bild nach, und nur dort, wo es hingehört (seiten.ts).
 *
 * Ohne Bewegung kein Spielzeug: Bei „Bewegung reduzieren“ und in erzwungenen Farben erscheint nichts
 * (wie Klick-Wärme und Wärmefront). WhatsApp bleibt in Kopf, Leiste und Fuß erreichbar.
 */
export function HelferInsel({ whatsappHref }: HelferInselProps) {
  const pfad = usePathname();
  const sichtbar = helferSichtbar(pfad);
  const halter = useRef<HTMLDivElement>(null);
  const lauf = useRef<{ zerstoere: () => void; vermesse: () => void } | null>(null);
  // null: noch nicht gemessen (Server und erstes Bild), dann PC (Figur) oder Handy (nur der Knopf)
  const [figur, setFigur] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sichtbar || typeof window.matchMedia !== 'function') return;
    const abfrage = window.matchMedia(MIT_FIGUR);
    const messen = () => setFigur(abfrage.matches);
    messen();
    // Wird das Fenster schmal (oder breit), baut sich der Helfer passend neu auf.
    abfrage.addEventListener('change', messen);
    return () => abfrage.removeEventListener('change', messen);
  }, [sichtbar]);

  useEffect(() => {
    const el = halter.current;
    // Das Spiel nur am PC: Am Handy lädt es nichts nach, dort reicht der schlanke Knopf.
    if (!sichtbar || !el || figur !== true) return;
    if (typeof window.matchMedia !== 'function' || window.matchMedia(OHNE_UEBERLAGERUNG).matches) return;

    let abgebaut = false;
    const starten = () => {
      import('./spiel/start')
        .then(({ starte }) => {
          if (abgebaut) return;
          lauf.current = starte(el, { quelle: HELFER_BILDER, whatsapp: whatsappHref, ruhig: false, klasse: 'print-hidden', bodenAbstand: leistenHoehe, figur: true });
        })
        .catch(() => undefined);
    };
    const imLeerlauf = typeof window.requestIdleCallback === 'function';
    const warte = imLeerlauf ? window.requestIdleCallback(starten, { timeout: 4000 }) : window.setTimeout(starten, 1500);

    return () => {
      abgebaut = true;
      if (imLeerlauf) window.cancelIdleCallback(warte);
      else window.clearTimeout(warte);
      lauf.current?.zerstoere();
      lauf.current = null;
    };
  }, [sichtbar, whatsappHref, figur]);

  // Der Boden: Jede Seite hat ihre eigene Bewerbenleiste (oder keine), und sie blendet sich ein und aus.
  // Der Helfer bleibt beim Seitenwechsel bestehen und misst nur neu.
  useEffect(() => {
    if (!sichtbar) return;
    lauf.current?.vermesse();
    const leiste = document.querySelector('[data-sticky-apply-bar]');
    if (!leiste) return;
    const beobachter = new MutationObserver(() => lauf.current?.vermesse());
    beobachter.observe(leiste, { attributes: true, attributeFilter: ['data-hidden'] });
    return () => beobachter.disconnect();
  }, [pfad, sichtbar]);

  // Leere Hülle, auf dem Server und im Browser gleich. Figur und Zubehör entstehen erst im Browser in ihrer Schattenwurzel.
  // Der WhatsApp-Knopf für Handy und Tablet kommt schon vom Server; am PC blendet ihn das CSS aus.
  return (
    <>
      {sichtbar && <WhatsAppKnopf href={whatsappHref} pfad={pfad} />}
      <div ref={halter} data-helfer="" className="print-hidden" />
    </>
  );
}
